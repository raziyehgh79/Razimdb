/**
 * Safe client-side caching backed by sessionStorage with TTL and versioning.
 */

const CACHE_PREFIX = 'razimdb_v1_';
const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

export const Cache = {
  /**
   * Sets a value in the cache with a time-to-live.
   * @param {string} key 
   * @param {any} data 
   * @param {number} [ttlMs] 
   */
  set(key, data, ttlMs = DEFAULT_TTL_MS) {
    try {
      const entry = {
        data,
        timestamp: Date.now(),
        ttl: ttlMs
      };
      sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch {
      // Catch QuotaExceededError or sessionStorage disabled in private browsing
    }
  },

  /**
   * Retrieves a cached value if valid and unexpired.
   * @param {string} key 
   * @returns {any | null}
   */
  get(key) {
    try {
      const raw = sessionStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;

      const entry = JSON.parse(raw);
      if (!entry || typeof entry !== 'object') return null;

      const isExpired = Date.now() - entry.timestamp > entry.ttl;
      if (isExpired) {
        sessionStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }

      return entry.data;
    } catch {
      return null;
    }
  },

  /**
   * Removes a specific key from the cache.
   * @param {string} key 
   */
  remove(key) {
    try {
      sessionStorage.removeItem(CACHE_PREFIX + key);
    } catch {
      // Ignore
    }
  },

  /**
   * Clears all cache entries associated with this application.
   */
  clear() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith(CACHE_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k));
    } catch {
      // Ignore
    }
  }
};
