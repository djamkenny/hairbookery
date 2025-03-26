
import React from "react";
import StylistCard from "@/components/ui/StylistCard";

const stylists = [
  {
    id: 1,
    name: "Sophia Rodriguez",
    role: "Master Stylist",
    bio: "With over 10 years of experience, Sophia specializes in precision cuts and color transformations.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=761&q=80"
  },
  {
    id: 2,
    name: "Alex Chen",
    role: "Color Specialist",
    bio: "Alex creates stunning balayage and color melts that enhance your natural beauty and style.",
    image: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80"
  },
  {
    id: 3,
    name: "Emma Johnson",
    role: "Texture Expert",
    bio: "Emma excels in creating beautiful styles for all hair textures, with a focus on natural curls.",
    image: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=778&q=80"
  },
  {
    id: 4,
    name: "Marcus Williams",
    role: "Cutting Specialist",
    bio: "Marcus brings precision and artistic vision to every cut, creating styles that enhance your features.",
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=848&q=80"
  }
];

const Stylists = () => {
  return (
    <section id="stylists" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Meet Our Stylists</h2>
          <p className="text-muted-foreground text-balance">
            Our team of talented professionals is passionate about creating beautiful hairstyles tailored to your personality and lifestyle.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stylists.map((stylist, index) => (
            <StylistCard
              key={stylist.id}
              id={stylist.id}
              name={stylist.name}
              role={stylist.role}
              bio={stylist.bio}
              image={stylist.image}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stylists;
