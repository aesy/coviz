use std::collections::{BTreeMap, HashMap};

use quick_xml::events::{BytesStart, Event};
use quick_xml::reader::Reader;

use crate::error::Error;
use crate::input::xml::{attr, attr_u64};
use crate::model::{Counts, FileCoverage, Report};

#[derive(Default)]
struct SourceFile {
    path: String,
    line_hits: BTreeMap<u32, u64>,
    branches_found: u64,
    branches_hit: u64,
    methods: Option<(u64, u64)>,
}

/// Functions come from a METHOD counter. JaCoCo emits one on the sourcefile,
/// but older reports only carry it on each class; this collects both so the
/// sourcefile's own counter is preferred with a per-class fallback.
struct Parser {
    files: Vec<SourceFile>,
    index: HashMap<String, usize>,
    stack: Vec<String>,
    package: String,
    class_methods: HashMap<String, (u64, u64)>,
    class_sourcefile: Option<String>,
    current: Option<usize>,
}

pub fn parse(content: &str) -> Result<Report, Error> {
    let mut reader = Reader::from_str(content);

    reader.config_mut().check_end_names = true;

    let mut parser = Parser {
        files: Vec::new(),
        index: HashMap::new(),
        stack: Vec::new(),
        package: String::new(),
        class_methods: HashMap::new(),
        class_sourcefile: None,
        current: None,
    };

    loop {
        match reader
            .read_event()
            .map_err(|source| Error::Xml { source })?
        {
            Event::Eof => break,
            Event::Start(e) => {
                parser.open(e.name().as_ref(), &e);

                parser.stack.push(e.name().as_ref().to_owned());
            }
            Event::Empty(e) => parser.open(e.name().as_ref(), &e),
            Event::End(e) => {
                parser.stack.pop();

                if e.name().as_ref() == "sourcefile" {
                    parser.close_sourcefile();
                }
            }
            _ => {}
        }
    }

    Ok(Report {
        files: parser.files.into_iter().map(SourceFile::finish).collect(),
    })
}

impl Parser {
    fn open(&mut self, name: &str, e: &BytesStart) {
        match name {
            "package" => {
                self.package = attr(e, "name").unwrap_or_default();

                self.class_methods.clear();
            }
            "class" => self.class_sourcefile = attr(e, "sourcefilename"),
            "sourcefile" => {
                let name = attr(e, "name").unwrap_or_default();
                let path = if self.package.is_empty() {
                    name
                } else {
                    format!("{}/{}", self.package, name)
                };
                let slot = *self.index.entry(path.clone()).or_insert_with(|| {
                    self.files.push(SourceFile {
                        path: path.clone(),
                        ..SourceFile::default()
                    });

                    self.files.len() - 1
                });

                self.current = Some(slot);
            }
            "line" => self.on_line(e),
            "counter" => self.on_counter(e),
            _ => {}
        }
    }

    fn on_line(&mut self, e: &BytesStart) {
        let Some(slot) = self.current else { return };
        let Some(nr) = attr_u64(e, "nr") else { return };
        let covered_instr = attr_u64(e, "ci").unwrap_or(0);
        let missed_branches = attr_u64(e, "mb").unwrap_or(0);
        let covered_branches = attr_u64(e, "cb").unwrap_or(0);
        let file = &mut self.files[slot];

        file.line_hits
            .insert(nr as u32, u64::from(covered_instr > 0));

        file.branches_found += missed_branches + covered_branches;

        file.branches_hit += covered_branches;
    }

    fn on_counter(&mut self, e: &BytesStart) {
        if attr(e, "type").as_deref() != Some("METHOD") {
            return;
        }

        let missed = attr_u64(e, "missed").unwrap_or(0);
        let covered = attr_u64(e, "covered").unwrap_or(0);

        match self.stack.last().map(String::as_str) {
            Some("sourcefile") => {
                if let Some(slot) = self.current {
                    self.files[slot].methods = Some((missed + covered, covered));
                }
            }
            Some("class") => {
                if let Some(source) = &self.class_sourcefile {
                    let entry = self.class_methods.entry(source.clone()).or_insert((0, 0));

                    entry.0 += missed + covered;

                    entry.1 += covered;
                }
            }
            _ => {}
        }
    }

