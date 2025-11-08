
import { useState, useEffect, useRef, memo } from 'react';
import { Card } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { loadGoogleMaps } from '@/utils/googleMapsLoader';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface GoogleMapSelectorProps {
  onLocationSelected: (location: Location) => void;
  initialLocation?: Location;
  height?: string;
}

const GoogleMapSelector = ({ 
  onLocationSelected, 
  initialLocation = { lat: 20.5937, lng: 78.9629 }, // Center of India
  height = '400px'
}: GoogleMapSelectorProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initMap = async () => {
      try {
        const google = await loadGoogleMaps(["places"]);
        
        if (!mapRef.current) return;
        
        const mapOptions = {
          center: initialLocation,
          zoom: 11,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        };
        
        const map = new google.maps.Map(mapRef.current, mapOptions);
        googleMapRef.current = map;
        
        const marker = new google.maps.Marker({
          position: initialLocation,
          map: map,
          draggable: true,
          animation: google.maps.Animation.DROP
        });
        markerRef.current = marker;
        
        // Initialize the geocoder for reverse geocoding
        const geocoder = new google.maps.Geocoder();
        
        // Update marker position and get address when map is clicked
        map.addListener("click", (event: google.maps.MapMouseEvent) => {
          if (!event.latLng) return;
          
          const position = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          };
          
          marker.setPosition(position);
          
          // Get address from coordinates
          geocoder.geocode({ location: position }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              const address = results[0].formatted_address;
              onLocationSelected({ ...position, address });
              toast({
                title: "Location Selected",
                description: address,
              });
            } else {
              onLocationSelected(position);
            }
          });
        });
        
        // Handle marker drag end
        marker.addListener("dragend", () => {
          const position = {
            lat: marker.getPosition()!.lat(),
            lng: marker.getPosition()!.lng()
          };
          
          // Get address from coordinates
          geocoder.geocode({ location: position }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              const address = results[0].formatted_address;
              onLocationSelected({ ...position, address });
            } else {
              onLocationSelected(position);
            }
          });
        });
        
        // Add search box (optional)
        const input = document.createElement("input");
        input.placeholder = "Search for a location";
        input.className = "map-search-box px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
        
        const searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
        
        searchBox.addListener("places_changed", () => {
          const places = searchBox.getPlaces();
          if (!places || places.length === 0) return;
          
          const place = places[0];
          if (!place.geometry || !place.geometry.location) return;
          
          const position = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address
          };
          
          map.setCenter(position);
          marker.setPosition(position);
          onLocationSelected(position);
        });
        
        setIsLoaded(true);
      } catch (err) {
        console.error("Error loading Google Maps", err);
        setError("Failed to load Google Maps. Please try again later.");
      }
    };

    initMap();

    return () => {
      // Cleanup if needed
    };
  }, [initialLocation, onLocationSelected]);

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          if (googleMapRef.current && markerRef.current) {
            googleMapRef.current.setCenter(pos);
            markerRef.current.setPosition(pos);
            
            // Trigger geocoding to get the address
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: pos }, (results, status) => {
              if (status === "OK" && results && results[0]) {
                const address = results[0].formatted_address;
                onLocationSelected({ ...pos, address });
              } else {
                onLocationSelected(pos);
              }
            });
          }
        },
        () => {
          toast({
            title: "Location Error",
            description: "Unable to get your current location",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Geolocation Error",
        description: "Your browser doesn't support geolocation",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full overflow-hidden">
      {error && (
        <div className="p-4 text-center text-red-500 bg-red-50">
          {error}
        </div>
      )}
      <div className="relative">
        <div
          ref={mapRef}
          style={{ height, width: '100%' }}
          className="bg-gray-100"
        />
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
        <Button 
          size="sm" 
          variant="secondary"
          className="absolute bottom-4 right-4 shadow-md flex items-center gap-1"
          onClick={handleUseMyLocation}
        >
          <MapPin className="h-4 w-4" />
          Use my location
        </Button>
      </div>
    </Card>
  );
};

export default memo(GoogleMapSelector);
