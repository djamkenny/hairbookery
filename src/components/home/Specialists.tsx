import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scissors, Droplets, WashingMachine } from "lucide-react";
import StylistCard from "@/components/ui/StylistCard";
import { supabase } from "@/integrations/supabase/client";

// Keep the hardcoded specialists for demo purposes
const hardcodedSpecialists = [];

const Specialists = () => {
  const [activeRole, setActiveRole] = useState("all");
  const [registeredStylists, setRegisteredStylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch registered stylists from the database
  useEffect(() => {
    const fetchStylists = async () => {
      try {
        console.log("Fetching registered stylists...");
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, specialty, bio, avatar_url, location')
          .eq('is_stylist', true)
          .not('full_name', 'is', null); // Only get stylists with names
        
        if (error) {
          console.error("Error fetching stylists:", error);
        } else {
          console.log("Fetched stylists:", data);
          
          // Transform the data to match the expected format
          const transformedStylists = data?.map(stylist => ({
            id: stylist.id,
            name: stylist.full_name || "Unnamed Stylist",
            role: stylist.specialty || "Hair Stylist",
            bio: stylist.bio || "Professional stylist with expertise in modern techniques.",
            image: stylist.avatar_url || "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=761&q=80",
            location: stylist.location
          })) || [];
          
          setRegisteredStylists(transformedStylists);
        }
      } catch (error) {
        console.error("Error in fetchStylists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStylists();
  }, []);

  // Combine registered stylists with hardcoded ones
  const allSpecialists = [...registeredStylists, ...hardcodedSpecialists];
  
  const filteredSpecialists = activeRole === "all" 
    ? allSpecialists 
    : allSpecialists.filter(specialist => specialist.role.toLowerCase().includes(activeRole));

  return (
    <section id="specialists" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Our Specialists</h2>
          <p className="text-muted-foreground text-balance">
            Meet our skilled specialists who provide top-quality service with expertise and care across various service areas.
          </p>
        </div>
        
        <div className="flex justify-center mb-8 gap-3 flex-wrap">
          <Button 
            variant={activeRole === "all" ? "default" : "outline"} 
            onClick={() => setActiveRole("all")}
            className="animate-fade-in mb-2"
          >
            All Specialists
          </Button>
          <Button 
            variant={activeRole === "hair" ? "default" : "outline"} 
            onClick={() => setActiveRole("hair")}
            className="animate-fade-in flex items-center gap-2 mb-2"
          >
            <Scissors className="h-4 w-4" />
            Hair Stylists
          </Button>
          <Button 
            variant={activeRole === "nail" ? "default" : "outline"} 
            onClick={() => setActiveRole("nail")}
            className="animate-fade-in flex items-center gap-2 mb-2"
          >
            <Droplets className="h-4 w-4" />
            Nail Technicians
          </Button>
          <Button 
            variant={activeRole === "laundry" ? "default" : "outline"} 
            onClick={() => setActiveRole("laundry")}
            className="animate-fade-in flex items-center gap-2 mb-2"
          >
            <WashingMachine className="h-4 w-4" />
            Laundry Specialists
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading specialists...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {filteredSpecialists.map((specialist) => (
              <StylistCard
                key={specialist.id}
                id={specialist.id}
                name={specialist.name}
                role={specialist.role}
                bio={specialist.bio}
                image={specialist.image}
                location={specialist.location}
                className="animate-fade-in"
              />
            ))}
          </div>
        )}
        
        <div className="text-center">
          <Link to="/booking">
            <Button size="lg" className="animate-fade-in">
              Book with a Specialist
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Specialists;
