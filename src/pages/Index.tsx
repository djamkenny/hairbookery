
import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import Services from "@/components/home/Services";
import Stylists from "@/components/home/Stylists";
import Specialists from "@/components/home/Specialists";
import Gallery from "@/components/home/Gallery";
import Reviews from "@/components/home/Reviews";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <Hero />
        <Services />
        <Gallery />
        <Stylists />
        <Reviews />
        <Specialists />
        
        {/* Contact Section */}
        <section id="contact" className="section-padding bg-background">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="space-y-4 md:space-y-6 animate-fade-in">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold">Get in Touch</h2>
                <p className="text-muted-foreground text-balance text-sm md:text-base">
                  Have questions about our services or need assistance with booking? 
                  Contact us and our friendly team will be happy to help.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1 md:mb-2 text-base md:text-lg">Our Location</h3>
                    <p className="text-muted-foreground text-sm md:text-base">123 Styling Street</p>
                    <p className="text-muted-foreground text-sm md:text-base">New York, NY 10001</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-1 md:mb-2 text-base md:text-lg">Contact Information</h3>
                    <p className="text-muted-foreground text-sm md:text-base">Phone: +1 (555) 123-4567</p>
                    <p className="text-muted-foreground text-sm md:text-base">Email: info@knlbookery.com</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-1 md:mb-2 text-base md:text-lg">Business Hours</h3>
                    <p className="text-muted-foreground text-sm md:text-base">Monday - Friday: 9:00 AM - 7:00 PM</p>
                    <p className="text-muted-foreground text-sm md:text-base">Saturday: 9:00 AM - 6:00 PM</p>
                    <p className="text-muted-foreground text-sm md:text-base">Sunday: Closed</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg overflow-hidden animate-fade-in h-[300px] md:h-[450px]" style={{ animationDelay: "0.3s" }}>
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d48371.66637263144!2d-74.02786730228456!3d40.71531432062164!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1685559345499!5m2!1sen!2sus" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade">
                </iframe>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
