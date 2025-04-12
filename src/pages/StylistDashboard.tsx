
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StylistDashboardSummary from "@/components/stylist/StylistDashboardSummary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import StylistInfoTab from "@/components/stylist/StylistInfoTab";
import StylistAppointmentsTab from "@/components/stylist/StylistAppointmentsTab";
import StylistClientsTab from "@/components/stylist/StylistClientsTab";
import StylistServicesTab from "@/components/stylist/StylistServicesTab";
import StylistSettingsTab from "@/components/stylist/StylistSettingsTab";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useIsMobile, useBreakpoint } from "@/hooks/use-mobile";

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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const breakpoint = useBreakpoint();
  
  // Dashboard stats - initials with default values
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
          
          // Fetch appointments data
          try {
            const { data: appointmentsData, error: appointmentsError } = await supabase
              .from('appointments')
              .select('*');
              
            if (appointmentsError) throw appointmentsError;
              
            if (appointmentsData) {
              // Filter for this stylist's appointments
              const stylistAppointments = appointmentsData.filter(apt => 
                apt.stylist_id === authUser.id && !apt.canceled_at
              );
              
              // Further filter for upcoming vs completed
              const today = new Date();
              today.setHours(0, 0, 0, 0); // Start of today
              
              const upcoming = stylistAppointments.filter(apt => 
                new Date(apt.appointment_date) >= today && apt.status !== 'completed'
              );
              
              const completed = stylistAppointments.filter(apt => 
                apt.status === 'completed'
              );
              
              setUpcomingAppointments(upcoming.length);
              setCompletedAppointments(completed.length);
              
              // Count unique clients
              const uniqueClients = new Set(stylistAppointments.map(appointment => appointment.client_id));
              setTotalClients(uniqueClients.size);
            }
          } catch (err) {
            console.log("Error fetching appointments:", err);
            // Keep default values
            setUpcomingAppointments(0);
            setCompletedAppointments(0);
            setTotalClients(0);
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
    <main className="container py-6 md:py-10 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6 md:mb-8">
        <div>
          {!isMobile && (
            <Breadcrumb className="mb-2">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <span>Stylist Dashboard</span>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          )}
          <h1 className="text-2xl md:text-3xl font-bold">Stylist Dashboard</h1>
        </div>
        <Link to="/">
          <Button variant="outline" className="flex items-center gap-2 shrink-0">
            <ArrowLeft className="h-4 w-4" />
            {!isMobile && "Back to Home"}
          </Button>
        </Link>
      </div>
      
      <StylistDashboardSummary 
        upcomingAppointments={upcomingAppointments}
        totalClients={totalClients}
        completedAppointments={completedAppointments}
        rating={rating}
      />
      
      <div className="mt-6 md:mt-8 w-full overflow-hidden">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6 w-full">
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
          
          <TabsContent value="profile" className="w-full mt-4">
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
              avatarUrl={avatarUrl}
              refreshUserProfile={async () => {
                try {
                  const { data: { user } } = await supabase.auth.getUser();
                  
                  if (user) {
                    const metadata = user.user_metadata || {};
                    setAvatarUrl(metadata.avatar_url || null);
                  }
                } catch (error) {
                  console.error("Error refreshing user profile:", error);
                }
              }}
            />
          </TabsContent>
          
          <TabsContent value="appointments" className="w-full mt-4">
            <StylistAppointmentsTab />
          </TabsContent>
          
          <TabsContent value="clients" className="w-full mt-4">
            <StylistClientsTab />
          </TabsContent>
          
          <TabsContent value="services" className="w-full mt-4">
            <StylistServicesTab />
          </TabsContent>
          
          <TabsContent value="settings" className="w-full mt-4">
            <StylistSettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default StylistDashboard;
