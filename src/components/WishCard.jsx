import React, { useState, useId } from 'react';
import { ExternalLink, Edit2, Trash2, CheckCircle, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import AddWishModal from './AddWishModal';
import Dialog from './Dialog';
import styles from './WishCard.module.css';

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
  const bodyId = useId();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handlePointerMove = event => {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.energy === 'calm') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--card-x', `${(event.clientX - bounds.left) / bounds.width * 100}%`);
    event.currentTarget.style.setProperty('--card-y', `${(event.clientY - bounds.top) / bounds.height * 100}%`);
  };
  const theme = THEME_ACCENTS[item.theme] || THEME_ACCENTS.Default;

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const handleStoreRedirect = () => {
    if (isGuest && !item.purchased) {
      if (onExternalClick) {
        onExternalClick(item);
      } else {
        localStorage.setItem(`clicked_${item.id}`, 'true');
      }
    }
  };

  const handleMarkPurchased = async () => {
    setBusy(true); setError('');
    try {
      const collectionName = item.collectionName || 'wishes';
      const itemRef = doc(db, collectionName, item.id);
      await updateDoc(itemRef, { purchased: true });
      setShowPurchaseModal(false);
      if (onUpdate) onUpdate();
    } catch {
      setError('Could not mark this wish as purchased. Try again.');
    } finally { setBusy(false); }
  };

  const handleDelete = async () => {
    setBusy(true); setError('');
    try {
      const collectionName = item.collectionName || 'wishes';
      await deleteDoc(doc(db, collectionName, item.id));
      setShowDeleteModal(false);
      if (onUpdate) onUpdate();
    } catch {
      setError('Could not delete this wish. Try again.');
    } finally { setBusy(false); }
  };

  return (
    <div onPointerMove={handlePointerMove} data-expanded={isExpanded} className={`aura-enter ${styles.accordionCard} ${item.purchased ? styles.isClaimed : ''}`} style={{
      opacity: item.purchased ? 0.6 : 1,
    }}>

      {/* Accordion Header (Always Visible) */}
      <div
        className={styles.accordionHeader}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-controls={isExpanded ? bodyId : undefined}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsExpanded(value => !value); }
        }}
        onClick={() => setIsExpanded(value => !value)}
        style={{
          display: 'flex', alignItems: 'center', padding: '1.5rem', cursor: 'pointer',
          gap: '1.5rem', borderBottom: isExpanded ? '1px solid var(--color-glass-border)' : 'none'
        }}
      >
        <span className={styles.wishIcon} style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}>
          {theme.icon}
        </span>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <h3 className="chromatic-text" style={{ fontSize: '1.4rem', margin: 0, lineHeight: 1.2, overflowWrap: 'anywhere' }}>{item.name}</h3>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            {item.theme || 'Wish'}
          </span>
        </div>

        {item.price && (
          <div style={{ fontWeight: '700', fontSize: '1.3rem', color: 'var(--color-text-primary)' }}>
            ${Number(item.price).toFixed(2)}
          </div>
        )}

        <div style={{ color: 'var(--color-text-secondary)', marginLeft: '1rem', display: 'flex', alignItems: 'center' }}>
          {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </div>
      </div>

      {/* Accordion Body (Expanded) */}
      {isExpanded && (
        <div id={bodyId} className={styles.accordionBody} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--field-bg)' }}>

          {item.imageURL && <img className={styles.wishImage} src={item.imageURL} alt={item.name} loading="lazy" onError={event => { event.currentTarget.hidden = true; }} />}
          {item.notes && (
            <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', lineHeight: '1.6', margin: 0, padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
              {item.notes}
            </p>
          )}

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {item.purchased ? (
              <span className="pill-badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <CheckCircle size={16} style={{ marginRight: '6px' }} /> Claimed
              </span>
            ) : (
              <>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleStoreRedirect}
                    className="btn-glossy"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    Visit Store <ExternalLink size={16} />
                  </a>
                )}

                {isGuest && (
                  <button
                    className="btn-primary"
                    onClick={() => {setError('');setShowPurchaseModal(true);}}
                  >
                    Mark Bought
                  </button>
                )}
              </>
            )}

            {/* Owner Actions */}
            {isOwner && !item.purchased && (
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                <button className="pill-badge aura-action" aria-label={`Edit ${item.name}`} onClick={() => setShowEditModal(true)} style={{ padding: '8px', cursor: 'pointer' }}><Edit2 size={16} aria-hidden="true" /> Edit</button>
                <button className="pill-badge aura-action" aria-label={`Delete ${item.name}`} onClick={() => {setError('');setShowDeleteModal(true);}} style={{ padding: '8px', cursor: 'pointer', color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}><Trash2 size={16} aria-hidden="true" /> Delete</button>
              </div>
            )}
          </div>
        </div>
      )}

      {showPurchaseModal && <Dialog onClose={()=>{if(!busy)setShowPurchaseModal(false);}} labelledBy={`${bodyId}-purchase`}><CheckCircle className="universe-confirm-icon" size={40} /><h2 id={`${bodyId}-purchase`}>A wish, fulfilled.</h2><p className="aura-preview-description">Bought “{item.name}”? Mark it as purchased so other friends know it’s covered.</p><div className="universe-actions"><button className="btn-primary" disabled={busy} onClick={handleMarkPurchased}>{busy?'Saving…':'Yes, I bought it'}</button><button className="btn-glossy" disabled={busy} onClick={()=>setShowPurchaseModal(false)}>Just looking</button></div>{error && <p role="alert" className="aura-error">{error}</p>}</Dialog>}
      {showDeleteModal && <Dialog onClose={()=>{if(!busy)setShowDeleteModal(false);}} labelledBy={`${bodyId}-delete`}><AlertTriangle className="universe-danger" size={40} /><h2 id={`${bodyId}-delete`}>Let this wish go?</h2><p className="aura-preview-description">“{item.name}” will be permanently deleted. This cannot be undone.</p><div className="universe-actions"><button className="btn-glossy" disabled={busy} onClick={()=>setShowDeleteModal(false)}>Keep my wish</button><button className="btn-primary universe-danger" disabled={busy} onClick={handleDelete}>{busy?'Deleting…':'Delete wish'}</button></div>{error && <p role="alert" className="aura-error">{error}</p>}</Dialog>}

      {/* Edit Modal (renders globally) */}
      {showEditModal && (
        <AddWishModal
          onClose={() => setShowEditModal(false)}
          onAdded={() => {
            setShowEditModal(false);
            if (onUpdate) onUpdate();
          }}
          initialData={item}
        />
      )}

    </div>
  );
};

export default WishCard;
