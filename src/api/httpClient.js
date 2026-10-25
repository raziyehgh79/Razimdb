/**
 * Resilient, caching HTTP client for API communication.
 */
import { Cache } from '../utils/cache.js';

export class HttpClient {
  /**
   * Performs an HTTP GET request with timeout, caching, and error handling.
   * @param {string} url 
   * @param {object} [options]
   * @param {number} [options.timeout=10000] - Timeout in milliseconds
   * @param {AbortSignal} [options.signal] - External abort signal
   * @param {boolean} [options.useCache=true] - Whether to consult and write to cache
   * @param {number} [options.ttl] - Cache TTL in ms
   * @param {number} [options.retries=1] - Retry count for transient errors
   * @returns {Promise<any>}
   */
  static async get(url, options = {}) {
    const {
      timeout = 10000,
      signal: externalSignal,
      useCache = true,
      ttl,
      retries = 1
    } = options;

    if (useCache) {
      const cached = Cache.get(url);
      if (cached !== null) {
        return cached;
      }
    }

    let attempt = 0;
    while (attempt <= retries) {
      attempt++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const combinedSignal = externalSignal
        ? anySignal([externalSignal, controller.signal])
        : controller.signal;

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          signal: combinedSignal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new HttpError(response.status, `HTTP error ${response.status} fetching ${url}`);
        }

        let json;
        try {
          json = await response.json();
        } catch {
          throw new Error(`Failed to parse JSON response from ${url}`);
        }

        if (useCache && json) {
          Cache.set(url, json, ttl);
        }

        return json;
      } catch (err) {
        clearTimeout(timeoutId);

        if (externalSignal?.aborted) {
          throw new DOMException('Request aborted by caller', 'AbortError');
        }

        const isLastAttempt = attempt > retries;
        if (isLastAttempt || err.name === 'AbortError') {
          throw err;
        }

        // Wait brief delay before retry
        await new Promise((r) => setTimeout(r, 400));
      }
    }
  }
}

/**
 * Custom error with HTTP status code.
 */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

/**
 * Combines multiple AbortSignals into one.
 * @param {AbortSignal[]} signals 
 * @returns {AbortSignal}
 */
function anySignal(signals) {
  const controller = new AbortController();
  for (const sig of signals) {
    if (sig.aborted) {
      controller.abort();
      return sig;
    }
    sig.addEventListener('abort', () => controller.abort(), { once: true });
  }
  return controller.signal;
}
