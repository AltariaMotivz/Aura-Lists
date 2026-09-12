import React, { useState } from 'react';
import { ExternalLink, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import styles from './WishCard.module.css';
import { CrystalOrbEffect, LightningSwordEffect } from './Anomalies';

const THEME_ACCENTS = {
  Birthday: { bg: '#fce7f3', text: '#be185d', icon: '🎂' },
  Wedding: { bg: '#e0e7ff', text: '#4338ca', icon: '💍' },
  Holiday: { bg: '#dcfce7', text: '#15803d', icon: '🎄' },
  Tech: { bg: '#e0f2fe', text: '#0369a1', icon: '💻' },
  Books: { bg: '#fef3c7', text: '#b45309', icon: '📚' },
  Default: { bg: '#f5f3ff', text: '#7c3aed', icon: '✨' }
};

const WishCard = ({ 
  item, 
  isOwner, 
  isGuest = false,
  onUpdate,
  onExternalClick
}) => {
  const [imageError, setImageError] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  
  const theme = THEME_ACCENTS[item.theme] || THEME_ACCENTS.Default;

  // Determine Anomaly Status based on name
  const isCrystalOrb = item.name?.toLowerCase().includes('orb') || item.name?.toLowerCase().includes('crystal');
  const isLightningSword = item.name?.toLowerCase().includes('sword') || item.name?.toLowerCase().includes('lightning');

  const handleStoreRedirect = (e) => {
    if (isGuest && !item.purchased) {
      if (onExternalClick) {
        onExternalClick(item);
      } else {
        localStorage.setItem(`clicked_${item.id}`, 'true');
      }
    }
  };

  const handleMarkPurchased = async () => {
    try {
      const itemRef = doc(db, 'wishlist', item.id);
      await updateDoc(itemRef, { purchased: true });
      setShowPurchaseModal(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to mark purchased', err);
    }
  };

  return (
    <div className={`${styles.liquidGlassCard} ${item.purchased ? 'is-claimed' : ''}`} style={{ 
      opacity: item.purchased ? 0.7 : 1, transform: item.purchased ? 'scale(0.98)' : ''
    }}>
      
      <div className={styles.forestFrame} />
      
      {/* Media Container */}
      <div style={{ width: '100%', height: '220px', position: 'relative', overflow: 'hidden', backgroundColor: 'var(--color-bg-secondary)', zIndex: 1 }}>
        <span 
          style={{ 
            position: 'absolute', top: '12px', left: '12px', zIndex: 10,
            backgroundColor: theme.bg, color: theme.text, padding: '4px 10px',
            borderRadius: 'var(--radius-pill)', fontSize: '0.85rem', fontWeight: '600',
            display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}
        >
          {theme.icon} {item.theme || 'Wish'}
        </span>

        {isCrystalOrb && <CrystalOrbEffect />}
        {isLightningSword && <LightningSwordEffect />}

        {item.imageURL && !imageError ? (
          <img 
            src={item.imageURL} 
            alt={item.name} 
            onError={() => setImageError(true)} 
            loading="lazy" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ 
            width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `radial-gradient(circle, ${theme.bg} 0%, var(--color-bg-secondary) 100%)`
          }}>
            <span style={{ fontSize: '4rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))', zIndex: 2 }}>{theme.icon}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', zIndex: 2, position: 'relative' }}>
        <div>
          <h3 className={styles.primaryText} style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{item.name}</h3>
          {item.price && <p style={{ fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '1rem', fontSize: '1.1rem' }}>${Number(item.price).toFixed(2)}</p>}
        </div>

        {item.notes && <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', flex: 1, lineHeight: '1.5' }}>{item.notes}</p>}

        <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {item.purchased ? (
            <span className="pill-badge" style={{ background: theme.bg, color: theme.text, border: 'none' }}>
              <CheckCircle size={14} style={{ marginRight: '4px' }} /> Claimed ✨
            </span>
          ) : (
            <>
              {item.link ? (
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  onClick={handleStoreRedirect}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    color: 'var(--color-accent-primary)', textDecoration: 'none',
                    fontWeight: '600', fontSize: '0.95rem'
                  }}
                >
                  Visit Store <ExternalLink size={14} />
                </a>
              ) : <div />}

              {isGuest && (
                <button 
                  className={styles.markBoughtBtn}
                  onClick={() => setShowPurchaseModal(true)}
                >
                  Mark Bought
                </button>
              )}
            </>
          )}

          {/* Owner Actions */}
          {isOwner && !item.purchased && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="pill-badge" style={{ padding: '6px', background: 'transparent' }}><Edit2 size={16} /></button>
              <button className="pill-badge" style={{ padding: '6px', background: 'transparent', color: '#ef4444', borderColor: '#fca5a5' }}><Trash2 size={16} /></button>
            </div>
          )}
        </div>
      </div>

      {/* Inline Purchase Modal */}
      {showPurchaseModal && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '2rem', textAlign: 'center', zIndex: 20
        }}>
          <h4 className={styles.primaryText} style={{ marginBottom: '1rem', fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>Did you buy this?</h4>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
            Marking this as purchased hides it from other guests to prevent duplicates!
          </p>
          <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
            <button className="btn-glossy" onClick={handleMarkPurchased} style={{ flex: 1, padding: '10px' }}>Confirm</button>
            <button className="pill-badge" onClick={() => setShowPurchaseModal(false)} style={{ flex: 1, cursor: 'pointer', background: 'transparent' }}>Cancel</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default WishCard;
