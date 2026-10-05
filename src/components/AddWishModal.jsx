import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const THEMES = ['Birthday', 'Wedding', 'Holiday', 'Tech', 'Books'];

const AddWishModal = ({ onClose, onAdded, initialData = null }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
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
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', textAlign: 'center', marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>
          {initialData ? 'Edit Wish' : 'Add a New Wish'}
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>Wish Title *</label>
            <input name="name" className="input-field" required value={formData.name} onChange={handleChange} placeholder="e.g., A Book of Spells" />
          </div>

          <div>
            <label style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>Gift Theme *</label>
            <select name="theme" className="input-field" required value={formData.theme} onChange={handleChange}>
              {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>Link to Item (optional)</label>
            <input name="link" type="url" className="input-field" value={formData.link} onChange={handleChange} placeholder="https://..." />
          </div>

          <div>
            <label style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>Price (optional)</label>
            <input name="price" type="number" step="0.01" min="0" className="input-field" value={formData.price} onChange={handleChange} placeholder="29.99" />
          </div>

          <div>
            <label style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>Image URL (optional)</label>
            <input name="imageURL" type="url" className="input-field" value={formData.imageURL} onChange={handleChange} placeholder="https://.../image.png" />
          </div>

          <div>
            <label style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>Notes (optional)</label>
            <textarea name="notes" rows="3" className="input-field" value={formData.notes} onChange={handleChange} placeholder="Any details..."></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="pill-badge" style={{ background: 'transparent', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : (initialData ? 'Save Changes' : 'Add Wish')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWishModal;
