
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-[92vh] flex items-center pt-20">
      <div 
        className="absolute inset-0 bg-salon-100 z-[-1] overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80')`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          opacity: 0.15,
        }}
      />
      
      <div className="container mx-auto px-4 py-12 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 animate-fade-in">
            Experience <span className="text-primary">Premium</span> Hair Care
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 text-balance animate-slide-in">
            Book appointments with our expert stylists and transform your look.
            We provide exceptional service tailored to your unique style.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Link to="/booking">
              <Button size="lg" className="w-full sm:w-auto">
                <Calendar className="mr-2 h-4 w-4" />
                Book Appointment
              </Button>
            </Link>
            <Link to="/#services">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Explore Services
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce">
        <a href="#services" className="text-muted-foreground hover:text-primary transition-colors">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </a>
      </div>
    </section>
  );
};

export default Hero;
