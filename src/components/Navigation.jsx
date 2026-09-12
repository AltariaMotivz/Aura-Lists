import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Users, Gift, LogOut, Wand2 } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const Navigation = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <header style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      padding: '2rem',
      borderBottom: '1px solid var(--color-border)' 
    }}>
      <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wand2 size={24} color="var(--color-accent-primary)" /> Aura List
        </h1>
        <button 
          onClick={handleSignOut}
          className="pill-badge"
          style={{ cursor: 'pointer', background: 'transparent', border: '1px solid var(--color-accent-primary)', color: 'var(--color-accent-primary)' }}
        >
          <LogOut size={14} style={{ marginRight: '6px' }} />
          Sign Out
        </button>
      </div>
      
      <nav style={{ display: 'flex', gap: '1rem', background: 'var(--color-bg-secondary)', padding: '0.5rem', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-border)' }}>
        <NavLink 
          to="/"
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <Users size={18} style={{ marginRight: '8px' }} />
          Friends List
        </NavLink>
        <NavLink 
          to="/my-wishlist"
          className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <Gift size={18} style={{ marginRight: '8px' }} />
          My Wishlist
        </NavLink>
      </nav>
    </header>
  );
};

export default Navigation;
