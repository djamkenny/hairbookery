
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
  return (
    <Card className="w-[350px] shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{name}</CardTitle>
        <CardDescription>{specialty}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Avatar className="w-24 h-24 rounded-full overflow-hidden border-2 border-muted-foreground">
          {imageUrl ? (
            <AvatarImage src={imageUrl} alt={name} className="object-cover" />
          ) : (
            <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
          )}
        </Avatar>
        <div className="text-sm space-y-1">
          <div className="flex items-center gap-2">
            <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
            <span>{experience}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 text-muted-foreground" />
            <span>{location}</span>
          </div>
          <p className="text-muted-foreground line-clamp-3">{bio}</p>
        </div>
        <Link to={`/stylist/${id}`}>
          <Button className="w-full">View Profile</Button>
        </Link>
      </CardContent>
    </Card>
  );
};

const Stylists = () => {
  const [stylists, setStylists] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("");
  const [filterExperience, setFilterExperience] = useState<number[]>([0, 10]);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStylists = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching registered specialists for featured section...");
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, specialty, experience, bio, avatar_url, card_image_url, location')
          .eq('is_stylist', true)
          .not('full_name', 'is', null);
        
        if (error) {
          console.error("Error fetching specialists:", error);
          throw error;
        }
        
        console.log("Fetched specialists for featured section:", data);
        
        // Transform the data to match the expected format
        const transformedStylists = data?.map(stylist => ({
          id: stylist.id,
          full_name: stylist.full_name || "Unnamed Specialist",
          specialty: stylist.specialty || "Specialist",
          experience: stylist.experience || "Professional with experience",
          card_image_url: stylist.card_image_url,
          avatar_url: stylist.avatar_url,
          bio: stylist.bio || "Professional specialist with expertise in modern techniques.",
          location: stylist.location || "Location not specified"
        })) || [];
        
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
    const specialtyMatch = filterSpecialty ? stylist.specialty.toLowerCase().includes(filterSpecialty.toLowerCase()) : true;
    
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

    return searchRegex.test(stylist.full_name) && specialtyMatch && experienceMatch;
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
    <div className="container mx-auto py-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-semibold">Featured Specialists</h2>
        <Input
          type="text"
          placeholder="Search specialists..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-1/3"
        />
        <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
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
      <ScrollArea className="rounded-md border p-4">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <p>Loading specialists...</p>
          </div>
        ) : (
          <div className="flex gap-6">
            {filteredStylists.length > 0 ? (
              filteredStylists.map(renderStylist)
            ) : (
              <p>No specialists found matching your criteria.</p>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default Stylists;
