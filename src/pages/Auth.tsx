import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthTabs from "@/components/auth/AuthTabs";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

const Auth = () => {
  const location = useLocation();
  
  // Determine mode based on pathname
  const getMode = () => {
    switch (location.pathname) {
      case "/register":
        return "register";
      case "/stylist-register":
        return "stylist";
      case "/forgot-password":
        return "forgot";
      default:
        return "login";
    }
  };
  
  const mode = getMode();
  
  // Check if user is already logged in
  useAuthRedirect();

  useEffect(() => {
    const titles = {
      login: "Sign In | Hair Specialist Platform",
      register: "Create Client Account | Hair Specialist Platform", 
      stylist: "Specialist Registration | Hair Specialist Platform",
      forgot: "Reset Password | Hair Specialist Platform"
    };

    const descriptions = {
      login: "Sign in to your account to manage your bookings and appointments with top hair specialists.",
      register: "Create your client account to book appointments with certified hair specialists and manage your profile.",
      stylist: "Join as a hair specialist to connect with clients, manage appointments, and grow your business.",
      forgot: "Reset your password to regain access to your hair specialist platform account."
    };

    document.title = titles[mode];

    const desc = document.querySelector('meta[name="description"]') || document.createElement('meta');
    desc.setAttribute('name', 'description');
    desc.setAttribute('content', descriptions[mode]);
    if (!desc.parentNode) document.head.appendChild(desc);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);
  }, [mode]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-8 px-4">
        <div className="container max-w-2xl">
          <AuthTabs defaultTab={mode} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Auth;