import { createClient } from "@/lib/supabase/client";
import type { Ship, CreateShipData, UpdateShipData, ShipFilters } from "@/types/ship";

import { shipTrackingService, type ShipLocation, type ShipImage, type ShipDetails } from "./ship-tracking-service";

export interface ShipWithTracking extends Ship {
  location?: ShipLocation;
  imageUrl?: string;
  shipName?: string;
  trackingDetails?: ShipDetails;
}

export class ShipService {
  private supabase = createClient();

  async getAllShips(filters?: ShipFilters): Promise<Ship[]> {
    // Select only needed fields for better performance
    let query = this.supabase
      .from("ships")
      .select(
        "id, ship_email, ship_password, app_password, is_active, vesselfinder_url, created_at, updated_at, created_by, updated_by",
      )
      .order("created_at", { ascending: false });

    if (filters?.is_active !== undefined) {
      query = query.eq("is_active", filters.is_active);
    }

    if (filters?.search) {
      query = query.ilike("ship_email", `%${filters.search}%`);
    }

    // Add pagination support
    if (filters?.limit) {
      query = query.limit(filters.limit);
    } else {
      query = query.limit(100); // Default limit for better performance
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters?.limit || 100) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch ships: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get all ships with their tracking data in an optimized way
   */
  async getAllShipsWithTracking(filters?: ShipFilters): Promise<ShipWithTracking[]> {
    try {
      // First, get all ships from database
      const ships = await this.getAllShips(filters);

      // If no ships, return empty array
      if (ships.length === 0) {
        return [];
      }

      // Filter ships that have VesselFinder URLs for tracking
      const shipsWithUrls = ships.filter((ship) => ship.vesselfinder_url);
      const shipsWithoutUrls = ships.filter((ship) => !ship.vesselfinder_url);

      // Fetch tracking data for ships with URLs using Promise.allSettled for better error handling
      const trackingPromises = shipsWithUrls.map(async (ship) => {
        try {
          const trackingData = await shipTrackingService.getAllShipDataFromURL(ship.vesselfinder_url!);
          return {
            ...ship,
            location: trackingData.location || undefined,
            imageUrl: trackingData.image?.url,
            shipName: trackingData.details?.name || this.generateShipNameFromEmail(ship.ship_email),
            trackingDetails: trackingData.details || undefined,
          };
        } catch (error) {
          console.error(`Error fetching tracking data for ship ${ship.ship_email}:`, error);
          return {
            ...ship,
            location: undefined,
            imageUrl: undefined,
            shipName: this.generateShipNameFromEmail(ship.ship_email),
            trackingDetails: undefined,
          };
        }
      });

      const trackingResults = await Promise.allSettled(trackingPromises);
      const shipsWithTrackingData = trackingResults.map((result, index) => {
        if (result.status === "fulfilled") {
          return result.value;
        } else {
          console.error(`Failed to fetch tracking for ship ${shipsWithUrls[index].ship_email}:`, result.reason);
          return {
            ...shipsWithUrls[index],
            location: undefined,
            imageUrl: undefined,
            shipName: this.generateShipNameFromEmail(shipsWithUrls[index].ship_email),
            trackingDetails: undefined,
          };
        }
      });

      // Add ships without URLs (with fallback data)
      const shipsWithoutTrackingData = shipsWithoutUrls.map((ship) => ({
        ...ship,
        location: undefined,
        imageUrl: undefined,
        shipName: this.generateShipNameFromEmail(ship.ship_email),
        trackingDetails: undefined,
      }));

      // Combine and return all ships
      return [...shipsWithTrackingData, ...shipsWithoutTrackingData];
    } catch (error) {
      console.error("Error fetching ships with tracking:", error);
      throw error;
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
   * Update VesselFinder URLs for existing ships
   */
  async updateShipVesselFinderUrl(shipEmail: string, vesselfinderUrl: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("ships")
        .update({ vesselfinder_url: vesselfinderUrl })
        .eq("ship_email", shipEmail);

      if (error) {
        throw new Error(`Failed to update VesselFinder URL: ${error.message}`);
      }
    } catch (error) {
      console.error("Error updating VesselFinder URL:", error);
      throw error;
    }
  }

  /**
   * Batch update VesselFinder URLs for multiple ships
   */
  async batchUpdateVesselFinderUrls(updates: Array<{ email: string; url: string }>): Promise<void> {
    try {
      const promises = updates.map((update) => this.updateShipVesselFinderUrl(update.email, update.url));

      await Promise.allSettled(promises);
    } catch (error) {
      console.error("Error batch updating VesselFinder URLs:", error);
      throw error;
    }
  }

  /**
   * Ensure ships have VesselFinder URLs - useful for fixing missing data
   */
  async ensureShipsHaveVesselFinderUrls(): Promise<void> {
    try {
      const ships = await this.getAllShips();
      const urlMappings = [
        { email: "hyemerald01@gmail.com", url: "https://www.vesselfinder.com/vessels/details/9676307" },
        { email: "hypartner02@gmail.com", url: "https://www.vesselfinder.com/vessels/details/9234567" },
        { email: "hychampion03@gmail.com", url: "https://www.vesselfinder.com/vessels/details/9345678" },
      ];

      const updates = ships
        .filter((ship) => !ship.vesselfinder_url)
        .map((ship) => {
          const mapping = urlMappings.find((m) => m.email === ship.ship_email);
          return mapping ? { email: ship.ship_email, url: mapping.url } : null;
        })
        .filter(Boolean) as Array<{ email: string; url: string }>;

      if (updates.length > 0) {
        console.log(`Updating ${updates.length} ships with VesselFinder URLs`);
        await this.batchUpdateVesselFinderUrls(updates);
      }
    } catch (error) {
      console.error("Error ensuring ships have VesselFinder URLs:", error);
    }
  }

  async getShipById(id: string): Promise<Ship | null> {
    const { data, error } = await this.supabase.from("ships").select("*").eq("id", id).single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Ship not found
      }
      throw new Error(`Failed to fetch ship: ${error.message}`);
    }

    return data;
  }

  async createShip(shipData: CreateShipData): Promise<Ship> {
    const { data, error } = await this.supabase.from("ships").insert([shipData]).select().single();

    if (error) {
      throw new Error(`Failed to create ship: ${error.message}`);
    }

    return data;
  }

  async updateShip(id: string, shipData: UpdateShipData): Promise<Ship> {
    const { data, error } = await this.supabase.from("ships").update(shipData).eq("id", id).select().single();

    if (error) {
      throw new Error(`Failed to update ship: ${error.message}`);
    }

    return data;
  }

  async deleteShip(id: string): Promise<void> {
    const { error } = await this.supabase.from("ships").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete ship: ${error.message}`);
    }
  }

  async getStats() {
    const { data, error } = await this.supabase.from("ships").select("is_active");

    if (error) {
      throw new Error(`Failed to fetch ship stats: ${error.message}`);
    }

    const total = data.length;
    const active = data.filter((ship) => ship.is_active).length;
    const inactive = total - active;

    return {
      total,
      active,
      inactive,
    };
  }
}

export const shipService = new ShipService();
