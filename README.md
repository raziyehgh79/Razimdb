# RaziMDb — Production-Quality Movie Discovery Application

A cinematic, responsive Single-Page Application (SPA) built exclusively with **Vanilla JavaScript (ES6+ Modules)**, **HTML5**, and **Vanilla CSS3**, designed in accordance with the official screening assignment and Figma design specifications.

---

## 🌟 Live Demo & Deployment
- **Deployment Status:** Ready for static hosting (GitHub Pages, Netlify, or Vercel).
- **Target Repository:** `raziyeh79/razimdb-movie-finder`
- **Routing Paradigm:** Native Client-Side Hash Routing (`#/`) — works on static servers without custom URL rewrite rules.

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Absolute Technology Restrictions & Compliance](#-absolute-technology-restrictions--compliance)
3. [Key Features](#-key-features)
4. [Architecture & Folder Structure](#-architecture--folder-structure)
5. [Routing Scheme](#-routing-scheme)
6. [API Integrations & Verified Endpoints](#-api-integrations--verified-endpoints)
7. [API Limitations & Real Findings](#-api-limitations--real-findings)
8. [Data Normalization Strategy](#-data-normalization-strategy)
9. [Caching Strategy](#-caching-strategy)
10. [Cast Enrichment & Attribution](#-cast-enrichment--attribution)
11. [Local Development](#-local-development)
12. [Testing & Verification](#-testing--verification)
13. [Deployment Instructions](#-deployment-instructions)
14. [Credits & Licensing](#-credits--licensing)

---

## 🎬 Project Overview

**RaziMDb** is a movie discovery platform crafted with an IMDb-inspired aesthetic (Cinematic Dark Mode with Golden Yellow accent `#F5C518`). It connects to the live Persian `moviesapi.ir` catalog and enriches cast information using TVmaze.

### Application Goals
- Deliver a fast, responsive user interface without frontend frameworks or external runtime dependencies.
- Handle asynchronous network operations, request cancellations, race condition prevention, and graceful degradation.
- Provide clean, modular, and maintainable Vanilla JavaScript code adhering to modern web development standards.

---

## 🛡️ Absolute Technology Restrictions & Compliance

To strictly fulfill the assignment requirements, the frontend runtime uses **zero external dependencies**:
- **HTML5:** Semantic document outline (`header`, `nav`, `main`, `section`, `aside`, `footer`).
- **CSS3:** Native CSS Custom Properties (Design Tokens), Flexbox, CSS Grid, keyframe animations, and media queries. **No Tailwind CSS, Bootstrap, or Sass.**
- **JavaScript:** Native ES6+ Modules (`import`/`export`), native `fetch`, `AbortController`, `URLSearchParams`, and `sessionStorage`. **No React, Vue, jQuery, TypeScript, or runtime CDN libraries.**
- **Safe DOM:** Element construction via safe DOM APIs (`document.createElement`, `textContent`, explicit attribute binding) to prevent XSS vulnerabilities.
- **Icons:** Lightweight, inline SVGs with accessible attributes.

---

## ✨ Key Features

### 1. Global Navigation & Live Search
- **Brand Logo:** Distinctive yellow rectangle badge linking directly to `#/`.
- **Live Search with Debounce:**
  - Debounced at 350 ms using an abortable timer.
  - Automatically cancels superseded requests using `AbortController`.
  - Displays instant dropdown suggestions with poster thumbnail, title, release year, and star rating.
  - Full keyboard navigation (Up/Down arrow keys, Enter to navigate, Escape to dismiss).
  - Submitting via Enter routes to `#/search?q={query}`.
- **Interactive Genres Dropdown:**
  - Fetches the 21 official genres from the API.
  - Keyboard accessible (`aria-haspopup`, `aria-expanded`).
  - Dismisses automatically on item selection or click outside.

### 2. Home Page (`#/`)
- **Cinematic Hero Slider:**
  - Showcases top featured movies with backdrop scenes and readable dark vignette overlay.
  - Displays movie title, genre badges, plot summary, and "View Details" call-to-action button.
  - 5 interactive pagination dots with active golden indicator.
  - Auto-advance carousel (every 6 seconds), pauses on mouse hover, focus, and tab backgrounding (`visibilitychange`).
  - Respects user preference for `prefers-reduced-motion`.
- **Movie Grid:**
  - Responsive layout: 5 columns on desktop, 3 on tablet, 2 on mobile.
  - 2:3 aspect ratio posters with subtle hover zoom effect (`transform: scale(1.05)`).
  - IMDb-style rating badges (`★`).
  - Safe image fallbacks if poster URLs are broken.
- **Pagination:**
  - Accessible pagination controls synced with the verified 25-page catalog.

### 3. Movie Details Page (`#/movie/:id`)
- **Header Metadata:** Title, Release Year, MPAA Rating, Runtime (`2h 22m`), and IMDb Rating with vote count.
- **Two-Column Dossier:**
  - Left: High-resolution movie poster.
  - Right: Genre tags (linking to respective genre pages), full plot synopsis, Director, Writers, and Stars.
- **Scene Gallery:** Up to 3 scene stills with an accessible modal Lightbox (supports keyboard `Escape` and backdrop dismissal).
- **Enriched Cast Section:** Up to 6 actor cards displaying actor portraits enriched via TVmaze, or custom SVG initials avatars.

### 4. Genres Page (`#/genres/:id`)
- **Category Sidebar:** Vertical navigation listing all 21 genres with golden active indicator.
- **Sorting Controls:** Client-side rating toggle (`Sort by: Ranking ↑↓`) operating on a copied array.
- **Accurate Counter:** Real counts derived from the API (e.g. `32 titles`).
- **Horizontal Movie Cards:** High-density cards featuring poster, rating, metadata, plot, and director/star credits.
- **Pagination:** Full pagination support for genre-filtered results.

### 5. Search Results Page (`#/search?q=:query`)
- Displays `Results for "{query}"` with accurate total count.
- Standardized vertical card grid.
- Full pagination support preserving active search query.
- Empty state with search tips when no results match.

### 6. Shared States & Resilience
- **Loading:** Shimmer skeleton placeholders matching target layout dimensions.
- **Error Handling:** Contextual error cards with an active "Retry Request" button.
- **Empty States:** Clear messaging with a navigation button back to the catalog.
- **Image Fallbacks:** Inline SVG Data URIs for posters, scenes, and actor avatars to avoid broken image icons.

---

## 🏗️ Architecture & Folder Structure

```
razimdb-movie-finder/
├── .agents/
│   └── skills.json             # Workspace skill registration
├── src/
│   ├── api/
│   │   ├── httpClient.js       # Fetch wrapper with timeout, caching & retries
│   │   ├── movieService.js     # MoviesAPI.ir client & data normalizer
│   │   └── peopleService.js    # TVmaze actor portrait enrichment
│   ├── components/
│   │   ├── Navbar.js           # Top navigation bar
│   │   ├── SearchDropdown.js   # Debounced live search autocomplete
│   │   ├── GenreDropdown.js    # Header genre picker dropdown
│   │   ├── HeroSlider.js       # Auto-advancing cinematic hero carousel
│   │   ├── MovieCard.js        # Vertical poster card
│   │   ├── HorizontalMovieCard.js # Horizontal detailed card for genres
│   │   ├── Pagination.js       # Numbered page navigation
│   │   ├── CastList.js         # Actor cards with TVmaze photos
│   │   ├── SceneGallery.js     # 3-scene gallery with lightbox modal
│   │   └── States.js           # Shared Skeleton, Error, and Empty components
│   ├── pages/
│   │   ├── HomePage.js         # Home view (#/)
│   │   ├── MovieDetailsPage.js # Movie detail view (#/movie/:id)
│   │   ├── GenresPage.js       # Genres view (#/genres/:id)
│   │   └── SearchResultsPage.js# Search results view (#/search?q=...)
│   ├── router/
│   │   └── router.js           # Vanilla JS Hash Router with lifecycle hooks
│   ├── styles/
│   │   ├── variables.css       # Design tokens (colors, typography, radii)
│   │   ├── reset.css           # Modern CSS reset & accessibility rules
│   │   ├── layout.css          # App shell, headers, footers, containers
│   │   ├── components.css      # Component-level styles
│   │   ├── pages.css           # Page-specific arrangements
│   │   └── responsive.css      # Viewport media queries
│   ├── utils/
│   │   ├── cache.js            # sessionStorage caching wrapper with TTL
│   │   ├── debounce.js         # Debounce with cancel method
│   │   ├── dom.js              # Safe DOM creation & SVG icons
│   │   ├── formatters.js       # Runtime, rating, and vote count formatters
│   │   └── imageFallback.js    # Fallback image generators & error handlers
│   └── main.js                 # Application bootstrap
├── index.html                  # HTML5 application shell
├── DESIGN.md                   # Complete design system specification
├── .gitignore                  # Git ignore rules
└── README.md                   # Project documentation
```

---

## 🚦 Routing Scheme

The application uses native browser hash routing:

| Route | View | Description |
|---|---|---|
| `#/` | `HomePage` | Featured hero carousel, top catalog grid, pagination |
| `#/movie/:id` | `MovieDetailsPage` | Header stats, poster, plot, credits, scenes, cast |
| `#/genres/:id` | `GenresPage` | Category sidebar, ranking sort toggle, horizontal cards |
| `#/search?q=:query` | `SearchResultsPage` | Matching movie results and search pagination |

Query strings are parsed and updated using standard `URLSearchParams`. On route changes, previous component timers and pending network requests are aborted via `AbortController`.

---

## 🌐 API Integrations & Verified Endpoints

### Primary API: `moviesapi.ir`
- **Base URL:** `https://moviesapi.ir/api/v1`
- **Verified Endpoints:**
  - `GET /movies?page={page}`: Paginated catalogue (10 items/page, 250 total items, 25 pages).
  - `GET /movies/{id}`: Detailed movie information including plot, director, writers, actors, and screenshot scenes.
  - `GET /movies?q={query}&page={page}`: Search movies by title.
  - `GET /genres`: Array of 21 genres with `id` and `name`.
  - `GET /genres/{id}/movies?page={page}`: Movies belonging to a specific genre.
- **CORS Support:** Verified `Access-Control-Allow-Origin: *` on all endpoints.

### Secondary API: `api.tvmaze.com`
- **Endpoint:** `GET https://api.tvmaze.com/search/people?q={actorName}`
- **Purpose:** Best-effort enrichment of actor portrait photographs for the Movie Details Cast section.
- **Resilience:** Concurrency-limited (max 2 concurrent requests) and bounded with `Promise.allSettled` to prevent network blocking.

---

## 🔍 API Limitations & Real Findings

During testing, several real-world API behaviors were discovered and addressed:
1. **Broken/Incomplete Image URLs:** Some search results return incomplete paths such as `https://moviesapi.ir/images/` without an image filename (e.g. Dune search results).
   - *Solution:* Built `isValidImageUrl()` in `imageFallback.js` to detect incomplete paths and immediately display a styled SVG poster placeholder.
2. **Missing Writers/Actors in List Endpoints:** The list endpoint (`/movies?page=1`) does not contain writer or actor credits; only the detail endpoint (`/movies/:id`) provides them.
   - *Solution:* Avoided unnecessary bulk queries on the home page; full details are fetched only when opening the details page.
3. **Actor Name Variations:** Foreign or accented actor names (e.g. `Timothée Chalamet`) may differ from TVmaze query inputs.
   - *Solution:* Implemented unicode diacritics stripping (`normalize('NFD')`) for robust fuzzy matching.

---

## 💾 Caching Strategy

To minimize server load and deliver instant transitions:
- Backed by `sessionStorage` with a versioned prefix (`razimdb_v1_`).
- **TTL Configuration:**
  - Genre list: 60 minutes
  - Movie details: 30 minutes
  - Movie catalog pages: 15 minutes
  - Actor photos: 24 hours
- Defensive error handling around private browsing modes and quota limitations.

---

## 🚀 Local Development

Because the project relies on native ES Modules, it must be served over an HTTP server.

### Option 1: Python HTTP Server (Recommended)
```bash
python -m http.server 5500
```
Open your browser at:
```
http://localhost:5500
```

### Option 2: Node.js (npx serve)
```bash
npx serve -l 5500 .
```

---

## 🧪 Testing & Verification

The application was tested through an automated headless Chromium browser test session via Playwright MCP:
- ✅ **Home Page:** Hero slider renders 5 slides with active navigation dots; movie grid renders 10 items; pagination navigation verified.
- ✅ **Movie Details:** Valid movie ID (`/movie/1`) displays header stats, poster, plot, scene gallery, and cast credits.
- ✅ **Lightbox Modal:** Clicking any scene opens the full-screen viewer; pressing `Escape` closes the modal.
- ✅ **Live Search:** Typing triggers debounced suggestions; pressing Enter routes to `#/search?q=...` with accurate results.
- ✅ **Genres Page:** Category sidebar highlights the active genre; sorting by ranking toggles order; horizontal cards render correctly.
- ✅ **Responsive Layouts:** Mobile (375x667) and tablet (768x1024) viewports render with zero horizontal overflow.
- ✅ **Console Integrity:** Verified zero JavaScript console errors and zero unhandled exceptions.

---

## 🚢 Deployment Instructions

### GitHub Pages Deployment
1. Initialize Git and commit all files:
   ```bash
   git add .
   git commit -m "feat: complete RaziMDb vanilla movie discovery app"
   ```
2. Create or connect your remote repository on GitHub:
   ```bash
   git remote add origin https://github.com/raziyeh79/razimdb-movie-finder.git
   git branch -M main
   git push -u origin main
   ```
3. Navigate to **Settings > Pages** in your GitHub repository.
4. Under **Source**, select `Deploy from a branch` and choose `main` / `/ (root)`.
5. Your live site will be available at:
   `https://raziyeh79.github.io/razimdb-movie-finder/`

### Netlify Deployment
1. Drag and drop the project root directory into the Netlify Drop dashboard, or connect via Git.
2. Publish directory: `./` (root).
3. Build command: None required (pure static application).

---

## 📜 Credits & Licensing
- **Movie Catalog:** Powered by [MoviesAPI.ir](https://moviesapi.ir).
- **Actor Photography:** Enriched via [TVmaze](https://www.tvmaze.com), licensed under [Creative Commons BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- **Application Code:** Developed by Raziye as part of the technical frontend screening assignment.
