# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0]

### Added

- `coviz` CLI that turns a coverage report into a single self-contained HTML page, written to a file with `--output`
  and/or opened in the browser with `--open`.
- Input formats: LCOV, JaCoCo XML, Cobertura XML and LLVM JSON, detected from the file name or contents, or set with
  `--format`.
- Report with line, function and branch coverage per directory and file, a source view with covered and missed lines,
  and a light/dark theme.
- Prebuilt binaries for Linux (x86_64 and ARM64, statically linked), macOS (Apple silicon) and Windows (x86_64).
- Installation from crates.io with `cargo install coviz-cli`.

[Unreleased]: https://github.com/aesy/coviz/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/aesy/coviz/releases/tag/v0.1.0
