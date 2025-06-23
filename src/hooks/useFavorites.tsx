
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useFavorites = () => {
  const [favoriteSylists, setFavoriteSylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: favorites, error } = await supabase
        .from('favorites')
        .select(`
          id,
          stylist_id,
          profiles!favorites_stylist_id_fkey (
            id,
            full_name,
            specialty,
            avatar_url
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching favorites:', error);
        return;
      }

      // Transform the data to match the expected format
      const transformedFavorites = favorites?.map(fav => ({
        id: fav.stylist_id,
        name: fav.profiles?.full_name || 'Unknown Stylist',
        specialty: fav.profiles?.specialty || 'Beauty Specialist',
        image: fav.profiles?.avatar_url || "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3"
      })) || [];

      setFavoriteSylists(transformedFavorites);
    } catch (error) {
      console.error('Error in fetchFavorites:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const removeFavoriteStylist = async (stylistId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to manage favorites");
        return;
      }

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('stylist_id', stylistId);

      if (error) {
        console.error('Error removing favorite:', error);
        toast.error("Failed to remove stylist from favorites");
        return;
      }

      // Update local state
      setFavoriteSylists(prev => prev.filter(stylist => stylist.id !== stylistId));
      toast.success("Stylist removed from favorites");
    } catch (error) {
      console.error('Error in removeFavoriteStylist:', error);
      toast.error("Failed to remove stylist from favorites");
    }
  };

  const addFavoriteStylist = async (stylistId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to add favorites");
        return;
      }

      const { error } = await supabase
        .from('favorites')
        .insert([
          {
            user_id: user.id,
            stylist_id: stylistId
          }
        ]);

      if (error) {
        console.error('Error adding favorite:', error);
        toast.error("Failed to add stylist to favorites");
        return;
      }

      toast.success("Stylist added to favorites");
      fetchFavorites(); // Refresh the list
    } catch (error) {
      console.error('Error in addFavoriteStylist:', error);
      toast.error("Failed to add stylist to favorites");
    }
  };

  return {
    favoriteSylists,
    loading,
    removeFavoriteStylist,
    addFavoriteStylist,
    refreshFavorites: fetchFavorites
  };
};
