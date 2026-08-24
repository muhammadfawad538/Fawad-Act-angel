export const E164_REGEX = /^\+[1-9]\d{1,14}$/;

/**
 * Normalizes user-typed input into E.164 by stripping spaces, dashes,
 * parentheses, and dots. Requires an explicit leading '+' with country code -
 * deliberately doesn't guess a missing country code.
 */
export function normalizePhone(input: string | undefined | null): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed.startsWith("+")) return null;
  const cleaned = "+" + trimmed.slice(1).replace(/[^\d]/g, "");
  return E164_REGEX.test(cleaned) ? cleaned : null;
}
