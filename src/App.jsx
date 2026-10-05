import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { db } from './firebase';
import { doc, getDoc, collection, onSnapshot } from 'firebase/firestore';
import AuthGateway from './components/AuthGateway';
import GlobalNav from './components/GlobalNav';
import MobileNavigation from './components/MobileNavigation';
import AstralSidebar from './components/AstralSidebar';
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Friends = lazy(() => import('./pages/Friends'));
const Profile = lazy(() => import('./pages/Profile'));
const MyWishlist = lazy(() => import('./pages/MyWishlist'));
const FriendWishlist = lazy(() => import('./pages/FriendWishlist'));
import AuraExperience from './components/AuraExperience';
import './index.css';
import styles from './components/AppLayout.module.css';

// Protected Route Wrapper
const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

const AppLayout = () => {
  const { currentUser } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [friendsError, setFriendsError] = useState('');

  // Global fetch for Friends List
  useEffect(() => {
    if (!currentUser) return;
    
    let isMounted = true;
    let latestRequest = 0;
    const friendsRef = collection(db, 'users', currentUser.uid, 'friends');
    
    const unsubscribe = onSnapshot(friendsRef, async (snapshot) => {
      if (!isMounted) return;
      const request = ++latestRequest;
      const results = await Promise.allSettled(snapshot.docs.map(async (d) => {
        const profileDoc = await getDoc(doc(db, 'users', d.id));
        return profileDoc.exists() ? { id: profileDoc.id, ...profileDoc.data() } : null;
      }));
      if (isMounted && request === latestRequest) {
        const validFriends = results.filter(result => result.status === 'fulfilled').map(result => result.value).filter(Boolean);
        setFriendsError(results.some(result => result.status === 'rejected') ? 'Some connections could not load. Refresh to try again.' : '');
        validFriends.sort((a, b) => {
          const nameA = (a.displayName || '').toLowerCase();
          const nameB = (b.displayName || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
        setFriends(validFriends);
        setLoadingFriends(false);
      }
    }, (error) => {
      console.error("Error fetching friends:", error);
      if (isMounted) {setLoadingFriends(false);setFriendsError('Your connections could not load. Refresh to try again.');}
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="app-container">
        <main className="page-container">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Invisible SVG for Liquid Glass Noise Filter */}
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
        <filter id="liquid-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0" in="noise" result="coloredNoise" />
          <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="composite" />
          <feBlend mode="overlay" in="composite" in2="SourceGraphic" />
        </filter>
      </svg>
      
      <GlobalNav />
      <MobileNavigation />
      <div className={styles.astralLayout}>
        <AstralSidebar 
          activeCategory={activeCategory} 
          setActiveCategory={setActiveCategory}
          friends={friends}
          loadingFriends={loadingFriends}
        />
        <main className={styles.mainArea}>
          {friendsError && <p role="alert" className="aura-error">{friendsError} <button className="btn-glossy" onClick={()=>window.location.reload()}>Refresh</button></p>}
          <Outlet context={{ activeCategory, setActiveCategory, friends, loadingFriends }} />
        </main>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { currentUser } = useAuth();

  return (
    <Router>
      <Suspense fallback={<div className="page-loading" role="status">Opening your universe…</div>}>
      <Routes>
        <Route path="/login" element={!currentUser ? <AuthGateway /> : <Navigate to="/" />} />
        
        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-wishlist" element={<MyWishlist />} />
          <Route path="/friend/:friendId" element={<FriendWishlist />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      </Suspense>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuraExperience>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
      </AuraExperience>
    </ThemeProvider>
  );
}

export default App;
