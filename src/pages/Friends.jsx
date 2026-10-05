import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { PageHeading, FriendDirectory } from '../components/UniverseScene';
import FindFriendDialog from '../components/FindFriendDialog';
import SkeletonGrid from '../components/SkeletonGrid';
export default function Friends() {
  const { friends, loadingFriends } = useOutletContext();
  const [search,setSearch]=useState('');
  const [finding,setFinding]=useState(false);
  return <div className="aura-enter universe-page"><PageHeading eyebrow="Your constellation" title="Good people. Great wishes." description="Keep your favorite people close, and their next obsession closer."><button className="btn-primary" onClick={()=>setFinding(true)}><UserPlus size={18} />Find a friend</button></PageHeading>{loadingFriends ? <SkeletonGrid count={3} /> : <FriendDirectory friends={friends} search={search} onSearch={setSearch} />}{finding && <FindFriendDialog friends={friends} onClose={()=>setFinding(false)} />}</div>;
}
