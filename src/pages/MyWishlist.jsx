import React, { useState, useEffect } from 'react';
import useWishes from '../hooks/useWishes';
import { useAuth } from '../contexts/AuthContext';
import { useOutletContext, Link } from 'react-router-dom';
import WishlistGrid from '../components/WishlistGrid';
import AddWishModal from '../components/AddWishModal';
import PrioritizeOrbitModal from '../components/PrioritizeOrbitModal';
import { Plus, Search, Sparkles, Check, Archive, Gift } from 'lucide-react';

const MyWishlist = () => {
  const { currentUser } = useAuth();
  const { activeCategory, setActiveCategory } = useOutletContext();
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState(false);
  const { items, loading, error, retry } = useWishes([currentUser?.uid]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPrioritizeModal, setShowPrioritizeModal] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), 4000);
    return () => clearTimeout(timer);
  }, [saved]);

  useEffect(() => {
    const handleSaved = () => setSaved(true);
    window.addEventListener('aura-wish-saved', handleSaved);
    return () => window.removeEventListener('aura-wish-saved', handleSaved);
  }, []);

  useEffect(() => { setActiveCategory('All'); }, [currentUser?.uid, setActiveCategory]);

  const activeItems = items.filter(item => !item.isArchived && item.status !== 'received');
  const archivedCount = items.filter(item => Boolean(item.isArchived || item.status === 'received')).length;

  const filteredItems = activeItems.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.theme === activeCategory || item.tags?.includes(activeCategory);
    return matchesCategory && `${item.name || ''} ${item.notes || ''}`.toLowerCase().includes(search.toLowerCase().trim());
  });

  return (
    <div className="aura-enter" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div className="aura-wish-heading">
        <div>
          <span className="aura-eyebrow"><Sparkles size={14} aria-hidden="true" /> Your universe</span>
          <h2>What lights you up?</h2>
          <p>Big dreams, little obsessions, and everything in between.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/archive"
            className="btn-glossy"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
          >
            <Archive size={16} aria-hidden="true" /> Gift Archive {archivedCount > 0 ? `(${archivedCount})` : ''}
          </Link>
          {activeItems.length > 0 && (
            <button className="btn-glossy" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowPrioritizeModal(true)}>
              <Sparkles size={16} aria-hidden="true" /> Prioritize list
            </button>
          )}
          <button className="btn-primary" onClick={() => setShowAddModal(true)}><Plus size={18} aria-hidden="true" /> Add a wish</button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="aura-filter-tabs" style={{ marginBottom: '1.25rem' }} aria-label="Wishlist views">
        <button type="button" aria-pressed={true} className="active">
          <Gift size={14} style={{ marginRight: '6px' }} />
          Active Wishes ({activeItems.length})
        </button>
        <Link to="/archive" style={{ textDecoration: 'none' }}>
          <button type="button" aria-pressed={false}>
            <Archive size={14} style={{ marginRight: '6px' }} />
            Gift Archive ({archivedCount})
          </button>
        </Link>
      </div>

      <div className="aura-list-controls">
        <label className="aura-wish-search">
          <Search size={17} aria-hidden="true" />
          <input type="search" aria-label="Search your wishes" placeholder="Find your next obsession…" value={search} onChange={event => setSearch(event.target.value)} />
        </label>
        <div className="aura-wish-count">
          <span>{filteredItems.length}</span> {filteredItems.length === 1 ? 'possibility' : 'possibilities'}
        </div>
      </div>
      {error && <p role="alert" className="aura-error">Some wishes could not load. <button className="btn-glossy" onClick={retry}>Try again</button></p>}
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Summoning your wishes...</p>
      ) : (
        filteredItems.length === 0 && activeItems.length > 0 ? (
          <div className="glass-panel aura-empty-state">
            <Sparkles size={32} aria-hidden="true" />
            <h3>Still out there somewhere.</h3>
            <p>No wishes match this search. Try a different word or occasion.</p>
            <button className="btn-glossy" onClick={() => { setSearch(''); setActiveCategory('All'); }}>Show all my wishes</button>
          </div>
        ) : (
          <WishlistGrid items={filteredItems} isOwner={true} isGuest={false} onAddWish={activeItems.length === 0 ? () => setShowAddModal(true) : undefined} />
        )
      )}

      {showAddModal && <AddWishModal onClose={() => setShowAddModal(false)} onAdded={() => setSaved(true)} allWishes={activeItems} />}
      {showPrioritizeModal && <PrioritizeOrbitModal wishes={activeItems} onClose={() => setShowPrioritizeModal(false)} />}
      {saved && <div role="status" className="aura-success-toast"><Check size={18} aria-hidden="true" /> Wish updated in your universe.</div>}
    </div>
  );
};

export default MyWishlist;
