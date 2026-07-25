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
