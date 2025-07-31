"use client";

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom ship icon
const shipIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <path fill="#2563eb" d="M19 10.5V9H5v1.5l1 4.5h12l1-4.5zM2 16v1h20v-1l-2-7H4l-2 7zm9-8V7h2v1h-2zm0-3V4h2v1h-2z"/>
      <circle fill="#dc2626" cx="12" cy="10" r="2"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface ShipLocation {
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
  status: string;
  lastUpdate: string;
  port?: string;
  destination?: string;
  mmsi?: string;
  imo?: string;
}

interface ShipMapProps {
  location: ShipLocation;
  shipEmail: string;
  className?: string;
}

// Component to update map view when location changes
function MapUpdater({ location }: { location: ShipLocation }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView([location.latitude, location.longitude], 10);
  }, [map, location.latitude, location.longitude]);
  
  return null;
}

export function ShipMap({ location, shipEmail, className = "" }: ShipMapProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Course arrow rotation style
  const courseArrowStyle = {
    transform: `rotate(${location.course}deg)`,
    transformOrigin: 'center',
  };

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={[location.latitude, location.longitude]}
        zoom={10}
        style={{ height: '400px', width: '100%' }}
        ref={mapRef}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker 
          position={[location.latitude, location.longitude]} 
          icon={shipIcon}
        >
          <Popup>
            <div className="min-w-[200px] space-y-2">
              <div className="font-semibold text-center border-b pb-2">
                {shipEmail}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Position:</span>
                  <br />
                  <span className="font-mono text-xs">
                    {location.latitude.toFixed(6)}°<br />
                    {location.longitude.toFixed(6)}°
                  </span>
                </div>
                
                <div>
                  <span className="font-medium">Speed:</span>
                  <br />
                  <span>{location.speed.toFixed(1)} knots</span>
                </div>
                
                <div>
                  <span className="font-medium">Course:</span>
                  <br />
                  <span className="flex items-center">
                    {location.course.toFixed(0)}°
                    <svg 
                      className="ml-1 w-3 h-3" 
                      style={courseArrowStyle}
                      viewBox="0 0 24 24" 
                      fill="currentColor"
                    >
                      <path d="M12 2l8 10h-6v10H10V12H4l8-10z"/>
                    </svg>
                  </span>
                </div>
                
                <div>
                  <span className="font-medium">Status:</span>
                  <br />
                  <span className={`inline-block px-2 py-1 rounded text-xs ${
                    location.status === 'Underway' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {location.status}
                  </span>
                </div>
              </div>
              
              {location.port && (
                <div className="pt-2 border-t">
                  <span className="font-medium text-xs">Near: </span>
                  <span className="text-xs">{location.port}</span>
                </div>
              )}
              
              {location.destination && (
                <div>
                  <span className="font-medium text-xs">Destination: </span>
                  <span className="text-xs">{location.destination}</span>
                </div>
              )}
              
              <div className="pt-2 border-t text-xs text-gray-500">
                Updated: {new Date(location.lastUpdate).toLocaleString()}
              </div>
            </div>
          </Popup>
        </Marker>
        
        <MapUpdater location={location} />
      </MapContainer>
      
      {/* Map overlay with ship info */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg z-[1000]">
        <div className="text-sm space-y-1">
          <div className="font-semibold">{shipEmail.split('@')[0].toUpperCase()}</div>
          <div className="flex items-center text-xs text-gray-600">
            <span className="w-2 h-2 rounded-full mr-2 bg-blue-500"></span>
            {location.speed.toFixed(1)} kts
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <svg 
              className="w-3 h-3 mr-1" 
              style={courseArrowStyle}
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 2l8 10h-6v10H10V12H4l8-10z"/>
            </svg>
            {location.course.toFixed(0)}°
          </div>
        </div>
      </div>
    </div>
  );
}
