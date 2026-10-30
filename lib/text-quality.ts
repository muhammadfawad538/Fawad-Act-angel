// Catches placeholder/garbage input that a plain non-empty check misses -
// punctuation-only strings ("...", "---", "???") and a short list of common
// placeholder words, regardless of surrounding punctuation/casing. Deliberately
// permissive otherwise: real registration numbers (mostly digits/dashes) and
// short real answers ("USA", "N/A - exempt under 501(c)(3)") must still pass.
const PLACEHOLDER_VALUES = new Set([
  "na",
  "none",
  "nil",
  "nothing",
  "test",
  "testing",
  "asdf",
  "qwerty",
  "xxx",
  "tbd",
  "idk",
  "x",
]);

export function hasMeaningfulContent(value: string | undefined | null): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  const alnum = trimmed.replace(/[^a-zA-Z0-9]/g, "");
  if (alnum.length < 2) return false;
  return !PLACEHOLDER_VALUES.has(alnum.toLowerCase());
}
