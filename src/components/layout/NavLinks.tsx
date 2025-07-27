import { Link, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavLink {
  name: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface NavLinksProps {
  links?: NavLink[];
  className?: string;
  linkClassName?: string;
  onClick?: () => void;
}

const NavLinks = ({ links, className, linkClassName, onClick }: NavLinksProps = {}) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Default links if none provided
  const defaultLinks: NavLink[] = [
    { name: "Home", path: "/" },
    { name: "Book Appointment", path: "/booking" },
  ];

  const navLinks = links || defaultLinks;

  return (
    <nav className={cn("hidden md:flex items-center space-x-6 lg:space-x-8", className)}>
      {navLinks.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          onClick={onClick}
          className={cn(
            `text-sm font-medium transition-colors hover:text-primary ${
              isActive(link.path) ? "text-primary" : "text-muted-foreground"
            }`,
            link.icon && "flex items-center gap-1",
            linkClassName
          )}
        >
          {link.icon && <link.icon className="h-4 w-4" />}
          {link.name}
        </Link>
      ))}
    </nav>
  );
};

export default NavLinks;