"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Map, MapPin, Navigation } from "lucide-react";

interface VesselFinderMapProps {
  imo?: string;
  mmsi?: string;
  vesselName?: string;
  vesselfinderUrl?: string;
  className?: string;
}

export function VesselFinderMap({ imo, mmsi, vesselName, vesselfinderUrl, className }: VesselFinderMapProps) {
  // Helper function to extract IMO from VesselFinder URL
  const extractImoFromUrl = (url: string): string | null => {
    if (!url) return null;
    const imoMatch = url.match(/(?:imo=|details\/)(\d{7})/);
    return imoMatch ? imoMatch[1] : null;
  };

  // Prioritize live tracking URL format (/?imo=) over detail pages
  const mapUrl = (() => {
    // First priority: Direct IMO parameter
    if (imo) return `https://www.vesselfinder.com/?imo=${imo}`;

    // Second priority: Extract IMO from provided URL and convert to live tracking
    if (vesselfinderUrl) {
      const extractedImo = extractImoFromUrl(vesselfinderUrl);
      if (extractedImo) return `https://www.vesselfinder.com/?imo=${extractedImo}`;
      // Fallback to original URL
      return vesselfinderUrl;
    }

    // Third priority: MMSI-based tracking
    if (mmsi) return `https://www.vesselfinder.com/?mmsi=${mmsi}`;

    return null;
  })();

  const detailUrl = imo ? `https://www.vesselfinder.com/vessels/details/${imo}` : null;

  // Alternative mapping services
  const marineTrafficUrl = mmsi ? `https://www.marinetraffic.com/en/ais/details/ships/mmsi:${mmsi}` : null;

  const vesselFinderSearchUrl = vesselName
    ? `https://www.vesselfinder.com/vessels?name=${encodeURIComponent(vesselName)}`
    : null;

  if (!mapUrl && !vesselFinderSearchUrl) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-muted-foreground py-8 text-center">
            <Map className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p>Map unavailable</p>
            <p className="text-sm">No tracking information available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Map className="mr-2 h-5 w-5" />
          Live Position Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Main tracking options */}
          <div className="grid gap-3">
            {mapUrl && (
              <Button variant="default" size="lg" asChild className="h-auto w-full justify-start py-4">
                <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                  <div className="flex w-full items-center">
                    <div className="mr-3 rounded-lg bg-white/20 p-2">
                      <Navigation className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold">View Live Position on VesselFinder</div>
                      <div className="text-sm opacity-90">Real-time tracking and vessel details</div>
                    </div>
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </div>
                </a>
              </Button>
            )}

            {marineTrafficUrl && (
              <Button variant="outline" size="lg" asChild className="h-auto w-full justify-start py-4">
                <a href={marineTrafficUrl} target="_blank" rel="noopener noreferrer">
                  <div className="flex w-full items-center">
                    <div className="bg-muted mr-3 rounded-lg p-2">
                      <Map className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold">Alternative: MarineTraffic</div>
                      <div className="text-muted-foreground text-sm">Cross-reference position data</div>
                    </div>
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </div>
                </a>
              </Button>
            )}

            {vesselFinderSearchUrl && (
              <Button variant="outline" size="sm" asChild className="w-full">
                <a href={vesselFinderSearchUrl} target="_blank" rel="noopener noreferrer">
                  Search "{vesselName}" on VesselFinder
                  <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </Button>
            )}
          </div>

          {/* Quick vessel info */}
          <div className="space-y-2 border-t pt-4">
            <h4 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">Vessel Identifiers</h4>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {imo && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IMO:</span>
                  <span className="font-mono">{imo}</span>
                </div>
              )}
              {mmsi && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">MMSI:</span>
                  <span className="font-mono">{mmsi}</span>
                </div>
              )}
            </div>

            {detailUrl && (
              <div className="pt-2">
                <Button variant="link" size="sm" asChild className="h-auto p-0 text-xs">
                  <a href={detailUrl} target="_blank" rel="noopener noreferrer">
                    View complete vessel details and history →
                  </a>
                </Button>
              </div>
            )}
          </div>

          {/* Help text */}
          <div className="text-muted-foreground border-t pt-2 text-center text-xs">
            💡 Tip: Bookmark the VesselFinder link for quick access to real-time tracking
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
