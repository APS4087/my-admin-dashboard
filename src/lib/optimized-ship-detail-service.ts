import { createClient } from "@/lib/supabase/client";
import type { Ship } from "@/types/ship";

import { optimizedShipService } from "./optimized-ship-service";
import { shipCache } from "./ship-cache-service";
import { shipTrackingService, type ShipLocation, type ShipImage, type ShipDetails } from "./ship-tracking-service";

export interface ShipDetailData {
  ship: Ship;
  location?: ShipLocation;
  image?: ShipImage;
  details?: ShipDetails;
  loading: {
    ship: boolean;
    tracking: boolean;
  };
  error?: string;
}

export class OptimizedShipDetailService {
  private supabase = createClient();

  /**
   * Get basic ship data immediately (from cache or DB)
   */
  async getShipBasic(shipId: string): Promise<Ship | null> {
    try {
      const { data, error } = await this.supabase.from("ships").select("*").eq("id", shipId).single();

      if (error) {
        throw new Error(`Failed to fetch ship: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error fetching basic ship data:", error);
      return null;
    }
  }

  /**
   * Get cached tracking data immediately if available
   */
  getCachedTrackingData(shipId: string): {
    location?: ShipLocation;
    imageUrl?: string;
    shipName?: string;
    trackingDetails?: ShipDetails;
  } | null {
    return shipCache.get(shipId);
  }

  /**
   * Load tracking data with caching
   */
  async loadTrackingData(ship: Ship): Promise<{
    location?: ShipLocation;
    image?: ShipImage;
    details?: ShipDetails;
  }> {
    try {
      // Check cache first
      const cached = shipCache.get(ship.id);
      if (cached) {
        return {
          location: cached.location,
          image: cached.imageUrl
            ? {
                url: cached.imageUrl,
                source: "VesselFinder",
                timestamp: new Date().toISOString(),
              }
            : undefined,
          details: cached.trackingDetails,
        };
      }

      // If no vesselfinder URL, return basic data
      if (!ship.vesselfinder_url) {
        const basicData = {
          details: {
            name: this.generateShipNameFromEmail(ship.ship_email),
          },
        };
        // Cache basic data
        shipCache.set(
          ship.id,
          {
            shipName: basicData.details.name,
          },
          10 * 60 * 1000,
        );
        return basicData;
      }

      // Fetch fresh tracking data
      const trackingData = await shipTrackingService.getAllShipDataFromURL(ship.vesselfinder_url);

      const result = {
        location: trackingData.location || undefined,
        image: trackingData.image || undefined,
        details: trackingData.details || {
          name: this.generateShipNameFromEmail(ship.ship_email),
        },
      };

      // Cache the result
      shipCache.set(ship.id, {
        location: result.location,
        imageUrl: result.image?.url,
        shipName: result.details?.name,
        trackingDetails: result.details,
      });

      return result;
    } catch (error) {
      console.error(`Error loading tracking data for ship ${ship.ship_email}:`, error);

      // Cache error state to avoid repeated failures
      const errorData = {
        details: {
          name: this.generateShipNameFromEmail(ship.ship_email),
        },
      };
      shipCache.set(
        ship.id,
        {
          shipName: errorData.details.name,
        },
        2 * 60 * 1000,
      ); // Cache errors for 2 minutes
      return errorData;
    }
  }

  /**
   * Get optimized ship detail data with progressive loading
   */
  async getOptimizedShipDetail(shipId: string): Promise<{
    basicData: Ship | null;
    getCachedData: () => any;
    loadTrackingData: () => Promise<any>;
  }> {
    // 1. Load basic ship data first (fast)
    const basicData = await this.getShipBasic(shipId);

    if (!basicData) {
      throw new Error("Ship not found");
    }

    // 2. Return basic data immediately with helper functions for progressive loading
    return {
      basicData,
      getCachedData: () => this.getCachedTrackingData(shipId),
      loadTrackingData: () => this.loadTrackingData(basicData),
    };
  }

  /**
   * Preload tracking data in background
   */
  async preloadTrackingData(ship: Ship): Promise<void> {
    // Only preload if not already cached
    if (!shipCache.has(ship.id)) {
      // Load in background without waiting
      this.loadTrackingData(ship).catch((error) => {
        console.error("Background preload failed:", error);
      });
    }
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
}

// Export singleton instance
export const optimizedShipDetailService = new OptimizedShipDetailService();
