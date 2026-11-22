use std::collections::{BTreeMap, HashMap};

use crate::error::Error;
use crate::model::{Counts, FileCoverage, Report};

const KNOWN_RECORDS: [&str; 15] = [
    "DA", "FN", "FNDA", "FNA", "FNL", "FNF", "FNH", "LF", "LH", "BRDA", "BRF", "BRH", "MCDC",
    "MCF", "MCH",
];

#[derive(Default)]
struct FileState {
    line_hits: BTreeMap<u32, u64>,
    function_hits: HashMap<String, u64>,
    branch_taken: HashMap<(u32, String, String), Option<u64>>,
    mcdc_taken: HashMap<(u32, String, String, String), u64>,
    declared: Declared,
}

#[derive(Default)]
struct Declared {
    lines_found: u64,
    lines_hit: u64,
    functions_found: u64,
    functions_hit: u64,
    branches_found: u64,
    branches_hit: u64,
    mcdc_found: u64,
    mcdc_hit: u64,
}

impl FileState {
    fn finish(self, path: String) -> FileCoverage {
        let declared = self.declared;
        let (lines_found, lines_hit) = if self.line_hits.is_empty() {
            (declared.lines_found, declared.lines_hit)
        } else {
            (
                self.line_hits.len() as u64,
                self.line_hits.values().filter(|hits| **hits > 0).count() as u64,
            )
        };
        let (functions_found, functions_hit) = if self.function_hits.is_empty() {
            (declared.functions_found, declared.functions_hit)
        } else {
            (
                self.function_hits.len() as u64,
                self.function_hits
                    .values()
                    .filter(|hits| **hits > 0)
                    .count() as u64,
            )
        };
        let (branches_found, branches_hit) = if self.branch_taken.is_empty() {
            (declared.branches_found, declared.branches_hit)
        } else {
            (
                self.branch_taken.len() as u64,
                self.branch_taken
                    .values()
                    .filter(|taken| taken.is_some_and(|count| count > 0))
                    .count() as u64,
            )
        };
        let (mcdc_found, mcdc_hit) = if self.mcdc_taken.is_empty() {
            (declared.mcdc_found, declared.mcdc_hit)
        } else {
            (
                self.mcdc_taken.len() as u64,
                self.mcdc_taken.values().filter(|taken| **taken > 0).count() as u64,
            )
        };

        FileCoverage {
            path,
            line_hits: self.line_hits,
            counts: Counts {
                lines_found,
                lines_hit,
                functions_found,
                functions_hit,
                branches_found,
                branches_hit,
                mcdc_found,
                mcdc_hit,
            },
        }
    }
}

