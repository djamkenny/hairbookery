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
        "fixed top-0 left-0 w-full z-50 transition-all duration-300",
        scrolled || isOpen 
          ? "backdrop py-2 sm:py-3 border-b border-border/50" 
          : "py-3 sm:py-5"
      )}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="text-foreground text-lg sm:text-xl font-semibold flex items-center group"
          >
            <span className="hairline mr-1">K n L</span>
            <span className="text-primary group-hover:text-foreground transition-colors">bookery</span>
          </Link>

          <NavLinks links={navLinks} className="hidden md:flex items-center space-x-1" />

          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <UserMenu user={user} isStylist={isStylist} />
            ) : (
              <LoginMenu />
            )}
            <Link to="/booking">
              <Button size="sm" className="flex items-center space-x-1">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Book Now</span>
              </Button>
            </Link>
            <NotificationBell />
          </div>

          <button
            onClick={toggleMenu}
            className="md:hidden p-2 hover:bg-secondary/80 rounded-md focus:outline-none"
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
