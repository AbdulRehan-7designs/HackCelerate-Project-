import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Navigation, MapPin, AlertTriangle, CheckCircle, 
  ExternalLink, Loader2, Route, Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { IssueReport } from '@/utils/mockData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { loadGoogleMaps } from '@/utils/googleMapsLoader';

interface RouteOptimizationProps {
  issues: IssueReport[];
}

interface BlockedRoute {
  issueId: string;
  issue: IssueReport;
  startLocation: { lat: number; lng: number; address?: string };
  endLocation: { lat: number; lng: number; address?: string };
  alternateRoutes: google.maps.DirectionsRoute[];
  selectedRoute?: google.maps.DirectionsRoute;
  reportedToGoogle: boolean;
}

const RouteOptimization = ({ issues }: RouteOptimizationProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<IssueReport | null>(null);
  const [blockedRoutes, setBlockedRoutes] = useState<BlockedRoute[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [reportMessage, setReportMessage] = useState('');
  const { toast } = useToast();

  // Filter issues that might block routes
  const routeBlockingIssues = issues.filter(issue => 
    issue.category === 'Road Damage' || 
    issue.category === 'Drainage Issue' ||
    issue.category === 'Construction' ||
    issue.status === 'reported' || 
    issue.status === 'in-progress'
  );

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      try {
        const google = await loadGoogleMaps(["places", "geometry"]);
        
        if (!mapRef.current) return;
        
        const mapOptions = {
          center: { lat: 20.5937, lng: 78.9629 },
          zoom: 10,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        };
        
        const map = new google.maps.Map(mapRef.current, mapOptions);
        googleMapRef.current = map;
        
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({
          map: map,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#3b82f6',
            strokeWeight: 4
          }
        });
        
        directionsServiceRef.current = directionsService;
        directionsRendererRef.current = directionsRenderer;
        
        setIsLoaded(true);
      } catch (err) {
        console.error("Error loading Google Maps", err);
        toast({
          title: "Map Error",
          description: "Failed to load Google Maps. Please try again later.",
          variant: "destructive"
        });
      }
    };

    initMap();
  }, [toast]);

  const calculateAlternateRoutes = async () => {
    if (!selectedIssue || !directionsServiceRef.current || !directionsRendererRef.current) {
      toast({
        title: "Error",
        description: "Please select an issue and ensure map is loaded.",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);

    try {
      // Get issue location
      let issueLocation: { lat: number; lng: number } | null = null;
      
      if (typeof selectedIssue.location === 'object' && selectedIssue.location.lat) {
        issueLocation = { lat: selectedIssue.location.lat, lng: selectedIssue.location.lng };
      } else {
        // Geocode address
        const geocoder = new google.maps.Geocoder();
        const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
          geocoder.geocode({ address: selectedIssue.location as string }, (results, status) => {
            if (status === 'OK' && results) resolve(results);
            else reject(new Error('Geocoding failed'));
          });
        });
        
        if (result[0]) {
          const location = result[0].geometry.location;
          issueLocation = { lat: location.lat(), lng: location.lng() };
        }
      }

      if (!issueLocation) {
        throw new Error('Could not determine issue location');
      }

      // Calculate routes avoiding the blocked area
      const request: google.maps.DirectionsRequest = {
        origin: startAddress || 'Current Location',
        destination: endAddress || 'Destination',
        travelMode: google.maps.TravelMode.DRIVING,
        avoidHighways: false,
        avoidTolls: false,
        provideRouteAlternatives: true,
        waypoints: [{
          location: issueLocation,
          stopover: false
        }]
      };

      directionsServiceRef.current.route(request, (result, status) => {
        if (status === 'OK' && result) {
          const routes = result.routes;
          
          // Find routes that avoid the issue location
          const alternateRoutes = routes.filter(route => {
            // Check if route passes through the blocked area
            const passesThrough = route.legs.some(leg => {
              return leg.steps.some(step => {
                const stepStart = step.start_location;
                const distance = google.maps.geometry.spherical.computeDistanceBetween(
                  new google.maps.LatLng(issueLocation!.lat, issueLocation!.lng),
                  stepStart
                );
                return distance < 100; // Within 100 meters
              });
            });
            return !passesThrough;
          });

          if (alternateRoutes.length > 0) {
            const blockedRoute: BlockedRoute = {
              issueId: selectedIssue.id,
              issue: selectedIssue,
              startLocation: { lat: 0, lng: 0 }, // Will be set from route
              endLocation: { lat: 0, lng: 0 },
              alternateRoutes: alternateRoutes,
              selectedRoute: alternateRoutes[0],
              reportedToGoogle: false
            };

            setBlockedRoutes(prev => [...prev, blockedRoute]);
            
            // Display first alternate route
            directionsRendererRef.current?.setDirections(result);
            directionsRendererRef.current?.setRouteIndex(0);
            
            toast({
              title: "Alternate Routes Found",
              description: `Found ${alternateRoutes.length} alternate route(s) avoiding the blocked area.`,
            });
          } else {
            toast({
              title: "No Alternate Routes",
              description: "Could not find routes avoiding the blocked area. Consider reporting to Google Maps.",
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Route Calculation Failed",
            description: "Could not calculate alternate routes. Please check your addresses.",
            variant: "destructive"
          });
        }
        
        setIsCalculating(false);
      });
    } catch (error) {
      console.error('Error calculating routes:', error);
      toast({
        title: "Error",
        description: "Failed to calculate alternate routes.",
        variant: "destructive"
      });
      setIsCalculating(false);
    }
  };

  const reportToGoogleMaps = (blockedRoute: BlockedRoute) => {
    const issue = blockedRoute.issue;
    const location = typeof issue.location === 'object' 
      ? `${issue.location.lat},${issue.location.lng}`
      : issue.location;
    
    // Create Google Maps URL for reporting
    const googleMapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(location)}&report=1`;
    
    // Open in new tab
    window.open(googleMapsUrl, '_blank');
    
    // Update blocked route status
    setBlockedRoutes(prev => 
      prev.map(route => 
        route.issueId === blockedRoute.issueId 
          ? { ...route, reportedToGoogle: true }
          : route
      )
    );
    
    toast({
      title: "Reported to Google Maps",
      description: "The blocked route has been reported. Users will see alternate routes.",
    });
  };

  const selectRoute = (blockedRoute: BlockedRoute, routeIndex: number) => {
    if (!directionsRendererRef.current) return;
    
    const route = blockedRoute.alternateRoutes[routeIndex];
    if (!route) return;
    
    // Create a directions result with only the selected route
    const directionsResult: google.maps.DirectionsResult = {
      routes: [route],
      request: {} as google.maps.DirectionsRequest
    };
    
    directionsRendererRef.current.setDirections(directionsResult);
    
    setBlockedRoutes(prev =>
      prev.map(r =>
        r.issueId === blockedRoute.issueId
          ? { ...r, selectedRoute: route }
          : r
      )
    );
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center mb-4">
          <Navigation className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="font-semibold text-lg">Route Optimization</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="start">Start Location</Label>
            <Input
              id="start"
              placeholder="Enter start address or use 'Current Location'"
              value={startAddress}
              onChange={(e) => setStartAddress(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end">End Location</Label>
            <Input
              id="end"
              placeholder="Enter destination address"
              value={endAddress}
              onChange={(e) => setEndAddress(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <Label>Select Blocking Issue</Label>
          <Select
            value={selectedIssue?.id || ''}
            onValueChange={(value) => {
              const issue = routeBlockingIssues.find(i => i.id === value);
              setSelectedIssue(issue || null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an issue blocking routes" />
            </SelectTrigger>
            <SelectContent>
              {routeBlockingIssues.map(issue => (
                <SelectItem key={issue.id} value={issue.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{issue.title}</span>
                    <span className="text-xs text-gray-500">{issue.category} - {issue.status}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedIssue && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-sm">{selectedIssue.title}</div>
                <div className="text-xs text-gray-600 mt-1">
                  Location: {typeof selectedIssue.location === 'object' 
                    ? selectedIssue.location.address 
                    : selectedIssue.location}
                </div>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={calculateAlternateRoutes}
          disabled={!selectedIssue || !startAddress || !endAddress || isCalculating}
          className="w-full"
        >
          {isCalculating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculating Routes...
            </>
          ) : (
            <>
              <Route className="mr-2 h-4 w-4" />
              Find Alternate Routes
            </>
          )}
        </Button>
      </Card>

      {/* Map */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b">
          <h4 className="font-medium">Route Visualization</h4>
        </div>
        <div className="relative">
          <div
            ref={mapRef}
            style={{ height: '500px', width: '100%' }}
            className="bg-gray-100"
          />
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Loading map...</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Alternate Routes List */}
      {blockedRoutes.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-4">Alternate Routes</h4>
          <div className="space-y-3">
            {blockedRoutes.map((blockedRoute) => (
              <div key={blockedRoute.issueId} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-medium text-sm">{blockedRoute.issue.title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {blockedRoute.alternateRoutes.length} route(s) available
                    </div>
                  </div>
                  {blockedRoute.reportedToGoogle ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Reported
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => reportToGoogleMaps(blockedRoute)}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Report to Google Maps
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  {blockedRoute.alternateRoutes.map((route, index) => {
                    const leg = route.legs[0];
                    const distance = leg.distance?.text || 'N/A';
                    const duration = leg.duration?.text || 'N/A';
                    const isSelected = blockedRoute.selectedRoute === route;

                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-md border cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50 border-blue-300'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                        onClick={() => selectRoute(blockedRoute, index)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">Route {index + 1}</div>
                            <div className="text-xs text-gray-600 mt-1">
                              {distance} • {duration}
                            </div>
                          </div>
                          {isSelected && (
                            <Badge variant="outline" className="bg-blue-100 text-blue-700">
                              Selected
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 pt-3 border-t">
                  <Label htmlFor={`report-${blockedRoute.issueId}`} className="text-xs">
                    Report Message (Optional)
                  </Label>
                  <Textarea
                    id={`report-${blockedRoute.issueId}`}
                    placeholder="Add details about the route blockage..."
                    value={reportMessage}
                    onChange={(e) => setReportMessage(e.target.value)}
                    className="mt-1 text-sm"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default RouteOptimization;

