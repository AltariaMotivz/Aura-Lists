import React, { useState } from 'react';
import Dialog from './Dialog';
import { db } from '../firebase';
import { applyReorderedPriorities, applyPriorityChange, getPriorityBadgeInfo, isValidPriority } from '../utils/priority';
import { Sparkles, ArrowUp, ArrowDown, X, Plus, Move } from 'lucide-react';
import styles from './WishCard.module.css';

export default function PrioritizeOrbitModal({ wishes = [], onClose }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Directly derive ranked and unranked lists from the real-time wishes prop
  const rankedList = wishes
    .filter(w => isValidPriority(w.priority))
    .sort((a, b) => a.priority - b.priority);

  const unrankedList = wishes.filter(w => !isValidPriority(w.priority));

  // Move an item up or down in the ranked order
  const moveItem = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= rankedList.length) return;

    const nextList = [...rankedList];
    const [moved] = nextList.splice(index, 1);
    nextList.splice(targetIndex, 0, moved);
    setBusy(true);
    setError('');
    try {
      await applyReorderedPriorities(db, wishes, nextList.map(w => w.id));
      setNotice('Orbit updated.');
      setTimeout(() => setNotice(''), 2500);
    } catch (err) {
      console.error('Failed to reorder wishes', err);
      setError('Could not update priority order. Try again.');
    } finally {
      setBusy(false);
    }
  };

  // Add an unranked wish to the bottom of the ranked list
  const addWishToRank = async (wish) => {
    const nextRank = rankedList.length + 1;
    setBusy(true);
    setError('');
    try {
      await applyPriorityChange(db, wishes, wish.id, nextRank);
      setNotice(`Added to rank #${nextRank}.`);
      setTimeout(() => setNotice(''), 2500);
    } catch (err) {
      console.error('Failed to prioritize wish', err);
      setError('Could not prioritize wish. Try again.');
    } finally {
      setBusy(false);
    }
  };

  // Remove a wish from the ranked list
  const removeWishFromRank = async (wish) => {
    setBusy(true);
    setError('');
    try {
      await applyPriorityChange(db, wishes, wish.id, null);
      setNotice('Priority removed.');
      setTimeout(() => setNotice(''), 2500);
    } catch (err) {
      console.error('Failed to clear priority', err);
      setError('Could not remove priority. Try again.');
    } finally {
      setBusy(false);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const nextList = [...rankedList];
    const [moved] = nextList.splice(draggedIndex, 1);
    nextList.splice(targetIndex, 0, moved);

    setDraggedIndex(null);
    setBusy(true);
    setError('');
    try {
      await applyReorderedPriorities(db, wishes, nextList.map(w => w.id));
      setNotice('Orbit order updated.');
      setTimeout(() => setNotice(''), 2500);
    } catch (err) {
      console.error('Failed to reorder wishes', err);
      setError('Could not update priority order. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog onClose={() => { if (!busy) onClose(); }} labelledBy="priority-modal-title">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <span className="aura-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} /> Harmonic Orbit
        </span>
        <h2 id="priority-modal-title" style={{ fontFamily: 'var(--font-heading)', margin: '0.25rem 0 0.5rem', color: 'var(--color-text-primary)' }}>
          Prioritize Your Wishes
        </h2>
        <p className="aura-dialog-subtitle" style={{ margin: 0 }}>
          Rank your highest hopes. Friends will automatically see your prioritized items first.
        </p>
      </div>

      {notice && <p role="status" className="universe-notice" style={{ textAlign: 'center' }}>{notice}</p>}
      {error && <p role="alert" className="aura-error" style={{ textAlign: 'center' }}>{error}</p>}

      {/* Ranked Items Area */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-accent-primary)' }}>
            Top Priority Orbit ({rankedList.length})
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            Drag or use arrows to reorder
          </span>
        </div>

        {rankedList.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--color-glass-border)' }}>
            <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.95rem' }}>
              No wishes prioritized yet. Tap &ldquo;+ Prioritize&rdquo; on any wish below to give it a place in your orbit.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
            {rankedList.map((item, index) => {
              const badge = getPriorityBadgeInfo(index + 1);
              return (
                <div
                  key={item.id}
                  draggable={!busy}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: index === 0 ? 'rgba(253, 224, 71, 0.08)' : index === 1 ? 'rgba(192, 132, 252, 0.08)' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${index === 0 ? 'rgba(253, 224, 71, 0.35)' : index === 1 ? 'rgba(192, 132, 252, 0.3)' : 'var(--color-glass-border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    cursor: busy ? 'wait' : 'grab',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <span style={{ color: 'var(--color-text-secondary)', cursor: 'grab', display: 'flex', alignItems: 'center' }} title="Drag to reorder">
                    <Move size={16} />
                  </span>

                  <span className={`${styles.priorityBadge} ${styles[badge.className] || ''}`} style={{ flexShrink: 0 }}>
                    {badge.icon} #{index + 1}
                  </span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </div>
                    {item.price && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        ${Number(item.price).toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      type="button"
                      className="pill-badge"
                      style={{ padding: '6px', background: 'transparent', cursor: index === 0 || busy ? 'default' : 'pointer', opacity: index === 0 || busy ? 0.3 : 1 }}
                      disabled={index === 0 || busy}
                      onClick={() => moveItem(index, -1)}
                      title="Move up"
                      aria-label={`Move ${item.name} up`}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      className="pill-badge"
                      style={{ padding: '6px', background: 'transparent', cursor: index === rankedList.length - 1 || busy ? 'default' : 'pointer', opacity: index === rankedList.length - 1 || busy ? 0.3 : 1 }}
                      disabled={index === rankedList.length - 1 || busy}
                      onClick={() => moveItem(index, 1)}
                      title="Move down"
                      aria-label={`Move ${item.name} down`}
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      className="pill-badge"
                      style={{ padding: '6px', background: 'transparent', cursor: busy ? 'default' : 'pointer', color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                      disabled={busy}
                      onClick={() => removeWishFromRank(item)}
                      title="Clear priority"
                      aria-label={`Remove priority for ${item.name}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Unranked Items Pool */}
      {unrankedList.length > 0 && (
        <div>
          <div style={{ marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Other Wishes ({unrankedList.length})
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
            {unrankedList.map(item => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  padding: '0.6rem 0.9rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--color-glass-border)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-glossy"
                  style={{ padding: '4px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  disabled={busy}
                  onClick={() => addWishToRank(item)}
                >
                  <Plus size={13} /> Prioritize
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
        <button type="button" className="btn-primary" onClick={onClose} disabled={busy}>
          Done Prioritizing
        </button>
      </div>
    </Dialog>
  );
}
