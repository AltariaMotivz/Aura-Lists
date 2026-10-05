import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Gift, Users, UserRound } from 'lucide-react';
export default function MobileNavigation() {
  return <nav className="mobile-navigation" aria-label="Main navigation"><NavLink to="/" end><LayoutDashboard size={21}/><span>Home</span></NavLink><NavLink to="/my-wishlist"><Gift size={21}/><span>Wishes</span></NavLink><NavLink to="/friends"><Users size={21}/><span>Friends</span></NavLink><NavLink to="/profile"><UserRound size={21}/><span>Profile</span></NavLink></nav>;
}
