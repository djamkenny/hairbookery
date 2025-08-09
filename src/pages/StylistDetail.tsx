
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ClockIcon, MapPin, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProfileBookingForm from "@/components/specialist/ProfileBookingForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ServiceType } from "@/components/stylist/services/types";
import RatingComponent from "@/components/specialist/RatingComponent";
import AvailabilityBadge from "@/components/ui/AvailabilityBadge";
import { useAvailabilityStatus } from "@/hooks/useAvailabilityStatus";

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

interface ServiceCategory {
  name: string;
  description?: string;
  serviceTypes: ServiceType[];
}

interface ServiceTypeWithCategory extends ServiceType {
  category: string;
}

const SpecialistDetail = () => {
  const { id } = useParams();
  const [specialist, setSpecialist] = useState<SpecialistProfile | null>(null);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { availabilityStatus, loading: availabilityLoading } = useAvailabilityStatus(id);
  
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

        // Fetch service types through services join
        const { data: serviceTypesData, error: serviceTypesError } = await supabase
          .from('service_types')
          .select(`
            *,
            services!inner (
              category,
              stylist_id
            )
          `)
          .eq('services.stylist_id', id);

        if (serviceTypesError) {
          console.error("Error fetching service types:", serviceTypesError);
          toast.error("Failed to load services");
          return;
        }

        if (serviceTypesData) {
          // Group service types by category
          const categoryMap = new Map<string, ServiceType[]>();
          
          serviceTypesData.forEach((serviceType: any) => {
            const category = serviceType.services.category || 'Other';
            if (!categoryMap.has(category)) {
              categoryMap.set(category, []);
            }
            categoryMap.get(category)!.push({
              id: serviceType.id,
              service_id: serviceType.service_id,
              name: serviceType.name,
              description: serviceType.description,
              price: serviceType.price,
              duration: serviceType.duration,
              created_at: serviceType.created_at,
              updated_at: serviceType.updated_at
            });
          });

          const categories: ServiceCategory[] = Array.from(categoryMap.entries()).map(([name, serviceTypes]) => ({
            name,
            serviceTypes
          }));

          setServiceCategories(categories);
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

  const handleServiceTypeToggle = (serviceTypeId: string) => {
    setSelectedServiceTypes(prev => 
      prev.includes(serviceTypeId) 
        ? prev.filter(id => id !== serviceTypeId)
        : [...prev, serviceTypeId]
    );
  };

  const handleBookAppointment = () => {
    const searchParams = new URLSearchParams({
      stylist: id!,
    });
    
    if (selectedServiceTypes.length > 0) {
      searchParams.set('services', selectedServiceTypes.join(','));
    }
    
    window.location.href = `/booking?${searchParams.toString()}`;
  };
  
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
      
      <main className="flex-grow py-8 sm:py-12 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Specialist Image and Basic Info */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4 lg:space-y-6">
                <div className="rounded-lg overflow-hidden shadow-md animate-fade-in">
                  <img 
                    src={specialist.avatar_url || "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=761&q=80"} 
                    alt={specialist.full_name}
                    className="w-full h-64 sm:h-80 object-cover"
                  />
                </div>
                
                <Card className="animate-fade-in">
                  <CardContent className="p-4 lg:p-6">
                    <h1 className="text-xl lg:text-2xl font-semibold mb-2">{specialist.full_name}</h1>
                    <p className="text-primary text-base lg:text-lg mb-4">{specialist.specialty}</p>
                    
                    {specialist.location && (
                      <div className="flex items-start gap-2 mb-4">
                        <MapPin className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{specialist.location}</span>
                      </div>
                    )}
                    
                    {specialist.experience && (
                      <div className="flex items-center gap-2 mb-4">
                        <ClockIcon className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{specialist.experience}</span>
                      </div>
                    )}
                    
                    {/* Detailed Availability Badge */}
                    {!availabilityLoading && availabilityStatus && (
                      <div className="mb-4 lg:mb-6">
                        <AvailabilityBadge 
                          status={availabilityStatus.status}
                          slotsRemaining={availabilityStatus.slots_remaining}
                          dailyLimit={availabilityStatus.daily_limit}
                          className="w-full justify-center sm:w-auto sm:justify-start"
                        />
                      </div>
                    )}
                    
                    {/* Rating Component */}
                    <div className="mb-4 lg:mb-6">
                      <RatingComponent specialistId={id!} showSubmissionForm={false} />
                    </div>
                    
                    {/* Booking component will handle all booking functionality */}
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Specialist Details and Services */}
            <div className="lg:col-span-2 space-y-6 lg:space-y-8">
              <div className="animate-fade-in">
                <h2 className="text-lg lg:text-xl font-semibold mb-4">About</h2>
                <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">
                  {specialist.bio || "Professional specialist with years of experience in the industry."}
                </p>
              </div>

              {/* Integrated Booking Form */}
              <div className="animate-fade-in">
                <ProfileBookingForm 
                  stylistId={id!}
                  serviceCategories={serviceCategories}
                  selectedServiceTypes={selectedServiceTypes}
                  onServiceToggle={handleServiceTypeToggle}
                />
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
