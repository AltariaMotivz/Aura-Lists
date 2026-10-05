import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Gift, Users, Sparkles, Search, UserPlus } from 'lucide-react';
import ActivityItem from './ActivityItem';

import { displayName } from '../utils/profile';
export function PageHeading({ eyebrow, title, description, children }) {
  return <header className="aura-wish-heading"><div><span className="aura-eyebrow"><Sparkles size={14} aria-hidden="true" />{eyebrow}</span><h2>{title}</h2><p>{description}</p></div><div className="universe-actions">{children}</div></header>;
}
export function EmptyScene({ title, description, children }) {
  return <div className="glass-panel aura-empty-state"><span className="universe-empty-orb"><Sparkles size={32} aria-hidden="true" /></span><h3>{title}</h3><p>{description}</p>{children}</div>;
}
export function FriendDirectory({ friends, search, onSearch, onSelect }) {
  const filtered = friends.filter(friend => `${friend.displayName || ''} ${friend.username || ''}`.toLowerCase().includes(search.toLowerCase().trim()));
  return <><label className="aura-wish-search universe-directory-search"><Search size={17} aria-hidden="true" /><input type="search" aria-label="Search your friends" placeholder="Find someone in your orbit…" value={search} onChange={event => onSearch(event.target.value)} /></label><div className="universe-friends-grid">{filtered.map(friend => {
    const content = <><span className="universe-avatar">{friend.photoURL ? <img src={friend.photoURL} alt="" /> : displayName(friend.displayName).charAt(0)}</span><div><h3>{displayName(friend.displayName)}</h3><p>{friend.username ? `@${friend.username}` : 'Explore their wishes'}</p></div><ArrowUpRight size={20} aria-hidden="true" /></>;
    return onSelect ? <button className="universe-friend-card" key={friend.id} onClick={() => onSelect(friend)}>{content}</button> : <Link className="universe-friend-card" key={friend.id} to={`/friend/${friend.id}`}>{content}</Link>;
  })}</div>{filtered.length === 0 && <EmptyScene title="No one here yet." description={friends.length ? 'Try a different name or username.' : 'Add someone you love, then discover what makes them light up.'} />}</>;
}
export function DashboardScene({ friends, activities, onAddFriend, onAddWish, onSelectFriend, name }) {
  return <>
    <PageHeading eyebrow="Your orbit" title={name ? `Good to see you, ${displayName(name)}.` : 'Good things are gathering.'} description="A little inspiration from the people who make your world brighter."><button className="btn-primary" onClick={onAddWish}><Gift size={18} />Add a wish</button><button className="btn-glossy" onClick={onAddFriend}><UserPlus size={18} />Find a friend</button></PageHeading>
    <div className="universe-stats"><div className="glass-panel"><Users size={22} /><strong>{friends.length}</strong><span>people in your orbit</span></div><div className="glass-panel"><Gift size={22} /><strong>{activities.filter(item => !item.purchased).length}</strong><span>wishes in the recent feed</span></div><div className="glass-panel universe-stat-invitation"><Sparkles size={22} /><strong>Make their day.</strong><span>The perfect gift starts with a little curiosity.</span></div></div>
    <section className="universe-section"><div className="universe-section-heading"><h3>Your constellation</h3>{!onSelectFriend && <Link to="/friends">See everyone <ArrowUpRight size={16} /></Link>}</div><div className="universe-orbit">{friends.slice(0,6).map(friend => onSelectFriend ? <button key={friend.id} onClick={()=>onSelectFriend(friend)}><span className="universe-avatar">{friend.photoURL ? <img src={friend.photoURL} alt="" /> : displayName(friend.displayName).charAt(0)}</span><span>{displayName(friend.displayName)}</span></button> : <Link key={friend.id} to={`/friend/${friend.id}`}><span className="universe-avatar">{friend.photoURL ? <img src={friend.photoURL} alt="" /> : displayName(friend.displayName).charAt(0)}</span><span>{displayName(friend.displayName)}</span></Link>)}<button onClick={onAddFriend}><span className="universe-avatar universe-avatar-add"><UserPlus size={22} /></span><span>Add someone</span></button></div></section>
    <section className="universe-section"><div className="universe-section-heading"><h3>Fresh possibilities</h3><span className="aura-eyebrow">Latest wishes</span></div>{activities.length ? <div className="universe-feed">{activities.map(item=><ActivityItem key={`${item.friend.id}-${item.collectionName || 'wishes'}-${item.id}`} item={item} friend={item.friend} onSelect={onSelectFriend ? ()=>onSelectFriend(item.friend) : undefined} />)}</div> : <EmptyScene title={friends.length ? 'A quiet moment in your orbit.' : 'Your universe starts with a connection.'} description={friends.length ? 'Their next wish will appear here. Explore a friend’s list in the meantime.' : 'Find a friend to bring their wishes into your feed.'}><button className="btn-glossy" onClick={onAddFriend}><UserPlus size={18} />Find a friend</button></EmptyScene>}</section>
  </>;
}
