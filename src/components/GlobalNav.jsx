import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Sparkles, Sun, Moon, LogOut, Users, Gift } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useTheme } from '../contexts/ThemeContext';

export default function GlobalNav() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function handleSignOut() {
    setBusy(true);
    setError('');
    try { await signOut(auth); navigate('/login'); }
    catch { setError('Could not sign out. Please try again.'); }
    finally { setBusy(false); }
  }
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="aura-header">
      <Link className="aura-brand" to="/"><Sparkles size={23} aria-hidden="true" /> Aura Lists</Link>
      <nav className="aura-nav" aria-label="Main navigation">
        <NavLink end to="/" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}><Users size={18} aria-hidden="true" /> Friends</NavLink>
        <NavLink to="/my-wishlist" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}><Gift size={18} aria-hidden="true" /> My wishes</NavLink>
      </nav>
      <div className="aura-header-actions">
        <button className="aura-icon-button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>{theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}</button>
        <button className="btn-glossy" aria-label="Sign out" onClick={handleSignOut} disabled={busy}><LogOut size={16} aria-hidden="true" /><span>{busy ? 'Signing out…' : 'Sign out'}</span></button>
      </div>
    </header>
    {error && <p role="alert" className="aura-error">{error}</p>}
  </>;
}
