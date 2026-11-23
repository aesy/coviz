use std::collections::BTreeMap;
use std::collections::btree_map::Entry;
use std::fmt;
use std::fmt::Formatter;

use json_comments::CommentSettings;
use serde::Deserialize;
use serde::de::{self, Deserializer, IgnoredAny, SeqAccess, Visitor};

use crate::error::Error;
use crate::model::{Counts, FileCoverage, Report};

#[derive(Deserialize)]
struct Export {
    #[serde(default)]
    data: Vec<ExportData>,
}

#[derive(Deserialize)]
struct ExportData {
    #[serde(default)]
    files: Vec<FileEntry>,
}

#[derive(Deserialize)]
struct FileEntry {
    filename: String,
    #[serde(default)]
    segments: Vec<Segment>,
    summary: Option<Summary>,
}

/// `[line, column, count, has_count, is_region_entry, is_gap_region]`; only
/// line, count and `has_count` drive source-view coloring. Export 2.0.0 omits
/// the last field, and older llvm-cov writes the flags as 0/1.
struct Segment {
    line: u32,
    count: u64,
    has_count: bool,
}

impl<'de> Deserialize<'de> for Segment {
    fn deserialize<D: Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        deserializer.deserialize_seq(SegmentVisitor)
    }
}

struct SegmentVisitor;

impl<'de> Visitor<'de> for SegmentVisitor {
    type Value = Segment;

    fn expecting(&self, formatter: &mut Formatter) -> fmt::Result {
        formatter.write_str("a coverage segment array")
    }

    fn visit_seq<A: SeqAccess<'de>>(self, mut seq: A) -> Result<Segment, A::Error> {
        let line = seq
            .next_element()?
            .ok_or_else(|| de::Error::invalid_length(0, &self))?;
        let _column: u32 = seq
            .next_element()?
            .ok_or_else(|| de::Error::invalid_length(1, &self))?;
        let count = seq
            .next_element()?
            .ok_or_else(|| de::Error::invalid_length(2, &self))?;
        let has_count: Flag = seq
            .next_element()?
            .ok_or_else(|| de::Error::invalid_length(3, &self))?;

        while seq.next_element::<IgnoredAny>()?.is_some() {}

        Ok(Segment {
            line,
            count,
            has_count: has_count.is_set(),
        })
    }
}

#[derive(Deserialize)]
#[serde(untagged)]
enum Flag {
    Bool(bool),
    Int(u64),
}

impl Flag {
    const fn is_set(&self) -> bool {
        match self {
            Self::Bool(value) => *value,
            Self::Int(value) => *value != 0,
        }
    }
}

#[derive(Deserialize)]
struct Summary {
    #[serde(default)]
    lines: Metric,
    #[serde(default)]
    functions: Metric,
    #[serde(default)]
    branches: Metric,
    #[serde(default)]
    mcdc: Metric,
}

#[derive(Default, Deserialize)]
struct Metric {
    #[serde(default)]
    count: u64,
    #[serde(default)]
    covered: u64,
}

pub fn parse(content: &str) -> Result<Report, Error> {
    // llvm-cov never writes comments, so only hand-edited files take the slower
    // reader path. Comments become whitespace, keeping error positions intact.
    let export: Export = if content.contains("//") || content.contains("/*") {
        serde_json::from_reader(CommentSettings::c_style().strip_comments(content.as_bytes()))?
    } else {
        serde_json::from_str(content)?
    };
    let mut files: Vec<(String, FileCoverage)> = Vec::new();
    let mut index: BTreeMap<String, usize> = BTreeMap::new();

    for data in export.data {
        for file in data.files {
            let line_hits = line_hits(&file.segments);
            let counts = file.summary.as_ref().map_or_else(
                // Without a summary, the segment gutter counts are the only
                // line data.
                || Counts {
                    lines_found: line_hits.len() as u64,
                    lines_hit: line_hits.values().filter(|hits| **hits > 0).count() as u64,
                    ..Counts::default()
                },
                |summary| Counts {
                    lines_found: summary.lines.count,
                    lines_hit: summary.lines.covered,
                    functions_found: summary.functions.count,
                    functions_hit: summary.functions.covered,
                    branches_found: summary.branches.count,
                    branches_hit: summary.branches.covered,
                    mcdc_found: summary.mcdc.count,
                    mcdc_hit: summary.mcdc.covered,
                },
            );

            match index.entry(file.filename.clone()) {
                Entry::Occupied(slot) => merge(&mut files[*slot.get()].1, counts, line_hits),
                Entry::Vacant(slot) => {
                    slot.insert(files.len());

                    files.push((
                        file.filename.clone(),
                        FileCoverage {
                            path: file.filename,
                            line_hits,
                            counts,
                        },
                    ));
                },
            }
        }
    }

    Ok(Report {
        files: files.into_iter().map(|(_, file)| file).collect(),
    })
}

/// Gutter execution count per line: the largest count of any counted segment
/// that begins on that line. Drives source-view coloring only; the reported
/// totals come from the authoritative per-file summary.
fn line_hits(segments: &[Segment]) -> BTreeMap<u32, u64> {
    let mut hits: BTreeMap<u32, u64> = BTreeMap::new();

    for segment in segments {
        if segment.has_count {
            let entry = hits.entry(segment.line).or_insert(0);

            *entry = (*entry).max(segment.count);
        }
    }

    hits
}

