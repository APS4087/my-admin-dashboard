import { createClient } from "@/lib/supabase/client";
import type { Ship, ShipFilters } from "@/types/ship";
import { shipTrackingService, type ShipLocation, type ShipDetails } from "./ship-tracking-service";
import { shipCache } from "./ship-cache-service";

export interface ShipWithTracking extends Ship {
  location?: ShipLocation;
  imageUrl?: string;
  shipName?: string;
  trackingDetails?: ShipDetails;
}

export class OptimizedShipService {
  private supabase = createClient();

  /**
   * Get basic ship data quickly without tracking information
   */
  async getShipsBasic(filters?: ShipFilters): Promise<Ship[]> {
    let query = this.supabase
      .from("ships")
      .select(
        "id, ship_email, ship_password, app_password, is_active, vesselfinder_url, created_at, updated_at, created_by, updated_by",
      )
      .order("created_at", { ascending: false })
      .limit(50); // Limit for faster initial load

    if (filters?.is_active !== undefined) {
      query = query.eq("is_active", filters.is_active);
    }

    if (filters?.search) {
      query = query.ilike("ship_email", `%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch ships: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get cached tracking data immediately if available
   */
  getCachedTrackingData(ship: Ship): {
    location?: ShipLocation;
    imageUrl?: string;
    shipName?: string;
    trackingDetails?: ShipDetails;
  } | null {
    return shipCache.get(ship.id);
  }

  /**
   * Get tracking data for a single ship with caching
   */
  async getShipTrackingData(ship: Ship): Promise<{
    location?: ShipLocation;
    imageUrl?: string;
    shipName?: string;
    trackingDetails?: ShipDetails;
  }> {
    // Check cache first
    const cached = shipCache.get(ship.id);
    if (cached) {
      return cached;
    }

    // If no vesselfinder URL, return basic data
    if (!ship.vesselfinder_url) {
      const basicData = {
        shipName: this.generateShipNameFromEmail(ship.ship_email),
      };
      shipCache.set(ship.id, basicData, 10 * 60 * 1000); // Cache for 10 minutes
      return basicData;
    }

    try {
      const trackingData = await shipTrackingService.getAllShipDataFromURL(ship.vesselfinder_url);

      const result = {
        location: trackingData.location || undefined,
        imageUrl: trackingData.image?.url,
        shipName: trackingData.details?.name || this.generateShipNameFromEmail(ship.ship_email),
        trackingDetails: trackingData.details || undefined,
      };

      // Cache the result
      shipCache.set(ship.id, result);
      return result;
    } catch (error) {
      console.error(`Error fetching tracking data for ship ${ship.ship_email}:`, error);

      // Cache error state to avoid repeated failures
      const errorData = {
        shipName: this.generateShipNameFromEmail(ship.ship_email),
      };
      shipCache.set(ship.id, errorData, 2 * 60 * 1000); // Cache errors for 2 minutes
      return errorData;
    }
  }

  /**
   * Preload tracking data for multiple ships in batches
   */
  async preloadShipTrackingData(ships: Ship[], batchSize: number = 3): Promise<void> {
    const shipsToLoad = ships.filter((ship) => !shipCache.has(ship.id));

    if (shipsToLoad.length === 0) return;

    // Process ships in batches to avoid overwhelming the server
    for (let i = 0; i < shipsToLoad.length; i += batchSize) {
      const batch = shipsToLoad.slice(i, i + batchSize);

      // Load batch concurrently but limit concurrency
      await Promise.allSettled(batch.map((ship) => this.getShipTrackingData(ship)));

      // Small delay between batches
      if (i + batchSize < shipsToLoad.length) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }
  }

  /**
   * Get ships with intelligent loading strategy
   */
  async getShipsWithOptimizedLoading(filters?: ShipFilters): Promise<{
    ships: Ship[];
    getCachedTrackingData: (ship: Ship) => any;
    loadTrackingData: (ship: Ship) => Promise<any>;
  }> {
    // 1. Load basic ship data first (fast)
    const ships = await this.getShipsBasic(filters);

    // 2. Return ships immediately with helper functions for progressive loading
    return {
      ships,
      getCachedTrackingData: (ship: Ship) => shipCache.get(ship.id),
      loadTrackingData: (ship: Ship) => this.getShipTrackingData(ship),
    };
  }

  /**
   * Generate ship name from email for consistency
   */
  private generateShipNameFromEmail(shipEmail: string): string {
    const identifier = shipEmail.toLowerCase();

    // Special cases for specific emails
    if (identifier.includes("hyemerald") || identifier.includes("emerald")) {
      return "HY EMERALD";
    }
    if (identifier.includes("hypartner") || identifier.includes("partner")) {
      return "HY PARTNER";
    }
    if (identifier.includes("hychampion") || identifier.includes("champion")) {
      return "HY CHAMPION";
    }
    if (identifier.includes("anderson")) {
      return "MV ANDERSON STAR";
    }
    if (identifier.includes("martinez")) {
      return "COSCO MARTINEZ";
    }
    if (identifier.includes("chen")) {
      return "EVERGREEN CHEN";
    }
    if (identifier.includes("johnson")) {
      return "MAERSK JOHNSON";
    }
    if (identifier.includes("patel")) {
      return "MSC PATEL";
    }

    // Default naming pattern
    const baseName = shipEmail
      .split("@")[0]
      .replace(/[^a-zA-Z]/g, "")
      .toUpperCase();
    return `MV ${baseName}`;
  }

  /**
   * Clear cache for a specific ship
   */
  clearShipCache(shipId: string): void {
    shipCache.delete(shipId);
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    shipCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return shipCache.getStats();
  }
}

// Export singleton instance
export const optimizedShipService = new OptimizedShipService();
