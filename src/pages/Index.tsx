
import Hero from "@/components/home/Hero";
import Services from "@/components/home/Services";
import Stylists from "@/components/home/Stylists";
import Specialists from "@/components/home/Specialists";
import Gallery from "@/components/home/Gallery";
import Reviews from "@/components/home/Review";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <Hero />
        <Services />
        <Stylists />
        <Reviews />
        <Specialists />
        <Gallery />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
