import React, { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, onSnapshot, deleteDoc } from 'firebase/firestore';
import WishlistGrid from '../components/WishlistGrid';
import CheckoutDrawer from '../components/CheckoutDrawer';
import SkeletonGrid from '../components/SkeletonGrid';
import Dialog from '../components/Dialog';
import { PageHeading, EmptyScene } from '../components/UniverseScene';
import { UserMinus, Search, ArrowLeft, Gift } from 'lucide-react';
import { displayName } from '../utils/profile';
import { useAuth } from '../contexts/AuthContext';
export default function FriendWishlist() {
  const {friendId}=useParams();
  const {activeCategory,setActiveCategory,friends}=useOutletContext();
  const navigate=useNavigate();
  const {currentUser}=useAuth();
  const [friendProfile,setFriendProfile]=useState(null);
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);
  const [pendingCheckoutItem,setPendingCheckoutItem]=useState(null);
  const [search,setSearch]=useState('');
  const [status,setStatus]=useState('Available');
  const [removing,setRemoving]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const remove=async()=>{setBusy(true);setError('');try{await deleteDoc(doc(db,'users',currentUser.uid,'friends',friendId));navigate('/friends');}catch{setError('Could not remove this connection. Try again.');}finally{setBusy(false);}};
  useEffect(() => {
    // Strict temporal anchor and state obliteration
    setLoading(true);
    setItems([]);
    setFriendProfile(null);
    setSearch(''); setStatus('Available'); setError('');

    if (!friendId) return;

    // Reset category filter when visiting a friend's profile
    if (setActiveCategory) {
      setActiveCategory('All');
    }

    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const profileRef = doc(db, 'users', friendId);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists() && isMounted) {
          setFriendProfile({ uid: profileSnap.id, ...profileSnap.data() });
        }
      } catch {
        if(isMounted) setError('This profile could not be loaded. Try refreshing.');
      }
    };

    fetchProfile();

    let wishesData = [];
    let legacyData = [];

    const qWishes = query(collection(db, 'wishes'), where('ownerId', '==', friendId));
    const unsubscribeWishes = onSnapshot(qWishes, (snapshot) => {
      if (!isMounted) return;
      wishesData = snapshot.docs.map(d => ({ id: d.id, collectionName: 'wishes', ...d.data() }));
      setItems([...wishesData, ...legacyData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setLoading(false);
    }, () => { if(isMounted) {setLoading(false);setError('Some wishes could not be loaded. Please refresh to try again.');} });

    const qLegacy = query(collection(db, 'wishlist'), where('userId', '==', friendId));
    const unsubscribeLegacy = onSnapshot(qLegacy, (snapshot) => {
      if (!isMounted) return;
      legacyData = snapshot.docs.map(d => ({ id: d.id, collectionName: 'wishlist', ...d.data() }));
      setItems([...wishesData, ...legacyData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setLoading(false);
    }, () => { if(isMounted) {setLoading(false);setError('Some wishes could not be loaded. Please refresh to try again.');} });

    return () => {
      isMounted = false; // Temporal anchor
      unsubscribeWishes();
      unsubscribeLegacy();
    };
  }, [friendId, setActiveCategory]);

  const filtered=items.filter(item=>(activeCategory==='All'||item.theme===activeCategory||item.tags?.includes(activeCategory)) && (status==='All'||(status==='Claimed'?item.purchased:!item.purchased)) && `${item.name||''} ${item.notes||''}`.toLowerCase().includes(search.trim().toLowerCase()));
  return <div className="universe-page aura-enter"><Link className="universe-back" to="/friends"><ArrowLeft size={16} />Back to your people</Link><PageHeading eyebrow="A universe worth exploring" title={`${displayName(friendProfile?.displayName)}’s wishes`} description="Find what lights them up. Make a little magic happen.">{friends.some(friend=>friend.id===friendId) && <button className="btn-glossy universe-danger" onClick={()=>setRemoving(true)}><UserMinus size={16} />Remove friend</button>}</PageHeading><div className="glass-panel universe-friend-banner"><span className="universe-avatar">{friendProfile?.photoURL ? <img src={friendProfile.photoURL} alt="" /> : displayName(friendProfile?.displayName).charAt(0)}</span><div><strong>{friendProfile?.username?`@${friendProfile.username}`:'Their little corner of the universe'}</strong><p>{items.filter(item=>!item.purchased).length} available wishes · {items.filter(item=>item.purchased).length} gifts covered</p></div><Gift size={28} /></div><div className="aura-list-controls"><label className="aura-wish-search"><Search size={17} /><input type="search" aria-label="Search their wishes" placeholder="Find the perfect possibility…" value={search} onChange={event=>setSearch(event.target.value)} /></label><div className="aura-filter-tabs" aria-label="Gift availability">{['Available','Claimed','All'].map(value=><button key={value} aria-pressed={value===status} onClick={()=>setStatus(value)}>{value}</button>)}</div></div>{error && <p className="aura-error" role="alert">{error}</p>}{loading?<SkeletonGrid count={3} />:filtered.length?<WishlistGrid items={filtered} isOwner={friendId===currentUser.uid} isGuest={friendId!==currentUser.uid} onExternalClick={setPendingCheckoutItem} />:<EmptyScene title={items.length?'That possibility is still out there.':'A little space for new dreams.'} description={items.length?'Try another search, occasion or availability filter.':'When they add a wish, it will appear here.'}>{items.length>0 && <button className="btn-glossy" onClick={()=>{setSearch('');setStatus('All');setActiveCategory('All');}}>Show every wish</button>}</EmptyScene>}<CheckoutDrawer pendingItem={pendingCheckoutItem} onClose={()=>setPendingCheckoutItem(null)} onConfirmPurchase={()=>setPendingCheckoutItem(null)} />{removing && <Dialog onClose={()=>{if(!busy)setRemoving(false);}} labelledBy="remove-friend-title"><h2 id="remove-friend-title">Remove this connection?</h2><p className="aura-preview-description">{displayName(friendProfile?.displayName)} will leave your orbit. You can find and add them again later.</p><div className="universe-actions"><button className="btn-glossy" onClick={()=>setRemoving(false)} disabled={busy}>Keep connection</button><button className="btn-primary universe-danger" onClick={remove} disabled={busy}>{busy?'Removing…':'Remove friend'}</button></div>{error && <p className="aura-error" role="alert">{error}</p>}</Dialog>}</div>;
}
