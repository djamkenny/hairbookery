
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ServiceCard from "@/components/ui/ServiceCard";

const services = [
  {
    id: 1,
    title: "Haircut & Styling",
    description: "Precision cut and professional styling to create the perfect look for your face shape and preferences. Our experienced stylists use premium tools and techniques to deliver exceptional results.",
    price: "GHS40+",
    duration: "45 mins",
    image: "./images/5911382752316475202.jpg",
    category: "hair",
    features: ["Consultation included", "Wash & blow dry", "Styling advice", "Premium products used"]
  },
  {
    id: 2,
    title: "Hair Coloring",
    description: "Expert color services from subtle highlights to bold transformations using premium products. Our colorists are trained in the latest techniques and color theory.",
    price: "GHS400+",
    duration: "90 mins",
    image: "./images/Hair_Coloring.png",
    category: "hair",
    features: ["Color consultation", "Patch test included", "Premium color products", "Aftercare instructions"]
  },
  {
    id: 3,
    title: "Balayage",
    description: "Hand-painted highlights that create a natural, sun-kissed look with seamless blending. Perfect for those wanting a low-maintenance yet stunning color transformation.",
    price: "GHS600+",
    duration: "120 mins",
    image: "./images/Balayage.png",
    category: "hair",
    features: ["Custom color placement", "Natural-looking results", "Low maintenance", "Expert application"]
  },
  {
    id: 4,
    title: "Blowout & Styling",
    description: "Professional blow dry and styling to achieve smooth, voluminous, or textured finishes. Perfect for special occasions or when you want to look your absolute best.",
    price: "GHS60+",
    duration: "30 mins",
    image: "./images/Blowout_Styling.png",
    category: "hair",
    features: ["Heat protection", "Volume boost", "Long-lasting style", "Professional finish"]
  },
  {
    id: 5,
    title: "Deep Conditioning",
    description: "Intensive treatment to repair damaged hair, restore moisture, and enhance shine. Uses professional-grade products for maximum effectiveness.",
    price: "GHS60+",
    duration: "20 mins",
    image: "./images/Deep_Conditioning.png",
    category: "hair",
    features: ["Damage repair", "Moisture restoration", "Shine enhancement", "Strengthening treatment"]
  },
  {
    id: 6,
    title: "Hair Extensions",
    description: "Quality hair extensions applied by certified professionals for added length and volume. Choose from various types and colors to match your natural hair.",
    price: "GHS40+",
    duration: "180 mins",
    image: "./images/extension.png",
    category: "hair",
    features: ["100% human hair", "Professional application", "Color matching", "Maintenance guide"]
  },
  {
    id: 7,
    title: "Manicure",
    description: "Professional nail care treatments focused on shaping, polishing, and beautifying your nails. Includes cuticle care and your choice of polish.",
    price: "GHS30+",
    duration: "45 mins",
    image: "./images/manicure.jpg",
    category: "nail",
    features: ["Nail shaping", "Cuticle care", "Base & top coat", "Wide polish selection"]
  },
  {
    id: 8,
    title: "Pedicure",
    description: "Comprehensive foot care that includes soaking, exfoliation, nail trimming, and polish application. Relaxing treatment for healthy, beautiful feet.",
    price: "GHS120+",
    duration: "60 mins",
    image: "./images/perdicure.png",
    category: "nail",
    features: ["Foot soaking", "Exfoliation", "Callus removal", "Moisturizing treatment"]
  },
  {
    id: 9,
    title: "Gel Nail Extensions",
    description: "Durable gel extensions that add length and strength to your natural nails with custom designs. Long-lasting and chip-resistant for weeks of beautiful nails.",
    price: "GHS100+",
    duration: "75 mins",
    image: "./images/5911382752316475213.jpg",
    category: "nail",
    features: ["Custom length", "Chip-resistant", "2-3 weeks lasting", "Custom designs available"]
  },
  {
    id: 10,
    title: "Dry Cleaning",
    description: "Professional laundry service for delicate fabrics and garments that require special care. We handle suits, dresses, and specialty items with expertise.",
    price: "GHS10+",
    duration: "24 hours",
    image: "./images/Dry_Cleaning.png",
    category: "laundry",
    features: ["Delicate fabric care", "Stain removal", "Professional pressing", "Quick turnaround"]
  },
  {
    id: 11,
    title: "Wash & Fold",
    description: "Convenient laundry service where your clothes are washed, dried, and neatly folded for pickup. Perfect for busy individuals who want fresh, clean clothes.",
    price: "GHS100/14kg",
    duration: "24 hours",
    image: "./images/wash.png",
    category: "laundry",
    features: ["Premium detergents", "Fabric softener included", "Neat folding", "Same-day service available"]
  },
  {
    id: 12,
    title: "Ironing Service",
    description: "Professional pressing service to keep your garments wrinkle-free and looking crisp. Perfect for business attire and formal wear.",
    price: "GHS4-11/kg",
    duration: "48 hours",
    image: "./images/iron.png",
    category: "laundry",
    features: ["Professional pressing", "Wrinkle removal", "Crease setting", "Garment care"]
  }
];

