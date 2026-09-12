import React from 'react';
import styles from './Anomalies.module.css';

export const CrystalOrbEffect = () => {
  // Generate 6 randomized orbs
  const orbs = Array.from({ length: 6 }).map((_, i) => ({
    id: i,
    size: Math.random() * 40 + 20 + 'px',
    left: Math.random() * 80 + 10 + '%',
    animationDuration: Math.random() * 3 + 4 + 's',
    animationDelay: Math.random() * 2 + 's',
  }));

  return (
    <div className={styles.orbContainer}>
      {orbs.map(orb => (
        <div 
          key={orb.id} 
          className={styles.crystalBubble}
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.left,
            animationDuration: orb.animationDuration,
            animationDelay: orb.animationDelay
          }}
        />
      ))}
    </div>
  );
};

export const LightningSwordEffect = () => {
  return (
    <div className={styles.lightningContainer}>
      <svg className={styles.lightningSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
        <path 
          className={styles.lightningPath} 
          d="M 10 10 L 30 40 L 20 60 L 50 90 L 60 70 L 40 50 Z" 
        />
        <path 
          className={`${styles.lightningPath} ${styles.delay1}`} 
          d="M 90 20 L 70 50 L 80 60 L 50 80 L 60 50 Z" 
        />
        <path 
          className={`${styles.lightningPath} ${styles.delay2}`} 
          d="M 20 80 L 40 70 L 30 40 L 70 30" 
        />
      </svg>
    </div>
  );
};
