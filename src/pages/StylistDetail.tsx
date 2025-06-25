
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, ClockIcon, MapPin } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ServiceGallery } from "@/components/stylist/services/ServiceGallery";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Service } from "@/components/stylist/services/types";
import RatingComponent from "@/components/specialist/RatingComponent";

interface SpecialistProfile {
  id: string;
  full_name: string;
  specialty: string;
  bio: string;
  avatar_url: string | null;
  location: string | null;
  experience: string | null;
  email: string | null;
  phone: string | null;
}

const SpecialistDetail = () => {
  const { id } = useParams();
  const [specialist, setSpecialist] = useState<SpecialistProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSpecialistAndServices = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        console.log("Fetching specialist with ID:", id);
        
        // Fetch specialist profile
        const { data: specialistData, error: specialistError } = await supabase
          .from('profiles')
          .select('id, full_name, specialty, bio, avatar_url, location, experience, email, phone')
          .eq('id', id)
          .eq('is_stylist', true)
          .single();
        
        if (specialistError) {
          console.error("Error fetching specialist:", specialistError);
          toast.error("Failed to load specialist profile");
          return;
        }
        
        if (specialistData) {
          console.log("Fetched specialist data:", specialistData);
          setSpecialist(specialistData);
        } else {
          toast.error("Specialist not found");
          return;
        }

        // Fetch specialist's services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('stylist_id', id)
          .order('name');

        if (servicesError) {
          console.error("Error fetching services:", servicesError);
          toast.error("Failed to load services");
          return;
        }

        if (servicesData) {
          const formattedServices = servicesData.map(service => ({
            id: service.id,
            name: service.name,
            description: service.description,
            duration: `${service.duration}`,
            price: `${service.price}`,
            stylist_id: service.stylist_id,
            image_urls: service.image_urls || []
          }));
          setServices(formattedServices);
        }
        
      } catch (error) {
        console.error("Error in fetchSpecialistAndServices:", error);
        toast.error("Failed to load specialist profile");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSpecialistAndServices();
  }, [id]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-20">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center min-h-[400px]">
              <p className="text-lg">Loading specialist profile...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!specialist) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-20">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-2xl font-semibold mb-4">Specialist Not Found</h1>
              <p className="text-muted-foreground mb-6">The specialist profile you're looking for doesn't exist.</p>
              <Link to="/">
                <Button>Back to Home</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Specialist Image and Basic Info */}
            <div className="md:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="rounded-lg overflow-hidden shadow-md animate-fade-in">
                  <img 
                    src={specialist.avatar_url || "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=761&q=80"} 
                    alt={specialist.full_name}
                    className="w-full h-80 object-cover"
                  />
                </div>
                
                <Card className="animate-fade-in">
                  <CardContent className="p-6">
                    <h1 className="text-2xl font-semibold mb-2">{specialist.full_name}</h1>
                    <p className="text-primary text-lg mb-4">{specialist.specialty}</p>
                    
                    {specialist.location && (
                      <div className="flex items-start gap-2 mb-4">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{specialist.location}</span>
                      </div>
                    )}
                    
                    {specialist.experience && (
                      <div className="flex items-center gap-2 mb-4">
                        <ClockIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{specialist.experience}</span>
                      </div>
                    )}
                    
                    {/* Rating Component */}
                    <div className="mb-6">
                      <RatingComponent specialistId={id!} showSubmissionForm={false} />
                    </div>
                    
                    <Link to={`/booking?stylist=${id}`}>
                      <Button className="w-full mb-3">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Book Appointment
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Specialist Details and Services */}
            <div className="md:col-span-2 space-y-8">
              <div className="animate-fade-in">
                <h2 className="text-xl font-semibold mb-4">About</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {specialist.bio || "Professional specialist with years of experience in the industry."}
                </p>
              </div>
              
              <div className="animate-fade-in">
                <h2 className="text-xl font-semibold mb-6">Services & Portfolio</h2>
                <ServiceGallery services={services} />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SpecialistDetail;
