/**
 * Genres Page View (#/genres/:id).
 */
import { el, createIcon, clearElement } from '../utils/dom.js';
import { MovieService } from '../api/movieService.js';
import { createHorizontalMovieCard } from '../components/HorizontalMovieCard.js';
import { createPagination } from '../components/Pagination.js';
import { States } from '../components/States.js';

export class GenresPage {
  /**
   * @param {object} options
   * @param {Record<string, string>} options.params
   * @param {URLSearchParams} options.query
   * @param {import('../router/router.js').Router} options.router
   * @param {AbortSignal} options.signal
   */
  constructor({ params, query, router, signal }) {
    this.genreId = params.id || '1';
    this.router = router;
    this.signal = signal;
    this.currentPage = parseInt(query.get('page') || '1', 10);
    this.sortOrder = 'desc'; // 'desc' | 'asc'
    this.genresList = [];
    this.movies = [];
    this.metadata = null;

    this.container = null;
    this.sidebarContainer = null;
    this.mainContentContainer = null;
  }

  async render() {
    document.title = 'Explore Genres — RaziMDb';

    this.container = el('div', { className: 'genres-page-layout' });

    // Left Sidebar
    this.sidebarContainer = el('aside', {
      className: 'genres-sidebar',
      'aria-label': 'Genre Categories'
    });
    this.sidebarContainer.appendChild(el('h2', { className: 'genres-sidebar-title' }, 'Genres'));

    // Main Content
    this.mainContentContainer = el('main', {
      className: 'genres-main-content',
      'aria-label': 'Movies by Genre'
    });

    this.mainContentContainer.appendChild(States.renderLoading('horizontal-list'));

    this.container.appendChild(this.sidebarContainer);
    this.container.appendChild(this.mainContentContainer);

    this.initData();
    return this.container;
  }

  async initData() {
    try {
      const genres = await MovieService.getGenres(this.signal);
      if (this.signal.aborted) return;

      this.genresList = genres;
      this.renderSidebar();

      // If genreId is not valid, default to first genre
      if (!this.genresList.some((g) => String(g.id) === String(this.genreId))) {
        this.genreId = String(this.genresList[0]?.id || '1');
      }

      await this.loadMovies();
    } catch (err) {
      if (this.signal.aborted) return;
      clearElement(this.mainContentContainer);
      this.mainContentContainer.appendChild(
        States.renderError({
          title: 'Unable to Load Genre Content',
          message: 'An error occurred while loading genre data.',
          onRetry: () => this.initData()
        })
      );
    }
  }

  renderSidebar() {
    const existingNav = this.sidebarContainer.querySelector('.genres-list-nav');
    if (existingNav) existingNav.remove();

    const nav = el('nav', { className: 'genres-list-nav', 'aria-label': 'Genres Navigation' });

    this.genresList.forEach((genre) => {
      const isActive = String(genre.id) === String(this.genreId);
      const link = el(
        'a',
        {
          className: `genres-nav-link ${isActive ? 'is-active' : ''}`,
          href: `#/genres/${genre.id}`,
          'aria-current': isActive ? 'page' : undefined,
          onClick: (e) => {
            e.preventDefault();
            if (isActive) return;
            this.genreId = String(genre.id);
            this.currentPage = 1;
            this.renderSidebar();
            this.router.navigate(`#/genres/${genre.id}`);
          }
        },
        genre.name
      );
      nav.appendChild(link);
    });

    this.sidebarContainer.appendChild(nav);
  }

  async loadMovies() {
    clearElement(this.mainContentContainer);
    this.mainContentContainer.appendChild(States.renderLoading('horizontal-list'));

    try {
      const currentGenreObj = this.genresList.find(
        (g) => String(g.id) === String(this.genreId)
      );
      const genreName = currentGenreObj ? currentGenreObj.name : 'Genre';
      document.title = `${genreName} Movies — RaziMDb`;

      const { movies, metadata } = await MovieService.getMoviesByGenre({
        genreId: this.genreId,
        page: this.currentPage,
        signal: this.signal
      });

      if (this.signal.aborted) return;
      this.movies = movies;
      this.metadata = metadata;

      clearElement(this.mainContentContainer);
      this.renderMainContent(genreName);
    } catch (err) {
      if (this.signal.aborted) return;
      clearElement(this.mainContentContainer);
      this.mainContentContainer.appendChild(
        States.renderError({
          title: 'Failed to load movies for this genre',
          message: 'Unable to fetch titles. Please try again.',
          onRetry: () => this.loadMovies()
        })
      );
    }
  }

  renderMainContent(genreName) {
    // 1. Toolbar
    const sortBtn = el(
      'button',
      {
        className: 'sort-control-btn',
        type: 'button',
        'aria-label': `Sort by ranking: currently ${this.sortOrder === 'desc' ? 'highest first' : 'lowest first'}`,
        onClick: () => {
          this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
          this.renderMainContent(genreName);
        }
      },
      el('span', {}, `Sort by: Ranking ${this.sortOrder === 'desc' ? '↓' : '↑'}`),
      createIcon('sort', { width: 14, height: 14 })
    );

    const countText = this.metadata?.totalCount
      ? `${this.metadata.totalCount} titles`
      : `${this.movies.length} titles`;

    const countLabel = el('span', { className: 'genres-count-label' }, countText);

    const toolbar = el('div', { className: 'genres-toolbar' }, sortBtn, countLabel);
    this.mainContentContainer.appendChild(toolbar);

    // 2. Movie List with Client-Side Ranking Sorting on copied array
    const sortedMovies = [...this.movies].sort((a, b) => {
      const ratingA = parseFloat(a.rating) || 0;
      const ratingB = parseFloat(b.rating) || 0;
      return this.sortOrder === 'desc' ? ratingB - ratingA : ratingA - ratingB;
    });

    if (sortedMovies.length === 0) {
      this.mainContentContainer.appendChild(
        States.renderEmpty({
          title: 'No Movies in this Genre',
          message: `Currently there are no movies listed under ${genreName}.`,
          ctaText: 'Browse All Movies',
          ctaHref: '#/'
        })
      );
      return;
    }

    const listContainer = el('div', { className: 'horizontal-movies-list' });
    sortedMovies.forEach((movie) => {
      listContainer.appendChild(createHorizontalMovieCard(movie));
    });
    this.mainContentContainer.appendChild(listContainer);

    // 3. Pagination
    if (this.metadata && this.metadata.pageCount > 1) {
      const pagination = createPagination({
        currentPage: this.metadata.currentPage,
        pageCount: this.metadata.pageCount,
        onPageChange: (newPage) => {
          this.currentPage = newPage;
          this.loadMovies();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
      if (pagination) {
        this.mainContentContainer.appendChild(pagination);
      }
    }
  }

  destroy() {
    this.movies = [];
  }
}
