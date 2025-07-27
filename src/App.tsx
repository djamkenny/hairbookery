
import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import Index from './pages/Index';
import Profile from './pages/Profile';
import Booking from './pages/Booking';
import StylistDashboard from './pages/StylistDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminSupportPage from "@/pages/AdminSupportPage";
import AdminChatPage from "@/pages/AdminChatPage";
import Donation from './pages/Donation';
import Services from './pages/Services';
import Specialists from './pages/Specialists';
import Contact from './pages/Contact';
import StylistDetail from './pages/StylistDetail';
import CustomerServiceWidget from './components/customer-service/CustomerServiceWidget';
import { ThemeProvider } from './components/theme/ThemeProvider';
import { PaymentProvider } from './components/payment/PaymentProvider';

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
      // Redirect authenticated users to home page, but not on initial load
      if (window.location.pathname === '/login' || window.location.pathname === '/register') {
        navigate('/');
      }
    }
  }, [user, navigate]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Index />} />
        <Route path="/services" element={<Services />} />
        <Route path="/specialists" element={<Specialists />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/booking" element={
          <ProtectedRoute>
            <Booking />
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
        <Route path="/admin-support" element={<AdminSupportPage />} />
        <Route path="/admin-chat" element={<AdminChatPage />} />
      </Routes>
      {user && <CustomerServiceWidget />}
    </>
  );
};

export default App;
