import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AuthGateway from './components/AuthGateway';
import GlobalNav from './components/GlobalNav';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import MyWishlist from './pages/MyWishlist';
import FriendWishlist from './pages/FriendWishlist';
import './index.css';

// Protected Route Wrapper
const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

const AppContent = () => {
  const { currentUser } = useAuth();

  return (
    <Router>
      <div className="app-container">
        {currentUser && <GlobalNav />}
        {currentUser && <Navigation />}
        <main className="page-container">
          <Routes>
            <Route path="/login" element={!currentUser ? <AuthGateway /> : <Navigate to="/" />} />
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/my-wishlist" element={<PrivateRoute><MyWishlist /></PrivateRoute>} />
            <Route path="/friend/:friendId" element={<FriendWishlist />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
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
