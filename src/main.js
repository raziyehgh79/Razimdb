/**
 * RaziMDb - Application Entry Point (Vanilla JS ES Module).
 */
import { Navbar } from './components/Navbar.js';
import { Router } from './router/router.js';
import { HomePage } from './pages/HomePage.js';
import { MovieDetailsPage } from './pages/MovieDetailsPage.js';
import { GenresPage } from './pages/GenresPage.js';
import { SearchResultsPage } from './pages/SearchResultsPage.js';

document.addEventListener('DOMContentLoaded', () => {
  const navbarRoot = document.getElementById('navbar-root');
  const mainContent = document.getElementById('main-content');

  if (!navbarRoot || !mainContent) {
    console.error('Fatal: Required application root containers missing from DOM.');
    return;
  }

  // 1. Initialize Hash Router
  const router = new Router(mainContent);

  // Register SPA routes
  router.addRoute('/', HomePage);
  router.addRoute('/movie/:id', MovieDetailsPage);
  router.addRoute('/genres/:id', GenresPage);
  router.addRoute('/search', SearchResultsPage);

  // 2. Initialize and Mount Top Navigation Bar
  const navbar = new Navbar({
    onNavigate: (hash) => router.navigate(hash)
  });
  navbarRoot.appendChild(navbar.render());

  // 3. Start Router
  router.init();
});
