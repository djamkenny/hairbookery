
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RegisterForm from "@/components/auth/RegisterForm";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
const Register = () => {
  useEffect(() => {
    document.title = "Create Client Account | Register";

    const desc = document.querySelector('meta[name="description"]') || document.createElement('meta');
    desc.setAttribute('name', 'description');
    desc.setAttribute('content', 'Create your client account and verify via email to book appointments with top stylists.');
    if (!desc.parentNode) document.head.appendChild(desc);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);
  }, []);
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-20">
        <div className="container max-w-md px-4">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl font-semibold mb-2">Create Client Account</h1>
            <p className="text-muted-foreground">Join us to start booking appointments with our stylists</p>
          </div>
          
          <RegisterForm />

          <div className="px-4">
            <div className="flex items-center gap-2 my-4">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">Or</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <GoogleSignInButton label="Continue with Google" />
          </div>
          
          <div className="text-center text-sm mt-4 space-y-2">
            <div>
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
            <div>
              Are you a hair stylist?{" "}
              <Link to="/stylist-register" className="text-primary hover:underline">
                Register as Stylist
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Register;
