# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm run dev      # Dev server at localhost:4321
npm run build    # Production build to ./dist/
npm run preview  # Preview the production build locally
npm run astro check   # Type-check .astro files and content schemas
```

Requires Node >= 22.12.0. There is no test runner, linter, or formatter configured — verification is done via `astro check` and `npm run build`.

## Architecture

This is a personal blog ("Abel's Blog") built on **Astro 6** (static output), forked from the official Astro blog starter and heavily restyled with a custom "Sac" design language (warm paper, orange accent, serif + CJK typography). Content is bilingual (Chinese/English). Deploys to Vercel on push to `main`; the production `site` URL is hard-coded in `astro.config.mjs`.

### Content pipeline (the core of the site)

- Blog posts are Markdown/MDX files in `src/content/blog/`. There is no CMS.
- `src/content.config.ts` defines the single `blog` collection via a `glob` loader and a **Zod frontmatter schema**: `title`, `description`, `pubDate` (required), plus optional `updatedDate`, `heroImage` (an `image()` reference), and `tags` (string array, defaults to `[]`). Changing frontmatter shape means editing this schema — it is the source of truth and enforced at build time.
- `heroImage` paths in frontmatter point into `src/assets/` (e.g. `../../assets/hero-first-post.gif`) so Astro's `<Image>` optimizes them. Static files that should NOT be optimized (favicon, avatar, homepage JS) live in `public/`.
- Everything downstream reads posts through `getCollection('blog')`. Posts are referenced by `post.id` (the file slug); URLs are always `/blog/{post.id}/`.

### Routing

All under `src/pages/`, static-generated:
- `index.astro` — bespoke single-page homepage (hero + latest 5 posts + "build" terminal animation + contact). Not representative of the other pages; it has its own large `<style>` block and pulls in three homepage-only scripts.
- `blog/index.astro` — post grid; `blog/[...slug].astro` — uses `getStaticPaths()` over the collection and renders each post through the `BlogPost` layout.
- `tags/index.astro` — tag cloud with counts; `tags/[tag].astro` — per-tag post list, both derived by iterating `post.data.tags` across the collection (no separate tag registry).
- `api/search.json.ts` — build-time-generated JSON index (title/description/url/pubDate) consumed by the client-side search modal.
- `rss.xml.js` — RSS feed via `@astrojs/rss`.

### Layout & component structure

- `layouts/BlogPost.astro` is the only layout — wraps rendered post `<Content />` with hero image, title, date, and tag pills. Other pages compose `BaseHead` + `Header` + `Footer` directly rather than using a shared layout.
- `components/BaseHead.astro` centralizes all `<head>` concerns: SEO/OG/Twitter meta, canonical URL, font preloads + Google Fonts, and crucially `<ClientRouter />` which enables **Astro View Transitions site-wide**. Every page includes it.
- `components/Header.astro` holds nav, the dark-mode toggle, the decorative rail/cross elements, and mounts `SearchModal`.

### Two cross-cutting client-side concerns to respect when editing

1. **View Transitions**: because `<ClientRouter />` is active, client scripts must re-initialize on the `astro:page-load` event, not only `DOMContentLoaded`. Existing code (theme toggle in `Header.astro`, search in `SearchModal.astro`, homepage `main.js`) follows the pattern of defining an `init*()` function and calling it both immediately and on `astro:page-load`. New interactive code must do the same or it will break after client-side navigation. The header uses `transition:persist` to survive navigations.
2. **Dark mode**: toggled by adding/removing `.dark` on `<html>`, persisted in `localStorage` under `theme`. Component styles target it with `:global(.dark) ...` selectors (styles are scoped by default in Astro, so `:global` is required to reach the html-level class).

### Styling

- `src/styles/global.css` is imported once (via `BaseHead`) and defines all **design tokens as CSS custom properties** on `:root` (`--accent`, `--paper`, `--ink`, `--line`, `--serif`, `--nav-h`, `--pad-x`, etc.). Prefer these variables over hard-coded values; they are used everywhere. Note some legacy tokens are RGB triplets used as `rgb(var(--gray))`.
- No CSS framework. Page/component styles live in scoped `<style>` blocks inside each `.astro` file. There is duplication of layout constants across pages — changing a global look often means editing both `global.css` and individual page `<style>` blocks.

### Homepage-only scripts (`public/js/`, loaded with `is:inline`)

Only `index.astro` uses these: `main.js` (GSAP scroll-reveal animations, loaded from CDN), `build.js` (typing/progress terminal animation), `particles.js` (canvas particle avatar effect), `pacman.js` (cursor-chasing Pac-Man in the hero), `posts3d.js` (Three.js 3D covers carousel for 最新文章; ES module importing three from jsdelivr CDN; falls back to the plain list on mobile/no-WebGL/reduced-motion). They rely on `data-*` attributes in the homepage markup. GSAP/Three are loaded from CDN `<script>`s, not npm. Long-running loops (particles, pacman, posts3d) pause via IntersectionObserver when scrolled out of view — keep that pattern for new animations.

## Notes

- `SITE_TITLE` / `SITE_DESCRIPTION` live in `src/consts.ts` and are reused across pages and the RSS feed.
- The `README.md` is the unmodified Astro starter template readme and does not describe this customized site — do not treat it as authoritative.
