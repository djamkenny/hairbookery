
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scissors, Droplets, WashingMachine } from "lucide-react";
import StylistCard from "@/components/ui/StylistCard";

const specialists = [
  {
    id: 5,
    name: "Jennifer Lee",
    role: "Nail Technician",
    bio: "With over 8 years of experience, Jennifer specializes in intricate nail art designs and gel extensions.",
    image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
  },
  {
    id: 6,
    name: "Michael Torres",
    role: "Nail Technician",
    bio: "Michael is known for his precision work with acrylics and his dedication to nail health and maintenance.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
  },
  {
    id: 7,
    name: "Olivia Parker",
    role: "Laundry Specialist",
    bio: "Olivia has extensive knowledge in fabric care and specializes in handling delicate materials and stain removal.",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
  },
  {
    id: 8,
    name: "David Kim",
    role: "Laundry Specialist",
    bio: "With 10+ years in textile care, David provides expert advice on garment preservation and restoration.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
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
            Meet our skilled nail technicians and laundry specialists who provide top-quality service with expertise and care.
          </p>
        </div>
        
        <div className="flex justify-center mb-8 gap-3">
          <Button 
            variant={activeRole === "all" ? "default" : "outline"} 
            onClick={() => setActiveRole("all")}
            className="animate-fade-in"
          >
            All Specialists
          </Button>
          <Button 
            variant={activeRole === "nail" ? "default" : "outline"} 
            onClick={() => setActiveRole("nail")}
            className="animate-fade-in flex items-center gap-2"
          >
            <Scissors className="h-4 w-4" />
            Nail Technicians
          </Button>
          <Button 
            variant={activeRole === "laundry" ? "default" : "outline"} 
            onClick={() => setActiveRole("laundry")}
            className="animate-fade-in flex items-center gap-2"
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
