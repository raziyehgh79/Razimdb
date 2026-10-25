/**
 * Cinematic Hero Carousel Slider for Home Page.
 */
import { el } from '../utils/dom.js';
import { getSceneFallback } from '../utils/imageFallback.js';

export class HeroSlider {
  /**
   * @param {object[]} movies - Array of normalized movie objects (up to 5).
   */
  constructor(movies = []) {
    this.movies = movies.slice(0, 5);
    this.currentIndex = 0;
    this.timerId = null;
    this.isPaused = false;
    this.element = null;
    this.slides = [];
    this.dots = [];

    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleFocusIn = this.handleFocusIn.bind(this);
    this.handleFocusOut = this.handleFocusOut.bind(this);
  }

  /**
   * Renders the hero slider DOM structure.
   * @returns {HTMLElement}
   */
  render() {
    if (this.movies.length === 0) {
      this.element = el('div', { className: 'hero-slider-section is-empty' });
      return this.element;
    }

    const section = el('section', {
      className: 'hero-slider-section',
      'aria-label': 'Featured Movies Carousel',
      'aria-roledescription': 'carousel'
    });

    // Create Slides
    this.movies.forEach((movie, index) => {
      const slide = this.createSlide(movie, index);
      this.slides.push(slide);
      section.appendChild(slide);
    });

    // Create Navigation Dots
    if (this.movies.length > 1) {
      const dotsContainer = el('div', {
        className: 'hero-pagination-dots',
        role: 'tablist',
        'aria-label': 'Slide selectors'
      });

      this.movies.forEach((movie, index) => {
        const dot = el('button', {
          className: `hero-dot ${index === 0 ? 'is-active' : ''}`,
          role: 'tab',
          'aria-selected': index === 0 ? 'true' : 'false',
          'aria-label': `Slide ${index + 1}: ${movie.title}`,
          onClick: () => this.goToSlide(index)
        });
        this.dots.push(dot);
        dotsContainer.appendChild(dot);
      });

      section.appendChild(dotsContainer);
    }

    this.element = section;
    this.attachEvents();
    this.startAutoPlay();

    return section;
  }

  /**
   * Creates a single slide element.
   * @param {object} movie 
   * @param {number} index 
   * @returns {HTMLElement}
   */
  createSlide(movie, index) {
    const isActive = index === 0;
    const bgUrl = movie.backdrop || movie.poster || getSceneFallback(movie.title);

    const slide = el('div', {
      className: `hero-slide ${isActive ? 'is-active' : ''}`,
      role: 'tabpanel',
      'aria-hidden': isActive ? 'false' : 'true',
      'aria-label': `${index + 1} of ${this.movies.length}`,
      style: {
        backgroundImage: `url("${bgUrl}")`
      }
    });

    const vignette = el('div', { className: 'hero-vignette' });

    // Genre badges
    const badges = Array.isArray(movie.genres) && movie.genres.length > 0
      ? el(
          'div',
          { className: 'hero-badges' },
          ...movie.genres.slice(0, 3).map((g) => el('span', { className: 'genre-badge' }, g))
        )
      : null;

    // Content container
    const details = el(
      'div',
      { className: 'hero-details' },
      el('h2', { className: 'hero-title' }, movie.title),
      badges,
      el('p', { className: 'hero-plot' }, movie.plot),
      movie.year !== 'N/A'
        ? el('div', { className: 'hero-release-note' }, `Release: ${movie.year} ${movie.rated !== 'N/A' ? `• ${movie.rated}` : ''}`)
        : null,
      el(
        'a',
        {
          className: 'hero-cta-btn',
          href: `#/movie/${movie.id}`,
          'aria-label': `View details for ${movie.title}`
        },
        'View Details'
      )
    );

    const container = el('div', { className: 'hero-content-container' }, details);

    slide.appendChild(vignette);
    slide.appendChild(container);

    return slide;
  }

  /**
   * Navigates to a specific slide index.
   * @param {number} index 
   */
  goToSlide(index) {
    if (index === this.currentIndex || index < 0 || index >= this.movies.length) {
      return;
    }

    // Update active slide
    this.slides[this.currentIndex]?.classList.remove('is-active');
    this.slides[this.currentIndex]?.setAttribute('aria-hidden', 'true');
    this.dots[this.currentIndex]?.classList.remove('is-active');
    this.dots[this.currentIndex]?.setAttribute('aria-selected', 'false');

    this.currentIndex = index;

    this.slides[this.currentIndex]?.classList.add('is-active');
    this.slides[this.currentIndex]?.setAttribute('aria-hidden', 'false');
    this.dots[this.currentIndex]?.classList.add('is-active');
    this.dots[this.currentIndex]?.setAttribute('aria-selected', 'true');

    // Reset auto play timer on manual navigation
    this.restartAutoPlay();
  }

  nextSlide() {
    const nextIdx = (this.currentIndex + 1) % this.movies.length;
    this.goToSlide(nextIdx);
  }

  startAutoPlay() {
    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || this.movies.length <= 1) return;

    this.stopAutoPlay();
    this.timerId = setInterval(() => {
      if (!this.isPaused) {
        this.nextSlide();
      }
    }, 6000);
  }

  restartAutoPlay() {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  stopAutoPlay() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  attachEvents() {
    if (!this.element) return;
    this.element.addEventListener('mouseenter', this.handleMouseEnter);
    this.element.addEventListener('mouseleave', this.handleMouseLeave);
    this.element.addEventListener('focusin', this.handleFocusIn);
    this.element.addEventListener('focusout', this.handleFocusOut);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  handleMouseEnter() {
    this.isPaused = true;
  }

  handleMouseLeave() {
    this.isPaused = false;
  }

  handleFocusIn() {
    this.isPaused = true;
  }

  handleFocusOut() {
    this.isPaused = false;
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.isPaused = true;
    } else {
      this.isPaused = false;
    }
  }

  destroy() {
    this.stopAutoPlay();
    if (this.element) {
      this.element.removeEventListener('mouseenter', this.handleMouseEnter);
      this.element.removeEventListener('mouseleave', this.handleMouseLeave);
      this.element.removeEventListener('focusin', this.handleFocusIn);
      this.element.removeEventListener('focusout', this.handleFocusOut);
    }
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.slides = [];
    this.dots = [];
    this.element = null;
  }
}
