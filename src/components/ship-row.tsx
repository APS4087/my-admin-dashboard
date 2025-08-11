import { useState, useEffect } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, Edit, Trash2, Eye, MapPin, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { optimizedShipService } from "@/lib/optimized-ship-service";
import type { Ship } from "@/types/ship";
import type { ShipLocation, ShipDetails } from "@/lib/ship-tracking-service";

interface ShipRowProps {
  ship: Ship;
  onDelete: (id: string) => void;
  index: number;
}

interface ShipRowData {
  location?: ShipLocation;
  imageUrl?: string;
  shipName?: string;
  trackingDetails?: ShipDetails;
  loading: boolean;
  error?: string;
}

export function ShipRow({ ship, onDelete, index }: ShipRowProps) {
  const [shipData, setShipData] = useState<ShipRowData>({
    loading: true,
    shipName: ship.ship_email.split("@")[0].toUpperCase(),
  });

  // Helper function to extract IMO from VesselFinder URL
  const extractImoFromUrl = (url: string): string | null => {
    if (!url) return null;

    // Match patterns like:
    // https://www.vesselfinder.com/vessels/details/9112038
    // https://www.vesselfinder.com/?imo=9112038
    const imoMatch = url.match(/(?:imo=|details\/)(\d{7})/);
    return imoMatch ? imoMatch[1] : null;
  };

  // Get the best tracking URL (prioritize live tracking with IMO)
  const getTrackingUrl = (): string | null => {
    // First priority: Use IMO from live tracking data
    if (shipData.location?.imo) {
      return `https://www.vesselfinder.com/?imo=${shipData.location.imo}`;
    }

    // Second priority: Extract IMO from stored VesselFinder URL
    if (ship.vesselfinder_url) {
      const extractedImo = extractImoFromUrl(ship.vesselfinder_url);
      if (extractedImo) {
        return `https://www.vesselfinder.com/?imo=${extractedImo}`;
      }
      // Fallback to original URL if IMO extraction fails
      return ship.vesselfinder_url;
    }

    return null;
  };

  useEffect(() => {
    let isMounted = true;

    const loadShipData = async () => {
      // Add a small delay for staggered loading to prevent overwhelming the server
      const delay = index * 100; // 100ms delay between each ship
      await new Promise((resolve) => setTimeout(resolve, delay));

      if (!isMounted) return;

      try {
        // Check cache first for instant loading
        const cached = optimizedShipService.getCachedTrackingData(ship);
        if (cached) {
          setShipData({
            location: cached.location,
            imageUrl: cached.imageUrl,
            shipName: cached.shipName || ship.ship_email.split("@")[0].toUpperCase(),
            trackingDetails: cached.trackingDetails,
            loading: false,
          });
          return;
        }

        // Load fresh data using optimized service
        const trackingData = await optimizedShipService.getShipTrackingData(ship);

        if (isMounted) {
          setShipData({
            location: trackingData.location,
            imageUrl: trackingData.imageUrl,
            shipName: trackingData.shipName || ship.ship_email.split("@")[0].toUpperCase(),
            trackingDetails: trackingData.trackingDetails,
            loading: false,
          });
        }
      } catch (error) {
        console.error(`Error loading data for ship ${ship.ship_email}:`, error);
        if (isMounted) {
          setShipData({
            shipName: ship.ship_email.split("@")[0].toUpperCase(),
            loading: false,
            error: "Failed to load tracking data",
          });
        }
      }
    };

    loadShipData();

    return () => {
      isMounted = false;
    };
  }, [ship.id, ship.ship_email, ship.vesselfinder_url, index]);

  if (shipData.loading) {
    return (
      <TableRow>
        <TableCell>
          <div className="flex min-w-0 items-center space-x-3">
            <Skeleton className="h-10 w-16 rounded" />
            <div className="min-w-0 flex-1">
              <Skeleton className="mb-2 h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-1">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-24" />
          </div>
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-16" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-24" />
        </TableCell>
        <TableCell className="text-right">
          <Skeleton className="ml-auto h-8 w-8 rounded" />
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell>
        <div className="flex min-w-0 items-center space-x-3">
          {shipData.imageUrl && (
            <div className="relative h-10 w-16 flex-shrink-0 overflow-hidden rounded">
              <Image src={shipData.imageUrl} alt={shipData.shipName || "Ship"} fill className="object-cover" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">{shipData.shipName}</div>
            <div className="text-muted-foreground truncate text-sm">{ship.ship_email}</div>
            {shipData.error && <div className="truncate text-xs text-red-500">{shipData.error}</div>}
          </div>
        </div>
      </TableCell>
      <TableCell>
        {shipData.location ? (
          <div className="flex min-w-0 items-center space-x-1">
            <MapPin className="text-muted-foreground h-4 w-4 flex-shrink-0" />
            <span className="truncate text-sm">
              {shipData.location.port ||
                `${shipData.location.latitude.toFixed(4)}°, ${shipData.location.longitude.toFixed(4)}°`}
            </span>
            {getTrackingUrl() && (
              <Button variant="ghost" size="sm" asChild className="h-6 w-6 p-1 opacity-60 hover:opacity-100">
                <a
                  href={getTrackingUrl()!}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View live tracking on VesselFinder"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-1">
            <span className="text-muted-foreground">Unknown</span>
            {getTrackingUrl() && (
              <Button variant="ghost" size="sm" asChild className="h-6 w-6 p-1 opacity-60 hover:opacity-100">
                <a href={getTrackingUrl()!} target="_blank" rel="noopener noreferrer" title="Search on VesselFinder">
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            )}
          </div>
        )}
      </TableCell>
      <TableCell>
        {shipData.location ? (
          <span className="whitespace-nowrap">{shipData.location.speed.toFixed(1)} knots</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        <span className="whitespace-nowrap">
          {shipData.location?.lastUpdate
            ? new Date(shipData.location.lastUpdate).toLocaleString()
            : new Date(ship.updated_at).toLocaleDateString()}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/ships/${ship.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => onDelete(ship.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
