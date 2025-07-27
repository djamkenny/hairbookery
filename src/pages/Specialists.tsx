import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import SpecialistsComponent from '@/components/home/Specialists';
import Stylists from '@/components/home/Stylists';

const SpecialistsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our Specialists
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Meet our talented team of beauty professionals and stylists who are passionate about helping you achieve your perfect look.
            </p>
          </div>
          <div className="space-y-20">
            <SpecialistsComponent />
            <Stylists />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SpecialistsPage;