import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, Sun, Moon, LogOut, Palette, X } from 'lucide-react';
import Dialog from './Dialog';
import AppearanceSettings from './AppearanceSettings';
import NotificationBell from './NotificationBell';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { EnergyToggle } from './AuraExperience';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

import styles from './GlobalNav.module.css';

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
    <header className={`aura-global-header ${styles.header}`}>
      {/* Brand Logo */}
      <button
        type="button"
        className={`aura-global-brand ${styles.brand}`}
        aria-label="Aura Lists home"
        onClick={() => navigate('/')}
      >
        <Wand2 size={22} color="var(--color-accent-primary)" /> Aura Lists
      </button>

      {/* Grouped Actions Cluster */}
      <div className={`aura-header-tools ${styles.toolsCluster}`}>
        <NotificationBell />
        <EnergyToggle />
        <button
          className="aura-icon"
          aria-label="Choose appearance"
          onClick={() => setAppearanceOpen(true)}
          style={{ width: '36px', height: '36px' }}
        >
          <Palette size={18} />
        </button>
        <button 
          onClick={toggleTheme} 
          className={styles.toolButton}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        {userProfile && (
          <button
            className={styles.avatarButton}
            aria-label="Open my profile"
            onClick={() => navigate('/profile')}
          >
            {userProfile.photoURL ? (
              <img src={userProfile.photoURL} alt={userProfile.displayName || ''} />
            ) : (
              <span className={styles.avatarInitial}>
                {userProfile.displayName?.charAt(0) || '?'}
              </span>
            )}
          </button>
        )}
        
        <button 
          aria-label="Sign out"
          onClick={handleSignOut}
          className={styles.signOutButton}
        >
          <LogOut size={16} />
          <span className="signout-label">Sign Out</span>
        </button>
      </div>
      {appearanceOpen && (
        <Dialog onClose={() => setAppearanceOpen(false)} labelledBy="appearance-title">
          <div className="aura-preview-header">
            <h2 id="appearance-title">Your atmosphere.</h2>
            <button className="aura-icon" aria-label="Close appearance" onClick={() => setAppearanceOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <AppearanceSettings />
        </Dialog>
      )}
    </header>
  );
};

export default GlobalNav;
