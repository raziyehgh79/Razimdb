/**
 * Modular Hash Router for RaziMDb Single-Page Application.
 */

export class Router {
  /**
   * @param {HTMLElement} rootContainer - The container element to render page views into.
   */
  constructor(rootContainer) {
    this.rootContainer = rootContainer;
    this.routes = [];
    this.currentPage = null;
    this.currentAbortController = null;
    this.handleHashChange = this.handleHashChange.bind(this);
  }

  /**
   * Registers a route path pattern and associated page handler component.
   * Path patterns support params like `/movie/:id` and query strings.
   * @param {string} pattern 
   * @param {new (...args: any[]) => { render: () => Promise<HTMLElement|DocumentFragment>, destroy?: () => void }} PageClass 
   */
  addRoute(pattern, PageClass) {
    // Convert pattern like "/movie/:id" into a regex and parameter keys list
    const paramNames = [];
    const regexPath = pattern
      .replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
        paramNames.push(name);
        return '([^/?#]+)';
      })
      .replace(/\//g, '\\/');

    const regex = new RegExp(`^#?${regexPath}(?:\\?(.*))?$`);

    this.routes.push({
      pattern,
      regex,
      paramNames,
      PageClass
    });
  }

  /**
   * Initializes the router and starts listening to hash changes.
   */
  init() {
    window.addEventListener('hashchange', this.handleHashChange);
    // Initial dispatch
    this.handleHashChange();
  }

  /**
   * Clean up router listeners.
   */
  destroy() {
    window.removeEventListener('hashchange', this.handleHashChange);
    this.teardownCurrentPage();
  }

  /**
   * Programmatically navigates to a hash route.
   * @param {string} hash 
   */
  navigate(hash) {
    const formatted = hash.startsWith('#') ? hash : `#${hash}`;
    if (window.location.hash === formatted) {
      this.handleHashChange();
    } else {
      window.location.hash = formatted;
    }
  }

  /**
   * Tears down the current active page if it has cleanup hooks.
   */
  teardownCurrentPage() {
    if (this.currentAbortController) {
      this.currentAbortController.abort();
      this.currentAbortController = null;
    }

    if (this.currentPage && typeof this.currentPage.destroy === 'function') {
      try {
        this.currentPage.destroy();
      } catch (err) {
        console.error('Error destroying page component:', err);
      }
      this.currentPage = null;
    }
  }

  /**
   * Handles browser hash change events and renders the matching route.
   */
  async handleHashChange() {
    const rawHash = window.location.hash || '#/';
    const [pathPart, queryPart] = rawHash.split('?');

    // Abort previous page pending requests
    this.teardownCurrentPage();
    this.currentAbortController = new AbortController();
    const { signal } = this.currentAbortController;

    // Parse query params
    const queryParams = new URLSearchParams(queryPart || '');

    let matchedRoute = null;
    let pathParams = {};

    for (const route of this.routes) {
      const match = rawHash.match(route.regex) || pathPart.match(route.regex);
      if (match) {
        matchedRoute = route;
        route.paramNames.forEach((name, index) => {
          pathParams[name] = decodeURIComponent(match[index + 1]);
        });
        break;
      }
    }

    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (!matchedRoute) {
      this.renderNotFound();
      return;
    }

    try {
      const pageInstance = new matchedRoute.PageClass({
        params: pathParams,
        query: queryParams,
        router: this,
        signal
      });

      this.currentPage = pageInstance;
      const view = await pageInstance.render();

      if (signal.aborted) {
        return;
      }

      this.rootContainer.replaceChildren(view);
    } catch (err) {
      if (signal.aborted) {
        return;
      }
      console.error('Routing render error:', err);
      this.renderError(err);
    }
  }

  /**
   * Renders 404 Not Found view.
   */
  renderNotFound() {
    document.title = 'Page Not Found — RaziMDb';
    const container = document.createElement('div');
    container.className = 'state-box';
    container.innerHTML = `
      <div class="state-icon is-error">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="64" height="64">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h2 class="state-title">Page Not Found</h2>
      <p class="state-message">The page or movie route you requested does not exist in RaziMDb.</p>
      <a href="#/" class="state-action-btn">Return to Home</a>
    `;
    this.rootContainer.replaceChildren(container);
  }

  /**
   * Renders generic route load error.
   * @param {Error} err 
   */
  renderError(err) {
    document.title = 'Error — RaziMDb';
    const container = document.createElement('div');
    container.className = 'state-box';
    container.innerHTML = `
      <div class="state-icon is-error">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="64" height="64">
          <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h2 class="state-title">Something went wrong</h2>
      <p class="state-message">We were unable to load the requested content. Please check your connection and try again.</p>
      <button class="state-action-btn" id="route-retry-btn">Try Again</button>
    `;
    const retryBtn = container.querySelector('#route-retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.handleHashChange());
    }
    this.rootContainer.replaceChildren(container);
  }
}
