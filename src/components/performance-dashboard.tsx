import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Clock, Database, Trash2 } from "lucide-react";
import { useShipPerformanceMetrics } from "@/hooks/use-ship-performance-metrics";
import { optimizedShipService } from "@/lib/optimized-ship-service";

interface PerformanceDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PerformanceDashboard({ isOpen, onClose }: PerformanceDashboardProps) {
  const metrics = useShipPerformanceMetrics();
  const [clearing, setClearing] = useState(false);

  const handleClearCache = async () => {
    setClearing(true);
    optimizedShipService.clearAllCache();
    setTimeout(() => setClearing(false), 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Dashboard
              </CardTitle>
              <CardDescription>
                Monitor ship data loading performance and cache efficiency
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {metrics ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Database className="h-4 w-4" />
                    Cache Statistics
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Ships:</span>
                      <Badge variant="secondary">{metrics.totalShips}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Cached Ships:</span>
                      <Badge variant="default">{metrics.cachedShips}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Cache Hit Rate:</span>
                      <Badge 
                        variant={metrics.cacheHitRate > 70 ? "default" : "secondary"}
                      >
                        {metrics.cacheHitRate.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Performance
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm">Avg Load Time:</span>
                      <Badge variant="secondary">
                        {metrics.averageLoadTime > 0 ? `${metrics.averageLoadTime}ms` : 'N/A'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Last Updated:</span>
                      <span className="text-xs text-muted-foreground">
                        {metrics.lastUpdated.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Cache Management</h4>
                    <p className="text-sm text-muted-foreground">
                      Clear cache to force fresh data retrieval
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearCache}
                    disabled={clearing}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {clearing ? 'Clearing...' : 'Clear Cache'}
                  </Button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                <h5 className="font-medium mb-2">Performance Tips:</h5>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Higher cache hit rates improve loading speed</li>
                  <li>Data is cached for 5-10 minutes to balance freshness and performance</li>
                  <li>Error responses are cached for 2 minutes to prevent retry storms</li>
                  <li>Progressive loading shows ships immediately while tracking data loads</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading metrics...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
