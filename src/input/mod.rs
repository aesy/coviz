pub mod cobertura;
pub mod format;
pub mod jacoco;
pub mod lcov;
pub mod llvm_json;
mod xml;

pub use format::Format;

use crate::error::Error;
use crate::model::Report;

pub fn parse(format: Format, content: &str) -> Result<Report, Error> {
    match format {
        Format::Lcov => lcov::parse(content),
        Format::Jacoco => jacoco::parse(content),
        Format::Cobertura => cobertura::parse(content),
        Format::LlvmJson => llvm_json::parse(content),
    }
}
