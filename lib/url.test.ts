import test from "node:test";
import assert from "node:assert/strict";
import { isValidUrl } from "./url.ts";

test("accepts valid https/http URLs with a real hostname", () => {
  assert.equal(isValidUrl("https://testingit.com"), true);
  assert.equal(isValidUrl("https://www.testingit.com"), true);
  assert.equal(isValidUrl("https://example.org"), true);
  assert.equal(isValidUrl("http://example.org"), true);
  assert.equal(isValidUrl("https://example.org/path?query=1"), true);
});

// AAA-HA-009: new URL("https:testingit") does not throw - WHATWG's lenient parsing for
// "special" schemes reinterprets the bare word after the colon as the hostname.
test("rejects the reported reproduction case and similar missing-slash forms", () => {
  assert.equal(isValidUrl("https:testingit"), false);
  assert.equal(isValidUrl("http:testingit"), false);
  assert.equal(isValidUrl("https:///testingit"), false);
});

test("rejects malformed URLs and missing/invalid hostnames", () => {
  assert.equal(isValidUrl("not a url"), false);
  assert.equal(isValidUrl("https://"), false);
  assert.equal(isValidUrl("ftp://example.com"), false);
  assert.equal(isValidUrl("javascript:alert(1)"), false);
  assert.equal(isValidUrl("example.org"), false);
});

test("does not silently rewrite invalid input - just rejects it (no auto-correction)", () => {
  // If this ever started rewriting "https:testingit" into something like
  // "https://testingit" instead of rejecting it, this function's contract would be violated.
  assert.equal(isValidUrl("https:testingit"), false);
});

test("rejects blank/whitespace-only input", () => {
  assert.equal(isValidUrl(""), false);
  assert.equal(isValidUrl("   "), false);
});