    fn close_sourcefile(&mut self) {
        if let Some(slot) = self.current.take()
            && self.files[slot].methods.is_none()
        {
            let name = self.files[slot]
                .path
                .rsplit('/')
                .next()
                .unwrap_or_default()
                .to_string();

            self.files[slot].methods = self.class_methods.get(&name).copied();
        }
    }
}

impl SourceFile {
    fn finish(self) -> FileCoverage {
        let lines_hit = self.line_hits.values().filter(|hits| **hits > 0).count() as u64;
        let (functions_found, functions_hit) = self.methods.unwrap_or((0, 0));

        FileCoverage {
            counts: Counts {
                lines_found: self.line_hits.len() as u64,
                lines_hit,
                functions_found,
                functions_hit,
                branches_found: self.branches_found,
                branches_hit: self.branches_hit,
                ..Counts::default()
            },
            path: self.path,
            line_hits: self.line_hits,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE: &str = r#"<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE report PUBLIC "-//JACOCO//DTD Report 1.1//EN" "report.dtd">
<report name="demo">
  <package name="com/example">
    <class name="com/example/Foo" sourcefilename="Foo.java">
      <method name="a" desc="()V" line="3"><counter type="METHOD" missed="0" covered="1"/></method>
      <method name="b" desc="()V" line="8"><counter type="METHOD" missed="1" covered="0"/></method>
      <counter type="METHOD" missed="1" covered="1"/>
    </class>
    <sourcefile name="Foo.java">
      <line nr="3" mi="0" ci="4" mb="0" cb="0"/>
      <line nr="4" mi="0" ci="2" mb="1" cb="1"/>
      <line nr="8" mi="3" ci="0" mb="0" cb="0"/>
      <counter type="LINE" missed="1" covered="2"/>
      <counter type="BRANCH" missed="1" covered="1"/>
      <counter type="METHOD" missed="1" covered="1"/>
    </sourcefile>
  </package>
</report>"#;

    #[test]
    fn maps_package_and_sourcefile_to_a_path() {
        let report = parse(SAMPLE).unwrap();

        assert_eq!(report.files.len(), 1);

        assert_eq!(report.files[0].path, "com/example/Foo.java");
    }

    #[test]
    fn derives_line_and_branch_counts_from_line_elements() {
        let report = parse(SAMPLE).unwrap();
        let c = report.files[0].counts;

        assert_eq!((c.lines_found, c.lines_hit), (3, 2));

        assert_eq!((c.branches_found, c.branches_hit), (2, 1));

        let hits = &report.files[0].line_hits;

        assert_eq!(
            (hits.get(&3), hits.get(&4), hits.get(&8)),
            (Some(&1), Some(&1), Some(&0))
        );
    }

    #[test]
    fn uses_sourcefile_method_counter_for_functions() {
        let report = parse(SAMPLE).unwrap();
        let c = report.files[0].counts;

        assert_eq!((c.functions_found, c.functions_hit), (2, 1));
    }

    #[test]
    fn falls_back_to_class_method_counters_when_sourcefile_has_none() {
        let doc = r#"<report name="d"><package name="p">
          <class name="p/Bar" sourcefilename="Bar.java">
            <counter type="METHOD" missed="2" covered="3"/>
          </class>
          <sourcefile name="Bar.java">
            <line nr="1" mi="0" ci="1" mb="0" cb="0"/>
          </sourcefile>
        </package></report>"#;
        let report = parse(doc).unwrap();
        let c = report.files[0].counts;

        assert_eq!((c.functions_found, c.functions_hit), (5, 3));
    }

    #[test]
    fn malformed_xml_is_an_error() {
        assert!(matches!(
            parse("<report></package>"),
            Err(Error::Xml { .. })
        ));
    }
}
