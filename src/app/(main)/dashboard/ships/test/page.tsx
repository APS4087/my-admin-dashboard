"use client";

import { useState } from "react";

import { Search, Ship as ShipIcon, MapPin, Navigation } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface TestVesselData {
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
}

export default function VesselScrapingTest() {
  const [searchTerm, setSearchTerm] = useState("");
  const [vesselfinderUrl, setVesselfinderUrl] = useState("https://www.vesselfinder.com/vessels/details/9676307");
  const [results, setResults] = useState<TestVesselData[]>([]);
  const [urlResult, setUrlResult] = useState<TestVesselData | null>(null);
  const [loading, setLoading] = useState(false);
  const [urlLoading, setUrlLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/scrape-vessel?query=${encodeURIComponent(searchTerm)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setResults(result.data || []);
      } else {
        setError(result.error || "Failed to fetch vessel data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleUrlTest = async () => {
    if (!vesselfinderUrl.trim()) return;

    setUrlLoading(true);
    setError(null);
    setUrlResult(null);

    try {
      const response = await fetch("/api/test-scraping", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: vesselfinderUrl }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.result?.data) {
        setUrlResult(result.result.data);
      } else {
        setError(result.error || "Failed to scrape VesselFinder data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setUrlLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">VesselFinder Scraping Test</h1>
        <p className="text-muted-foreground">Test the vessel scraping API that extracts data from VesselFinder.com</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Vessels</CardTitle>
          <CardDescription>Enter a ship name, MMSI, or captain email to search for vessel information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input
                placeholder="Search for ships (e.g., 'captain.anderson', 'MAERSK', '123456789')..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-8"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading || !searchTerm.trim()}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>

          {error && <div className="text-sm text-red-600">Error: {error}</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test VesselFinder URL Scraping</CardTitle>
          <CardDescription>Test scraping vessel data directly from a VesselFinder.com URL</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Input
                placeholder="VesselFinder URL (e.g., https://www.vesselfinder.com/vessels/details/9676307)"
                value={vesselfinderUrl}
                onChange={(e) => setVesselfinderUrl(e.target.value)}
                className="pr-2"
              />
            </div>
            <Button onClick={handleUrlTest} disabled={urlLoading || !vesselfinderUrl.trim()}>
              {urlLoading ? "Scraping..." : "Test URL"}
            </Button>
          </div>

          {error && <div className="text-sm text-red-600">Error: {error}</div>}

          {urlResult && (
            <div className="mt-4">
              <h3 className="mb-3 text-lg font-semibold">Scraped Data from VesselFinder</h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <ShipIcon className="h-5 w-5 text-blue-500" />
                        <span className="text-lg font-semibold">{urlResult.name || "Unknown Vessel"}</span>
                      </div>

                      <div className="space-y-1 text-sm">
                        {urlResult.mmsi && (
                          <div>
                            <span className="font-medium">MMSI:</span> {urlResult.mmsi}
                          </div>
                        )}
                        {urlResult.imo && (
                          <div>
                            <span className="font-medium">IMO:</span> {urlResult.imo}
                          </div>
                        )}
                        {urlResult.type && (
                          <div>
                            <span className="font-medium">Type:</span> {urlResult.type}
                          </div>
                        )}
                        {urlResult.flag && (
                          <div>
                            <span className="font-medium">Flag:</span> {urlResult.flag}
                          </div>
                        )}
                      </div>
                    </div>

                    {urlResult.location && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-5 w-5 text-green-500" />
                          <span className="font-semibold">Location</span>
                        </div>

                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="font-medium">Coordinates:</span> {urlResult.location.latitude.toFixed(4)}°,{" "}
                            {urlResult.location.longitude.toFixed(4)}°
                          </div>
                          {urlResult.location.port && (
                            <div>
                              <span className="font-medium">Port:</span> {urlResult.location.port}
                            </div>
                          )}
                          {urlResult.location.destination && (
                            <div>
                              <span className="font-medium">Destination:</span> {urlResult.location.destination}
                            </div>
                          )}
                          <div className="flex items-center space-x-4">
                            <span>
                              <span className="font-medium">Speed:</span> {urlResult.location.speed} knots
                            </span>
                            <span>
                              <span className="font-medium">Course:</span> {urlResult.location.course}°
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {urlResult.location.status === "Underway" && (
                              <Navigation className="h-4 w-4 text-blue-500" />
                            )}
                            <Badge variant={urlResult.location.status === "Underway" ? "default" : "secondary"}>
                              {urlResult.location.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Search Results ({results.length})</h2>
          {results.map((vessel, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <ShipIcon className="h-5 w-5 text-blue-500" />
                      <span className="text-lg font-semibold">{vessel.name || "Unknown Vessel"}</span>
                    </div>

                    <div className="space-y-1 text-sm">
                      {vessel.mmsi && (
                        <div>
                          <span className="font-medium">MMSI:</span> {vessel.mmsi}
                        </div>
                      )}
                      {vessel.imo && (
                        <div>
                          <span className="font-medium">IMO:</span> {vessel.imo}
                        </div>
                      )}
                      {vessel.type && (
                        <div>
                          <span className="font-medium">Type:</span> {vessel.type}
                        </div>
                      )}
                      {vessel.flag && (
                        <div>
                          <span className="font-medium">Flag:</span> {vessel.flag}
                        </div>
                      )}
                    </div>
                  </div>

                  {vessel.location && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-green-500" />
                        <span className="font-semibold">Location</span>
                      </div>

                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="font-medium">Coordinates:</span> {vessel.location.latitude.toFixed(4)}°,{" "}
                          {vessel.location.longitude.toFixed(4)}°
                        </div>
                        {vessel.location.port && (
                          <div>
                            <span className="font-medium">Port:</span> {vessel.location.port}
                          </div>
                        )}
                        {vessel.location.destination && (
                          <div>
                            <span className="font-medium">Destination:</span> {vessel.location.destination}
                          </div>
                        )}
                        <div className="flex items-center space-x-4">
                          <span>
                            <span className="font-medium">Speed:</span> {vessel.location.speed} knots
                          </span>
                          <span>
                            <span className="font-medium">Course:</span> {vessel.location.course}°
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {vessel.location.status === "Underway" && <Navigation className="h-4 w-4 text-blue-500" />}
                          <Badge variant={vessel.location.status === "Underway" ? "default" : "secondary"}>
                            {vessel.location.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && searchTerm && !error && (
        <Card>
          <CardContent className="pt-6 text-center">
            <ShipIcon className="text-muted-foreground/50 mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground">No vessels found for "{searchTerm}"</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
