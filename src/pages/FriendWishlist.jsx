import React, { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import WishlistGrid from '../components/WishlistGrid';
import CheckoutDrawer from '../components/CheckoutDrawer';
import SkeletonGrid from '../components/SkeletonGrid';
import styles from './FriendWishlist.module.css';

const FriendWishlist = () => {
  const { friendId } = useParams();
  const { activeCategory } = useOutletContext();
  const [friendProfile, setFriendProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingCheckoutItem, setPendingCheckoutItem] = useState(null);

  useEffect(() => {
    // Strict temporal anchor and state obliteration
    setLoading(true);
    setItems([]);
    setFriendProfile(null);

    if (!friendId) return;

    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const profileRef = doc(db, 'users', friendId);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists() && isMounted) {
          setFriendProfile({ uid: profileSnap.id, ...profileSnap.data() });
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };

    fetchProfile();

    const q = query(collection(db, 'wishlist'), where('userId', '==', friendId));
    
    // Real-time listener cleanup
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!isMounted) return;
      const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setItems(fetched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setLoading(false);
    });

    return () => {
      isMounted = false; // Temporal anchor
      unsubscribe();
    };
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
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/" style={{ color: '#7C3AED', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600', padding: '6px 12px', background: 'rgba(255,255,255,0.4)', borderRadius: '999px', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
          &larr; Back
        </Link>
        <h2 style={{ fontFamily: 'var(--font-heading)', color: '#2E1065', margin: 0, fontSize: '1.5rem' }}>
          {friendProfile?.displayName ? `${friendProfile.displayName}'s Wishlist` : 'Loading Profile...'}
        </h2>
      </div>
      
      {loading ? (
        <SkeletonGrid count={4} />
      ) : (
        <div style={{ width: '100%' }}>
          {filteredItems.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-secondary)', borderRadius: '32px' }}>
              <p style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', color: '#2E1065' }}>No items found.</p>
            </div>
          ) : (
            <WishlistGrid 
              items={filteredItems} 
              isOwner={false} 
              isGuest={true} 
              onExternalClick={handleExternalClick} 
            />
          )}
        </div>
      )}

      <CheckoutDrawer 
        pendingItem={pendingCheckoutItem} 
        onClose={closeCheckoutDrawer} 
        onConfirmPurchase={closeCheckoutDrawer} 
      />
    </div>
  );
};

export default FriendWishlist;
