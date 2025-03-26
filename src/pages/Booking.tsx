
import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BookingForm from "@/components/booking/BookingForm";

const Booking = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h1 className="text-3xl md:text-4xl font-semibold mb-4">Book Your Appointment</h1>
              <p className="text-muted-foreground text-balance max-w-xl mx-auto">
                Schedule your salon appointment with our expert stylists. Choose your preferred service, stylist, date and time.
              </p>
            </div>
            
            <div className="animate-slide-up">
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
