import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { db } from './firebase';
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import AuthGateway from './components/AuthGateway';
import GlobalNav from './components/GlobalNav';
import AstralSidebar from './components/AstralSidebar';
import Dashboard from './pages/Dashboard';
import MyWishlist from './pages/MyWishlist';
import FriendWishlist from './pages/FriendWishlist';
import ParticleCanvas from './components/ParticleCanvas';
import vineCanopy from './assets/vine_canopy.png';
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

  // Global fetch for Friends List
  useEffect(() => {
    if (!currentUser) return;
    
    let isMounted = true;
    const friendsRef = collection(db, 'users', currentUser.uid, 'friends');
    
    const unsubscribe = onSnapshot(friendsRef, async (snapshot) => {
      if (!isMounted) return;
      const friendProfiles = await Promise.all(snapshot.docs.map(async (d) => {
        const profileDoc = await getDoc(doc(db, 'users', d.id));
        return profileDoc.exists() ? { id: profileDoc.id, ...profileDoc.data() } : null;
      }));
      if (isMounted) {
        setFriends(friendProfiles.filter(Boolean));
        setLoadingFriends(false);
      }
    }, (error) => {
      console.error("Error fetching friends:", error);
      if (isMounted) setLoadingFriends(false);
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
      
      {/* Global Vine Canopy */}
      <div 
        style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '150px',
          backgroundImage: `url(${vineCanopy})`,
          backgroundRepeat: 'repeat-x', backgroundSize: 'auto 100%',
          zIndex: 900, pointerEvents: 'none', filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.5))'
        }}
      />
      
      <ParticleCanvas />
      <GlobalNav />
      <div className={styles.astralLayout}>
        <AstralSidebar 
          activeCategory={activeCategory} 
          setActiveCategory={setActiveCategory}
          friends={friends}
          loadingFriends={loadingFriends}
        />
        <main className={styles.mainArea}>
          <Outlet context={{ activeCategory, setActiveCategory, friends }} />
        </main>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { currentUser } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!currentUser ? <AuthGateway /> : <Navigate to="/" />} />
        
        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/my-wishlist" element={<MyWishlist />} />
          <Route path="/friend/:friendId" element={<FriendWishlist />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
