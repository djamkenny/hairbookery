import React, { useState } from "react";
import { ServiceTypeSelector } from "@/components/booking/ServiceTypeSelector";
import { BookingForm } from "@/components/booking/BookingForm";
import { LaundryBookingForm } from "@/components/laundry/LaundryBookingForm";
import { CleaningBookingForm } from "@/components/cleaning/CleaningBookingForm";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const ServiceBooking: React.FC = () => {
  const [selectedServiceType, setSelectedServiceType] = useState<'beauty' | 'laundry' | 'cleaning' | null>(null);

  const handleServiceTypeSelect = (type: 'beauty' | 'laundry' | 'cleaning') => {
    setSelectedServiceType(type);
  };

  const handleGoBack = () => {
    setSelectedServiceType(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16 md:py-20">
        {!selectedServiceType && (
          <ServiceTypeSelector onServiceTypeSelect={handleServiceTypeSelect} />
        )}
        
        {selectedServiceType === 'beauty' && (
          <div className="space-y-4">
            <div className="text-center">
              <button 
                onClick={handleGoBack}
                className="text-primary hover:underline text-sm"
              >
                ← Back to service selection
              </button>
            </div>
            <BookingForm />
          </div>
        )}
        
        {selectedServiceType === 'laundry' && (
          <div className="space-y-4">
            <div className="text-center">
              <button 
                onClick={handleGoBack}
                className="text-primary hover:underline text-sm"
              >
                ← Back to service selection
              </button>
            </div>
            <LaundryBookingForm />
          </div>
        )}
        
        {selectedServiceType === 'cleaning' && (
          <div className="space-y-4">
            <div className="text-center">
              <button 
                onClick={handleGoBack}
                className="text-primary hover:underline text-sm"
              >
                ← Back to service selection
              </button>
            </div>
            <CleaningBookingForm />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ServiceBooking;