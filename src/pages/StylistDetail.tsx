
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ClockIcon, MapPin, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProfileBookingForm from "@/components/specialist/ProfileBookingForm";
import { LaundryBookingForm } from "@/components/laundry/LaundryBookingForm";
import { CleaningBookingForm } from "@/components/cleaning/CleaningBookingForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Service, ServiceType } from "@/components/stylist/services/types";
import RatingComponent from "@/components/specialist/RatingComponent";
import AvailabilityBadge from "@/components/ui/AvailabilityBadge";
import { useAvailabilityStatus } from "@/hooks/useAvailabilityStatus";
import ImageLightbox from "@/components/ui/ImageLightbox";
import { useLocationSharing } from "@/hooks/useLocationSharing";

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
  is_laundry_specialist: boolean;
  is_cleaning_specialist: boolean;
  service_type: string;
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
  const [services, setServices] = useState<Service[]>([]);
  const { availabilityStatus, loading: availabilityLoading } = useAvailabilityStatus(id);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState<string>("");
  const { shareLocation } = useLocationSharing();
  
  useEffect(() => {
    const fetchSpecialistAndServices = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        console.log("Fetching specialist with ID:", id);
        
        // Fetch specialist profile (safe, public fields only)
        const { data: rpcData, error: specialistError } = await supabase.rpc('get_public_stylists', { p_id: id });
        
        if (specialistError) {
          console.error("Error fetching specialist:", specialistError);
          toast.error("Failed to load specialist profile");
          return;
        }
        
        const specialistRow: any = Array.isArray(rpcData) ? rpcData[0] : null;
        
        if (specialistRow) {
          console.log("Fetched specialist data:", specialistRow);
          setSpecialist({
            id: specialistRow.id,
            full_name: specialistRow.full_name,
            specialty: specialistRow.specialty,
            bio: specialistRow.bio,
            avatar_url: specialistRow.avatar_url,
            location: specialistRow.location,
            experience: specialistRow.experience,
            email: null,
            phone: null,
            is_laundry_specialist: specialistRow.is_laundry_specialist,
            is_cleaning_specialist: specialistRow.is_cleaning_specialist,
            service_type: specialistRow.service_type
          });
        } else {
          toast.error("Specialist not found");
          return;
        }
        
        // Check specialist type and fetch appropriate services
        if (specialistRow?.service_type === 'laundry' || specialistRow?.is_laundry_specialist) {
          // Fetch laundry services for laundry specialists
          const { data: laundryServicesData, error: laundryError } = await supabase
            .from('laundry_services')
            .select('*')
            .eq('specialist_id', id);

          if (laundryError) {
            console.error("Error fetching laundry services:", laundryError);
            toast.error("Failed to load laundry services");
            return;
          }

          if (laundryServicesData) {
            // Convert laundry services to service types format
            const laundryServiceTypes: ServiceType[] = laundryServicesData.map((service: any) => ({
              id: service.id,
              service_id: service.id, // Use the same ID for laundry services
              name: service.name,
              description: service.description,
              price: service.price_per_kg || service.base_price || 0,
              duration: (service.turnaround_days || 2) * 60 * 24, // Convert days to minutes
              created_at: service.created_at,
              updated_at: service.updated_at
            }));

            const categories: ServiceCategory[] = [{
              name: 'Laundry Services',
              description: 'Professional laundry and dry cleaning services',
              serviceTypes: laundryServiceTypes
            }];

            setServiceCategories(categories);
          }
        } else if (specialistRow?.service_type === 'cleaning' || specialistRow?.is_cleaning_specialist) {
          // Fetch cleaning services for cleaning specialists
          const { data: cleaningServicesData, error: cleaningError } = await supabase
            .from('cleaning_services')
            .select('*')
            .eq('specialist_id', id);

          if (cleaningError) {
            console.error("Error fetching cleaning services:", cleaningError);
            toast.error("Failed to load cleaning services");
            return;
          }

          if (cleaningServicesData) {
            // Convert cleaning services to service types format
            const cleaningServiceTypes: ServiceType[] = cleaningServicesData.map((service: any) => ({
              id: service.id,
              service_id: service.id, // Use the same ID for cleaning services
              name: service.name,
              description: service.description,
              price: service.total_price / 100, // Convert from cents to GHS, show service price only (no booking fee)
              duration: (service.duration_hours || 2) * 60, // Convert hours to minutes
              created_at: service.created_at,
              updated_at: service.updated_at
            }));

            const categories: ServiceCategory[] = [{
              name: 'Cleaning Services',
              description: 'Professional home and office cleaning services',
              serviceTypes: cleaningServiceTypes
            }];

            setServiceCategories(categories);
          }
        } else {
          // Fetch beauty service types through services join for beauty specialists
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
        }
        
        // Fetch services with images for gallery
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('id,name,description,image_urls,price,duration,category,stylist_id')
          .eq('stylist_id', id);

        if (servicesError) {
          console.error("Error fetching services for gallery:", servicesError);
        } else if (servicesData) {
          const mapped = servicesData.map((s: any) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            duration: String(s.duration),
            price: String(s.price),
            stylist_id: s.stylist_id,
            image_urls: s.image_urls || [],
            category: s.category || 'Hair Cutting & Styling'
          })) as Service[];
          setServices(mapped);
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
              <div className="lg:sticky lg:top-24 space-y-4 lg:space-y-6">
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
                      <div 
                        className="flex items-start gap-2 mb-4 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => shareLocation(specialist.location!, specialist.full_name)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Open ${specialist.location} in Google Maps`}
                      >
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
                      <RatingComponent 
                        specialistId={id!} 
                        showSubmissionForm={false} 
                        showFeedbackList={true} 
                      />
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

              {services.filter(s => (s.image_urls?.length || 0) > 0).length > 0 && (
                <div className="animate-fade-in">
                  <h2 className="text-lg lg:text-xl font-semibold mb-4">Service Gallery</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.filter(s => (s.image_urls?.length || 0) > 0).map((service) => (
                      <div key={service.id} className="space-y-3">
                        <h3 className="font-medium text-base lg:text-lg">{service.name}</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {service.image_urls.slice(0, 2).map((imageUrl, index) => (
                            <div
                              key={index}
                              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group bg-muted"
                              onClick={() => {
                                setLightboxImages(service.image_urls || []);
                                setLightboxIndex(index);
                                setLightboxTitle(service.name);
                                setLightboxOpen(true);
                              }}
                              aria-label={`Open ${service.name} gallery at image ${index + 1}`}
                            >
                              <img
                                src={imageUrl}
                                alt={`${service.name} image ${index + 1}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                              {index === 1 && (service.image_urls?.length || 0) > 2 && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                  <span className="text-white font-medium">+{(service.image_urls?.length || 0) - 2} more</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Integrated Booking Form */}
              <div className="animate-fade-in">
                {specialist.service_type === 'laundry' || specialist.is_laundry_specialist ? (
                  <LaundryBookingForm specialistId={id!} />
                ) : specialist.service_type === 'cleaning' || specialist.is_cleaning_specialist ? (
                  <CleaningBookingForm specialistId={id!} />
                ) : (
                  <ProfileBookingForm 
                    stylistId={id!}
                    serviceCategories={serviceCategories}
                    selectedServiceTypes={selectedServiceTypes}
                    onServiceToggle={handleServiceTypeToggle}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <ImageLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        images={lightboxImages}
        startIndex={lightboxIndex}
        altPrefix={`${lightboxTitle} image`}
        title={lightboxTitle}
      />
      
      <Footer />
    </div>
  );
};

export default SpecialistDetail;
