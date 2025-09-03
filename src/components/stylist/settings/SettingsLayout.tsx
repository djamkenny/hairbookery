import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Calendar, 
  Bell, 
  Settings, 
  Shield, 
  User, 
  Clock,
  ChevronRight,
  Briefcase
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import AvailabilitySettings from "./AvailabilitySettings";
import NotificationSettings from "./NotificationSettings";
import BookingSettings from "./BookingSettings";
import SecuritySettings from "./SecuritySettings";
import PreferencesSettings from "./PreferencesSettings";
import ServiceTypeSettings from "./ServiceTypeSettings";
import ProfileSettings from "./ProfileSettings";

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
}

const settingSections: SettingSection[] = [
  {
    id: "profile",
    title: "Profile Information",
    description: "Update your personal and professional details",
    icon: User,
    component: ProfileSettings,
  },
  {
    id: "service-type",
    title: "Service Type",
    description: "Choose between beauty or laundry services",
    icon: Briefcase,
    component: ServiceTypeSettings,
  },
  {
    id: "availability",
    title: "Availability",
    description: "Manage your availability and appointment limits",
    icon: Clock,
    component: AvailabilitySettings,
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Configure how you receive updates",
    icon: Bell,
    component: NotificationSettings,
  },
  {
    id: "bookings",
    title: "Booking Settings",
    description: "Control booking preferences",
    icon: Calendar,
    component: BookingSettings,
  },
  {
    id: "security",
    title: "Security & Privacy",
    description: "Manage account security and privacy",
    icon: Shield,
    component: SecuritySettings,
  },
  {
    id: "preferences",
    title: "Preferences",
    description: "Customize your regional settings",
    icon: Settings,
    component: PreferencesSettings,
  },
];

const SettingsLayout = () => {
  const [activeSection, setActiveSection] = useState("profile");
  const [showSidebar, setShowSidebar] = useState(true);
  const isMobile = useIsMobile();

  const ActiveComponent = settingSections.find(s => s.id === activeSection)?.component || ProfileSettings;
  const activeTitle = settingSections.find(s => s.id === activeSection)?.title || "Settings";

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
        
        {!showSidebar ? (
          <div className="space-y-3">
            {settingSections.map((section) => {
              const Icon = section.icon;
              return (
                <Card 
                  key={section.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setActiveSection(section.id);
                    setShowSidebar(true);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">{section.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {section.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(false)}
                className="p-1"
              >
                ← Back
              </Button>
              <h2 className="text-lg font-medium">{activeTitle}</h2>
            </div>
            <ActiveComponent />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>
      
      <div className="grid grid-cols-12 gap-6">
        {/* Settings Navigation */}
        <div className="col-span-4 lg:col-span-3">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {settingSections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg transition-colors",
                        "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
                        isActive && "bg-primary/10 text-primary border border-primary/20"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn(
                          "h-4 w-4",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )} />
                        <div className="text-left">
                          <div className={cn(
                            "font-medium text-sm",
                            isActive ? "text-primary" : "text-foreground"
                          )}>
                            {section.title}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {section.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>
        
        {/* Settings Content */}
        <div className="col-span-8 lg:col-span-9">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;