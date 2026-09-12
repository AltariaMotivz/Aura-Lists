import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import WishlistGrid from '../components/WishlistGrid';
import CheckoutDrawer from '../components/CheckoutDrawer';
import SkeletonGrid from '../components/SkeletonGrid';
import styles from './FriendWishlist.module.css';

const StickySidebar = ({ profile, activeCategory, onCategoryChange }) => {
  const defaultCategories = ['All', 'Birthday', 'Wedding', 'Holiday', 'Tech', 'Books'];

  return (
    <aside className={`${styles.stickySidebar} ${styles.glassCard}`}>
      {/* Avatar & Profile Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'var(--color-bg-secondary)', border: '2px solid var(--color-accent-primary)',
          overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          {profile?.photoURL ? (
            <img src={profile.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '1.8rem', color: 'var(--color-accent-primary)' }}>
              {profile?.displayName?.charAt(0) || '?'}
            </span>
          )}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <h2 style={{ fontSize: '1.2rem', margin: '0', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: 'var(--color-text-primary)' }}>
            {profile?.displayName || 'Loading...'}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            @{profile?.username || `user_${profile?.uid?.substring(0,5) || ''}`}
          </p>
        </div>
      </div>

      <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.4)', margin: '0.5rem 0' }} />

      {/* Occasions Nav */}
      <nav className={styles.categoryNav}>
        <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', color: 'var(--color-text-secondary)', paddingLeft: '8px' }}>
          Occasions
        </h3>
        {defaultCategories.map(cat => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`${styles.categoryButton} ${activeCategory === cat ? styles.activeFilter : ''}`}
          >
            {cat}
          </button>
        ))}
      </nav>
    </aside>
  );
};

const FriendWishlist = () => {
  const { friendId } = useParams();
  const [friendProfile, setFriendProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [pendingCheckoutItem, setPendingCheckoutItem] = useState(null);

  useEffect(() => {
    // State reset on route change to prevent ghost data
    setLoading(true);
    setItems([]);
    setFriendProfile(null);
    setActiveCategory('All');

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
      isMounted = false;
      unsubscribe();
    };
  }, [friendId]); // friendId in dependency array

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
    <div className={styles.profileLayout}>
      <StickySidebar 
        profile={friendProfile} 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory} 
      />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600', padding: '6px 12px', background: 'rgba(255,255,255,0.4)', borderRadius: '999px' }}>
            &larr; Back
          </Link>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)', margin: 0, fontSize: '1.5rem' }}>
            {friendProfile?.displayName ? `${friendProfile.displayName}'s Wishlist` : 'Loading Profile...'}
          </h2>
        </div>
        
        {loading ? (
          <SkeletonGrid />
        ) : (
          <div className={styles.wishlistGridWrapper}>
            {filteredItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-secondary)', background: 'rgba(255,255,255,0.4)', borderRadius: '24px' }}>
                <p style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>No items found.</p>
              </div>
            ) : (
              <WishlistGrid 
                items={filteredItems} 
                isOwner={false} 
                isGuest={true} 
                onExternalClick={handleExternalClick} 
                cardClassName={styles.glassCard} // Pass glass recipe down if needed
              />
            )}
          </div>
        )}
      </div>

      <CheckoutDrawer 
        pendingItem={pendingCheckoutItem} 
        onClose={closeCheckoutDrawer} 
        onConfirmPurchase={closeCheckoutDrawer} 
      />
    </div>
  );
};

export default FriendWishlist;
