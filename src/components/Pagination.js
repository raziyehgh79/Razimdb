/**
 * Reusable Accessible Pagination Component.
 */
import { el, createIcon } from '../utils/dom.js';

/**
 * Creates pagination controls.
 * @param {object} options
 * @param {number} options.currentPage
 * @param {number} options.pageCount
 * @param {(page: number) => void} options.onPageChange
 * @returns {HTMLElement|null}
 */
export function createPagination({ currentPage, pageCount, onPageChange }) {
  if (!pageCount || pageCount <= 1) {
    return null;
  }

  const container = el('nav', {
    className: 'pagination-container',
    'aria-label': 'Pagination Navigation'
  });

  // Prev Button
  const prevBtn = el(
    'button',
    {
      className: 'pagination-btn pagination-prev',
      disabled: currentPage <= 1,
      'aria-label': 'Go to previous page',
      onClick: () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
      }
    },
    createIcon('arrow-left', { width: 14, height: 14 })
  );
  container.appendChild(prevBtn);

  // Generate numbered pages array
  const pages = getPageNumbers(currentPage, pageCount);

  pages.forEach((pageItem) => {
    if (pageItem === '...') {
      const ellipsis = el('span', { className: 'pagination-ellipsis' }, '...');
      container.appendChild(ellipsis);
    } else {
      const pageNum = Number(pageItem);
      const isCurrent = pageNum === currentPage;
      const pageBtn = el(
        'button',
        {
          className: `pagination-btn ${isCurrent ? 'is-active' : ''}`,
          'aria-label': `Go to page ${pageNum}`,
          'aria-current': isCurrent ? 'page' : undefined,
          onClick: () => {
            if (!isCurrent) onPageChange(pageNum);
          }
        },
        String(pageNum)
      );
      container.appendChild(pageBtn);
    }
  });

  // Next Button
  const nextBtn = el(
    'button',
    {
      className: 'pagination-btn pagination-next',
      disabled: currentPage >= pageCount,
      'aria-label': 'Go to next page',
      onClick: () => {
        if (currentPage < pageCount) onPageChange(currentPage + 1);
      }
    },
    createIcon('arrow-right', { width: 14, height: 14 })
  );
  container.appendChild(nextBtn);

  return container;
}

/**
 * Helper to calculate page numbers list with ellipsis.
 * @param {number} current 
 * @param {number} total 
 * @returns {Array<number|string>}
 */
function getPageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [];
  pages.push(1);

  if (current > 3) {
    pages.push('...');
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push('...');
  }

  pages.push(total);
  return pages;
}
