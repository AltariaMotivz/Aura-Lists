import { wishTime } from './wishSubscriptions.js';

/**
 * Returns true if the value is a valid positive integer priority.
 */
export const isValidPriority = (val) => Number.isInteger(val) && val > 0;

/**
 * Compares two wishes so that:
 * 1. Prioritized wishes (#1, #2, #3...) come first in ascending numerical order.
 * 2. Unprioritized wishes (null, undefined, 0) are placed at the bottom, ordered by newest added date.
 */
export function compareWishesByPriority(a, b) {
  const hasA = isValidPriority(a?.priority);
  const hasB = isValidPriority(b?.priority);

  if (hasA && hasB) {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return wishTime(b?.createdAt) - wishTime(a?.createdAt);
  }
  if (hasA) return -1;
  if (hasB) return 1;
  return wishTime(b?.createdAt) - wishTime(a?.createdAt);
}

/**
 * Returns aesthetic badge metadata for a given priority rank.
 */
export function getPriorityBadgeInfo(priority) {
  if (!isValidPriority(priority)) return null;

  if (priority === 1) {
    return {
      rank: 1,
      label: 'Dream Wish',
      fullLabel: '#1 Dream Wish',
      icon: '👑',
      tier: 'crown',
      className: 'aura-priority-crown'
    };
  }
  if (priority === 2) {
    return {
      rank: 2,
      label: 'Most Wanted',
      fullLabel: '#2 Most Wanted',
      icon: '✨',
      tier: 'radiant',
      className: 'aura-priority-radiant'
    };
  }
  return {
    rank: priority,
    label: `#${priority} Priority`,
    fullLabel: `#${priority} Priority`,
    icon: '💫',
    tier: 'harmonic',
    className: 'aura-priority-harmonic'
  };
}

/**
 * Calculates atomic updates for a user's wishes when one wish changes priority,
 * guaranteeing that NO TWO WISHES CAN HAVE THE SAME RANK.
 *
 * Rules:
 * - If target is set to newRank (e.g. 2):
 *   Any existing wish at or above newRank shifts down by +1.
 *   The entire ranked set is re-indexed strictly 1..K (no duplicate ranks, no gaps).
 * - If newRank is null / 0 / undefined:
 *   Target's priority is set to null, and remaining ranked items shift up to close gaps.
 *
 * Returns an array of { id, collectionName, priority } for documents whose priority changed.
 */
export function calculatePriorityUpdates(allWishes, targetWishId, newRank) {
  const wishes = Array.isArray(allWishes) ? allWishes : [];
  const target = wishes.find(w => w.id === targetWishId);
  const collectionName = target?.collectionName || 'wishes';

  // Extract other currently-ranked items in order
  const otherRanked = wishes
    .filter(w => w.id !== targetWishId && isValidPriority(w.priority))
    .sort((a, b) => a.priority - b.priority);

  let newRankedList = [];

  if (isValidPriority(newRank)) {
    // Insert target at target rank position (clamped between 1 and otherRanked.length + 1)
    const clampedRank = Math.max(1, Math.min(newRank, otherRanked.length + 1));
    const insertIndex = clampedRank - 1;

    newRankedList = [
      ...otherRanked.slice(0, insertIndex),
      { id: targetWishId, collectionName },
      ...otherRanked.slice(insertIndex)
    ];
  } else {
    // Cleared / unranked
    newRankedList = otherRanked;
  }

  // Assign strict 1..K ranks to newRankedList
  const nextPriorityMap = new Map();
  newRankedList.forEach((item, index) => {
    nextPriorityMap.set(item.id, index + 1);
  });

  // Target item if not in newRankedList gets null
  if (!isValidPriority(newRank)) {
    nextPriorityMap.set(targetWishId, null);
  }

  // Calculate diffs
  const updates = [];
  for (const [id, nextP] of nextPriorityMap.entries()) {
    const existing = wishes.find(w => w.id === id);
    const existingPriority = isValidPriority(existing?.priority) ? existing.priority : null;
    const targetP = nextP === null ? null : nextP;

    if (existingPriority !== targetP) {
      updates.push({
        id,
        collectionName: existing?.collectionName || collectionName,
        priority: targetP
      });
    }
  }

  return updates;
}

/**
 * Reorders a set of wishes given an explicit list of IDs in ranked order.
 * Items in newOrderedIds get priorities 1, 2, 3...
 * Any previously-ranked item not in newOrderedIds has its priority cleared to null.
 */
export function reorderPrioritizedWishes(allWishes, newOrderedIds) {
  const wishes = Array.isArray(allWishes) ? allWishes : [];
  const validOrderedIds = (newOrderedIds || []).filter(Boolean);

  const nextPriorityMap = new Map();
  validOrderedIds.forEach((id, index) => {
    nextPriorityMap.set(id, index + 1);
  });

  // Any wish that previously had a priority but is no longer in the list gets set to null
  wishes.forEach(w => {
    if (isValidPriority(w.priority) && !nextPriorityMap.has(w.id)) {
      nextPriorityMap.set(w.id, null);
    }
  });

  const updates = [];
  for (const [id, nextP] of nextPriorityMap.entries()) {
    const existing = wishes.find(w => w.id === id);
    const existingPriority = isValidPriority(existing?.priority) ? existing.priority : null;
    if (existingPriority !== nextP) {
      updates.push({
        id,
        collectionName: existing?.collectionName || 'wishes',
        priority: nextP
      });
    }
  }

  return updates;
}

/**
 * Commits calculated priority updates atomically to Firestore in a batch write.
 */
export async function commitPriorityUpdates(db, updates) {
  if (!updates || !updates.length) return;
  const { doc, writeBatch } = await import('firebase/firestore');
  const batch = writeBatch(db);
  for (const update of updates) {
    const docRef = doc(db, update.collectionName || 'wishes', update.id);
    batch.update(docRef, { priority: update.priority });
  }
  await batch.commit();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('aura-wish-saved'));
  }
}

/**
 * Applies a priority change to targetWishId and shifts any conflicting ranks,
 * writing the atomic updates to Firestore.
 */
export async function applyPriorityChange(db, allWishes, targetWishId, newRank) {
  const updates = calculatePriorityUpdates(allWishes, targetWishId, newRank);
  await commitPriorityUpdates(db, updates);
  return updates;
}

/**
 * Applies a new explicit order of prioritized wish IDs to Firestore.
 */
export async function applyReorderedPriorities(db, allWishes, orderedIds) {
  const updates = reorderPrioritizedWishes(allWishes, orderedIds);
  await commitPriorityUpdates(db, updates);
  return updates;
}

