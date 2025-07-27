
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path.startsWith('/#')) {
      return location.pathname === '/' && location.hash === path.slice(1);
    }
    return location.pathname === path;
  };

  const handleClick = (path: string, event: React.MouseEvent) => {
    if (path.startsWith('/#')) {
      event.preventDefault();
      const sectionId = path.slice(2); // Remove '/#'
      
      // If we're not on the home page, navigate there first
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        // We're already on the home page, just scroll to the section
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
      onClick?.();
    } else {
      onClick?.();
    }
  };

  // Default links if none provided
  const defaultLinks: NavLink[] = [
    { name: "Home", path: "/" },
    { name: "Book Appointment", path: "/booking" },
  ];

  const navLinks = links || defaultLinks;

  return (
    <nav className={cn("hidden md:flex items-center space-x-6 lg:space-x-8", className)}>
      {navLinks.map((link) => (
        link.path.startsWith('/#') ? (
          <a
            key={link.path}
            href={link.path}
            onClick={(event) => handleClick(link.path, event)}
            className={cn(
              `text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
                isActive(link.path) ? "text-primary" : "text-muted-foreground"
              }`,
              link.icon && "flex items-center gap-1",
              linkClassName
            )}
          >
            {link.icon && <link.icon className="h-4 w-4" />}
            {link.name}
          </a>
        ) : (
          <Link
            key={link.path}
            to={link.path}
            onClick={() => onClick?.()}
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
        )
      ))}
    </nav>
  );
};

export default NavLinks;
