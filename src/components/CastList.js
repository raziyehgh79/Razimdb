/**
 * Asynchronously enriched Cast List component.
 */
import { el } from '../utils/dom.js';
import { PeopleService } from '../api/peopleService.js';
import { getActorAvatarFallback, handleImageFallback } from '../utils/imageFallback.js';

export class CastList {
  /**
   * @param {string[]} actors - List of actor names.
   * @param {AbortSignal} [signal]
   */
  constructor(actors = [], signal) {
    this.actors = actors;
    this.signal = signal;
    this.container = null;
  }

  /**
   * Renders initial cast cards and triggers asynchronous photo enrichment.
   * @returns {HTMLElement}
   */
  render() {
    if (!this.actors || this.actors.length === 0) {
      return el('div', { className: 'cast-empty-note' }, el('p', { className: 'text-muted' }, 'No cast credits listed for this title.'));
    }

    const grid = el('div', { className: 'cast-grid', 'aria-label': 'Movie Cast' });
    this.container = grid;

    const visibleActors = this.actors.slice(0, 6);

    // Initial render with fallback initials avatars
    const cardMap = new Map();
    visibleActors.forEach((actorName) => {
      const fallbackSrc = getActorAvatarFallback(actorName);

      const photoImg = el('img', {
        className: 'cast-photo',
        src: fallbackSrc,
        alt: actorName,
        loading: 'lazy'
      });

      const card = el(
        'div',
        { className: 'cast-card', 'data-actor': actorName },
        el('div', { className: 'cast-photo-wrapper' }, photoImg),
        el('span', { className: 'cast-name', title: actorName }, actorName)
      );

      cardMap.set(actorName, photoImg);
      grid.appendChild(card);
    });

    // Asynchronously enrich with TVmaze photos
    this.enrichPhotos(visibleActors, cardMap);

    return grid;
  }

  async enrichPhotos(visibleActors, cardMap) {
    try {
      const enriched = await PeopleService.enrichCast(visibleActors, 6, this.signal);
      if (this.signal?.aborted) return;

      enriched.forEach((item) => {
        if (item.photo && cardMap.has(item.name)) {
          const img = cardMap.get(item.name);
          const fallbackSrc = getActorAvatarFallback(item.name);
          img.src = item.photo;
          handleImageFallback(img, fallbackSrc);
        }
      });
    } catch {
      // Enrichment failure silently preserves fallback avatars
    }
  }
}
