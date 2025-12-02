import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import NavLinks from "./NavLinks";
import UserMenu from "./UserMenu";
import LoginMenu from "./LoginMenu";
import MobileMenu from "./MobileMenu";
import useNavbar from "@/hooks/useNavbar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import NotificationBell from "@/components/ui/NotificationBell";

export const Navbar = () => {
  const { isOpen, scrolled, user, isStylist, navLinks, toggleMenu } = useNavbar();
  const navigate = useNavigate();

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-500",
        scrolled || isOpen 
          ? "glass-card py-2 sm:py-3 border-b border-border/30 shadow-lg" 
          : "py-3 sm:py-5 bg-transparent"
      )}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="text-base sm:text-lg md:text-xl font-bold flex items-center group relative"
          >
            <span className="text-primary">
              K n L
            </span>
            <span className="ml-1 text-foreground group-hover:text-primary transition-colors duration-300">bookery</span>
          </Link>

          <NavLinks links={navLinks} className="hidden md:flex items-center space-x-1" />

          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            <ThemeToggle />
            {user ? (
              <UserMenu user={user} isStylist={isStylist} />
            ) : (
              <LoginMenu />
            )}
            <Link to="/specialists" className="group">
              <Button size="sm" className="relative overflow-hidden bg-gradient-to-r from-primary to-accent-purple hover:shadow-glow transition-all duration-300 group-hover:scale-105">
                <span className="relative z-10 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Book Now</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent-purple to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </Link>
            <NotificationBell />
          </div>

          <button
            onClick={toggleMenu}
            className="md:hidden p-2 hover:bg-primary/10 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <MobileMenu 
        isOpen={isOpen} 
        links={navLinks} 
        user={user} 
        isStylist={isStylist} 
        onLinkClick={toggleMenu}
      />
    </header>
  );
};

export default Navbar;
