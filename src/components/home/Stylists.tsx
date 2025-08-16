import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { MapPinIcon, BriefcaseIcon, StarIcon } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import AvailabilityBadge from "@/components/ui/AvailabilityBadge";
import { useAvailabilityStatus } from "@/hooks/useAvailabilityStatus";

interface StylistCardProps {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  imageUrl: string | null;
  bio: string;
  location: string;
}

const StylistCard = ({ id, name, specialty, experience, imageUrl, bio, location }: StylistCardProps) => {
  const { availabilityStatus, loading } = useAvailabilityStatus(id);
  
  const getAvailabilityText = () => {
    if (loading) return "";
    if (!availabilityStatus) return "";
    
    switch (availabilityStatus.status) {
      case 'available':
        return "Available";
      case 'full':
        return "Not Available";
      case 'unavailable':
      default:
        return "Not Available";
    }
  };

  const getAvailabilityColor = () => {
    if (loading || !availabilityStatus) return "text-muted-foreground";
    
    switch (availabilityStatus.status) {
      case 'available':
        return "text-primary";
      case 'full':
      case 'unavailable':
      default:
        return "text-red-600";
    }
  };
  
  return (
    <Card className="w-full max-w-sm mx-auto shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="text-center pb-4">
        <div className="relative">
          <Avatar className="w-20 h-20 mx-auto mb-3 border-2 border-muted-foreground">
            {imageUrl ? (
              <AvatarImage src={imageUrl} alt={name} className="object-cover" />
            ) : (
              <AvatarFallback className="text-lg font-semibold">
                {name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          {!loading && availabilityStatus && (
            <div className="flex justify-center mt-2">
              <span className={`text-xs font-medium ${getAvailabilityColor()}`}>
                {getAvailabilityText()}
              </span>
            </div>
          )}
        </div>
        <CardTitle className="text-lg font-semibold text-center">{name}</CardTitle>
        <CardDescription className="text-center">{specialty}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <BriefcaseIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate">{experience}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPinIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate">{location}</span>
        </div>
        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">{bio}</p>
        <Link to={`/stylist/${id}`} className="block">
          <Button 
            className="w-full mt-4"
            disabled={availabilityStatus?.status === 'unavailable'}
          >
            {availabilityStatus?.status === 'full' ? 'View Profile (Fully Booked)' : 'View Profile'}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

const Stylists = () => {
  const [stylists, setStylists] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterExperience, setFilterExperience] = useState<number[]>([0, 10]);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStylists = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching registered specialists for featured section...");
        
        const { data, error } = await supabase.rpc('get_public_stylists');
        
        if (error) {
          console.error("Error fetching specialists:", error);
          throw error;
        }
        
        console.log("Fetched specialists for featured section:", data);
        
        const list = (Array.isArray(data) ? data : []).filter((s: any) => s.full_name);
        
        // Transform the data to match the expected format
        const transformedStylists = list.map((stylist: any) => ({
          id: stylist.id,
          full_name: stylist.full_name || "Unnamed Specialist",
          specialty: stylist.specialty || "Specialist",
          experience: stylist.experience || "Professional with experience",
          card_image_url: stylist.card_image_url,
          avatar_url: stylist.avatar_url,
          bio: stylist.bio || "Professional specialist with expertise in modern techniques.",
          location: stylist.location || "Location not specified"
        }));
        
        setStylists(transformedStylists);
      } catch (error) {
        console.error("Could not fetch specialists:", error);
        toast({
          title: "Error",
          description: "Failed to load specialists. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStylists();
  }, [toast]);

  const filteredStylists = stylists.filter(stylist => {
    const searchRegex = new RegExp(searchTerm, 'i');
    const nameMatch = searchRegex.test(stylist.full_name);
    const specialtyMatch = filterSpecialty ? stylist.specialty.toLowerCase().includes(filterSpecialty.toLowerCase()) : true;
    const locationMatch = filterLocation ? stylist.location.toLowerCase().includes(filterLocation.toLowerCase()) : true;
    
    // Handle experience filtering, considering we're using strings for experience
    let experienceYears = 0;
    if (typeof stylist.experience === 'string') {
      const match = stylist.experience.match(/\d+/);
      if (match) {
        experienceYears = parseInt(match[0]);
      }
    } else if (typeof stylist.experience === 'number') {
      experienceYears = stylist.experience;
    }
    
    const experienceMatch = experienceYears >= filterExperience[0] && experienceYears <= filterExperience[1];

    return nameMatch && specialtyMatch && locationMatch && experienceMatch;
  });

  const renderStylist = (stylist: any) => (
    <StylistCard 
      key={stylist.id}
      id={stylist.id}
      name={stylist.full_name}
      specialty={stylist.specialty}
      experience={stylist.experience}
      imageUrl={stylist.card_image_url || stylist.avatar_url}
      bio={stylist.bio}
      location={stylist.location}
    />
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold">Featured Specialists</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Search specialists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />
          <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <StarIcon className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Filter Specialists</DialogTitle>
                <DialogDescription>
                  Adjust the filters to find the perfect specialist for you.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label
                    htmlFor="specialty"
                    className="text-sm font-medium leading-none"
                  >
                    Specialty
                  </label>
                  <Input
                    id="specialty"
                    value={filterSpecialty}
                    onChange={(e) => setFilterSpecialty(e.target.value)}
                    placeholder="e.g., Hair Coloring"
                    className="col-span-3"
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="location"
                    className="text-sm font-medium leading-none"
                  >
                    Location
                  </label>
                  <Input
                    id="location"
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    placeholder="e.g., Accra, Kumasi"
                    className="col-span-3"
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="experience"
                    className="text-sm font-medium leading-none"
                  >
                    Experience (Years)
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      id="experience-min"
                      value={filterExperience[0]}
                      onChange={(e) => setFilterExperience([Number(e.target.value), filterExperience[1]])}
                      placeholder="Min"
                      className="w-24"
                    />
                    <span>-</span>
                    <Input
                      type="number"
                      id="experience-max"
                      value={filterExperience[1]}
                      onChange={(e) => setFilterExperience([filterExperience[0], Number(e.target.value)])}
                      placeholder="Max"
                      className="w-24"
                    />
                  </div>
                  <Slider
                    defaultValue={filterExperience}
                    max={20}
                    step={1}
                    onValueChange={(value) => setFilterExperience(value)}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="w-full">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <p>Loading specialists...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStylists.length > 0 ? (
              filteredStylists.map(renderStylist)
            ) : (
              <div className="col-span-full text-center p-8">
                <p>No specialists found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stylists;
