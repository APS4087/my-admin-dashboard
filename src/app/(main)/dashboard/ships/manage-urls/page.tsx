"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Ship as ShipIcon, ExternalLink, Save, Edit, X, Check } from "lucide-react";
import { Ship } from "@/types/ship";

interface ShipWithMetadata extends Ship {
  name?: string;
  type?: string;
  flag?: string;
  mmsi?: string;
  imo?: string;
}

export default function VesselURLManager() {
  const [ships, setShips] = useState<ShipWithMetadata[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // Mock data - replace with actual API calls to your backend
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setShips([
        {
          id: "1",
          ship_email: "captain.emerald@hyline.com",
          ship_password: "password123",
          app_password: "app123",
          is_active: true,
          vesselfinder_url: "https://www.vesselfinder.com/vessels/details/9676307",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          name: "HY EMERALD",
          type: "Container Ship",
          flag: "Panama",
          mmsi: "9676307",
          imo: "9676307",
        },
        {
          id: "2",
          ship_email: "captain.anderson@oceanfreight.com",
          ship_password: "password123",
          app_password: "app123",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          name: "MV ANDERSON STAR",
          type: "Bulk Carrier",
          flag: "Liberia",
          mmsi: "123456789",
          imo: "123456789",
        },
        {
          id: "3",
          ship_email: "captain.pacific@sealines.com",
          ship_password: "password123",
          app_password: "app123",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          name: "PACIFIC TRADER",
          type: "Cargo Ship",
          flag: "Marshall Islands",
          mmsi: "987654321",
          imo: "987654321",
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleEditStart = (shipId: string, currentUrl?: string) => {
    setEditingId(shipId);
    setEditingUrl(currentUrl || "");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingUrl("");
  };

  const handleSave = async (shipId: string) => {
    setSaving(shipId);

    try {
      // Here you would make an API call to update the ship
      // await updateShipVesselFinderUrl(shipId, editingUrl);

      // For now, update local state
      setShips((prev) =>
        prev.map((ship) => (ship.id === shipId ? { ...ship, vesselfinder_url: editingUrl || undefined } : ship)),
      );

      setEditingId(null);
      setEditingUrl("");
    } catch (error) {
      console.error("Failed to save URL:", error);
    } finally {
      setSaving(null);
    }
  };

  const validateVesselFinderUrl = (url: string): boolean => {
    if (!url) return true; // Empty is valid
    return url.match(/^https:\/\/www\.vesselfinder\.com\/vessels\/details\/\d+$/) !== null;
  };

  const isUrlValid = validateVesselFinderUrl(editingUrl);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading ships...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">VesselFinder URL Manager</h1>
        <p className="text-muted-foreground">Manage VesselFinder URLs for ship tracking and data scraping</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShipIcon className="h-5 w-5" />
            <span>Ship VesselFinder URLs</span>
          </CardTitle>
          <CardDescription>Add or edit VesselFinder vessel detail page URLs for each ship</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* URL Format Example */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="mb-2 font-medium">URL Format:</h4>
              <code className="text-sm">https://www.vesselfinder.com/vessels/details/[VESSEL_ID]</code>
              <p className="text-muted-foreground mt-2 text-sm">
                Example: https://www.vesselfinder.com/vessels/details/9676307
              </p>
            </div>

            {/* Ships Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ship Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>MMSI/IMO</TableHead>
                  <TableHead>VesselFinder URL</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ships.map((ship) => (
                  <TableRow key={ship.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{ship.name}</div>
                        <div className="text-muted-foreground text-sm">{ship.flag}</div>
                      </div>
                    </TableCell>
                    <TableCell>{ship.type}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>MMSI: {ship.mmsi}</div>
                        <div>IMO: {ship.imo}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {editingId === ship.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editingUrl}
                            onChange={(e) => setEditingUrl(e.target.value)}
                            placeholder="https://www.vesselfinder.com/vessels/details/..."
                            className={!isUrlValid ? "border-red-500" : ""}
                          />
                          {!isUrlValid && <p className="text-sm text-red-500">Please enter a valid VesselFinder URL</p>}
                        </div>
                      ) : (
                        <div>
                          {ship.vesselfinder_url ? (
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                <ExternalLink className="mr-1 h-3 w-3" />
                                Configured
                              </Badge>
                              <a
                                href={ship.vesselfinder_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-500 hover:underline"
                              >
                                View
                              </a>
                            </div>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              No URL
                            </Badge>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === ship.id ? (
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleSave(ship.id)}
                            disabled={!isUrlValid || saving === ship.id}
                          >
                            {saving === ship.id ? (
                              <>Saving...</>
                            ) : (
                              <>
                                <Check className="mr-1 h-4 w-4" />
                                Save
                              </>
                            )}
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleEditCancel} disabled={saving === ship.id}>
                            <X className="mr-1 h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditStart(ship.id, ship.vesselfinder_url)}
                        >
                          <Edit className="mr-1 h-4 w-4" />
                          Edit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Statistics */}
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{ships.length}</div>
                  <div className="text-muted-foreground text-sm">Total Ships</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {ships.filter((s) => s.vesselfinder_url).length}
                  </div>
                  <div className="text-muted-foreground text-sm">With URLs</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {ships.filter((s) => !s.vesselfinder_url).length}
                  </div>
                  <div className="text-muted-foreground text-sm">Missing URLs</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
