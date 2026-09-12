import React from 'react';
import styles from './ParticleCanvas.module.css';

const ParticleCanvas = () => {
  // Generate 40 particles for the nebula effect
  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100 + '%',
    size: Math.random() * 4 + 2 + 'px',
    animationDuration: Math.random() * 10 + 15 + 's',
    animationDelay: Math.random() * -25 + 's',
    opacity: Math.random() * 0.5 + 0.3
  }));

  return (
    <div className={styles.particleContainer}>
      {particles.map(p => (
        <div 
          key={p.id} 
          className={styles.particle}
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay,
            opacity: p.opacity
          }}
        />
      ))}
    </div>
  );
};

export default ParticleCanvas;
