import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Search, UserPlus } from 'lucide-react';
import styles from './Dashboard.module.css';
import SkeletonGrid from '../components/SkeletonGrid';

const formatDisplayName = (nameOrPhone) => {
  if (!nameOrPhone) return 'Unknown';
  // Check if string matches phone number format (e.g. +17032209405)
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (phoneRegex.test(nameOrPhone)) {
    const lastFour = nameOrPhone.slice(-4);
    return `User-...${lastFour}`;
  }
  return nameOrPhone;
};

const UserSidebar = ({ profile }) => {
  if (!profile) return null;
  return (
    <aside className={`${styles.userSidebar} ${styles.glassCard}`}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{
          width: '96px', height: '96px', borderRadius: '50%', marginBottom: '1rem',
          background: 'var(--color-bg-secondary)', border: '3px solid var(--color-accent-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
        }}>
          {profile.photoURL ? (
            <img src={profile.photoURL} alt={profile.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '2.5rem', color: 'var(--color-accent-primary)' }}>
              {profile.displayName?.charAt(0) || '?'}
            </span>
          )}
        </div>
        <h2 className={styles.primaryText} style={{ fontSize: '1.3rem' }}>
          {formatDisplayName(profile.displayName)}
        </h2>
        {profile.username && profile.username.trim() !== '' && (
          <p className={styles.secondaryText}>@{profile.username}</p>
        )}
      </div>
    </aside>
  );
};

const Dashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const [friends, setFriends] = useState([]);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(true);

  // Fetch Friends List
  useEffect(() => {
    if (!currentUser) return;
    
    let isMounted = true;
    const friendsRef = collection(db, 'users', currentUser.uid, 'friends');
    
    const unsubscribe = onSnapshot(friendsRef, async (snapshot) => {
      if (!isMounted) return;
      const friendProfiles = await Promise.all(snapshot.docs.map(async (d) => {
        const profileDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', d.id)));
        return profileDoc.empty ? null : { id: profileDoc.docs[0].id, ...profileDoc.docs[0].data() };
      }));
      if (isMounted) {
        setFriends(friendProfiles.filter(Boolean));
        setLoadingFriends(false);
      }
    }, (error) => {
      console.error("Error fetching friends:", error);
      if (isMounted) setLoadingFriends(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [currentUser]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const usersRef = collection(db, 'users');
      // Case-insensitive type-ahead search using searchableArray
      const q = query(usersRef, where('searchableArray', 'array-contains', searchQuery.toLowerCase()));
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.id !== currentUser.uid); // Exclude self
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed', err);
    }
    setSearching(false);
  };

  const handleAddFriend = async (friendId) => {
    if (!currentUser) return;
    try {
      const friendRef = doc(db, 'users', currentUser.uid, 'friends', friendId);
      await setDoc(friendRef, { addedAt: new Date().toISOString() });
      setShowAddFriend(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      console.error('Failed to add friend', err);
    }
  };

  return (
    <div className={styles.dashboardLayout}>
      
      <UserSidebar profile={userProfile} />

      <main className={styles.mainContent}>
        <div className={styles.headerRow}>
          <h2 className={styles.primaryText} style={{ fontSize: '1.8rem' }}>Friends' Wishlists</h2>
          <button 
            className="btn-glossy" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '10px 20px', borderRadius: '999px', fontWeight: '600' }}
            onClick={() => setShowAddFriend(true)}
          >
            <UserPlus size={18} /> Add Friend
          </button>
        </div>

        {loadingFriends ? (
          <SkeletonGrid count={4} />
        ) : friends.length === 0 ? (
          <div className={styles.glassCard} style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-secondary)', alignItems: 'center', justifyContent: 'center' }}>
            <p className={styles.primaryText} style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No friends added yet.</p>
            <p style={{ color: '#7C3AED' }}>Click "Add Friend" to search and view their wishlists!</p>
          </div>
        ) : (
          <div className={styles.friendsGrid}>
            {friends.map(friend => (
              <Link key={friend.id} to={`/friend/${friend.id}`} style={{ textDecoration: 'none', height: '100%' }}>
                <div className={styles.glassCard} style={{ padding: '2rem 1rem', alignItems: 'center', textAlign: 'center', height: '100%' }}>
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '50%', marginBottom: '1rem',
                    background: 'var(--color-bg-secondary)', border: '2px solid rgba(167, 139, 250, 0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                  }}>
                    {friend.photoURL ? (
                      <img src={friend.photoURL} alt={friend.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '2rem', color: '#7C3AED' }}>
                        {formatDisplayName(friend.displayName).charAt(0)}
                      </span>
                    )}
                  </div>
                  <h3 className={styles.primaryText} style={{ fontSize: '1.1rem' }}>
                    {formatDisplayName(friend.displayName)}
                  </h3>
                  {friend.username && friend.username.trim() !== '' && (
                    <p className={styles.secondaryText}>@{friend.username}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Add Friend Modal */}
      {showAddFriend && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div className={styles.glassCard} style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <h3 className={styles.primaryText} style={{ marginBottom: '1rem', textAlign: 'center' }}>Add a Friend</h3>
            
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Search name or @username" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '0 1rem', borderRadius: 'var(--radius-pill)' }} disabled={searching}>
                <Search size={18} />
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
              {searching ? (
                <p style={{ textAlign: 'center', color: '#7C3AED' }}>Searching...</p>
              ) : searchResults.length > 0 ? (
                searchResults.map(res => (
                  <div key={res.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.4)', borderRadius: '12px' }}>
                    <div>
                      <p className={styles.primaryText} style={{ fontSize: '0.9rem', marginBottom: 0 }}>
                        {formatDisplayName(res.displayName)}
                      </p>
                      {res.username && res.username.trim() !== '' && (
                        <p className={styles.secondaryText} style={{ fontSize: '0.8rem' }}>@{res.username}</p>
                      )}
                    </div>
                    <button onClick={() => handleAddFriend(res.id)} className="btn-glossy" style={{ padding: '4px 12px', fontSize: '0.8rem', borderRadius: '999px' }}>
                      Add
                    </button>
                  </div>
                ))
              ) : searchQuery && !searching ? (
                <p style={{ textAlign: 'center', color: '#7C3AED' }}>No users found.</p>
              ) : null}
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button onClick={() => setShowAddFriend(false)} className="pill-badge" style={{ cursor: 'pointer', background: 'transparent', border: '1px solid #7C3AED', color: '#7C3AED' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
