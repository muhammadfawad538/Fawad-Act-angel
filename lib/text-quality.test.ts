import test from "node:test";
import assert from "node:assert/strict";
import { hasMeaningfulContent } from "./text-quality.ts";

test("rejects punctuation/symbol-only input", () => {
  assert.equal(hasMeaningfulContent("..."), false);
  assert.equal(hasMeaningfulContent("---"), false);
  assert.equal(hasMeaningfulContent("???"), false);
  assert.equal(hasMeaningfulContent("___"), false);
  assert.equal(hasMeaningfulContent("."), false);
  assert.equal(hasMeaningfulContent("-"), false);
});

test("rejects common placeholder words regardless of punctuation/casing", () => {
  assert.equal(hasMeaningfulContent("n/a"), false);
  assert.equal(hasMeaningfulContent("N/A"), false);
  assert.equal(hasMeaningfulContent("N.A."), false);
  assert.equal(hasMeaningfulContent("none"), false);
  assert.equal(hasMeaningfulContent("None"), false);
  assert.equal(hasMeaningfulContent("test"), false);
  assert.equal(hasMeaningfulContent("x"), false);
  assert.equal(hasMeaningfulContent("tbd"), false);
  assert.equal(hasMeaningfulContent("idk"), false);
});

test("rejects empty, whitespace-only, and nullish input", () => {
  assert.equal(hasMeaningfulContent(""), false);
  assert.equal(hasMeaningfulContent("   "), false);
  assert.equal(hasMeaningfulContent(undefined), false);
  assert.equal(hasMeaningfulContent(null), false);
});

test("accepts legitimate short answers", () => {
  assert.equal(hasMeaningfulContent("USA"), true);
  assert.equal(hasMeaningfulContent("UK"), true);
  assert.equal(hasMeaningfulContent("Remote"), true);
});

test("accepts registration numbers (mostly digits/punctuation)", () => {
  assert.equal(hasMeaningfulContent("123-456-789"), true);
  assert.equal(hasMeaningfulContent("EIN 12-3456789"), true);
});

test("accepts URLs", () => {
  assert.equal(hasMeaningfulContent("https://example.org/registry/12345"), true);
});

test("accepts real exemption explanations that happen to contain 'n/a' or 'none' as a substring", () => {
  assert.equal(hasMeaningfulContent("N/A - exempt under 501(c)(3)"), true);
  assert.equal(hasMeaningfulContent("None yet, application pending with the state registrar"), true);
});

test("accepts a long legitimate mission statement", () => {
  assert.equal(
    hasMeaningfulContent(
      "We provide after-school tutoring and meals to underserved children in rural Kenya.",
    ),
    true,
  );
});
