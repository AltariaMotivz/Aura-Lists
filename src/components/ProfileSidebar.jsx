import React, { useState } from 'react';
import { Camera, Share2, Save, Sun, Moon, MoreVertical, Wand2 } from 'lucide-react';
import { db, storage } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const generateSearchableArray = (name, username) => {
  const arr = [];
  const addPrefixes = (str) => {
    if (!str) return;
    const lower = str.toLowerCase();
    for (let i = 1; i <= lower.length; i++) {
      arr.push(lower.substring(0, i));
    }
  };
  addPrefixes(name);
  addPrefixes(username);
  return [...new Set(arr)];
};

const ProfileSidebar = ({ 
  profile, 
  isOwner = false, 
  activeCategory = 'All', 
  onCategoryChange 
}) => {
  const { currentUser, setUserProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [uploading, setUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const defaultCategories = ['All', 'Birthday', 'Wedding', 'Holiday', 'Tech', 'Books'];

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const searchableArray = generateSearchableArray(displayName, username);
      const updates = { displayName, username, searchableArray };
      await updateDoc(userRef, updates);
      setUserProfile(prev => ({ ...prev, ...updates }));
      setEditing(false);
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  };

  const handlePhotoUpload = async (e) => {
    if (!currentUser || !e.target.files[0]) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const storageRef = ref(storage, `profiles/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { photoURL });
      setUserProfile(prev => ({ ...prev, photoURL }));
    } catch (err) {
      console.error('Failed to upload photo', err);
    }
    setUploading(false);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/friend/${profile?.uid || currentUser?.uid}`;
    if (navigator.share) {
      navigator.share({
        title: `${profile?.displayName || 'Someone'}'s Aura List`,
        url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
    setShowMenu(false);
  };

  return (
    <aside className="profile-sidebar glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
      
      {/* Brand & Theme Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent-primary)', fontWeight: '700', fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
          <Wand2 size={20} /> Aura Lists
        </div>
        <button onClick={toggleTheme} className="pill-badge" style={{ padding: '6px', cursor: 'pointer', background: 'transparent' }} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      {/* Compact Profile Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'var(--color-bg-secondary)', border: '2px solid var(--color-accent-primary)',
            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '1.5rem', color: 'var(--color-accent-primary)' }}>
                {profile?.displayName?.charAt(0) || '?'}
              </span>
            )}
          </div>
          {isOwner && (
            <label style={{
              position: 'absolute', bottom: -5, right: -5,
              background: 'var(--color-accent-primary)', color: 'white',
              borderRadius: '50%', padding: '4px', cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Camera size={12} />
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} disabled={uploading} />
            </label>
          )}
        </div>

        <div style={{ flex: 1, overflow: 'hidden' }}>
          <h2 style={{ fontSize: '1.1rem', margin: '0', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {profile?.displayName || 'New User'}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            @{profile?.username || `user_${profile?.uid?.substring(0,5)}`}
          </p>
        </div>

        {/* Dropdown Menu */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowMenu(!showMenu)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
            <MoreVertical size={20} />
          </button>
          
          {showMenu && (
            <div className="glass-panel" style={{
              position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
              display: 'flex', flexDirection: 'column', padding: '0.5rem',
              minWidth: '150px', zIndex: 10
            }}>
              {isOwner && (
                <button onClick={() => { setEditing(true); setShowMenu(false); }} style={{ padding: '8px', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
                  Edit Profile
                </button>
              )}
              <button onClick={handleShare} style={{ padding: '8px', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
                Share Profile
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Form Modal/Inline */}
      {isOwner && editing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
          <input className="input-field" placeholder="Display Name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
          <input className="input-field" placeholder="@username" value={username} onChange={e => setUsername(e.target.value)} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-primary" onClick={handleSaveProfile} style={{ flex: 1, padding: '8px' }}>Save</button>
            <button className="pill-badge" onClick={() => setEditing(false)} style={{ flex: 1, cursor: 'pointer', background: 'transparent' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Categories Nav (Collateral Sidebar logic) */}
      {onCategoryChange && (
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '1rem' }}>
          <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Occasions</h3>
          {defaultCategories.map(cat => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              style={{
                textAlign: 'left', padding: '10px 16px', borderRadius: 'var(--radius-pill)',
                background: activeCategory === cat ? 'var(--color-accent-glow)' : 'transparent',
                color: activeCategory === cat ? 'var(--color-accent-primary)' : 'var(--color-text-primary)',
                border: 'none', cursor: 'pointer', fontWeight: activeCategory === cat ? '700' : '500',
                transition: 'all var(--transition-fast)'
              }}
            >
              {cat}
            </button>
          ))}
        </nav>
      )}
    </aside>
  );
};

export default ProfileSidebar;
