import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useOutletContext } from 'react-router-dom';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { DashboardScene } from '../components/UniverseScene';
import FindFriendDialog from '../components/FindFriendDialog';
import AddWishModal from '../components/AddWishModal';
import SkeletonGrid from '../components/SkeletonGrid';

export default function Dashboard() {
  const { userProfile } = useAuth();
  const { friends, loadingFriends } = useOutletContext();
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showAddWish, setShowAddWish] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [activityError,setActivityError]=useState('');
  useEffect(() => {
    if (loadingFriends) return;
    
    if (!friends || friends.length === 0) {
      setActivities([]);
      setLoadingActivities(false);
      return;
    }

    let isMounted = true;
    setActivityError('');
    setLoadingActivities(true);

    const unsubscribes = [];
    const stateRef = { wishes: {}, wishlist: {} };

    const updateState = () => {
      if (!isMounted) return;
      const allActivities = [];
      Object.values(stateRef.wishes).forEach(arr => allActivities.push(...arr));
      Object.values(stateRef.wishlist).forEach(arr => allActivities.push(...arr));
      const sorted = allActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setActivities(sorted.slice(0, 20));
      setLoadingActivities(false);
    };

    friends.forEach(friend => {
      const qW = query(collection(db, 'wishes'), where('ownerId', '==', friend.id));
      const unsubW = onSnapshot(qW, (snap) => {
        stateRef.wishes[friend.id] = snap.docs.map(d => ({ ...d.data(), id: d.id, collectionName: 'wishes', friend }));
        updateState();
      }, (error) => {
        console.error("Error fetching wishes for friend:", friend.id, error);
        if(isMounted) setActivityError('Some recent wishes could not load. You can still explore your friends’ lists.');
        // Continue updating state even if one friend fails
        updateState();
      });
      unsubscribes.push(unsubW);

      const qL = query(collection(db, 'wishlist'), where('userId', '==', friend.id));
      const unsubL = onSnapshot(qL, (snap) => {
        stateRef.wishlist[friend.id] = snap.docs.map(d => ({ ...d.data(), id: d.id, collectionName: 'wishlist', friend }));
        updateState();
      }, (error) => {
        console.error("Error fetching legacy wishlist for friend:", friend.id, error);
        if(isMounted) setActivityError('Some recent wishes could not load. You can still explore your friends’ lists.');
        updateState();
      });
      unsubscribes.push(unsubL);
    });

    return () => {
      isMounted = false;
      unsubscribes.forEach(unsub => unsub());
    };
  }, [friends, loadingFriends]);

  return <div className="aura-enter universe-page">{activityError && <p role="alert" className="aura-error">{activityError}</p>}{loadingFriends || loadingActivities ? <SkeletonGrid count={3} /> : <DashboardScene friends={friends} activities={activities} name={userProfile?.displayName} onAddFriend={()=>setShowAddFriend(true)} onAddWish={()=>setShowAddWish(true)} />}{showAddFriend && <FindFriendDialog friends={friends} onClose={()=>setShowAddFriend(false)} />}{showAddWish && <AddWishModal onClose={()=>setShowAddWish(false)} />}</div>;
}
