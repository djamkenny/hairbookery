
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { NavLink } from "@/components/layout/NavLinks";

export const useNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isStylist, setIsStylist] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      // Check if user is a stylist
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        setIsStylist(metadata.is_stylist || false);
      } else {
        setIsStylist(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        
        // Check if user is a stylist on auth state change
        if (session?.user) {
          const metadata = session.user.user_metadata || {};
          setIsStylist(metadata.is_stylist || false);
        } else {
          setIsStylist(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks: NavLink[] = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/#services" },
    { name: "Specialists", path: "/#specialists" },
    { name: "Contact", path: "/#contact" },
  ];

  return {
    isOpen,
    scrolled,
    user,
    isStylist,
    navLinks,
    toggleMenu,
  };
};

export default useNavbar;
