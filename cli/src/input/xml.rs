use quick_xml::escape::unescape;
use quick_xml::events::BytesStart;

/// Value of the named attribute, unescaped. Unparseable attributes are skipped.
pub fn attr(element: &BytesStart, key: &str) -> Option<String> {
    let attribute = element
        .attributes()
        .flatten()
        .find(|a| a.key.as_ref() == key)?;

    unescape(&attribute.value)
        .ok()
        .map(|value| value.into_owned())
}

pub fn attr_u64(element: &BytesStart, key: &str) -> Option<u64> {
    attr(element, key)?.trim().parse().ok()
}
