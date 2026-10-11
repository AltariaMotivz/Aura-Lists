import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Sparkles, UserPlus, Check, ChevronRight } from 'lucide-react';
import useNotifications from '../hooks/useNotifications';
import { displayName as formatDisplayName } from '../utils/profile';
import { formatRelativeTime } from '../utils/social';

export default function NotificationBell() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead, loading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        type="button"
        className="aura-icon"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          position: 'relative',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all var(--transition-fast)'
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              minWidth: '17px',
              height: '17px',
              padding: '0 4px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #f43f5e, #ec4899)',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(244, 63, 94, 0.7)',
              border: '2px solid var(--surface-strong)',
              lineHeight: 1
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className="aura-enter"
          style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            right: 0,
            width: 'min(90vw, 360px)',
            maxHeight: '440px',
            background: 'var(--surface-strong)',
            backdropFilter: 'blur(30px) saturate(140%)',
            WebkitBackdropFilter: 'blur(30px) saturate(140%)',
            border: '1px solid var(--color-glass-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 15px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(var(--aura-accent-rgb), 0.12)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--color-glass-border)',
              background: 'rgba(255, 255, 255, 0.02)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="var(--color-accent-primary)" />
              <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--color-text-primary)' }}>
                Notifications
              </h3>
            </div>

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
          </div>

          {/* Notification List */}
          <div
            style={{
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                Checking notifications…
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'rgba(var(--aura-accent-rgb), 0.08)',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 0.75rem',
                  border: '1px solid rgba(var(--aura-accent-rgb), 0.2)'
                }}>
                  <Sparkles size={20} color="var(--color-accent-primary)" />
                </div>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                  All quiet in your orbit.
                </strong>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  When someone follows you or sends magic your way, you&rsquo;ll see it here.
                </p>
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
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.85rem 1.25rem',
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      background: notif.read
                        ? 'transparent'
                        : 'linear-gradient(90deg, rgba(var(--aura-accent-rgb), 0.08), rgba(var(--aura-alt-rgb), 0.04))',
                      transition: 'background var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = notif.read
                        ? 'transparent'
                        : 'linear-gradient(90deg, rgba(var(--aura-accent-rgb), 0.08), rgba(var(--aura-alt-rgb), 0.04))';
                    }}
                  >
                    {/* Sender Avatar */}
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: 'var(--color-glass-bg)',
                        border: '1px solid var(--color-border)',
                        display: 'grid',
                        placeItems: 'center',
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      {notif.senderPhotoURL ? (
                        <img src={notif.senderPhotoURL} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          {name.charAt(0)}
                        </span>
                      )}
                      {isFollow && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '-2px',
                            right: '-2px',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: 'var(--color-accent-primary)',
                            display: 'grid',
                            placeItems: 'center',
                            border: '2px solid var(--surface-strong)'
                          }}
                        >
                          <UserPlus size={9} color="#000" />
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
                        <strong>{name}</strong>{' '}
                        {isFollow ? 'started following your universe.' : 'sent an update.'}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
                        {notif.senderUsername && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-accent-primary)' }}>
                            @{notif.senderUsername}
                          </span>
                        )}
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Unread dot or arrow */}
                    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      {!notif.read ? (
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'var(--color-accent-primary)',
                            boxShadow: '0 0 8px var(--color-accent-primary)'
                          }}
                        />
                      ) : (
                        <ChevronRight size={14} color="var(--color-text-secondary)" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
