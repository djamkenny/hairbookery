
import React, { useState, useEffect } from "react";
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
          }
          
          // Fetch appointments data (from Supabase when implemented)
          const { data: appointmentsData, error: appointmentsError } = await supabase
            .from('appointments')
            .select('*')
            .eq('stylist_id', authUser.id)
            .is('canceled_at', null);
            
          if (!appointmentsError) {
            // Real data for appointments
            const upcoming = appointmentsData?.filter(apt => 
              new Date(apt.appointment_date) >= new Date()
            ) || [];
            
            const completed = appointmentsData?.filter(apt => 
              new Date(apt.appointment_date) < new Date() && apt.status === 'completed'
            ) || [];
            
            setUpcomingAppointments(upcoming.length);
            setCompletedAppointments(completed.length);
          }
          
          // Fetch clients data (from Supabase when implemented)
          const { data: clientsData, error: clientsError } = await supabase
            .from('appointments')
            .select('client_id')
            .eq('stylist_id', authUser.id)
            .is('canceled_at', null);
            
          if (!clientsError) {
            // Count unique clients
            const uniqueClients = new Set(clientsData?.map(appointment => appointment.client_id) || []);
            setTotalClients(uniqueClients.size);
          }
          
          // Fetch ratings data (from Supabase when implemented)
          const { data: ratingsData, error: ratingsError } = await supabase
            .from('reviews')
            .select('rating')
            .eq('stylist_id', authUser.id);
            
          if (!ratingsError && ratingsData && ratingsData.length > 0) {
            // Calculate average rating
            const average = ratingsData.reduce((sum, review) => sum + review.rating, 0) / ratingsData.length;
            setRating(average);
          } else {
            setRating(null);
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
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
  );
};

export default StylistDashboard;
