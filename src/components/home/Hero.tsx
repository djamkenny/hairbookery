
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const Hero = () => {
  const isMobile = useIsMobile();
  
  return (
    <section className="relative min-h-[85vh] flex items-center pt-20 md:pt-24 overflow-hidden">
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Book local beauty and wellness services
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto">
            Discover top-rated salons, barbers, and beauty experts trusted by thousands of clients
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/specialists" className="w-full sm:w-auto">
              <Button 
                size={isMobile ? "default" : "lg"} 
                className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 h-12 text-base font-semibold"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Find a specialist
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-lg">⭐</span>
              <span className="font-medium">4.9 average rating</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="font-medium">500+ happy clients</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="font-medium">Expert specialists</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
