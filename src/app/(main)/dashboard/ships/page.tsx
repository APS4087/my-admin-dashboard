"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Ship as ShipIcon, MapPin, Navigation, Anchor } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger, 
} from "@/components/ui/dropdown-menu";
import { shipService } from "@/lib/ship-service";
import { shipTrackingService, type ShipLocation } from "@/lib/ship-tracking-service";
import type { Ship } from "@/types/ship";
import Link from "next/link";
import { useDebounce } from "@/hooks/use-debounce";
import Image from "next/image";

export default function ShipsPage() {
  const [ships, setShips] = useState<Ship[]>([]);
  const [shipsWithTracking, setShipsWithTracking] = useState<Array<Ship & { location?: ShipLocation; imageUrl?: string; shipName?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  // Debounce search to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchShips = useCallback(async (search?: string) => {
    try {
      setError(null);
      let data = await shipService.getAllShips({
        search: search || undefined,
      });
      
      // If no ships exist, create mock ships for demonstration
      if (data.length === 0) {
        const mockShips = createMockShipsIfEmpty();
        data = mockShips;
        setShips(mockShips);
      } else {
        setShips(data);
      }
      
      // Fetch tracking data for each ship using their VesselFinder URL
      const shipsWithTrackingData = await Promise.all(
        data.map(async (ship) => {
          try {
            // Only fetch tracking data if the ship has a VesselFinder URL
            if (ship.vesselfinder_url) {
              const [location, image, details] = await Promise.all([
                shipTrackingService.getShipLocationFromURL(ship.vesselfinder_url),
                shipTrackingService.getShipImageFromURL(ship.vesselfinder_url),
                shipTrackingService.getShipDetailsFromURL(ship.vesselfinder_url)
              ]);
              
              return {
                ...ship,
                location: location || undefined,
                imageUrl: image?.url,
                shipName: details?.name || ship.ship_email.split('@')[0].toUpperCase()
              };
            } else {
              // Ship has no VesselFinder URL, return without tracking data
              return {
                ...ship,
                location: undefined,
                imageUrl: undefined,
                shipName: ship.ship_email.split('@')[0].toUpperCase()
              };
            }
          } catch (error) {
            console.error(`Error fetching tracking data for ship ${ship.ship_email}:`, error);
            return {
              ...ship,
              location: undefined,
              imageUrl: undefined,
              shipName: ship.ship_email.split('@')[0].toUpperCase()
            };
          }
        })
      );
      
      setShipsWithTracking(shipsWithTrackingData);
    } catch (error) {
      console.error("Failed to fetch ships:", error);
      setError("Failed to load ship data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Create mock ships if database is empty
  const createMockShipsIfEmpty = (): Ship[] => {
    const mockShipData = [
      {
        email: "captain.anderson@oceanfreight.com",
        url: "https://www.vesselfinder.com/vessels/details/9676307" // HY EMERALD
      },
      {
        email: "skipper.martinez@globalmarine.com",
        url: "https://www.vesselfinder.com/vessels/details/9234567"
      },
      {
        email: "commander.chen@pacificships.com",
        url: "https://www.vesselfinder.com/vessels/details/9345678"
      },
      {
        email: "captain.johnson@atlanticlines.com",
        url: "https://www.vesselfinder.com/vessels/details/9456789"
      },
      {
        email: "navigator.patel@asiancargo.com",
        url: "https://www.vesselfinder.com/vessels/details/9567890"
      }
    ];
    
    return mockShipData.map((shipData, index) => ({
      id: `mock-${index + 1}`,
      ship_email: shipData.email,
      ship_password: "encrypted_password",
      app_password: "app_specific_password",
      is_active: Math.random() > 0.2,
      vesselfinder_url: shipData.url,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }));
  };

  // Initial load
  useEffect(() => {
    fetchShips();
  }, [fetchShips]);

  // Search effect with debounced term
  useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      setLoading(true);
      fetchShips(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, fetchShips]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this ship?")) {
      try {
        await shipService.deleteShip(id);
        // Optimistic update - remove from local state immediately
        setShips(ships.filter(ship => ship.id !== id));
        setShipsWithTracking(shipsWithTracking.filter(ship => ship.id !== id));
      } catch (error) {
        console.error("Failed to delete ship:", error);
        setError("Failed to delete ship. Please try again.");
        // Refetch to ensure data consistency
        fetchShips(debouncedSearchTerm);
      }
    }
  };

  // Show error state
  if (error && !loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={() => fetchShips(debouncedSearchTerm)}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Ship Tracking</h1>
            <p className="text-muted-foreground">
              Monitor ship locations and track maritime vessels in real-time
            </p>
          </div>
          <Link href="/dashboard/ships/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Ship
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Ship Fleet</CardTitle>
                <CardDescription>
                  Real-time tracking and monitoring of maritime vessels
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by ship name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-[300px]"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ship Email</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>App Password</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div></TableCell>
                    <TableCell><div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div></TableCell>
                    <TableCell><div className="h-8 bg-gray-200 rounded animate-pulse w-8 ml-auto"></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ship Tracking</h1>
          <p className="text-muted-foreground">
            Monitor ship locations and track maritime vessels in real-time
          </p>
        </div>
        <Link href="/dashboard/ships/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Ship
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ship Fleet</CardTitle>
              <CardDescription>
                URL-based tracking using individual VesselFinder pages for accurate data
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Link href="/dashboard/ships/manage-urls">
                <Button variant="outline" size="sm">
                  Manage URLs
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ship</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Speed</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipsWithTracking.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-muted-foreground">
                      <ShipIcon className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
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
                shipsWithTracking.map((ship) => (
                  <TableRow key={ship.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {ship.imageUrl && (
                          <div className="h-10 w-16 relative rounded overflow-hidden">
                            <Image
                              src={ship.imageUrl}
                              alt={ship.shipName || "Ship"}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">
                            {ship.shipName || ship.ship_email.split('@')[0]}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {ship.ship_email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {ship.location ? (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {ship.location.port || `${ship.location.latitude.toFixed(4)}°, ${ship.location.longitude.toFixed(4)}°`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {ship.location?.status === "Underway" && (
                          <Navigation className="h-4 w-4 text-blue-500" />
                        )}
                        {ship.location?.status === "At anchor" && (
                          <Anchor className="h-4 w-4 text-yellow-500" />
                        )}
                        {ship.location?.status === "Moored" && (
                          <ShipIcon className="h-4 w-4 text-green-500" />
                        )}
                        <Badge
                          variant={ship.is_active ? "default" : "secondary"}
                        >
                          {ship.location?.status || (ship.is_active ? "Active" : "Inactive")}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {ship.location ? (
                        <span>{ship.location.speed.toFixed(1)} knots</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {ship.location?.lastUpdate 
                        ? new Date(ship.location.lastUpdate).toLocaleString()
                        : new Date(ship.updated_at).toLocaleDateString()
                      }
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
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(ship.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
