#!/usr/bin/env bash
# Verificações de build. Roda depois de `npm run build`.
#
# O que estas checagens protegem, em ordem de importância:
#
#  1. As otimizações que saíram de um audit de PageSpeed. São invisíveis e
#     silenciosas quando quebram: um <style> num componente faz o Astro emitir
#     um terceiro CSS bloqueante em toda página, e ninguém percebe até o
#     próximo audit. Um <script> sem is:inline tira gtag() do escopo global e
#     mata a analytics de patrocinador sem erro nenhum.
#  2. O JSON-LD. Um erro de sintaxe faz o Google descartar o bloco inteiro,
#     sem aviso.
#  3. Os canonicals e o sitemap. Canonical apontando pra variante errada
#     desindexa página semanas depois.
set -uo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
falhas=0
ok()   { printf '  \033[32mok\033[0m   %s\n' "$1"; }
erro() { printf '  \033[31mFALHA\033[0m %s\n' "$1"; falhas=$((falhas + 1)); }

if [ ! -d dist ]; then
  echo "dist/ não existe. Rode: npm run build"
  exit 1
fi

echo
# Passthrough de site/public/: decks reveal.js e hubs internos copiados byte a
# byte (URLs apresentadas ao vivo). Não passam pelo BaseLayout, então as regras
# do site Astro não se aplicam a eles.
PASSTHROUGH='dist/midia-kit dist/after dist/apresentacoes dist/impressos dist/relatorio'
EXCL_GREP="--exclude-dir=cerimonial --exclude-dir=mesa-redonda $(for d in $PASSTHROUGH; do printf -- "--exclude-dir=%s " "$(basename $d)"; done)"

echo "== performance (as otimizações do audit de PageSpeed) =="


# Exatamente os CSS que a gente controla, nunca um bundle do Astro.
if grep -rlq $EXCL_GREP '_astro/[^"]*\.css' dist --include='*.html'; then
  erro "apareceu CSS empacotado pelo Astro (_astro/*.css) — algum componente ganhou <style>"
else
  ok "nenhum CSS empacotado: só /ds/styles.css, /css/site.css e /css/article.css"
fi

# O único module esperado é o bundle do @sentry/astro (sentry.client.config.js),
# que o integration injeta em toda página como /_astro/page.<hash>.js. Qualquer
# outro quer dizer que um componente ganhou <script> sem is:inline.
inesperado=$(grep -rho $EXCL_GREP '<script[^>]*type="module"[^>]*>' dist --include='*.html' |
  grep -cv '/_astro/page\.' || true)
if [ "$inesperado" -gt 0 ]; then
  erro "$inesperado <script type=module> fora do bundle do Sentry — algum script perdeu o is:inline"
else
  ok "nenhum JS empacotado além do bundle do Sentry (o resto é inline e clássico)"
fi

if grep -rq '@import' dist/ds/styles.css; then
  erro "ds/styles.css voltou a usar @import — rode ./scripts/build-ds.sh"
else
  ok "ds/styles.css continua concatenado (sem @import)"
fi

faltando_dim=$(grep -rho $EXCL_GREP '<img [^>]*>' dist --include='*.html' | grep -cv 'width=' || true)
if [ "$faltando_dim" -gt 0 ]; then
  erro "$faltando_dim <img> sem width/height (volta o layout shift)"
else
  ok "todo <img> tem dimensão intrínseca"
fi

echo
echo "== analytics e fontes =="

# /cerimonial e /mesa-redonda são documentos de impressão gerados por
# build-html.py, com <style> próprio e sem BaseLayout — ficam de fora.
paginas() {
  # O filtro e por grep, nao por -not -path do find: dentro de $( ) o padrao
  # 'dist/midia-kit/*' era expandido pelo shell antes do find ver.
  local fora
  fora="$(printf 'cerimonial|mesa-redonda|links'; for d in $PASSTHROUGH; do printf '|%s' "$(basename "$d")"; done)"
  find dist -name '*.html' | grep -vE "^dist/($fora)/"
}

