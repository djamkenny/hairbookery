
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const Hero = () => {
  const isMobile = useIsMobile();
  
  return (
    <section className="relative min-h-[95vh] flex items-center pt-16 md:pt-20 overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 z-[-2]">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-purple/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-gold/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-[-1]"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80')`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          opacity: 0.08,
        }}
      />
      
      <div className="container mx-auto px-4 py-12 md:py-16 lg:py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs md:text-sm font-medium">Premium Beauty & Wellness Services</span>
          </div>

          {/* Main Heading with Gradient */}
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6 md:mb-8 leading-[1.1] animate-fade-in">
            Experience{" "}
            <span className="relative inline-block">
              <span className="absolute inset-0 bg-gradient-to-r from-primary via-accent-purple to-accent-gold bg-clip-text text-transparent blur-lg opacity-50"></span>
              <span className="relative bg-gradient-to-r from-primary via-accent-purple to-accent-gold bg-clip-text text-transparent">
                Luxury
              </span>
            </span>
            <br />
            with Your Favorite Specialist
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 md:mb-10 text-balance animate-slide-in leading-relaxed max-w-2xl mx-auto">
            Book appointments with our expert stylists and transform your look.
            We provide exceptional service tailored to your unique style with premium care.
          </p>

          {/* CTA Buttons with Enhanced Styling */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up mb-12">
            <Link to="/specialists" className="w-full sm:w-auto group">
              <Button 
                size={isMobile ? "default" : "lg"} 
                className="w-full relative overflow-hidden bg-gradient-to-r from-primary to-accent-purple hover:shadow-glow transition-all duration-300 group-hover:scale-105"
              >
                <span className="relative z-10 flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Appointment
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent-purple to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </Link>
            <Link to="/#services" className="w-full sm:w-auto group">
              <Button 
                variant="outline" 
                size={isMobile ? "default" : "lg"} 
                className="w-full glass-card hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 group-hover:scale-105"
              >
                Explore Services
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm text-muted-foreground animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center">
                    <span className="text-xs">👤</span>
                  </div>
                ))}
              </div>
              <span className="font-medium">500+ Happy Clients</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-accent-gold text-lg">⭐</span>
              <span className="font-medium">4.9/5 Rating</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-primary text-lg">✓</span>
              <span className="font-medium">Expert Specialists</span>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Hero;
