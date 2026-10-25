/**
 * Genres Dropdown Menu component in Top Navigation Bar.
 */
import { el, createIcon, clearElement } from '../utils/dom.js';
import { MovieService } from '../api/movieService.js';

export class GenreDropdown {
  /**
   * @param {object} options
   * @param {(path: string) => void} options.onNavigate
   */
  constructor({ onNavigate }) {
    this.onNavigate = onNavigate;
    this.wrapper = null;
    this.triggerBtn = null;
    this.menu = null;
    this.genres = [];
    this.isOpen = false;

    this.toggle = this.toggle.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  render() {
    this.triggerBtn = el(
      'button',
      {
        className: 'genre-trigger-btn',
        type: 'button',
        'aria-haspopup': 'true',
        'aria-expanded': 'false',
        onClick: this.toggle
      },
      el('span', { className: 'genre-trigger-text' }, 'Genres'),
      el('span', { className: 'genre-trigger-icon' }, createIcon('chevron-down', { width: 14, height: 14 }))
    );

    this.menu = el('div', {
      className: 'genre-dropdown-menu',
      role: 'menu',
      'aria-label': 'Movie Genres'
    });

    this.wrapper = el('div', { className: 'genre-dropdown-wrapper' }, this.triggerBtn, this.menu);

    document.addEventListener('click', this.handleDocumentClick);
    document.addEventListener('keydown', this.handleKeyDown);

    return this.wrapper;
  }

  async loadGenres() {
    if (this.genres.length > 0) return;

    try {
      this.genres = await MovieService.getGenres();
      clearElement(this.menu);

      this.genres.forEach((genre) => {
        const item = el(
          'a',
          {
            className: 'genre-dropdown-item',
            href: `#/genres/${genre.id}`,
            role: 'menuitem',
            onClick: (e) => {
              e.preventDefault();
              this.close();
              this.onNavigate(`#/genres/${genre.id}`);
            }
          },
          genre.name
        );
        this.menu.appendChild(item);
      });
    } catch {
      clearElement(this.menu);
      this.menu.appendChild(
        el('div', { style: { padding: '8px', color: 'var(--color-error)' } }, 'Failed to load genres.')
      );
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  async open() {
    this.isOpen = true;
    this.triggerBtn.setAttribute('aria-expanded', 'true');
    this.menu.classList.add('is-open');
    await this.loadGenres();
  }

  close() {
    this.isOpen = false;
    this.triggerBtn?.setAttribute('aria-expanded', 'false');
    this.menu?.classList.remove('is-open');
  }

  handleDocumentClick(e) {
    if (this.isOpen && this.wrapper && !this.wrapper.contains(e.target)) {
      this.close();
    }
  }

  handleKeyDown(e) {
    if (e.key === 'Escape' && this.isOpen) {
      this.close();
      this.triggerBtn.focus();
    }
  }

  destroy() {
    document.removeEventListener('click', this.handleDocumentClick);
    document.removeEventListener('keydown', this.handleKeyDown);
  }
}
