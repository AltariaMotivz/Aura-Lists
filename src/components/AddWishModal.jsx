import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import Dialog from './Dialog';
import { useAuth } from '../contexts/AuthContext';

const THEMES = ['Birthday', 'Wedding', 'Holiday', 'Tech', 'Books'];

const AddWishModal = ({ onClose, onAdded, initialData = null }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    link: initialData?.link || '',
    price: initialData?.price || '',
    imageURL: initialData?.imageURL || '',
    notes: initialData?.notes || '',
    theme: initialData?.theme || THEMES[0]
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setError('');
    setLoading(true);

    try {
      if (initialData && initialData.id) {
        // Edit mode
        const collectionName = initialData.collectionName || 'wishes';
        const itemRef = doc(db, collectionName, initialData.id);
        await updateDoc(itemRef, {
          ...formData,
          tags: [formData.theme]
        });
      } else {
        // Add mode
        const newItem = {
          ...formData,
          ownerId: currentUser.uid,
          createdAt: new Date().toISOString(),
          purchased: false,
          tags: [formData.theme]
        };
        await addDoc(collection(db, 'wishes'), newItem);
      }
      
      if (onAdded) onAdded();
      onClose();
    } catch (err) {
      console.error('Failed to save wish', err);
      setError('Your wish could not be saved. Please try again.');
    }
    setLoading(false);
  };

  return (
    <Dialog onClose={onClose} labelledBy="wish-dialog-title">
        <h2 id="wish-dialog-title" style={{ fontFamily: 'var(--font-heading)', textAlign: 'center', marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>
          {initialData ? 'Edit Wish' : 'Add a New Wish'}
        </h2>
        
        <form onSubmit={handleSubmit} aria-busy={loading} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="wish-name" style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>Wish Title *</label>
            <input id="wish-name" name="name" className="input-field" required value={formData.name} onChange={handleChange} placeholder="e.g., A Book of Spells" />
          </div>

          <div>
            <label htmlFor="wish-theme" style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>Gift Theme *</label>
            <select id="wish-theme" name="theme" className="input-field" required value={formData.theme} onChange={handleChange}>
              {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="wish-link" style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>Link to Item (optional)</label>
            <input id="wish-link" name="link" type="url" className="input-field" value={formData.link} onChange={handleChange} placeholder="https://..." />
          </div>

          <div>
            <label htmlFor="wish-price" style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>Price (optional)</label>
            <input id="wish-price" name="price" type="number" step="0.01" min="0" className="input-field" value={formData.price} onChange={handleChange} placeholder="29.99" />
          </div>

          <div>
            <label htmlFor="wish-imageURL" style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>Image URL (optional)</label>
            <input id="wish-imageURL" name="imageURL" type="url" className="input-field" value={formData.imageURL} onChange={handleChange} placeholder="https://.../image.png" />
          </div>

          <div>
            <label htmlFor="wish-notes" style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>Notes (optional)</label>
            <textarea id="wish-notes" name="notes" rows="3" className="input-field" value={formData.notes} onChange={handleChange} placeholder="Any details..."></textarea>
          </div>

          {error && <p role="alert" className="aura-error">{error}</p>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="pill-badge" style={{ background: 'transparent', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : (initialData ? 'Save Changes' : 'Add Wish')}</button>
          </div>
        </form>
    </Dialog>
  );
};

export default AddWishModal;
