
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, ClockIcon, StarIcon, MapPin } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ServiceGallery } from "@/components/stylist/services/ServiceGallery";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Service } from "@/components/stylist/services/types";

interface StylistProfile {
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

const StylistDetail = () => {
  const { id } = useParams();
  const [stylist, setStylist] = useState<StylistProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStylistAndServices = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        console.log("Fetching stylist with ID:", id);
        
        // Fetch stylist profile
        const { data: stylistData, error: stylistError } = await supabase
          .from('profiles')
          .select('id, full_name, specialty, bio, avatar_url, location, experience, email, phone')
          .eq('id', id)
          .eq('is_stylist', true)
          .single();
        
        if (stylistError) {
          console.error("Error fetching stylist:", stylistError);
          toast.error("Failed to load stylist profile");
          return;
        }
        
        if (stylistData) {
          console.log("Fetched stylist data:", stylistData);
          setStylist(stylistData);
        } else {
          toast.error("Stylist not found");
          return;
        }

        // Fetch stylist's services
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
        console.error("Error in fetchStylistAndServices:", error);
        toast.error("Failed to load stylist profile");
      } finally {
        setLoading(false);
      }
    };
    
    fetchStylistAndServices();
  }, [id]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-20">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center min-h-[400px]">
              <p className="text-lg">Loading stylist profile...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!stylist) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-20">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-2xl font-semibold mb-4">Stylist Not Found</h1>
              <p className="text-muted-foreground mb-6">The stylist profile you're looking for doesn't exist.</p>
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
            {/* Stylist Image and Basic Info */}
            <div className="md:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="rounded-lg overflow-hidden shadow-md animate-fade-in">
                  <img 
                    src={stylist.avatar_url || "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=761&q=80"} 
                    alt={stylist.full_name} 
                    className="w-full h-auto object-cover aspect-[3/4]"
                  />
                </div>
                
                <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center space-x-1">
                      <StarIcon className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">4.8</span>
                      <span className="text-muted-foreground">(New Profile)</span>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="font-medium">Experience</h3>
                      <p className="text-sm text-muted-foreground">
                        {stylist.experience || "Experience not specified"}
                      </p>
                    </div>

                    {stylist.location && (
                      <div className="space-y-2">
                        <h3 className="font-medium flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-primary" />
                          Location
                        </h3>
                        <p className="text-sm text-muted-foreground">{stylist.location}</p>
                        <a 
                          href={`https://maps.google.com/?q=${encodeURIComponent(stylist.location)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                        >
                          Open in Maps
                        </a>
                      </div>
                    )}
                    
                    <Link to={`/booking?stylist=${stylist.id}`}>
                      <Button className="w-full">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Book Appointment
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Stylist Details */}
            <div className="md:col-span-2 space-y-8 animate-slide-in">
              <div>
                <Link to="/" className="text-primary hover:underline mb-2 inline-block">
                  &larr; Back to Stylists
                </Link>
                <h1 className="text-3xl font-semibold">{stylist.full_name}</h1>
                <p className="text-lg text-primary">{stylist.specialty || "Professional Stylist"}</p>
              </div>
              
              <div>
                <h2 className="text-xl font-medium mb-3">About</h2>
                <p className="text-muted-foreground text-balance leading-relaxed">
                  {stylist.bio || "This stylist hasn't added a bio yet, but they're ready to provide excellent service and help you look your best."}
                </p>
              </div>
              
              <div>
                <h2 className="text-xl font-medium mb-3">Specialties</h2>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-secondary rounded-full text-sm">
                    {stylist.specialty || "General Styling"}
                  </span>
                </div>
              </div>

              {/* Service Gallery Section */}
              <div>
                <ServiceGallery services={services} />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <ClockIcon className="h-5 w-5 text-primary mr-2" />
                      <h3 className="font-medium">Average Appointment</h3>
                    </div>
                    <p className="text-2xl font-semibold">60-90 minutes</p>
                    <p className="text-sm text-muted-foreground">Depending on service type</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <CalendarIcon className="h-5 w-5 text-primary mr-2" />
                      <h3 className="font-medium">Availability</h3>
                    </div>
                    <p className="text-2xl font-semibold">Contact for booking</p>
                    <p className="text-sm text-muted-foreground">Schedule your appointment today</p>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h2 className="text-xl font-medium mb-4">Contact Information</h2>
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      {stylist.email && (
                        <p className="text-sm">
                          <span className="font-medium">Email:</span> {stylist.email}
                        </p>
                      )}
                      {stylist.phone && (
                        <p className="text-sm">
                          <span className="font-medium">Phone:</span> {stylist.phone}
                        </p>
                      )}
                      {!stylist.email && !stylist.phone && (
                        <p className="text-sm text-muted-foreground">
                          Contact information not provided. Please use the booking system to schedule an appointment.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="pt-4">
                <Link to={`/booking?stylist=${stylist.id}`}>
                  <Button size="lg">
                    Book with {stylist.full_name.split(" ")[0]}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default StylistDetail;
