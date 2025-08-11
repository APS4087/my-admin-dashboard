"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import {
  Plus,
  Search,
  Anchor,
  Key,
  Mail,
  Eye,
  EyeOff,
  Link,
  Unlink,
  AlertCircle,
  CheckCircle2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { shipAuthService } from "@/lib/ship-auth-service";
import { shipService } from "@/lib/ship-service";
import type { Ship } from "@/types/ship";
import type { ShipAuth, CreateShipAuthData } from "@/types/ship-auth";

interface ParsedShipAuth {
  ship_email: string;
  ship_password: string;
  app_password: string;
  error?: string;
}

export default function ShipAuthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [shipAuths, setShipAuths] = useState<ShipAuth[]>([]);
  const [ships, setShips] = useState<Ship[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});

  // Bulk import state
  const [bulkData, setBulkData] = useState("");
  const [parsedShipAuths, setParsedShipAuths] = useState<ParsedShipAuth[]>([]);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  // Single auth form state
  const [singleAuth, setSingleAuth] = useState<Partial<CreateShipAuthData>>({
    ship_email: "",
    ship_password: "",
    app_password: "",
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [authData, shipData] = await Promise.all([shipAuthService.getAllShipAuth(), shipService.getAllShips()]);
      setShipAuths(authData);
      setShips(shipData);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load ship authentication data");
    } finally {
      setLoading(false);
    }
  };

  const filteredShipAuths = shipAuths.filter((auth) =>
    auth.ship_email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const togglePasswordVisibility = (authId: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [authId]: !prev[authId],
    }));
  };

  const parseBulkData = () => {
    const lines = bulkData.trim().split("\n");
    const parsed: ParsedShipAuth[] = [];

    lines.forEach((line, index) => {
      const parts = line.split("\t");

      if (parts.length < 3) {
        parsed.push({
          ship_email: "",
          ship_password: "",
          app_password: "",
          error: `Invalid format - expected 3 columns (email, password, app_password), got ${parts.length}`,
        });
        return;
      }

      const [email, password, appPassword] = parts.map((p) => p.trim());

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        parsed.push({
          ship_email: email,
          ship_password: password,
          app_password: appPassword,
          error: "Invalid email format",
        });
        return;
      }

      parsed.push({
        ship_email: email,
        ship_password: password,
        app_password: appPassword,
      });
    });

    setParsedShipAuths(parsed);
  };

  const handleBulkImport = async () => {
    setLoading(true);
    setImportResults(null);

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const [index, auth] of parsedShipAuths.entries()) {
      if (auth.error) {
        failed++;
        errors.push(`Row ${index + 1}: ${auth.error}`);
        continue;
      }

      try {
        await shipAuthService.createShipAuth({
          ship_email: auth.ship_email,
          ship_password: auth.ship_password,
          app_password: auth.app_password,
          is_active: true,
        });
        success++;
      } catch (error) {
        failed++;
        errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    setImportResults({ success, failed, errors });
    setLoading(false);

    if (success > 0) {
      loadData(); // Refresh the list
      toast.success(`Successfully imported ${success} ship authentication records.`);
    }
    if (failed > 0) {
      toast.error(`Failed to import ${failed} records.`);
    }
  };

  const handleSingleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await shipAuthService.createShipAuth(singleAuth as CreateShipAuthData);
      toast.success("Ship authentication created successfully!");
      setSingleAuth({
        ship_email: "",
        ship_password: "",
        app_password: "",
        is_active: true,
      });
      loadData();
    } catch (error) {
      console.error("Failed to create ship authentication:", error);
      toast.error("Failed to create ship authentication");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkToShip = async (authId: string, shipId: string) => {
    try {
      await shipAuthService.linkToShip(authId, shipId);
      toast.success("Ship authentication linked successfully!");
      loadData();
    } catch (error) {
      console.error("Failed to link ship:", error);
      toast.error("Failed to link ship");
    }
  };

  const handleUnlinkFromShip = async (authId: string) => {
    try {
      await shipAuthService.unlinkFromShip(authId);
      toast.success("Ship authentication unlinked successfully!");
      loadData();
    } catch (error) {
      console.error("Failed to unlink ship:", error);
      toast.error("Failed to unlink ship");
    }
  };

  const handleToggleActive = async (authId: string, isActive: boolean) => {
    try {
      await shipAuthService.updateShipAuth(authId, { is_active: !isActive });
      toast.success(`Ship authentication ${!isActive ? "activated" : "deactivated"} successfully!`);
      loadData();
    } catch (error) {
      console.error("Failed to update ship authentication:", error);
      toast.error("Failed to update ship authentication");
    }
  };

  if (loading && shipAuths.length === 0) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                <div className="h-8 w-1/2 rounded bg-gray-200"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ship Authentication</h1>
          <p className="text-muted-foreground">Manage ship email accounts and authentication credentials</p>
        </div>
        <Button onClick={() => router.push("/dashboard/ships")}>Back to Ships</Button>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">Authentication List</TabsTrigger>
          <TabsTrigger value="add">Add Authentication</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Ship Authentication Records
                  </CardTitle>
                  <CardDescription>Manage ship email credentials and link them to ships</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                    <Input
                      placeholder="Search by email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64 pl-8"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredShipAuths.map((auth) => {
                  const linkedShip = ships.find((ship) => ship.id === auth.ship_id);
                  const isPasswordVisible = showPasswords[auth.id];

                  return (
                    <Card key={auth.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-blue-600" />
                                <span className="font-medium">{auth.ship_email}</span>
                              </div>
                              <Badge variant={auth.is_active ? "default" : "secondary"}>
                                {auth.is_active ? "Active" : "Inactive"}
                              </Badge>
                              {linkedShip && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Anchor className="h-3 w-3" />
                                  {linkedShip.ship_email.split("@")[0].toUpperCase()}
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                              <div>
                                <Label className="text-muted-foreground text-xs">Password</Label>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono">
                                    {isPasswordVisible ? auth.ship_password : "••••••••••••"}
                                  </span>
                                  <Button variant="ghost" size="sm" onClick={() => togglePasswordVisibility(auth.id)}>
                                    {isPasswordVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                  </Button>
                                </div>
                              </div>

                              <div>
                                <Label className="text-muted-foreground text-xs">App Password</Label>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono">
                                    {isPasswordVisible ? auth.app_password : "••••••••••••"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="ml-4 flex items-center gap-2">
                            {linkedShip ? (
                              <Button variant="outline" size="sm" onClick={() => handleUnlinkFromShip(auth.id)}>
                                <Unlink className="mr-1 h-3 w-3" />
                                Unlink
                              </Button>
                            ) : (
                              <select
                                className="rounded border px-3 py-1 text-sm"
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleLinkToShip(auth.id, e.target.value);
                                  }
                                }}
                                defaultValue=""
                              >
                                <option value="">Link to Ship</option>
                                {ships
                                  .filter((ship) => !shipAuths.some((a) => a.ship_id === ship.id))
                                  .map((ship) => (
                                    <option key={ship.id} value={ship.id}>
                                      {ship.ship_email.split("@")[0].toUpperCase()}
                                    </option>
                                  ))}
                              </select>
                            )}

                            <Button
                              variant={auth.is_active ? "destructive" : "default"}
                              size="sm"
                              onClick={() => handleToggleActive(auth.id, auth.is_active)}
                            >
                              {auth.is_active ? "Deactivate" : "Activate"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {filteredShipAuths.length === 0 && (
                  <div className="text-muted-foreground py-8 text-center">
                    <Key className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>No ship authentication records found.</p>
                    <p className="text-sm">Add authentication credentials to get started.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Ship Authentication
              </CardTitle>
              <CardDescription>Create new ship email authentication credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSingleAuthSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Label htmlFor="ship_email">Ship Email *</Label>
                    <Input
                      id="ship_email"
                      type="email"
                      required
                      value={singleAuth.ship_email}
                      onChange={(e) => setSingleAuth((prev) => ({ ...prev, ship_email: e.target.value }))}
                      placeholder="ship@company.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ship_password">Ship Password *</Label>
                    <Input
                      id="ship_password"
                      type="password"
                      required
                      value={singleAuth.ship_password}
                      onChange={(e) => setSingleAuth((prev) => ({ ...prev, ship_password: e.target.value }))}
                      placeholder="Main email password"
                    />
                  </div>

                  <div>
                    <Label htmlFor="app_password">App Password *</Label>
                    <Input
                      id="app_password"
                      type="text"
                      required
                      value={singleAuth.app_password}
                      onChange={(e) => setSingleAuth((prev) => ({ ...prev, app_password: e.target.value }))}
                      placeholder="Application-specific password"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setSingleAuth({
                        ship_email: "",
                        ship_password: "",
                        app_password: "",
                        is_active: true,
                      })
                    }
                  >
                    Clear
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Adding..." : "Add Authentication"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Bulk Import Ship Authentication
              </CardTitle>
              <CardDescription>Import multiple ship authentication records at once</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Format Example */}
              <div className="bg-muted/50 rounded-lg border p-4">
                <h4 className="mb-2 text-sm font-medium">Expected Format (Tab-separated):</h4>
                <div className="overflow-x-auto rounded bg-gray-50 p-3 font-mono text-xs">
                  hy.emerald@gmail.com Hyemerald@87204827 hhxrnbkuxcvieofr
                  <br />
                  hypartner02@gmail.com Hypartner@87204825 tpmk jmtv ypwz xhhw
                  <br />
                  hychampion03@gmail.com Hychampion@87204820 xhlv mhqa etdo yhsv
                </div>
                <p className="text-muted-foreground mt-2 text-xs">Format: Email (Tab) Password (Tab) App Password</p>
              </div>

              {/* Input Area */}
              <div className="space-y-3">
                <Label htmlFor="bulkData" className="text-base font-medium">
                  Ship Authentication Data
                </Label>
                <Textarea
                  id="bulkData"
                  placeholder="Paste your ship authentication data here..."
                  value={bulkData}
                  onChange={(e) => setBulkData(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-sm">
                    {bulkData.trim() ? `${bulkData.trim().split("\n").length} records detected` : "No data entered"}
                  </p>
                  {bulkData.trim() && (
                    <Button variant="outline" size="sm" onClick={() => setBulkData("")}>
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button onClick={parseBulkData} disabled={!bulkData.trim()} variant="outline" className="flex-1">
                  {parsedShipAuths.length > 0 ? "Re-parse Data" : "Parse Data"}
                </Button>
                {parsedShipAuths.length > 0 && (
                  <Button onClick={handleBulkImport} disabled={loading} className="flex-1">
                    {loading ? "Importing..." : `Import ${parsedShipAuths.length} Records`}
                  </Button>
                )}
              </div>

              {/* Preview */}
              {parsedShipAuths.length > 0 && (
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center text-lg">
                          <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />
                          Data Preview
                        </CardTitle>
                        <CardDescription>
                          {parsedShipAuths.filter((auth) => !auth.error).length} valid records,{" "}
                          {parsedShipAuths.filter((auth) => auth.error).length} with errors
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-[400px] overflow-y-auto rounded-lg border">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 sticky top-0">
                          <tr>
                            <th className="p-3 text-left font-medium">Email</th>
                            <th className="p-3 text-left font-medium">Password</th>
                            <th className="p-3 text-left font-medium">App Password</th>
                            <th className="p-3 text-left font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedShipAuths.map((auth, index) => (
                            <tr key={index} className={`border-b ${auth.error ? "bg-red-50" : ""}`}>
                              <td className="p-3">{auth.ship_email}</td>
                              <td className="p-3 font-mono text-xs">••••••••</td>
                              <td className="p-3 font-mono text-xs">••••••••</td>
                              <td className="p-3">
                                {auth.error ? (
                                  <div className="flex items-center text-red-600">
                                    <AlertCircle className="mr-1 h-4 w-4" />
                                    <span className="text-xs">Error</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center text-green-600">
                                    <CheckCircle2 className="mr-1 h-4 w-4" />
                                    <span className="text-xs">Valid</span>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Import Results */}
              {importResults && (
                <Alert
                  className={`${importResults.failed === 0 ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}`}
                >
                  <div className="flex items-start space-x-3">
                    {importResults.failed === 0 ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="mt-0.5 h-5 w-5 text-orange-600" />
                    )}
                    <div className="flex-1">
                      <AlertDescription>
                        <div className="space-y-3">
                          <div>
                            <h4
                              className={`font-semibold ${importResults.failed === 0 ? "text-green-800" : "text-orange-800"}`}
                            >
                              {importResults.failed === 0
                                ? "Import Completed Successfully!"
                                : "Import Completed with Issues"}
                            </h4>
                            <div className="mt-2 flex space-x-4 text-sm">
                              <span className="flex items-center rounded-full bg-green-100 px-2 py-1 text-green-800">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                {importResults.success} successful
                              </span>
                              {importResults.failed > 0 && (
                                <span className="flex items-center rounded-full bg-red-100 px-2 py-1 text-red-800">
                                  <AlertCircle className="mr-1 h-3 w-3" />
                                  {importResults.failed} failed
                                </span>
                              )}
                            </div>
                          </div>

                          {importResults.errors.length > 0 && (
                            <div className="rounded-lg border bg-white/80 p-3">
                              <p className="mb-2 text-sm font-medium">Error Details:</p>
                              <div className="max-h-32 space-y-1 overflow-y-auto">
                                {importResults.errors.map((error, index) => (
                                  <div key={index} className="rounded bg-red-50 px-2 py-1 text-sm text-red-700">
                                    {error}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
