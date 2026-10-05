import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { subscribeWishSources } from '../utils/wishSubscriptions';

export default function useWishes(ownerIds) {
  const key = JSON.stringify([...new Set(ownerIds.filter(Boolean))].sort());
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ items: [], loading: true, error: false });
  useEffect(() => subscribeWishSources(JSON.parse(key), (name, ids, next, fail) => {
    const field = name === 'wishes' ? 'ownerId' : 'userId';
    // Batch friends to reduce listener count without requiring a new composite index.
    const filter = ids.length === 1 ? where(field, '==', ids[0]) : where(field, 'in', ids);
    return onSnapshot(query(collection(db, name), filter), snapshot => {
      next(snapshot.docs.map(document => ({ ...document.data(), id: document.id, collectionName: name })));
    }, fail);
  }, setState), [key, attempt]);
  return { ...state, retry: () => setAttempt(value => value + 1) };
}
