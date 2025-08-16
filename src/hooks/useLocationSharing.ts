import { Share } from '@capacitor/share';
import { AppLauncher } from '@capacitor/app-launcher';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';

export const useLocationSharing = () => {
  const { toast } = useToast();

  const shareLocation = async (location: string, specialistName: string) => {
    if (!location) {
      toast({
        title: "Location not available",
        description: "This specialist hasn't provided their location.",
        variant: "destructive",
      });
      return;
    }

    // Encode location for URL
    const encodedLocation = encodeURIComponent(location);
    
    // Create URLs for different apps
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
    const appleMapsUrl = `http://maps.apple.com/?q=${encodedLocation}`;
    const uberUrl = `uber://?action=setPickup&dropoff[formatted_address]=${encodedLocation}`;
    const boltUrl = `bolt://ride?destination=${encodedLocation}`;

    if (Capacitor.isNativePlatform()) {
      try {
        // Try to open Uber first (if available)
        const canOpenUber = await AppLauncher.canOpenUrl({ url: uberUrl });
        if (canOpenUber.value) {
          await AppLauncher.openUrl({ url: uberUrl });
          return;
        }

        // Try Bolt as fallback
        const canOpenBolt = await AppLauncher.canOpenUrl({ url: boltUrl });
        if (canOpenBolt.value) {
          await AppLauncher.openUrl({ url: boltUrl });
          return;
        }

        // Use native share dialog as fallback
        await Share.share({
          title: `Location of ${specialistName}`,
          text: `Check out ${specialistName}'s location: ${location}`,
          url: Capacitor.getPlatform() === 'ios' ? appleMapsUrl : googleMapsUrl,
          dialogTitle: 'Share Location'
        });

      } catch (error) {
        console.error('Error sharing location:', error);
        toast({
          title: "Error",
          description: "Unable to share location. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      // Web fallback - open Google Maps in new tab
      window.open(googleMapsUrl, '_blank');
    }
  };

  return { shareLocation };
};