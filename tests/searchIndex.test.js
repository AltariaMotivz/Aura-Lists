import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSearchableArray, normalizeUsername } from '../src/utils/search.js';
import { planUpdate, runMigration } from '../scripts/migrate-search-index.mjs';

test('builds lowercase prefixes for display name and username', () => {
  const terms = buildSearchableArray('Sebastian', 'Sebas_99');
  for (const t of ['s', 'se', 'seb', 'seba', 'sebas', 'sebastian', 'sebas_', 'sebas_99']) assert.ok(terms.includes(t), t);
  assert.equal(new Set(terms).size, terms.length, 'no duplicates');
  assert.ok(terms.every(t => t === t.toLowerCase()));
});

test('multi-word names are searchable by full name and by each word', () => {
  const terms = buildSearchableArray('  Seb   Ruiz ', '');
  for (const t of ['seb r', 'seb ruiz', 'r', 'ru', 'ruiz']) assert.ok(terms.includes(t), t);
  assert.ok(!terms.some(t => t.startsWith(' ') || t.includes('  ')));
});

test('matches the term the search dialog sends', () => {
  const searchTerm = input => input.trim().replace(/^@/, '').toLowerCase(); // FindFriendDialog
  const terms = buildSearchableArray('Luna Star', '@Lunar.Daydreams');
  for (const input of ['Lu', '@lunar', ' STAR ', 'Luna S']) assert.ok(terms.includes(searchTerm(input)), input);
});

test('never indexes phone-number display names from the legacy app', () => {
  assert.deepEqual(buildSearchableArray('+15551234567', ''), []);
  assert.deepEqual(buildSearchableArray('+15551234567', 'kai'), ['k', 'ka', 'kai']);
});

test('handles missing fields', () => {
  assert.deepEqual(buildSearchableArray(undefined, null), []);
  assert.equal(normalizeUsername(' @@Kai '), 'kai');
});

test('planUpdate skips docs that are already correct', () => {
  const doc = { displayName: 'Kai', username: 'kai.creates' };
  assert.ok(planUpdate(doc));
  assert.equal(planUpdate({ ...doc, searchableArray: buildSearchableArray(doc.displayName, doc.username) }), null);
  assert.deepEqual(planUpdate({}), []); // missing field gets an explicit empty array
  assert.equal(planUpdate({ searchableArray: [] }), null);
});

function fakeDb(users) {
  const ids = Object.keys(users).sort();
  const commits = [];
  const query = (after = null, size = Infinity) => ({
    orderBy: () => query(after, size),
    limit: n => query(after, n),
    startAfter: d => query(d.id, size),
    get: async () => {
      const docs = ids.filter(id => after === null || id > after).slice(0, size)
        .map(id => ({ id, ref: { id }, data: () => users[id] }));
      return { docs, empty: !docs.length, size: docs.length };
    }
  });
  return {
    commits,
    collection: name => { assert.equal(name, 'users'); return query(); },
    batch: () => { const ops = []; return { update: (ref, data) => ops.push({ id: ref.id, data }), commit: async () => commits.push(ops) }; }
  };
}

test('migration dry run writes nothing; apply updates only stale docs across pages', async () => {
  const users = {};
  for (let i = 0; i < 650; i++) users[`u${String(i).padStart(4, '0')}`] = { displayName: `Friend ${i}`, username: `friend${i}` };
  users.legacy = { displayName: 'Sebastian', username: 'sebas', searchTerms: ['s'] };
  users.done = { displayName: 'Kai', username: 'kai', searchableArray: buildSearchableArray('Kai', 'kai') };

  const dry = fakeDb(users);
  const dryStats = await runMigration(dry, { log: () => {} });
  assert.equal(dry.commits.length, 0);
  assert.deepEqual(dryStats, { scanned: 652, updated: 651, unchanged: 1, emptyProfile: 0 });

  const live = fakeDb(users);
  await runMigration(live, { apply: true, log: () => {} });
  const written = live.commits.flat();
  assert.equal(written.length, 651);
  assert.ok(live.commits.every(ops => ops.length <= 500), 'respects batch limit');
  assert.ok(!written.some(op => op.id === 'done'));
  const legacy = written.find(op => op.id === 'legacy');
  assert.deepEqual(Object.keys(legacy.data), ['searchableArray'], 'only touches the index field');
  assert.ok(legacy.data.searchableArray.includes('sebas'));
});
