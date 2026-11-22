use std::collections::BTreeMap;

use minijinja::syntax::SyntaxConfig;
use minijinja::{Environment, Value, context};

use crate::output::sources::SourceEntry;
use crate::output::tree::Node;

const TEMPLATE: &str = include_str!("../../assets/report.html");

pub fn render(
    title: &str,
    input: &str,
    generated_ms: u64,
    root: &Node,
    sources: &BTreeMap<String, SourceEntry>,
) -> String {
    let data = serde_json::json!({
        "title": title,
        "input": input,
        "generatedMs": generated_ms,
        "root": root,
        "sources": sources,
    });
    // Keep the JSON from closing the <script> element it lives in.
    let payload = data.to_string().replace("</", "<\\/");

    let mut env = Environment::new();

    // Custom delimiters so nothing in the bundled JS/CSS collides with template
    // syntax; the report template only uses `[[= title =]]` and `[[= data =]]`.
    env.set_syntax(
        SyntaxConfig::builder()
            .block_delimiters("[[%", "%]]")
            .variable_delimiters("[[=", "=]]")
            .comment_delimiters("[[#", "#]]")
            .build()
            .expect("valid template syntax"),
    );

    env.add_template("report.html", TEMPLATE)
        .expect("report template parses");

    env.get_template("report.html")
        .expect("report template registered")
        .render(context! {
            title => title,
            data => Value::from_safe_string(payload),
        })
        .expect("report template renders")
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::Counts;

    fn sample_root() -> Node {
        Node {
            name: String::new(),
            path: String::new(),
            dir: true,
            counts: Counts::default(),
            children: Vec::new(),
        }
    }

    #[test]
    fn embeds_data_and_escaped_title() {
        let html = render(
            "my<project>",
            "in.lcov",
            42,
            &sample_root(),
            &BTreeMap::new(),
        );

        assert!(html.contains("my&lt;project&gt;"));

        assert!(html.contains("\"generatedMs\":42"));

        assert!(!html.contains("[[= data =]]"));

        assert!(!html.contains("[[= title =]]"));
    }

    #[test]
    fn script_terminator_in_source_text_is_escaped() {
        let mut sources = BTreeMap::new();

        sources.insert(
            "a.js".to_string(),
            SourceEntry {
                text: Some("</script><b>".to_string()),
                lines: vec![(1, 1)],
            },
        );

        let html = render("t", "in.lcov", 0, &sample_root(), &sources);

        assert!(!html.contains("</script><b>"));

        assert!(html.contains("<\\/script>"));
    }
}