export const Services = () => {
  const [activeCategory, setActiveCategory] = React.useState("all");
  
  const filteredServices = activeCategory === "all" 
    ? services 
    : services.filter(service => service.category === activeCategory);

  return (
    <section id="services" className="py-16 md:py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-purple/10 rounded-full blur-3xl -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          {/* Section Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4 animate-fade-in">
            <span className="text-xs md:text-sm font-medium text-primary">✨ Premium Services</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 animate-fade-in">
            Elevate Your{" "}
            <span className="relative inline-block">
              <span className="absolute inset-0 bg-gradient-to-r from-primary to-accent-purple bg-clip-text text-transparent blur-sm opacity-50"></span>
              <span className="relative bg-gradient-to-r from-primary to-accent-purple bg-clip-text text-transparent">
                Beauty Experience
              </span>
            </span>
          </h2>
          <p className="text-muted-foreground text-balance text-base md:text-lg leading-relaxed animate-slide-in">
            We offer a comprehensive range of premium services including professional hair styling, 
            expert nail care, and convenient laundry services. Each service is delivered by skilled 
            professionals using high-quality products and techniques.
          </p>
        </div>
        
        <div className="flex justify-center mb-12 gap-2 md:gap-3 flex-wrap">
          <Button 
            variant={activeCategory === "all" ? "default" : "outline"} 
            onClick={() => setActiveCategory("all")}
            className="animate-fade-in mb-2 text-xs md:text-sm transition-all duration-300 hover:scale-105"
            size="sm"
          >
            ✨ All Services
          </Button>
          <Button 
            variant={activeCategory === "hair" ? "default" : "outline"} 
            onClick={() => setActiveCategory("hair")}
            className="animate-fade-in mb-2 text-xs md:text-sm transition-all duration-300 hover:scale-105"
            size="sm"
          >
            💇 Hair Services
          </Button>
          <Button 
            variant={activeCategory === "nail" ? "default" : "outline"} 
            onClick={() => setActiveCategory("nail")}
            className="animate-fade-in mb-2 text-xs md:text-sm transition-all duration-300 hover:scale-105"
            size="sm"
          >
            💅 Nail Care
          </Button>
          <Button 
            variant={activeCategory === "laundry" ? "default" : "outline"} 
            onClick={() => setActiveCategory("laundry")}
            className="animate-fade-in mb-2 text-xs md:text-sm transition-all duration-300 hover:scale-105"
            size="sm"
          >
            🧺 Laundry Services
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          {filteredServices.map((service, index) => (
            <div
              key={service.id}
              className="animate-fade-in group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ServiceCard
                title={service.title}
                description={service.description}
                price={service.price}
                duration={service.duration}
                image={service.image}
                features={service.features}
                className="gradient-card h-full hover:scale-[1.02] transition-all duration-300"
              />
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <Link to="/specialists" className="group inline-block">
            <Button 
              size="lg" 
              className="animate-fade-in relative overflow-hidden bg-gradient-to-r from-primary to-accent-purple hover:shadow-glow transition-all duration-300 group-hover:scale-105 px-8 py-6 text-base"
            >
              <span className="relative z-10">Book a Service Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-accent-purple to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Services;
