use std::path::PathBuf;

use clap::{ArgGroup, Parser};

use crate::input::Format;

#[derive(Debug, Parser)]
#[command(name = "coviz", version, about = "Code coverage report visualizer")]
#[command(group(ArgGroup::new("destination").args(["output", "open"]).required(true).multiple(true)))]
pub struct Cli {
    /// Coverage report to visualize
    #[arg(short, long)]
    pub input: PathBuf,

    /// Input format, determined from the input file name or contents when
    /// omitted
    #[arg(short, long, value_enum)]
    pub format: Option<Format>,

    /// Write the HTML report to this file
    #[arg(short, long)]
    pub output: Option<PathBuf>,

    /// Open the report in the default browser
    #[arg(long)]
    pub open: bool,
}

#[cfg(test)]
mod tests {
    use super::*;
    use clap::error::ErrorKind;

    #[test]
    fn requires_output_or_open() {
        let err = Cli::try_parse_from(["coviz", "--input", "report.lcov"]).unwrap_err();

        assert_eq!(err.kind(), ErrorKind::MissingRequiredArgument);
    }

    #[test]
    fn accepts_open_without_output() {
        let cli = Cli::try_parse_from(["coviz", "--input", "report.lcov", "--open"]).unwrap();

        assert!(cli.open);

        assert!(cli.output.is_none());
    }

    #[test]
    fn accepts_output_and_open_together() {
        let cli = Cli::try_parse_from(["coviz", "-i", "report.lcov", "-o", "out.html", "--open"])
            .unwrap();

        assert!(cli.open);

        assert_eq!(
            cli.output.as_deref(),
            Some(std::path::Path::new("out.html"))
        );
    }

    #[test]
    fn accepts_short_flags() {
        let cli = Cli::try_parse_from(["coviz", "-i", "cov.txt", "-f", "lcov", "-o", "out.html"])
            .unwrap();

        assert_eq!(cli.format, Some(Format::Lcov));

        assert_eq!(cli.input, std::path::Path::new("cov.txt"));
    }
}
