
import { useState } from "react";
import { toast } from "sonner";

export const useFavorites = () => {
  const [favoriteSylists, setFavoriteSylists] = useState<any[]>([]);
  
  const removeFavoriteStylist = (id: string) => {
    // In a real app, this would remove the stylist from favorites in the database
    toast.success("Stylist removed from favorites");
  };

  return {
    favoriteSylists,
    removeFavoriteStylist
  };
};
