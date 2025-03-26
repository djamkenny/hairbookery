
import React from "react";
import { useNavigate } from "react-router-dom";
import { User, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LoginMenuProps {
  isMobile?: boolean;
}

const LoginMenu = ({ isMobile = false }: LoginMenuProps) => {
  const navigate = useNavigate();

  if (isMobile) {
    return (
      <>
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center"
          onClick={() => navigate("/login")}
        >
          <User className="h-4 w-4 mr-2" />
          Client Login
        </Button>
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center"
          onClick={() => navigate("/login")}
        >
          <Scissors className="h-4 w-4 mr-2" />
          Stylist Login
        </Button>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
          <User className="h-4 w-4 mr-1" />
          <span>Login</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigate("/login")}>
          <User className="h-4 w-4 mr-2" />
          Client Login
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/login")}>
          <Scissors className="h-4 w-4 mr-2" />
          Stylist Login
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LoginMenu;
