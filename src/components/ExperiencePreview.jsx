import React, { useState } from 'react';
import { Plus, X, Check, Sparkles } from 'lucide-react';
import Dialog from './Dialog';
import WishCard from './WishCard';
import { EnergyToggle } from './AuraExperience';

const SAMPLES = [
  { id: 'sample-1', name: 'Soundtrack to another dimension', theme: 'Tech', price: '129', notes: 'Noise-cancelling headphones. For getting lost in a favorite album.' },
  { id: 'sample-2', name: 'A story I can disappear into', theme: 'Books', price: '24', notes: 'A beautiful book, a quiet afternoon, and absolutely no notifications.' },
  { id: 'sample-3', name: 'A little birthday magic', theme: 'Birthday', price: '45', notes: 'Something unexpected. Something very me.' }
];
export default function ExperiencePreview({ onClose }) {
  const [items, setItems] = useState(SAMPLES);
  const [filter, setFilter] = useState('All');
  const [added, setAdded] = useState(false);
  const [notice, setNotice] = useState('');
  const addSample = () => {
    if (added) return;
    setItems(previous => [{ id: 'sample-extra', name: 'The next great adventure', theme: 'Holiday', price: '75', notes: 'A day worth remembering. This is a sample wish.' }, ...previous]);
    setFilter('All');
    setAdded(true);
    setNotice('A new possibility added to your sample universe.');
  };
  return <Dialog onClose={onClose} labelledBy="experience-title" className="aura-preview-dialog">
    <header className="aura-preview-header"><div><span className="aura-eyebrow">Your playground</span><h2 id="experience-title">Meet your next obsession.</h2></div><button className="aura-icon" onClick={onClose} aria-label="Close preview"><X size={22} /></button></header>
    <p className="aura-preview-description">Try the cards, add a sample wish, and play with the energy. This preview stays on your device.</p>
    <div className="aura-preview-tools"><div className="aura-filter-tabs" aria-label="Filter sample wishes">{['All', 'Tech', 'Books', 'Birthday'].map(category => <button type="button" key={category} aria-pressed={filter === category} onClick={() => setFilter(category)}>{category}</button>)}</div><EnergyToggle /></div>
    <div className="aura-preview-list">{items.filter(item => filter === 'All' || item.theme === filter).map(item => <WishCard key={item.id} item={item} isOwner={false} />)}</div>
    <div className="aura-preview-footer"><span><Sparkles size={16} aria-hidden="true" /> Sample wishes. Real energy.</span><button className="btn-primary" onClick={addSample} disabled={added}>{added ? <Check size={18} /> : <Plus size={18} />}{added ? 'Wish added' : 'Add a sample wish'}</button></div>
    <p className="aura-preview-notice" role="status">{notice}</p>
  </Dialog>;
}