pub fn parse(content: &str) -> Result<Report, Error> {
    let mut files: Vec<(String, FileState)> = Vec::new();
    let mut file_index: HashMap<String, usize> = HashMap::new();
    let mut current: Option<usize> = None;

    for (index, raw_line) in content.lines().enumerate() {
        let line_number = index + 1;
        let line = raw_line.trim_matches(|c: char| c.is_whitespace() || c == '\u{feff}');

        if line.is_empty() || line.starts_with('#') {
            continue;
        }

        if line == "end_of_record" {
            current = None;
            continue;
        }

        let Some((record, value)) = line.split_once(':') else {
            return Err(invalid(line_number, line));
        };

        match record {
            "TN" | "VER" => continue,
            "SF" => {
                let path = value.trim().replace('\\', "/");
                let slot = *file_index.entry(path.clone()).or_insert_with(|| {
                    files.push((path, FileState::default()));

                    files.len() - 1
                });

                current = Some(slot);

                continue;
            }
            _ => {}
        }

        let Some(slot) = current else {
            if KNOWN_RECORDS.contains(&record) {
                return Err(Error::LcovRecordOutsideFile {
                    line_number,
                    record: line.to_string(),
                });
            }
            continue;
        };
        let state = &mut files[slot].1;

        match record {
            "DA" => {
                let mut parts = value.splitn(3, ',');
                let line_no = parse_number(parts.next(), line_number, line)?;
                let hits = parse_count(parts.next(), line_number, line)?;

                *state.line_hits.entry(line_no as u32).or_insert(0) += hits;
            }
            "FN" => {
                let (_, rest) = value
                    .split_once(',')
                    .ok_or_else(|| invalid(line_number, line))?;
                let name = match rest.split_once(',') {
                    Some((end_line, tail))
                        if !end_line.is_empty() && end_line.chars().all(|c| c.is_ascii_digit()) =>
                    {
                        tail
                    }
                    _ => rest,
                };

                state.function_hits.entry(name.to_string()).or_insert(0);
            }
            "FNDA" => {
                let (count, name) = value
                    .split_once(',')
                    .ok_or_else(|| invalid(line_number, line))?;
                let hits = parse_count(Some(count), line_number, line)?;

                *state.function_hits.entry(name.to_string()).or_insert(0) += hits;
            }
            "FNA" => {
                let mut parts = value.splitn(3, ',');
                let _index = parts.next();
                let hits = parse_count(parts.next(), line_number, line)?;
                let name = parts.next().ok_or_else(|| invalid(line_number, line))?;

                *state.function_hits.entry(name.to_string()).or_insert(0) += hits;
            }
            // The leader only carries the group's line range; names and counts
            // arrive on the FNA aliases, which is what we count.
            "FNL" => {}
            "FNF" => state.declared.functions_found = parse_number(Some(value), line_number, line)?,
            "FNH" => state.declared.functions_hit = parse_number(Some(value), line_number, line)?,
            "LF" => state.declared.lines_found = parse_number(Some(value), line_number, line)?,
            "LH" => state.declared.lines_hit = parse_number(Some(value), line_number, line)?,
            "BRF" => state.declared.branches_found = parse_number(Some(value), line_number, line)?,
            "BRH" => state.declared.branches_hit = parse_number(Some(value), line_number, line)?,
            "BRDA" => {
                // BRDA:<line>,[e|f|U]<block>,<branch>,<taken> - the branch id may
                // itself contain commas, so <taken> is peeled off as the last field.
                let (line_str, rest) = value
                    .split_once(',')
                    .ok_or_else(|| invalid(line_number, line))?;
                let line_no = parse_number(Some(line_str), line_number, line)? as u32;
                let (head, taken) = rest
                    .rsplit_once(',')
                    .ok_or_else(|| invalid(line_number, line))?;
                let (block, branch) = head
                    .split_once(',')
                    .ok_or_else(|| invalid(line_number, line))?;
                let taken = if taken.trim() == "-" {
                    None
                } else {
                    Some(parse_count(Some(taken), line_number, line)?)
                };
                let key = (line_no, block.to_string(), branch.to_string());
                let entry = state.branch_taken.entry(key).or_insert(None);

                *entry = match (*entry, taken) {
                    (Some(a), Some(b)) => Some(a + b),
                    (existing, new) => new.or(existing),
                };
            }
            "MCDC" => {
                // MCDC:<line>,[U]<groupSize>,<sense>,<taken>,<index>,<expression> -
                // the expression may contain commas, so it stays as the trailing field.
                let mut parts = value.splitn(6, ',');
                let line_no = parse_number(parts.next(), line_number, line)? as u32;
                let size = parts.next().ok_or_else(|| invalid(line_number, line))?;
                let sense = parts.next().ok_or_else(|| invalid(line_number, line))?;
                let taken = parse_count(parts.next(), line_number, line)?;
                let index = parts.next().ok_or_else(|| invalid(line_number, line))?;
                let key = (
                    line_no,
                    size.to_string(),
                    index.to_string(),
                    sense.to_string(),
                );

                *state.mcdc_taken.entry(key).or_insert(0) += taken;
            }
            "MCF" => state.declared.mcdc_found = parse_number(Some(value), line_number, line)?,
            "MCH" => state.declared.mcdc_hit = parse_number(Some(value), line_number, line)?,
            _ => {}
        }
    }

    let files = files
        .into_iter()
        .map(|(path, state)| state.finish(path))
        .collect();

    Ok(Report { files })
}

