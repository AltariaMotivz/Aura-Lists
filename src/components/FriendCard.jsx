import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import styles from './FriendCard.module.css';

const THEME_ACCENTS = {
  Birthday: '🎂',
  Wedding: '💍',
  Holiday: '🎄',
  Tech: '💻',
  Books: '📚',
  Default: '✨'
};

const formatDisplayName = (nameOrPhone) => {
  if (!nameOrPhone) return 'Unknown';
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (phoneRegex.test(nameOrPhone)) {
    const lastFour = nameOrPhone.slice(-4);
    return `User-...${lastFour}`;
  }
  return nameOrPhone;
};

const FriendCard = ({ friend }) => {
  const [topItem, setTopItem] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchTopItem = async () => {
      try {
        const q = query(collection(db, 'wishlist'), where('userId', '==', friend.id));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return;

        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Client-side sort to avoid composite index requirements
        items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        if (isMounted && items.length > 0) {
          setTopItem(items[0]);
        }
      } catch (err) {
        console.error("Failed to fetch hologram item", err);
      }
    };

    fetchTopItem();

    return () => {
      isMounted = false;
    };
  }, [friend.id]);

  return (
    <div className={styles.friendCard}>
      
      {/* 3D Hologram Projection */}
      {topItem && (
        <div className={styles.hologramContainer}>
          {topItem.imageURL ? (
            <img src={topItem.imageURL} alt={topItem.name} className={styles.hologramImage} />
          ) : (
            <div className={styles.hologramPlaceholder}>
              {THEME_ACCENTS[topItem.theme] || THEME_ACCENTS.Default}
            </div>
          )}
        </div>
      )}

      {/* Deep Water Glass Avatar */}
      <div className={styles.avatar}>
        {friend.photoURL ? (
          <img src={friend.photoURL} alt={friend.displayName} />
        ) : (
          <span>{formatDisplayName(friend.displayName).charAt(0)}</span>
        )}
      </div>

      <h3 className={styles.name}>{formatDisplayName(friend.displayName)}</h3>
      
      {friend.username && friend.username.trim() !== '' && (
        <p className={styles.username}>@{friend.username}</p>
      )}

    </div>
  );
};

export default FriendCard;
