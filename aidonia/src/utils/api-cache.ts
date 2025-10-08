"use client";

import { useState, useEffect } from 'react';

/**
 * ✅ PERFORMANCE: API Caching System
 * Reduces API calls and improves loading speed
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class APICache {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    };
    this.cache.set(key, item);
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  remove(key: string): void {
    this.cache.delete(key);
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    const validEntries = Array.from(this.cache.entries())
      .filter(([_, item]) => now <= item.expiry);
    
    return {
      totalEntries: this.cache.size,
      validEntries: validEntries.length,
      expiredEntries: this.cache.size - validEntries.length,
      hitRate: this.calculateHitRate()
    };
  }

  private calculateHitRate(): number {
    // This would need to be implemented with hit/miss tracking
    return 0; // Placeholder
  }
}

// Global cache instance
export const apiCache = new APICache();

/**
 * Cached API wrapper
 */
export const cachedAPI = {
  async get<T>(
    url: string, 
    options: { ttl?: number; force?: boolean } = {}
  ): Promise<T> {
    const { ttl = 5 * 60 * 1000, force = false } = options;
    const cacheKey = `GET:${url}`;
    
    // Return cached data if available and not forced
    if (!force && apiCache.has(cacheKey)) {
      console.log(`📦 Cache HIT: ${url}`);
      return apiCache.get<T>(cacheKey)!;
    }
    
    console.log(`🌐 Cache MISS: ${url}`);
    
    // Make API call (you would integrate with your actual API client)
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      // Cache the result
      apiCache.set(cacheKey, data, ttl);
      
      return data;
    } catch (error) {
      console.error(`API Error for ${url}:`, error);
      throw error;
    }
  },

  async post<T>(url: string, body: any): Promise<T> {
    // POST requests typically shouldn't be cached, but we can invalidate related cache
    const relatedKeys = Array.from(apiCache['cache'].keys())
      .filter(key => key.includes(url.split('/')[1])); // Invalidate related endpoints
    
    relatedKeys.forEach(key => apiCache.remove(key));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    return response.json();
  }
};

/**
 * React hook for cached API calls
 */
export const useCachedAPI = <T>(
  url: string | null, 
  options: { ttl?: number; enabled?: boolean } = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { ttl = 5 * 60 * 1000, enabled = true } = options;
  
  useEffect(() => {
    if (!url || !enabled) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await cachedAPI.get<T>(url, { ttl });
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [url, ttl, enabled]);
  
  return { data, loading, error, refetch: () => {
    if (url) {
      cachedAPI.get<T>(url, { ttl, force: true }).then(setData);
    }
  }};
};

// Development helpers
export const cacheUtils = {
  clear: () => apiCache.clear(),
  stats: () => apiCache.getStats(),
  inspect: () => console.table(apiCache.getStats())
};