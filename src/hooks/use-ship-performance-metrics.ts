import { useEffect, useState } from "react";
import { optimizedShipService } from "@/lib/optimized-ship-service";

interface PerformanceMetrics {
  cacheHitRate: number;
  averageLoadTime: number;
  totalShips: number;
  cachedShips: number;
  lastUpdated: Date;
}

export function useShipPerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    const updateMetrics = () => {
      const cacheStats = optimizedShipService.getCacheStats();

      setMetrics({
        cacheHitRate:
          cacheStats.memoryEntries > 0
            ? (cacheStats.memoryEntries / (cacheStats.memoryEntries + cacheStats.storageEntries)) * 100
            : 0,
        averageLoadTime: 0, // Would need to implement timing
        totalShips: cacheStats.memoryEntries + cacheStats.storageEntries,
        cachedShips: cacheStats.memoryEntries,
        lastUpdated: new Date(),
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return metrics;
}
