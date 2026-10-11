// Shared by the React app and the Node migration script (scripts/), so keep this
// file free of browser- or Firebase-specific imports.

// Matches E.164-style phone numbers. Legacy accounts used the phone number as
// their display name; those must never be indexed or users become findable by phone.
const PHONE_PATTERN = /^\+?[1-9]\d{1,14}$/;

const prefixesOf = value => Array.from({ length: value.length }, (_, i) => value.slice(0, i + 1));

export const normalizeUsername = value => String(value || '').trim().replace(/^@+/, '').toLowerCase();

/**
 * Builds the lowercase prefix ("n-gram") array used by friend search
 * (`where('searchableArray', 'array-contains', term)`).
 * Includes prefixes of the full display name, of each word in it, and of the username,
 * e.g. ("Seb Ruiz", "sebr") -> ["s","se","seb","seb ","seb r",…,"r","ru",…,"sebr"].
 */
export function buildSearchableArray(displayName, username) {
  const terms = new Set();
  const name = String(displayName || '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (name && !PHONE_PATTERN.test(name.replace(/[\s()-]/g, ''))) {
    prefixesOf(name).forEach(term => terms.add(term));
    name.split(' ').forEach(word => prefixesOf(word).forEach(term => terms.add(term)));
  }
  const handle = normalizeUsername(username);
  if (handle) prefixesOf(handle).forEach(term => terms.add(term));
  return [...terms];
}

export const searchableArrayMatches = (current, expected) =>
  Array.isArray(current) && current.length === expected.length && current.every((term, i) => term === expected[i]);
