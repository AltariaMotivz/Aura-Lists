import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, Gift } from 'lucide-react';

const Navigation = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
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
    </div>
  );
};

export default Navigation;
