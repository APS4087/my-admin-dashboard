import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, 
  Navigation, 
  Anchor, 
  Ship as ShipIcon,
  Signal,
  Clock
} from "lucide-react";
import { optimizedShipDetailService } from "@/lib/optimized-ship-detail-service";
import type { Ship } from "@/types/ship";
import type { ShipLocation } from "@/lib/ship-tracking-service";

interface LocationCardProps {
  ship: Ship;
}

export function LocationCard({ ship }: LocationCardProps) {
  const [location, setLocation] = useState<ShipLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadLocationData = async () => {
      try {
        // Check cache first
        const cached = optimizedShipDetailService.getCachedTrackingData(ship.id);
        if (cached && cached.location) {
          setLocation(cached.location);
          setLoading(false);
          return;
        }

        // Load fresh data
        const trackingData = await optimizedShipDetailService.loadTrackingData(ship);
        
        if (isMounted) {
          setLocation(trackingData.location || null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading location data:', error);
        if (isMounted) {
          setError('Failed to load location data');
          setLoading(false);
        }
      }
    };

    loadLocationData();

    return () => {
      isMounted = false;
    };
  }, [ship.id]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Current Location</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !location) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Current Location</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {error || "Location data not available"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>Current Location</span>
        </CardTitle>
        <CardDescription>Real-time vessel position and status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            {location.status === "Underway" && (
              <Navigation className="h-4 w-4 text-blue-500" />
            )}
            {location.status === "At anchor" && (
              <Anchor className="h-4 w-4 text-yellow-500" />
            )}
            {location.status === "Moored" && (
              <ShipIcon className="h-4 w-4 text-green-500" />
            )}
            <Badge variant={location.status === "Underway" ? "default" : "secondary"}>
              {location.status}
            </Badge>
          </div>
          {location.port && (
            <p className="text-sm text-muted-foreground">
              Port: {location.port}
            </p>
          )}
          {location.destination && (
            <p className="text-sm text-muted-foreground">
              Destination: {location.destination}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Speed</p>
            <p className="text-2xl font-bold">{location.speed.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">knots</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Course</p>
            <p className="text-2xl font-bold">{location.course}°</p>
            <p className="text-xs text-muted-foreground">heading</p>
          </div>
        </div>

        {location.lastUpdate && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground pt-2 border-t">
            <Clock className="h-4 w-4" />
            <span>Updated: {new Date(location.lastUpdate).toLocaleString()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
