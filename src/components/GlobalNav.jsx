import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, Sun, Moon, LogOut, Palette, X } from 'lucide-react';
import Dialog from './Dialog';
import AppearanceSettings from './AppearanceSettings';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { EnergyToggle } from './AuraExperience';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const GlobalNav = () => {
  const navigate = useNavigate();
  const [appearanceOpen,setAppearanceOpen]=useState(false);
  const { theme, toggleTheme } = useTheme();
  const { userProfile } = useAuth();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <header className="aura-global-header" style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
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
      <button type="button" className="aura-global-brand" aria-label="Aura Lists home"
        onClick={() => navigate('/')}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          fontWeight: '700', 
          fontSize: '1.5rem', 
          fontFamily: 'var(--font-heading)',
          cursor: 'pointer',
          border: 0,
          padding: 0,
          backgroundColor: 'transparent',
          color: 'transparent',
          backgroundImage: 'linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-primary))',
          WebkitBackgroundClip: 'text',
          textShadow: '0 0 20px var(--color-accent-glow)'
        }}
      >
        <Wand2 size={24} color="var(--color-accent-primary)" /> Aura Lists
      </button>

      {/* Grouped Actions Cluster */}
      <div className="aura-header-tools" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--color-glass-bg)', padding: '0.5rem', borderRadius: '32px', backdropFilter: 'blur(16px)', border: '1px solid var(--color-border)' }}>
        
        <EnergyToggle />
        <button className="aura-icon" aria-label="Choose appearance" onClick={()=>setAppearanceOpen(true)}><Palette size={18}/></button>
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
            color: 'var(--color-accent-primary)'
          }} 
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {userProfile && (
          <button aria-label="Open my profile" onClick={()=>navigate('/profile')} style={{
            cursor: 'pointer', padding: 0,
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'var(--color-glass-bg)', border: '2px solid var(--color-accent-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
          }}>
            {userProfile.photoURL ? (
              <img src={userProfile.photoURL} alt={userProfile.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '1rem', color: 'var(--color-text-primary)', fontWeight: 'bold' }}>
                {userProfile.displayName?.charAt(0) || '?'}
              </span>
            )}
          </button>
        )}
        
        <button 
          aria-label="Sign out"
          onClick={handleSignOut}
          style={{ 
            padding: '8px 16px', 
            fontSize: '0.9rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          <LogOut size={16} />
          <span className="signout-label">Sign Out</span>
        </button>
      </div>
      {appearanceOpen && <Dialog onClose={()=>setAppearanceOpen(false)} labelledBy="appearance-title"><div className="aura-preview-header"><h2 id="appearance-title">Your atmosphere.</h2><button className="aura-icon" aria-label="Close appearance" onClick={()=>setAppearanceOpen(false)}><X size={20}/></button></div><AppearanceSettings/></Dialog>}
    </header>
  );
};

export default GlobalNav;
