#!/usr/bin/env bash
# Publica src/midia-kit/midia-kit.{css,js} em public/midia-kit/ com o hash do
# conteudo no nome, e aponta para o nome novo as referencias nos HTML de
# public/ (os 4 decks reveal.js e o relatorio).
#
# Por que existe: esses dois arquivos sao consumidos por HTML estatico em
# public/, que o Astro copia sem tocar — nao passam pelo hash automatico do
# _astro/. Sem hash no nome, trocar o CSS de um deck exige esperar o
# max-age ou um purge no Cloudflare. Com hash, o arquivo pode ser imutavel
# (regra /midia-kit/(.*) no vercel.json).
#
# Roda sozinho no `npm run build`. Idempotente: se o conteudo nao mudou, o
# hash nao muda e nada e reescrito.
set -euo pipefail

site_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
src_dir="$site_root/src/midia-kit"
out_dir="$site_root/public/midia-kit"

for ext in css js; do
  src="$src_dir/midia-kit.$ext"
  hash="$(sha256sum "$src" | cut -c1-8)"
  out="$out_dir/midia-kit.$hash.$ext"

  # Apaga as versoes antigas antes de escrever a nova, para o deploy nao
  # carregar um arquivo que nenhum HTML referencia mais.
  find "$out_dir" -maxdepth 1 -name "midia-kit.*.$ext" ! -name "midia-kit.$hash.$ext" -delete
  [ -f "$out" ] || cp "$src" "$out"

  # Pega tanto o nome sem hash (primeira execucao) quanto um hash anterior.
  find "$site_root/public" -name '*.html' -print0 |
    xargs -0 sed -i -E "s#/midia-kit/midia-kit(\.[0-9a-f]{8})?\.$ext#/midia-kit/midia-kit.$hash.$ext#g"

  echo "midia-kit.$ext -> midia-kit.$hash.$ext"
done
