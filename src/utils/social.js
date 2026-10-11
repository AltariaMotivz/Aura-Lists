/**
 * Returns a human-readable relative time string (e.g. "Just now", "5m ago", "2h ago", "3d ago").
 */
export function formatRelativeTime(dateInput) {
  if (!dateInput) return '';
  const timestamp = typeof dateInput?.toMillis === 'function'
    ? dateInput.toMillis()
    : new Date(dateInput).getTime();

  if (!Number.isFinite(timestamp)) return '';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 45) return 'Just now';
  if (seconds < 3600) return `${Math.max(1, Math.floor(seconds / 60))}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

let cachedTools = null;
async function getFirestoreTools() {
  if (cachedTools) return cachedTools;
  const { db } = await import('../firebase.js');
  const firestore = await import('firebase/firestore');
  cachedTools = { db, ...firestore };
  return cachedTools;
}

/**
 * Follows a user:
 * 1. Adds target to current user's 'friends' (following) list.
 * 2. Adds current user to target's 'followers' list.
 * 3. Creates a new follow notification for the target user.
 */
export async function followUser(currentUser, targetUserId) {
  if (!currentUser?.uid || !targetUserId || currentUser.uid === targetUserId) return;
  const { db, doc, setDoc, collection, addDoc } = await getFirestoreTools();

  const now = new Date().toISOString();

  // 1. Register in current user's following list (stored in 'friends' for backwards compatibility)
  await setDoc(doc(db, 'users', currentUser.uid, 'friends', targetUserId), {
    addedAt: now
  });

  // 2. Register in target user's followers list
  await setDoc(doc(db, 'users', targetUserId, 'followers', currentUser.uid), {
    followerId: currentUser.uid,
    followedAt: now
  });

  // 3. Dispatch follow notification to the target user's notifications subcollection
  try {
    await addDoc(collection(db, 'users', targetUserId, 'notifications'), {
      type: 'follow',
      senderId: currentUser.uid,
      senderName: currentUser.displayName || '',
      senderUsername: currentUser.username || '',
      senderPhotoURL: currentUser.photoURL || '',
      createdAt: now,
      read: false
    });
  } catch (err) {
    // Notification creation is best-effort and shouldn't block the follow if firestore rules lag
    console.error('Failed to create follow notification:', err);
  }
}

/**
 * Unfollows a user:
 * 1. Removes target from current user's 'friends' (following) list.
 * 2. Removes current user from target's 'followers' list.
 */
export async function unfollowUser(currentUserId, targetUserId) {
  if (!currentUserId || !targetUserId) return;
  const { db, doc, deleteDoc } = await getFirestoreTools();

  await Promise.allSettled([
    deleteDoc(doc(db, 'users', currentUserId, 'friends', targetUserId)),
    deleteDoc(doc(db, 'users', targetUserId, 'followers', currentUserId))
  ]);
}

/**
 * Marks a single notification as read.
 */
export async function markNotificationAsRead(userId, notificationId) {
  if (!userId || !notificationId) return;
  const { db, doc, updateDoc } = await getFirestoreTools();
  const notifRef = doc(db, 'users', userId, 'notifications', notificationId);
  await updateDoc(notifRef, { read: true });
}

/**
 * Marks all provided notifications as read via batch write.
 */
export async function markAllNotificationsAsRead(userId, notificationIds = []) {
  if (!userId || !notificationIds.length) return;
  const { db, doc, writeBatch } = await getFirestoreTools();
  const batch = writeBatch(db);
  for (const id of notificationIds) {
    const notifRef = doc(db, 'users', userId, 'notifications', id);
    batch.update(notifRef, { read: true });
  }
  await batch.commit();
}
