import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import useWishes from '../hooks/useWishes';
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
  const {items,loading:loadingActivities,error:activityError,retry}=useWishes(loadingFriends ? [] : friends.map(friend=>friend.id));
  const byId=new Map(friends.map(friend=>[friend.id,friend]));
  const activities=items.map(item=>({...item,friend:byId.get(item.ownerId || item.userId)})).filter(item=>item.friend).slice(0,20);

  return <div className="aura-enter universe-page">{activityError && <p role="alert" className="aura-error">Some recent wishes could not load. <button className="btn-glossy" onClick={retry}>Try again</button></p>}{loadingFriends || loadingActivities ? <SkeletonGrid count={3} /> : <DashboardScene friends={friends} activities={activities} name={userProfile?.displayName} onAddFriend={()=>setShowAddFriend(true)} onAddWish={()=>setShowAddWish(true)} />}{showAddFriend && <FindFriendDialog friends={friends} onClose={()=>setShowAddFriend(false)} />}{showAddWish && <AddWishModal onClose={()=>setShowAddWish(false)} />}</div>;
}
