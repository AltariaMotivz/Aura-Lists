import React from 'react';
import styles from '../pages/FriendWishlist.module.css';

const SkeletonGrid = ({ count = 6 }) => {
  return (
    <div className={styles.wishlistGrid}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.skeletonCard} />
      ))}
    </div>
  );
};

export default SkeletonGrid;
