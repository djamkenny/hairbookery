
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
import ReviewCard from "@/components/ui/ReviewCard";

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

interface StylistReview {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_profile?: {
    full_name?: string;
    avatar_url?: string;
  };
}

const SpecialistDetail = () => {
  const { id } = useParams();
  const [specialist, setSpecialist] = useState<SpecialistProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<StylistReview[]>([]);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0 });
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

        // Fetch reviews for this specialist from appointments
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            id,
            rating,
            comment,
            created_at,
            user_profile:profiles(full_name, avatar_url)
          `)
          .eq('stylist_id', id)
          .order('created_at', { ascending: false });

        if (reviewsError) {
          console.error("Error fetching reviews:", reviewsError);
        } else if (reviewsData) {
          setReviews(reviewsData);
          
          // Calculate review statistics
          if (reviewsData.length > 0) {
            const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / reviewsData.length;
            setReviewStats({
              averageRating: Math.round(averageRating * 10) / 10,
              totalReviews: reviewsData.length
            });
          }
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
                    
                    <div className="flex items-center gap-2 mb-6">
                      <StarIcon className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="text-sm text-muted-foreground">
                        {reviewStats.totalReviews > 0 
                          ? `${reviewStats.averageRating} (${reviewStats.totalReviews} review${reviewStats.totalReviews > 1 ? 's' : ''})`
                          : "No reviews yet"
                        }
                      </span>
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

              {/* Reviews Section */}
              <div className="animate-fade-in">
                <h2 className="text-xl font-semibold mb-6">Client Reviews</h2>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <ReviewCard
                        key={review.id}
                        name={review.user_profile?.full_name || "Anonymous Client"}
                        date={new Date(review.created_at).toLocaleDateString()}
                        rating={review.rating}
                        comment={review.comment}
                        image={review.user_profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user_profile?.full_name || "Anonymous")}`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 bg-muted/30 rounded-lg">
                    <p className="text-muted-foreground">No reviews yet for this specialist.</p>
                    <p className="text-sm text-muted-foreground mt-2">Be the first to leave a review after your appointment!</p>
                  </div>
                )}
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
