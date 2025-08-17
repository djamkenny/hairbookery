
import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Auth from './pages/Auth';
import ResetPassword from './pages/ResetPassword';
import Index from './pages/Index';
import Profile from './pages/Profile';

import StylistDashboard from './pages/StylistDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import AdminSupportPage from "@/pages/AdminSupportPage";
import AdminChatPage from "@/pages/AdminChatPage";
import Donation from './pages/Donation';
import Services from './pages/Services';
import Specialists from './pages/Specialists';
import Contact from './pages/Contact';
import StylistDetail from './pages/StylistDetail';
import PaymentReturn from './pages/PaymentReturn';
import AuthCallback from './pages/AuthCallback';
import NotFound from './pages/NotFound';
import EnhancedCustomerServiceWidget from './components/customer-service/EnhancedCustomerServiceWidget';
import { ThemeProvider } from './components/theme/ThemeProvider';
import { PaymentProvider } from './components/payment/PaymentProvider';
import { Toaster } from 'sonner';
import { RatingNotificationHandler } from './components/notifications/RatingNotificationHandler';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <PaymentProvider>
        <Router>
          <AppContent />
        </Router>
      </PaymentProvider>
    </ThemeProvider>
  );
};

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirect authenticated users to home page, but not on initial load or password reset
      const currentPath = window.location.pathname;
      if (currentPath === '/login' || currentPath === '/register' || currentPath === '/forgot-password' || currentPath === '/stylist-register' || currentPath === '/auth') {
        navigate('/');
      }
    }
  }, [user, navigate]);

  return (
    <>
      <Routes>
        <Route path="/auth" element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        } />
        <Route path="/stylist-register" element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        } />
        <Route path="/forgot-password" element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        } />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<Index />} />
        <Route path="/services" element={<Services />} />
        <Route path="/specialists" element={<Specialists />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/stylist-dashboard" element={
          <ProtectedRoute requireStylist={true}>
            <StylistDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/stylist/:id" element={<StylistDetail />} />
        <Route path="/donation" element={<Donation />} />
<Route path="/payment-return" element={<PaymentReturn />} />
<Route path="/auth/callback" element={<AuthCallback />} />
<Route path="/admin-support" element={<AdminSupportPage />} />
<Route path="/admin-chat" element={<AdminChatPage />} />
<Route path="*" element={<NotFound />} />
      </Routes>
      {user && <EnhancedCustomerServiceWidget />}
      {user && <RatingNotificationHandler />}
      <Toaster />
    </>
  );
};

export default App;
