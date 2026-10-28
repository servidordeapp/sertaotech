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

One reveal.js deck per edition, loaded from CDN (no build step):

```
midia-kit/
  midia-kit.css      # shared reveal theme, built only on /ds/styles.css tokens
  2026/index.html    # 2ª edição — imported from Claude Design
```

To start a new edition (e.g. 2027):

1. `cp -r midia-kit/2026 midia-kit/2027` and edit only the content of the `<section>`s.
   Speaker notes live in `<aside class="notes">` (press `S` to open the speaker view).
2. Point the `/midia-kit` redirect in `vercel.json` to the new year.
   Old years stay online at `/midia-kit/<ano>`.

Need a new layout? Add the class to `midia-kit/midia-kit.css` so later editions reuse it.
Export to PDF: open `/midia-kit/<ano>?print-pdf` in Chrome and print to PDF.
