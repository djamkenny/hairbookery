
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Calendar, Users, Scissors, Settings, DollarSign } from "lucide-react";

interface DashboardTabsProps {
  breakpoint: string;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ breakpoint }) => {
  const isMobile = breakpoint === "xs" || breakpoint === "sm";
  
  return (
    <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3' : 'grid-cols-6'} h-auto p-1`}>
      <TabsTrigger 
        value="profile" 
        className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center gap-1 px-2 py-2 text-xs`}
      >
        <User className="h-4 w-4" />
        {!isMobile && <span>Profile</span>}
        {isMobile && <span className="text-xs">Profile</span>}
      </TabsTrigger>
      
      <TabsTrigger 
        value="appointments" 
        className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center gap-1 px-2 py-2 text-xs`}
      >
        <Calendar className="h-4 w-4" />
        {!isMobile && <span>Appointments</span>}
        {isMobile && <span className="text-xs">Bookings</span>}
      </TabsTrigger>
      
      <TabsTrigger 
        value="clients" 
        className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center gap-1 px-2 py-2 text-xs`}
      >
        <Users className="h-4 w-4" />
        {!isMobile && <span>Clients</span>}
        {isMobile && <span className="text-xs">Clients</span>}
      </TabsTrigger>
      
      <TabsTrigger 
        value="services" 
        className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center gap-1 px-2 py-2 text-xs`}
      >
        <Scissors className="h-4 w-4" />
        {!isMobile && <span>Services</span>}
        {isMobile && <span className="text-xs">Services</span>}
      </TabsTrigger>
      
      <TabsTrigger 
        value="earnings" 
        className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center gap-1 px-2 py-2 text-xs`}
      >
        <DollarSign className="h-4 w-4" />
        {!isMobile && <span>Earnings</span>}
        {isMobile && <span className="text-xs">Earnings</span>}
      </TabsTrigger>
      
      <TabsTrigger 
        value="settings" 
        className={`flex ${isMobile ? 'flex-col' : 'flex-row'} items-center gap-1 px-2 py-2 text-xs`}
      >
        <Settings className="h-4 w-4" />
        {!isMobile && <span>Settings</span>}
        {isMobile && <span className="text-xs">Settings</span>}
      </TabsTrigger>
    </TabsList>
  );
};

export default DashboardTabs;
