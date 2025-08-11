import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Ship as ShipIcon, Flag, Calendar, Ruler } from "lucide-react";
import { optimizedShipDetailService } from "@/lib/optimized-ship-detail-service";
import type { Ship } from "@/types/ship";
import type { ShipDetails } from "@/lib/ship-tracking-service";

interface DetailsCardProps {
  ship: Ship;
}

export function DetailsCard({ ship }: DetailsCardProps) {
  const [details, setDetails] = useState<ShipDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDetailsData = async () => {
      try {
        // Check cache first
        const cached = optimizedShipDetailService.getCachedTrackingData(ship.id);
        if (cached && cached.trackingDetails) {
          setDetails(cached.trackingDetails);
          setLoading(false);
          return;
        }

        // Load fresh data
        const trackingData = await optimizedShipDetailService.loadTrackingData(ship);
        
        if (isMounted) {
          setDetails(trackingData.details || null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading ship details:', error);
        if (isMounted) {
          setError('Failed to load ship details');
          setLoading(false);
        }
      }
    };

    loadDetailsData();

    return () => {
      isMounted = false;
    };
  }, [ship.id]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShipIcon className="h-5 w-5" />
            <span>Vessel Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-18" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Use ship email as fallback for name
  const shipName = details?.name || ship.ship_email.split('@')[0].toUpperCase();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ShipIcon className="h-5 w-5" />
          <span>Vessel Details</span>
        </CardTitle>
        <CardDescription>Technical specifications and registration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Vessel Name</p>
          <p className="text-lg font-semibold">{shipName}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Type</p>
            <p className="text-sm text-muted-foreground">
              {details?.type || "Unknown"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium flex items-center space-x-1">
              <Flag className="h-4 w-4" />
              <span>Flag</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {details?.flag || "Unknown"}
            </p>
          </div>
        </div>

        {(details?.length || details?.width) && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium flex items-center space-x-1">
                <Ruler className="h-4 w-4" />
                <span>Length</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {details?.length ? `${details.length} m` : "Unknown"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Width</p>
              <p className="text-sm text-muted-foreground">
                {details?.width ? `${details.width} m` : "Unknown"}
              </p>
            </div>
          </div>
        )}

        {(details?.deadweight || details?.yearBuilt) && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Deadweight</p>
              <p className="text-sm text-muted-foreground">
                {details?.deadweight ? `${details.deadweight.toLocaleString()} tons` : "Unknown"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Built</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {details?.yearBuilt || "Unknown"}
              </p>
            </div>
          </div>
        )}

        {(details?.imo || details?.imo) && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="space-y-1">
              <p className="text-sm font-medium">IMO Number</p>
              <p className="text-sm text-muted-foreground font-mono">
                {details?.imo || "Unknown"}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
