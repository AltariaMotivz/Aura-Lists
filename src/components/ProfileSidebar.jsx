import React, { useState } from 'react';
import { Camera, Share2, Save, Edit2, Check, X } from 'lucide-react';
import { db, storage } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';
import { displayName as readableName } from '../utils/profile';

const prefixes = (...values) => [...new Set(values.flatMap(value=>Array.from({length:value.length},(_,i)=>value.toLowerCase().slice(0,i+1))))];
export function ProfilePanel({ profile, isOwner, onSave, onPhoto, onShare, busy = false, error = '', notice = '', preview = false }) {
  const [editing,setEditing]=useState(false);
  const [name,setName]=useState(profile?.displayName || '');
  const [username,setUsername]=useState(profile?.username || '');
  const begin = () => {setName(profile?.displayName || '');setUsername(profile?.username || '');setEditing(true);};
  const save = async event => {event.preventDefault();if(await onSave({displayName:name.trim(),username:username.trim().replace(/^@/,'').toLowerCase()})) setEditing(false);};
  return <section className="glass-panel universe-profile aura-enter"><span className="aura-eyebrow">{isOwner?'Your signature':'In your orbit'}</span><div className="universe-profile-identity"><span className="universe-avatar universe-profile-avatar">{profile?.photoURL ? <img src={profile.photoURL} alt="" /> : readableName(profile?.displayName).charAt(0)}</span><div><h2>{profile?.displayName ? readableName(profile.displayName) : 'Make yourself known.'}</h2><p>{profile?.username ? `@${profile.username}` : 'Add a name and username so friends can find you.'}</p></div></div><div className="universe-actions">{isOwner && <><button className="btn-glossy" onClick={begin} disabled={busy}><Edit2 size={17} />Edit profile</button>{!preview && <label className="btn-glossy universe-photo-label"><Camera size={17} />{busy?'Please wait…':'Change photo'}<input type="file" accept="image/*" aria-label="Change profile photo" onChange={onPhoto} disabled={busy} /></label>}</>}<button className="btn-glossy" onClick={onShare} disabled={busy}><Share2 size={17} />{preview?'Try sharing':'Share my list'}</button></div>{editing && <form className="universe-profile-form" onSubmit={save}><label>Display name<input className="input-field" required maxLength={60} value={name} onChange={event=>setName(event.target.value)} /></label><label>Username<input className="input-field" required pattern="[A-Za-z0-9_]{3,30}" title="3–30 letters, numbers or underscores" value={username} onChange={event=>setUsername(event.target.value)} /></label><p>Friends can search for this name or username. Usernames aren’t guaranteed to be unique.</p><div className="universe-actions"><button className="btn-primary" disabled={busy || !name.trim()}><Save size={17} />{busy?'Saving…':'Save profile'}</button><button type="button" className="btn-glossy" onClick={()=>setEditing(false)} disabled={busy}><X size={17} />Cancel</button></div></form>}{error && <p role="alert" className="aura-error">{error}</p>}{notice && <p role="status" className="universe-notice"><Check size={17} />{notice}</p>}</section>;
}
export default function ProfileSidebar({profile,isOwner=false}) {
  const {currentUser,setUserProfile}=useAuth();
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const save = async updates => {
    if(!currentUser) return false;
    setBusy(true);setError('');setNotice('');
    try {const changes={...updates,searchableArray:prefixes(updates.displayName,updates.username)};await updateDoc(doc(db,'users',currentUser.uid),changes);setUserProfile(previous=>({...previous,...changes}));setNotice('Your signature is saved.');return true;}
    catch {setError('Your profile could not be saved. Please try again.');return false;}
    finally {setBusy(false);}
  };
  const photo = async event => {
    const input=event.target;const file=input.files?.[0];
    if(!file || !currentUser) return;
    setError('');setNotice('');
    if(!file.type.startsWith('image/') || file.size>5*1024*1024){setError('Choose an image smaller than 5 MB.');input.value='';return;}
    setBusy(true);
    try {const target=ref(storage,`profiles/${currentUser.uid}`);await uploadBytes(target,file);const photoURL=await getDownloadURL(target);await updateDoc(doc(db,'users',currentUser.uid),{photoURL});setUserProfile(previous=>({...previous,photoURL}));setNotice('Looking good. Your photo is updated.');}
    catch {setError('Your photo could not be uploaded. Try again.');}
    finally {setBusy(false);input.value='';}
  };
  const share = async () => {
    const uid=profile?.uid || currentUser?.uid;if(!uid)return;
    setError('');setNotice('');const url=`${window.location.origin}/friend/${uid}`;
    try {if(navigator.share) await navigator.share({title:`${profile?.displayName || 'My'} Aura List`,url});else {await navigator.clipboard.writeText(url);setNotice('List link copied. Friends will need to sign in to view it.');}}
    catch(err){if(err.name!=='AbortError')setError('Could not share the link. Please try again.');}
  };
  return <ProfilePanel profile={profile} isOwner={isOwner} onSave={save} onPhoto={photo} onShare={share} busy={busy} error={error} notice={notice} />;
}
