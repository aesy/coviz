use std::path::Path;

use clap::ValueEnum;

#[derive(Clone, Copy, Debug, PartialEq, Eq, ValueEnum)]
pub enum Format {
    Lcov,
    Jacoco,
    Cobertura,
    #[value(name = "llvm-json")]
    LlvmJson,
}

impl Format {
    /// Resolve a format from the file name, falling back to inspecting the
    /// content when the extension is ambiguous (e.g. JaCoCo vs Cobertura `.xml`).
    pub fn detect(path: &Path, content: &str) -> Option<Format> {
        if let Some(name) = path.file_name().map(|n| n.to_string_lossy().to_lowercase()) {
            if name.ends_with(".lcov") || name.ends_with(".info") {
                return Some(Format::Lcov);
            }
            if name.ends_with(".json") {
                return Some(Format::LlvmJson);
            }
            if name.ends_with(".xml") {
                return sniff(content);
            }
            if name.contains("lcov") {
                return Some(Format::Lcov);
            }
        }
        sniff(content)
    }
}

fn sniff(content: &str) -> Option<Format> {
    let trimmed = content.trim_start();
    if trimmed.starts_with('{') || trimmed.starts_with('[') {
        return content
            .contains("llvm.coverage")
            .then_some(Format::LlvmJson);
    }
    if trimmed.starts_with("SF:") || trimmed.starts_with("TN:") {
        return Some(Format::Lcov);
    }
    match xml_root_element(content)?.as_str() {
        "report" => Some(Format::Jacoco),
        "coverage" => Some(Format::Cobertura),
        _ => None,
    }
}

/// The name of the first XML element, skipping the prolog, comments and the
/// doctype declaration.
fn xml_root_element(content: &str) -> Option<String> {
    let mut rest = content.trim_start();
    loop {
        rest = rest.trim_start();
        if let Some(after) = rest.strip_prefix("<?") {
            rest = &after[after.find("?>")? + 2..];
        } else if let Some(after) = rest.strip_prefix("<!--") {
            rest = &after[after.find("-->")? + 3..];
        } else if let Some(after) = rest.strip_prefix("<!") {
            rest = &after[after.find('>')? + 1..];
        } else {
            let after = rest.strip_prefix('<')?;
            let name: String = after
                .chars()
                .take_while(|c| !c.is_whitespace() && *c != '>' && *c != '/')
                .collect();
            return (!name.is_empty()).then_some(name);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn detect(name: &str, content: &str) -> Option<Format> {
        Format::detect(Path::new(name), content)
    }

    #[test]
    fn detects_lcov_from_file_name() {
        for name in [
            "report.lcov",
            "lcov.info",
            "coverage.info",
            "LCOV",
            "my-lcov.txt",
        ] {
            assert_eq!(detect(name, ""), Some(Format::Lcov), "{name}");
        }
    }

    #[test]
    fn detects_llvm_json_from_extension() {
        assert_eq!(detect("coverage.json", "{}"), Some(Format::LlvmJson));
    }

    #[test]
    fn distinguishes_jacoco_and_cobertura_xml_by_root_element() {
        let jacoco = "<?xml version=\"1.0\"?>\n<!DOCTYPE report PUBLIC \"-//JACOCO//DTD Report 1.1//EN\" \"report.dtd\">\n<report name=\"x\"></report>";
        let cobertura = "<?xml version=\"1.0\"?>\n<!DOCTYPE coverage SYSTEM \"coverage-04.dtd\">\n<coverage line-rate=\"0\"></coverage>";

        assert_eq!(detect("out.xml", jacoco), Some(Format::Jacoco));

        assert_eq!(detect("out.xml", cobertura), Some(Format::Cobertura));
    }

    #[test]
    fn sniffs_format_without_a_known_extension() {
        assert_eq!(
            detect("data", "{\"type\":\"llvm.coverage.json.export\"}"),
            Some(Format::LlvmJson)
        );

        assert_eq!(
            detect("data", "<coverage line-rate=\"0\"/>"),
            Some(Format::Cobertura)
        );

        assert_eq!(detect("data", "TN:\nSF:a.rs\n"), Some(Format::Lcov));
    }

    #[test]
    fn unknown_content_is_not_detected() {
        assert_eq!(detect("mystery.xml", "<html></html>"), None);

        assert_eq!(detect("mystery.dat", "nothing here"), None);
    }
}
