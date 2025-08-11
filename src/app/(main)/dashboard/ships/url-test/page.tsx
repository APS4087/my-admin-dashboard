"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Ship as ShipIcon, ExternalLink, MapPin, Globe } from "lucide-react";

interface VesselURLTestData {
  name?: string;
  mmsi?: string;
  imo?: string;
  type?: string;
  flag?: string;
  location?: {
    latitude: number;
    longitude: number;
    speed: number;
    course: number;
    status: string;
    port?: string;
    destination?: string;
  };
  image?: string;
}

export default function VesselURLTester() {
  const [vesselUrl, setVesselUrl] = useState("");
  const [result, setResult] = useState<VesselURLTestData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!vesselUrl.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/scrape-vessel-detail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: vesselUrl }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || "Failed to fetch vessel data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const exampleUrls = [
    {
      name: "HY EMERALD",
      url: "https://www.vesselfinder.com/vessels/details/9676307",
      description: "Container ship example",
    },
    {
      name: "Sample Vessel",
      url: "https://www.vesselfinder.com/vessels/details/9234567",
      description: "Another vessel example",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">VesselFinder URL Tester</h1>
        <p className="text-muted-foreground">Test scraping specific VesselFinder vessel detail pages</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Test VesselFinder URL</span>
          </CardTitle>
          <CardDescription>Enter a VesselFinder vessel detail URL to test the scraping functionality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vessel-url">VesselFinder URL</Label>
            <Input
              id="vessel-url"
              placeholder="https://www.vesselfinder.com/vessels/details/9676307"
              value={vesselUrl}
              onChange={(e) => setVesselUrl(e.target.value)}
            />
            <p className="text-muted-foreground text-sm">Enter the full URL from a VesselFinder vessel detail page</p>
          </div>

          <Button onClick={handleTest} disabled={loading || !vesselUrl.trim()} className="w-full">
            {loading ? "Testing..." : "Test Scraping"}
          </Button>

          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">Error: {error}</div>}
        </CardContent>
      </Card>

      {/* Example URLs */}
      <Card>
        <CardHeader>
          <CardTitle>Example URLs</CardTitle>
          <CardDescription>Click on these example URLs to test the scraping functionality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {exampleUrls.map((example, index) => (
            <div
              key={index}
              className="hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-lg border p-3"
              onClick={() => setVesselUrl(example.url)}
            >
              <div>
                <div className="font-medium">{example.name}</div>
                <div className="text-muted-foreground text-sm">{example.description}</div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  <ExternalLink className="mr-1 h-3 w-3" />
                  VesselFinder
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShipIcon className="h-5 w-5 text-blue-500" />
              <span>Scraped Vessel Data</span>
            </CardTitle>
            <CardDescription>Data extracted from VesselFinder</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Vessel Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Vessel Information</h3>
                <div className="space-y-2">
                  {result.name && (
                    <div>
                      <span className="font-medium">Name:</span> {result.name}
                    </div>
                  )}
                  {result.mmsi && (
                    <div>
                      <span className="font-medium">MMSI:</span> {result.mmsi}
                    </div>
                  )}
                  {result.imo && (
                    <div>
                      <span className="font-medium">IMO:</span> {result.imo}
                    </div>
                  )}
                  {result.type && (
                    <div>
                      <span className="font-medium">Type:</span> {result.type}
                    </div>
                  )}
                  {result.flag && (
                    <div>
                      <span className="font-medium">Flag:</span> {result.flag}
                    </div>
                  )}
                </div>
              </div>

              {/* Location Information */}
              {result.location && (
                <div className="space-y-4">
                  <h3 className="flex items-center space-x-2 text-lg font-semibold">
                    <MapPin className="h-5 w-5 text-green-500" />
                    <span>Location & Status</span>
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Coordinates:</span> {result.location.latitude.toFixed(4)}°,{" "}
                      {result.location.longitude.toFixed(4)}°
                    </div>
                    {result.location.port && (
                      <div>
                        <span className="font-medium">Port:</span> {result.location.port}
                      </div>
                    )}
                    {result.location.destination && (
                      <div>
                        <span className="font-medium">Destination:</span> {result.location.destination}
                      </div>
                    )}
                    <div className="flex items-center space-x-4">
                      <span>
                        <span className="font-medium">Speed:</span> {result.location.speed} knots
                      </span>
                      <span>
                        <span className="font-medium">Course:</span> {result.location.course}°
                      </span>
                    </div>
                    <div>
                      <Badge variant={result.location.status === "Underway" ? "default" : "secondary"}>
                        {result.location.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Vessel Image */}
            {result.image && (
              <div className="mt-6">
                <h3 className="mb-3 text-lg font-semibold">Vessel Image</h3>
                <div className="relative h-64 w-full overflow-hidden rounded-lg">
                  <img src={result.image} alt={result.name || "Vessel"} className="h-full w-full object-cover" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
