
import React from "react";
import { useNavigate } from "react-router-dom";
import { User, Scissors, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  user: any | null;
  isStylist: boolean;
  isMobile?: boolean;
}

const UserMenu = ({ user, isStylist, isMobile = false }: UserMenuProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error logging out");
    }
  };

  const navigateToDashboard = () => {
    if (isStylist) {
      navigate("/stylist-dashboard");
    } else {
      navigate("/profile");
    }
  };

  if (isMobile) {
    return (
      <>
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center"
          onClick={navigateToDashboard}
        >
          {isStylist ? (
            <>
              <Scissors className="h-4 w-4 mr-2" />
              Stylist Dashboard
            </>
          ) : (
            <>
              <User className="h-4 w-4 mr-2" />
              My Profile
            </>
          )}
        </Button>
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
          {isStylist ? (
            <Scissors className="h-4 w-4 mr-1" />
          ) : (
            <User className="h-4 w-4 mr-1" />
          )}
          <span>{isStylist ? "Stylist" : "Account"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={navigateToDashboard}>
          {isStylist ? (
            <>
              <Scissors className="h-4 w-4 mr-2" />
              Stylist Dashboard
            </>
          ) : (
            <>
              <User className="h-4 w-4 mr-2" />
              My Profile
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
