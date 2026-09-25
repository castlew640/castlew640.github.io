# Quick Task 260924-p7k Summary: Link preview image

**Commit:** 1b6a0e5
**Status:** Complete; build checks pass. Visible in link unfurls once deployed.

## What changed

- `public/og-image.jpg` (1200×630 progressive JPEG, 65 KB) is served at the site root.
- `src/layouts/BaseLayout.astro` emits `og:site_name`, `og:image` (absolute URL from `Astro.site`), its type, size and alt text, and `twitter:card=summary_large_image` on every page.
- `scripts/verify-built-content.mjs` requires the image, reads its JPEG frame header to confirm 1200×630, and checks every built HTML page for the image and card tags.
- Phase 2 and Phase 3 UAT checks are marked passed on the owner's report of completed Windows and phone testing (2026-09-24). Both phases and PERF-01 are closed. No trace files or frame percentiles were recorded; the records say so.

## Verification

- `astro check`: 0 errors. `npm run build` then `node scripts/verify-built-content.mjs`: 22 files, 4 required routes/assets present.
- Built `dist/index.html` contains the expected Open Graph and Twitter tags.

## Notes

- Phase 01 UAT (`01-UAT.md`) still lists its seven checks as pending; it was not part of this request.
- Social platforms cache previews; a re-scrape may be needed after deploy.
