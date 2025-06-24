
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

  if (isMobile) {
    return (
      <div className="w-full overflow-x-auto">
        <TabsList className="grid grid-cols-2 w-full gap-1 p-1 h-auto">
          {tabs.map(({ value, label, icon: Icon }) => (
            <TabsTrigger 
              key={value}
              value={value} 
              className="flex flex-col items-center gap-1 py-3 px-2 text-xs min-h-[60px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Icon className="h-4 w-4" />
              <span className="text-[10px] leading-tight text-center">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <TabsList className="grid w-full grid-cols-6 gap-1 p-1">
        {tabs.map(({ value, label, icon: Icon }) => (
          <TabsTrigger 
            key={value}
            value={value} 
            className="flex items-center gap-2 px-3 py-2 text-sm whitespace-nowrap"
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
};

export default DashboardTabs;
