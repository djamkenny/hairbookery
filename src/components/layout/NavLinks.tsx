
import React from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface NavLink {
  name: string;
  path: string;
}

interface NavLinksProps {
  links: NavLink[];
  className?: string;
  linkClassName?: string;
  onClick?: () => void;
}

const NavLinks = ({ links, className, linkClassName, onClick }: NavLinksProps) => {
  const location = useLocation();

  return (
    <nav className={className || "flex items-center space-x-1"}>
      {links.map((link) => (
        <a
          key={link.name}
          href={link.path}
          onClick={onClick}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
            location.pathname === link.path
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/80",
            linkClassName
          )}
        >
          {link.name}
        </a>
      ))}
    </nav>
  );
};

export default NavLinks;
