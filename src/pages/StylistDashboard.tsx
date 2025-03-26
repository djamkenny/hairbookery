
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StylistDashboardSummary from "@/components/stylist/StylistDashboardSummary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import StylistInfoTab from "@/components/stylist/StylistInfoTab";
import StylistAppointmentsTab from "@/components/stylist/StylistAppointmentsTab";
import StylistClientsTab from "@/components/stylist/StylistClientsTab";
import StylistServicesTab from "@/components/stylist/StylistServicesTab";
import StylistSettingsTab from "@/components/stylist/StylistSettingsTab";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const StylistDashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  
  // Dashboard stats
  const [upcomingAppointments, setUpcomingAppointments] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [completedAppointments, setCompletedAppointments] = useState(0);
  const [rating, setRating] = useState<number | null>(null);
  
  // Fetch user data from supabase
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get the authenticated user
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        if (authUser) {
          setUser(authUser);
          
          // Get user metadata if available
          const metadata = authUser.user_metadata || {};
          setFullName(metadata.full_name || "");
          setEmail(authUser.email || "");
          setPhone(metadata.phone || "");
          setSpecialty(metadata.specialty || "");
          setExperience(metadata.experience || "");
          setBio(metadata.bio || "");
          
          // Fetch profile data from profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();
            
          if (profileError && profileError.code !== 'PGRST116') {
            // PGRST116 is "row not found" error, which we can handle
            console.error("Error fetching profile data:", profileError);
          }
          
          if (profileData) {
            // Update state with profile data
            setFullName(profileData.full_name || metadata.full_name || "");
            setPhone(profileData.phone || metadata.phone || "");
            setSpecialty(profileData.specialty || metadata.specialty || "");
            setExperience(profileData.experience || metadata.experience || "");
            setBio(profileData.bio || metadata.bio || "");
            
            // In the future, we could fetch appointment and client data here
            // For now, use placeholder data
            setUpcomingAppointments(Math.floor(Math.random() * 5)); // Example data
            setTotalClients(Math.floor(Math.random() * 20) + 5); // Example data
            setCompletedAppointments(Math.floor(Math.random() * 30) + 10); // Example data
            setRating(3.5 + Math.random() * 1.5); // Example rating between 3.5 and 5.0
          }
        }
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load your profile data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <main className="container py-10">
        <h1 className="text-3xl font-bold mb-8">Stylist Dashboard</h1>
        
        <StylistDashboardSummary 
          upcomingAppointments={upcomingAppointments}
          totalClients={totalClients}
          completedAppointments={completedAppointments}
          rating={rating}
        />
        
        <div className="mt-8">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <Card className="border border-border/40">
              <TabsList className="w-full justify-start p-0 h-auto bg-transparent border-b border-border/40 rounded-none">
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
              </TabsList>
            </Card>
            
            <TabsContent value="profile">
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
      </main>
    </DashboardLayout>
  );
};

export default StylistDashboard;
