
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

// Sample gallery images
const galleryImages = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    caption: "Protective Box Braids"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1607748851687-ba2a3211cd6c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    caption: "Natural Afro Style"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1594359850847-9bd25822c96c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    caption: "Precision Fade"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1642413260555-fc4203d123da?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    caption: "Twist Out Curls"
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1585123334904-845d60e97b29?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    caption: "Classic Cornrows"
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1579427421635-a0015b804b2e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    caption: "Loc Maintenance"
  }
];

const Gallery = () => {
  return (
    <section id="gallery" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">Our Style Gallery</h2>
          <p className="text-muted-foreground text-balance">
            Browse through our gallery of hairstyles to find inspiration for your next look.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {galleryImages.map((item, index) => (
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
                />
              </div>
              <CardContent className="p-4">
                <p className="font-medium text-center">{item.caption}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
