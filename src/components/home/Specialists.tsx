
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scissors, Droplets, WashingMachine, Search, MapPin } from "lucide-react";
import StylistCard from "@/components/ui/StylistCard";
import { supabase } from "@/integrations/supabase/client";


// Keep the hardcoded specialists for demo purposes
const hardcodedSpecialists = [];

const Specialists = () => {
  const [activeRole, setActiveRole] = useState("all");
  const [registeredStylists, setRegisteredStylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  // Fetch registered specialists from the database
  useEffect(() => {
    const fetchStylists = async () => {
      try {
        console.log("Fetching registered specialists...");
        
        const { data, error } = await supabase.rpc('get_public_stylists');
        
        if (error) {
          console.error("Error fetching specialists:", error);
        } else {
          console.log("Fetched specialists:", data);
          
          // Transform the data to match the expected format
          const transformedStylists = data?.map(stylist => ({
            id: stylist.id,
            name: stylist.full_name || "Unnamed Specialist",
            role: stylist.service_type === 'laundry' ? 'Laundry Services Specialist' : (stylist.specialty || "Beauty Specialist"),
            bio: stylist.bio || "Professional specialist with expertise in modern techniques.",
            image: stylist.avatar_url || "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=761&q=80",
            location: stylist.location,
            serviceType: stylist.service_type
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

  // Combine registered specialists with hardcoded ones
  const allSpecialists = [...registeredStylists, ...hardcodedSpecialists];
  
  const filteredSpecialists = allSpecialists.filter(specialist => {
    let roleMatch = false;
    
    if (activeRole === "all") {
      // Only show beauty specialists, exclude laundry and cleaning
      roleMatch = specialist.serviceType === 'beauty' || !specialist.serviceType;
    } else {
      // For beauty services (hair, nail, etc.)
      roleMatch = (specialist.serviceType === 'beauty' || !specialist.serviceType) && 
                  specialist.role.toLowerCase().includes(activeRole);
    }
    
    const nameMatch = !searchName || specialist.name.toLowerCase().includes(searchName.toLowerCase());
    const locationMatch = !searchLocation || (specialist.location && specialist.location.toLowerCase().includes(searchLocation.toLowerCase()));
    
    return roleMatch && nameMatch && locationMatch;
  });

  return (
    <section id="specialists" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Our Specialists</h2>
          <p className="text-muted-foreground text-balance">
            Meet our skilled specialists who provide top-quality service with expertise and care across various service areas.
          </p>
        </div>
        
        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by location..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex justify-center mb-8 gap-3 flex-wrap">
          <Button 
            variant={activeRole === "all" ? "default" : "outline"} 
            onClick={() => setActiveRole("all")}
            className="animate-fade-in mb-2"
          >
            All Services
          </Button>
          <Button 
            variant={activeRole === "hair" ? "default" : "outline"} 
            onClick={() => setActiveRole("hair")}
            className="animate-fade-in flex items-center gap-2 mb-2"
          >
            <Scissors className="h-4 w-4" />
            Hair Services
          </Button>
          <Button 
            variant={activeRole === "nail" ? "default" : "outline"} 
            onClick={() => setActiveRole("nail")}
            className="animate-fade-in flex items-center gap-2 mb-2"
          >
            <Droplets className="h-4 w-4" />
            Nail Care
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading specialists...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
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
          <Link to="/specialists">
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
