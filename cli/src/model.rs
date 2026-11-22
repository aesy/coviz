use std::collections::BTreeMap;

use serde::Serialize;

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize)]
pub struct Counts {
    #[serde(rename = "lf")]
    pub lines_found: u64,
    #[serde(rename = "lh")]
    pub lines_hit: u64,
    #[serde(rename = "ff")]
    pub functions_found: u64,
    #[serde(rename = "fh")]
    pub functions_hit: u64,
    #[serde(rename = "bf")]
    pub branches_found: u64,
    #[serde(rename = "bh")]
    pub branches_hit: u64,
    #[serde(rename = "mf")]
    pub mcdc_found: u64,
    #[serde(rename = "mh")]
    pub mcdc_hit: u64,
}

impl Counts {
    pub fn add(&mut self, other: &Counts) {
        self.lines_found += other.lines_found;
        self.lines_hit += other.lines_hit;
        self.functions_found += other.functions_found;
        self.functions_hit += other.functions_hit;
        self.branches_found += other.branches_found;
        self.branches_hit += other.branches_hit;
        self.mcdc_found += other.mcdc_found;
        self.mcdc_hit += other.mcdc_hit;
    }
}

#[derive(Debug)]
pub struct FileCoverage {
    pub path: String,
    pub line_hits: BTreeMap<u32, u64>,
    pub counts: Counts,
}

#[derive(Debug)]
pub struct Report {
    pub files: Vec<FileCoverage>,
}