fn invalid(line_number: usize, line: &str) -> Error {
    Error::LcovInvalidRecord {
        line_number,
        record: line.to_string(),
    }
}

fn parse_number(value: Option<&str>, line_number: usize, line: &str) -> Result<u64, Error> {
    value
        .and_then(|v| v.trim().parse::<u64>().ok())
        .ok_or_else(|| invalid(line_number, line))
}

fn parse_count(value: Option<&str>, line_number: usize, line: &str) -> Result<u64, Error> {
    let value = value.map(str::trim);

    if let Some(count) = value.and_then(|v| v.parse::<u64>().ok()) {
        return Ok(count);
    }

    value
        .and_then(|v| v.parse::<f64>().ok())
        .filter(|count| count.is_finite() && *count >= 0.0)
        .map(|count| count.round() as u64)
        .ok_or_else(|| invalid(line_number, line))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_lines_functions_and_branches() {
        let report = parse(
            "TN:\n\
             SF:/repo/src/a.rs\n\
             FN:5,alpha\n\
             FN:9,beta\n\
             FNDA:3,alpha\n\
             FNDA:0,beta\n\
             DA:5,3\n\
             DA:6,0\n\
             BRDA:5,0,0,2\n\
             BRDA:5,0,1,0\n\
             BRDA:6,0,0,-\n\
             end_of_record\n",
        )
        .unwrap();

        assert_eq!(report.files.len(), 1);

        let counts = report.files[0].counts;

        assert_eq!((counts.lines_found, counts.lines_hit), (2, 1));

        assert_eq!((counts.functions_found, counts.functions_hit), (2, 1));

        assert_eq!((counts.branches_found, counts.branches_hit), (3, 1));
    }

    #[test]
    fn derived_line_counts_win_over_declared() {
        let report = parse("SF:a.rs\nDA:1,1\nDA:2,0\nLF:9\nLH:9\nend_of_record\n").unwrap();
        let counts = report.files[0].counts;

        assert_eq!((counts.lines_found, counts.lines_hit), (2, 1));
    }

    #[test]
    fn declared_counts_used_without_detail_records() {
        let report = parse("SF:a.rs\nLF:10\nLH:7\nFNF:4\nFNH:2\nend_of_record\n").unwrap();
        let counts = report.files[0].counts;

        assert_eq!((counts.lines_found, counts.lines_hit), (10, 7));

        assert_eq!((counts.functions_found, counts.functions_hit), (4, 2));
    }

    #[test]
    fn merges_duplicate_source_files() {
        let report = parse(
            "SF:a.rs\nDA:1,1\nDA:2,0\nend_of_record\n\
             SF:a.rs\nDA:2,5\nDA:3,0\nend_of_record\n",
        )
        .unwrap();

        assert_eq!(report.files.len(), 1);

        let file = &report.files[0];

        assert_eq!(file.line_hits.get(&2), Some(&5));

        assert_eq!((file.counts.lines_found, file.counts.lines_hit), (3, 2));
    }

    #[test]
    fn parses_function_names_with_end_line() {
        let report = parse("SF:a.rs\nFN:5,12,gamma\nFNDA:1,gamma\nend_of_record\n").unwrap();
        let counts = report.files[0].counts;

        assert_eq!((counts.functions_found, counts.functions_hit), (1, 1));
    }

    #[test]
    fn record_before_source_file_is_an_error() {
        let err = parse("DA:1,1\n").unwrap_err();

        assert!(matches!(
            err,
            Error::LcovRecordOutsideFile { line_number: 1, .. }
        ));
    }

    #[test]
    fn malformed_record_is_an_error() {
        let err = parse("SF:a.rs\nDA:oops\n").unwrap_err();

        assert!(matches!(
            err,
            Error::LcovInvalidRecord { line_number: 2, .. }
        ));
    }

    #[test]
    fn unknown_records_are_ignored() {
        let report = parse("SF:a.rs\nXYZ:whatever\nDA:1,1\nend_of_record\n").unwrap();

        assert_eq!(report.files[0].counts.lines_found, 1);
    }

    #[test]
    fn brda_branch_expression_may_contain_commas() {
        let report =
            parse("SF:a.rs\nDA:10,1\nBRDA:10,0,foo(a,b),1\nBRDA:10,0,bar,-\nend_of_record\n")
                .unwrap();
        let counts = report.files[0].counts;

        assert_eq!((counts.branches_found, counts.branches_hit), (2, 1));
    }

    #[test]
    fn brda_block_prefix_marks_distinct_branches() {
        let report =
            parse("SF:a.rs\nDA:1,1\nBRDA:1,0,0,1\nBRDA:1,e0,0,-\nend_of_record\n").unwrap();
        let counts = report.files[0].counts;

        assert_eq!((counts.branches_found, counts.branches_hit), (2, 1));
    }

    #[test]
    fn comment_lines_are_skipped() {
        let report = parse("#generated by geninfo\nSF:a.rs\nDA:1,1\nend_of_record\n").unwrap();

        assert_eq!(report.files[0].counts.lines_found, 1);
    }

    #[test]
    fn parses_mcdc_conditions() {
        let report = parse(
            "SF:a.rs\n\
             DA:1,1\n\
             MCDC:1,2,t,0,0,enable\n\
             MCDC:1,2,f,3,0,enable\n\
             MCDC:1,2,t,0,1,ready\n\
             MCDC:1,2,f,0,1,ready\n\
             end_of_record\n",
        )
        .unwrap();
        let counts = report.files[0].counts;

        assert_eq!((counts.mcdc_found, counts.mcdc_hit), (4, 1));
    }

    #[test]
    fn mcdc_unreachable_group_prefix_is_parsed() {
        let report =
            parse("SF:a.rs\nDA:1,1\nMCDC:1,U2,t,4,0,cond\nMCDC:1,U2,f,0,0,cond\nend_of_record\n")
                .unwrap();
        let counts = report.files[0].counts;

        assert_eq!((counts.mcdc_found, counts.mcdc_hit), (2, 1));
    }

    #[test]
    fn mcdc_declared_counts_used_without_detail() {
        let report = parse("SF:a.rs\nDA:1,1\nMCF:6\nMCH:2\nend_of_record\n").unwrap();
        let counts = report.files[0].counts;

        assert_eq!((counts.mcdc_found, counts.mcdc_hit), (6, 2));
    }

    #[test]
    fn derived_mcdc_counts_win_over_declared() {
        let report =
            parse("SF:a.rs\nMCDC:1,1,t,0,0,x\nMCDC:1,1,f,0,0,x\nMCF:9\nMCH:9\nend_of_record\n")
                .unwrap();
        let counts = report.files[0].counts;

        assert_eq!((counts.mcdc_found, counts.mcdc_hit), (2, 0));
    }

    #[test]
    fn merges_mcdc_across_duplicate_source_files() {
        let report = parse(
            "SF:a.rs\nMCDC:1,1,t,0,0,x\nMCDC:1,1,f,0,0,x\nend_of_record\n\
             SF:a.rs\nMCDC:1,1,t,5,0,x\nMCDC:1,1,f,0,0,x\nend_of_record\n",
        )
        .unwrap();
        let counts = report.files[0].counts;

        assert_eq!((counts.mcdc_found, counts.mcdc_hit), (2, 1));
    }

    #[test]
    fn modern_function_alias_format_counts_aliases() {
        let report =
            parse("SF:a.rs\nFNL:0,10,20\nFNA:0,5,leader\nFNA:0,0,alias\nend_of_record\n").unwrap();
        let counts = report.files[0].counts;

        assert_eq!((counts.functions_found, counts.functions_hit), (2, 1));
    }
}
