/**
 * Caching service for ship tracking data
 * Provides both memory cache and localStorage persistence
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface ShipCacheData {
  location?: any;
  imageUrl?: string;
  shipName?: string;
  trackingDetails?: any;
}

export class ShipCacheService {
  private static instance: ShipCacheService;
  private memoryCache = new Map<string, CacheEntry<ShipCacheData>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly STORAGE_KEY = 'ship_tracking_cache';

  static getInstance(): ShipCacheService {
    if (!ShipCacheService.instance) {
      ShipCacheService.instance = new ShipCacheService();
    }
    return ShipCacheService.instance;
  }

  /**
   * Get cached data for a ship
   */
  get(shipId: string): ShipCacheData | null {
    // First check memory cache
    const memoryEntry = this.memoryCache.get(shipId);
    if (memoryEntry && Date.now() < memoryEntry.expiresAt) {
      return memoryEntry.data;
    }

    // Then check localStorage
    try {
      const storageData = localStorage.getItem(this.STORAGE_KEY);
      if (storageData) {
        const cache = JSON.parse(storageData);
        const entry = cache[shipId];
        if (entry && Date.now() < entry.expiresAt) {
          // Move back to memory cache for faster access
          this.memoryCache.set(shipId, entry);
          return entry.data;
        }
      }
    } catch (error) {
      console.error('Error reading from localStorage cache:', error);
    }

    return null;
  }

  /**
   * Set cached data for a ship
   */
  set(shipId: string, data: ShipCacheData, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.DEFAULT_TTL);
    const entry: CacheEntry<ShipCacheData> = {
      data,
      timestamp: Date.now(),
      expiresAt
    };

    // Set in memory cache
    this.memoryCache.set(shipId, entry);

    // Set in localStorage
    try {
      const storageData = localStorage.getItem(this.STORAGE_KEY);
      const cache = storageData ? JSON.parse(storageData) : {};
      cache[shipId] = entry;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Error writing to localStorage cache:', error);
    }
  }

  /**
   * Check if data exists and is fresh
   */
  has(shipId: string): boolean {
    return this.get(shipId) !== null;
  }

  /**
   * Remove cached data for a ship
   */
  delete(shipId: string): void {
    this.memoryCache.delete(shipId);

    try {
      const storageData = localStorage.getItem(this.STORAGE_KEY);
      if (storageData) {
        const cache = JSON.parse(storageData);
        delete cache[shipId];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cache));
      }
    } catch (error) {
      console.error('Error deleting from localStorage cache:', error);
    }
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.memoryCache.clear();
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing localStorage cache:', error);
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();

    // Clean memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now >= entry.expiresAt) {
        this.memoryCache.delete(key);
      }
    }

    // Clean localStorage cache
    try {
      const storageData = localStorage.getItem(this.STORAGE_KEY);
      if (storageData) {
        const cache = JSON.parse(storageData);
        const cleaned: any = {};
        
        for (const [key, entry] of Object.entries(cache)) {
          const typedEntry = entry as CacheEntry<ShipCacheData>;
          if (now < typedEntry.expiresAt) {
            cleaned[key] = entry;
          }
        }
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cleaned));
      }
    } catch (error) {
      console.error('Error cleaning localStorage cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    memoryEntries: number;
    storageEntries: number;
    memorySize: number;
  } {
    let storageEntries = 0;
    
    try {
      const storageData = localStorage.getItem(this.STORAGE_KEY);
      if (storageData) {
        storageEntries = Object.keys(JSON.parse(storageData)).length;
      }
    } catch (error) {
      console.error('Error reading cache stats:', error);
    }

    return {
      memoryEntries: this.memoryCache.size,
      storageEntries,
      memorySize: JSON.stringify([...this.memoryCache.entries()]).length
    };
  }
}

// Export singleton instance
export const shipCache = ShipCacheService.getInstance();
