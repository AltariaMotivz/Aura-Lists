import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import useWishes from '../hooks/useWishes';
import { useAuth } from '../contexts/AuthContext';
import WishlistGrid from '../components/WishlistGrid';
import SkeletonGrid from '../components/SkeletonGrid';
import { Archive, PackageCheck, Search, Sparkles, Gift, ArrowLeft, RotateCcw } from 'lucide-react';

export default function ArchivePage() {
  const { currentUser } = useAuth();
  const { activeCategory, setActiveCategory } = useOutletContext();
  const [search, setSearch] = useState('');
  const [restoredToast, setRestoredToast] = useState(false);
  const { items, loading, error, retry } = useWishes([currentUser?.uid]);

  useEffect(() => {
    setActiveCategory('All');
  }, [currentUser?.uid, setActiveCategory]);

  useEffect(() => {
    const handleSaved = () => {
      setRestoredToast(true);
      const timer = setTimeout(() => setRestoredToast(false), 4000);
      return () => clearTimeout(timer);
    };
    window.addEventListener('aura-wish-saved', handleSaved);
    return () => window.removeEventListener('aura-wish-saved', handleSaved);
  }, []);

  const archivedItems = items.filter(item => Boolean(item.isArchived || item.status === 'received'));
  const activeCount = items.filter(item => !item.isArchived && item.status !== 'received').length;

  // Sort archived items: newest received date first, falling back to createdAt
  const sortedArchived = [...archivedItems].sort((a, b) => {
    const timeA = new Date(a.receivedAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.receivedAt || b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  const filteredItems = sortedArchived.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.theme === activeCategory || item.tags?.includes(activeCategory);
    return matchesCategory && `${item.name || ''} ${item.notes || ''}`.toLowerCase().includes(search.toLowerCase().trim());
  });

  return (
    <div className="aura-enter" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Link className="universe-back" to="/my-wishlist" style={{ marginBottom: '1rem', width: 'fit-content' }}>
        <ArrowLeft size={16} /> Back to active wishes
      </Link>

      <div className="aura-wish-heading">
        <div>
          <span className="aura-eyebrow" style={{ color: '#34d399' }}>
            <PackageCheck size={14} aria-hidden="true" /> Memory Vault
          </span>
          <h2>Gift Archive</h2>
          <p>Treasure the wishes you’ve received and the thoughtful souls who fulfilled them.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/my-wishlist"
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
          >
            <Gift size={16} aria-hidden="true" /> Active Wishes ({activeCount})
          </Link>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="aura-filter-tabs" style={{ marginBottom: '1.25rem' }} aria-label="Wishlist views">
        <Link to="/my-wishlist" style={{ textDecoration: 'none' }}>
          <button type="button" aria-pressed={false}>
            <Gift size={14} style={{ marginRight: '6px' }} />
            Active Wishes ({activeCount})
          </button>
        </Link>
        <button type="button" aria-pressed={true} className="active" style={{ borderColor: 'rgba(52, 211, 153, 0.4)', background: 'rgba(52, 211, 153, 0.12)', color: 'var(--color-text-primary)' }}>
          <Archive size={14} style={{ marginRight: '6px', color: '#34d399' }} />
          Gift Archive ({archivedItems.length})
        </button>
      </div>

      <div className="aura-list-controls">
        <label className="aura-wish-search">
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            aria-label="Search your archived gifts"
            placeholder="Search received gifts & memories…"
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </label>
        <div className="aura-wish-count">
          <span>{filteredItems.length}</span> {filteredItems.length === 1 ? 'gift treasured' : 'gifts treasured'}
        </div>
      </div>

      {error && (
        <p role="alert" className="aura-error">
          Some archived gifts could not load. <button className="btn-glossy" onClick={retry}>Try again</button>
        </p>
      )}

      {loading ? (
        <SkeletonGrid count={3} />
      ) : archivedItems.length === 0 ? (
        <div className="glass-panel aura-empty-state" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '22px',
            background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.2), rgba(167, 139, 250, 0.15))',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 1.25rem',
            border: '1px solid rgba(52, 211, 153, 0.35)',
            boxShadow: '0 0 25px rgba(52, 211, 153, 0.15)'
          }}>
            <PackageCheck size={34} color="#34d399" />
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', marginBottom: '0.5rem' }}>
            Your treasure vault awaits.
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '440px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            When you receive a wish from your active list, click “Mark as Received” to preserve it here in your personal archive.
          </p>
          <Link
            to="/my-wishlist"
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
          >
            <Gift size={16} /> Explore active wishlist
          </Link>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-panel aura-empty-state">
          <Sparkles size={32} aria-hidden="true" />
          <h3>Still looking for that memory.</h3>
          <p>No archived gifts match this search. Try a different word or occasion.</p>
          <button className="btn-glossy" onClick={() => { setSearch(''); setActiveCategory('All'); }}>
            Show all archived gifts
          </button>
        </div>
      ) : (
        <WishlistGrid
          items={filteredItems}
          isOwner={true}
          isGuest={false}
          isArchiveView={true}
        />
      )}

      {restoredToast && (
        <div role="status" className="aura-success-toast">
          <RotateCcw size={18} aria-hidden="true" /> Wish status updated in your universe.
        </div>
      )}
    </div>
  );
}
