import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import {
  User,
  Settings,
  BarChart3,
  Play,
  Monitor,
  LogOut,
  Smartphone,
} from "lucide-react";

export const UserMenu: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-4">
        <Link to="/login">
          <Button variant="outline">Sign In</Button>
        </Link>
        <Link to="/signup">
          <Button className="bg-blue-600 hover:bg-blue-700">
            Sign Up Free
          </Button>
        </Link>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center gap-4">
      {/* Quick Actions */}
      <Link to="/real-studio">
        <Button className="bg-red-600 hover:bg-red-700">
          <Play className="w-4 h-4 mr-2" />
          Go Live
        </Button>
      </Link>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.displayName} />
              <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.displayName}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                @{user.username}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Streaming Options */}
          <DropdownMenuItem asChild>
            <Link to="/real-studio" className="cursor-pointer">
              <Play className="mr-2 h-4 w-4" />
              Professional Studio
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/studio" className="cursor-pointer">
              <Monitor className="mr-2 h-4 w-4" />
              Demo Studio
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/mobile-studio" className="cursor-pointer">
              <Smartphone className="mr-2 h-4 w-4" />
              Mobile Studio
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Analytics & Management */}
          <DropdownMenuItem asChild>
            <Link to="/enhanced-dashboard" className="cursor-pointer">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/dashboard" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Account */}
          <DropdownMenuItem asChild>
            <Link to="/profile" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
