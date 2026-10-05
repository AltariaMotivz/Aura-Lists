import React, { useState, useEffect } from 'react';
import useWishes from '../hooks/useWishes';
import { useAuth } from '../contexts/AuthContext';
import { useOutletContext } from 'react-router-dom';
import WishlistGrid from '../components/WishlistGrid';
import AddWishModal from '../components/AddWishModal';
import { Plus, Search, Sparkles, Check } from 'lucide-react';

const MyWishlist = () => {
  const { currentUser } = useAuth();
  const { activeCategory, setActiveCategory } = useOutletContext();
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState(false);
  const {items, loading, error, retry} = useWishes([currentUser?.uid]);
  const [showAddModal, setShowAddModal] = useState(false);


  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), 4000);
    return () => clearTimeout(timer);
  }, [saved]);

  useEffect(() => { setActiveCategory('All'); }, [currentUser?.uid, setActiveCategory]);

  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.theme === activeCategory || item.tags?.includes(activeCategory);
    return matchesCategory && `${item.name || ''} ${item.notes || ''}`.toLowerCase().includes(search.toLowerCase().trim());
  });

  return (
    <div className="aura-enter" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div className="aura-wish-heading">
        <div><span className="aura-eyebrow"><Sparkles size={14} aria-hidden="true" /> Your universe</span><h2>What lights you up?</h2><p>Big dreams, little obsessions, and everything in between.</p></div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}><Plus size={18} aria-hidden="true" /> Add a wish</button>
      </div>
      <div className="aura-list-controls"><label className="aura-wish-search"><Search size={17} aria-hidden="true" /><input type="search" aria-label="Search your wishes" placeholder="Find your next obsession…" value={search} onChange={event => setSearch(event.target.value)} /></label><div className="aura-wish-count"><span>{filteredItems.length}</span> {filteredItems.length === 1 ? 'possibility' : 'possibilities'}</div></div>
      {error && <p role="alert" className="aura-error">Some wishes could not load. <button className="btn-glossy" onClick={retry}>Try again</button></p>}
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Summoning your wishes...</p>
      ) : (
        filteredItems.length === 0 && items.length > 0 ? <div className="glass-panel aura-empty-state"><Sparkles size={32} aria-hidden="true" /><h3>Still out there somewhere.</h3><p>No wishes match this search. Try a different word or occasion.</p><button className="btn-glossy" onClick={() => { setSearch(''); setActiveCategory('All'); }}>Show all my wishes</button></div> : <WishlistGrid items={filteredItems} isOwner={true} isGuest={false} onAddWish={items.length === 0 ? () => setShowAddModal(true) : undefined} />
      )}

      {showAddModal && <AddWishModal onClose={() => setShowAddModal(false)} onAdded={() => setSaved(true)} />}
    {saved && <div role="status" className="aura-success-toast"><Check size={18} aria-hidden="true" /> Your wish is out in the universe.</div>}
    </div>
  );
};

export default MyWishlist;
