import React, { useEffect, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { Check, Gift } from 'lucide-react';
import { db } from '../firebase';
import Dialog from './Dialog';
export default function CheckoutDrawer({pendingItem,onClose,onConfirmPurchase}) {
  const [returned,setReturned]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>{setReturned(false);setError('');const focus=()=>setReturned(true);window.addEventListener('focus',focus);return()=>window.removeEventListener('focus',focus);},[pendingItem?.id]);
  if(!pendingItem)return null;
  const confirm=async()=>{setBusy(true);setError('');try{await updateDoc(doc(db,pendingItem.collectionName || 'wishes',pendingItem.id),{purchased:true});onConfirmPurchase?.(pendingItem.id);window.dispatchEvent(new CustomEvent('aura-wish-saved'));}catch{setError('Could not mark this gift as purchased. Try again.');}finally{setBusy(false);}};
  return <Dialog onClose={()=>{if(!busy)onClose();}} labelledBy="checkout-title"><div className="universe-confirm-icon"><Gift size={32} /></div><span className="aura-eyebrow">A little generosity</span><h2 id="checkout-title">{returned?'Welcome back. Make their day?':'Found the perfect gift?'}</h2><p className="aura-preview-description">If you bought “{pendingItem.name}”, mark it as purchased so other friends know it’s covered.</p><div className="universe-actions"><button className="btn-primary" onClick={confirm} disabled={busy}><Check size={18} />{busy?'Saving…':'Yes, I bought it'}</button><button className="btn-glossy" onClick={onClose} disabled={busy}>Just looking</button></div>{error && <p role="alert" className="aura-error">{error}</p>}</Dialog>;
}
