#!/usr/bin/env node
/**
 * One-time migration: backfill `searchableArray` (friend-search n-grams) on every
 * document in the `users` collection, built from `displayName` and `username`.
 *
 * Safe to re-run: documents whose array is already correct are skipped. Only the
 * `searchableArray` field is written; legacy fields (e.g. `searchTerms`) are untouched.
 *
 * Usage:
 *   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
 *   npm run migrate:search              # dry run, reports what would change
 *   npm run migrate:search -- --apply   # writes changes
 * Options: --project <id> (default: crystal-wishlist)
 */
import { pathToFileURL } from 'node:url';
import { buildSearchableArray, searchableArrayMatches } from '../src/utils/search.js';

const PAGE_SIZE = 300; // also the max writes per batch (Firestore limit is 500)

/** Returns the new array if the user doc needs an update, otherwise null. */
export function planUpdate(data = {}) {
  const searchableArray = buildSearchableArray(data.displayName, data.username);
  return searchableArrayMatches(data.searchableArray, searchableArray) ? null : searchableArray;
}

export async function runMigration(db, { apply = false, log = console.log } = {}) {
  const stats = { scanned: 0, updated: 0, unchanged: 0, emptyProfile: 0 };
  let cursor = null;
  for (;;) {
    let page = db.collection('users').orderBy('__name__').limit(PAGE_SIZE);
    if (cursor) page = page.startAfter(cursor);
    const snapshot = await page.get();
    if (snapshot.empty) break;

    const batch = db.batch();
    let writes = 0;
    for (const userDoc of snapshot.docs) {
      stats.scanned++;
      const next = planUpdate(userDoc.data());
      if (!next) { stats.unchanged++; continue; }
      if (!next.length) stats.emptyProfile++;
      stats.updated++;
      log(`${apply ? 'update' : 'would update'} users/${userDoc.id} (${next.length} terms)`);
      if (apply) { batch.update(userDoc.ref, { searchableArray: next }); writes++; }
    }
    if (writes) await batch.commit();
    cursor = snapshot.docs[snapshot.docs.length - 1];
    if (snapshot.size < PAGE_SIZE) break;
  }
  log(`${apply ? 'Done' : 'Dry run complete'}: ${JSON.stringify(stats)}`);
  if (!apply && stats.updated) log('Re-run with --apply to write these changes.');
  return stats;
}

async function main(argv) {
  const apply = argv.includes('--apply');
  const projectFlag = argv.indexOf('--project');
  const projectId = projectFlag >= 0 ? argv[projectFlag + 1] : process.env.GCLOUD_PROJECT || 'crystal-wishlist';
  const { initializeApp, applicationDefault } = await import('firebase-admin/app');
  const { getFirestore } = await import('firebase-admin/firestore');
  initializeApp({ credential: applicationDefault(), projectId });
  console.log(`Project: ${projectId} | mode: ${apply ? 'APPLY' : 'dry run'}`);
  await runMigration(getFirestore(), { apply });
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  main(process.argv.slice(2)).catch(error => { console.error(error); process.exitCode = 1; });
}
