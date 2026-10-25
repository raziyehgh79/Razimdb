/**
 * Global Top Navigation Bar component.
 */
import { el, createIcon } from '../utils/dom.js';
import { SearchDropdown } from './SearchDropdown.js';
import { GenreDropdown } from './GenreDropdown.js';

export class Navbar {
  /**
   * @param {object} options
   * @param {(path: string) => void} options.onNavigate
   */
  constructor({ onNavigate }) {
    this.onNavigate = onNavigate;
    this.searchDropdown = null;
    this.genreDropdown = null;
  }

  render() {
    const header = el('header', { className: 'site-header', role: 'banner' });

    // 1. Logo
    const logo = el(
      'a',
      {
        className: 'brand-logo',
        href: '#/',
        'aria-label': 'RaziMDb Home'
      },
      'RaziMDb'
    );

    // 2. Search Form
    const searchInput = el('input', {
      className: 'search-input',
      type: 'search',
      name: 'q',
      placeholder: 'Search RaziMDb...',
      'aria-label': 'Search movies by title',
      autocomplete: 'off',
      autocorrect: 'off',
      autocapitalize: 'off',
      spellcheck: 'false'
    });

    const searchSubmitBtn = el(
      'button',
      {
        className: 'search-btn',
        type: 'submit',
        'aria-label': 'Execute search'
      },
      createIcon('search', { width: 18, height: 18 })
    );

    const searchContainer = el(
      'div',
      { className: 'search-input-container' },
      searchInput,
      searchSubmitBtn
    );

    const searchForm = el(
      'form',
      { className: 'search-form', role: 'search' },
      searchContainer
    );

    const searchWrapper = el('div', { className: 'navbar-search-wrapper' }, searchForm);

    // Initialize SearchDropdown
    this.searchDropdown = new SearchDropdown({
      inputElement: searchInput,
      formElement: searchForm,
      onNavigate: this.onNavigate
    });
    this.searchDropdown.init();

    // 3. Genres Dropdown
    this.genreDropdown = new GenreDropdown({
      onNavigate: this.onNavigate
    });
    const genreDropdownEl = this.genreDropdown.render();

    // Container
    const container = el(
      'div',
      { className: 'header-container' },
      logo,
      searchWrapper,
      genreDropdownEl
    );

    header.appendChild(container);
    return header;
  }

  destroy() {
    this.searchDropdown?.destroy();
    this.genreDropdown?.destroy();
  }
}
