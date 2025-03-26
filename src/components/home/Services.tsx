
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
    image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80",
    category: "hair"
  },
  {
    id: 2,
    title: "Hair Coloring",
    description: "Expert color services from subtle highlights to bold transformations using premium products.",
    price: "$75+",
    duration: "90 mins",
    image: "https://images.unsplash.com/photo-1554519515-242161756769?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1173&q=80",
    category: "hair"
  },
  {
    id: 3,
    title: "Balayage",
    description: "Hand-painted highlights that create a natural, sun-kissed look with seamless blending.",
    price: "$120+",
    duration: "120 mins",
    image: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
    category: "hair"
  },
  {
    id: 4,
    title: "Blowout & Styling",
    description: "Professional blow dry and styling to achieve smooth, voluminous, or textured finishes.",
    price: "$35+",
    duration: "30 mins",
    image: "https://images.unsplash.com/photo-1597223557154-721c1cecc4b0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80",
    category: "hair"
  },
  {
    id: 5,
    title: "Deep Conditioning",
    description: "Intensive treatment to repair damaged hair, restore moisture, and enhance shine.",
    price: "$30+",
    duration: "20 mins",
    image: "https://images.unsplash.com/photo-1519123845541-f311760188d1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    category: "hair"
  },
  {
    id: 6,
    title: "Hair Extensions",
    description: "Quality hair extensions applied by certified professionals for added length and volume.",
    price: "$200+",
    duration: "180 mins",
    image: "https://images.unsplash.com/photo-1643301763614-67ad50012aba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    category: "hair"
  },
  {
    id: 7,
    title: "Manicure",
    description: "Professional nail care treatments focused on shaping, polishing, and beautifying your nails.",
    price: "$35+",
    duration: "45 mins",
    image: "https://images.unsplash.com/photo-1604654894611-6973b7069ce9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    category: "nail"
  },
  {
    id: 8,
    title: "Pedicure",
    description: "Comprehensive foot care that includes soaking, exfoliation, nail trimming, and polish application.",
    price: "$45+",
    duration: "60 mins",
    image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    category: "nail"
  },
  {
    id: 9,
    title: "Gel Nail Extensions",
    description: "Durable gel extensions that add length and strength to your natural nails with custom designs.",
    price: "$65+",
    duration: "75 mins",
    image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    category: "nail"
  },
  {
    id: 10,
    title: "Dry Cleaning",
    description: "Professional cleaning service for delicate fabrics and garments that require special care.",
    price: "$15+",
    duration: "24 hours",
    image: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80",
    category: "laundry"
  },
  {
    id: 11,
    title: "Wash & Fold",
    description: "Convenient laundry service where your clothes are washed, dried, and neatly folded for pickup.",
    price: "$2.50/lb",
    duration: "24 hours",
    image: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    category: "laundry"
  },
  {
    id: 12,
    title: "Ironing Service",
    description: "Professional pressing service to keep your garments wrinkle-free and looking crisp.",
    price: "$3+/item",
    duration: "48 hours",
    image: "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    category: "laundry"
  }
];

export const Services = () => {
  const [activeCategory, setActiveCategory] = React.useState("all");
  
  const filteredServices = activeCategory === "all" 
    ? services 
    : services.filter(service => service.category === activeCategory);

  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Our Services</h2>
          <p className="text-muted-foreground text-balance">
            We offer a wide range of premium services including hair styling, nail care, and laundry services 
            tailored to enhance your natural beauty and make your life easier.
          </p>
        </div>
        
        <div className="flex justify-center mb-8 gap-3">
          <Button 
            variant={activeCategory === "all" ? "default" : "outline"} 
            onClick={() => setActiveCategory("all")}
            className="animate-fade-in"
          >
            All Services
          </Button>
          <Button 
            variant={activeCategory === "hair" ? "default" : "outline"} 
            onClick={() => setActiveCategory("hair")}
            className="animate-fade-in"
          >
            Hair
          </Button>
          <Button 
            variant={activeCategory === "nail" ? "default" : "outline"} 
            onClick={() => setActiveCategory("nail")}
            className="animate-fade-in"
          >
            Nail
          </Button>
          <Button 
            variant={activeCategory === "laundry" ? "default" : "outline"} 
            onClick={() => setActiveCategory("laundry")}
            className="animate-fade-in"
          >
            Laundry
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredServices.map((service, index) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              description={service.description}
              price={service.price}
              duration={service.duration}
              image={service.image}
              className="animate-fade-in"
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
