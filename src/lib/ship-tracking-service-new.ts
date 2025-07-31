/**
 * Ship Tracking Service
 * Integrates with VesselFinder scraping service for ship location and image data
 */

import { vesselScraperService, type ScrapedShipData } from './vessel-scraper-service';

export interface ShipLocation {
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
  status: string;
  lastUpdate: string;
  port?: string;
  destination?: string;
  mmsi?: string;
  imo?: string;
}

export interface ShipImage {
  url: string;
  source: string;
  caption?: string;
  timestamp?: string;
}

export interface ShipDetails {
  name?: string;
  type?: string;
  flag?: string;
  length?: number;
  width?: number;
  deadweight?: number;
  yearBuilt?: number;
}

export class ShipTrackingService {
  /**
   * Get ship location by email/identifier using VesselFinder scraping
   */
  async getShipLocation(shipEmail: string): Promise<ShipLocation | null> {
    try {
      // First try our scraping API
      const scrapedData = await this.fetchFromScrapingAPI(shipEmail);
      if (scrapedData) {
        return this.convertToShipLocation(scrapedData);
      }

      // Fallback to local scraping service
      const vesselData = await vesselScraperService.getShipByEmail(shipEmail);
      if (vesselData?.location) {
        return {
          latitude: vesselData.location.latitude,
          longitude: vesselData.location.longitude,
          speed: vesselData.location.speed,
          course: vesselData.location.course,
          status: vesselData.location.status,
          lastUpdate: vesselData.location.lastUpdate,
          port: vesselData.location.port,
          destination: vesselData.location.destination,
          mmsi: vesselData.mmsi,
          imo: vesselData.imo
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching ship location:', error);
      return null;
    }
  }

  /**
   * Get ship image by email/identifier
   */
  async getShipImage(shipEmail: string): Promise<ShipImage | null> {
    try {
      const vesselData = await vesselScraperService.getShipByEmail(shipEmail);
      if (vesselData?.image) {
        return {
          url: vesselData.image.url,
          source: vesselData.image.source,
          caption: vesselData.image.caption,
          timestamp: new Date().toISOString()
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching ship image:', error);
      return null;
    }
  }

  /**
   * Get detailed ship information
   */
  async getShipDetails(shipEmail: string): Promise<ShipDetails | null> {
    try {
      const vesselData = await vesselScraperService.getShipByEmail(shipEmail);
      if (vesselData) {
        return {
          name: vesselData.name,
          type: vesselData.type,
          flag: vesselData.flag,
          length: vesselData.length,
          width: vesselData.width,
          deadweight: vesselData.deadweight,
          yearBuilt: vesselData.yearBuilt
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching ship details:', error);
      return null;
    }
  }

  /**
   * Fetch data from our scraping API
   */
  private async fetchFromScrapingAPI(shipEmail: string): Promise<any | null> {
    try {
      // Extract ship name from email for search
      const shipName = shipEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ');
      
      const response = await fetch(`/api/scrape-vessel?query=${encodeURIComponent(shipName)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.length > 0) {
        return result.data[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching from scraping API:', error);
      return null;
    }
  }

  /**
   * Convert scraped data to ShipLocation interface
   */
  private convertToShipLocation(data: any): ShipLocation | null {
    if (!data.location) return null;

    return {
      latitude: data.location.latitude,
      longitude: data.location.longitude,
      speed: data.location.speed || 0,
      course: data.location.course || 0,
      status: data.location.status || 'Unknown',
      lastUpdate: data.lastUpdate || new Date().toISOString(),
      port: data.location.port,
      destination: data.location.destination,
      mmsi: data.mmsi,
      imo: data.imo
    };
  }

  /**
   * Search for ships by name using VesselFinder
   */
  async searchShipsByName(name: string): Promise<ShipLocation[]> {
    try {
      const response = await fetch(`/api/scrape-vessel?query=${encodeURIComponent(name)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data.map((data: any) => this.convertToShipLocation(data)).filter(Boolean);
      }
      
      return [];
    } catch (error) {
      console.error('Error searching ships by name:', error);
      return [];
    }
  }

  /**
   * Get ship by MMSI number
   */
  async getShipByMMSI(mmsi: string): Promise<ShipLocation | null> {
    try {
      const response = await fetch(`/api/scrape-vessel?mmsi=${mmsi}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.length > 0) {
        return this.convertToShipLocation(result.data[0]);
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching ship by MMSI:', error);
      return null;
    }
  }

  /**
   * Convert coordinates to human-readable format
   */
  static formatCoordinates(lat: number, lng: number): string {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(6)}°${latDir}, ${Math.abs(lng).toFixed(6)}°${lngDir}`;
  }

  /**
   * Calculate distance between two coordinates (in nautical miles)
   */
  static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3440.065; // Earth's radius in nautical miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

// Export singleton instance
export const shipTrackingService = new ShipTrackingService();
