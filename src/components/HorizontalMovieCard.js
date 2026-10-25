/**
 * Horizontal Movie Card for the Genres catalog view.
 */
import { el, createIcon } from '../utils/dom.js';
import { getPosterFallback, handleImageFallback } from '../utils/imageFallback.js';
import { formatRuntime, formatRating, formatVotes } from '../utils/formatters.js';

/**
 * Creates a horizontal movie card element.
 * @param {object} movie 
 * @returns {HTMLElement}
 */
export function createHorizontalMovieCard(movie) {
  const fallbackPoster = getPosterFallback(movie.title);

  const posterImg = el('img', {
    className: 'horizontal-card-poster',
    src: movie.poster || fallbackPoster,
    alt: `${movie.title} poster`,
    loading: 'lazy'
  });
  handleImageFallback(posterImg, fallbackPoster);

  const posterWrapper = el('div', { className: 'horizontal-card-poster-wrapper' }, posterImg);

  // Rating Display
  const ratingSection = movie.rating && movie.rating !== 'N/A'
    ? el(
        'div',
        { className: 'horizontal-card-rating', title: `IMDb Rating: ${movie.rating}` },
        createIcon('star', { width: 14, height: 14 }),
        el('span', {}, `${formatRating(movie.rating)} ${movie.votes && movie.votes !== '0' ? `(${formatVotes(movie.votes, true)})` : ''}`)
      )
    : null;

  // Header row
  const header = el(
    'div',
    { className: 'horizontal-card-header' },
    el('h3', { className: 'horizontal-card-title' }, movie.title),
    ratingSection
  );

  // Meta row: Year • Rated • Runtime
  const metaParts = [
    movie.year !== 'N/A' ? movie.year : null,
    movie.rated !== 'N/A' ? movie.rated : null,
    movie.runtime !== 'N/A' ? formatRuntime(movie.runtime) : null
  ].filter(Boolean);

  const metaRow = el('div', { className: 'horizontal-card-meta' }, metaParts.join('  •  '));

  // Genre badges
  const badgesRow = Array.isArray(movie.genres) && movie.genres.length > 0
    ? el(
        'div',
        { className: 'horizontal-card-badges' },
        ...movie.genres.slice(0, 4).map((g) => el('span', { className: 'genre-badge' }, g))
      )
    : null;

  // Plot excerpt
  const plot = el('p', { className: 'horizontal-card-plot' }, movie.plot);

  // Credits
  const creditsList = [];
  if (movie.director && movie.director !== 'N/A') {
    creditsList.push(
      el('div', { className: 'horizontal-card-credits' }, 'Director: ', el('span', {}, movie.director))
    );
  }

  if (Array.isArray(movie.actors) && movie.actors.length > 0) {
    creditsList.push(
      el('div', { className: 'horizontal-card-credits' }, 'Stars: ', el('span', {}, movie.actors.slice(0, 3).join(', ')))
    );
  }

  if (movie.votes && movie.votes !== '0') {
    creditsList.push(
      el('div', { className: 'horizontal-card-credits' }, 'Votes: ', el('span', {}, formatVotes(movie.votes)))
    );
  }

  const content = el(
    'div',
    { className: 'horizontal-card-content' },
    header,
    metaRow,
    badgesRow,
    plot,
    ...creditsList
  );

  return el(
    'a',
    {
      className: 'horizontal-movie-card',
      href: `#/movie/${movie.id}`,
      'aria-label': `View details for ${movie.title}`
    },
    posterWrapper,
    content
  );
}
