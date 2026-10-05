import React from 'react';
import WishCard from './WishCard';

const WishlistGrid = ({ items, isOwner, isGuest, onUpdate, onExternalClick, cardClassName, onAddWish }) => {
  if (!items || items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-secondary)' }}>
        <p style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>A little space for big dreams.</p>
        {isOwner && <p>Save that thing you keep thinking about.</p>}
        {isOwner && onAddWish && <button className="btn-primary" style={{ marginTop: '1.5rem' }} onClick={onAddWish}>+ Add your first wish</button>}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      alignItems: 'stretch'
    }}>
      {items.map(item => (
        <WishCard 
          key={item.id}
          item={item} 
          isOwner={isOwner} 
          isGuest={isGuest} 
          onUpdate={onUpdate}
          onExternalClick={onExternalClick}
          className={cardClassName}
        />
      ))}
    </div>
  );
};

export default WishlistGrid;
