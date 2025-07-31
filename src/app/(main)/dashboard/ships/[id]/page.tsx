"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  MapPin, 
  Calendar, 
  User, 
  Ship as ShipIcon,
  Eye,
  EyeOff,
  Navigation,
  Anchor,
  Signal
} from "lucide-react";
import { ShipService } from "@/lib/ship-service";
import { shipTrackingService, type ShipLocation, type ShipImage, type ShipDetails } from "@/lib/ship-tracking-service";
import type { Ship } from "@/types/ship";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
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
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ShipDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const shipId = params?.id as string;
  
  const [ship, setShip] = useState<Ship | null>(null);
  const [location, setLocation] = useState<ShipLocation | null>(null);
  const [shipImage, setShipImage] = useState<ShipImage | null>(null);
  const [shipDetails, setShipDetails] = useState<ShipDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);
  
  const shipService = new ShipService();

  useEffect(() => {
    const fetchShipData = async () => {
      if (!shipId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch ship details
        const shipData = await shipService.getShipById(shipId);
        if (!shipData) {
          setError("Ship not found");
          return;
        }
        setShip(shipData);
        
        // Fetch ship location using tracking service
        const locationData = await shipTrackingService.getShipLocation(shipData.ship_email);
        setLocation(locationData);
        
        // Fetch ship image using tracking service
        const imageData = await shipTrackingService.getShipImage(shipData.ship_email);
        setShipImage(imageData);
        
        // Fetch additional ship details
        const detailsData = await shipTrackingService.getShipDetails(shipData.ship_email);
        setShipDetails(detailsData);
        
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
    
    if (confirm("Are you sure you want to delete this ship? This action cannot be undone.")) {
      try {
        await shipService.deleteShip(ship.id);
        router.push("/dashboard/ships");
      } catch (error) {
        console.error("Failed to delete ship:", error);
        setError("Failed to delete ship. Please try again.");
      }
    }
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ship Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShipIcon className="h-5 w-5 mr-2" />
              Ship Information
            </CardTitle>
            <CardDescription>
              Authentication credentials and basic information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {shipDetails && (
              <>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Vessel Name</label>
                  <p className="text-lg font-semibold">{shipDetails.name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <p className="text-sm">{shipDetails.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Flag</label>
                    <p className="text-sm">{shipDetails.flag}</p>
                  </div>
                  {shipDetails.length && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Length</label>
                      <p className="text-sm">{shipDetails.length}m</p>
                    </div>
                  )}
                  {shipDetails.yearBuilt && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Year Built</label>
                      <p className="text-sm">{shipDetails.yearBuilt}</p>
                    </div>
                  )}
                </div>
                
                <Separator />
              </>
            )}
            
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

        {/* Ship Image Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShipIcon className="h-5 w-5 mr-2" />
              Ship Image
            </CardTitle>
            <CardDescription>
              Latest satellite or aerial view of the vessel
            </CardDescription>
          </CardHeader>
          <CardContent>
            {shipImage ? (
              <div className="space-y-3">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                  <Image
                    src={shipImage.url}
                    alt={`Ship image for ${ship.ship_email}`}
                    fill
                    className="object-cover"
                    priority={false}
                    onError={(e) => {
                      console.error('Image failed to load:', shipImage.url);
                      setShipImage(null);
                    }}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Source: {shipImage.source}</p>
                  {shipImage.caption && <p>{shipImage.caption}</p>}
                  {shipImage.timestamp && (
                    <p>Captured: {new Date(shipImage.timestamp).toLocaleString()}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="aspect-video w-full flex items-center justify-center bg-muted rounded-lg">
                <div className="text-center text-muted-foreground">
                  <ShipIcon className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p className="font-medium">No image available</p>
                  <p className="text-xs">Image loading failed or not found</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location Tracking Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Location & Tracking
            </CardTitle>
            <CardDescription>
              Real-time position and navigation data with interactive map
            </CardDescription>
          </CardHeader>
          <CardContent>
            {location ? (
              <div className="space-y-6">
                {/* Interactive Map */}
                <div className="rounded-lg overflow-hidden border">
                  <ShipMap 
                    location={location} 
                    shipEmail={ship.ship_email}
                    className="w-full"
                  />
                </div>
                
                {/* Position and Tracking Numbers */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Position</div>
                    <p className="text-lg font-mono">
                      {location.latitude.toFixed(6)}°
                    </p>
                    <p className="text-lg font-mono">
                      {location.longitude.toFixed(6)}°
                    </p>
                  </div>
                  {location.mmsi && (
                    <div className="text-center">
                      <div className="text-sm font-medium text-muted-foreground mb-1">MMSI</div>
                      <p className="text-lg font-mono">{location.mmsi}</p>
                    </div>
                  )}
                  {location.imo && (
                    <div className="text-center">
                      <div className="text-sm font-medium text-muted-foreground mb-1">IMO</div>
                      <p className="text-lg font-mono">{location.imo}</p>
                    </div>
                  )}
                </div>
                
                {/* Navigation Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium">
                      <Navigation className="h-4 w-4 mr-1" />
                      Speed & Course
                    </div>
                    <p className="text-sm">
                      Speed: {location.speed.toFixed(1)} knots
                    </p>
                    <p className="text-sm">
                      Course: {location.course.toFixed(0)}°
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium">
                      <Signal className="h-4 w-4 mr-1" />
                      Status
                    </div>
                    <Badge variant={location.status === "Underway" ? "default" : "secondary"}>
                      {location.status}
                    </Badge>
                    {location.port && (
                      <p className="text-sm text-muted-foreground">
                        Near: {location.port}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium">
                      <Anchor className="h-4 w-4 mr-1" />
                      Destination
                    </div>
                    <p className="text-sm">
                      {location.destination || "Not specified"}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium">
                      <Calendar className="h-4 w-4 mr-1" />
                      Last Update
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(location.lastUpdate).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>Location data unavailable</p>
                <p className="text-sm">GPS tracking may be disabled or signal lost</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
