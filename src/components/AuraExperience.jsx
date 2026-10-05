import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Sparkles, Waves } from 'lucide-react';
import ParticleCanvas from './ParticleCanvas';

const ExperienceContext = createContext(null);
export const useExperience = () => useContext(ExperienceContext);

export function EnergyToggle() {
  const { vivid, toggle } = useExperience();
  return <button type="button" className="aura-energy" onClick={toggle} aria-pressed={vivid} aria-label={vivid ? 'Switch to calm motion' : 'Switch to vivid motion'}>
    {vivid ? <Sparkles size={16} aria-hidden="true" /> : <Waves size={16} aria-hidden="true" />}
    <span>{vivid ? 'Vivid' : 'Calm'}</span>
  </button>;
}

export default function AuraExperience({ children }) {
  const [vivid, setVivid] = useState(() => {
    try { return localStorage.getItem('aura-energy') !== 'calm'; } catch { return true; }
  });
  const atmosphere = useRef(null);
  const effects = useRef(null);
  useEffect(() => {
    document.documentElement.dataset.energy = vivid ? 'vivid' : 'calm';
    try { localStorage.setItem('aura-energy', vivid ? 'vivid' : 'calm'); } catch { /* Preference is optional. */ }
  }, [vivid]);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let latest = { x: 50, y: 50 };
    const move = event => {
      if (reduced.matches || !vivid || event.pointerType !== 'mouse') return;
      latest = { x: event.clientX / window.innerWidth * 100, y: event.clientY / window.innerHeight * 100 };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        atmosphere.current?.style.setProperty('--aura-x', `${latest.x}%`);
        atmosphere.current?.style.setProperty('--aura-y', `${latest.y}%`);
        frame = 0;
      });
    };
    const effectRoot = effects.current;
    const activeDots = new Set();
    const emitBurst = (x, y, count, layer) => {
      if (reduced.matches || !vivid || !layer || activeDots.size + count > 48) return;
      for (let i = 0; i < count; i++) {
        const dot = document.createElement('i');
        dot.className = 'aura-spark';
        dot.setAttribute('aria-hidden', 'true');
        dot.style.left = `${x}px`;
        dot.style.top = `${y}px`;
        dot.style.background = ['var(--color-accent-primary)', 'rgb(var(--aura-alt-rgb))', 'rgb(var(--aura-secondary-rgb))'][i % 3];
        layer.appendChild(dot);
        activeDots.add(dot);
        const angle = i / count * Math.PI * 2;
        const distance = count > 8 ? 110 : 58;
        const animation = dot.animate([
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
          { transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px)) scale(0)`, opacity: 0 }
        ], { duration: count > 8 ? 1000 : 650, easing: 'cubic-bezier(.16,1,.3,1)' });
        animation.onfinish = () => { dot.remove(); activeDots.delete(dot); };
      }
    };
    const burst = event => {
      const control = event.target instanceof Element && event.target.closest('button, a.btn-glossy, [role="button"]');
      if (!control || control.disabled || control.closest('[data-no-burst]')) return;
      const rect = control.getBoundingClientRect();
      const x = event.detail === 0 ? rect.left + rect.width / 2 : event.clientX;
      const y = event.detail === 0 ? rect.top + rect.height / 2 : event.clientY;
      // Native dialogs live above normal z-index layers, so render their sparks inside them.
      emitBurst(x, y, 8, control.closest('dialog') || effectRoot);
    };
    const celebrate = () => emitBurst(window.innerWidth / 2, window.innerHeight * .4, 24, effectRoot);
    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('click', burst);
    window.addEventListener('aura-wish-saved', celebrate);
    return () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('click', burst);
      window.removeEventListener('aura-wish-saved', celebrate);
      cancelAnimationFrame(frame);
      activeDots.forEach(dot => dot.remove());
      effectRoot?.replaceChildren();
    };
  }, [vivid]);
  return <ExperienceContext.Provider value={{ vivid, toggle: () => setVivid(value => !value) }}>
    <div className="aura-atmosphere" ref={atmosphere} aria-hidden="true"><div className="aura-light aura-light--cyan" /><div className="aura-light aura-light--pink" /><div className="aura-orbit-grid" /><div className="aura-pointer-light" /></div>
    <ParticleCanvas />
    <div className="aura-effects" ref={effects} aria-hidden="true" />
    {children}
  </ExperienceContext.Provider>;
}
