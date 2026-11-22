use std::collections::BTreeMap;

use serde::Deserialize;

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
    summary: Summary,
}

/// `[line, column, count, has_count, is_region_entry, is_gutter_count]`; only
/// line, count and has_count drive source-view coloring.
type Segment = (u32, u32, u64, bool, bool, bool);

#[derive(Deserialize)]
struct Summary {
    lines: Metric,
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
    let export: Export = serde_json::from_str(content)?;
    let mut files: Vec<(String, FileCoverage)> = Vec::new();
    let mut index: BTreeMap<String, usize> = BTreeMap::new();

    for data in export.data {
        for file in data.files {
            let counts = Counts {
                lines_found: file.summary.lines.count,
                lines_hit: file.summary.lines.covered,
                functions_found: file.summary.functions.count,
                functions_hit: file.summary.functions.covered,
                branches_found: file.summary.branches.count,
                branches_hit: file.summary.branches.covered,
                mcdc_found: file.summary.mcdc.count,
                mcdc_hit: file.summary.mcdc.covered,
            };
            let line_hits = line_hits(&file.segments);

            match index.get(&file.filename) {
                Some(&slot) => merge(&mut files[slot].1, counts, line_hits),
                None => {
                    index.insert(file.filename.clone(), files.len());

                    files.push((
                        file.filename.clone(),
                        FileCoverage {
                            path: file.filename,
                            line_hits,
                            counts,
                        },
                    ));
                }
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

    for &(line, _, count, has_count, ..) in segments {
        if has_count {
            let entry = hits.entry(line).or_insert(0);

            *entry = (*entry).max(count);
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
    fn invalid_json_is_an_error() {
        assert!(matches!(parse("{not json"), Err(Error::Json { .. })));
    }
}
