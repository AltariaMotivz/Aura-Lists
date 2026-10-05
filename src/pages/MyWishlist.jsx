import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useOutletContext } from 'react-router-dom';
import WishlistGrid from '../components/WishlistGrid';
import AddWishModal from '../components/AddWishModal';
import SkeletonGrid from '../components/SkeletonGrid';
import { Plus } from 'lucide-react';

const MyWishlist = () => {
  const { currentUser } = useAuth();
  const { activeCategory, setActiveCategory } = useOutletContext();
  const [items, setItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    
    if (setActiveCategory) {
      setActiveCategory('All');
    }

    setLoading(true);
    setError('');
    let isMounted = true;
    const handleLoadError = () => {
      if (isMounted) { setError('Some wishes could not be loaded. Please refresh to try again.'); setLoading(false); }
    };
    
    let wishesData = [];
    let legacyData = [];

    const qWishes = query(collection(db, 'wishes'), where('ownerId', '==', currentUser.uid));
    const unsubscribeWishes = onSnapshot(qWishes, (snapshot) => {
      if (!isMounted) return;
      wishesData = snapshot.docs.map(doc => ({ id: doc.id, collectionName: 'wishes', ...doc.data() }));
      setItems([...wishesData, ...legacyData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setLoading(false);
    }, handleLoadError);

    const qLegacy = query(collection(db, 'wishlist'), where('userId', '==', currentUser.uid));
    const unsubscribeLegacy = onSnapshot(qLegacy, (snapshot) => {
      if (!isMounted) return;
      legacyData = snapshot.docs.map(doc => ({ id: doc.id, collectionName: 'wishlist', ...doc.data() }));
      setItems([...wishesData, ...legacyData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setLoading(false);
    }, handleLoadError);

    return () => {
      isMounted = false;
      unsubscribeWishes();
      unsubscribeLegacy();
    };
  }, [currentUser, setActiveCategory]);

  const filteredItems = items.filter(item => {
    if (activeCategory === 'All') return true;
    return item.tags && item.tags.includes(activeCategory);
  });

  return (
    <div className="aura-route">
      <div className="aura-page-heading">
        <div><span className="aura-kicker">A collection of possibilities</span><h2>My wishes</h2><p>Keep the things you love in one thoughtful place.</p></div>
        <button 
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: 'var(--radius-pill)', padding: '10px 20px' }}
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={18} /> Add Wish
        </button>
      </div>
      
      {error && <p className="aura-error" role="alert" style={{ marginBottom: 16 }}>{error}</p>}
      {loading ? (
        <SkeletonGrid count={3} />
      ) : (
        <WishlistGrid items={filteredItems} isOwner={true} isGuest={false} />
      )}

      {showAddModal && <AddWishModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
};

export default MyWishlist;
