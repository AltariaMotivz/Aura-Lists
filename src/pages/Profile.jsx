import React from 'react';
import AppearanceSettings from '../components/AppearanceSettings';
import { Link } from 'react-router-dom';
import { Gift, ArrowUpRight, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ProfileSidebar from '../components/ProfileSidebar';
import { PageHeading } from '../components/UniverseScene';
export default function Profile() {
  const {currentUser,userProfile}=useAuth();
  return <div className="universe-page aura-enter"><PageHeading eyebrow="Make it personal" title="Your kind of magic." description="A name, a face, and a universe of possibilities." /><ProfileSidebar profile={{...userProfile,uid:currentUser.uid}} isOwner /><section className="glass-panel profile-appearance"><h3>Your atmosphere</h3><AppearanceSettings/></section><div className="glass-panel universe-profile-tip"><Sparkles size={24} /><div><h3>Leave a little trail of inspiration.</h3><p>Give your wishes notes, links and photos. The easier they are to understand, the easier it is to make your day.</p></div><Link className="btn-primary" to="/my-wishlist"><Gift size={18} />My wishes<ArrowUpRight size={16} /></Link></div></div>;
}