for f in $(paginas); do
  n=$(grep -c "G-62RC94ZH1Z" "$f" || true)
  [ "$n" -ge 2 ] || { erro "$f: gtag ausente ou incompleto"; break; }
done
grep -q 'G-62RC94ZH1Z' dist/index.html && ok "GA4 presente nas páginas"

for f in $(paginas); do
  n=$(grep -o 'fonts.googleapis.com/css2' "$f" | wc -l)
  if [ "$n" -ne 3 ]; then
    erro "$(basename $(dirname $f)): o triplo de fontes (preload + print-swap + noscript) tem $n de 3"
    break
  fi
done
ok "carregamento de fonte não bloqueante intacto (3 tags por página)"

echo
echo "== JSON-LD =="

python3 - <<'PY'
import json, re, pathlib, sys
falhas = []
ids = set()
refs = []
for f in pathlib.Path('dist').rglob('*.html'):
    if str(f).startswith(('dist/midia-kit/', 'dist/after/', 'dist/apresentacoes/', 'dist/impressos/', 'dist/relatorio/')):
        continue
    html = f.read_text(encoding='utf-8')
    for bloco in re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', html, re.S):
        try:
            g = json.loads(bloco)
        except json.JSONDecodeError as e:
            falhas.append(f'{f}: JSON inválido ({e})')
            continue
        nos = g.get('@graph', [g])
        for no in nos:
            if '@id' in no:
                ids.add(no['@id'])
            for chave, valor in no.items():
                if isinstance(valor, dict) and set(valor) == {'@id'}:
                    refs.append((str(f), chave, valor['@id']))
        for no in nos:
            if no.get('@type') == 'BlogPosting' and len(no.get('headline', '')) > 110:
                falhas.append(f'{f}: headline com mais de 110 caracteres')
orfas = sorted({r[2] for r in refs} - ids)
for o in orfas:
    falhas.append(f'referência @id sem nó correspondente: {o}')
if falhas:
    print('\n'.join('  \033[31mFALHA\033[0m ' + x for x in falhas))
    sys.exit(1)
print(f'  \033[32mok\033[0m   JSON-LD válido em todas as páginas; {len(ids)} @id, {len(refs)} referências, 0 órfãs')
PY
[ $? -ne 0 ] && falhas=$((falhas + 1))

echo
echo "== canonical e sitemap =="

python3 - <<'PY'
import re, pathlib, sys
falhas = []
for f in pathlib.Path('dist').rglob('*.html'):
    if str(f).startswith(('dist/midia-kit/', 'dist/after/', 'dist/apresentacoes/', 'dist/impressos/', 'dist/relatorio/')):
        continue  # passthrough byte a byte
    html = f.read_text(encoding='utf-8')
    m = re.search(r'<link rel="canonical" href="([^"]+)"', html)
    if not m:
        if 'noindex' not in html:
            falhas.append(f'{f}: sem canonical')
        continue
    esperado = '/' + str(f.parent.relative_to('dist')).replace('.', '')
    esperado = 'https://osertaotech.com.br' + ('/' if esperado in ('/', '/.') else esperado)
    if m.group(1) != esperado:
        falhas.append(f'{f}: canonical {m.group(1)} != {esperado}')
if falhas:
    print('\n'.join('  \033[31mFALHA\033[0m ' + x for x in falhas))
    sys.exit(1)
print('  \033[32mok\033[0m   toda página tem canonical apontando pra si mesma')
PY
[ $? -ne 0 ] && falhas=$((falhas + 1))

if [ -f dist/sitemap-index.xml ] && [ -f dist/sitemap-0.xml ]; then
  urls=$(grep -o '<loc>[^<]*</loc>' dist/sitemap-0.xml | wc -l)
  if grep -q '<loc>https://osertaotech.com.br/</loc>' dist/sitemap-0.xml; then
    ok "sitemap com $urls URLs, home com barra final"
  else
    erro "sitemap: a home deveria aparecer como https://osertaotech.com.br/ (com barra)"
  fi
  for proibido in '/links' '/cerimonial' '/mesa-redonda' 'feed.xml'; do
    grep -q "$proibido" dist/sitemap-0.xml && erro "sitemap não deveria listar $proibido"
  done
  ok "sitemap sem URL que não deve ser indexada"
