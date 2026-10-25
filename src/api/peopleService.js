/**
 * Resilient service for cast photo enrichment using TVmaze People Search API.
 * Data provided by TVmaze under Creative Commons BY-SA.
 */
import { HttpClient } from './httpClient.js';
import { Cache } from '../utils/cache.js';

const TVMAZE_SEARCH_URL = 'https://api.tvmaze.com/search/people?q=';

/**
 * Normalizes a person's name for comparison (lowercased, accents removed).
 * @param {string} str 
 * @returns {string}
 */
function normalizeName(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Calculates simple similarity or match between query name and returned candidate.
 * @param {string} query 
 * @param {string} target 
 * @returns {boolean}
 */
function isNameMatch(query, target) {
  const q = normalizeName(query);
  const t = normalizeName(target);
  if (!q || !t) return false;
  return q === t || t.includes(q) || q.includes(t);
}

export const PeopleService = {
  /**
   * Looks up a single actor by name with concurrency and caching.
   * @param {string} actorName 
   * @param {AbortSignal} [signal]
   * @returns {Promise<{ name: string, photo: string|null, tvmazeId: number|null }>}
   */
  async lookupActor(actorName, signal) {
    const trimmed = (actorName || '').trim();
    if (!trimmed) {
      return { name: actorName, photo: null, tvmazeId: null };
    }

    const cacheKey = `tvmaze_actor_${normalizeName(trimmed)}`;
    const cached = Cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const url = `${TVMAZE_SEARCH_URL}${encodeURIComponent(trimmed)}`;
      // Low timeout for enrichment so it never stalls page
      const results = await HttpClient.get(url, {
        signal,
        timeout: 5000,
        retries: 0,
        useCache: false
      });

      if (!Array.isArray(results) || results.length === 0) {
        const fallback = { name: trimmed, photo: null, tvmazeId: null };
        Cache.set(cacheKey, fallback, 24 * 60 * 60 * 1000);
        return fallback;
      }

      // Find the most trustworthy match
      const matched = results.find((item) => {
        const personName = item?.person?.name;
        return personName && isNameMatch(trimmed, personName);
      });

      const bestCandidate = matched ? matched.person : results[0]?.person;
      const hasImage = bestCandidate?.image?.medium || bestCandidate?.image?.original || null;

      const actorData = {
        name: trimmed,
        photo: hasImage,
        tvmazeId: bestCandidate?.id || null
      };

      Cache.set(cacheKey, actorData, 24 * 60 * 60 * 1000); // 24 hours
      return actorData;
    } catch {
      // Never throw; return fallback
      return { name: trimmed, photo: null, tvmazeId: null };
    }
  },

  /**
   * Enriches a list of actors in order, limited to maxCount with resilient Promise.allSettled.
   * @param {string[]} actorNames 
   * @param {number} [maxCount=6]
   * @param {AbortSignal} [signal]
   * @returns {Promise<Array<{ name: string, photo: string|null, tvmazeId: number|null }>>}
   */
  async enrichCast(actorNames, maxCount = 6, signal) {
    if (!Array.isArray(actorNames) || actorNames.length === 0) {
      return [];
    }

    const targets = actorNames.slice(0, maxCount);

    // Limit concurrency: batch lookups in chunks of 2
    const results = [];
    const chunkSize = 2;

    for (let i = 0; i < targets.length; i += chunkSize) {
      if (signal?.aborted) break;
      const chunk = targets.slice(i, i + chunkSize);
      const settled = await Promise.allSettled(
        chunk.map((name) => this.lookupActor(name, signal))
      );

      for (let j = 0; j < chunk.length; j++) {
        const res = settled[j];
        if (res.status === 'fulfilled' && res.value) {
          results.push(res.value);
        } else {
          results.push({ name: chunk[j], photo: null, tvmazeId: null });
        }
      }
    }

    return results;
  }
};
