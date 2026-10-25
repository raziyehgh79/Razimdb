/**
 * Reusable Loading, Error, and Empty state views.
 */
import { el, createIcon } from '../utils/dom.js';

export const States = {
  /**
   * Renders skeleton placeholder state for various components.
   * @param {'hero'|'grid'|'horizontal-list'|'details'|'cast'} type 
   * @param {number} [count=10]
   * @returns {HTMLElement}
   */
  renderLoading(type, count = 10) {
    const container = el('div', { className: `loading-state-wrapper loading-${type}` });

    if (type === 'hero') {
      const heroSkeleton = el('div', { className: 'skeleton skeleton-hero' });
      container.appendChild(heroSkeleton);
      return container;
    }

    if (type === 'grid') {
      const grid = el('div', { className: 'movie-grid' });
      for (let i = 0; i < count; i++) {
        const card = el(
          'div',
          { className: 'movie-card' },
          el('div', { className: 'skeleton movie-card-poster-wrapper' }),
          el(
            'div',
            { className: 'movie-card-content' },
            el('div', { className: 'skeleton skeleton-text', style: { width: '80%' } }),
            el('div', { className: 'skeleton skeleton-text', style: { width: '40%' } })
          )
        );
        grid.appendChild(card);
      }
      container.appendChild(grid);
      return container;
    }

    if (type === 'horizontal-list') {
      for (let i = 0; i < 5; i++) {
        const card = el(
          'div',
          { className: 'horizontal-movie-card' },
          el('div', { className: 'skeleton horizontal-card-poster-wrapper' }),
          el(
            'div',
            { className: 'horizontal-card-content' },
            el('div', { className: 'skeleton skeleton-title' }),
            el('div', { className: 'skeleton skeleton-text', style: { width: '30%' } }),
            el('div', { className: 'skeleton skeleton-text', style: { width: '90%' } }),
            el('div', { className: 'skeleton skeleton-text', style: { width: '60%' } })
          )
        );
        container.appendChild(card);
      }
      return container;
    }

    if (type === 'details') {
      const headerSkeleton = el(
        'div',
        { className: 'details-header-row' },
        el(
          'div',
          { className: 'details-header-main', style: { flex: 1 } },
          el('div', { className: 'skeleton skeleton-title', style: { width: '50%', height: '40px' } }),
          el('div', { className: 'skeleton skeleton-text', style: { width: '25%' } })
        ),
        el('div', { className: 'skeleton', style: { width: '120px', height: '48px', borderRadius: '8px' } })
      );

      const mainSkeleton = el(
        'div',
        { className: 'details-main-grid' },
        el('div', { className: 'skeleton details-poster-wrapper' }),
        el(
          'div',
          { className: 'details-info-column' },
          el('div', { className: 'skeleton skeleton-text', style: { width: '40%' } }),
          el('div', { className: 'skeleton skeleton-text', style: { width: '100%', height: '80px' } }),
          el('div', { className: 'skeleton skeleton-text', style: { width: '60%' } }),
          el('div', { className: 'skeleton skeleton-text', style: { width: '70%' } })
        )
      );

      container.appendChild(headerSkeleton);
      container.appendChild(mainSkeleton);
      return container;
    }

    if (type === 'cast') {
      const castGrid = el('div', { className: 'cast-grid' });
      for (let i = 0; i < 6; i++) {
        const item = el(
          'div',
          { className: 'cast-card' },
          el('div', { className: 'skeleton cast-photo-wrapper' }),
          el('div', { className: 'skeleton skeleton-text', style: { margin: '8px', width: '70%' } })
        );
        castGrid.appendChild(item);
      }
      container.appendChild(castGrid);
      return container;
    }

    return container;
  },

  /**
   * Renders a friendly, recoverable error message.
   * @param {object} options
   * @param {string} [options.title="Connection Problem"]
   * @param {string} [options.message="Unable to communicate with the movie service. Please check your network and try again."]
   * @param {() => void} [options.onRetry]
   * @returns {HTMLElement}
   */
  renderError({
    title = 'Connection Problem',
    message = 'Unable to communicate with the movie service. Please check your network and try again.',
    onRetry
  } = {}) {
    const box = el(
      'div',
      { className: 'state-box' },
      el('div', { className: 'state-icon is-error' }, createIcon('error', { width: 56, height: 56 })),
      el('h2', { className: 'state-title' }, title),
      el('p', { className: 'state-message' }, message)
    );

    if (typeof onRetry === 'function') {
      const retryBtn = el(
        'button',
        {
          className: 'state-action-btn',
          onClick: onRetry
        },
        'Retry Request'
      );
      box.appendChild(retryBtn);
    }

    return box;
  },

  /**
   * Renders an empty state message with optional CTA.
   * @param {object} options
   * @param {string} [options.title="No Movies Found"]
   * @param {string} [options.message="There are no movies matching your criteria."]
   * @param {string} [options.ctaText]
   * @param {string} [options.ctaHref]
   * @param {() => void} [options.onCta]
   * @returns {HTMLElement}
   */
  renderEmpty({
    title = 'No Movies Found',
    message = 'There are no movies matching your criteria.',
    ctaText = 'Back to Home',
    ctaHref = '#/',
    onCta
  } = {}) {
    const box = el(
      'div',
      { className: 'state-box' },
      el('div', { className: 'state-icon' }, createIcon('film', { width: 56, height: 56 })),
      el('h2', { className: 'state-title' }, title),
      el('p', { className: 'state-message' }, message)
    );

    if (ctaText) {
      if (typeof onCta === 'function') {
        const btn = el('button', { className: 'state-action-btn', onClick: onCta }, ctaText);
        box.appendChild(btn);
      } else if (ctaHref) {
        const link = el('a', { className: 'state-action-btn', href: ctaHref }, ctaText);
        box.appendChild(link);
      }
    }

    return box;
  }
};
