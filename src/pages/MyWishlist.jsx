import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useOutletContext } from 'react-router-dom';
import WishlistGrid from '../components/WishlistGrid';
import AddWishModal from '../components/AddWishModal';
import { Plus } from 'lucide-react';

const MyWishlist = () => {
  const { currentUser } = useAuth();
  const { activeCategory, setActiveCategory } = useOutletContext();
  const [items, setItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

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
    if (activeCategory === 'All') return true;
    return item.tags && item.tags.includes(activeCategory);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', color: '#2E1065', fontSize: '1.8rem' }}>My Wishes</h2>
        <button 
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: 'var(--radius-pill)', padding: '10px 20px' }}
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={18} /> Add Wish
        </button>
      </div>
      
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Summoning your wishes...</p>
      ) : (
        <WishlistGrid items={filteredItems} isOwner={true} isGuest={false} />
      )}

      {showAddModal && <AddWishModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
};

export default MyWishlist;
