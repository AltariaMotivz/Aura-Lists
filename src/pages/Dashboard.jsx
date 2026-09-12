import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { Link, useOutletContext } from 'react-router-dom';
import FriendCard from '../components/FriendCard';
import SkeletonGrid from '../components/SkeletonGrid';
import { Search, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Tilt } from 'react-tilt';

const defaultTiltOptions = {
  reverse:        false,
  max:            25,
  perspective:    1000,
  scale:          1.05,
  speed:          1000,
  transition:     true,
  axis:           null,
  reset:          true,
  easing:         "cubic-bezier(.03,.98,.52,.99)",
};

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { friends, loadingFriends } = useOutletContext();
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const formatDisplayName = (nameOrPhone) => {
    if (!nameOrPhone) return 'Unknown';
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (phoneRegex.test(nameOrPhone)) {
      const lastFour = nameOrPhone.slice(-4);
      return `User-...${lastFour}`;
    }
    return nameOrPhone;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults([]);
    
    try {
      const usersRef = collection(db, 'users');
      // This is a naive search, in production use Algolia or Typesense
      const q = query(usersRef, where('searchableArray', 'array-contains', searchQuery.toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      const results = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.id !== currentUser.uid); // Exclude self
        
      setSearchResults(results);
    } catch (err) {
      console.error("Search failed", err);
    }
    setSearching(false);
  };

  const handleAddFriend = async (friendId) => {
    try {
      const friendRef = doc(db, 'users', currentUser.uid, 'friends', friendId);
      await setDoc(friendRef, {
        addedAt: new Date().toISOString()
      });
      setShowAddFriend(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      console.error("Failed to add friend", err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="chromatic-text" style={{ fontSize: '2.5rem', color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}>Friends' Wishlists</h2>
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
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>No friends added yet.</p>
          <p style={{ color: 'var(--color-text-secondary)' }}>Click "Add Friend" to search and view their wishlists!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'start', marginTop: '2rem' }}>
          {friends.map(friend => (
            <Link key={friend.id} to={`/friend/${friend.id}`} style={{ textDecoration: 'none', height: '100%' }}>
              <Tilt options={defaultTiltOptions} style={{ height: '100%' }}>
                <FriendCard friend={friend} />
              </Tilt>
            </Link>
          ))}
        </div>
      )}

      {/* Add Friend Modal */}
      {showAddFriend && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)' }}>
            <h3 className="chromatic-text" style={{ marginBottom: '1rem', textAlign: 'center', color: 'var(--color-text-primary)' }}>Add a Friend</h3>
            
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Search name or @username" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '0 1rem', borderRadius: 'var(--radius-pill)', background: 'linear-gradient(45deg, var(--orb-1), var(--orb-2))' }} disabled={searching}>
                <Search size={18} />
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
              {searching ? (
                <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>Searching...</p>
              ) : searchResults.length > 0 ? (
                searchResults.map(res => (
                  <div key={res.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div>
                      <p style={{ fontSize: '0.9rem', marginBottom: 0, color: 'var(--color-text-primary)', fontWeight: 'bold' }}>
                        {formatDisplayName(res.displayName)}
                      </p>
                      {res.username && res.username.trim() !== '' && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-accent-primary)' }}>@{res.username}</p>
                      )}
                    </div>
                    <button onClick={() => handleAddFriend(res.id)} className="btn-glossy" style={{ padding: '4px 12px', fontSize: '0.8rem', borderRadius: '999px' }}>
                      Add
                    </button>
                  </div>
                ))
              ) : searchQuery && !searching ? (
                <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>No users found.</p>
              ) : null}
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button onClick={() => setShowAddFriend(false)} className="pill-badge" style={{ cursor: 'pointer', background: 'transparent', border: '1px solid var(--color-text-secondary)', color: 'var(--color-text-secondary)' }}>
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
