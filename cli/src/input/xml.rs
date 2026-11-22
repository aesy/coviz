use quick_xml::escape::unescape;
use quick_xml::events::BytesStart;

/// Value of the named attribute, unescaped. Unparseable attributes are skipped.
pub fn attr(element: &BytesStart, key: &[u8]) -> Option<String> {
    let attribute = element
        .attributes()
        .flatten()
        .find(|a| a.key.as_ref() == key)?;
    let raw = String::from_utf8_lossy(&attribute.value);

    unescape(&raw).ok().map(|value| value.into_owned())
}

pub fn attr_u64(element: &BytesStart, key: &[u8]) -> Option<u64> {
    attr(element, key)?.trim().parse().ok()
}
