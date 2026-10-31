// Small, storage-agnostic helpers for persisting an in-progress form as JSON under one key.
// `storage` defaults to `sessionStorage` but is injectable so this logic can be unit-tested
// without a browser (see form-draft.test.ts), and so callers can swap it if ever needed.
//
// Used by share-your-mission-form.tsx for AAA-HA-002 (don't lose in-progress work on
// accidental navigation) and AAA-HA-008 (don't resurrect a finished submission's data into
// a later, unrelated new one) - saveDraft covers the former, clearDraft the latter.

export interface DraftStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function resolveStorage(storage?: DraftStorage): DraftStorage | null {
  if (storage) return storage;
  if (typeof sessionStorage !== "undefined") return sessionStorage;
  return null;
}

/** Saves `data` as JSON under `key`. Silently no-ops if storage is unavailable. */
export function saveDraft(key: string, data: unknown, storage?: DraftStorage): void {
  const s = resolveStorage(storage);
  if (!s) return;
  try {
    s.setItem(key, JSON.stringify(data));
  } catch {
    // Storage unavailable (private browsing, quota, disabled) - caller still works without it.
  }
}

/** Loads and JSON-parses the draft under `key`. Returns null for anything invalid or missing. */
export function loadDraft(key: string, storage?: DraftStorage): Record<string, unknown> | null {
  const s = resolveStorage(storage);
  if (!s) return null;
  let raw: string | null;
  try {
    raw = s.getItem(key);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Removes the draft under `key`. Silently no-ops if storage is unavailable. */
export function clearDraft(key: string, storage?: DraftStorage): void {
  const s = resolveStorage(storage);
  if (!s) return;
  try {
    s.removeItem(key);
  } catch {
    // Storage unavailable - nothing to clear either way.
  }
}
