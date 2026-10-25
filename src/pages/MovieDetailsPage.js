/**
 * Movie Details Page View (#/movie/:id).
 */
import { el, createIcon, clearElement } from '../utils/dom.js';
import { MovieService } from '../api/movieService.js';
import { formatRuntime, formatRating, formatVotes } from '../utils/formatters.js';
import { getPosterFallback, handleImageFallback } from '../utils/imageFallback.js';
import { SceneGallery } from '../components/SceneGallery.js';
import { CastList } from '../components/CastList.js';
import { States } from '../components/States.js';

export class MovieDetailsPage {
  /**
   * @param {object} options
   * @param {Record<string, string>} options.params
   * @param {import('../router/router.js').Router} options.router
   * @param {AbortSignal} options.signal
   */
  constructor({ params, router, signal }) {
    this.movieId = params.id;
    this.router = router;
    this.signal = signal;
    this.sceneGallery = null;
    this.container = null;
  }

  async render() {
    document.title = 'Loading Movie Details — RaziMDb';

    this.container = el('div', { className: 'details-page-wrapper' });

    // Initial Skeleton
    this.container.appendChild(States.renderLoading('details'));

    this.loadDetails();
    return this.container;
  }

  async loadDetails() {
    if (!this.movieId || isNaN(Number(this.movieId))) {
      clearElement(this.container);
      this.container.appendChild(
        States.renderEmpty({
          title: 'Invalid Movie ID',
          message: 'The requested movie ID is missing or invalid.',
          ctaText: 'Back to Home',
          ctaHref: '#/'
        })
      );
      return;
    }

    try {
      const [movie, allGenres] = await Promise.all([
        MovieService.getMovieById(this.movieId, this.signal),
        MovieService.getGenres(this.signal).catch(() => [])
      ]);

      if (this.signal.aborted) return;

      if (!movie || !movie.title) {
        clearElement(this.container);
        this.container.appendChild(
          States.renderEmpty({
            title: 'Movie Not Found',
            message: `No details could be found for movie ID #${this.movieId}.`,
            ctaText: 'Return to Catalog',
            ctaHref: '#/'
          })
        );
        return;
      }

      document.title = `${movie.title} (${movie.year}) — RaziMDb`;
      clearElement(this.container);

      // 1. Header Information Row
      const metaParts = [
        movie.year !== 'N/A' ? movie.year : null,
        movie.rated !== 'N/A' ? movie.rated : null,
        movie.runtime !== 'N/A' ? formatRuntime(movie.runtime) : null
      ].filter(Boolean);

      const headerMeta = el('div', { className: 'details-header-meta' }, metaParts.join('  •  '));

      const headerMain = el(
        'div',
        { className: 'details-header-main' },
        el('h1', { className: 'details-movie-title' }, movie.title),
        headerMeta
      );

      const ratingBox = movie.rating && movie.rating !== 'N/A'
        ? el(
            'div',
            { className: 'details-rating-box', title: `IMDb Rating: ${movie.rating}` },
            el('span', { className: 'details-rating-star' }, createIcon('star', { width: 22, height: 22 })),
            el(
              'div',
              {},
              el(
                'div',
                { className: 'details-rating-score' },
                formatRating(movie.rating),
                el('span', {}, '/10')
              ),
              el('div', { className: 'details-rating-votes' }, `(${formatVotes(movie.votes, true)})`)
            )
          )
        : null;

      const headerRow = el('div', { className: 'details-header-row' }, headerMain, ratingBox);
      this.container.appendChild(headerRow);

      // 2. Main Two-Column Layout
      // Left: Large Poster
      const fallbackPoster = getPosterFallback(movie.title);
      const posterImg = el('img', {
        className: 'details-poster',
        src: movie.poster || fallbackPoster,
        alt: `${movie.title} poster`
      });
      handleImageFallback(posterImg, fallbackPoster);

      const posterWrapper = el('div', { className: 'details-poster-wrapper' }, posterImg);

      // Right: Metadata details
      const genresListEl = el('div', { className: 'details-genres-list' });
      movie.genres.forEach((genreName) => {
        const matched = allGenres.find(
          (g) => g.name.toLowerCase() === genreName.toLowerCase()
        );
        if (matched) {
          const badge = el(
            'a',
            { className: 'genre-badge', href: `#/genres/${matched.id}` },
            genreName
          );
          genresListEl.appendChild(badge);
        } else {
          const badge = el('span', { className: 'genre-badge' }, genreName);
          genresListEl.appendChild(badge);
        }
      });

      const plotEl = el('p', { className: 'details-plot' }, movie.plot);

      // Credits Table
      const creditsTable = el('div', { className: 'details-credits-table' });

      if (movie.director && movie.director !== 'N/A') {
        creditsTable.appendChild(
          el(
            'div',
            { className: 'details-credit-row' },
            el('span', { className: 'details-credit-label' }, 'Director'),
            el('span', { className: 'details-credit-value' }, movie.director)
          )
        );
      }

      if (movie.writers && movie.writers !== 'N/A') {
        creditsTable.appendChild(
          el(
            'div',
            { className: 'details-credit-row' },
            el('span', { className: 'details-credit-label' }, 'Writers'),
            el('span', { className: 'details-credit-value' }, movie.writers)
          )
        );
      }

      if (Array.isArray(movie.actors) && movie.actors.length > 0) {
        creditsTable.appendChild(
          el(
            'div',
            { className: 'details-credit-row' },
            el('span', { className: 'details-credit-label' }, 'Stars'),
            el('span', { className: 'details-credit-value' }, movie.actors.slice(0, 4).join('  •  '))
          )
        );
      }

      const infoColumn = el('div', { className: 'details-info-column' }, genresListEl, plotEl, creditsTable);

      // Scene Gallery
      if (Array.isArray(movie.images) && movie.images.length > 0) {
        this.sceneGallery = new SceneGallery(movie.images, movie.title);
        const galleryEl = this.sceneGallery.render();
        if (galleryEl) {
          infoColumn.appendChild(galleryEl);
        }
      }

      const mainGrid = el('div', { className: 'details-main-grid' }, posterWrapper, infoColumn);
      this.container.appendChild(mainGrid);

      // 3. Cast Section
      if (Array.isArray(movie.actors) && movie.actors.length > 0) {
        const castSection = el(
          'section',
          { className: 'cast-section', 'aria-label': 'Movie Cast' },
          el('h2', { className: 'section-title' }, 'Cast')
        );

        const castListComp = new CastList(movie.actors, this.signal);
        castSection.appendChild(castListComp.render());
        this.container.appendChild(castSection);
      }
    } catch (err) {
      if (this.signal.aborted) return;
      clearElement(this.container);
      this.container.appendChild(
        States.renderError({
          title: 'Failed to load movie details',
          message: 'Unable to retrieve details from the server. Please try again.',
          onRetry: () => {
            clearElement(this.container);
            this.container.appendChild(States.renderLoading('details'));
            this.loadDetails();
          }
        })
      );
    }
  }

  destroy() {
    this.sceneGallery?.destroy();
  }
}
