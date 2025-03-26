
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ServiceCard from "@/components/ui/ServiceCard";

const services = [
  {
    id: 1,
    title: "Haircut & Styling",
    description: "Precision cut and professional styling to create the perfect look for your face shape and preferences.",
    price: "$45+",
    duration: "45 mins",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80"
  },
  {
    id: 2,
    title: "Hair Coloring",
    description: "Expert color services from subtle highlights to bold transformations using premium products.",
    price: "$75+",
    duration: "90 mins",
    image: "https://images.unsplash.com/photo-1567894340315-735d7c361db0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1173&q=80"
  },
  {
    id: 3,
    title: "Balayage",
    description: "Hand-painted highlights that create a natural, sun-kissed look with seamless blending.",
    price: "$120+",
    duration: "120 mins",
    image: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
  },
  {
    id: 4,
    title: "Blowout & Styling",
    description: "Professional blow dry and styling to achieve smooth, voluminous, or textured finishes.",
    price: "$35+",
    duration: "30 mins",
    image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80"
  },
  {
    id: 5,
    title: "Deep Conditioning",
    description: "Intensive treatment to repair damaged hair, restore moisture, and enhance shine.",
    price: "$30+",
    duration: "20 mins",
    image: "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
  },
  {
    id: 6,
    title: "Hair Extensions",
    description: "Quality hair extensions applied by certified professionals for added length and volume.",
    price: "$200+",
    duration: "180 mins",
    image: "https://images.unsplash.com/photo-1596178060810-72c3202efd3b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
  }
];

const Services = () => {
  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Our Services</h2>
          <p className="text-muted-foreground text-balance">
            We offer a wide range of premium hair services tailored to enhance your natural beauty and keep your hair looking its best.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((service, index) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              description={service.description}
              price={service.price}
              duration={service.duration}
              image={service.image}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            />
          ))}
        </div>
        
        <div className="text-center">
          <Link to="/booking">
            <Button size="lg" className="animate-fade-in">
              Book a Service
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Services;
