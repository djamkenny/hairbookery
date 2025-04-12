
import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BookingForm from "@/components/booking/BookingForm";
import { useIsMobile } from "@/hooks/use-mobile";

const Booking = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-16 md:py-20">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 md:mb-12 animate-fade-in">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-3 md:mb-4">Book Your Appointment</h1>
              <p className="text-muted-foreground text-balance max-w-xl mx-auto text-sm md:text-base">
                Schedule your appointment with our specialists. Choose your preferred service, specialist, date and time, and complete payment.
              </p>
            </div>
            
            <div className="animate-slide-up px-4 sm:px-0">
              <BookingForm />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Booking;
