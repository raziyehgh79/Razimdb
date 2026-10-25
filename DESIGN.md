---
version: alpha
name: RaziMDb Design System
description: Cinematic dark-mode design system for RaziMDb movie discovery application based on Figma specifications.
colors:
  background-main: "#050505"
  background-surface: "#121212"
  background-elevated: "#1a1a1a"
  background-overlay: "rgba(0, 0, 0, 0.75)"
  primary-accent: "#F5C518"
  primary-accent-hover: "#E2B616"
  text-primary: "#FFFFFF"
  text-secondary: "#A3A3A3"
  text-muted: "#8E8E93"
  border-subtle: "rgba(255, 255, 255, 0.08)"
  border-light: "rgba(255, 255, 255, 0.15)"
  border-focus: "#F5C518"
  badge-bg: "rgba(255, 255, 255, 0.08)"
  star-gold: "#F5C518"
typography:
  sans:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "36px"
    lineHeight: "44px"
    fontWeight: "700"
  heading:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "24px"
    lineHeight: "32px"
    fontWeight: "600"
  subheading:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "18px"
    lineHeight: "24px"
    fontWeight: "600"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "14px"
    lineHeight: "20px"
    fontWeight: "400"
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: "12px"
    lineHeight: "16px"
    fontWeight: "500"
rounded:
  sm: "4px"
  base: "8px"
  lg: "12px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
---

# RaziMDb Design System

## Overview
RaziMDb is a cinematic, immersive movie discovery application. The interface provides instant search, deep catalog browsing across genres, responsive hero presentations, and comprehensive movie detail dossiers with scene previews and enriched actor credits.

The visual direction centers on deep pitch blacks, elevated charcoal surfaces, crisp typography, and an iconic golden yellow IMDb-style accent.

## Colors
- **Main Canvas (`#050505`)**: Near-black cinematic canvas providing maximum contrast for vibrant movie posters and stills.
- **Surface Level 1 (`#121212`)**: Card containers, sidebar panels, search bar background, and dropdown menus.
- **Surface Level 2 (`#1a1a1a`)**: Hover states, active dropdown items, rating pills, and modal dialogs.
- **Brand Accent (`#F5C518`)**: High-energy golden yellow used for brand badge, active states, star ratings, and primary action affordances.
- **Text Primary (`#FFFFFF`)**: Movie titles, key metadata values, and high-priority labels.
- **Text Secondary (`#A3A3A3`)**: Plot descriptions, secondary metadata, and inactive navigation links.
- **Text Muted (`#8E8E93`)**: Timestamps, release years, vote counts, and placeholders.
- **Borders (`rgba(255, 255, 255, 0.08)`)**: Fine dividing lines preserving structural boundaries without visual noise.

## Typography
Clean, high-legibility system sans-serif font stack ensuring rapid page loads and zero external font latency.
- **Display Title (36px, Bold)**: Hero titles and movie detail hero headings.
- **Section Heading (24px, SemiBold)**: Category headers, "• Cast", "• Genres", "Results for ...".
- **Card Title (16px, SemiBold)**: Grid movie card titles and horizontal card titles.
- **Body Text (14px, Regular)**: Plot summaries, synopsis excerpts, director/writer attribution.
- **Metadata & Badges (12px, Medium)**: Runtime, rating, votes, genre tags, and pagination controls.

## Layout
- **Max Container Width**: 1440px centered with 24px horizontal gutters on desktop, 16px on mobile.
- **Header Geometry**: Sticky top navigation bar with 68px height, backdrop blur (`12px`) and subtle bottom border.
- **Home Grid**: 5 columns on desktop (>=1100px), 3 columns on tablet (768px-1099px), 2 columns on mobile (<768px). Card gap: 20px.
- **Movie Details**: Two-column layout (poster 320px left, metadata right) transitioning to single column on mobile (<768px).
- **Genres Layout**: Two-column layout (fixed 240px sidebar left, horizontal movie cards stream right).
- **Scene Gallery**: 3 equal-width columns showcasing high-definition scene stills with aspect ratio 16:9.
- **Cast Cards**: 6-column grid on desktop, scrollable or 3-column on tablet/mobile.

## Elevation & Depth
- **Level 0 (Canvas)**: Background `#050505`.
- **Level 1 (Cards & Sidebars)**: `#121212` with 1px border `rgba(255, 255, 255, 0.08)`.
- **Level 2 (Dropdowns & Modals)**: `#1A1A1A` with box shadow `0 8px 32px rgba(0, 0, 0, 0.6)`.
- **Hero Vignette**: Radial and linear gradient darkening bottom and left edges (`rgba(5, 5, 5, 0.95)` to `transparent`) for text legibility.

## Shapes & Radii
- **Badges / Tags**: Pill (`9999px`) with padding `4px 12px`.
- **Movie Cards & Posters**: `8px` rounded corners with `overflow: hidden`.
- **Scene & Cast Images**: `8px` rounded corners.
- **Buttons & Search Input**: `6px` or `8px` rounded corners.
- **Logo Box**: Rectangular pill/box with `4px` radius and bold black lettering.

## Components

### Brand Logo
- Golden rectangle (`#F5C518`) with black bold text `RaziMDb`, letter-spacing `-0.5px`, height `34px`, padding `4px 10px`.

### Global Search & Suggestions
- Wide dark input field (`#121212`) with search icon.
- Debounced suggestion dropdown overlay with up to 6 results displaying thumbnail, title, release year, and star rating.
- Keyboard navigation (Up/Down/Enter/Escape).

### Hero Slider
- Wide cinematic backdrop banner (min-height 480px) with gradient overlay.
- Prominent title, genre pill tags, plot synopsis, and View Details CTA.
- 5 navigation dots with active golden indicator and automatic rotation paused on hover/focus.

### Movie Cards (Vertical Grid)
- 2:3 aspect ratio poster with zoom transition on hover (`transform: scale(1.04)`).
- Title, release year, genre pills, and IMDb star rating indicator.

### Horizontal Movie Cards (Genres Page)
- High-density card format: poster on left, comprehensive metadata, rating star, plot excerpt, director, stars, and votes on right.

### Cast Avatar
- Rounded portrait photo with TVmaze image enrichment and initial-based SVG avatar fallback.

### Skeletons & Shared States
- Shimmer skeleton loaders matching exact layout dimensions.
- Explicit Error and Empty state cards with clear retry action affordances.

## Do's and Don'ts
- **DO** validate all API image URLs and provide clean SVG placeholders for missing or failed images.
- **DO** use keyboard-accessible controls (`aria-expanded`, `aria-label`, visible focus rings).
- **DO** debounce live search queries and cancel superseded requests.
- **DON'T** use third-party runtime frameworks or UI libraries.
- **DON'T** hardcode fictional movie counts or fabricate mock data.
- **DON'T** allow unescaped API strings into innerHTML without sanitization.
