
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { PaymentProvider } from "@/components/payment/PaymentProvider";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Booking from "./pages/Booking";
import StylistRegister from "./pages/StylistRegister";
import StylistDashboard from "./pages/StylistDashboard";
import StylistDetail from "./pages/StylistDetail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PaymentReturn from "./pages/PaymentReturn";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSupportPage from "./pages/AdminSupportPage";
import CustomerServiceManagement from "./pages/CustomerServiceManagement";
import Donation from "./pages/Donation";
import NotFound from "./pages/NotFound";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import CustomerServiceWidget from "./components/customer-service/CustomerServiceWidget";

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  
  // Check if current route is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin') || 
                      location.pathname === '/customer-service-management';

  return (
    <PaymentProvider>
      <div className="min-h-screen flex flex-col">
        {!isAdminRoute && <Navbar />}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/stylist-register" element={<StylistRegister />} />
            <Route path="/stylist-dashboard" element={<StylistDashboard />} />
            <Route path="/stylist/:id" element={<StylistDetail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/payment-return" element={<PaymentReturn />} />
            <Route path="/donation" element={<Donation />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin-support" element={<AdminSupportPage />} />
            <Route path="/customer-service-management" element={<CustomerServiceManagement />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        {!isAdminRoute && <Footer />}
        {!isAdminRoute && <CustomerServiceWidget />}
      </div>
    </PaymentProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
