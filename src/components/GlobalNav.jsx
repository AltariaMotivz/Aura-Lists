import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, Sun, Moon, LogOut } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useTheme } from '../contexts/ThemeContext';

const GlobalNav = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

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
      borderBottom: '1px solid var(--color-border)',
      background: 'var(--color-bg-primary)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Brand Logo */}
      <div 
        onClick={() => navigate('/')}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: 'var(--color-accent-primary)', 
          fontWeight: '700', 
          fontSize: '1.5rem', 
          fontFamily: 'var(--font-heading)',
          cursor: 'pointer'
        }}
      >
        <Wand2 size={24} /> Aura Wishlist
      </div>

      {/* Grouped Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={toggleTheme} 
          className="pill-badge" 
          style={{ padding: '8px', cursor: 'pointer', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }} 
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} color="var(--color-text-primary)" /> : <Moon size={18} color="var(--color-text-primary)" />}
        </button>
        
        <button 
          onClick={handleSignOut}
          className="btn-glossy"
          style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default GlobalNav;
