/**
 * Vertical Movie Card for catalog and search grids.
 */
import { el, createIcon } from '../utils/dom.js';
import { getPosterFallback, handleImageFallback } from '../utils/imageFallback.js';
import { formatRating } from '../utils/formatters.js';

/**
 * Creates a vertical movie card element.
 * @param {object} movie - Normalized movie object.
 * @returns {HTMLElement}
 */
export function createMovieCard(movie) {
  const fallbackPoster = getPosterFallback(movie.title);

  const posterImg = el('img', {
    className: 'movie-card-poster',
    src: movie.poster || fallbackPoster,
    alt: `${movie.title} poster`,
    loading: 'lazy'
  });
  handleImageFallback(posterImg, fallbackPoster);

  const ratingBadge = movie.rating && movie.rating !== 'N/A'
    ? el(
        'div',
        { className: 'movie-card-rating-badge', title: `IMDb Rating: ${movie.rating}` },
        createIcon('star', { width: 12, height: 12 }),
        el('span', {}, formatRating(movie.rating))
      )
    : null;

  const posterWrapper = el(
    'div',
    { className: 'movie-card-poster-wrapper' },
    posterImg,
    ratingBadge
  );

  const genresTags = Array.isArray(movie.genres) && movie.genres.length > 0
    ? el(
        'div',
        { className: 'movie-card-genres' },
        ...movie.genres.slice(0, 2).map((genre) =>
          el('span', { className: 'movie-card-genre-tag' }, genre)
        )
      )
    : null;

  const content = el(
    'div',
    { className: 'movie-card-content' },
    el('h3', { className: 'movie-card-title', title: movie.title }, movie.title),
    el(
      'div',
      { className: 'movie-card-meta' },
      el('span', {}, movie.year || 'N/A'),
      genresTags
    )
  );

  return el(
    'a',
    {
      className: 'movie-card',
      href: `#/movie/${movie.id}`,
      'aria-label': `View details for ${movie.title} (${movie.year})`
    },
    posterWrapper,
    content
  );
}
