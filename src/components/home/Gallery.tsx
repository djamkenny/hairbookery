
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import ImageLightbox from "@/components/ui/ImageLightbox";

// Sample gallery images
const galleryImages = [
  {
    id: 1,
    image: "./images/boxbraid.jpg",
    caption: "Protective Box Braids"
  },
  {
    id: 2,
    image: "./images/Afro.jpg",
    caption: "Natural Afro Style"
  },
  {
    id: 3,
    image: "./images/Precision_Fade.jpg",
    caption: "Precision Fade"
  },
  {  
    id: 4,
    image: "./images/twists.jpg",
    caption: "Twist"
  },
  {
    id: 5,
    image: "./images/cornroll.jpg",
    caption: "Classic Cornrows"
  },
  {
    id: 6,
    image: "./images/locs.png",
    caption: "Loc Maintenance"
  }
];

const Gallery = () => {
  const isMobile = useIsMobile();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const images = galleryImages.map((g) => g.image);
  const visibleImages = isMobile ? galleryImages.slice(0, 4) : galleryImages;
  
  return (
    <section id="gallery" className="section-padding bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center max-w-xl mx-auto mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-3 md:mb-4">Our Style Gallery</h2>
          <p className="text-muted-foreground text-balance">
            Browse through our gallery of hairstyles to find inspiration for your next look.
          </p>
        </div>
        
        <div className="responsive-grid animate-fade-in">
          {visibleImages.map((item, index) => (
            <Card 
              key={item.id} 
              className="overflow-hidden hover:shadow-md transition-all duration-300 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="aspect-square overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.caption} 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <CardContent className="p-4">
                <p className="font-medium text-center">{item.caption}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {isMobile && (
          <div className="mt-6 text-center">
            <a href="#" className="text-primary hover:text-primary/80 inline-flex items-center">
              View all styles
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;
