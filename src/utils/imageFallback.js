/**
 * Resilient image fallback handlers and SVG data URI generators for RaziMDb.
 */

/**
 * Validates if an image URL is genuinely a valid full URL and not an empty directory or placeholder.
 * @param {string} url 
 * @returns {boolean}
 */
export function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  // Filter out incomplete paths like "https://moviesapi.ir/images/"
  if (trimmed === '' || trimmed.endsWith('/images/') || trimmed.endsWith('/')) {
    return false;
  }
  return /^https?:\/\/.+\.(jpg|jpeg|png|webp|svg|gif)(\?.*)?$/i.test(trimmed) || trimmed.startsWith('https://');
}

/**
 * Generates an SVG Data URI placeholder for posters.
 * @param {string} [title="No Poster"]
 * @returns {string}
 */
export function getPosterFallback(title = 'RaziMDb') {
  const safeTitle = String(title).slice(0, 24);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
    <rect width="100%" height="100%" fill="#161616"/>
    <rect x="20" y="20" width="260" height="410" fill="none" stroke="#262626" stroke-width="2" rx="8"/>
    <path d="M110 170h80v110h-80z" fill="none" stroke="#F5C518" stroke-width="4"/>
    <circle cx="150" cy="205" r="16" fill="#F5C518"/>
    <path d="M125 260l25-25 25 25" fill="none" stroke="#F5C518" stroke-width="4" stroke-linecap="round"/>
    <text x="50%" y="330" fill="#8E8E93" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600" text-anchor="middle">${safeTitle}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Generates an SVG Data URI placeholder for wide scenes or backdrops.
 * @param {string} [title="Scene Preview"]
 * @returns {string}
 */
export function getSceneFallback(title = 'Scene Unavailable') {
  const safeTitle = String(title).slice(0, 30);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
    <rect width="100%" height="100%" fill="#141414"/>
    <path d="M290 140h60v80h-60z" fill="none" stroke="#333333" stroke-width="3"/>
    <circle cx="320" cy="165" r="12" fill="#333333"/>
    <path d="M300 205l20-20 20 20" fill="none" stroke="#333333" stroke-width="3" stroke-linecap="round"/>
    <text x="50%" y="250" fill="#71717A" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="500" text-anchor="middle">${safeTitle}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Generates an SVG Data URI avatar with initials for an actor.
 * @param {string} actorName 
 * @returns {string}
 */
export function getActorAvatarFallback(actorName = 'Actor') {
  const initials = actorName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || '?';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="240" viewBox="0 0 200 240">
    <rect width="100%" height="100%" fill="#1a1a1a"/>
    <circle cx="100" cy="100" r="54" fill="#262626" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
    <text x="100" y="112" fill="#F5C518" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="28" font-weight="700" text-anchor="middle" dominant-baseline="middle">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Attaches safe fallback listener to an image element to prevent broken images and loop crashes.
 * @param {HTMLImageElement} imgElement 
 * @param {string} fallbackSrc 
 */
export function handleImageFallback(imgElement, fallbackSrc) {
  if (!imgElement) return;

  const onErr = () => {
    imgElement.removeEventListener('error', onErr);
    imgElement.src = fallbackSrc;
  };

  imgElement.addEventListener('error', onErr, { once: true });

  if (!isValidImageUrl(imgElement.src)) {
    imgElement.src = fallbackSrc;
  }
}
