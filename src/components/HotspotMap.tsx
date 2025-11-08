import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, Filter, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';
import { IssueReport } from '@/utils/mockData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { loadGoogleMaps } from '@/utils/googleMapsLoader';

interface HotspotMapProps {
  issues: IssueReport[];
  height?: string;
}

interface HotspotData {
  lat: number;
  lng: number;
  weight: number; // Number of issues at this location
  category?: string;
}

const HotspotMap = ({ issues, height = '500px' }: HotspotMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'heatmap' | 'markers'>('heatmap');
  const { toast } = useToast();

  // Get unique categories
  const categories = ['all', ...new Set(issues.map(issue => issue.category))];

  // Filter issues based on selected category
  const filteredIssues = issues.filter(issue => 
    selectedCategory === 'all' || issue.category === selectedCategory
  );

  // Process issues into hotspot data points
  const processHotspotData = (): HotspotData[] => {
    const locationMap = new Map<string, HotspotData>();

    filteredIssues.forEach((issue) => {
      let lat: number | null = null;
      let lng: number | null = null;

      // Get coordinates from location
      if (typeof issue.location === 'object' && issue.location.lat && issue.location.lng) {
        lat = issue.location.lat;
        lng = issue.location.lng;
      } else if (typeof issue.location === 'string') {
        // For string locations, we'll need to geocode them
        // For now, we'll use a simple hash-based approach for demo
        // In production, you'd geocode all addresses
        const hash = issue.location.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        // Use approximate coordinates for Hyderabad area (where most issues are)
        lat = 17.3850 + (hash % 100) / 1000; // Small variation
        lng = 78.4867 + ((hash * 13) % 100) / 1000;
      }

      if (lat !== null && lng !== null) {
        // Round to 3 decimal places to cluster nearby issues
        const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
        
        if (locationMap.has(key)) {
          const existing = locationMap.get(key)!;
          existing.weight += 1 + (issue.votes || 0) * 0.1; // Weight by votes
        } else {
          locationMap.set(key, {
            lat,
            lng,
            weight: 1 + (issue.votes || 0) * 0.1,
            category: issue.category
          });
        }
      }
    });

    return Array.from(locationMap.values());
  };

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      try {
        const google = await loadGoogleMaps(["places", "geometry", "visualization"]);
        
        if (!mapRef.current) return;
        
        // Center map on India (or calculate from issues)
        const center = { lat: 17.3850, lng: 78.4867 }; // Hyderabad default
        
        const mapOptions = {
          center,
          zoom: 11,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        };
        
        const map = new google.maps.Map(mapRef.current, mapOptions);
        googleMapRef.current = map;
        
        setIsLoaded(true);
      } catch (err) {
        console.error("Error loading Google Maps", err);
        setError("Failed to load Google Maps. Please try again later.");
      }
    };

    initMap();
  }, []);

  // Update heatmap when issues or filters change
  useEffect(() => {
    if (!googleMapRef.current || !isLoaded) return;

    // Clear existing heatmap
    if (heatmapRef.current) {
      heatmapRef.current.setMap(null);
    }

    const hotspotData = processHotspotData();

    if (hotspotData.length === 0) {
      toast({
        title: "No hotspots found",
        description: "No issues match the selected filters.",
      });
      return;
    }

    if (viewMode === 'heatmap') {
      // Create heatmap layer
      const heatmapData = hotspotData.map(hotspot => ({
        location: new google.maps.LatLng(hotspot.lat, hotspot.lng),
        weight: hotspot.weight
      }));

      const heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: googleMapRef.current,
        radius: 50,
        opacity: 0.6,
        gradient: [
            'rgba(0, 255, 255, 0)',
            'rgba(0, 255, 255, 1)',
            'rgba(0, 191, 255, 1)',
            'rgba(0, 127, 255, 1)',
            'rgba(0, 63, 255, 1)',
            'rgba(0, 0, 255, 1)',
            'rgba(0, 0, 223, 1)',
            'rgba(0, 0, 191, 1)',
            'rgba(0, 0, 159, 1)',
            'rgba(0, 0, 127, 1)',
            'rgba(63, 0, 91, 1)',
            'rgba(127, 0, 63, 1)',
            'rgba(191, 0, 31, 1)',
            'rgba(255, 0, 0, 1)'
        ]
      });

      heatmapRef.current = heatmap;

      // Fit bounds to show all hotspots
      const bounds = new google.maps.LatLngBounds();
      hotspotData.forEach(hotspot => {
        bounds.extend(new google.maps.LatLng(hotspot.lat, hotspot.lng));
      });
      
      if (bounds.getNorthEast().lat() !== bounds.getSouthWest().lat()) {
        googleMapRef.current.fitBounds(bounds);
      }
    } else {
      // Show markers instead of heatmap
      const bounds = new google.maps.LatLngBounds();
      
      hotspotData.forEach((hotspot) => {
        const marker = new google.maps.Marker({
          position: { lat: hotspot.lat, lng: hotspot.lng },
          map: googleMapRef.current,
          title: `${hotspot.weight.toFixed(1)} issues`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: Math.min(10 + hotspot.weight * 2, 30),
            fillColor: '#FF0000',
            fillOpacity: 0.6,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
          }
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">Hotspot</h3>
              <p style="margin: 0; font-size: 12px;">${hotspot.weight.toFixed(1)} issues</p>
              ${hotspot.category ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #666;">Category: ${hotspot.category}</p>` : ''}
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(googleMapRef.current, marker);
        });

        bounds.extend(new google.maps.LatLng(hotspot.lat, hotspot.lng));
      });

      if (bounds.getNorthEast().lat() !== bounds.getSouthWest().lat()) {
        googleMapRef.current.fitBounds(bounds);
      }
    }
  }, [filteredIssues, isLoaded, viewMode]);

  return (
    <Card className="w-full overflow-hidden">
      {error && (
        <div className="p-4 text-center text-red-500 bg-red-50">
          {error}
        </div>
      )}
      
      {/* Controls */}
      <div className="p-4 bg-gray-50 border-b flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Filters:</span>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'heatmap' | 'markers')}>
          <TabsList>
            <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
            <TabsTrigger value="markers">Markers</TabsTrigger>
          </TabsList>
        </Tabs>

        <Badge variant="outline">
          {filteredIssues.length} issues
        </Badge>
      </div>

      {/* Map */}
      <div className="relative">
        <div
          ref={mapRef}
          style={{ height, width: '100%' }}
          className="bg-gray-100"
        />
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Loading hotspot map...</p>
            </div>
          </div>
        )}

        {/* Legend */}
        {viewMode === 'heatmap' && (
          <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg border">
            <div className="text-xs font-medium mb-2">Heat Intensity</div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(to right, rgba(0, 255, 255, 0.3), rgba(255, 0, 0, 1))' }}></div>
                <span>Low → High</span>
              </div>
              <div className="text-gray-500 mt-2">
                Red areas indicate high issue density
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default HotspotMap;

