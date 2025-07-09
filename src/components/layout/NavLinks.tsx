
import { Link, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";

const NavLinks = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="hidden md:flex items-center space-x-8">
      <Link
        to="/"
        className={`text-sm font-medium transition-colors hover:text-primary ${
          isActive("/") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        Home
      </Link>
      <Link
        to="/booking"
        className={`text-sm font-medium transition-colors hover:text-primary ${
          isActive("/booking") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        Book Appointment
      </Link>
      <Link
        to="/donation"
        className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
          isActive("/donation") ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Heart className="h-4 w-4" />
        Donate
      </Link>
    </nav>
  );
};

export default NavLinks;
