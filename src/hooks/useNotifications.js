import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { markNotificationAsRead, markAllNotificationsAsRead } from '../utils/social';

export default function useNotifications() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const notifRef = collection(db, 'users', currentUser.uid, 'notifications');
    let unsubscribe;

    const processSnapshot = (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Ensure client-side sort newest first
      items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setNotifications(items);
      setLoading(false);
    };

    try {
      // Primary attempt: with server ordering
      const q = query(notifRef, orderBy('createdAt', 'desc'), limit(30));
      unsubscribe = onSnapshot(q, processSnapshot, (err) => {
        console.warn('Notifications ordered query error, falling back to simple query', err);
        // Fallback without orderBy to handle any missing index gracefully
        unsubscribe = onSnapshot(notifRef, processSnapshot, () => {
          setLoading(false);
        });
      });
    } catch {
      unsubscribe = onSnapshot(notifRef, processSnapshot, () => {
        setLoading(false);
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser?.uid]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = async (id) => {
    if (!currentUser?.uid) return;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await markNotificationAsRead(currentUser.uid, id);
  };

  const markAllRead = async () => {
    if (!currentUser?.uid) return;
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (!unreadIds.length) return;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await markAllNotificationsAsRead(currentUser.uid, unreadIds);
  };

  return {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead
  };
}
