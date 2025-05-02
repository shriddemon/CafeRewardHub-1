import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Coffee, 
  LayoutDashboard, 
  Gift, 
  ShoppingCart, 
  Gamepad, 
  User, 
  ChevronLeft, 
  LogOut,
  Menu
} from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function SidebarLink({ href, icon, label, isActive }: SidebarLinkProps) {
  return (
    <Link href={href}>
      <Button
        variant="ghost"
        className={`w-full justify-start ${
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-gray-600 hover:text-primary hover:bg-primary/5"
        }`}
      >
        {icon}
        <span className="ml-2">{label}</span>
      </Button>
    </Link>
  );
}

export default function CustomerSidebar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const isMobile = useMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logoutMutation.mutate();
    }
  };
  
  const navigationItems = [
    {
      href: "/customer/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: "Dashboard",
    },
    {
      href: "/customer/rewards",
      icon: <Gift className="h-5 w-5" />,
      label: "My Rewards",
    },
    {
      href: "/customer/orders",
      icon: <ShoppingCart className="h-5 w-5" />,
      label: "My Orders",
    },
    {
      href: "/customer/games",
      icon: <Gamepad className="h-5 w-5" />,
      label: "Games",
    },
    {
      href: "/customer/profile",
      icon: <User className="h-5 w-5" />,
      label: "Profile",
    },
  ];
  
  const sidebarContent = (
    <>
      <div className="flex items-center space-x-2 px-4 py-6">
        {!isCollapsed && (
          <>
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <Coffee className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">CafeRewards</span>
          </>
        )}
        {isCollapsed && <Coffee className="h-6 w-6 text-primary mx-auto" />}
        
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronLeft className={`h-5 w-5 ${isCollapsed ? "rotate-180" : ""}`} />
          </Button>
        )}
      </div>
      
      <div className="px-4 space-y-2 mb-6">
        <div className={`flex ${isCollapsed ? "flex-col" : "items-center"} px-4 py-3 bg-gray-100 rounded-lg`}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="bg-accent">{user?.name?.charAt(0) || "C"}</AvatarFallback>
          </Avatar>
          
          {!isCollapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="font-medium text-sm truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">Cafe Customer</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-1 px-4">
        {navigationItems.map((item) => (
          <SidebarLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={isCollapsed ? "" : item.label}
            isActive={location === item.href}
          />
        ))}
      </div>
      
      <div className="mt-auto px-4 pb-6">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </>
  );
  
  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b flex items-center px-4 z-40">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <Coffee className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">CafeRewards</span>
          </div>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-auto">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <div className="h-full flex flex-col">
                {sidebarContent}
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="h-16"></div> {/* Spacer for fixed header */}
      </>
    );
  }
  
  return (
    <div className={`min-h-screen border-r bg-white flex flex-col ${isCollapsed ? "w-20" : "w-64"}`}>
      {sidebarContent}
    </div>
  );
}
