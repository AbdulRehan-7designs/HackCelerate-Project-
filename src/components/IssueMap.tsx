
import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { IssueReport } from '@/utils/mockData';

interface IssueMapProps {
  issues: IssueReport[];
  onIssueSelect?: (issueId: string) => void;
}

// This is a placeholder map component
// In a real app, you would use a proper map library like Leaflet or Google Maps
const IssueMap = ({ issues, onIssueSelect }: IssueMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return '#1976d2';
      case 'verified': return '#ff9800';
      case 'in-progress': return '#9c27b0';
      case 'resolved': return '#2e7d32';
      default: return '#546e7a';
    }
  };

  // In a real app, this would initialize the map with a proper mapping library
  useEffect(() => {
    if (!mapRef.current) return;

    // Add placeholder map - in a real app, initialize your map library here
    const mapPlaceholder = document.createElement('div');
    mapPlaceholder.className = 'h-full w-full bg-gray-100 relative overflow-hidden';
    mapPlaceholder.style.borderRadius = '0.5rem';
    
    // Create a simple visual representation
    mapPlaceholder.innerHTML = `
      <div class="absolute inset-0 bg-blue-50 opacity-50"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <p class="text-gray-500 mb-2">Interactive map will appear here</p>
        <p class="text-xs text-gray-400">Using real location data from reports</p>
      </div>
    `;
    
    // Add mock pins for issues
    issues.forEach((issue) => {
      const pin = document.createElement('div');
      pin.className = 'absolute w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-125 transition-transform';
      pin.style.backgroundColor = getStatusColor(issue.status);
      pin.style.border = '1px solid white';
      
      // Position randomly but deterministically based on issue ID
      const hash = issue.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const left = 20 + (hash % 60); // 20-80% of width
      const top = 20 + ((hash * 13) % 60); // 20-80% of height
      
      pin.style.left = `${left}%`;
      pin.style.top = `${top}%`;
      pin.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.5)';
      
      pin.addEventListener('click', () => {
        if (onIssueSelect) onIssueSelect(issue.id);
        
        // Highlight selected pin
        const allPins = mapPlaceholder.querySelectorAll('.map-pin');
        allPins.forEach(p => p.classList.remove('selected-pin'));
        pin.classList.add('selected-pin');
      });
      
      pin.setAttribute('title', issue.title);
      pin.classList.add('map-pin');
      
      mapPlaceholder.appendChild(pin);
    });
    
    // Clear previous content and add the map
    if (mapRef.current) {
      mapRef.current.innerHTML = '';
      mapRef.current.appendChild(mapPlaceholder);
    }
    
    return () => {
      if (mapRef.current) {
        mapRef.current.innerHTML = '';
      }
    };
  }, [issues, onIssueSelect]);

  return (
    <Card className="h-full overflow-hidden">
      <div ref={mapRef} className="h-full w-full">
        <div className="h-full w-full flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="text-gray-400">Loading map...</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default IssueMap;
