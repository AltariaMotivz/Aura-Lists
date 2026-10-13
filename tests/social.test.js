import test from 'node:test';
import assert from 'node:assert/strict';
import { formatRelativeTime, removeFollower } from '../src/utils/social.js';

test('formatRelativeTime returns accurate relative times', () => {
  const now = Date.now();
  assert.equal(formatRelativeTime(new Date(now - 10000)), 'Just now');
  assert.equal(formatRelativeTime(new Date(now - 120000)), '2m ago');
  assert.equal(formatRelativeTime(new Date(now - 7200000)), '2h ago');
  assert.equal(formatRelativeTime(new Date(now - 172800000)), '2d ago');
  const twoWeeksAgo = new Date(now - 604800000 * 2);
  assert.equal(formatRelativeTime(twoWeeksAgo), twoWeeksAgo.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
  assert.equal(formatRelativeTime(new Date(now - 10000).toISOString()), 'Just now');
  assert.equal(formatRelativeTime(null), '');
  assert.equal(formatRelativeTime(undefined), '');
  assert.equal(formatRelativeTime('invalid-date'), '');
});

test('removeFollower is a no-op for missing IDs or self-removal (never touches Firestore)', async () => {
  assert.equal(await removeFollower('', 'b'), undefined);
  assert.equal(await removeFollower('a', ''), undefined);
  assert.equal(await removeFollower('a', 'a'), undefined);
});
