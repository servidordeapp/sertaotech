#!/usr/bin/env bash
# Builds ds/styles.css by concatenating ds/tokens/*.css in a fixed order.
#
# Why this exists: ds/styles.css used to @import each token file. @import is
# only discovered by the browser after the importing file itself has
# downloaded and parsed, so it chains an extra network round-trip in front
# of every page's first paint (8 token files => 8 extra blocking requests,
# confirmed by a PageSpeed audit). Flat <link> tags in HTML avoid the chain
# but still cost one round-trip per file. Concatenating into a single file
# collapses all of that to one request, at the cost of an explicit build
# step. See README.md for when to run this.
#
# tokens/fonts.css is intentionally excluded: it's documentation only (no
# CSS rules), explaining why Google Fonts is linked directly in each page's
# <head> instead of imported.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tokens_dir="$repo_root/ds/tokens"
out_file="$repo_root/ds/styles.css"

# Order matters only for cascade/override intent, not correctness here (each
# token file only declares custom properties on :root, plus base.css sets a
# handful of element defaults last).
order=(colors typography spacing radius shadows motion base)

{
  cat <<'EOF'
/* ============================================================
 * Sertão Tech — Design System
 * Global entry point. Consumers link THIS file only.
 *
 * GENERATED FILE — do not edit directly.
 * Source of truth is ds/tokens/*.css. After editing a token file, run:
 *   ./scripts/build-ds.sh
 * to regenerate this file, then commit both.
 * ============================================================ */

EOF
  for name in "${order[@]}"; do
    cat "$tokens_dir/$name.css"
    echo
  done
} > "$out_file"

echo "Built ds/styles.css from ${#order[@]} token files: ${order[*]}"
