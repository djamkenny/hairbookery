
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Calendar, Users, User, Settings, Scissors } from "lucide-react";
import StylistInfoTab from "@/components/stylist/StylistInfoTab";
import StylistAppointmentsTab from "@/components/stylist/StylistAppointmentsTab";
import StylistClientsTab from "@/components/stylist/StylistClientsTab";
import StylistServicesTab from "@/components/stylist/StylistServicesTab";
import StylistSettingsTab from "@/components/stylist/StylistSettingsTab";
import StylistDashboardSummary from "@/components/stylist/StylistDashboardSummary";

const StylistDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
  // User data
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  
  // Sample data for dashboard
  const upcomingAppointments = 8;
  const totalClients = 24;
  const completedAppointments = 127;
  const rating = 4.8;

  useEffect(() => {
    const checkUserAndLoadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          setEmail(user.email || "");
          
          // Load user metadata
          const metadata = user.user_metadata || {};
          setFullName(metadata.full_name || "");
          setPhone(metadata.phone || "");
          setSpecialty(metadata.specialty || "");
          setExperience(metadata.experience || "");
          setBio(metadata.bio || "");
          
          // Check if user is a stylist
          if (!metadata.is_stylist) {
            toast.error("You don't have stylist permissions");
            navigate("/");
          }
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    
    checkUserAndLoadData();
  }, [navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-12 md:py-20 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10">
                <Scissors className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold">Stylist Dashboard</h1>
            </div>
            <p className="text-muted-foreground">Welcome back, {fullName}</p>
          </div>
          
          <StylistDashboardSummary 
            upcomingAppointments={upcomingAppointments} 
            totalClients={totalClients}
            completedAppointments={completedAppointments}
            rating={rating}
          />
          
          <div className="mt-8">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b mb-6">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="overview" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Overview</span>
                  </TabsTrigger>
                  <TabsTrigger value="appointments" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="hidden sm:inline">Appointments</span>
                  </TabsTrigger>
                  <TabsTrigger value="clients" className="gap-2">
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Clients</span>
                  </TabsTrigger>
                  <TabsTrigger value="services" className="gap-2">
                    <Scissors className="h-4 w-4" />
                    <span className="hidden sm:inline">Services</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Settings</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="overview" className="space-y-6">
                <StylistInfoTab 
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
                />
              </TabsContent>
              
              <TabsContent value="appointments">
                <StylistAppointmentsTab />
              </TabsContent>
              
              <TabsContent value="clients">
                <StylistClientsTab />
              </TabsContent>
              
              <TabsContent value="services">
                <StylistServicesTab />
              </TabsContent>
              
              <TabsContent value="settings">
                <StylistSettingsTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default StylistDashboard;
