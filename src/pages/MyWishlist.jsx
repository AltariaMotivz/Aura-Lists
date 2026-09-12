import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import ProfileSidebar from '../components/ProfileSidebar';
import WishlistGrid from '../components/WishlistGrid';
import AddWishModal from '../components/AddWishModal';
import { Plus } from 'lucide-react';

const MyWishlist = () => {
  const { currentUser, userProfile } = useAuth();
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    
    const q = query(collection(db, 'wishlist'), where('userId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(fetched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const filteredItems = items.filter(item => {
    if (activeCategory === 'All') return true;
    return item.tags && item.tags.includes(activeCategory);
  });

  return (
    <div className="layout-with-sidebar">
      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>My Wishes</h2>
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
      </div>

      <ProfileSidebar 
        profile={userProfile} 
        isOwner={true} 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory} 
      />

      {showAddModal && <AddWishModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
};

export default MyWishlist;
