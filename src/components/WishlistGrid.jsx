import React from 'react';
import WishCard from './WishCard';

const WishlistGrid = ({ items, isOwner, isGuest, onUpdate, onExternalClick, cardClassName }) => {
  if (!items || items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-secondary)' }}>
        <p style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>No items found.</p>
        {isOwner && <p>Click the '+' button to add your first wish!</p>}
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
