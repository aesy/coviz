mod cli;
mod error;
mod input;
mod model;
mod output;
mod paths;

use std::path::{Path, PathBuf};
use std::process::ExitCode;
use std::time::{SystemTime, UNIX_EPOCH};
use std::{env, fs};

use clap::Parser;

use crate::cli::Cli;
use crate::error::Error;
use crate::input::Format;

fn main() -> ExitCode {
    match run() {
        Ok(()) => ExitCode::SUCCESS,
        Err(err) => {
            eprintln!("{err}");
            ExitCode::FAILURE
        }
    }
}

fn run() -> Result<(), Error> {
    let cli = Cli::parse();
    let raw = fs::read_to_string(&cli.input).map_err(|source| Error::InputRead {
        path: cli.input.clone(),
        source,
    })?;
    // Windows tools (e.g. Pester's JaCoCo writer) prefix a UTF-8 byte order mark.
    let content = raw.strip_prefix('\u{feff}').unwrap_or(&raw);
    let format = cli
        .format
        .or_else(|| Format::detect(&cli.input, content))
        .ok_or_else(|| Error::FormatUnknown {
            path: cli.input.clone(),
        })?;
    let report = input::parse(format, content)?;

    if report.files.is_empty() {
        return Err(Error::NoCoverageData {
            path: cli.input.clone(),
        });
    }

    let tree = output::tree::build(&report.files);
    let input_dir = cli.input.parent().unwrap_or(Path::new("."));
    let sources = output::sources::collect(&report.files, tree.prefix.len(), input_dir);
    let title = tree
        .prefix
        .last()
        .cloned()
        .unwrap_or_else(|| input_stem(&cli.input));
    let html = output::html::render(
        &title,
        &cli.input.display().to_string(),
        unix_millis(),
        &tree.root,
        &sources,
    );

    let output = cli
        .output
        .clone()
        .unwrap_or_else(|| temp_output(&cli.input));

    fs::write(&output, &html).map_err(|source| Error::OutputWrite {
        path: output.clone(),
        source,
    })?;

    println!("Report written to {}", output.display());

    if cli.open {
        opener::open(&output).map_err(|source| Error::BrowserOpen { source })?;
    }

    Ok(())
}

fn input_stem(input: &Path) -> String {
    input
        .file_stem()
        .map(|stem| stem.to_string_lossy().into_owned())
        .unwrap_or_else(|| "report".to_string())
}

fn temp_output(input: &Path) -> PathBuf {
    env::temp_dir().join(format!("coviz-{}.html", input_stem(input)))
}

fn unix_millis() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis() as u64)
        .unwrap_or(0)
}
