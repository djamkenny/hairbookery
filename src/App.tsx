
import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Auth from './pages/Auth';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import ClientLogin from './pages/ClientLogin';
import SpecialistLogin from './pages/SpecialistLogin';
import StylistRegister from './pages/StylistRegister';
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
import ServiceBooking from './pages/ServiceBooking';
import LaundryBooking from './pages/LaundryBooking';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import CustomerServiceAgreement from './pages/CustomerServiceAgreement';
import SpecialistAgreement from './pages/SpecialistAgreement';
import EnhancedCustomerServiceWidget from './components/customer-service/EnhancedCustomerServiceWidget';
import { ThemeProvider } from './components/theme/ThemeProvider';
import { PaymentProvider } from './components/payment/PaymentProvider';
import { Toaster } from 'sonner';
import { RatingNotificationHandler } from './components/notifications/RatingNotificationHandler';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <PaymentProvider>
          <Router>
            <AppContent />
          </Router>
        </PaymentProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirect authenticated users based on their role
      const currentPath = window.location.pathname;
      const authPaths = ['/auth', '/login', '/register', '/stylist-register', '/client-login', '/specialist-login'];
      
      if (authPaths.includes(currentPath)) {
        const metadata = user.user_metadata || {};
        if (metadata.is_stylist) {
          navigate('/stylist-dashboard');
        } else {
          navigate('/profile');
        }
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
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/stylist-register" element={
          <PublicRoute>
            <StylistRegister />
          </PublicRoute>
        } />
        <Route path="/client-login" element={
          <PublicRoute>
            <ClientLogin />
          </PublicRoute>
        } />
        <Route path="/specialist-login" element={
          <PublicRoute>
            <SpecialistLogin />
          </PublicRoute>
        } />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } />
        <Route path="/" element={<Index />} />
        <Route path="/services" element={<Services />} />
        <Route path="/specialists" element={<Specialists />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/book-service" element={<ServiceBooking />} />
        <Route path="/laundry-booking" element={<LaundryBooking />} />
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
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/customer-agreement" element={<CustomerServiceAgreement />} />
        <Route path="/specialist-agreement" element={<SpecialistAgreement />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {user && <EnhancedCustomerServiceWidget />}
      {user && <RatingNotificationHandler />}
      <Toaster />
    </>
  );
};

export default App;
