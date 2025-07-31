"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Ship as ShipIcon, MapPin, Navigation } from "lucide-react";

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
  const [results, setResults] = useState<TestVesselData[]>([]);
  const [loading, setLoading] = useState(false);
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
        setError(result.error || 'Failed to fetch vessel data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">VesselFinder Scraping Test</h1>
        <p className="text-muted-foreground">
          Test the vessel scraping API that extracts data from VesselFinder.com
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Vessels</CardTitle>
          <CardDescription>
            Enter a ship name, MMSI, or captain email to search for vessel information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
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

          {error && (
            <div className="text-red-600 text-sm">
              Error: {error}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <ShipIcon className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold text-lg">{vessel.name || 'Unknown Vessel'}</span>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      {vessel.mmsi && (
                        <div><span className="font-medium">MMSI:</span> {vessel.mmsi}</div>
                      )}
                      {vessel.imo && (
                        <div><span className="font-medium">IMO:</span> {vessel.imo}</div>
                      )}
                      {vessel.type && (
                        <div><span className="font-medium">Type:</span> {vessel.type}</div>
                      )}
                      {vessel.flag && (
                        <div><span className="font-medium">Flag:</span> {vessel.flag}</div>
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
                          <span className="font-medium">Coordinates:</span>{" "}
                          {vessel.location.latitude.toFixed(4)}°, {vessel.location.longitude.toFixed(4)}°
                        </div>
                        {vessel.location.port && (
                          <div><span className="font-medium">Port:</span> {vessel.location.port}</div>
                        )}
                        {vessel.location.destination && (
                          <div><span className="font-medium">Destination:</span> {vessel.location.destination}</div>
                        )}
                        <div className="flex items-center space-x-4">
                          <span><span className="font-medium">Speed:</span> {vessel.location.speed} knots</span>
                          <span><span className="font-medium">Course:</span> {vessel.location.course}°</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {vessel.location.status === "Underway" && (
                            <Navigation className="h-4 w-4 text-blue-500" />
                          )}
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
            <ShipIcon className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No vessels found for "{searchTerm}"</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
