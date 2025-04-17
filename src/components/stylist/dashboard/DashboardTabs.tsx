
import React from "react";
import { Card } from "@/components/ui/card";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardTabsProps {
  breakpoint: string;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ breakpoint }) => {
  return (
    <Card className="border border-border/40 w-full overflow-x-auto">
      <TabsList className="w-full justify-start p-0 h-auto bg-transparent border-b border-border/40 rounded-none overflow-x-auto">
        {['xxs', 'xs'].includes(breakpoint) ? (
          // For very small screens, make tabs scrollable
          <div className="flex overflow-x-auto hide-scrollbar min-w-full">
            <TabsTrigger 
              value="profile" 
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3 px-4 whitespace-nowrap"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="appointments" 
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3 px-4 whitespace-nowrap"
            >
              Appointments
            </TabsTrigger>
            <TabsTrigger 
              value="clients" 
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3 px-4 whitespace-nowrap"
            >
              Clients
            </TabsTrigger>
            <TabsTrigger 
              value="services" 
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3 px-4 whitespace-nowrap"
            >
              Services
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3 px-4 whitespace-nowrap"
            >
              Settings
            </TabsTrigger>
          </div>
        ) : (
          // For larger screens, flex display
          <>
            <TabsTrigger 
              value="profile" 
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3 px-6"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="appointments" 
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3 px-6"
            >
              Appointments
            </TabsTrigger>
            <TabsTrigger 
              value="clients" 
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3 px-6"
            >
              Clients
            </TabsTrigger>
            <TabsTrigger 
              value="services" 
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3 px-6"
            >
              Services
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3 px-6"
            >
              Settings
            </TabsTrigger>
          </>
        )}
      </TabsList>
    </Card>
  );
};

export default DashboardTabs;
