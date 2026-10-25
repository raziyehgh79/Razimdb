/**
 * Safe DOM creation and manipulation utilities for RaziMDb.
 */

/**
 * Escapes unsafe characters for HTML safety.
 * @param {string} str 
 * @returns {string}
 */
export function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Safely clears all children of a DOM element.
 * @param {HTMLElement} element 
 */
export function clearElement(element) {
  if (!element) return;
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Creates a DOM element with attributes, event listeners, and children safely without raw innerHTML injection.
 * @param {string} tag - Tag name (e.g. 'div', 'button', 'a')
 * @param {Record<string, any>} [attrs] - Element attributes or listeners
 * @param {...(Node|string|null|undefined|Array<Node|string>)} [children] - Child nodes or text strings
 * @returns {HTMLElement}
 */
export function el(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);

  for (const [key, val] of Object.entries(attrs)) {
    if (val === null || val === undefined) continue;

    if (key.startsWith('on') && typeof val === 'function') {
      const eventName = key.slice(2).toLowerCase();
      element.addEventListener(eventName, val);
    } else if (key === 'className') {
      element.className = val;
    } else if (key === 'dataset' && typeof val === 'object') {
      for (const [dataKey, dataVal] of Object.entries(val)) {
        element.dataset[dataKey] = dataVal;
      }
    } else if (key === 'style' && typeof val === 'object') {
      Object.assign(element.style, val);
    } else if (typeof val === 'boolean') {
      if (val) element.setAttribute(key, '');
    } else {
      element.setAttribute(key, String(val));
    }
  }

  const append = (child) => {
    if (child === null || child === undefined) return;
    if (Array.isArray(child)) {
      child.forEach(append);
    } else if (child instanceof Node) {
      element.appendChild(child);
    } else {
      element.appendChild(document.createTextNode(String(child)));
    }
  };

  children.forEach(append);
  return element;
}

/**
 * Creates inline SVG icon elements safely.
 * @param {string} name 
 * @param {Record<string, any>} [options]
 * @returns {SVGSVGElement}
 */
export function createIcon(name, options = {}) {
  const width = options.width || 18;
  const height = options.height || 18;
  const className = options.className || 'icon';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('class', className);
  svg.setAttribute('aria-hidden', 'true');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

  switch (name) {
    case 'search':
      path.setAttribute('d', 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z');
      svg.appendChild(path);
      break;

    case 'star':
      svg.setAttribute('fill', 'currentColor');
      svg.setAttribute('stroke', 'none');
      path.setAttribute('d', 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z');
      svg.appendChild(path);
      break;

    case 'chevron-down':
      path.setAttribute('d', 'M6 9l6 6 6-6');
      svg.appendChild(path);
      break;

    case 'sort':
      path.setAttribute('d', 'M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4');
      svg.appendChild(path);
      break;

    case 'close':
      path.setAttribute('d', 'M18 6L6 18M6 6l12 12');
      svg.appendChild(path);
      break;

    case 'arrow-left':
      path.setAttribute('d', 'M15 19l-7-7 7-7');
      svg.appendChild(path);
      break;

    case 'arrow-right':
      path.setAttribute('d', 'M9 5l7 7-7 7');
      svg.appendChild(path);
      break;

    case 'error':
      path.setAttribute('d', 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z');
      svg.appendChild(path);
      break;

    case 'film':
      path.setAttribute('d', 'M19.82 2H4.18C2.97 2 2 2.97 2 4.18v15.64C2 21.03 2.97 22 4.18 22h15.64c1.21 0 2.18-.97 2.18-2.18V4.18C22 2.97 21.03 2 19.82 2zM7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5');
      svg.appendChild(path);
      break;

    default:
      path.setAttribute('d', 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z');
      svg.appendChild(path);
  }

  return svg;
}
