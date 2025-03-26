import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import DashboardTab from "@/components/profile/DashboardTab";
import AppointmentsTab from "@/components/profile/AppointmentsTab";
import PersonalInfoTab from "@/components/profile/PersonalInfoTab";
import FavoritesTab from "@/components/profile/FavoritesTab";
import SettingsTab from "@/components/profile/SettingsTab";
import { useIsMobile } from "@/hooks/use-mobile";

// Sample data for appointments
const upcomingAppointments = [
  {
    id: 1,
    service: "Haircut & Styling",
    stylist: "Sophia Rodriguez",
    date: "June 15, 2023",
    time: "10:00 AM",
    status: "confirmed"
  },
  {
    id: 2,
    service: "Hair Coloring",
    stylist: "Alex Chen",
    date: "July 2, 2023",
    time: "2:00 PM",
    status: "confirmed"
  }
];

const pastAppointments = [
  {
    id: 3,
    service: "Blowout & Styling",
    stylist: "Emma Johnson",
    date: "May 20, 2023",
    time: "1:00 PM",
    status: "completed"
  },
  {
    id: 4,
    service: "Deep Conditioning",
    stylist: "Marcus Williams",
    date: "April 10, 2023",
    time: "11:00 AM",
    status: "completed"
  }
];

const favoriteSylists = [
  {
    id: 1,
    name: "Sophia Rodriguez",
    specialty: "Hair Styling",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3"
  },
  {
    id: 2,
    name: "Alex Chen",
    specialty: "Hair Coloring",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3"
  }
];

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          setEmail(user.email || "");
          
          const metadata = user.user_metadata || {};
          setFullName(metadata.full_name || "");
          setPhone(metadata.phone || "");
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    
    fetchUserProfile();
  }, [navigate]);
  
  const showMobileTab = (tabName: string) => {
    if (isMobile) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setActiveTab(tabName);
  };
  
  const handleCancelAppointment = (id: number) => {
    toast.success(`Appointment #${id} has been canceled`);
  };
  
  const handleRescheduleAppointment = (id: number) => {
    toast.info(`Redirecting to reschedule appointment #${id}`);
  };
  
  const removeFavoriteStylist = (id: number) => {
    toast.success("Stylist removed from favorites");
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
              />
            </div>
            
            <div className={`${isMobile ? "order-1" : "lg:col-span-3"} animate-slide-in space-y-6`}>
              {activeTab === "dashboard" && (
                <DashboardTab 
                  user={user}
                  upcomingAppointments={upcomingAppointments}
                  pastAppointments={pastAppointments}
                  favoriteSylists={favoriteSylists}
                  handleRescheduleAppointment={handleRescheduleAppointment}
                  handleCancelAppointment={handleCancelAppointment}
                />
              )}
              
              {activeTab === "appointments" && (
                <AppointmentsTab 
                  upcomingAppointments={upcomingAppointments}
                  pastAppointments={pastAppointments}
                  handleRescheduleAppointment={handleRescheduleAppointment}
                  handleCancelAppointment={handleCancelAppointment}
                />
              )}
              
              {activeTab === "profile" && (
                <PersonalInfoTab 
                  user={user}
                  fullName={fullName}
                  setFullName={setFullName}
                  email={email}
                  phone={phone}
                  setPhone={setPhone}
                />
              )}
              
              {activeTab === "favorites" && (
                <FavoritesTab 
                  favoriteSylists={favoriteSylists}
                  removeFavoriteStylist={removeFavoriteStylist}
                />
              )}
              
              {activeTab === "settings" && (
                <SettingsTab 
                  emailNotifications={emailNotifications}
                  setEmailNotifications={setEmailNotifications}
                  smsNotifications={smsNotifications}
                  setSmsNotifications={setSmsNotifications}
                />
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
