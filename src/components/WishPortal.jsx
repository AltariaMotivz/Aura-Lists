import React from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export default function WishPortal({ onExplore }) {
  return <section className="wish-portal" aria-labelledby="portal-title">
    <div className="aura-eyebrow"><span /> A universe of possibilities</div>
    <h1 id="portal-title">Big dreams.<br /><span className="aura-liquid-text">Little wishes.</span></h1>
    <p>Collect what lights you up. Discover what makes them smile. A little magic, all in one place.</p>
    <button type="button" className="portal-art" onClick={onExplore} aria-label="Explore an interactive sample wishlist">
      <span className="portal-ring portal-ring--one" /><span className="portal-ring portal-ring--two" /><span className="portal-ring portal-ring--three" />
      <span className="portal-core"><Sparkles size={52} strokeWidth={1} aria-hidden="true" /></span>
      <span className="portal-chip portal-chip--one"><span>🎧</span> A new obsession</span>
      <span className="portal-chip portal-chip--two"><span>✨</span> A little possibility</span>
      <span className="portal-chip portal-chip--three"><span>🎁</span> Their perfect gift</span>
      <span className="portal-invitation">Tap into your universe <ArrowUpRight size={15} aria-hidden="true" /></span>
    </button>
    <button className="btn-glossy aura-explore" type="button" onClick={onExplore}><Sparkles size={17} aria-hidden="true" /> Explore the vibe <ArrowUpRight size={17} aria-hidden="true" /></button>
  </section>;
}
