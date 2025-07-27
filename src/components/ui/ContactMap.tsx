import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ContactMapProps {
  className?: string;
}

const ContactMap = ({ className }: ContactMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const loadMap = () => {
    if (!mapContainer.current || !mapboxToken.trim()) return;

    try {
      // Set the access token
      mapboxgl.accessToken = mapboxToken.trim();
      
      // Initialize map centered on Accra, Ghana
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-0.1870, 5.6037], // Accra coordinates
        zoom: 12,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );

      // Add a marker for the business location
      new mapboxgl.Marker({
        color: '#8B5CF6' // Using a purple color to match your theme
      })
        .setLngLat([-0.1870, 5.6037])
        .setPopup(
          new mapboxgl.Popup().setHTML('<h3>K n L Bookery</h3><p>Accra, Ghana</p>')
        )
        .addTo(map.current);

      map.current.on('load', () => {
        setIsMapLoaded(true);
        toast.success('Map loaded successfully!');
      });

      map.current.on('error', () => {
        toast.error('Error loading map. Please check your Mapbox token.');
      });

    } catch (error) {
      toast.error('Invalid Mapbox token. Please check your token and try again.');
    }
  };

  useEffect(() => {
    return () => {
      map.current?.remove();
    };
  }, []);

  if (!isMapLoaded && !mapboxToken) {
    return (
      <div className={`bg-muted rounded-lg p-6 ${className}`}>
        <div className="text-center space-y-4">
          <h3 className="font-semibold text-lg">Interactive Map</h3>
          <p className="text-muted-foreground text-sm">
            To display an interactive map, please enter your Mapbox public token.
            <br />
            You can get one from{' '}
            <a 
              href="https://mapbox.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              mapbox.com
            </a>
          </p>
          <div className="space-y-2 max-w-md mx-auto">
            <Input
              type="text"
              placeholder="Enter your Mapbox public token"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="text-foreground"
            />
            <Button 
              onClick={loadMap}
              disabled={!mapboxToken.trim()}
              className="w-full"
            >
              Load Map
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <div ref={mapContainer} className="w-full h-full min-h-[320px]" />
      {!isMapLoaded && mapboxToken && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      )}
    </div>
  );
};

export default ContactMap;