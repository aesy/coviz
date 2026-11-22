pub fn components(path: &str) -> Vec<String> {
    path.replace('\\', "/")
        .split('/')
        .filter(|part| !part.is_empty() && *part != ".")
        .map(str::to_string)
        .collect()
}

/// Longest run of leading components shared by every path, capped so each
/// path keeps at least its file name.
pub fn common_prefix_len(paths: &[Vec<String>]) -> usize {
    let Some(first) = paths.first() else {
        return 0;
    };
    let limit = paths
        .iter()
        .map(|path| path.len().saturating_sub(1))
        .min()
        .unwrap_or(0);
    let mut len = 0;

    while len < limit && paths.iter().all(|path| path[len] == first[len]) {
        len += 1;
    }

    len
}

#[cfg(test)]
mod tests {
    use super::*;

    fn split(paths: &[&str]) -> Vec<Vec<String>> {
        paths.iter().map(|path| components(path)).collect()
    }

    #[test]
    fn splits_and_normalizes_separators() {
        assert_eq!(components("/a/b/c.rs"), ["a", "b", "c.rs"]);

        assert_eq!(components("a\\b\\c.rs"), ["a", "b", "c.rs"]);

        assert_eq!(components("./a/b.rs"), ["a", "b.rs"]);
    }

    #[test]
    fn finds_common_prefix() {
        let paths = split(&["/repo/crate-a/src/lib.rs", "/repo/crate-b/src/lib.rs"]);

        assert_eq!(common_prefix_len(&paths), 1);
    }

    #[test]
    fn single_file_keeps_only_its_name() {
        let paths = split(&["/repo/src/lib.rs"]);

        assert_eq!(common_prefix_len(&paths), 2);
    }

    #[test]
    fn identical_directories_keep_file_names() {
        let paths = split(&["/repo/src/a.rs", "/repo/src/b.rs"]);

        assert_eq!(common_prefix_len(&paths), 2);
    }
}
