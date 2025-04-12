
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scissors, Droplets, WashingMachine } from "lucide-react";
import StylistCard from "@/components/ui/StylistCard";

const specialists = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Hair Stylist",
    bio: "Sarah brings 10+ years of expertise to create stunning cuts, colors, and styles for all hair types.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=761&q=80"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Hair Stylist",
    bio: "Michael specializes in creative color techniques, texture transformations, and editorial styling.",
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1148&q=80"
  },
  {
    id: 3,
    name: "Jessica Lee",
    role: "Hair Stylist",
    bio: "Jessica is known for her precision cutting and ability to create personalized looks that enhance each client's features.",
    image: "https://images.unsplash.com/photo-1450297166380-cabe503887e5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1145&q=80"
  },
  {
    id: 4,
    name: "David Wilson",
    role: "Hair Stylist",
    bio: "David's passion for innovative techniques and trends makes him the perfect stylist for bold, fashion-forward looks.",
    image: "https://images.unsplash.com/photo-1508341591423-4347099e1f19?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1474&q=80"
  },
  {
    id: 5,
    name: "Nia Jackson",
    role: "Nail Technician",
    bio: "With over 8 years of experience, Nia specializes in intricate nail art designs and gel extensions.",
    image: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
  },
  {
    id: 6,
    name: "Marcus Brown",
    role: "Nail Technician",
    bio: "Marcus is known for his precision work with acrylics and his dedication to nail health and maintenance.",
    image: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
  },
  {
    id: 7,
    name: "Tiana Wilson",
    role: "Laundry Specialist",
    bio: "Tiana has extensive knowledge in fabric care and specializes in handling delicate materials and stain removal.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
  },
  {
    id: 8,
    name: "Jamal Foster",
    role: "Laundry Specialist",
    bio: "With 10+ years in textile care, Jamal provides expert advice on garment preservation and restoration.",
    image: "https://images.unsplash.com/photo-1578597096845-8854485e8753?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
  }
];

const Specialists = () => {
  const [activeRole, setActiveRole] = React.useState("all");
  
  const filteredSpecialists = activeRole === "all" 
    ? specialists 
    : specialists.filter(specialist => specialist.role.toLowerCase().includes(activeRole));

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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {filteredSpecialists.map((specialist) => (
            <StylistCard
              key={specialist.id}
              id={specialist.id}
              name={specialist.name}
              role={specialist.role}
              bio={specialist.bio}
              image={specialist.image}
              className="animate-fade-in"
            />
          ))}
        </div>
        
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
