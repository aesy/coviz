use std::collections::BTreeMap;
use std::fs;
use std::path::Path;

use serde::Serialize;

use crate::model::FileCoverage;
use crate::paths;

const MAX_EMBEDDED_SOURCE_BYTES: u64 = 2_000_000;

#[derive(Debug, Serialize)]
pub struct SourceEntry {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
    pub lines: Vec<(u32, u64)>,
}

pub fn collect(
    files: &[FileCoverage],
    prefix_len: usize,
    input_dir: &Path,
) -> BTreeMap<String, SourceEntry> {
    files
        .iter()
        .map(|file| {
            let relative = paths::components(&file.path)[prefix_len..].join("/");
            let entry = SourceEntry {
                text: read_source(&file.path, input_dir),
                lines: file
                    .line_hits
                    .iter()
                    .map(|(&line, &hits)| (line, hits))
                    .collect(),
            };

            (relative, entry)
        })
        .collect()
}

fn read_source(recorded: &str, input_dir: &Path) -> Option<String> {
    let recorded = Path::new(recorded);
    let resolved = if recorded.is_absolute() {
        recorded.to_path_buf()
    } else {
        input_dir.join(recorded)
    };
    let metadata = fs::metadata(&resolved).ok()?;

    if !metadata.is_file() || metadata.len() > MAX_EMBEDDED_SOURCE_BYTES {
        return None;
    }

    let bytes = fs::read(&resolved).ok()?;

    Some(String::from_utf8_lossy(&bytes).into_owned())
}
