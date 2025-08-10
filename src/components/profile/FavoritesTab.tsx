
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { XIcon } from "lucide-react";
import LoyaltyPointsCard from "./LoyaltyPointsCard";
import { useLoyaltyPoints } from "@/hooks/useLoyaltyPoints";

interface Stylist {
  id: string;
  name: string;
  specialty: string;
  image: string;
}

interface FavoritesTabProps {
  favoriteSylists: Stylist[];
  removeFavoriteStylist: (id: string) => void;
}

const FavoritesTab = ({ favoriteSylists, removeFavoriteStylist }: FavoritesTabProps) => {
  const { loyaltyPoints } = useLoyaltyPoints();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Favorites & Loyalty</h1>
      
      {/* Loyalty Points Section */}
      <LoyaltyPointsCard totalPoints={loyaltyPoints} />
      
      {/* Favorite Stylists Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Favorite Stylists</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favoriteSylists.map((stylist) => (
            <Card key={stylist.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={stylist.image} alt={stylist.name} />
                    <AvatarFallback>{stylist.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{stylist.name}</h3>
                        <p className="text-sm text-muted-foreground">{stylist.specialty}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0" 
                        onClick={() => removeFavoriteStylist(stylist.id)}
                      >
                        <XIcon className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                    <div className="mt-3">
                      <Link to={`/stylist/${stylist.id}`}>
                        <Button size="sm" variant="outline" className="w-full">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {favoriteSylists.length === 0 && (
          <div className="text-center py-8 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground mb-4">You don't have any favorite stylists yet.</p>
            <Link to="/specialists">
              <Button>Browse Stylists</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesTab;
