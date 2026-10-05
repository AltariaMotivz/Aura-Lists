import React, { useState } from 'react';
import styles from './ParticleCanvas.module.css';

export default function ParticleCanvas() {
  const [particles] = useState(() => Array.from({ length: 26 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: `${i % 4 === 0 ? 35 + Math.random() * 50 : 5 + Math.random() * 13}px`,
    duration: `${18 + Math.random() * 20}s`,
    delay: `${Math.random() * -38}s`,
    drift: `${Math.random() * 100 - 50}px`,
    hue: i % 3 === 0 ? '0, 255, 255' : i % 3 === 1 ? '255, 0, 255' : '167, 139, 250'
  })));
  return <div aria-hidden="true" className={styles.particleContainer}>
    {particles.map(p => <div key={p.id} className={styles.particle} style={{ left: p.left, width: p.size, height: p.size, '--duration': p.duration, '--delay': p.delay, '--drift': p.drift, '--bubble-color': p.hue }} />)}
  </div>;
}
