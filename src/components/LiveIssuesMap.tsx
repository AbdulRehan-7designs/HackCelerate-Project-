import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { MapPin, Filter, X, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';
import { IssueReport } from '@/utils/mockData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { loadGoogleMaps } from '@/utils/googleMapsLoader';

interface LiveIssuesMapProps {
  issues: IssueReport[];
  onIssueSelect?: (issue: IssueReport) => void;
  height?: string;
}

const LiveIssuesMap = ({ issues, onIssueSelect, height = '600px' }: LiveIssuesMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowsRef = useRef<google.maps.InfoWindow[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { toast } = useToast();

  // Get unique categories and statuses
  const categories = ['all', ...new Set(issues.map(issue => issue.category))];
  const statuses = ['all', ...new Set(issues.map(issue => issue.status))];

  // Filter issues based on selected filters
  const filteredIssues = issues.filter(issue => {
    const categoryMatch = selectedCategory === 'all' || issue.category === selectedCategory;
    const statusMatch = selectedStatus === 'all' || issue.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'reported': return '#fbbf24'; // yellow
      case 'verified': return '#3b82f6'; // blue
      case 'in-progress': return '#8b5cf6'; // purple
      case 'resolved': return '#10b981'; // green
      default: return '#6b7280'; // gray
    }
  };

  // Get status icon URL
  const getStatusIcon = (status: string): string => {
    const color = getStatusColor(status).replace('#', '');
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="12" fill="#${color}" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>
    `)}`;
  };

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      try {
        const google = await loadGoogleMaps(["places", "geometry"]);
        
        if (!mapRef.current) return;
        
        // Center map on India (or calculate bounds from issues)
        const center = { lat: 20.5937, lng: 78.9629 };
        
        const mapOptions = {
          center,
          zoom: 6,
          mapTypeControl: true,
          streetViewControl: true,
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

  // Update markers when issues or filters change
  useEffect(() => {
    if (!googleMapRef.current || !isLoaded) return;

    // Clear existing markers and info windows
    markersRef.current.forEach(marker => marker.setMap(null));
    infoWindowsRef.current.forEach(infoWindow => infoWindow.close());
    markersRef.current = [];
    infoWindowsRef.current = [];

    if (filteredIssues.length === 0) {
      toast({
        title: "No issues found",
        description: "No issues match the selected filters.",
      });
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    const geocoder = new google.maps.Geocoder();

    // Process each issue
    filteredIssues.forEach((issue) => {
      let position: { lat: number; lng: number } | null = null;

      // Get position from location
      if (typeof issue.location === 'object' && issue.location.lat && issue.location.lng) {
        position = { lat: issue.location.lat, lng: issue.location.lng };
      } else if (typeof issue.location === 'string') {
        // Geocode address string
        geocoder.geocode({ address: issue.location }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            position = { lat: location.lat(), lng: location.lng() };
            createMarker(issue, position);
          }
        });
        return; // Will be handled in geocode callback
      }

      if (position) {
        createMarker(issue, position);
        bounds.extend(position);
      }
    });

    // Fit map to show all markers
    if (bounds.getNorthEast().lat() !== bounds.getSouthWest().lat()) {
      googleMapRef.current.fitBounds(bounds);
    }
  }, [filteredIssues, isLoaded]);

  const createMarker = (issue: IssueReport, position: { lat: number; lng: number }) => {
    if (!googleMapRef.current) return;

    const marker = new google.maps.Marker({
      position,
      map: googleMapRef.current,
      title: issue.title,
      icon: {
        url: getStatusIcon(issue.status),
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 16)
      },
      animation: google.maps.Animation.DROP
    });

    // Create info window content
    const content = `
      <div style="padding: 8px; min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${issue.title}</h3>
        <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${issue.category}</p>
        <p style="margin: 0 0 8px 0; font-size: 11px; color: #999;">${issue.description.substring(0, 100)}...</p>
        <div style="display: flex; gap: 4px; margin-top: 8px;">
          <span style="background: ${getStatusColor(issue.status)}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px;">
            ${issue.status}
          </span>
          <span style="background: #e5e7eb; padding: 2px 8px; border-radius: 4px; font-size: 10px;">
            ${issue.votes} votes
          </span>
        </div>
      </div>
    `;

    const infoWindow = new google.maps.InfoWindow({
      content
    });

    marker.addListener('click', () => {
      // Close all other info windows
      infoWindowsRef.current.forEach(iw => iw.close());
      
      infoWindow.open(googleMapRef.current, marker);
      
      if (onIssueSelect) {
        onIssueSelect(issue);
      }
    });

    markersRef.current.push(marker);
    infoWindowsRef.current.push(infoWindow);
  };

  return (
    <Card className="w-full overflow-hidden">
      {error && (
        <div className="p-4 text-center text-red-500 bg-red-50">
          {error}
        </div>
      )}
      
      {/* Filters */}
      <div className="p-4 bg-gray-50 border-b flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
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

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map(status => (
              <SelectItem key={status} value={status}>
                {status === 'all' ? 'All Status' : status.replace('-', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Badge variant="outline" className="ml-auto">
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
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg border">
          <div className="text-xs font-medium mb-2">Status Legend</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getStatusColor('reported') }}></div>
              <span className="text-xs">Reported</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getStatusColor('verified') }}></div>
              <span className="text-xs">Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getStatusColor('in-progress') }}></div>
              <span className="text-xs">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getStatusColor('resolved') }}></div>
              <span className="text-xs">Resolved</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LiveIssuesMap;

