import React from "react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/#services" },
    { name: "Stylists", path: "/#stylists" },
    { name: "Contact", path: "/#contact" },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300",
        scrolled || isOpen 
          ? "backdrop py-3 border-b border-border/50" 
          : "py-5"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="text-foreground text-xl font-semibold flex items-center group"
          >
            <span className="hairline mr-1">hair</span>
            <span className="text-primary group-hover:text-foreground transition-colors">bookery</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === link.path
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                )}
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                <User className="h-4 w-4 mr-1" />
                <span>Login</span>
              </Button>
            </Link>
            <Link to="/booking">
              <Button size="sm" className="flex items-center space-x-1">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Book Now</span>
              </Button>
            </Link>
          </div>

          <button
            onClick={toggleMenu}
            className="md:hidden p-2 hover:bg-secondary/80 rounded-md"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "md:hidden absolute left-0 right-0 backdrop border-b border-border/50 transition-all duration-300 overflow-hidden",
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="container mx-auto px-4 py-4 space-y-4">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                className={cn(
                  "px-4 py-3 rounded-md text-sm font-medium transition-colors",
                  location.pathname === link.path
                    ? "text-primary bg-secondary/60"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                )}
              >
                {link.name}
              </a>
            ))}
          </nav>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link to="/login" className="col-span-1">
              <Button variant="outline" className="w-full">
                Login
              </Button>
            </Link>
            <Link to="/booking" className="col-span-1">
              <Button className="w-full">Book Now</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
