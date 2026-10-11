import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';

export default function useFollowers(userId) {
  const [followers, setFollowers] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(true);

  useEffect(() => {
    if (!userId) {
      setFollowers([]);
      setLoadingFollowers(false);
      return;
    }

    let isMounted = true;
    let latestRequest = 0;
    const followersRef = collection(db, 'users', userId, 'followers');

    const unsubscribe = onSnapshot(followersRef, async (snapshot) => {
      if (!isMounted) return;
      const request = ++latestRequest;

      const results = await Promise.allSettled(
        snapshot.docs.map(async (d) => {
          const profileDoc = await getDoc(doc(db, 'users', d.id));
          return profileDoc.exists()
            ? { id: profileDoc.id, ...profileDoc.data(), followedAt: d.data().followedAt }
            : null;
        })
      );

      if (isMounted && request === latestRequest) {
        const validFollowers = results
          .filter(r => r.status === 'fulfilled')
          .map(r => r.value)
          .filter(Boolean);

        validFollowers.sort((a, b) => {
          const nameA = (a.displayName || '').toLowerCase();
          const nameB = (b.displayName || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });

        setFollowers(validFollowers);
        setLoadingFollowers(false);
      }
    }, (err) => {
      console.error('Error fetching followers:', err);
      if (isMounted) setLoadingFollowers(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [userId]);

  return { followers, loadingFollowers };
}
