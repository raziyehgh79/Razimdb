/**
 * Home Page View (#/).
 */
import { el, clearElement } from '../utils/dom.js';
import { MovieService } from '../api/movieService.js';
import { HeroSlider } from '../components/HeroSlider.js';
import { createMovieCard } from '../components/MovieCard.js';
import { createPagination } from '../components/Pagination.js';
import { States } from '../components/States.js';

export class HomePage {
  /**
   * @param {object} options
   * @param {URLSearchParams} options.query
   * @param {import('../router/router.js').Router} options.router
   * @param {AbortSignal} options.signal
   */
  constructor({ query, router, signal }) {
    this.router = router;
    this.signal = signal;
    this.currentPage = parseInt(query.get('page') || '1', 10);
    this.heroSlider = null;
    this.container = null;
    this.catalogSection = null;
  }

  async render() {
    document.title = 'RaziMDb — Discover Movies & TV';

    this.container = el('div', { className: 'home-page-container' });

    // Initial Loading Skeleton
    const heroSkeleton = States.renderLoading('hero');
    const gridSkeleton = States.renderLoading('grid', 10);
    this.container.appendChild(heroSkeleton);
    this.container.appendChild(gridSkeleton);

    this.loadData();
    return this.container;
  }

  async loadData() {
    try {
      const { movies, metadata } = await MovieService.getMovies({
        page: this.currentPage,
        signal: this.signal
      });

      if (this.signal.aborted) return;
      clearElement(this.container);

      // 1. Hero Slider on Page 1 (or top 5 movies)
      if (movies.length > 0) {
        this.heroSlider = new HeroSlider(movies.slice(0, 5));
        const heroEl = this.heroSlider.render();
        this.container.appendChild(heroEl);
      }

      // 2. Catalog Section
      this.catalogSection = el('section', {
        className: 'catalog-section',
        'aria-label': 'Top Movies Catalog'
      });

      const sectionHeader = el(
        'div',
        { className: 'section-header' },
        el('h2', { className: 'section-title' }, 'Explore Movies')
      );
      this.catalogSection.appendChild(sectionHeader);

      if (movies.length === 0) {
        this.catalogSection.appendChild(
          States.renderEmpty({
            title: 'No Movies Available',
            message: 'No movie records are currently returned by the server.'
          })
        );
      } else {
        const grid = el('div', { className: 'movie-grid' });
        movies.forEach((movie) => {
          grid.appendChild(createMovieCard(movie));
        });
        this.catalogSection.appendChild(grid);

        // 3. Pagination
        const pagination = createPagination({
          currentPage: metadata.currentPage,
          pageCount: metadata.pageCount,
          onPageChange: (newPage) => {
            this.currentPage = newPage;
            this.goToPage(newPage);
          }
        });

        if (pagination) {
          this.catalogSection.appendChild(pagination);
        }
      }

      this.container.appendChild(this.catalogSection);
    } catch (err) {
      if (this.signal.aborted) return;
      clearElement(this.container);
      this.container.appendChild(
        States.renderError({
          title: 'Unable to Load Catalog',
          message: 'An error occurred while loading movies. Please verify your connection.',
          onRetry: () => {
            clearElement(this.container);
            this.container.appendChild(States.renderLoading('grid', 10));
            this.loadData();
          }
        })
      );
    }
  }

  async goToPage(page) {
    if (this.catalogSection) {
      clearElement(this.catalogSection);
      const sectionHeader = el(
        'div',
        { className: 'section-header' },
        el('h2', { className: 'section-title' }, 'Explore Movies')
      );
      this.catalogSection.appendChild(sectionHeader);
      this.catalogSection.appendChild(States.renderLoading('grid', 10));
      this.catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    try {
      const { movies, metadata } = await MovieService.getMovies({
        page,
        signal: this.signal
      });
      if (this.signal.aborted) return;

      clearElement(this.catalogSection);
      const sectionHeader = el(
        'div',
        { className: 'section-header' },
        el('h2', { className: 'section-title' }, 'Explore Movies')
      );
      this.catalogSection.appendChild(sectionHeader);

      const grid = el('div', { className: 'movie-grid' });
      movies.forEach((movie) => {
        grid.appendChild(createMovieCard(movie));
      });
      this.catalogSection.appendChild(grid);

      const pagination = createPagination({
        currentPage: metadata.currentPage,
        pageCount: metadata.pageCount,
        onPageChange: (p) => this.goToPage(p)
      });
      if (pagination) {
        this.catalogSection.appendChild(pagination);
      }
    } catch (err) {
      if (this.signal.aborted) return;
      clearElement(this.catalogSection);
      this.catalogSection.appendChild(
        States.renderError({
          title: 'Failed to load page',
          message: 'Could not fetch page ' + page,
          onRetry: () => this.goToPage(page)
        })
      );
    }
  }

  destroy() {
    this.heroSlider?.destroy();
  }
}
