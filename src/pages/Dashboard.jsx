import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { useOutletContext } from 'react-router-dom';
import Dialog from '../components/Dialog';
import ActivityItem from '../components/ActivityItem';
import SkeletonGrid from '../components/SkeletonGrid';
import { Search, UserPlus, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';



const Dashboard = () => {
  const { currentUser } = useAuth();
  const { friends, loadingFriends } = useOutletContext();
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  useEffect(() => {
    if (loadingFriends) return;
    
    if (!friends || friends.length === 0) {
      setActivities([]);
      setLoadingActivities(false);
      return;
    }

    let isMounted = true;
    setLoadingActivities(true);

    const unsubscribes = [];
    const stateRef = { wishes: {}, wishlist: {} };

    const updateState = () => {
      if (!isMounted) return;
      const allActivities = [];
      Object.values(stateRef.wishes).forEach(arr => allActivities.push(...arr));
      Object.values(stateRef.wishlist).forEach(arr => allActivities.push(...arr));
      const sorted = allActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setActivities(sorted.slice(0, 20));
      setLoadingActivities(false);
    };

    friends.forEach(friend => {
      const qW = query(collection(db, 'wishes'), where('ownerId', '==', friend.id));
      const unsubW = onSnapshot(qW, (snap) => {
        stateRef.wishes[friend.id] = snap.docs.map(d => ({ ...d.data(), id: d.id, friend }));
        updateState();
      }, (error) => {
        console.error("Error fetching wishes for friend:", friend.id, error);
        // Continue updating state even if one friend fails
        updateState();
      });
      unsubscribes.push(unsubW);

      const qL = query(collection(db, 'wishlist'), where('userId', '==', friend.id));
      const unsubL = onSnapshot(qL, (snap) => {
        stateRef.wishlist[friend.id] = snap.docs.map(d => ({ ...d.data(), id: d.id, friend }));
        updateState();
      }, (error) => {
        console.error("Error fetching legacy wishlist for friend:", friend.id, error);
        updateState();
      });
      unsubscribes.push(unsubL);
    });

    return () => {
      isMounted = false;
      unsubscribes.forEach(unsub => unsub());
    };
  }, [friends, loadingFriends]);

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
    <div className="aura-route">
      
      <div className="aura-page-heading">
        <div><span className="aura-kicker">Good things, shared</span><h2>Your circle</h2><p>A little inspiration from the people you care about.</p></div>
        <button 
          className="btn-glossy" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '10px 20px', borderRadius: '999px', fontWeight: '600' }}
          onClick={() => setShowAddFriend(true)}
        >
          <UserPlus size={18} /> Add Friend
        </button>
      </div>

      {(loadingFriends || loadingActivities) ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <SkeletonGrid count={3} />
        </div>
      ) : friends.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>No friends added yet.</p>
          <p style={{ color: 'var(--color-text-secondary)' }}>Click "Add Friend" to search and view their wishlists!</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-secondary)' }}>
          <Activity size={48} color="rgba(255,255,255,0.2)" style={{ marginBottom: '1rem' }} />
          <p style={{ fontSize: '1.2rem', color: 'var(--color-text-primary)' }}>No recent activity.</p>
          <p>Your friends haven't added any wishes yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          {activities.map(item => (
            <ActivityItem key={item.id} item={item} friend={item.friend} />
          ))}
        </div>
      )}

      {/* Add Friend Modal */}
      {showAddFriend && (
        <Dialog onClose={() => setShowAddFriend(false)} labelledBy="friend-dialog-title">
            <h3 id="friend-dialog-title" className="chromatic-text" style={{ marginBottom: '1rem', textAlign: 'center', color: 'var(--color-text-primary)' }}>Add a Friend</h3>
            
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input 
                type="text"
                aria-label="Search friends by name or username"
                className="input-field" 
                placeholder="Search name or @username" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
              />
              <button type="submit" aria-label="Search friends" className="btn-primary" style={{ padding: '0 1rem', borderRadius: 'var(--radius-pill)', background: 'linear-gradient(45deg, var(--orb-1), var(--orb-2))' }} disabled={searching}>
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
        </Dialog>
      )}
    </div>
  );
};

export default Dashboard;
