/**
 * Search Results Page View (#/search?q=:query).
 */
import { el, clearElement } from '../utils/dom.js';
import { MovieService } from '../api/movieService.js';
import { createMovieCard } from '../components/MovieCard.js';
import { createPagination } from '../components/Pagination.js';
import { States } from '../components/States.js';

export class SearchResultsPage {
  /**
   * @param {object} options
   * @param {URLSearchParams} options.query
   * @param {import('../router/router.js').Router} options.router
   * @param {AbortSignal} options.signal
   */
  constructor({ query, router, signal }) {
    this.queryStr = query.get('q') || '';
    this.currentPage = parseInt(query.get('page') || '1', 10);
    this.router = router;
    this.signal = signal;
    this.container = null;
  }

  async render() {
    document.title = this.queryStr
      ? `Results for "${this.queryStr}" — RaziMDb`
      : 'Search Movies — RaziMDb';

    this.container = el('div', { className: 'search-results-page' });

    // Initial Skeleton
    this.container.appendChild(States.renderLoading('grid', 10));

    this.loadResults();
    return this.container;
  }

  async loadResults() {
    if (!this.queryStr.trim()) {
      clearElement(this.container);
      this.container.appendChild(
        States.renderEmpty({
          title: 'Search RaziMDb',
          message: 'Please enter a movie title or keyword in the search bar above.',
          ctaText: 'Browse Popular Movies',
          ctaHref: '#/'
        })
      );
      return;
    }

    try {
      const { movies, metadata } = await MovieService.searchMovies({
        query: this.queryStr,
        page: this.currentPage,
        signal: this.signal
      });

      if (this.signal.aborted) return;
      clearElement(this.container);

      // 1. Header Row
      const countLabel = metadata.totalCount > 0
        ? `${metadata.totalCount} ${metadata.totalCount === 1 ? 'title' : 'titles'} found`
        : '';

      const header = el(
        'div',
        { className: 'search-results-header' },
        el(
          'h1',
          { className: 'search-results-title' },
          'Results for "',
          el('span', {}, this.queryStr),
          '"'
        ),
        el('span', { className: 'search-results-count' }, countLabel)
      );

      this.container.appendChild(header);

      // 2. Results Grid
      if (movies.length === 0) {
        this.container.appendChild(
          States.renderEmpty({
            title: 'No Matching Movies',
            message: `We could not find any titles matching "${this.queryStr}". Please try another keyword.`,
            ctaText: 'Clear Search',
            ctaHref: '#/'
          })
        );
        return;
      }

      const grid = el('div', { className: 'movie-grid' });
      movies.forEach((movie) => {
        grid.appendChild(createMovieCard(movie));
      });
      this.container.appendChild(grid);

      // 3. Pagination
      if (metadata.pageCount > 1) {
        const pagination = createPagination({
          currentPage: metadata.currentPage,
          pageCount: metadata.pageCount,
          onPageChange: (newPage) => {
            this.currentPage = newPage;
            this.router.navigate(
              `#/search?q=${encodeURIComponent(this.queryStr)}&page=${newPage}`
            );
          }
        });

        if (pagination) {
          this.container.appendChild(pagination);
        }
      }
    } catch (err) {
      if (this.signal.aborted) return;
      clearElement(this.container);
      this.container.appendChild(
        States.renderError({
          title: 'Search Request Failed',
          message: 'Unable to communicate with the search endpoint. Please try again.',
          onRetry: () => {
            clearElement(this.container);
            this.container.appendChild(States.renderLoading('grid', 10));
            this.loadResults();
          }
        })
      );
    }
  }

  destroy() {}
}
