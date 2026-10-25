/**
 * Data and text formatting helpers for RaziMDb.
 */

/**
 * Formats runtime from minutes to standard hours and minutes string (e.g. "142 min" -> "2h 22m").
 * @param {string|number} rawRuntime 
 * @returns {string}
 */
export function formatRuntime(rawRuntime) {
  if (!rawRuntime) return 'N/A';
  const match = String(rawRuntime).match(/(\d+)/);
  if (!match) return String(rawRuntime);

  const totalMinutes = parseInt(match[1], 10);
  if (isNaN(totalMinutes) || totalMinutes <= 0) return 'N/A';

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${minutes}m`;
}

/**
 * Formats movie rating to one decimal place or returns "N/A".
 * @param {string|number} rawRating 
 * @returns {string}
 */
export function formatRating(rawRating) {
  if (rawRating === null || rawRating === undefined) return 'N/A';
  const num = parseFloat(String(rawRating));
  if (isNaN(num) || num <= 0) return 'N/A';
  return num.toFixed(1);
}

/**
 * Formats vote count with commas or shorthand notation (e.g. "1,738,596" -> "1.7M").
 * @param {string|number} rawVotes 
 * @param {boolean} [shorthand=false]
 * @returns {string}
 */
export function formatVotes(rawVotes, shorthand = false) {
  if (!rawVotes) return '0';
  const num = typeof rawVotes === 'number'
    ? rawVotes
    : parseInt(String(rawVotes).replace(/,/g, ''), 10);

  if (isNaN(num) || num <= 0) return '0';

  if (shorthand) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
  }

  return num.toLocaleString();
}

/**
 * Truncates text safely to a maximum character length without breaking mid-word.
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string}
 */
export function truncateText(text, maxLength = 160) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  const sub = text.slice(0, maxLength);
  const lastSpace = sub.lastIndexOf(' ');
  return (lastSpace > 0 ? sub.slice(0, lastSpace) : sub) + '...';
}
