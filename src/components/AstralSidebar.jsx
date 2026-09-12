import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './AstralSidebar.module.css';
import { LayoutDashboard, Gift, Filter, Users } from 'lucide-react';

const CATEGORIES = ['All', 'Tech', 'Home', 'Apparel', 'Books', 'Other'];

const formatDisplayName = (nameOrPhone) => {
  if (!nameOrPhone) return 'Unknown';
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (phoneRegex.test(nameOrPhone)) {
    const lastFour = nameOrPhone.slice(-4);
    return `User-...${lastFour}`;
  }
  return nameOrPhone;
};

const AstralSidebar = ({ activeCategory, setActiveCategory, friends, loadingFriends }) => {
  return (
    <aside className={styles.astralMonolith}>
      
      <div className={styles.navSection}>
        <NavLink to="/" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`} end>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>
        <NavLink to="/my-wishlist" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
          <Gift size={18} /> My Wishlist
        </NavLink>
      </div>

      <div className={styles.divider} />

      <div className={styles.filterSection}>
        <h3 className={styles.sectionTitle}><Filter size={16} /> Occasions</h3>
        <div className={styles.pillContainer}>
          {CATEGORIES.map(category => (
            <button
              key={category}
              className={`${styles.categoryPill} ${activeCategory === category ? styles.activePill : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.friendsSection}>
        <h3 className={styles.sectionTitle}><Users size={16} /> Friends</h3>
        {loadingFriends ? (
          <p className={styles.loadingText}>Summoning friends...</p>
        ) : friends.length === 0 ? (
          <p className={styles.emptyText}>No friends yet.</p>
        ) : (
          <div className={styles.friendsList}>
            {friends.map(friend => (
              <NavLink 
                key={friend.id} 
                to={`/friend/${friend.id}`} 
                className={({ isActive }) => `${styles.friendItem} ${isActive ? styles.activeFriend : ''}`}
              >
                <div className={styles.friendAvatar}>
                  {friend.photoURL ? (
                    <img src={friend.photoURL} alt={friend.displayName} />
                  ) : (
                    <span>{formatDisplayName(friend.displayName).charAt(0)}</span>
                  )}
                </div>
                <div className={styles.friendInfo}>
                  <span className={styles.friendName}>{formatDisplayName(friend.displayName)}</span>
                  {friend.username && <span className={styles.friendHandle}>@{friend.username}</span>}
                </div>
              </NavLink>
            ))}
          </div>
        )}
      </div>

    </aside>
  );
};

export default AstralSidebar;
