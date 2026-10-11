import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Bell, Sparkles, UserPlus, Check, ChevronRight, X } from 'lucide-react';
import useNotifications from '../hooks/useNotifications';
import { displayName as formatDisplayName } from '../utils/profile';
import { formatRelativeTime } from '../utils/social';
import styles from './NotificationBell.module.css';

export default function NotificationBell() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead, loading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const [posStyle, setPosStyle] = useState({});

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const isMobile = window.innerWidth <= 640;
    if (isMobile) {
      setPosStyle({
        top: '72px',
        left: '12px',
        right: '12px',
        width: 'auto',
        maxWidth: '420px',
        margin: '0 auto',
        maxHeight: 'calc(100svh - 155px)'
      });
    } else {
      const rect = buttonRef.current.getBoundingClientRect();
      const width = 360;
      let left = rect.left + rect.width / 2 - width / 2;
      // Clamp within viewport margins
      if (left + width > window.innerWidth - 16) {
        left = window.innerWidth - width - 16;
      }
      if (left < 16) {
        left = 16;
      }
      setPosStyle({
        top: `${rect.bottom + 10}px`,
        left: `${left}px`,
        width: `${width}px`,
        maxHeight: '480px'
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setIsOpen(false);
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, updatePosition]);

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      await markRead(notif.id);
    }
    setIsOpen(false);
    if (notif.senderId) {
      navigate(`/friend/${notif.senderId}`);
    }
  };

  return (
    <div className={styles.container}>
      {/* Bell Button */}
      <button
        ref={buttonRef}
        type="button"
        className={styles.bellButton}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(prev => !prev)}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className={styles.unreadBadge}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Portal */}
      {isOpen && createPortal(
        <>
          {/* Backdrop */}
          <div
            className={styles.backdrop}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Window */}
          <div
            className={styles.popover}
            style={posStyle}
            role="dialog"
            aria-label="Notifications"
            aria-modal="true"
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerTitle}>
                <Sparkles size={16} color="var(--color-accent-primary)" />
                <h3>Notifications</h3>
              </div>

              <div className={styles.headerActions}>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="btn-glossy"
                    onClick={markAllRead}
                    style={{
                      fontSize: '0.72rem',
                      padding: '3px 10px',
                      fontWeight: 600,
                      color: 'var(--color-accent-primary)',
                      border: '1px solid rgba(var(--aura-accent-rgb), 0.3)'
                    }}
                  >
                    <Check size={12} style={{ marginRight: '4px' }} /> Mark all read
                  </button>
                )}
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={() => setIsOpen(false)}
                  aria-label="Close notifications"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className={styles.list}>
              {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  Checking notifications…
                </div>
              ) : notifications.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyOrb}>
                    <Sparkles size={20} />
                  </div>
                  <strong>All quiet in your orbit.</strong>
                  <p>When someone follows you or sends magic your way, you&rsquo;ll see it here.</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const name = formatDisplayName(notif.senderName);
                  const isFollow = notif.type === 'follow';

                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleNotificationClick(notif);
                        }
                      }}
                      className={`${styles.notifItem} ${!notif.read ? styles.notifItemUnread : ''}`}
                    >
                      {/* Sender Avatar */}
                      <div className={styles.avatarContainer}>
                        {notif.senderPhotoURL ? (
                          <img src={notif.senderPhotoURL} alt={name} />
                        ) : (
                          <span className={styles.avatarInitial}>
                            {name.charAt(0)}
                          </span>
                        )}
                        {isFollow && (
                          <span className={styles.followIconBadge}>
                            <UserPlus size={9} color="#000" />
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className={styles.notifContent}>
                        <p className={styles.notifText}>
                          <strong>{name}</strong>{' '}
                          {isFollow ? 'started following your universe.' : 'sent an update.'}
                        </p>
                        <div className={styles.notifMeta}>
                          {notif.senderUsername && (
                            <span className={styles.notifHandle}>
                              @{notif.senderUsername}
                            </span>
                          )}
                          <span className={styles.notifTime}>
                            {formatRelativeTime(notif.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Unread dot or arrow */}
                      {!notif.read ? (
                        <span className={styles.unreadDot} />
                      ) : (
                        <ChevronRight size={14} color="var(--color-text-secondary)" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
