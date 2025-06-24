
import React from "react";
import { Tabs } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useIsMobile, useBreakpoint } from "@/hooks/use-mobile";
import { useStylistDashboard } from "@/hooks/useStylistDashboard";
import StylistDashboardSummary from "@/components/stylist/StylistDashboardSummary";
import DashboardHeader from "@/components/stylist/dashboard/DashboardHeader";
import DashboardTabs from "@/components/stylist/dashboard/DashboardTabs";
import DashboardContent from "@/components/stylist/dashboard/DashboardContent";

const StylistDashboard = () => {
  const { 
    activeTab, 
    setActiveTab,
    user,
    loading,
    fullName,
    setFullName,
    email,
    phone,
    setPhone,
    specialty,
    setSpecialty,
    experience,
    setExperience,
    bio,
    setBio,
    avatarUrl,
    location,
    setLocation,
    upcomingAppointments,
    totalClients,
    completedAppointments,
    rating,
    refreshUserProfile
  } = useStylistDashboard();
  
  const isMobile = useIsMobile();
  const breakpoint = useBreakpoint();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <main className="container py-4 md:py-6 lg:py-10 px-2 sm:px-4 lg:px-8 overflow-x-hidden">
      <DashboardHeader isMobile={isMobile} />
      
      <div className="mb-4 md:mb-6">
        <StylistDashboardSummary 
          upcomingAppointments={upcomingAppointments}
          totalClients={totalClients}
          completedAppointments={completedAppointments}
          rating={rating}
        />
      </div>
      
      <div className="w-full overflow-hidden">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6 w-full">
          <div className="w-full">
            <DashboardTabs breakpoint={breakpoint} />
          </div>
          
          <DashboardContent
            user={user}
            fullName={fullName}
            setFullName={setFullName}
            email={email}
            phone={phone}
            setPhone={setPhone}
            specialty={specialty}
            setSpecialty={setSpecialty}
            experience={experience}
            setExperience={setExperience}
            bio={bio}
            setBio={setBio}
            avatarUrl={avatarUrl}
            location={location}
            setLocation={setLocation}
            refreshUserProfile={refreshUserProfile}
          />
        </Tabs>
      </div>
    </main>
  );
};

export default StylistDashboard;
