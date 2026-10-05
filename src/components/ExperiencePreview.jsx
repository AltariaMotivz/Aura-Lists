import React, { useState } from 'react';
import { Plus, X, Check, Sparkles, LayoutDashboard, Users, Gift, UserRound, ArrowLeft } from 'lucide-react';
import Dialog from './Dialog';
import WishCard from './WishCard';
import { EnergyToggle } from './AuraExperience';
import { DashboardScene, FriendDirectory, PageHeading } from './UniverseScene';
import { ProfilePanel } from './ProfileSidebar';

const SAMPLES = [
  { id: 'sample-1', name: 'Soundtrack to another dimension', theme: 'Tech', price: '129', notes: 'Noise-cancelling headphones. For getting lost in a favorite album.' },
  { id: 'sample-2', name: 'A story I can disappear into', theme: 'Books', price: '24', notes: 'A beautiful book, a quiet afternoon, and absolutely no notifications.' },
  { id: 'sample-3', name: 'A little birthday magic', theme: 'Birthday', price: '45', notes: 'Something unexpected. Something very me.' }
];
const FRIENDS = [{id:'sample-friend-1',displayName:'Luna',username:'lunar.daydreams'},{id:'sample-friend-2',displayName:'Kai',username:'kai.creates'},{id:'sample-friend-3',displayName:'Sol',username:'hello.sol'}];
const TABS = [{name:'Dashboard',icon:LayoutDashboard},{name:'Friends',icon:Users},{name:'Wishes',icon:Gift},{name:'Profile',icon:UserRound}];
export default function ExperiencePreview({ onClose }) {
  const [sampleTime]=useState(()=>Date.now());
  const [items,setItems]=useState(SAMPLES);
  const [friends,setFriends]=useState(FRIENDS);
  const [filter,setFilter]=useState('All');
  const [tab,setTab]=useState('Dashboard');
  const [selected,setSelected]=useState(null);
  const [friendSearch,setFriendSearch]=useState('');
  const [wishSearch,setWishSearch]=useState('');
  const [profile,setProfile]=useState({displayName:'Stargazer',username:'stargazer'});
  const [added,setAdded]=useState(false);
  const [notice,setNotice]=useState('');
  const addSample=()=>{if(added){setSelected(null);setTab('Wishes');return;}setItems(previous=>[{id:'sample-extra',name:'The next great adventure',theme:'Holiday',price:'75',notes:'A day worth remembering. This is a sample wish.'},...previous]);setFilter('All');setWishSearch('');setSelected(null);setAdded(true);setTab('Wishes');setNotice('A new possibility added to your sample universe.');};
  const addFriend=()=>{if(friends.length===3)setFriends(previous=>[...previous,{id:'sample-friend-4',displayName:'Nova',username:'nova.dreams'}]);setTab('Friends');setFriendSearch('');setNotice('Nova joined your sample orbit. Real friend search is available after sign-in.');};
  const select=friend=>{setSelected(friend);setFilter('All');setWishSearch('');setTab('Wishes');setNotice('You’re exploring sample wishes. Nothing is saved to Firebase.');};
  const activities=items.map((item,index)=>({...item,friend:friends[index%friends.length],createdAt:new Date(sampleTime-(index+1)*3600000).toISOString()}));
  const shown=items.filter(item=>(filter==='All'||item.theme===filter)&&`${item.name} ${item.notes}`.toLowerCase().includes(wishSearch.toLowerCase().trim()));
  return <Dialog onClose={onClose} labelledBy="experience-title" className="aura-preview-dialog universe-preview"><header className="aura-preview-header"><div><span className="aura-eyebrow">Your playground</span><h2 id="experience-title">Step into your universe.</h2></div><button className="aura-icon" onClick={onClose} aria-label="Close preview"><X size={22} /></button></header><p className="aura-preview-description">Explore the whole experience with sample data. Your changes stay in this playground and disappear when you close it.</p><div className="aura-preview-tools"><nav className="aura-filter-tabs universe-preview-tabs" aria-label="Preview screens">{TABS.map(({name,icon:Icon})=><button key={name} aria-pressed={name===tab} onClick={()=>{setTab(name);setSelected(null);setNotice('');}}><Icon size={16} />{name}</button>)}</nav><EnergyToggle /></div><div className="universe-preview-content" key={tab}>
    {tab==='Dashboard' && <DashboardScene name={profile.displayName} friends={friends} activities={activities} onAddFriend={addFriend} onAddWish={addSample} onSelectFriend={select} />}
    {tab==='Friends' && <><PageHeading eyebrow="Your constellation" title="Good people. Great wishes." description="Open a friend’s universe and discover their next obsession."><button className="btn-primary" onClick={addFriend} disabled={friends.length>3}><Users size={17} />{friends.length>3?'Nova joined':'Add a sample friend'}</button></PageHeading><FriendDirectory friends={friends} search={friendSearch} onSearch={setFriendSearch} onSelect={select} /></>}
    {tab==='Wishes' && <>{selected && <button className="universe-back universe-back-button" onClick={()=>{setSelected(null);setTab('Friends');}}><ArrowLeft size={16} />Back to your people</button>}<PageHeading eyebrow={selected?'In your orbit':'Your universe'} title={selected?`${selected.displayName}’s wishes`:'What lights you up?'} description="Big dreams, little obsessions, and everything in between." /><div className="aura-list-controls"><label className="aura-wish-search"><input type="search" aria-label="Search sample wishes" placeholder="Find your next obsession…" value={wishSearch} onChange={event=>setWishSearch(event.target.value)} /></label><div className="aura-filter-tabs" aria-label="Filter sample wishes">{['All','Tech','Books','Birthday','Holiday'].map(category=><button key={category} aria-pressed={filter===category} onClick={()=>setFilter(category)}>{category}</button>)}</div></div><div className="aura-preview-list">{shown.map(item=><WishCard key={item.id} item={item} isOwner={false} />)}{!shown.length && <p className="aura-preview-description">No sample wishes match this search.</p>}</div><div className="aura-preview-footer"><span><Sparkles size={16} />Sample wishes. Real energy.</span><button className="btn-primary" onClick={addSample} disabled={added}>{added?<Check size={18} />:<Plus size={18} />}{added?'Wish added':'Add a sample wish'}</button></div></>}
    {tab==='Profile' && <><PageHeading eyebrow="Make it personal" title="Your kind of magic." description="Try a new name and make this little universe yours." /><ProfilePanel profile={profile} isOwner preview onSave={async updates=>{setProfile(updates);setNotice('Your sample signature is saved in this playground.');return true;}} onShare={()=>setNotice('Your real profile can share a list link after sign-in.')} /></>}
  </div><p className="aura-preview-notice" role="status">{notice}</p></Dialog>;
}
