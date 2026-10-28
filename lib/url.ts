// AAA-HA-009: `new URL("https:testingit")` does NOT throw - for "special" schemes like
// http/https, the WHATWG URL parser is lenient about a missing "//" and happily reinterprets
// "testingit" as the hostname (`new URL("https:testingit").hostname === "testingit"`). A bare
// protocol-and-word check therefore accepts garbage input. Requiring the hostname to contain a
// dot rejects that single-label case while still accepting every real public website URL
// ("testingit.com", "www.testingit.com", "example.org", ...), which always has one.
export function isValidUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    return url.hostname.length > 0 && url.hostname.includes(".");
  } catch {
    return false;
  }
}
