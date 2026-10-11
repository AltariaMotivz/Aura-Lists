#!/usr/bin/env node
/**
 * Migration script: Backfill `followers` subcollections for all existing friendships.
 *
 * For every `users/{userA}/friends/{userB}`, ensures there is a corresponding
 * `users/{userB}/followers/{userA}` document with { followerId: userA, followedAt }.
 *
 * Usage:
 *   node scripts/migrate-followers.mjs            # Dry run: shows what would be created
 *   node scripts/migrate-followers.mjs --apply    # Live run: creates the follower documents
 */

import fs from 'node:fs';
import path from 'node:path';

function getAccessToken() {
  // 1. Check GOOGLE_APPLICATION_CREDENTIALS or gcloud access token if available
  if (process.env.FIREBASE_TOKEN) return process.env.FIREBASE_TOKEN;
  
  // 2. Read from firebase-tools configstore
  const configPath = path.join(process.env.HOME, '.config/configstore/firebase-tools.json');
  if (fs.existsSync(configPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (data.tokens?.access_token) {
        return data.tokens.access_token;
      }
    } catch {}
  }
  return null;
}

const PROJECT_ID = 'crystal-wishlist';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function fetchAllUsers(token) {
  let users = [];
  let pageToken = null;
  do {
    const url = new URL(`${BASE_URL}/users`);
    url.searchParams.set('pageSize', '100');
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.error) {
      throw new Error(`Error fetching users: ${data.error.message || JSON.stringify(data.error)}`);
    }
    if (data.documents) {
      users = users.concat(data.documents);
    }
    pageToken = data.nextPageToken;
  } while (pageToken);
  return users;
}

async function fetchSubcollection(token, parentDocPath, subcollectionName) {
  let docs = [];
  let pageToken = null;
  do {
    const url = new URL(`https://firestore.googleapis.com/v1/${parentDocPath}/${subcollectionName}`);
    url.searchParams.set('pageSize', '100');
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.documents) {
      docs = docs.concat(data.documents);
    }
    pageToken = data.nextPageToken;
  } while (pageToken);
  return docs;
}

async function createFollowerDoc(token, targetUserId, followerUserId, followedAt) {
  const url = `${BASE_URL}/users/${targetUserId}/followers?documentId=${followerUserId}`;
  const body = {
    fields: {
      followerId: { stringValue: followerUserId },
      followedAt: { stringValue: followedAt || new Date().toISOString() }
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json();
    // If it already exists (ALREADY_EXISTS 409), treat as success
    if (res.status === 409 || err.error?.status === 'ALREADY_EXISTS') {
      return { status: 'already_exists' };
    }
    throw new Error(`Failed to create follower doc: ${JSON.stringify(err)}`);
  }
  return { status: 'created' };
}

async function main() {
  const apply = process.argv.includes('--apply');
  const token = getAccessToken();
  if (!token) {
    console.error('Could not find Firebase access token.');
    process.exit(1);
  }

  console.log(`Starting followers migration on project '${PROJECT_ID}' [mode: ${apply ? 'APPLY' : 'DRY RUN'}]...`);

  const users = await fetchAllUsers(token);
  console.log(`Scanned ${users.length} users.`);

  let totalRelationshipsFound = 0;
  let createdCount = 0;
  let alreadyExistCount = 0;

  for (const userDoc of users) {
    const userDocPath = userDoc.name;
    const userParts = userDocPath.split('/');
    const userA_id = userParts[userParts.length - 1];

    // Get all friends (people userA is following)
    const friends = await fetchSubcollection(token, userDocPath, 'friends');
    if (!friends.length) continue;

    for (const friendDoc of friends) {
      totalRelationshipsFound++;
      const friendParts = friendDoc.name.split('/');
      const userB_id = friendParts[friendParts.length - 1];
      const followedAt = friendDoc.fields?.addedAt?.stringValue || new Date().toISOString();

      // userA is following userB, so userA should be in userB's followers
      console.log(`Friendship found: ${userA_id} -> following -> ${userB_id}`);

      if (apply) {
        const result = await createFollowerDoc(token, userB_id, userA_id, followedAt);
        if (result.status === 'created') {
          createdCount++;
          console.log(`  ✔ Created follower doc: users/${userB_id}/followers/${userA_id}`);
        } else {
          alreadyExistCount++;
          console.log(`  • Already exists: users/${userB_id}/followers/${userA_id}`);
        }
      } else {
        console.log(`  [dry run] Would create follower doc: users/${userB_id}/followers/${userA_id}`);
      }
    }
  }

  console.log('\n--- Migration Summary ---');
  console.log(`Total friendships scanned: ${totalRelationshipsFound}`);
  if (apply) {
    console.log(`Follower documents created: ${createdCount}`);
    console.log(`Follower documents already existed: ${alreadyExistCount}`);
    console.log('Migration completed successfully!');
  } else {
    console.log(`Would create ${totalRelationshipsFound} follower documents.`);
    console.log('Run with --apply to execute the migration.');
  }
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
