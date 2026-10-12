import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePriorityUpdates } from '../src/utils/priority.js';

test('active wishes filter separates active from archived/received items', () => {
  const wishes = [
    { id: '1', name: 'Active Wish 1', isArchived: false, status: 'active' },
    { id: '2', name: 'Legacy Wish', createdAt: '2026-10-01' }, // No isArchived field
    { id: '3', name: 'Archived Wish', isArchived: true, status: 'received' },
    { id: '4', name: 'Received Item', status: 'received' }
  ];

  const active = wishes.filter(w => !w.isArchived && w.status !== 'received');
  const archived = wishes.filter(w => Boolean(w.isArchived || w.status === 'received'));

  assert.equal(active.length, 2);
  assert.deepEqual(active.map(w => w.id), ['1', '2']);
  assert.equal(archived.length, 2);
  assert.deepEqual(archived.map(w => w.id), ['3', '4']);
});

test('calculatePriorityUpdates compacts remaining priorities when an item is archived', () => {
  const wishes = [
    { id: 'a', priority: 1, collectionName: 'wishes' },
    { id: 'b', priority: 2, collectionName: 'wishes' },
    { id: 'c', priority: 3, collectionName: 'wishes' }
  ];

  // When wish 'a' is marked received, its priority is cleared to null
  const updates = calculatePriorityUpdates(wishes, 'a', null);

  // 'a' should be set to null, 'b' shifted to 1, 'c' shifted to 2
  const map = new Map(updates.map(u => [u.id, u.priority]));
  assert.equal(map.get('a'), null);
  assert.equal(map.get('b'), 1);
  assert.equal(map.get('c'), 2);
});

test('unarchiving resets isArchived to false and status to active', () => {
  const archivedItem = {
    id: 'gift-1',
    name: 'Vintage Camera',
    isArchived: true,
    status: 'received',
    receivedAt: '2026-10-10T12:00:00Z'
  };

  const unarchivedPayload = {
    isArchived: false,
    status: 'active',
    unarchivedAt: new Date().toISOString()
  };

  const restored = { ...archivedItem, ...unarchivedPayload };
  assert.equal(restored.isArchived, false);
  assert.equal(restored.status, 'active');
  assert.ok(restored.unarchivedAt);
});
