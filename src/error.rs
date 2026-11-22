use std::io;
use std::path::PathBuf;

use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
    #[error("Failed to read input file {path}: {source}")]
    InputRead { path: PathBuf, source: io::Error },
    #[error("Could not determine coverage format from file name {path}, use --format")]
    FormatUnknown { path: PathBuf },
    #[error("Invalid LCOV record on line {line_number}: {record}")]
    LcovInvalidRecord { line_number: usize, record: String },
    #[error("LCOV record on line {line_number} appears before any SF record: {record}")]
    LcovRecordOutsideFile { line_number: usize, record: String },
    #[error("Failed to parse XML coverage report: {source}")]
    Xml { source: quick_xml::Error },
    #[error("Failed to parse JSON coverage report: {source}")]
    Json {
        #[from]
        source: serde_json::Error,
    },
    #[error("No coverage data found in {path}")]
    NoCoverageData { path: PathBuf },
    #[error("Failed to write report to {path}: {source}")]
    OutputWrite { path: PathBuf, source: io::Error },
    #[error("Failed to open report in browser: {source}")]
    BrowserOpen { source: opener::OpenError },
}
