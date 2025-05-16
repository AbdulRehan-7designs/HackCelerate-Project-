
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Locate } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AreaSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  onAddressChange?: (address: string) => void;
}

const areas = [
  { id: "north", name: "North" },
  { id: "south", name: "South" },
  { id: "east", name: "East" },
  { id: "west", name: "West" },
  { id: "central", name: "Central" }
];

const AreaSelector = ({ value, onValueChange, onAddressChange }: AreaSelectorProps) => {
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(false);
  const [locationAddress, setLocationAddress] = useState<string>("");
  const { toast } = useToast();

  const getCurrentLocation = () => {
    setUsingCurrentLocation(true);

    if (navigator.geolocation) {
      toast({
        description: "Requesting your current location...",
      });

      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Get latitude and longitude
          const { latitude, longitude } = position.coords;
          
          // In a real app, we would use the Geocoding API to get the address
          // For now, simulate a response after a short delay
          setTimeout(() => {
            // Mock address based on random coordinates
            const mockAddress = `${Math.floor(latitude * 100) / 100}, ${Math.floor(longitude * 100) / 100}`;
            setLocationAddress(mockAddress);
            
            if (onAddressChange) {
              onAddressChange(mockAddress);
            }
            
            // Determine the area based on coordinates (simplified)
            // In a real app, this would use proper geo-boundaries
            const areaIndex = Math.floor(Math.random() * areas.length);
            onValueChange(areas[areaIndex].id);
            
            toast({
              title: "Location detected",
              description: `Your location: ${areas[areaIndex].name} area`,
            });
            
            setUsingCurrentLocation(false);
          }, 1500);
        },
        (error) => {
          let errorMessage = "Unable to retrieve your location";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable location access.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
          }
          
          toast({
            title: "Location Error",
            description: errorMessage,
            variant: "destructive",
          });
          
          setUsingCurrentLocation(false);
        }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      setUsingCurrentLocation(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="area">Area <span className="text-red-500">*</span></Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={getCurrentLocation}
          disabled={usingCurrentLocation}
          className="h-8 text-xs"
        >
          {usingCurrentLocation ? (
            <>
              <span className="animate-spin mr-1">⟳</span> Detecting...
            </>
          ) : (
            <>
              <Locate className="h-3 w-3 mr-1" /> Use my location
            </>
          )}
        </Button>
      </div>
      
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id="area" className="w-full">
          <SelectValue placeholder="Select an area" />
        </SelectTrigger>
        <SelectContent>
          {areas.map((area) => (
            <SelectItem key={area.id} value={area.id} className={`area-${area.id}`}>
              {area.name} Area
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {locationAddress && (
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <MapPin className="h-3.5 w-3.5 mr-1 text-civic-blue" />
          <span className="text-xs">{locationAddress}</span>
        </div>
      )}
    </div>
  );
};

export default AreaSelector;
