
import React from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, ClockIcon, StarIcon } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Mock data - in a real app, this would come from an API
const stylists = [
  {
    id: 1,
    name: "Amara Johnson",
    role: "Senior Stylist",
    bio: "Specializing in textured hair, protective styles, and natural hair care with over 10 years of experience.",
    image: "https://images.unsplash.com/photo-1589156191108-c762ff4b96ab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    details: "Amara Johnson is a highly skilled Senior Stylist with a passion for celebrating natural hair. With over a decade of experience in the industry, she has become known for her expertise in textured hair care, protective styling, and creating personalized looks that enhance each client's unique beauty. Amara specializes in braids, twists, natural styling, and healthy hair maintenance techniques. She regularly attends advanced training workshops to stay current with the latest trends and techniques in natural hair care.",
    specialties: ["Protective Styles", "Natural Hair Care", "Textured Cuts", "Braiding"],
    availability: ["Monday", "Tuesday", "Thursday", "Friday", "Saturday"],
    rating: 4.9,
    reviewCount: 127
  },
  {
    id: 2,
    name: "Malik Williams",
    role: "Master Barber",
    bio: "Expertise in fades, designs, and beard grooming with a passion for helping clients look and feel their best.",
    image: "https://images.unsplash.com/photo-1618146366204-a1ffee4a9c8d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    details: "Malik Williams is a highly respected Master Barber with exceptional skill in precision cutting, fades, and creative designs. His artistic approach to barbering has earned him a loyal clientele who trust his expertise and vision. Malik is known for his meticulous attention to detail, whether creating clean, classic cuts or intricate designs. He also specializes in beard grooming and maintenance, helping clients achieve polished, well-maintained looks that enhance their natural features.",
    specialties: ["Fades", "Hair Designs", "Beard Grooming", "Line-ups"],
    availability: ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    rating: 4.8,
    reviewCount: 143
  },
  {
    id: 3,
    name: "Zara Thompson",
    role: "Color Specialist",
    bio: "Award-winning colorist with extensive training in techniques for all hair types and textures.",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    details: "Zara Thompson is an award-winning Color Specialist who brings artistry and technical excellence to every client experience. With specialized training in formulation for diverse hair types and textures, she excels at creating customized color solutions that enhance natural beauty. Zara's expertise includes balayage, highlights, fashion colors, and color correction. She is committed to using premium products that maintain hair health while delivering vibrant, long-lasting results.",
    specialties: ["Custom Color Formulation", "Balayage", "Color Correction", "Fashion Colors"],
    availability: ["Tuesday", "Wednesday", "Friday", "Saturday", "Sunday"],
    rating: 4.9,
    reviewCount: 116
  },
  {
    id: 4,
    name: "Damon Carter",
    role: "Styling Expert",
    bio: "Specializes in natural hairstyling, braiding, twists, and maintaining healthy hair through proper technique.",
    image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    details: "Damon Carter is a passionate Styling Expert who has dedicated his career to celebrating and enhancing the versatility of natural hair. With specialized training in protective styling and hair health, he creates beautiful, low-manipulation styles that promote growth and retention. Damon is known for his intricate braiding patterns, twist styles, and natural updos that showcase the beauty and versatility of textured hair. He is also committed to educating clients on proper home care techniques.",
    specialties: ["Box Braids", "Twist Styles", "Locs Maintenance", "Natural Updos"],
    availability: ["Monday", "Tuesday", "Thursday", "Saturday"],
    rating: 4.7,
    reviewCount: 98
  }
];

const StylistDetail = () => {
  const { id } = useParams();
  const stylistId = parseInt(id || "1");
  
  const stylist = stylists.find(s => s.id === stylistId) || stylists[0];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Stylist Image and Basic Info */}
            <div className="md:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="rounded-lg overflow-hidden shadow-md animate-fade-in">
                  <img 
                    src={stylist.image} 
                    alt={stylist.name} 
                    className="w-full h-auto object-cover aspect-[3/4]"
                  />
                </div>
                
                <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center space-x-1">
                      <StarIcon className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{stylist.rating}</span>
                      <span className="text-muted-foreground">({stylist.reviewCount} reviews)</span>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="font-medium">Availability</h3>
                      <div className="flex flex-wrap gap-2">
                        {stylist.availability.map(day => (
                          <span key={day} className="px-2 py-1 bg-secondary text-xs rounded">
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <Link to={`/booking?stylist=${stylist.id}`}>
                      <Button className="w-full">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Book Appointment
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Stylist Details */}
            <div className="md:col-span-2 space-y-8 animate-slide-in">
              <div>
                <Link to="/" className="text-primary hover:underline mb-2 inline-block">
                  &larr; Back to Stylists
                </Link>
                <h1 className="text-3xl font-semibold">{stylist.name}</h1>
                <p className="text-lg text-primary">{stylist.role}</p>
              </div>
              
              <div>
                <h2 className="text-xl font-medium mb-3">About</h2>
                <p className="text-muted-foreground text-balance leading-relaxed">
                  {stylist.details}
                </p>
              </div>
              
              <div>
                <h2 className="text-xl font-medium mb-3">Specialties</h2>
                <div className="flex flex-wrap gap-2">
                  {stylist.specialties.map(specialty => (
                    <span key={specialty} className="px-3 py-1 bg-secondary rounded-full text-sm">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <ClockIcon className="h-5 w-5 text-primary mr-2" />
                      <h3 className="font-medium">Average Appointment</h3>
                    </div>
                    <p className="text-2xl font-semibold">60-90 minutes</p>
                    <p className="text-sm text-muted-foreground">Depending on service type</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <CalendarIcon className="h-5 w-5 text-primary mr-2" />
                      <h3 className="font-medium">Next Available</h3>
                    </div>
                    <p className="text-2xl font-semibold">Tomorrow</p>
                    <p className="text-sm text-muted-foreground">Book now to secure your spot</p>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h2 className="text-xl font-medium mb-4">Recent Reviews</h2>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">Client {i}</span>
                          <div className="flex">
                            {Array(5).fill(0).map((_, idx) => (
                              <StarIcon 
                                key={idx} 
                                className={`h-4 w-4 ${idx < 5 ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          "Amazing experience! {stylist.name} is incredibly talented and took the time to understand exactly what I wanted. My hair looks fantastic!"
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div className="pt-4">
                <Link to={`/booking?stylist=${stylist.id}`}>
                  <Button size="lg">
                    Book with {stylist.name}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default StylistDetail;
