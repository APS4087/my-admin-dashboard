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
  User
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
const ShipMap = dynamic(() => import("@/components/ship-map").then(mod => ({ default: mod.ShipMap })), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-muted rounded-lg flex items-center justify-center">
      <div className="text-muted-foreground">Loading map...</div>
    </div>
  )
});

const VesselFinderMap = dynamic(() => import("@/components/vessel-finder-map").then(mod => ({ default: mod.VesselFinderMap })), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-muted rounded-lg flex items-center justify-center">
      <div className="text-muted-foreground">Loading map...</div>
    </div>
  )
});

// Loading skeleton component
function ShipDetailsSkeleton() {
  return (
    <div className="p-6 space-y-6">
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <div className="text-center text-destructive">
              <ShipIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="font-medium">{error || "Ship not found"}</p>
              <p className="text-sm text-muted-foreground mt-1">
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Link href="/dashboard/ships">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Ships
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowPerformanceDashboard(!showPerformanceDashboard)}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {showPerformanceDashboard ? 'Hide' : 'Show'} Performance
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
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Performance Dashboard (Optional) */}
      {showPerformanceDashboard && (
        <PerformanceDashboard 
          isOpen={showPerformanceDashboard}
          onClose={() => setShowPerformanceDashboard(false)}
        />
      )}

      {/* Main Content Grid - Progressive Loading Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <ShipIcon className="h-5 w-5 mr-2" />
              Authentication
            </CardTitle>
            <CardDescription>
              Login credentials and vessel registry
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Ship Email</label>
              <p className="text-lg font-mono">{ship.ship_email}</p>
            </div>
            
            <Separator />
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">Ship Password</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPasswords(!showPasswords)}
                >
                  {showPasswords ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="font-mono text-sm bg-muted p-2 rounded">
                {showPasswords ? ship.ship_password : "*".repeat(ship.ship_password.length)}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">App Password</label>
              <p className="font-mono text-sm bg-muted p-2 rounded">
                {showPasswords ? ship.app_password : "*".repeat(ship.app_password.length)}
              </p>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Badge variant={ship.is_active ? "default" : "secondary"}>
                {ship.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Created {new Date(ship.created_at).toLocaleDateString()}
              </div>
              {ship.created_by && (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
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
                <Navigation className="h-5 w-5 mr-2" />
                Live Vessel Tracking
              </CardTitle>
              <CardDescription>
                Real-time position from VesselFinder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VesselFinderMap 
                vesselName={ship.ship_email.split('@')[0]}
                vesselfinderUrl={ship.vesselfinder_url}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
