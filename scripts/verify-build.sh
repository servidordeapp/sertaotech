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
#  4. As regras editoriais de SEO que a gente combinou (keyword no título e na
#     descrição, link interno pra página-âncora, card de OG existindo).
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
echo "== performance (as otimizações do audit de PageSpeed) =="

# Exatamente os CSS que a gente controla, nunca um bundle do Astro.
if grep -rlq '_astro/[^"]*\.css' dist --include='*.html'; then
  erro "apareceu CSS empacotado pelo Astro (_astro/*.css) — algum componente ganhou <style>"
else
  ok "nenhum CSS empacotado: só /ds/styles.css, /css/site.css e /css/article.css"
fi

if grep -rlq 'type="module"' dist --include='*.html'; then
  erro "apareceu <script type=module> — algum script perdeu o is:inline"
else
  ok "nenhum JS empacotado (todo script é inline e clássico)"
fi

if grep -rq '@import' dist/ds/styles.css; then
  erro "ds/styles.css voltou a usar @import — rode ./scripts/build-ds.sh"
else
  ok "ds/styles.css continua concatenado (sem @import)"
fi

faltando_dim=$(grep -rho '<img [^>]*>' dist --include='*.html' | grep -cv 'width=' || true)
if [ "$faltando_dim" -gt 0 ]; then
  erro "$faltando_dim <img> sem width/height (volta o layout shift)"
else
  ok "todo <img> tem dimensão intrínseca"
fi

echo
echo "== analytics e fontes =="

# /cerimonial e /mesa-redonda são documentos de impressão gerados por
# build-html.py, com <style> próprio e sem BaseLayout — ficam de fora.
paginas() { find dist -name '*.html' -not -path 'dist/cerimonial/*' -not -path 'dist/mesa-redonda/*' -not -path 'dist/links/*'; }

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

echo
echo "== regras editoriais dos posts =="

python3 - <<'PY'
import pathlib, re, sys, unicodedata

# A voz do site é informal: o texto escreve "pra" onde a busca escreve
# "para". Sem tratar isso, o lint acusa keyword ausente em título que a tem.
CONTRACOES = {'pra': 'para', 'pro': 'para', 'pros': 'para', 'pras': 'para',
              'num': 'em', 'numa': 'em', 'dum': 'de', 'duma': 'de'}

def palavras(s):
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    fora = []
    for p in re.findall(r"[a-z0-9]+", s):
        p = CONTRACOES.get(p, p)
        # plural simples: "comunidades" cobre "comunidade" e vice-versa
        fora.append(p[:-1] if len(p) > 4 and p.endswith('s') else p)
    return set(fora)

def contem(alvo, texto):
    return palavras(alvo) <= palavras(texto)

falhas = []
keywords = {}
for f in sorted(pathlib.Path('src/content/blog').glob('*.md')):
    bruto = f.read_text(encoding='utf-8')
    fm, corpo = bruto.split('---', 2)[1], bruto.split('---', 2)[2]
    campo = lambda k: (re.search(rf'^{k}: "(.*)"$', fm, re.M) or [None, None])[1]
    # o <title> publicado é o titleSeo quando existe; o `title` é o h1
    titulo = campo('titleSeo') or campo('title')
    desc = campo('description')
    kws = re.findall(r'^\s+- "(.+)"$', fm, re.M)
    principal = kws[0] if kws else None

    # h1 vem do layout; markdown que começa em "# " geraria dois h1
    if re.search(r'^# ', corpo, re.M):
        falhas.append(f'{f.stem}: corpo tem "# " (h1 duplicado — comece em ##)')

    if principal:
        if not contem(principal, titulo or ''):
            falhas.append(f'{f.stem}: keyword "{principal}" não aparece no title')
        if not contem(principal, desc or ''):
            falhas.append(f'{f.stem}: keyword "{principal}" não aparece na description')
        if not contem(principal, ' '.join(corpo.split()[:120])):
            falhas.append(f'{f.stem}: keyword "{principal}" não aparece nas ~100 primeiras palavras')
        keywords.setdefault(principal, []).append(f.stem)

    # toda página de post empurra link pra página-âncora de SEO local
    if '/eventos-de-tecnologia-parnaiba' not in corpo:
        falhas.append(f'{f.stem}: sem link no corpo pra /eventos-de-tecnologia-parnaiba')

    card = pathlib.Path(f'public/assets/og-blog-{f.stem}.jpg')
    if not card.exists():
        falhas.append(f'{f.stem}: falta o card de OG (rode node scripts/og-post.mjs --all)')

for kw, posts in keywords.items():
    if len(posts) > 1:
        falhas.append(f'canibalização: "{kw}" é keyword principal de {", ".join(posts)}')

if falhas:
    print('\n'.join('  \033[31mFALHA\033[0m ' + x for x in falhas))
    sys.exit(1)
print(f'  \033[32mok\033[0m   {len(keywords)} posts, uma keyword principal cada, sem canibalização')
PY
[ $? -ne 0 ] && falhas=$((falhas + 1))

echo
if [ "$falhas" -gt 0 ]; then
  printf '\033[31m%s verificação(ões) falharam.\033[0m\n\n' "$falhas"
  exit 1
fi
printf '\033[32mTudo verificado.\033[0m\n\n'
