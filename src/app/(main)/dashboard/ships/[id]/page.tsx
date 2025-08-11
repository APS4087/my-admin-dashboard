"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  BarChart3,
  Ship as ShipIcon,
  MapPin,
  Navigation,
  Anchor,
  Signal,
  Calendar,
  User,
} from "lucide-react";
import { optimizedShipDetailService } from "@/lib/optimized-ship-detail-service";
import { shipService } from "@/lib/ship-service";
import { LocationCard } from "@/components/ship-detail/location-card";
import { DetailsCard } from "@/components/ship-detail/details-card";
import { ImageCard } from "@/components/ship-detail/image-card";
import { PerformanceDashboard } from "@/components/performance-dashboard";
import type { Ship } from "@/types/ship";
import type { ShipLocation, ShipDetails } from "@/lib/ship-tracking-service";
import dynamic from "next/dynamic";

// Dynamically import the map component to avoid SSR issues
const ShipMap = dynamic(() => import("@/components/ship-map").then((mod) => ({ default: mod.ShipMap })), {
  ssr: false,
  loading: () => (
    <div className="bg-muted flex h-[400px] w-full items-center justify-center rounded-lg">
      <div className="text-muted-foreground">Loading map...</div>
    </div>
  ),
});

const VesselFinderMap = dynamic(
  () => import("@/components/vessel-finder-map").then((mod) => ({ default: mod.VesselFinderMap })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-muted flex h-[400px] w-full items-center justify-center rounded-lg">
        <div className="text-muted-foreground">Loading map...</div>
      </div>
    ),
  },
);

// Loading skeleton component
function ShipDetailsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function ShipDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const shipId = params?.id as string;

  const [ship, setShip] = useState<Ship | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);

  useEffect(() => {
    const fetchShipData = async () => {
      if (!shipId) return;

      try {
        setLoading(true);
        setError(null);

        // Use optimized service for fast initial load
        const { basicData } = await optimizedShipDetailService.getOptimizedShipDetail(shipId);

        if (!basicData) {
          setError("Ship not found");
          return;
        }

        setShip(basicData);
        console.log("Ship basic data loaded:", basicData);

        // Preload tracking data in background
        optimizedShipDetailService.preloadTrackingData(basicData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load ship details");
        console.error("Error fetching ship data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShipData();
  }, [shipId]);

  const handleDelete = async () => {
    if (!ship) return;

    if (confirm("Are you sure you want to delete this ship?")) {
      try {
        await shipService.deleteShip(ship.id);
        // Clear cache
        optimizedShipDetailService.clearShipCache(ship.id);
        router.push("/dashboard/ships");
      } catch (error) {
        console.error("Failed to delete ship:", error);
        setError("Failed to delete ship. Please try again.");
      }
    }
  };

  const handleRefresh = async () => {
    if (!ship) return;

    setRefreshing(true);
    // Clear cache to force fresh data
    optimizedShipDetailService.clearShipCache(ship.id);

    // Reload tracking data
    try {
      await optimizedShipDetailService.loadTrackingData(ship);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }

    setRefreshing(false);
  };

  if (loading) {
    return <ShipDetailsSkeleton />;
  }

  if (error || !ship) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-destructive text-center">
              <ShipIcon className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="font-medium">{error || "Ship not found"}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                The ship you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/dashboard/ships">
                <Button variant="outline" className="mt-3">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Ships
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-2 flex items-center space-x-2">
            <Link href="/dashboard/ships">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Ships
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowPerformanceDashboard(!showPerformanceDashboard)}>
              <BarChart3 className="mr-2 h-4 w-4" />
              {showPerformanceDashboard ? "Hide" : "Show"} Performance
            </Button>
          </div>
          <h1 className="text-3xl font-bold">Ship Details</h1>
          <p className="text-muted-foreground">
            Authentication credentials and tracking information for {ship.ship_email}
          </p>
        </div>
        <div className="flex space-x-2">
          <Link href={`/dashboard/ships/${ship.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Performance Dashboard (Optional) */}
      {showPerformanceDashboard && (
        <PerformanceDashboard isOpen={showPerformanceDashboard} onClose={() => setShowPerformanceDashboard(false)} />
      )}

      {/* Main Content Grid - Progressive Loading Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Location Card - Loads first */}
        <LocationCard ship={ship} />

        {/* Details Card - Loads in background */}
        <DetailsCard ship={ship} />

        {/* Image Card - Loads last (heaviest) */}
        <ImageCard ship={ship} />

        {/* Ship Information Card - Always available (basic data) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShipIcon className="mr-2 h-5 w-5" />
              Authentication
            </CardTitle>
            <CardDescription>Login credentials and vessel registry</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-muted-foreground text-sm font-medium">Ship Email</label>
              <p className="font-mono text-lg">{ship.ship_email}</p>
            </div>

            <Separator />

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-muted-foreground text-sm font-medium">Ship Password</label>
                <Button variant="ghost" size="sm" onClick={() => setShowPasswords(!showPasswords)}>
                  {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="bg-muted rounded p-2 font-mono text-sm">
                {showPasswords ? ship.ship_password : "*".repeat(ship.ship_password.length)}
              </p>
            </div>

            <div>
              <label className="text-muted-foreground text-sm font-medium">App Password</label>
              <p className="bg-muted rounded p-2 font-mono text-sm">
                {showPasswords ? ship.app_password : "*".repeat(ship.app_password.length)}
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <label className="text-muted-foreground text-sm font-medium">Status</label>
              <Badge variant={ship.is_active ? "default" : "secondary"}>{ship.is_active ? "Active" : "Inactive"}</Badge>
            </div>

            <div className="text-muted-foreground flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                Created {new Date(ship.created_at).toLocaleDateString()}
              </div>
              {ship.created_by && (
                <div className="flex items-center">
                  <User className="mr-1 h-4 w-4" />
                  by {ship.created_by}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* VesselFinder Map Card - Full width */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Navigation className="mr-2 h-5 w-5" />
                Live Vessel Tracking
              </CardTitle>
              <CardDescription>Real-time position from VesselFinder</CardDescription>
            </CardHeader>
            <CardContent>
              <VesselFinderMap vesselName={ship.ship_email.split("@")[0]} vesselfinderUrl={ship.vesselfinder_url} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
