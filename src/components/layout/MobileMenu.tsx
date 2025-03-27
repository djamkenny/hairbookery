
import React from "react";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import NavLinks, { NavLink } from "./NavLinks";
import UserMenu from "./UserMenu";
import LoginMenu from "./LoginMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface MobileMenuProps {
  isOpen: boolean;
  links: NavLink[];
  user: any | null;
  isStylist: boolean;
  onLinkClick: () => void;
}

const MobileMenu = ({ isOpen, links, user, isStylist, onLinkClick }: MobileMenuProps) => {
  return (
    <div
      className={cn(
        "md:hidden absolute left-0 right-0 backdrop border-b border-border/50 transition-all duration-300 overflow-hidden",
        isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
      )}
    >
      <div className="container mx-auto px-4 py-4 space-y-4">
        <NavLinks 
          links={links} 
          className="flex flex-col space-y-1"
          linkClassName="px-4 py-3"
          onClick={onLinkClick}
        />
        <div className="py-2 flex justify-center">
          <ThemeToggle variant="pills" />
        </div>
        <div className="grid grid-cols-1 gap-3 pt-2">
          {user ? (
            <UserMenu user={user} isStylist={isStylist} isMobile={true} />
          ) : (
            <LoginMenu isMobile={true} />
          )}
          <Link to="/booking" className="col-span-1">
            <Button className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Book Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
