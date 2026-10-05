import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
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
  const [items, setItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), 4000);
    return () => clearTimeout(timer);
  }, [saved]);

  useEffect(() => {
    if (!currentUser) return;
    
    if (setActiveCategory) {
      setActiveCategory('All');
    }

    let isMounted = true;
    
    let wishesData = [];
    let legacyData = [];

    const qWishes = query(collection(db, 'wishes'), where('ownerId', '==', currentUser.uid));
    const unsubscribeWishes = onSnapshot(qWishes, (snapshot) => {
      if (!isMounted) return;
      wishesData = snapshot.docs.map(doc => ({ id: doc.id, collectionName: 'wishes', ...doc.data() }));
      setItems([...wishesData, ...legacyData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setLoading(false);
    });

    const qLegacy = query(collection(db, 'wishlist'), where('userId', '==', currentUser.uid));
    const unsubscribeLegacy = onSnapshot(qLegacy, (snapshot) => {
      if (!isMounted) return;
      legacyData = snapshot.docs.map(doc => ({ id: doc.id, collectionName: 'wishlist', ...doc.data() }));
      setItems([...wishesData, ...legacyData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribeWishes();
      unsubscribeLegacy();
    };
  }, [currentUser]);

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
