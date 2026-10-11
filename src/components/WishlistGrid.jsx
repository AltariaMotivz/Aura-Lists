import React from 'react';
import WishCard from './WishCard';
import { isValidPriority } from '../utils/priority';

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

  const hasPrioritized = items.some(i => isValidPriority(i.priority));

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      alignItems: 'stretch'
    }}>
      {items.map((item, index) => {
        const isFirstUnranked = hasPrioritized && !isValidPriority(item.priority) && isValidPriority(items[index - 1]?.priority);

        return (
          <React.Fragment key={item.id}>
            {isFirstUnranked && (
              <div className="aura-wish-section-divider" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                margin: '0.75rem 0 0',
                color: 'var(--color-text-secondary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                letterSpacing: '0.6px',
                textTransform: 'uppercase'
              }}>
                <span style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, transparent, var(--color-glass-border))' }} />
                <span>Other Possibilities</span>
                <span style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, var(--color-glass-border), transparent)' }} />
              </div>
            )}
            <WishCard 
              item={item} 
              isOwner={isOwner} 
              isGuest={isGuest} 
              onUpdate={onUpdate}
              onExternalClick={onExternalClick}
              className={cardClassName}
              allWishes={items}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default WishlistGrid;
