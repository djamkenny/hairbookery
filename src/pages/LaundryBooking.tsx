import React from "react";
import { LaundryBookingForm } from "@/components/laundry/LaundryBookingForm";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const LaundryBooking: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16 md:py-20">
        <LaundryBookingForm />
      </main>
      <Footer />
    </div>
  );
};

export default LaundryBooking;