import React, { useRef, useState } from 'react';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { Search, UserPlus, Check, X } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Dialog from './Dialog';
import { displayName } from '../utils/profile';

export default function FindFriendDialog({ friends = [], onClose }) {
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(null);
  const [added, setAdded] = useState([]);
  const [error, setError] = useState('');
  const request = useRef(0);
  const find = async event => {
    event.preventDefault();
    const term = search.trim().replace(/^@/, '').toLowerCase();
    if (!term) return;
    const attempt = ++request.current;
    setBusy(true); setError(''); setSearched(false); setResults([]);
    try {
      const snapshot = await getDocs(query(collection(db, 'users'), where('searchableArray', 'array-contains', term)));
      if (attempt === request.current) { setResults(snapshot.docs.map(d=>({id:d.id,...d.data()})).filter(user=>user.id!==currentUser.uid)); setSearched(true); }
    } catch { if (attempt === request.current) setError('Could not search right now. Please try again.'); }
    finally { if (attempt === request.current) setBusy(false); }
  };
  const add = async id => {
    setAdding(id); setError('');
    try { await setDoc(doc(db,'users',currentUser.uid,'friends',id),{addedAt:new Date().toISOString()}); setAdded(previous=>[...previous,id]); }
    catch { setError('That connection could not be saved. Try again.'); }
    finally { setAdding(null); }
  };
  return <Dialog onClose={()=>{if(!adding) onClose();}} labelledBy="find-friend-title"><div className="aura-preview-header"><div><span className="aura-eyebrow">Expand your orbit</span><h2 id="find-friend-title">Find your people.</h2></div><button className="aura-icon" aria-label="Close friend search" disabled={!!adding} onClick={onClose}><X size={20} /></button></div><p className="aura-preview-description">Search by the name or username they’ve set on their profile.</p><form className="universe-find-form" onSubmit={find}><input className="input-field" aria-label="Name or username" placeholder="Name or @username" value={search} onChange={event=>{setSearch(event.target.value);request.current++;setBusy(false);setSearched(false);setResults([]);}} required /><button className="btn-primary" aria-label="Search for a friend" disabled={busy || !search.trim()}><Search size={18} /></button></form><div className="universe-search-results" aria-live="polite">{busy && <p>Looking for your people…</p>}{searched && !results.length && <p>No matches. Try their username or ask them to complete their profile.</p>}{results.map(person=>{const connected=added.includes(person.id)||friends.some(friend=>friend.id===person.id);return <div className="universe-person-result" key={person.id}><div><strong>{displayName(person.displayName)}</strong><p>{person.username && `@${person.username}`}</p></div><button className="btn-glossy" disabled={connected||!!adding} onClick={()=>add(person.id)}>{connected ? <Check size={16} /> : <UserPlus size={16} />}{connected?'Connected':adding===person.id?'Adding…':'Add'}</button></div>;})}</div>{error && <p role="alert" className="aura-error">{error}</p>}</Dialog>;
}
