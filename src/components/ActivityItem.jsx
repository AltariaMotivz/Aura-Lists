import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ActivityItem.module.css';

const ActivityItem = ({ item, friend, onSelect }) => {
  const navigate = useNavigate();

  const open = () => onSelect ? onSelect() : navigate(`/friend/${friend.id}`);

  const formatDisplayName = (name) => {
    if (!name) return 'Someone';
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (phoneRegex.test(name)) return `User-...${name.slice(-4)}`;
    return name;
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'Just added';
    const seconds = Math.max(0, Math.floor((now - date) / 1000));
    
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className={`${styles.activityRow} aura-enter`} role="link" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') open(); }} onClick={open}>
      <div className={styles.avatar}>
        {friend?.photoURL ? (
          <img src={friend.photoURL} alt={formatDisplayName(friend.displayName)} />
        ) : (
          <span>{formatDisplayName(friend?.displayName).charAt(0)}</span>
        )}
      </div>
      
      <div className={styles.content}>
        <p className={styles.actionText}>
          <span className={styles.friendName}>{formatDisplayName(friend?.displayName)}</span> added a new wish: <span className={styles.itemName}>{item.name}</span>
        </p>
        
        <div className={styles.metaRow}>
          {item.tags && item.tags[0] && (
            <span className={styles.themeTag}>{item.tags[0]}</span>
          )}
          <span className={styles.timeAgo}>{getTimeAgo(item.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;
