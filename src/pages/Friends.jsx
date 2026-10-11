import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Users, Sparkles, UserPlus, Check, ArrowUpRight, Search } from 'lucide-react';
import { PageHeading, EmptyScene, FriendDirectory } from '../components/UniverseScene';
import FindFriendDialog from '../components/FindFriendDialog';
import SkeletonGrid from '../components/SkeletonGrid';
import { useAuth } from '../contexts/AuthContext';
import useFollowers from '../hooks/useFollowers';
import { displayName } from '../utils/profile';
import { followUser } from '../utils/social';

export default function Friends() {
  const { currentUser } = useAuth();
  const { friends = [], loadingFriends } = useOutletContext();
  const { followers = [], loadingFollowers } = useFollowers(currentUser?.uid);

  const [activeTab, setActiveTab] = useState('following'); // 'following' | 'followers'
  const [search, setSearch] = useState('');
  const [finding, setFinding] = useState(false);
  const [followingBackId, setFollowingBackId] = useState(null);
  const [followBackError, setFollowBackError] = useState('');

  const handleFollowBack = async (followerId) => {
    if (!currentUser || followingBackId) return;
    setFollowingBackId(followerId);
    setFollowBackError('');
    try {
      await followUser(currentUser, followerId);
    } catch {
      setFollowBackError('Could not follow back. Please try again.');
    } finally {
      setFollowingBackId(null);
    }
  };

  const filteredFollowers = followers.filter(follower =>
    `${follower.displayName || ''} ${follower.username || ''}`.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="aura-enter universe-page">
      <PageHeading
        eyebrow="Your constellation"
        title="Social Orbit"
        description="Keep your favorite people close, explore their wishes, and see who follows your universe."
      >
        <button className="btn-primary" onClick={() => setFinding(true)}>
          <UserPlus size={18} />
          Find people
        </button>
      </PageHeading>

      {/* Tabs: Following vs Followers */}
      <div
        className="aura-filter-tabs"
        role="tablist"
        aria-label="Social connections"
        style={{ marginBottom: '1.75rem', display: 'flex', gap: '8px', width: '100%' }}
      >
        <button
          role="tab"
          aria-selected={activeTab === 'following'}
          aria-pressed={activeTab === 'following'}
          style={{ flex: '1 1 0', minWidth: '0', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          onClick={() => {
            setActiveTab('following');
            setSearch('');
          }}
        >
          <Users size={16} />
          Following ({friends.length})
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'followers'}
          aria-pressed={activeTab === 'followers'}
          style={{ flex: '1 1 0', minWidth: '0', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          onClick={() => {
            setActiveTab('followers');
            setSearch('');
          }}
        >
          <Sparkles size={16} />
          Followers ({followers.length})
        </button>
      </div>

      {followBackError && (
        <p role="alert" className="aura-error" style={{ marginBottom: '1rem' }}>
          {followBackError}
        </p>
      )}

      {/* Content based on active tab */}
      {activeTab === 'following' ? (
        loadingFriends ? (
          <SkeletonGrid count={3} />
        ) : (
          <FriendDirectory
            friends={friends}
            search={search}
            onSearch={setSearch}
          />
        )
      ) : (
        loadingFollowers ? (
          <SkeletonGrid count={3} />
        ) : (
          <>
            <label className="aura-wish-search universe-directory-search">
              <Search size={17} aria-hidden="true" />
              <input
                type="search"
                aria-label="Search your followers"
                placeholder="Find someone following you…"
                value={search}
                onChange={event => setSearch(event.target.value)}
              />
            </label>

            <div className="universe-friends-grid">
              {filteredFollowers.map(follower => {
                const isFollowingBack = friends.some(friend => friend.id === follower.id);
                return (
                  <div
                    className="universe-friend-card"
                    key={follower.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <Link
                      to={`/friend/${follower.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        textDecoration: 'none',
                        color: 'inherit',
                        flex: 1,
                        minWidth: 0
                      }}
                    >
                      <span className="universe-avatar">
                        {follower.photoURL ? (
                          <img src={follower.photoURL} alt="" />
                        ) : (
                          displayName(follower.displayName).charAt(0)
                        )}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: '1rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {displayName(follower.displayName)}
                        </h3>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.8rem',
                            color: 'var(--color-text-secondary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {follower.username ? `@${follower.username}` : 'Follower'}
                        </p>
                      </div>
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      {isFollowingBack ? (
                        <span
                          className="pill-badge"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem',
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            background: 'rgba(var(--aura-accent-rgb), 0.12)',
                            color: 'var(--color-accent-primary)',
                            border: '1px solid rgba(var(--aura-accent-rgb), 0.3)'
                          }}
                        >
                          <Check size={13} /> Following
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="btn-glossy"
                          onClick={() => handleFollowBack(follower.id)}
                          disabled={followingBackId === follower.id}
                          style={{
                            fontSize: '0.78rem',
                            padding: '6px 12px',
                            gap: '4px',
                            color: 'var(--color-accent-primary)',
                            border: '1px solid rgba(var(--aura-accent-rgb), 0.35)'
                          }}
                        >
                          {followingBackId === follower.id ? (
                            'Following…'
                          ) : (
                            <>
                              <UserPlus size={14} /> Follow back
                            </>
                          )}
                        </button>
                      )}
                      <Link
                        to={`/friend/${follower.id}`}
                        aria-label={`View ${displayName(follower.displayName)}'s list`}
                        style={{
                          color: 'var(--color-text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '4px'
                        }}
                      >
                        <ArrowUpRight size={18} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredFollowers.length === 0 && (
              <EmptyScene
                title={followers.length ? 'No followers match your search.' : 'No followers yet.'}
                description={
                  followers.length
                    ? 'Try searching by another name or @username.'
                    : 'Share your list link with friends so they can enter your orbit and follow your wishes.'
                }
              />
            )}
          </>
        )
      )}

      {finding && (
        <FindFriendDialog
          friends={friends}
          onClose={() => setFinding(false)}
        />
      )}
    </div>
  );
}

