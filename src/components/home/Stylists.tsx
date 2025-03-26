import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import StylistCard from "@/components/ui/StylistCard";

const stylists = [
  {
    id: 1,
    name: "Amara Johnson",
    role: "Senior Stylist",
    bio: "Specializing in textured hair, protective styles, and natural hair care with over 10 years of experience.",
    image: "https://images.unsplash.com/photo-1589156191108-c762ff4b96ab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
  },
  {
    id: 2,
    name: "Malik Williams",
    role: "Master Barber",
    bio: "Expertise in fades, designs, and beard grooming with a passion for helping clients look and feel their best.",
    image: "https://images.unsplash.com/photo-1618146366204-a1ffee4a9c8d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
  },
  {
    id: 3,
    name: "Zara Thompson",
    role: "Color Specialist",
    bio: "Award-winning colorist with extensive training in techniques for all hair types and textures.",
    image: "https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
  },
  {
    id: 4,
    name: "Damon Carter",
    role: "Styling Expert",
    bio: "Specializes in natural hairstyling, braiding, twists, and maintaining healthy hair through proper technique.",
    image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
  }
];

const Stylists = () => {
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stylists.map((stylist) => (
            <StylistCard
              key={stylist.id}
              id={stylist.id}
              name={stylist.name}
              role={stylist.role}
              bio={stylist.bio}
              image={stylist.image}
              className="animate-fade-in"
              style={{ animationDelay: `${(stylist.id - 1) * 0.1}s` }}
            />
          ))}
        </div>
        
        <div className="text-center">
          <Link to="/booking">
            <Button size="lg" className="animate-fade-in">
              Book with a Stylist
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Stylists;
