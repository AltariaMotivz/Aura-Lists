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
  const { activeCategory } = useOutletContext();
  const [items, setItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    
    let isMounted = true;
    const q = query(collection(db, 'wishlist'), where('userId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!isMounted) return;
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(fetched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
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