else
  erro "sitemap-index.xml / sitemap-0.xml não foram gerados"
fi

echo
echo "== links externos =="

python3 - <<'PY_EXT'
import re, pathlib, sys
# /links é um stub de redirecionamento: o link dele TEM que trocar a página.
# /cerimonial e /mesa-redonda são documentos de impressão, fora do padrão.
IGNORA = ('dist/links/', 'dist/cerimonial/', 'dist/mesa-redonda/', 'dist/midia-kit/', 'dist/after/', 'dist/apresentacoes/', 'dist/impressos/', 'dist/relatorio/')
falhas = []
for f in sorted(pathlib.Path('dist').rglob('*.html')):
    if str(f).startswith(IGNORA):
        continue
    for tag in re.findall(r'<a\b[^>]*href="https?://[^"]*"[^>]*>', f.read_text(encoding='utf-8')):
        if 'osertaotech.com.br' in tag:
            continue
        if 'target="_blank"' not in tag:
            falhas.append(f'{f}: {tag[:110]}')
        elif 'rel="noopener"' not in tag and 'noopener' not in tag:
            falhas.append(f'{f}: target sem rel=noopener — {tag[:90]}')
if falhas:
    print('\n'.join('  \033[31mFALHA\033[0m link externo na mesma aba: ' + x for x in falhas))
    sys.exit(1)
print('  \033[32mok\033[0m   todo link externo abre em aba nova, com rel=noopener')
PY_EXT
[ $? -ne 0 ] && falhas=$((falhas + 1))

echo
echo "== links internos =="

python3 - <<'PY'
import re, pathlib, sys
raiz = pathlib.Path('dist')
quebrados = []
for f in raiz.rglob('*.html'):
    for href in set(re.findall(r'href="(/[^"#?]*)"', f.read_text(encoding='utf-8'))):
        alvo = href.rstrip('/')
        if any((raiz / (alvo.lstrip('/') + s)).exists() for s in ('', '/index.html', '.html')):
            continue
        quebrados.append(f'{f} -> {href}')
if quebrados:
    print('\n'.join('  \033[31mFALHA\033[0m link quebrado: ' + x for x in sorted(set(quebrados))))
    sys.exit(1)
print('  \033[32mok\033[0m   nenhum link interno quebrado')
PY
[ $? -ne 0 ] && falhas=$((falhas + 1))

# As fotos saem de src/data/fotos.ts: um slug errado ou uma largura que não
# existe em disco vira <img> quebrada sem erro nenhum no build. O check de
# links internos acima só olha href, então srcset/src precisam deste aqui.
python3 - <<'PYIMG'
import re, pathlib, sys
raiz = pathlib.Path('dist')
faltando = []
for f in raiz.rglob('*.html'):
    refs = set(re.findall(r'(?:src|srcset)="([^"]*)"', f.read_text(encoding='utf-8')))
    for ref in refs:
        for parte in ref.split(','):
            url = parte.strip().split(' ')[0]
            if not url.startswith('/') or url.startswith('//'):
                continue
            if not (raiz / url.lstrip('/')).exists():
                faltando.append(f'{f} -> {url}')
if faltando:
    print('\n'.join('  \033[31mFALHA\033[0m imagem inexistente: ' + x for x in sorted(set(faltando))))
    sys.exit(1)
print('  \033[32mok\033[0m   todo src/srcset local aponta pra arquivo que existe')
PYIMG
[ $? -ne 0 ] && falhas=$((falhas + 1))

echo
if [ "$falhas" -gt 0 ]; then
  printf '\033[31m%s verificação(ões) falharam.\033[0m\n\n' "$falhas"
  exit 1
fi
printf '\033[32mTudo verificado.\033[0m\n\n'
