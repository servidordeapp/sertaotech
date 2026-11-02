# sertaotech

Static site (no framework, no bundler) for the Sertão Tech event, deployed as-is to Vercel.

## Design system build step

`ds/styles.css` is a **generated file** — it's the concatenation of `ds/tokens/*.css`
(colors, typography, spacing, radius, shadows, motion, base). It used to `@import`
each token file, but `@import` is only discovered by the browser after the
importing file itself downloads and parses, chaining an extra render-blocking
round-trip in front of first paint for every token file (8 extra requests,
flagged by a PageSpeed audit). Concatenating collapses that to a single request.

**After editing any file in `ds/tokens/`, regenerate `ds/styles.css`:**

```bash
./scripts/build-ds.sh
```

Commit both the token file you changed and the regenerated `ds/styles.css`.
Don't hand-edit `ds/styles.css` directly — the next build overwrites it.

`ds/tokens/fonts.css` is excluded from the build: it holds no CSS rules, only
a comment explaining why Google Fonts is linked directly in each page's
`<head>` (with a preload + `media="print"` swap, to keep it non-render-blocking)
instead of imported from the design system.

## Mídia kit (kit de patrocínio)

One reveal.js deck per edition, loaded from CDN (no build step). `/midia-kit` redirects to the latest year.

```
midia-kit/
  midia-kit.css      # shared reveal theme, built only on /ds/styles.css tokens
  midia-kit.js       # shared init: reveal on desktop, scrolling page on phones, PDF export
  icons.svg          # Lucide sprite (the DS icon set): <svg class="icon"><use href="/midia-kit/icons.svg#bot"/></svg>
  2026/index.html    # 2ª edição — imported from Claude Design
  2027/index.html    # 3ª edição
```

To start a new edition (e.g. 2028):

1. `cp -r midia-kit/2027 midia-kit/2028` and edit only the content of the `<section>`s.
   Speaker notes live in `<aside class="notes">` (press `S` to open the speaker view).
2. Point the `/midia-kit` redirect in `vercel.json` to the new year.
   Old years stay online at `/midia-kit/<ano>`.

In the 2027 kit, the traditional quota benefits are a `<div class="placeholder">` per quota;
the comment above that slide says how to replace them. Contacts are in the last slide.

Need a new layout? Add the class to `midia-kit/midia-kit.css` so later editions reuse it.

- **Phones** (≤ 900px): reveal is not started; slides become a scrolling page (`.mk-flow` in the CSS).
- **PDF**: `/midia-kit/<ano>?print-pdf` lays out one 1920×1080 page per slide and opens the print
  dialog ("Salvar como PDF"). The last slide of 2027 links to it. Hidden slides are left out.
