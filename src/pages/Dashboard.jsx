import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import ProfileSidebar from '../components/ProfileSidebar';
import { Search, UserPlus } from 'lucide-react';

const Dashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const [friends, setFriends] = useState([]);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(true);

  // Fetch Friends List (Assuming a subcollection or array of friend IDs. For this demo, let's use a subcollection 'friends')
  useEffect(() => {
    if (!currentUser) return;
    const friendsRef = collection(db, 'users', currentUser.uid, 'friends');
    const unsubscribe = onSnapshot(friendsRef, async (snapshot) => {
      const friendProfiles = await Promise.all(snapshot.docs.map(async (d) => {
        const profileDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', d.id)));
        return profileDoc.empty ? null : { id: profileDoc.docs[0].id, ...profileDoc.docs[0].data() };
      }));
      setFriends(friendProfiles.filter(Boolean));
      setLoadingFriends(false);
    });
    return () => unsubscribe();
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
    <div className="layout-with-sidebar">
      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>Friends' Wishlists</h2>
          <button 
            className="btn-glossy" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => setShowAddFriend(true)}
          >
            <UserPlus size={18} /> Add Friend
          </button>
        </div>

        {loadingFriends ? (
          <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>Summoning your friends...</p>
        ) : friends.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-secondary)' }}>
            <p style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>No friends added yet.</p>
            <p>Click "Add Friend" to search and view their wishlists!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {friends.map(friend => (
              <Link key={friend.id} to={`/friend/${friend.id}`} style={{ textDecoration: 'none' }}>
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem', textAlign: 'center' }}>
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '50%', marginBottom: '1rem',
                    background: 'var(--color-bg-secondary)', border: '2px solid var(--color-accent-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                  }}>
                    {friend.photoURL ? (
                      <img src={friend.photoURL} alt={friend.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '2rem', color: 'var(--color-accent-primary)' }}>{friend.displayName?.charAt(0) || '?'}</span>
                    )}
                  </div>
                  <h3 style={{ color: 'var(--color-text-primary)', fontSize: '1.1rem' }}>{friend.displayName}</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>@{friend.username}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <ProfileSidebar profile={userProfile} isOwner={true} />

      {/* Add Friend Modal */}
      {showAddFriend && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem', textAlign: 'center' }}>Add a Friend</h3>
            
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Search name or @username" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn-primary" style={{ padding: '0 1rem' }} disabled={searching}>
                <Search size={18} />
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
              {searching ? (
                <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Searching...</p>
              ) : searchResults.length > 0 ? (
                searchResults.map(res => (
                  <div key={res.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                    <div>
                      <p style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{res.displayName}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>@{res.username}</p>
                    </div>
                    <button onClick={() => handleAddFriend(res.id)} className="pill-badge" style={{ background: 'var(--color-accent-primary)', color: 'white', border: 'none', cursor: 'pointer' }}>
                      Add
                    </button>
                  </div>
                ))
              ) : searchQuery && !searching ? (
                <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>No users found.</p>
              ) : null}
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button onClick={() => setShowAddFriend(false)} className="pill-badge" style={{ cursor: 'pointer', background: 'transparent' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
