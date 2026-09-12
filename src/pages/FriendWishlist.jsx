import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import ProfileSidebar from '../components/ProfileSidebar';
import WishlistGrid from '../components/WishlistGrid';
import CheckoutDrawer from '../components/CheckoutDrawer';

const FriendWishlist = () => {
  const { friendId } = useParams();
  const [friendProfile, setFriendProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [pendingCheckoutItem, setPendingCheckoutItem] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!friendId) return;
      const profileRef = doc(db, 'users', friendId);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        setFriendProfile({ uid: profileSnap.id, ...profileSnap.data() });
      }
    };

    fetchProfile();

    const q = query(collection(db, 'wishlist'), where('userId', '==', friendId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setItems(fetched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [friendId]);

  const filteredItems = items.filter(item => {
    if (activeCategory === 'All') return true;
    return item.tags && item.tags.includes(activeCategory);
  });

  const handleExternalClick = (item) => {
    setPendingCheckoutItem(item);
  };

  const closeCheckoutDrawer = () => {
    setPendingCheckoutItem(null);
  };

  return (
    <div className="layout-with-sidebar">
      <div className="main-content">
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
            &larr; Back
          </Link>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)', marginTop: '0.5rem' }}>
            {friendProfile?.displayName ? `${friendProfile.displayName}'s Wishlist` : 'Wishlist'}
          </h2>
        </div>
        
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Summoning wishes...</p>
        ) : (
          <WishlistGrid 
            items={filteredItems} 
            isOwner={false} 
            isGuest={true} 
            onExternalClick={handleExternalClick} 
          />
        )}
      </div>

      <ProfileSidebar 
        profile={friendProfile} 
        isOwner={false} 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory} 
      />

      <CheckoutDrawer 
        pendingItem={pendingCheckoutItem} 
        onClose={closeCheckoutDrawer} 
        onConfirmPurchase={closeCheckoutDrawer} 
      />
    </div>
  );
};

export default FriendWishlist;
