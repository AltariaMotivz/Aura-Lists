import test from 'node:test';
import assert from 'node:assert/strict';
import {
  compareWishesByPriority,
  calculatePriorityUpdates,
  reorderPrioritizedWishes,
  getPriorityBadgeInfo,
  isValidPriority
} from '../src/utils/priority.js';

test('isValidPriority correctly validates positive integers', () => {
  assert.equal(isValidPriority(1), true);
  assert.equal(isValidPriority(10), true);
  assert.equal(isValidPriority(0), false);
  assert.equal(isValidPriority(-1), false);
  assert.equal(isValidPriority(1.5), false);
  assert.equal(isValidPriority(null), false);
  assert.equal(isValidPriority(undefined), false);
  assert.equal(isValidPriority('1'), false);
});

test('compareWishesByPriority sorts prioritized wishes first, then unprioritized by newest date', () => {
  const w1 = { id: 'w1', name: 'First Choice', priority: 1, createdAt: '2026-01-01' };
  const w2 = { id: 'w2', name: 'Second Choice', priority: 2, createdAt: '2026-01-02' };
  const w3 = { id: 'w3', name: 'Third Choice', priority: 3, createdAt: '2026-01-03' };
  const uNew = { id: 'uNew', name: 'New Unprioritized', priority: null, createdAt: '2026-10-10' };
  const uOld = { id: 'uOld', name: 'Old Unprioritized', priority: undefined, createdAt: '2026-05-01' };

  const list = [uOld, w2, uNew, w3, w1];
  list.sort(compareWishesByPriority);

  assert.deepEqual(list.map(w => w.id), ['w1', 'w2', 'w3', 'uNew', 'uOld']);
});

test('getPriorityBadgeInfo returns distinctive badges for ranks 1, 2, and 3+', () => {
  const b1 = getPriorityBadgeInfo(1);
  assert.equal(b1.icon, '👑');
  assert.equal(b1.tier, 'crown');
  assert.equal(b1.fullLabel, '#1 Dream Wish');

  const b2 = getPriorityBadgeInfo(2);
  assert.equal(b2.icon, '✨');
  assert.equal(b2.tier, 'radiant');
  assert.equal(b2.fullLabel, '#2 Most Wanted');

  const b3 = getPriorityBadgeInfo(3);
  assert.equal(b3.icon, '💫');
  assert.equal(b3.tier, 'harmonic');
  assert.equal(b3.fullLabel, '#3 Priority');

  assert.equal(getPriorityBadgeInfo(null), null);
  assert.equal(getPriorityBadgeInfo(0), null);
});

test('calculatePriorityUpdates guarantees no two wishes have the same rank (insert at #1)', () => {
  const wishes = [
    { id: 'w1', priority: 1 },
    { id: 'w2', priority: 2 },
    { id: 'w3', priority: 3 },
    { id: 'target', priority: null }
  ];

  // Setting target to rank 1 should bump w1 -> 2, w2 -> 3, w3 -> 4
  const diffs = calculatePriorityUpdates(wishes, 'target', 1);

  assert.deepEqual(diffs, [
    { id: 'target', collectionName: 'wishes', priority: 1 },
    { id: 'w1', collectionName: 'wishes', priority: 2 },
    { id: 'w2', collectionName: 'wishes', priority: 3 },
    { id: 'w3', collectionName: 'wishes', priority: 4 }
  ]);
});

test('calculatePriorityUpdates shifts correctly when inserting in the middle (insert at #2)', () => {
  const wishes = [
    { id: 'w1', priority: 1 },
    { id: 'w2', priority: 2 },
    { id: 'w3', priority: 3 },
    { id: 'target', priority: null }
  ];

  const diffs = calculatePriorityUpdates(wishes, 'target', 2);

  // w1 remains 1 (no diff)
  // target becomes 2
  // w2 shifts to 3
  // w3 shifts to 4
  assert.deepEqual(diffs, [
    { id: 'target', collectionName: 'wishes', priority: 2 },
    { id: 'w2', collectionName: 'wishes', priority: 3 },
    { id: 'w3', collectionName: 'wishes', priority: 4 }
  ]);
});

test('calculatePriorityUpdates re-indexes when moving an existing ranked item up', () => {
  const wishes = [
    { id: 'w1', priority: 1 },
    { id: 'w2', priority: 2 },
    { id: 'w3', priority: 3 }
  ];

  // Move w3 up to rank 1
  const diffs = calculatePriorityUpdates(wishes, 'w3', 1);

  assert.deepEqual(diffs, [
    { id: 'w3', collectionName: 'wishes', priority: 1 },
    { id: 'w1', collectionName: 'wishes', priority: 2 },
    { id: 'w2', collectionName: 'wishes', priority: 3 }
  ]);
});

test('calculatePriorityUpdates compacts remaining items when clearing rank', () => {
  const wishes = [
    { id: 'w1', priority: 1 },
    { id: 'w2', priority: 2 },
    { id: 'w3', priority: 3 }
  ];

  // Clear rank on w2 -> w2 becomes null, w3 promotes to rank 2
  const diffs = calculatePriorityUpdates(wishes, 'w2', null);

  assert.deepEqual(diffs, [
    { id: 'w3', collectionName: 'wishes', priority: 2 },
    { id: 'w2', collectionName: 'wishes', priority: null }
  ]);
});

test('reorderPrioritizedWishes updates order and clears omitted items', () => {
  const wishes = [
    { id: 'a', priority: 1 },
    { id: 'b', priority: 2 },
    { id: 'c', priority: 3 },
    { id: 'd', priority: null }
  ];

  // Reorder to: c first, then a. b is removed from the priority list.
  const diffs = reorderPrioritizedWishes(wishes, ['c', 'a']);

  assert.deepEqual(diffs, [
    { id: 'c', collectionName: 'wishes', priority: 1 },
    { id: 'a', collectionName: 'wishes', priority: 2 },
    { id: 'b', collectionName: 'wishes', priority: null }
  ]);
});
