
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PaymentProvider } from "@/components/payment/PaymentProvider";
import Index from "./pages/Index";
import Booking from "./pages/Booking";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StylistRegister from "./pages/StylistRegister";
import Profile from "./pages/Profile";
import StylistDashboard from "./pages/StylistDashboard";
import StylistDetail from "./pages/StylistDetail";
import PaymentReturn from "./pages/PaymentReturn";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { ThemeProvider } from "./components/theme/ThemeProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <PaymentProvider>
        <BrowserRouter>
          <TooltipProvider>
            <Toaster />
            <Sonner position="top-right" closeButton />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/booking" element={
                <ProtectedRoute requireStylist={false}>
                  <Booking />
                </ProtectedRoute>
              } />
              <Route path="/return" element={<PaymentReturn />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/stylist-register" element={<StylistRegister />} />
              <Route path="/profile" element={
                <ProtectedRoute requireStylist={false}>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/stylist-dashboard" element={
                <ProtectedRoute requireStylist={true}>
                  <StylistDashboard />
                </ProtectedRoute>
              } />
              <Route path="/stylist/:id" element={<StylistDetail />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </PaymentProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
