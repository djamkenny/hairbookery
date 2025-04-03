
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scissors, MapPin } from "lucide-react";
import StylistCard from "@/components/ui/StylistCard";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Stylists = () => {
  const [stylists, setStylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch registered stylists from Supabase
  useEffect(() => {
    const fetchStylists = async () => {
      try {
        setLoading(true);
        
        // Fetch users who have signed up as stylists
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_stylist', true);
        
        if (error) throw error;
        
        console.log("Fetched stylists:", data);
        
        // Transform the data to match our StylistCard component props
        if (data && data.length > 0) {
          const formattedStylists = data.map((profile) => {
            return {
              id: profile.id,
              name: profile.full_name || "Unnamed Stylist",
              role: profile.specialty || "Hair Stylist",
              bio: profile.bio || "No bio available",
              image: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`,
              cardImage: profile.card_image_url || undefined,
              location: profile.location || undefined
            };
          });
          
          setStylists(formattedStylists);
        }
      } catch (error: any) {
        console.error("Error fetching stylists:", error);
        setError(error.message || "Failed to load stylists");
      } finally {
        setLoading(false);
      }
    };
    
    fetchStylists();
  }, []);

  // Show fallback content if no real stylists are found
  const fallbackStylists = [
    {
      id: 1,
      name: "Amara Johnson",
      role: "Senior Stylist",
      bio: "Specializing in textured hair, protective styles, and natural hair care with over 10 years of experience.",
      image: "https://images.unsplash.com/photo-1589156191108-c762ff4b96ab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      location: "125 Beauty Ave, Suite 10, New York, NY"
    },
    {
      id: 2,
      name: "Malik Williams",
      role: "Master Barber",
      bio: "Expertise in fades, designs, and beard grooming with a passion for helping clients look and feel their best.",
      image: "https://images.unsplash.com/photo-1618146366204-a1ffee4a9c8d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      location: "240 Style Street, Chicago, IL"
    },
    {
      id: 3,
      name: "Zara Thompson",
      role: "Color Specialist",
      bio: "Award-winning colorist with extensive training in techniques for all hair types and textures.",
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      location: "500 Main St, Atlanta, GA"
    },
    {
      id: 4,
      name: "Damon Carter",
      role: "Styling Expert",
      bio: "Specializes in natural hairstyling, braiding, twists, and maintaining healthy hair through proper technique.",
      image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      location: "1200 Hollywood Blvd, Los Angeles, CA"
    }
  ];

  // Determine which stylists to display (real or fallback)
  const displayStylists = stylists.length > 0 ? stylists : fallbackStylists;

  return (
    <section id="stylists" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Our Stylists</h2>
          <p className="text-muted-foreground text-balance">
            Our team of experienced hair stylists are passionate about creating the perfect look for each client.
            Book an appointment with one of our talented professionals today.
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center text-destructive py-6">
            <p>{error}</p>
          </div>
        ) : displayStylists.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-6">No stylists are available at the moment.</p>
            <Link to="/stylist-register">
              <Button variant="outline">Register as a Stylist</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {displayStylists.map((stylist) => (
                <Link 
                  to={`/stylist/${stylist.id}`} 
                  key={stylist.id} 
                  className="block hover:scale-105 transition-transform duration-300"
                >
                  <StylistCard
                    id={stylist.id}
                    name={stylist.name}
                    role={stylist.role}
                    bio={stylist.bio}
                    image={stylist.image}
                    cardImage={stylist.cardImage}
                    location={stylist.location}
                    className="animate-fade-in h-full"
                  />
                </Link>
              ))}
            </div>
            
            <div className="text-center">
              <Link to="/booking">
                <Button size="lg" className="animate-fade-in">
                  Book with a Stylist
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Stylists;
