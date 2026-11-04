# sertaotech

Monorepo do evento Sertão Tech. Cada aplicação é uma pasta própria, com README
próprio; esta página é só o índice.

## Mapa do repositório

| Pasta | O que é |
|---|---|
| `docs/` | Documentação de negócio e de engenharia. Fora do deploy. |
| `site/` | Site público em Astro (saída estática). Esqueleto no ar desde a Fase 2; as páginas atuais ainda não foram portadas. Ver [`site/README.md`](site/README.md). |
| `api/` | Serviço de backend em Laravel. Ver [`api/README.md`](api/README.md). |
| `scripts/` | Geração de arte e do design system (`build-ds.sh`, `og-card.mjs`, …). Rodam localmente. |
| `originais/` | Fotos e artes em alta resolução. Locais, fora do git. |

Enquanto a migração não chega na Fase 2, o site público ainda é o HTML estático
na raiz: `index.html`, `2026/`, `after/`, `apresentacoes/`, `assets/`,
`cerimonial/`, `css/`, `ds/`, `impressos/`, `links/`, `mesa-redonda/`,
`midia-kit/`, `relatorio/` e `vercel.json`.

## Como subir

A partir da Fase 3 da migração, o único pré-requisito na máquina é o Docker:

```bash
docker compose up   # site em http://localhost:4321
```

Até lá, o site Astro sobe de dentro de `site/` com `npm install && npm run dev`,
e o HTML estático da raiz abre direto no navegador ou em qualquer servidor de
arquivos.

## Documentação

| Documento | Assunto |
|---|---|
| [`docs/MIGRACAO-ASTRO.md`](docs/MIGRACAO-ASTRO.md) | Decisões, diagnóstico e riscos da migração para Astro |
| [`docs/CHECKLIST-MIGRACAO-ASTRO.md`](docs/CHECKLIST-MIGRACAO-ASTRO.md) | Execução da migração, em ordem de dependência |
| [`docs/PLANO-2027.md`](docs/PLANO-2027.md) | Plano da edição 2027 |
| [`docs/ESTRATEGIA-PATROCINIO-2027.md`](docs/ESTRATEGIA-PATROCINIO-2027.md) | Estratégia de patrocínio |
| [`docs/ROTEIRO-NEGOCIOS-2027.md`](docs/ROTEIRO-NEGOCIOS-2027.md) | Trilha de negócios |
| [`docs/MIDIA-KIT-CARAVANAS-2027.md`](docs/MIDIA-KIT-CARAVANAS-2027.md) | Kit de caravanas |
| [`docs/RELATORIO-PATROCINADORES-2026.md`](docs/RELATORIO-PATROCINADORES-2026.md) | Relatório para patrocinadores de 2026 |

`docs/` e `relatorio/` estão no `.vercelignore` — material interno, não vai ao ar.

---

## Site estático da raiz (sai daqui quando as páginas forem portadas)

As duas seções abaixo são detalhe do site estático que ainda mora na raiz. O
equivalente dentro do Astro já está em [`site/README.md`](site/README.md); estas
saem quando `ds/` e `midia-kit/` forem portados (Fases 4 a 7).

### Build do design system

`ds/styles.css` é um **arquivo gerado** — a concatenação de `ds/tokens/*.css`
(cores, tipografia, espaçamento, raio, sombras, movimento, base). Antes ele
fazia `@import` de cada token, mas o `@import` só é descoberto pelo navegador
depois que o próprio arquivo baixa e é parseado, o que enfileira uma ida e volta
extra, bloqueando a primeira pintura, para cada token (8 requisições extras,
apontadas numa auditoria do PageSpeed). Concatenar reduz isso a uma requisição.

**Depois de editar qualquer arquivo em `ds/tokens/`, regere `ds/styles.css`:**

```bash
./scripts/build-ds.sh
```

Commite o token alterado **e** o `ds/styles.css` regerado. Não edite
`ds/styles.css` à mão — o próximo build sobrescreve.

`ds/tokens/fonts.css` fica fora do build: não tem regra de CSS, só um comentário
explicando por que o Google Fonts é linkado direto no `<head>` de cada página
(com preload + troca de `media="print"`, para não bloquear a renderização) em vez
de importado pelo design system.

### Mídia kit (kit de patrocínio)

Um deck reveal.js por edição, carregado por CDN (sem build). `/midia-kit`
redireciona para o ano mais recente.

```
midia-kit/
  midia-kit.css      # tema reveal compartilhado, só sobre os tokens de /ds/styles.css
  midia-kit.js       # init compartilhado: reveal no desktop, página rolável no celular, export PDF
  icons.svg          # sprite Lucide (o icon set do DS): <svg class="icon"><use href="/midia-kit/icons.svg#bot"/></svg>
  2026/index.html    # 2ª edição — importada do Claude Design
  2027/index.html    # 3ª edição
```

Para começar uma edição nova (ex.: 2028):

1. `cp -r midia-kit/2027 midia-kit/2028` e edite só o conteúdo das `<section>`.
   As notas do palestrante ficam em `<aside class="notes">` (tecla `S` abre a
   visão do palestrante).
2. Aponte o redirect de `/midia-kit` no `vercel.json` para o ano novo.
   Os anos antigos continuam no ar em `/midia-kit/<ano>`.

No kit de 2027, os benefícios das cotas tradicionais são um
`<div class="placeholder">` por cota; o comentário acima desse slide diz como
substituir. Os contatos estão no último slide.

Precisa de um layout novo? Coloque a classe em `midia-kit/midia-kit.css` para as
edições seguintes reaproveitarem.

- **Celulares** (≤ 900px): o reveal não é iniciado; os slides viram uma página
  rolável (`.mk-flow` no CSS).
- **PDF**: `/midia-kit/<ano>?print-pdf` monta uma página 1920×1080 por slide e
  abre o diálogo de impressão ("Salvar como PDF"). O último slide de 2027 linka
  para isso. Slides escondidos ficam de fora.
