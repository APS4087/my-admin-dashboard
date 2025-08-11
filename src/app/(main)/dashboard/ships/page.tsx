"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, RefreshCw, Ship as ShipIcon, BarChart3, ExternalLink } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { optimizedShipService } from "@/lib/optimized-ship-service";
import { shipService } from "@/lib/ship-service";
import { ShipRow } from "@/components/ship-row";
import { PerformanceDashboard } from "@/components/performance-dashboard";
import type { Ship } from "@/types/ship";
import Link from "next/link";
import { useDebounce } from "@/hooks/use-debounce";

export default function ShipsPage() {
  const router = useRouter();
  const [ships, setShips] = useState<Ship[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Debounce search to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Track when component first mounts
  useEffect(() => {
    setMounted(true);
    console.log("Ships page mounted");
    return () => {
      console.log("Ships page unmounted");
    };
  }, []);

  // Fast initial load - get ships without tracking data first
  const loadShipsBasic = useCallback(
    async (search?: string, forceRefresh = false) => {
      try {
        console.log("loadShipsBasic called", { search, forceRefresh, initialLoading, loading });
        setError(null);

        // Only show loading for the first time or explicit refresh
        if (forceRefresh || initialLoading) {
          setLoading(true);
        }

        // First, ensure existing ships have VesselFinder URLs
        await shipService.ensureShipsHaveVesselFinderUrls();

        // Get basic ship data quickly
        const basicShips = await optimizedShipService.getShipsBasic({
          search: search || undefined,
        });

        console.log("Ships loaded:", basicShips.length);

        // If no ships exist, create mock ships for demonstration
        if (basicShips.length === 0) {
          const mockShips = createMockShipsIfEmpty();
          setShips(mockShips);
        } else {
          setShips(basicShips);
        }
      } catch (error) {
        console.error("Failed to fetch ships:", error);
        setError("Failed to load ship data. Please try again.");
      } finally {
        setInitialLoading(false);
        setLoading(false);
        console.log("loadShipsBasic completed");
      }
    },
    [initialLoading],
  );

  // Create mock ships if database is empty
  const createMockShipsIfEmpty = (): Ship[] => {
    const mockShipData = [
      {
        email: "hyemerald01@gmail.com",
        url: "https://www.vesselfinder.com/vessels/details/9676307", // HY EMERALD
      },
      {
        email: "hypartner02@gmail.com",
        url: "https://www.vesselfinder.com/vessels/details/9234567", // Sample vessel
      },
      {
        email: "hychampion03@gmail.com",
        url: "https://www.vesselfinder.com/vessels/details/9345678", // Sample vessel
      },
      {
        email: "captain.johnson@atlanticlines.com",
        url: "https://www.vesselfinder.com/vessels/details/9456789",
      },
      {
        email: "navigator.patel@asiancargo.com",
        url: "https://www.vesselfinder.com/vessels/details/9567890",
      },
    ];

    return mockShipData.map((shipData, index) => ({
      id: `mock-${index + 1}`,
      ship_email: shipData.email,
      ship_password: "encrypted_password",
      app_password: "app_specific_password",
      is_active: Math.random() > 0.2,
      vesselfinder_url: shipData.url,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }));
  };

  // Initial load
  useEffect(() => {
    // Reset loading states when component mounts/remounts
    if (initialLoading && mounted) {
      console.log("Triggering initial load");
      loadShipsBasic();
    }
  }, [loadShipsBasic, initialLoading, mounted]);

  // Search effect with debounced term
  useEffect(() => {
    if (debouncedSearchTerm !== undefined && !initialLoading) {
      loadShipsBasic(debouncedSearchTerm, false);
    }
  }, [debouncedSearchTerm, loadShipsBasic, initialLoading]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this ship?")) {
      try {
        await shipService.deleteShip(id);
        // Optimistic update - remove from local state immediately
        setShips(ships.filter((ship) => ship.id !== id));
        // Clear cache for deleted ship
        optimizedShipService.clearShipCache(id);
      } catch (error) {
        console.error("Failed to delete ship:", error);
        setError("Failed to delete ship. Please try again.");
        // Refetch to ensure data consistency
        loadShipsBasic(debouncedSearchTerm, true);
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Clear cache to force fresh data
    optimizedShipService.clearAllCache();
    await loadShipsBasic(debouncedSearchTerm, true);
    setRefreshing(false);
  };

  // Show error state
  if (error && !loading) {
    return (
      <div className="space-y-6">
        <div className="py-8 text-center">
          <div className="mb-4 text-red-600">{error}</div>
          <Button onClick={() => loadShipsBasic(debouncedSearchTerm, true)}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Ship Tracking</h1>
            <p className="text-muted-foreground">Monitor ship locations and track maritime vessels in real-time</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/ships/add">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Ship
              </Button>
            </Link>
            <Button variant="outline" asChild>
              <a href="https://www.vesselfinder.com" target="_blank" rel="noopener noreferrer">
                <ShipIcon className="mr-2 h-4 w-4" />
                VesselFinder
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Ship Fleet</CardTitle>
                <CardDescription>Loading ship data...</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
              <span className="text-muted-foreground ml-2">Loading ships...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ship Tracking</h1>
          <p className="text-muted-foreground">Monitor ship locations and track maritime vessels in real-time</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/ships/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Ship
            </Button>
          </Link>
          <Button variant="outline" asChild>
            <a href="https://www.vesselfinder.com" target="_blank" rel="noopener noreferrer">
              <ShipIcon className="mr-2 h-4 w-4" />
              VesselFinder
            </a>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Ship Fleet</CardTitle>
              <CardDescription>Real-time tracking with progressive loading for optimal performance</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-2">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                <Input
                  placeholder="Search by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 sm:w-[300px] lg:w-[350px] xl:w-[400px]"
                  disabled={loading}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                  {refreshing ? "Refreshing..." : "Refresh"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowPerformanceDashboard(true)}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Performance
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Ship</TableHead>
                  <TableHead className="min-w-[180px]">Location</TableHead>
                  <TableHead className="min-w-[100px]">Speed</TableHead>
                  <TableHead className="min-w-[150px]">Last Update</TableHead>
                  <TableHead className="min-w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ships.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center">
                      <div className="text-muted-foreground">
                        <ShipIcon className="text-muted-foreground/50 mx-auto mb-4 h-12 w-12" />
                        No ships found.{" "}
                        <Link href="/dashboard/ships/add">
                          <Button variant="link" className="p-0">
                            Add your first ship
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  ships.map((ship, index) => (
                    <ShipRow key={ship.id} ship={ship} onDelete={handleDelete} index={index} />
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {loading && ships.length > 0 && (
            <div className="flex items-center justify-center border-t py-4">
              <div className="border-primary h-4 w-4 animate-spin rounded-full border-b-2"></div>
              <span className="text-muted-foreground ml-2 text-sm">Updating...</span>
            </div>
          )}
        </CardContent>
      </Card>

      <PerformanceDashboard isOpen={showPerformanceDashboard} onClose={() => setShowPerformanceDashboard(false)} />
    </div>
  );
}
