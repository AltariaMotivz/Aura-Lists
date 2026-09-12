import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, Sun, Moon, LogOut } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const GlobalNav = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { userProfile } = useAuth();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.5rem 2rem',
      background: 'transparent',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255,255,255,0.1)'
    }}>
      {/* Brand Logo */}
      <div 
        onClick={() => navigate('/')}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          fontWeight: '700', 
          fontSize: '1.5rem', 
          fontFamily: 'var(--font-heading)',
          cursor: 'pointer',
          color: 'transparent',
          backgroundImage: 'linear-gradient(45deg, #FF6B6B, #93C5FD, #A78BFA)',
          WebkitBackgroundClip: 'text',
          textShadow: '0 0 20px rgba(167, 139, 250, 0.4)'
        }}
      >
        <Wand2 size={24} color="#A78BFA" /> Aura Wishlist
      </div>

      {/* Grouped Actions Cluster */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '32px', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        
        <button 
          onClick={toggleTheme} 
          style={{ 
            padding: '8px', 
            cursor: 'pointer', 
            background: 'transparent', 
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#A78BFA'
          }} 
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {userProfile && (
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)', border: '2px solid #A78BFA',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
          }}>
            {userProfile.photoURL ? (
              <img src={userProfile.photoURL} alt={userProfile.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '1rem', color: '#F5F3FF', fontWeight: 'bold' }}>
                {userProfile.displayName?.charAt(0) || '?'}
              </span>
            )}
          </div>
        )}
        
        <button 
          onClick={handleSignOut}
          style={{ 
            padding: '8px 16px', 
            fontSize: '0.9rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            background: 'transparent',
            border: 'none',
            color: '#C4B5FD',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default GlobalNav;
