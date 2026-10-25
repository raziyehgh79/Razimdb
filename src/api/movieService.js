/**
 * Service for fetching and normalizing movie and genre data from moviesapi.ir.
 */
import { HttpClient } from './httpClient.js';
import { isValidImageUrl } from '../utils/imageFallback.js';

const BASE_URL = 'https://moviesapi.ir/api/v1';

/**
 * Normalizes raw movie data from API into a consistent internal schema.
 * @param {object} raw 
 * @returns {object}
 */
export function normalizeMovie(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const validImages = Array.isArray(raw.images)
    ? raw.images.filter((img) => isValidImageUrl(img))
    : [];

  const poster = isValidImageUrl(raw.poster) ? raw.poster : null;
  const backdrop = validImages.length > 0 ? validImages[0] : poster;

  let actorsList = [];
  if (typeof raw.actors === 'string') {
    actorsList = raw.actors.split(',').map((s) => s.trim()).filter(Boolean);
  } else if (Array.isArray(raw.actors)) {
    actorsList = raw.actors.map((s) => String(s).trim()).filter(Boolean);
  }

  return {
    id: Number(raw.id),
    title: raw.title ? String(raw.title).trim() : 'Untitled',
    year: raw.year ? String(raw.year).trim() : 'N/A',
    rated: raw.rated && raw.rated !== 'N/A' ? String(raw.rated).trim() : 'N/A',
    released: raw.released ? String(raw.released).trim() : (raw.year ? String(raw.year).trim() : 'N/A'),
    runtime: raw.runtime ? String(raw.runtime).trim() : 'N/A',
    director: raw.director ? String(raw.director).trim() : 'N/A',
    writers: raw.writer ? String(raw.writer).trim() : 'N/A',
    actors: actorsList,
    plot: raw.plot && raw.plot !== 'N/A' ? String(raw.plot).trim() : 'Plot summary is not available for this title.',
    country: raw.country ? String(raw.country).trim() : 'N/A',
    rating: raw.imdb_rating && raw.imdb_rating !== '0' && raw.imdb_rating !== 'N/A'
      ? String(raw.imdb_rating).trim()
      : 'N/A',
    votes: raw.imdb_votes ? String(raw.imdb_votes).trim() : '0',
    genres: Array.isArray(raw.genres) ? raw.genres.map(String) : [],
    poster,
    backdrop,
    images: validImages
  };
}

/**
 * Normalizes pagination metadata.
 * @param {object} meta 
 * @returns {object}
 */
export function normalizeMetadata(meta) {
  return {
    currentPage: parseInt(meta?.current_page || '1', 10),
    perPage: parseInt(meta?.per_page || '10', 10),
    pageCount: parseInt(meta?.page_count || '1', 10),
    totalCount: parseInt(meta?.total_count || '0', 10)
  };
}

export const MovieService = {
  /**
   * Fetches paginated movies list.
   * @param {object} [params]
   * @param {number} [params.page=1]
   * @param {AbortSignal} [params.signal]
   * @returns {Promise<{ movies: object[], metadata: object }>}
   */
  async getMovies({ page = 1, signal } = {}) {
    const url = `${BASE_URL}/movies?page=${encodeURIComponent(page)}`;
    const res = await HttpClient.get(url, { signal, ttl: 15 * 60 * 1000 });

    const movies = Array.isArray(res?.data) ? res.data.map(normalizeMovie).filter(Boolean) : [];
    const metadata = normalizeMetadata(res?.metadata);

    return { movies, metadata };
  },

  /**
   * Fetches full movie details by ID.
   * @param {number|string} id 
   * @param {AbortSignal} [signal]
   * @returns {Promise<object>}
   */
  async getMovieById(id, signal) {
    if (!id) throw new Error('Movie ID is required');
    const url = `${BASE_URL}/movies/${encodeURIComponent(id)}`;
    const res = await HttpClient.get(url, { signal, ttl: 30 * 60 * 1000 });
    return normalizeMovie(res);
  },

  /**
   * Searches movies by keyword query.
   * @param {object} params
   * @param {string} params.query
   * @param {number} [params.page=1]
   * @param {AbortSignal} [params.signal]
   * @returns {Promise<{ movies: object[], metadata: object }>}
   */
  async searchMovies({ query, page = 1, signal }) {
    if (!query || !query.trim()) {
      return {
        movies: [],
        metadata: { currentPage: 1, perPage: 10, pageCount: 0, totalCount: 0 }
      };
    }

    const trimmed = query.trim();
    const url = `${BASE_URL}/movies?q=${encodeURIComponent(trimmed)}&page=${encodeURIComponent(page)}`;
    const res = await HttpClient.get(url, { signal, ttl: 5 * 60 * 1000 });

    const movies = Array.isArray(res?.data) ? res.data.map(normalizeMovie).filter(Boolean) : [];
    const metadata = normalizeMetadata(res?.metadata);

    return { movies, metadata };
  },

  /**
   * Fetches all official genres.
   * @param {AbortSignal} [signal]
   * @returns {Promise<Array<{ id: number, name: string }>>}
   */
  async getGenres(signal) {
    const url = `${BASE_URL}/genres`;
    const res = await HttpClient.get(url, { signal, ttl: 60 * 60 * 1000 }); // 1 hour cache
    if (!Array.isArray(res)) return [];
    return res.map((g) => ({
      id: Number(g.id),
      name: String(g.name || '')
    }));
  },

  /**
   * Fetches movies by genre ID with pagination.
   * @param {object} params
   * @param {number|string} params.genreId
   * @param {number} [params.page=1]
   * @param {AbortSignal} [params.signal]
   * @returns {Promise<{ movies: object[], metadata: object }>}
   */
  async getMoviesByGenre({ genreId, page = 1, signal }) {
    if (!genreId) throw new Error('Genre ID is required');
    const url = `${BASE_URL}/genres/${encodeURIComponent(genreId)}/movies?page=${encodeURIComponent(page)}`;
    const res = await HttpClient.get(url, { signal, ttl: 15 * 60 * 1000 });

    const movies = Array.isArray(res?.data) ? res.data.map(normalizeMovie).filter(Boolean) : [];
    const metadata = normalizeMetadata(res?.metadata);

    return { movies, metadata };
  }
};
