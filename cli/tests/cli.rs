use std::fs;
use std::path::PathBuf;
use std::process::Command;

fn fixture(name: &str) -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("tests/fixtures")
        .join(name)
}

fn output_path(name: &str) -> PathBuf {
    let path = PathBuf::from(env!("CARGO_TARGET_TMPDIR")).join(name);
    let _ = fs::remove_file(&path);

    path
}

#[test]
fn writes_report_for_lcov_input() {
    let output = output_path("sample-report.html");
    let result = Command::new(env!("CARGO_BIN_EXE_coviz"))
        .args(["--input"])
        .arg(fixture("sample.lcov"))
        .arg("--output")
        .arg(&output)
        .output()
        .unwrap();

    assert!(
        result.status.success(),
        "{}",
        String::from_utf8_lossy(&result.stderr)
    );

    let html = fs::read_to_string(&output).unwrap();

    assert!(html.contains("coviz-data"));

    assert!(html.contains("\"lf\":"));
}

#[test]
fn requires_output_or_open() {
    let result = Command::new(env!("CARGO_BIN_EXE_coviz"))
        .args(["--input"])
        .arg(fixture("sample.lcov"))
        .output()
        .unwrap();

    assert!(!result.status.success());
}

#[test]
fn rejects_undetectable_format() {
    let input = output_path("coverage.unknown");

    fs::write(&input, "just some text with no coverage markers\n").unwrap();

    let output = output_path("unknown-report.html");
    let result = Command::new(env!("CARGO_BIN_EXE_coviz"))
        .arg("--input")
        .arg(&input)
        .arg("--output")
        .arg(&output)
        .output()
        .unwrap();

    assert!(!result.status.success());

    let stderr = String::from_utf8_lossy(&result.stderr);

    assert!(
        stderr.contains("Could not determine coverage format"),
        "{stderr}"
    );
}

#[test]
fn detects_xml_format_behind_a_byte_order_mark() {
    let input = output_path("bom-jacoco.xml");

    fs::write(
        &input,
        "\u{feff}<?xml version=\"1.0\"?><report name=\"r\"><package name=\"p\">\
         <sourcefile name=\"A.java\"><line nr=\"1\" mi=\"0\" ci=\"2\" mb=\"0\" cb=\"0\"/>\
         </sourcefile></package></report>",
    )
    .unwrap();

    let output = output_path("bom-report.html");
    let result = Command::new(env!("CARGO_BIN_EXE_coviz"))
        .arg("--input")
        .arg(&input)
        .arg("--output")
        .arg(&output)
        .output()
        .unwrap();

    assert!(
        result.status.success(),
        "{}",
        String::from_utf8_lossy(&result.stderr)
    );
}
