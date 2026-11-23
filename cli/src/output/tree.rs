use std::collections::BTreeMap;

use serde::Serialize;

use crate::model::{Counts, FileCoverage};
use crate::paths;

#[derive(Debug, Serialize)]
pub struct Node {
    pub name: String,
    pub path: String,
    pub dir: bool,
    pub counts: Counts,
    pub children: Vec<Self>,
}

#[derive(Debug)]
pub struct Tree {
    pub root: Node,
    pub prefix: Vec<String>,
}

pub fn build(files: &[FileCoverage]) -> Tree {
    let split: Vec<Vec<String>> = files
        .iter()
        .map(|file| paths::components(&file.path))
        .collect();
    let prefix_len = paths::common_prefix_len(&split);
    let mut root = Dir::default();

    for (file, components) in files.iter().zip(&split) {
        root.insert(&components[prefix_len..], file.counts);
    }

    Tree {
        root: root.into_node(String::new(), String::new()),
        prefix: split
            .first()
            .map_or_default(|components| components[..prefix_len].to_vec()),
    }
}

#[derive(Default)]
struct Dir {
    dirs: BTreeMap<String, Self>,
    files: Vec<(String, Counts)>,
}

impl Dir {
    fn insert(&mut self, components: &[String], counts: Counts) {
        match components {
            [] => {},
            [file_name] => self.files.push((file_name.clone(), counts)),
            [dir_name, rest @ ..] => self
                .dirs
                .entry(dir_name.clone())
                .or_default()
                .insert(rest, counts),
        }
    }

    fn into_node(self, name: String, path: String) -> Node {
        let mut children: Vec<Node> = Vec::new();

        for (dir_name, dir) in self.dirs {
            let dir_path = join(&path, &dir_name);

            children.push(collapse(dir.into_node(dir_name, dir_path)));
        }

        for (file_name, counts) in self.files {
            children.push(Node {
                path: join(&path, &file_name),
                name: file_name,
                dir: false,
                counts,
                children: Vec::new(),
            });
        }

        children.sort_by(|a, b| {
            b.dir
                .cmp(&a.dir)
                .then_with(|| a.name.to_lowercase().cmp(&b.name.to_lowercase()))
        });

        let mut counts = Counts::default();

        for child in &children {
            counts.add(&child.counts);
        }

        Node {
            name,
            path,
            dir: true,
            counts,
            children,
        }
    }
}

/// Merge single-child directory chains: a/(b/(c, files)) becomes "a/b"/(c,
/// files).
fn collapse(mut node: Node) -> Node {
    while node.children.len() == 1 && node.children[0].dir {
        let child = node.children.pop().expect("checked length");

        node.name = format!("{}/{}", node.name, child.name);

        node.path = child.path;

        node.children = child.children;
    }

    node
}

fn join(base: &str, name: &str) -> String {
    if base.is_empty() {
        name.to_string()
    } else {
        format!("{base}/{name}")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::BTreeMap;

    fn file(path: &str, lines_found: u64, lines_hit: u64) -> FileCoverage {
        FileCoverage {
            path: path.to_string(),
            line_hits: BTreeMap::new(),
            counts: Counts {
                lines_found,
                lines_hit,
                ..Counts::default()
            },
        }
    }

    #[test]
    fn strips_common_prefix_and_aggregates() {
        let tree = build(&[
            file("/repo/crate-a/src/lib.rs", 10, 5),
            file("/repo/crate-b/src/lib.rs", 10, 10),
        ]);

        assert_eq!(tree.prefix, ["repo"]);

        assert_eq!(tree.root.counts.lines_found, 20);

        assert_eq!(tree.root.counts.lines_hit, 15);

        assert_eq!(tree.root.children.len(), 2);
    }

    #[test]
    fn collapses_single_child_directory_chains() {
        let tree = build(&[
            file("/repo/crate-a/src/lib.rs", 1, 1),
            file("/repo/crate-b/src/lib.rs", 1, 1),
        ]);
        let names: Vec<&str> = tree
            .root
            .children
            .iter()
            .map(|child| child.name.as_str())
            .collect();

        assert_eq!(names, ["crate-a/src", "crate-b/src"]);

        assert_eq!(tree.root.children[0].path, "crate-a/src");

        assert_eq!(tree.root.children[0].children[0].path, "crate-a/src/lib.rs");
    }

    #[test]
    fn does_not_collapse_directories_with_files() {
        let tree = build(&[
            file("/repo/a/mod.rs", 1, 1),
            file("/repo/a/sub/lib.rs", 1, 1),
            file("/repo/b/lib.rs", 1, 1),
        ]);
        let a = &tree.root.children[0];

        assert_eq!(a.name, "a");

        assert_eq!(a.children.len(), 2);
    }

    #[test]
    fn sorts_directories_before_files_alphabetically() {
        let tree = build(&[
            file("/repo/zeta.rs", 1, 1),
            file("/repo/alpha.rs", 1, 1),
            file("/repo/beta/lib.rs", 1, 1),
            file("/repo/beta/other.rs", 1, 1),
        ]);
        let names: Vec<&str> = tree
            .root
            .children
            .iter()
            .map(|child| child.name.as_str())
            .collect();

        assert_eq!(names, ["beta", "alpha.rs", "zeta.rs"]);
    }
}
