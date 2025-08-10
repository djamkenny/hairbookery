
import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Booking = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16 md:py-20">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto animate-fade-in">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4">Booking Moved</h1>
            <p className="text-muted-foreground mb-6">Bookings are now made directly from each specialist profile.</p>
            <Link to="/specialists">
              <Button>Browse Specialists</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Booking;
