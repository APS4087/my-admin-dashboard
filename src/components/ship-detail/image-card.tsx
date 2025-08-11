import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera, ExternalLink } from "lucide-react";
import { optimizedShipDetailService } from "@/lib/optimized-ship-detail-service";
import type { Ship } from "@/types/ship";
import type { ShipImage } from "@/lib/ship-tracking-service";
import Image from "next/image";

interface ImageCardProps {
  ship: Ship;
}

export function ImageCard({ ship }: ImageCardProps) {
  const [image, setImage] = useState<ShipImage | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadImageData = async () => {
      try {
        // Check cache first
        const cached = optimizedShipDetailService.getCachedTrackingData(ship.id);
        if (cached && cached.imageUrl) {
          setImageUrl(cached.imageUrl);
          setImage({
            url: cached.imageUrl,
            source: "VesselFinder",
            timestamp: new Date().toISOString(),
          });
          setLoading(false);
          return;
        }

        // Load fresh data
        const trackingData = await optimizedShipDetailService.loadTrackingData(ship);

        if (isMounted) {
          setImage(trackingData.image || null);
          setImageUrl(trackingData.image?.url || null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading ship image:", error);
        if (isMounted) {
          setError("Failed to load ship image");
          setLoading(false);
        }
      }
    };

    loadImageData();

    return () => {
      isMounted = false;
    };
  }, [ship.id]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Vessel Image</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (error || !imageUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Vessel Image</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted flex h-64 w-full items-center justify-center rounded-lg">
            <div className="text-muted-foreground text-center">
              <Camera className="mx-auto mb-2 h-12 w-12 opacity-50" />
              <p className="text-sm">{error || "No image available"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Camera className="h-5 w-5" />
          <span>Vessel Image</span>
        </CardTitle>
        <CardDescription>Latest vessel photograph</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative h-64 w-full overflow-hidden rounded-lg">
          <Image
            src={imageUrl}
            alt={`${ship.ship_email.split("@")[0]} vessel`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {image && (
          <div className="text-muted-foreground flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <span>Source: {image.source}</span>
            </div>
            {ship.vesselfinder_url && (
              <a
                href={ship.vesselfinder_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground flex items-center space-x-1 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>View on VesselFinder</span>
              </a>
            )}
          </div>
        )}

        {image?.timestamp && (
          <p className="text-muted-foreground text-xs">Captured: {new Date(image.timestamp).toLocaleString()}</p>
        )}
      </CardContent>
    </Card>
  );
}
