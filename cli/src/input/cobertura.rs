use std::collections::{BTreeMap, HashMap};

use quick_xml::events::{BytesStart, Event};
use quick_xml::reader::Reader;

use crate::error::Error;
use crate::input::xml::attr;
use crate::model::{Counts, FileCoverage, Report};

#[derive(Default)]
struct FileAcc {
    path: String,
    line_hits: BTreeMap<u32, u64>,
    branches_found: u64,
    branches_hit: u64,
    functions_found: u64,
    functions_hit: u64,
}

impl FileAcc {
    fn finish(self) -> FileCoverage {
        let lines_hit = self.line_hits.values().filter(|hits| **hits > 0).count() as u64;

        FileCoverage {
            counts: Counts {
                lines_found: self.line_hits.len() as u64,
                lines_hit,
                functions_found: self.functions_found,
                functions_hit: self.functions_hit,
                branches_found: self.branches_found,
                branches_hit: self.branches_hit,
                ..Counts::default()
            },
            path: self.path,
            line_hits: self.line_hits,
        }
    }
}

pub fn parse(content: &str) -> Result<Report, Error> {
    let mut reader = Reader::from_str(content);

    reader.config_mut().check_end_names = true;

    let mut files: Vec<FileAcc> = Vec::new();
    let mut index: HashMap<String, usize> = HashMap::new();
    let mut current: Option<usize> = None;
    let mut method_depth = 0usize;

    loop {
        match reader
            .read_event()
            .map_err(|source| Error::Xml { source })?
        {
            Event::Eof => break,
            Event::Start(e) => {
                on_element(
                    e.name().as_ref(),
                    &e,
                    &mut files,
                    &mut index,
                    &mut current,
                    method_depth,
                );

                if e.name().as_ref() == "method" {
                    method_depth += 1;
                }
            }
            Event::Empty(e) => {
                on_element(
                    e.name().as_ref(),
                    &e,
                    &mut files,
                    &mut index,
                    &mut current,
                    method_depth,
                );
            }
            Event::End(e) if e.name().as_ref() == "method" => {
                method_depth = method_depth.saturating_sub(1);
            }
            _ => {}
        }
    }

    Ok(Report {
        files: files.into_iter().map(FileAcc::finish).collect(),
    })
}

fn on_element(
    name: &str,
    e: &BytesStart,
    files: &mut Vec<FileAcc>,
    index: &mut HashMap<String, usize>,
    current: &mut Option<usize>,
    method_depth: usize,
) {
    match name {
        "class" => {
            let filename = attr(e, "filename").unwrap_or_default();
            let slot = *index.entry(filename.clone()).or_insert_with(|| {
                files.push(FileAcc {
                    path: filename.clone(),
                    ..FileAcc::default()
                });

                files.len() - 1
            });

            *current = Some(slot);
        }
        "method" => {
            if let Some(slot) = *current {
                files[slot].functions_found += 1;

                let rate = attr(e, "line-rate")
                    .and_then(|v| v.parse::<f64>().ok())
                    .unwrap_or(0.0);

                if rate > 0.0 {
                    files[slot].functions_hit += 1;
                }
            }
        }
        // Lines are also listed inside each method; only the class-level list counts.
        "line" if method_depth == 0 => {
            if let Some(slot) = *current {
                let acc = &mut files[slot];
                let hits = attr(e, "hits")
                    .and_then(|v| v.parse::<u64>().ok())
                    .unwrap_or(0);

                if let Some(number) = attr(e, "number").and_then(|v| v.parse::<u32>().ok()) {
                    let entry = acc.line_hits.entry(number).or_insert(0);

                    *entry = entry.saturating_add(hits);
                }

                if attr(e, "branch").as_deref() == Some("true")
                    && let Some((covered, total)) =
                        parse_condition(attr(e, "condition-coverage").as_deref())
                {
                    acc.branches_found += total;

                    acc.branches_hit += covered;
                }
            }
        }
        _ => {}
    }
}

/// Parse the count out of a `condition-coverage="50% (1/2)"` attribute.
fn parse_condition(value: Option<&str>) -> Option<(u64, u64)> {
    let value = value?;
    let inner = value.split_once('(')?.1;
    let inner = inner.split_once(')')?.0;
    let (covered, total) = inner.split_once('/')?;

    Some((covered.trim().parse().ok()?, total.trim().parse().ok()?))
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE: &str = r#"<?xml version="1.0"?>
<!DOCTYPE coverage SYSTEM "coverage-04.dtd">
<coverage line-rate="0.6" branch-rate="0.5" version="1.9">
  <sources><source>/repo</source></sources>
  <packages>
    <package name="pkg" line-rate="0.6" branch-rate="0.5" complexity="0">
      <classes>
        <class name="Foo" filename="pkg/foo.py" line-rate="0.6" branch-rate="0.5" complexity="0">
          <methods>
            <method name="a" signature="()" line-rate="1.0" branch-rate="1.0" complexity="0">
              <lines><line number="2" hits="3"/></lines>
            </method>
            <method name="b" signature="()" line-rate="0.0" branch-rate="0.0" complexity="0">
              <lines><line number="5" hits="0"/></lines>
            </method>
          </methods>
          <lines>
            <line number="2" hits="3"/>
            <line number="3" hits="1" branch="true" condition-coverage="50% (1/2)"/>
            <line number="5" hits="0"/>
          </lines>
        </class>
      </classes>
    </package>
  </packages>
</coverage>"#;

    #[test]
    fn parses_lines_branches_and_methods() {
        let report = parse(SAMPLE).unwrap();

        assert_eq!(report.files.len(), 1);

        assert_eq!(report.files[0].path, "pkg/foo.py");

        let c = report.files[0].counts;

        assert_eq!((c.lines_found, c.lines_hit), (3, 2));

        assert_eq!((c.branches_found, c.branches_hit), (2, 1));

        assert_eq!((c.functions_found, c.functions_hit), (2, 1));
    }

    #[test]
    fn does_not_double_count_lines_listed_under_methods() {
        let report = parse(SAMPLE).unwrap();

        // line 2 appears under both method a and class lines; hits must not add up to 6
        assert_eq!(report.files[0].line_hits.get(&2), Some(&3));
    }

    #[test]
    fn merges_classes_that_share_a_filename() {
        let doc = r#"<coverage line-rate="0" branch-rate="0" version="1">
          <packages><package name="p" line-rate="0" branch-rate="0" complexity="0"><classes>
            <class name="A" filename="mod.py" line-rate="0" branch-rate="0" complexity="0">
              <methods></methods><lines><line number="1" hits="4"/></lines>
            </class>
            <class name="B" filename="mod.py" line-rate="0" branch-rate="0" complexity="0">
              <methods></methods><lines><line number="9" hits="0"/></lines>
            </class>
          </classes></package></packages>
        </coverage>"#;
        let report = parse(doc).unwrap();

        assert_eq!(report.files.len(), 1);

        let c = report.files[0].counts;

        assert_eq!((c.lines_found, c.lines_hit), (2, 1));
    }

    #[test]
    fn malformed_xml_is_an_error() {
        assert!(matches!(
            parse("<coverage></packages>"),
            Err(Error::Xml { .. })
        ));
    }
}