fn merge(file: &mut FileCoverage, counts: Counts, line_hits: BTreeMap<u32, u64>) {
    file.counts.add(&counts);

    for (line, count) in line_hits {
        let entry = file.line_hits.entry(line).or_insert(0);

        *entry = (*entry).max(count);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE: &str = r#"{
      "type": "llvm.coverage.json.export",
      "version": "3.1.0",
      "data": [{
        "files": [{
          "filename": "/repo/src/lib.rs",
          "segments": [
            [1, 1, 5, true, true, false],
            [2, 8, 5, true, true, false],
            [3, 9, 0, true, true, false],
            [4, 1, 0, false, false, false]
          ],
          "summary": {
            "lines": {"count": 10, "covered": 8},
            "functions": {"count": 3, "covered": 2},
            "branches": {"count": 4, "covered": 3},
            "mcdc": {"count": 2, "covered": 1}
          }
        }]
      }]
    }"#;

    #[test]
    fn parses_summary_counts_for_all_dimensions() {
        let report = parse(SAMPLE).unwrap();

        assert_eq!(report.files.len(), 1);

        let c = report.files[0].counts;

        assert_eq!((c.lines_found, c.lines_hit), (10, 8));

        assert_eq!((c.functions_found, c.functions_hit), (3, 2));

        assert_eq!((c.branches_found, c.branches_hit), (4, 3));

        assert_eq!((c.mcdc_found, c.mcdc_hit), (2, 1));
    }

    #[test]
    fn derives_line_hits_from_counted_segments() {
        let report = parse(SAMPLE).unwrap();
        let hits = &report.files[0].line_hits;

        assert_eq!(hits.get(&1), Some(&5));

        assert_eq!(hits.get(&3), Some(&0));

        assert_eq!(hits.get(&4), None); // segment without a count is ignored
    }

    #[test]
    fn merges_files_repeated_across_data_objects() {
        let doc = r#"{"data":[
          {"files":[{"filename":"a.rs","segments":[[1,1,2,true,true,false]],
            "summary":{"lines":{"count":2,"covered":1},"functions":{"count":1,"covered":1}}}]},
          {"files":[{"filename":"a.rs","segments":[[1,1,5,true,true,false]],
            "summary":{"lines":{"count":2,"covered":2},"functions":{"count":1,"covered":1}}}]}
        ]}"#;
        let report = parse(doc).unwrap();

        assert_eq!(report.files.len(), 1);

        let c = report.files[0].counts;

        assert_eq!((c.lines_found, c.lines_hit), (4, 3));

        assert_eq!(report.files[0].line_hits.get(&1), Some(&5));
    }

    #[test]
    fn reads_export_2_0_0_segments_with_integer_flags() {
        let doc = r#"{"version":"2.0.0","data":[{"files":[{"filename":"a.c",
          "segments":[[1,1,4,1,1],[2,1,0,true,true],[3,1,9,0,0]],
          "summary":{"lines":{"count":2,"covered":1},"functions":{"count":1,"covered":1}}}]}]}"#;
        let hits = &parse(doc).unwrap().files[0].line_hits;

        assert_eq!(hits.get(&1), Some(&4));

        assert_eq!(hits.get(&2), Some(&0));

        assert_eq!(hits.get(&3), None);
    }

    #[test]
    fn missing_summary_metrics_default_to_zero() {
        let doc = r#"{"data":[{"files":[{"filename":"a.rs","segments":[],
          "summary":{"lines":{"count":4,"covered":3}}}]}]}"#;
        let c = parse(doc).unwrap().files[0].counts;

        assert_eq!((c.lines_found, c.lines_hit), (4, 3));

        assert_eq!((c.functions_found, c.functions_hit), (0, 0));
    }

    #[test]
    fn missing_summary_counts_lines_from_segments() {
        let doc = r#"{"data":[{"files":[{"filename":"a.rs",
          "segments":[[1,1,2,true,true,false],[2,1,0,true,true,false],[3,1,0,false,false,false]]}]}]}"#;
        let c = parse(doc).unwrap().files[0].counts;

        assert_eq!((c.lines_found, c.lines_hit), (2, 1));
    }

    #[test]
    fn ignores_comments_but_not_slashes_in_strings() {
        let doc = r#"{"data":[{"files":[{
          "filename": "//server/share/a.rs", // UNC path
          "segments": [[1, 1, 2, true, true, false]], /* gutter */
          "summary": {"lines": {"count": 1, "covered": 1}}
        }]}]}"#;
        let file = &parse(doc).unwrap().files[0];

        assert_eq!(file.path, "//server/share/a.rs");

        assert_eq!(file.counts.lines_hit, 1);
    }

    #[test]
    fn errors_in_commented_json_keep_their_position() {
        let doc = "{\n// note\n\"data\": [,]}";
        let Err(Error::Json { source }) = parse(doc) else {
            panic!("expected a JSON error");
        };

        assert_eq!(source.line(), 3);
    }

    #[test]
    fn invalid_json_is_an_error() {
        assert!(matches!(parse("{not json"), Err(Error::Json { .. })));
    }
}
