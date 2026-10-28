import test from "node:test";
import assert from "node:assert/strict";
import { saveDraft, loadDraft, clearDraft, type DraftStorage } from "./form-draft.ts";

function fakeStorage(): DraftStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => (data.has(key) ? data.get(key)! : null),
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  };
}

test("saveDraft then loadDraft round-trips the same data", () => {
  const storage = fakeStorage();
  saveDraft("k", { orgName: "Example NPO", mission: "Help people" }, storage);
  assert.deepEqual(loadDraft("k", storage), { orgName: "Example NPO", mission: "Help people" });
});

test("loadDraft returns null when nothing was ever saved", () => {
  const storage = fakeStorage();
  assert.equal(loadDraft("k", storage), null);
});

test("loadDraft returns null for invalid JSON rather than throwing", () => {
  const storage = fakeStorage();
  storage.data.set("k", "{not valid json");
  assert.equal(loadDraft("k", storage), null);
});

test("loadDraft returns null for a non-object payload", () => {
  const storage = fakeStorage();
  storage.data.set("k", JSON.stringify("just a string"));
  assert.equal(loadDraft("k", storage), null);
});

// AAA-HA-008: a completed submission must not resurrect itself into a later, new submission.
test("clearDraft removes the saved draft, and loadDraft reflects that afterward", () => {
  const storage = fakeStorage();
  saveDraft("k", { orgName: "Example NPO" }, storage);
  assert.notEqual(loadDraft("k", storage), null);

  clearDraft("k", storage);

  assert.equal(loadDraft("k", storage), null);
});

// AAA-HA-002: in-progress work (never cleared) must still survive independently.
test("saveDraft after a clear starts a fresh, independent draft", () => {
  const storage = fakeStorage();
  saveDraft("k", { orgName: "Old NPO" }, storage);
  clearDraft("k", storage);

  saveDraft("k", { orgName: "New NPO" }, storage);

  assert.deepEqual(loadDraft("k", storage), { orgName: "New NPO" });
});

test("clearDraft on an already-empty key is a safe no-op", () => {
  const storage = fakeStorage();
  clearDraft("k", storage);
  assert.equal(loadDraft("k", storage), null);
});

test("functions never throw when storage itself throws (private browsing, quota, etc.)", () => {
  const throwing: DraftStorage = {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("blocked");
    },
    removeItem: () => {
      throw new Error("blocked");
    },
  };
  assert.doesNotThrow(() => saveDraft("k", { a: 1 }, throwing));
  assert.doesNotThrow(() => clearDraft("k", throwing));
  assert.equal(loadDraft("k", throwing), null);
});
