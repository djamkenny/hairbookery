
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Calendar, Users, Briefcase, Settings, BarChart3 } from "lucide-react";

interface DashboardTabsProps {
  breakpoint: string;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ breakpoint }) => {
  const isMobile = breakpoint === "mobile";
  
  const tabs = [
    { value: "profile", label: "Profile", icon: User },
    { value: "appointments", label: "Appointments", icon: Calendar },
    { value: "clients", label: "Clients", icon: Users },
    { value: "services", label: "Services", icon: Briefcase },
    { value: "analytics", label: "Analytics", icon: BarChart3 },
    { value: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="w-full overflow-x-auto hide-scrollbar">
      <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3 min-w-[300px]' : 'grid-cols-6'} gap-1 p-1`}>
        {tabs.map(({ value, label, icon: Icon }) => (
          <TabsTrigger 
            key={value}
            value={value} 
            className={`flex items-center gap-1.5 text-xs whitespace-nowrap ${isMobile ? 'flex-col py-2 px-2 min-w-[90px]' : 'px-3 py-2'}`}
          >
            <Icon className={isMobile ? "h-3.5 w-3.5" : "h-4 w-4"} />
            <span className={isMobile ? "text-[10px] leading-none" : ""}>{label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
};

export default DashboardTabs;
