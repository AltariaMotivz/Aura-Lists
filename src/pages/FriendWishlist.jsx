import React, { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { db } from '../firebase';
import useWishes from '../hooks/useWishes';
import { doc, getDoc } from 'firebase/firestore';
import WishlistGrid from '../components/WishlistGrid';
import CheckoutDrawer from '../components/CheckoutDrawer';
import SkeletonGrid from '../components/SkeletonGrid';
import Dialog from '../components/Dialog';
import { PageHeading, EmptyScene } from '../components/UniverseScene';
import { UserMinus, UserPlus, Search, ArrowLeft, Gift } from 'lucide-react';
import { displayName } from '../utils/profile';
import { useAuth } from '../contexts/AuthContext';
import { followUser, unfollowUser } from '../utils/social';
export default function FriendWishlist() {
  const {friendId}=useParams();
  const {activeCategory,setActiveCategory,friends}=useOutletContext();
  const {currentUser}=useAuth();
  const [friendProfile,setFriendProfile]=useState(null);
  const {items,loading,error:wishError,retry}=useWishes([friendId]);
  const [pendingCheckoutItem,setPendingCheckoutItem]=useState(null);
  const [search,setSearch]=useState('');
  const [status,setStatus]=useState('Available');
  const [removing,setRemoving]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const isFollowing = friends.some(friend=>friend.id===friendId);
  const isSelf = currentUser && currentUser.uid === friendId;

  const handleFollow = async () => {
    if (!currentUser || isSelf) return;
    setBusy(true);
    setError('');
    try {
      await followUser(currentUser, friendId);
    } catch {
      setError('Could not follow this profile. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setError('');
    try {
      await unfollowUser(currentUser.uid, friendId);
      setRemoving(false);
    } catch {
      setError('Could not unfollow at this moment. Try again.');
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    // Strict temporal anchor and state obliteration

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

    return () => { isMounted = false; };
  }, [friendId, setActiveCategory]);

  const activeItems = items.filter(item => !item.isArchived && item.status !== 'received');
  const filtered = activeItems.filter(item => (activeCategory === 'All' || item.theme === activeCategory || item.tags?.includes(activeCategory)) && (status === 'All' || (status === 'Claimed' ? item.purchased : !item.purchased)) && `${item.name || ''} ${item.notes || ''}`.toLowerCase().includes(search.trim().toLowerCase()));
  return <div className="universe-page aura-enter"><Link className="universe-back" to="/friends"><ArrowLeft size={16} />Back to orbit</Link><PageHeading eyebrow="A universe worth exploring" title={`${displayName(friendProfile?.displayName)}’s wishes`} description="Find what lights them up. Make a little magic happen.">{!isSelf && (isFollowing ? <button className="btn-glossy universe-danger" onClick={()=>setRemoving(true)}><UserMinus size={16} />Unfollow</button> : <button className="btn-primary" onClick={handleFollow} disabled={busy}><UserPlus size={16} />{busy ? 'Following…' : 'Follow'}</button>)}</PageHeading><div className="glass-panel universe-friend-banner"><span className="universe-avatar">{friendProfile?.photoURL ? <img src={friendProfile.photoURL} alt="" /> : displayName(friendProfile?.displayName).charAt(0)}</span><div><strong>{friendProfile?.username?`@${friendProfile.username}`:'Their little corner of the universe'}</strong><p>{activeItems.filter(item=>!item.purchased).length} available wishes · {activeItems.filter(item=>item.purchased).length} gifts covered</p></div><Gift size={28} /></div><div className="aura-list-controls"><label className="aura-wish-search"><Search size={17} /><input type="search" aria-label="Search their wishes" placeholder="Find the perfect possibility…" value={search} onChange={event=>setSearch(event.target.value)} /></label><div className="aura-filter-tabs" aria-label="Gift availability">{['Available','Claimed','All'].map(value=><button key={value} aria-pressed={value===status} onClick={()=>setStatus(value)}>{value}</button>)}</div></div>{error && <p className="aura-error" role="alert">{error}</p>}{wishError && <p role="alert" className="aura-error">Some wishes could not load. <button className="btn-glossy" onClick={retry}>Try again</button></p>}{loading?<SkeletonGrid count={3} />:filtered.length?<WishlistGrid items={filtered} isOwner={friendId===currentUser.uid} isGuest={friendId!==currentUser.uid} onExternalClick={setPendingCheckoutItem} />:<EmptyScene title={activeItems.length?'That possibility is still out there.':'A little space for new dreams.'} description={activeItems.length?'Try another search, occasion or availability filter.':'When they add a wish, it will appear here.'}>{activeItems.length>0 && <button className="btn-glossy" onClick={()=>{setSearch('');setStatus('All');setActiveCategory('All');}}>Show every wish</button>}</EmptyScene>}<CheckoutDrawer pendingItem={pendingCheckoutItem} onClose={()=>setPendingCheckoutItem(null)} onConfirmPurchase={()=>setPendingCheckoutItem(null)} />{removing && <Dialog onClose={()=>{if(!busy)setRemoving(false);}} labelledBy="remove-friend-title"><h2 id="remove-friend-title">Unfollow {displayName(friendProfile?.displayName)}?</h2><p className="aura-preview-description">They will leave your orbit and their new wishes won’t appear in your feed. You can follow them again anytime.</p><div className="universe-actions"><button className="btn-glossy" onClick={()=>setRemoving(false)} disabled={busy}>Stay connected</button><button className="btn-primary universe-danger" onClick={remove} disabled={busy}>{busy?'Unfollowing…':'Unfollow'}</button></div>{error && <p className="aura-error" role="alert">{error}</p>}</Dialog>}</div>;
}
