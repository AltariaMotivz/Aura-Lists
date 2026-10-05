import React from 'react';
import styles from '../pages/FriendWishlist.module.css';

const SkeletonGrid = ({ count = 6 }) => {
  return (
    <div role="status" aria-label="Loading wishes" className={styles.wishlistGrid}>
      {Array.from({ length: count }).map((_, i) => (
        <div aria-hidden="true" key={i} className={styles.skeletonCard} />
      ))}
    </div>
  );
};

export default SkeletonGrid;
