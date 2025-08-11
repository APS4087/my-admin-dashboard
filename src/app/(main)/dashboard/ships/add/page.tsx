"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Upload, Plus, Ship, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { shipService } from "@/lib/ship-service";
import type { CreateShipData } from "@/types/ship";

interface ParsedShip {
  ship_email: string;
  ship_password: string;
  app_password: string;
  vesselfinder_url?: string;
  error?: string;
}

export default function AddShipPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [bulkData, setBulkData] = useState("");
  const [parsedShips, setParsedShips] = useState<ParsedShip[]>([]);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  // Form state for single ship
  const [formData, setFormData] = useState<CreateShipData>({
    ship_email: "",
    ship_password: "",
    app_password: "",
    vesselfinder_url: "",
    is_active: true,
  });

  const handleInputChange = (field: keyof CreateShipData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const parseBulkData = () => {
    const lines = bulkData.trim().split('\n');
    const parsed: ParsedShip[] = [];

    lines.forEach((line, index) => {
      const parts = line.split('\t');
      
      if (parts.length < 3) {
        parsed.push({
          ship_email: "",
          ship_password: "",
          app_password: "",
          error: `Invalid format - expected 3-4 columns, got ${parts.length}`
        });
        return;
      }

      // Parse format: email	password	app_password	[vesselfinder_url]
      const [email, password, appPassword, vesselfinderUrl] = parts;

      parsed.push({
        ship_email: email?.trim() || "",
        ship_password: password?.trim() || "",
        app_password: appPassword?.trim() || "",
        vesselfinder_url: vesselfinderUrl?.trim() || undefined,
      });
    });

    setParsedShips(parsed);
  };

  const handleSingleShipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await shipService.createShip(formData);
      toast.success("Ship added successfully!");
      router.push("/dashboard/ships");
    } catch (error) {
      console.error("Error adding ship:", error);
      toast.error("Failed to add ship. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkImport = async () => {
    setLoading(true);
    setImportResults(null);
    
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const ship of parsedShips) {
      if (ship.error) {
        failed++;
        errors.push(`Row: ${ship.error}`);
        continue;
      }

      if (!ship.ship_email || !ship.ship_password || !ship.app_password) {
        failed++;
        errors.push(`Row: Email, password, and app password are required`);
        continue;
      }

      try {
        await shipService.createShip({
          ship_email: ship.ship_email,
          ship_password: ship.ship_password,
          app_password: ship.app_password,
          vesselfinder_url: ship.vesselfinder_url,
          is_active: true,
        });
        success++;
      } catch (error) {
        failed++;
        errors.push(`${ship.ship_email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    setImportResults({ success, failed, errors });
    setLoading(false);

    if (success > 0 && failed === 0) {
      setTimeout(() => {
        router.push('/dashboard/ships');
      }, 2000);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Ships</h1>
        <p className="text-muted-foreground">
          Add new ship authentication credentials individually or import multiple at once
        </p>
      </div>

      <Tabs defaultValue="bulk" className="space-y-6">
        <TabsList>
          <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
          <TabsTrigger value="single">Single Ship</TabsTrigger>
        </TabsList>

        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Bulk Import Ship Credentials
              </CardTitle>
              <CardDescription>
                Copy and paste ship authentication data in tab-separated format.
                VesselFinder URL is optional but recommended for enhanced tracking.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Format Example */}
              <div className="bg-muted/50 border rounded-lg p-4">
                <h4 className="font-medium mb-2 text-sm">Expected Format:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border px-2 py-1 text-left">Ship Email</th>
                        <th className="border px-2 py-1 text-left">Ship Password</th>
                        <th className="border px-2 py-1 text-left">App Password</th>
                        <th className="border px-2 py-1 text-left">VesselFinder URL (Optional)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="text-muted-foreground">
                        <td className="border px-2 py-1">hyemerald01@gmail.com</td>
                        <td className="border px-2 py-1">Hyemerald@87204827</td>
                        <td className="border px-2 py-1">hhxrnbkuxcvieofr</td>
                        <td className="border px-2 py-1">https://www.vesselfinder.com/vessels/details/9676307</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Tip: Copy data directly from Excel, Google Sheets, or any spreadsheet application. VesselFinder URL enhances tracking accuracy.
                </p>
              </div>

              {/* Input Area */}
              <div className="space-y-3">
                <Label htmlFor="bulkData" className="text-base font-medium">Ship Authentication Data</Label>
                <Textarea
                  id="bulkData"
                  placeholder="Paste your ship authentication data here... (Ctrl+V)"
                  value={bulkData}
                  onChange={(e) => setBulkData(e.target.value)}
                  className="min-h-[300px] font-mono text-sm resize-none"
                />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {bulkData.trim() ? `${bulkData.trim().split('\n').length} rows detected` : 'No data entered'}
                  </p>
                  {bulkData.trim() && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setBulkData('')}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button 
                  onClick={parseBulkData}
                  disabled={!bulkData.trim()}
                  variant="outline"
                  className="flex-1"
                >
                  {parsedShips.length > 0 ? 'Re-parse Data' : 'Parse Data'}
                </Button>
                {parsedShips.length > 0 && (
                  <Button
                    onClick={handleBulkImport}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Importing...
                      </>
                    ) : (
                      `Import ${parsedShips.length} Ships`
                    )}
                  </Button>
                )}
              </div>

              {parsedShips.length > 0 && (
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center">
                          <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />
                          Data Preview
                        </CardTitle>
                        <CardDescription>
                          {parsedShips.filter(ship => !ship.error).length} valid ships, {parsedShips.filter(ship => ship.error).length} with errors
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        {parsedShips.filter(ship => ship.error).length > 0 && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                            {parsedShips.filter(ship => ship.error).length} Errors
                          </span>
                        )}
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {parsedShips.filter(ship => !ship.error).length} Ready
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-[500px] overflow-y-auto border rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 sticky top-0">
                          <tr>
                            <th className="text-left p-3 font-medium">Email</th>
                            <th className="text-left p-3 font-medium">Password</th>
                            <th className="text-left p-3 font-medium">App Password</th>
                            <th className="text-left p-3 font-medium">VesselFinder URL</th>
                            <th className="text-left p-3 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedShips.map((ship, index) => (
                            <tr key={index} className={`border-b transition-colors hover:bg-muted/50 ${ship.error ? 'bg-red-50' : ''}`}>
                              <td className="p-3">{ship.ship_email || <span className="text-muted-foreground italic">No email</span>}</td>
                              <td className="p-3">{ship.ship_password ? '***' : <span className="text-muted-foreground italic">No password</span>}</td>
                              <td className="p-3">{ship.app_password ? '***' : <span className="text-muted-foreground italic">No app password</span>}</td>
                              <td className="p-3">
                                {ship.vesselfinder_url ? (
                                  <span className="text-xs text-blue-600 truncate max-w-[200px] block" title={ship.vesselfinder_url}>
                                    {ship.vesselfinder_url}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground italic text-xs">Optional</span>
                                )}
                              </td>
                              <td className="p-3">
                                {ship.error ? (
                                  <div className="flex items-center">
                                    <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                                    <span className="text-red-600 text-xs font-medium">Error</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                                    <span className="text-green-600 text-xs font-medium">Valid</span>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Error Details */}
                    {parsedShips.some(ship => ship.error) && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-medium text-red-800 mb-2 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Data Issues Found
                        </h4>
                        <div className="space-y-1 text-sm text-red-700">
                          {parsedShips
                            .filter(ship => ship.error)
                            .map((ship, index) => (
                              <div key={index}>{ship.error}</div>
                            ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {importResults && (
                <Alert className={`${importResults.failed === 0 ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"} border-l-4 ${importResults.failed === 0 ? "border-l-green-500" : "border-l-orange-500"}`}>
                  <div className="flex items-start space-x-3">
                    {importResults.failed === 0 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <AlertDescription>
                        <div className="space-y-3">
                          <div>
                            <h4 className={`font-semibold ${importResults.failed === 0 ? "text-green-800" : "text-orange-800"}`}>
                              {importResults.failed === 0 ? "Import Completed Successfully!" : "Import Completed with Issues"}
                            </h4>
                            <div className="mt-2 flex space-x-4 text-sm">
                              <span className="flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {importResults.success} successful
                              </span>
                              {importResults.failed > 0 && (
                                <span className="flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  {importResults.failed} failed
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {importResults.errors.length > 0 && (
                            <div className="bg-white/80 border rounded-lg p-3">
                              <p className="font-medium text-sm mb-2">Error Details:</p>
                              <div className="max-h-32 overflow-y-auto space-y-1">
                                {importResults.errors.map((error, index) => (
                                  <div key={index} className="text-sm text-red-700 bg-red-50 px-2 py-1 rounded">
                                    {error}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {importResults.success > 0 && importResults.failed === 0 && (
                            <p className="text-sm text-green-700">
                              🎉 All ships have been successfully added! Redirecting to ships list...
                            </p>
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

        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                Add Single Ship
              </CardTitle>
              <CardDescription>
                Enter ship authentication credentials manually
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSingleShipSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="ship_email">Ship Email *</Label>
                    <Input
                      id="ship_email"
                      type="email"
                      required
                      value={formData.ship_email}
                      onChange={(e) => handleInputChange("ship_email", e.target.value)}
                      placeholder="hyemerald01@gmail.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ship_password">Ship Password *</Label>
                    <Input
                      id="ship_password"
                      type="password"
                      required
                      value={formData.ship_password}
                      onChange={(e) => handleInputChange("ship_password", e.target.value)}
                      placeholder="Hyemerald@87204827"
                    />
                  </div>
                  <div>
                    <Label htmlFor="app_password">App Password *</Label>
                    <Input
                      id="app_password"
                      type="password"
                      required
                      value={formData.app_password}
                      onChange={(e) => handleInputChange("app_password", e.target.value)}
                      placeholder="hhxrnbkuxcvieofr"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vesselfinder_url">VesselFinder URL (Optional)</Label>
                    <Input
                      id="vesselfinder_url"
                      type="url"
                      value={formData.vesselfinder_url || ""}
                      onChange={(e) => handleInputChange("vesselfinder_url", e.target.value)}
                      placeholder="https://www.vesselfinder.com/vessels/details/9676307"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Optional: URL to the ship's VesselFinder page for enhanced tracking data
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Adding..." : "Add Ship"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
