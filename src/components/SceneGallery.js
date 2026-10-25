/**
 * Scene Gallery component with accessible Lightbox.
 */
import { el, createIcon } from '../utils/dom.js';
import { getSceneFallback, handleImageFallback } from '../utils/imageFallback.js';

export class SceneGallery {
  /**
   * @param {string[]} images - Array of scene image URLs.
   * @param {string} movieTitle - Movie title for alt tags.
   */
  constructor(images = [], movieTitle = 'Movie') {
    this.images = images.slice(0, 3);
    this.movieTitle = movieTitle;
    this.lightbox = null;
    this.lightboxImg = null;
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  /**
   * Renders the 3-scene gallery grid.
   * @returns {HTMLElement|null}
   */
  render() {
    if (!this.images || this.images.length === 0) {
      return null;
    }

    const grid = el('div', {
      className: 'scene-gallery-grid',
      'aria-label': `${this.movieTitle} scene gallery`
    });

    this.images.forEach((imgUrl, index) => {
      const fallback = getSceneFallback(`${this.movieTitle} Scene ${index + 1}`);

      const img = el('img', {
        className: 'scene-img',
        src: imgUrl || fallback,
        alt: `${this.movieTitle} scene ${index + 1}`,
        loading: 'lazy'
      });
      handleImageFallback(img, fallback);

      const item = el(
        'button',
        {
          className: 'scene-item',
          type: 'button',
          'aria-label': `View full screen scene ${index + 1}`,
          onClick: () => this.openLightbox(img.src)
        },
        img
      );

      grid.appendChild(item);
    });

    this.initLightbox();
    return grid;
  }

  initLightbox() {
    this.lightboxImg = el('img', {
      className: 'lightbox-img',
      src: '',
      alt: 'Enlarged movie scene'
    });

    const closeBtn = el(
      'button',
      {
        className: 'lightbox-close-btn',
        'aria-label': 'Close full view',
        onClick: () => this.closeLightbox()
      },
      createIcon('close', { width: 24, height: 24 })
    );

    const content = el('div', { className: 'lightbox-content' }, this.lightboxImg, closeBtn);

    this.lightbox = el(
      'div',
      {
        className: 'lightbox-modal',
        role: 'dialog',
        'aria-modal': 'true',
        'aria-label': 'Scene Viewer',
        onClick: (e) => {
          if (e.target === this.lightbox) {
            this.closeLightbox();
          }
        }
      },
      content
    );

    document.body.appendChild(this.lightbox);
  }

  openLightbox(src) {
    if (!this.lightbox || !this.lightboxImg) return;
    this.lightboxImg.src = src;
    this.lightbox.classList.add('is-open');
    document.addEventListener('keydown', this.handleKeyDown);
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    if (!this.lightbox) return;
    this.lightbox.classList.remove('is-open');
    document.removeEventListener('keydown', this.handleKeyDown);
    document.body.style.overflow = '';
  }

  handleKeyDown(e) {
    if (e.key === 'Escape') {
      this.closeLightbox();
    }
  }

  destroy() {
    this.closeLightbox();
    if (this.lightbox && this.lightbox.parentNode) {
      this.lightbox.parentNode.removeChild(this.lightbox);
    }
    this.lightbox = null;
    this.lightboxImg = null;
  }
}
