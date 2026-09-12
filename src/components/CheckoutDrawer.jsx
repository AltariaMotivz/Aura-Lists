import React, { useEffect, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function CheckoutDrawer({ pendingItem, onClose, onConfirmPurchase }) {
  const [hasReturned, setHasReturned] = useState(false);

  useEffect(() => {
    // Detect when the user leaves and refocuses the Aura Wishlist tab
    const handleFocus = () => setHasReturned(true);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  if (!pendingItem) return null;

  const handleConfirm = async () => {
    try {
      const itemRef = doc(db, 'wishlist', pendingItem.id);
      await updateDoc(itemRef, { purchased: true });
      if (onConfirmPurchase) onConfirmPurchase(pendingItem.id);
    } catch (err) {
      console.error('Failed to mark purchased', err);
    }
  };

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, width: '100%',
      background: hasReturned ? 'var(--color-bg-secondary)' : 'var(--color-bg-primary)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid var(--color-accent-primary)',
      boxShadow: hasReturned ? '0 -10px 30px var(--color-accent-glow)' : '0 -4px 15px rgba(0,0,0,0.1)',
      zIndex: 1000, padding: '1.5rem',
      transition: 'all var(--transition-base)'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <p style={{ fontSize: '1.1rem', color: 'var(--color-text-primary)', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)', fontWeight: '600' }}>
          {hasReturned 
            ? `Welcome back! Did you pick up "${pendingItem.name}"?` 
            : `Shopping for "${pendingItem.name}" in a new tab...`}
        </p>
        <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center' }}>
          <button 
            className="btn-glossy" 
            onClick={handleConfirm}
            style={{ maxWidth: '250px', width: '100%' }}
          >
            Yes, mark as purchased
          </button>
          <button 
            className="pill-badge" 
            onClick={onClose}
            style={{ maxWidth: '250px', width: '100%', justifyContent: 'center', background: 'transparent' }}
          >
            Just looking
          </button>
        </div>
      </div>
    </div>
  );
}
