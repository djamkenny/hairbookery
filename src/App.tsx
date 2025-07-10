import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import BookingPage from './pages/BookingPage';
import StylistDashboard from './pages/StylistDashboard';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import AdminRoute from './components/AdminRoute';
import StylistRoute from './components/StylistRoute';
import CustomerServiceWidget from './components/customer-service/CustomerServiceWidget';
import CustomerServiceManagement from './pages/CustomerServiceManagement';
import AdminSupportPage from "@/pages/AdminSupportPage";
import AdminChatPage from "@/pages/AdminChatPage";

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

const AppContent: React.FC = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authState.isAuthenticated) {
      // Redirect authenticated users to home page, but not on initial load
      if (window.location.pathname === '/login' || window.location.pathname === '/register') {
        navigate('/');
      }
    }
  }, [authState.isAuthenticated, navigate]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/booking" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
        <Route path="/stylist-dashboard" element={<StylistRoute><StylistDashboard /></StylistRoute>} />
        <Route path="/admin-login" element={<PublicRoute><AdminLoginPage /></PublicRoute>} />
        <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/customer-service-management" element={<AdminRoute><CustomerServiceManagement /></AdminRoute>} />
        <Route path="/admin-support" element={<AdminRoute><AdminSupportPage /></AdminRoute>} />
        <Route path="/admin-chat" element={<AdminRoute><AdminChatPage /></AdminRoute>} />
      </Routes>
      {authState.isAuthenticated && <CustomerServiceWidget />}
    </>
  );
};

export default App;
