/**
 * Live Search Suggestion Dropdown for the Top Navigation Bar.
 */
import { el, createIcon, clearElement } from '../utils/dom.js';
import { debounce } from '../utils/debounce.js';
import { MovieService } from '../api/movieService.js';
import { getPosterFallback, handleImageFallback } from '../utils/imageFallback.js';
import { formatRating } from '../utils/formatters.js';

export class SearchDropdown {
  /**
   * @param {object} options
   * @param {HTMLInputElement} options.inputElement
   * @param {HTMLFormElement} options.formElement
   * @param {(path: string) => void} options.onNavigate
   */
  constructor({ inputElement, formElement, onNavigate }) {
    this.input = inputElement;
    this.form = formElement;
    this.onNavigate = onNavigate;

    this.dropdown = null;
    this.abortController = null;
    this.selectedIndex = -1;
    this.currentItems = [];

    this.handleInput = this.handleInput.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);

    this.debouncedSearch = debounce(this.performSearch.bind(this), 350);
  }

  init() {
    this.dropdown = el('div', {
      className: 'search-dropdown',
      role: 'listbox',
      'aria-label': 'Search Suggestions'
    });

    this.input.parentElement.appendChild(this.dropdown);

    this.input.addEventListener('input', this.handleInput);
    this.input.addEventListener('keydown', this.handleKeyDown);
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = this.input.value.trim();
      if (query) {
        this.close();
        this.onNavigate(`#/search?q=${encodeURIComponent(query)}`);
      }
    });

    document.addEventListener('click', this.handleDocumentClick);
  }

  handleInput() {
    const query = this.input.value.trim();
    if (!query) {
      this.close();
      return;
    }
    this.showLoading();
    this.debouncedSearch(query);
  }

  async performSearch(query) {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    try {
      const { movies } = await MovieService.searchMovies({ query, page: 1, signal });
      if (signal.aborted) return;

      this.currentItems = movies.slice(0, 6);
      this.selectedIndex = -1;
      this.renderResults(query, this.currentItems);
    } catch (err) {
      if (signal.aborted) return;
      this.renderError();
    }
  }

  renderResults(query, movies) {
    clearElement(this.dropdown);

    if (movies.length === 0) {
      const emptyItem = el(
        'div',
        { className: 'search-dropdown-item is-empty' },
        el('div', { className: 'search-dropdown-info' }, `No matches found for "${query}"`)
      );
      this.dropdown.appendChild(emptyItem);
      this.open();
      return;
    }

    const list = el('div', { className: 'search-dropdown-list' });

    movies.forEach((movie, index) => {
      const fallback = getPosterFallback(movie.title);
      const thumb = el('img', {
        className: 'search-dropdown-thumb',
        src: movie.poster || fallback,
        alt: movie.title,
        loading: 'lazy'
      });
      handleImageFallback(thumb, fallback);

      const ratingEl = movie.rating && movie.rating !== 'N/A'
        ? el(
            'div',
            { className: 'search-dropdown-rating' },
            createIcon('star', { width: 10, height: 10 }),
            el('span', {}, formatRating(movie.rating))
          )
        : null;

      const meta = el(
        'div',
        { className: 'search-dropdown-meta' },
        el('span', {}, movie.year !== 'N/A' ? movie.year : ''),
        ratingEl
      );

      const info = el(
        'div',
        { className: 'search-dropdown-info' },
        el('div', { className: 'search-dropdown-title' }, movie.title),
        meta
      );

      const item = el(
        'a',
        {
          className: 'search-dropdown-item',
          href: `#/movie/${movie.id}`,
          role: 'option',
          'aria-selected': 'false',
          dataset: { index: String(index) },
          onClick: (e) => {
            e.preventDefault();
            this.close();
            this.input.value = '';
            this.onNavigate(`#/movie/${movie.id}`);
          }
        },
        thumb,
        info
      );

      list.appendChild(item);
    });

    const footer = el(
      'div',
      {
        className: 'search-dropdown-footer',
        onClick: () => {
          this.close();
          this.onNavigate(`#/search?q=${encodeURIComponent(query)}`);
        }
      },
      `See all results for "${query}" →`
    );

    this.dropdown.appendChild(list);
    this.dropdown.appendChild(footer);
    this.open();
  }

  showLoading() {
    clearElement(this.dropdown);
    const loadingEl = el(
      'div',
      { className: 'search-dropdown-item', style: { padding: '16px' } },
      el('div', { className: 'skeleton skeleton-text', style: { width: '60%', margin: 0 } })
    );
    this.dropdown.appendChild(loadingEl);
    this.open();
  }

  renderError() {
    clearElement(this.dropdown);
    const errEl = el(
      'div',
      { className: 'search-dropdown-item', style: { color: 'var(--color-error)' } },
      'Failed to load suggestions. Press Enter to search.'
    );
    this.dropdown.appendChild(errEl);
    this.open();
  }

  handleKeyDown(e) {
    if (!this.isOpen()) return;

    const items = this.dropdown.querySelectorAll('.search-dropdown-item:not(.is-empty)');
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.selectedIndex = (this.selectedIndex + 1) % items.length;
      this.updateActiveItem(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
      this.updateActiveItem(items);
    } else if (e.key === 'Escape') {
      this.close();
    } else if (e.key === 'Enter') {
      if (this.selectedIndex >= 0 && items[this.selectedIndex]) {
        e.preventDefault();
        items[this.selectedIndex].click();
      }
    }
  }

  updateActiveItem(items) {
    items.forEach((item, idx) => {
      if (idx === this.selectedIndex) {
        item.classList.add('is-active');
        item.setAttribute('aria-selected', 'true');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('is-active');
        item.setAttribute('aria-selected', 'false');
      }
    });
  }

  handleDocumentClick(e) {
    if (!this.dropdown.contains(e.target) && !this.input.contains(e.target)) {
      this.close();
    }
  }

  open() {
    this.dropdown?.classList.add('is-open');
    this.input.setAttribute('aria-expanded', 'true');
  }

  close() {
    this.dropdown?.classList.remove('is-open');
    this.input.setAttribute('aria-expanded', 'false');
    this.selectedIndex = -1;
    this.debouncedSearch.cancel();
  }

  isOpen() {
    return this.dropdown?.classList.contains('is-open') || false;
  }

  destroy() {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.debouncedSearch.cancel();
    document.removeEventListener('click', this.handleDocumentClick);
    this.input.removeEventListener('input', this.handleInput);
    this.input.removeEventListener('keydown', this.handleKeyDown);
  }
}
