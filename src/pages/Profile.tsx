
import React from "react";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileContent from "@/components/profile/ProfileContent";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProfileData } from "@/hooks/useProfileData";

const Profile = () => {
  const {
    activeTab,
    setActiveTab,
    emailNotifications,
    setEmailNotifications,
    smsNotifications,
    setSmsNotifications,
    loading,
    user,
    fullName,
    setFullName,
    email,
    phone,
    setPhone,
    avatarUrl,
    refreshUserProfile,
    upcomingAppointments,
    pastAppointments,
    favoriteSylists,
    handleCancelAppointment,
    handleRescheduleAppointment,
    removeFavoriteStylist
  } = useProfileData();
  
  const isMobile = useIsMobile();
  
  const showMobileTab = (tabName: string) => {
    if (isMobile) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setActiveTab(tabName);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-12 md:py-20 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
            <div className={`${isMobile ? "order-2" : "lg:col-span-1"}`}>
              <ProfileSidebar 
                activeTab={activeTab}
                setActiveTab={showMobileTab}
                user={user}
                fullName={fullName}
                email={email}
                loading={loading}
                avatarUrl={avatarUrl}
              />
            </div>
            
            <ProfileContent
              activeTab={activeTab}
              user={user}
              fullName={fullName}
              setFullName={setFullName}
              email={email}
              phone={phone}
              setPhone={setPhone}
              avatarUrl={avatarUrl}
              refreshUserProfile={refreshUserProfile}
              upcomingAppointments={upcomingAppointments}
              pastAppointments={pastAppointments}
              favoriteSylists={favoriteSylists}
              handleRescheduleAppointment={handleRescheduleAppointment}
              handleCancelAppointment={handleCancelAppointment}
              emailNotifications={emailNotifications}
              setEmailNotifications={setEmailNotifications}
              smsNotifications={smsNotifications}
              setSmsNotifications={setSmsNotifications}
              removeFavoriteStylist={removeFavoriteStylist}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
