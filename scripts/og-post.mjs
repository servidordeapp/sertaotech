#!/usr/bin/env node
// Gera o card de Open Graph de cada post do blog, na mesma linguagem visual das
// outras artes (scripts/og-card.mjs e scripts/linkedin-cover.mjs): fundo marrom
// em gradiente, selo do Sertão Tech à esquerda, coluna de texto à direita e a
// barra terracota no rodapé.
//
// A diferença em relação ao og-card.mjs é que aqui o texto NÃO é fixo: vem do
// frontmatter do post. Título de post tem comprimento imprevisível, então o
// og-card, que avisa por console quando o texto passa da borda, não serve —
// este script quebra o título em até 3 linhas e REDUZ o corpo até caber. Se
// não couber nem no menor corpo, falha com erro em vez de entregar arte
// cortada em silêncio.
//
// Uso:
//   npm i sharp opentype.js         # deps só dos scripts de arte
//   node scripts/og-post.mjs <slug>       # um post
//   node scripts/og-post.mjs --all        # todos os posts publicados + o card do /blog
//   node scripts/og-post.mjs --check      # só verifica se falta card (não gera)

import sharp from 'sharp';
import opentype from 'opentype.js';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const POSTS_DIR = path.join(raiz, 'src/content/blog');
const SAIDA_DIR = path.join(raiz, 'public/assets');

const L = 1200;
const A = 630;
const X = 470;          // início da coluna de texto (o selo ocupa a esquerda)
const MARGEM_DIR = 60;
const MAX_W = L - MARGEM_DIR - X;
const BARRA = 10;
const LOGO_W = 254;
const CAP_MAX = 62;
const CAP_MIN = 38;
const MAX_LINHAS = 3;

// Preenchido depois de carregar as fontes — é a altura de caixa-alta da
// Instrument Sans, de onde sai o corpo a partir do `cap` desejado.
let CAP_HEIGHT = 0;

const DOMINIO_PADRAO = 'osertaotech.com.br/blog';

// Amostradas do selo; correspondem a public/ds/tokens/colors.css.
const COR = {
  creme:    '#FFFCF3',
  ambar:    '#F6C56C',
  destaque: '#EDA83E',
  apagado:  '#D5BB8A',
  terra:    '#A8511A',
  barra:    '#BC5E1A',
  dominio:  '#C2661D',
};

// Páginas fora do blog que usam a mesma arte de card.
const PAGINAS_EXTRA = [
  {
    arquivo: 'og-blog.jpg',
    chapeu: '// BLOG',
    titulo: 'A cena tech do norte do Piauí.',
    apoio: 'BLOG DO SERTÃO TECH',
    detalhe: 'Eventos, carreira e comunidade em Parnaíba - PI',
  },
  {
    arquivo: 'og-edicoes-2025.jpg',
    chapeu: '// 1ª EDIÇÃO · 22 AGO 2025',
    titulo: 'Como foi o Sertão Tech 2025.',
    apoio: '191 INSCRITOS · 91 PRESENTES',
    detalhe: 'Faculdade Maurício de Nassau · Parnaíba - PI',
    dominio: 'osertaotech.com.br/edicoes/2025',
  },
];

const CATEGORIA_LABEL = {
  eventos: 'EVENTOS',
  carreira: 'CARREIRA',
  comunidade: 'COMUNIDADE',
  bastidores: 'BASTIDORES',
};

const FONTES = {
  'is-400': 'https://fonts.gstatic.com/s/instrumentsans/v4/pximypc9vsFDm051Uf6KVwgkfoSxQ0GsQv8ToedPibnr-yp2JGEJOH9npSTF-Qf1.ttf',
  'is-500': 'https://fonts.gstatic.com/s/instrumentsans/v4/pximypc9vsFDm051Uf6KVwgkfoSxQ0GsQv8ToedPibnr-yp2JGEJOH9npST3-Qf1.ttf',
  'is-700': 'https://fonts.gstatic.com/s/instrumentsans/v4/pximypc9vsFDm051Uf6KVwgkfoSxQ0GsQv8ToedPibnr-yp2JGEJOH9npSQi_gf1.ttf',
};

async function carregaFontes() {
  const cache = path.join(os.tmpdir(), 'sertaotech-og-fontes');
  fs.mkdirSync(cache, { recursive: true });
  const carregadas = {};
  for (const [nome, url] of Object.entries(FONTES)) {
    const arquivo = path.join(cache, `${nome}.ttf`);
    if (!fs.existsSync(arquivo)) {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`falha ao baixar ${nome}: HTTP ${r.status}`);
      fs.writeFileSync(arquivo, Buffer.from(await r.arrayBuffer()));
    }
    carregadas[nome] = opentype.parse(fs.readFileSync(arquivo).buffer.slice(0));
  }
  return carregadas;
}

// Glifo a glifo pra poder aplicar o tracking da linha e somar o kerning do par.
// O `d` é montado à mão porque o toPathData() do opentype.js emite NaN em
// alguns corpos fracionários, e um NaN engole o resto do path.
const num = v => (Math.round(v * 100) / 100).toString();
function comandosParaD(comandos) {
  return comandos.map(c => {
    if (c.type === 'M' || c.type === 'L') return `${c.type}${num(c.x)} ${num(c.y)}`;
    if (c.type === 'Q') return `Q${num(c.x1)} ${num(c.y1)} ${num(c.x)} ${num(c.y)}`;
    if (c.type === 'C') return `C${num(c.x1)} ${num(c.y1)} ${num(c.x2)} ${num(c.y2)} ${num(c.x)} ${num(c.y)}`;
    return 'Z';
  }).join('');
}

function caminhoTexto(fonte, texto, corpo, x, y, { tracking = 0, cor = '#fff' } = {}) {
  const glifos = [...texto].map(ch => fonte.charToGlyph(ch));
  let cursor = x, d = '';
  glifos.forEach((g, i) => {
    d += comandosParaD(g.getPath(cursor, y, corpo).commands) + ' ';
    cursor += (g.advanceWidth / fonte.unitsPerEm) * corpo + tracking;
    const proximo = glifos[i + 1];
    if (proximo) cursor += (fonte.getKerningValue(g, proximo) / fonte.unitsPerEm) * corpo;
  });
  return { path: `<path d="${d.trim()}" fill="${cor}"/>`, largura: cursor - x - tracking };
}

const mede = (fonte, texto, corpo, tracking) =>
  caminhoTexto(fonte, texto, corpo, 0, 0, { tracking }).largura;

/**
 * Quebra o título em até MAX_LINHAS linhas que caibam em MAX_W, reduzindo o
 * corpo de CAP_MAX até CAP_MIN. Devolve null se não couber em corpo nenhum —
 * o chamador trata como erro, porque card com texto cortado é pior que build
 * quebrado.
 */
function ajustaTitulo(fonte, titulo) {
  for (let cap = CAP_MAX; cap >= CAP_MIN; cap -= 2) {
    const corpo = cap / CAP_HEIGHT;
    const tracking = -cap * 0.028;
    const palavras = titulo.split(/\s+/);
    const linhas = [];
    let atual = '';
    let estourou = false;
    for (const palavra of palavras) {
      const teste = atual ? `${atual} ${palavra}` : palavra;
      if (mede(fonte, teste, corpo, tracking) <= MAX_W) {
        atual = teste;
        continue;
      }
      if (!atual) { estourou = true; break; }   // palavra sozinha não cabe
      linhas.push(atual);
      atual = palavra;
      if (mede(fonte, atual, corpo, tracking) > MAX_W) { estourou = true; break; }
    }
    if (estourou) continue;
    if (atual) linhas.push(atual);
    if (linhas.length <= MAX_LINHAS) return { linhas, cap, corpo, tracking };
  }
  return null;
}

/** Frontmatter YAML simples — só os campos escalares que este script usa. */
function leFrontmatter(arquivo) {
  const bruto = fs.readFileSync(arquivo, 'utf8');
  const m = bruto.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) throw new Error(`${path.basename(arquivo)}: frontmatter não encontrado`);
  const dados = {};
  for (const linha of m[1].split(/\r?\n/)) {
    const kv = linha.match(/^([a-zA-Z]+):\s*(.+)$/);
    if (!kv) continue;
    let valor = kv[2].trim();
    if (/^["'].*["']$/.test(valor)) valor = valor.slice(1, -1);
    dados[kv[1]] = valor;
  }
  return dados;
}

function svgArte({ chapeu, linhas, cap, corpo, tracking, apoio, detalhe, dominio, f }) {
  const partes = [];
  const capChapeu = 20;

  // Bloco de texto centrado na vertical: a altura depende de quantas linhas
  // o título ocupou, então as linhas de base são calculadas, não fixas.
  const alturaLinha = cap * 1.34;
  const alturaTitulo = linhas.length * alturaLinha;
  const alturaBloco = capChapeu + 34 + alturaTitulo + 30 + 6 + 40 + 34;
  let y = Math.round((A - alturaBloco) / 2) + capChapeu;

  partes.push(caminhoTexto(f['is-700'], chapeu, capChapeu / CAP_HEIGHT, X, y,
    { tracking: capChapeu * 0.05, cor: COR.ambar }).path);
  y += 34;

  linhas.forEach((linha, i) => {
    y += alturaLinha;
    const ultima = i === linhas.length - 1;
    const palavras = linha.split(/\s+/);
    let x = X;
    const espaco = corpo * 0.26;
    palavras.forEach((palavra, j) => {
      // Na última linha, a última palavra sai em destaque — a mesma gramática
      // visual das outras artes. A pontuação final vai em terracota.
      const destacar = ultima && j === palavras.length - 1;
      const m = destacar && palavra.match(/^(.*?)([.:?!)\]"»]+)$/);
      const corpoPalavra = m ? m[1] : palavra;
      const p = caminhoTexto(f['is-700'], corpoPalavra, corpo, x, y,
        { tracking, cor: destacar ? COR.destaque : COR.creme });
      partes.push(p.path);
      x += p.largura;
      if (m) {
        const pt = caminhoTexto(f['is-700'], m[2], corpo, x, y, { tracking, cor: COR.terra });
        partes.push(pt.path);
        x += pt.largura;
      }
      if (j < palavras.length - 1) x += espaco;
    });
  });

  y += 34;
  partes.push(`<rect x="${X}" y="${y}" width="96" height="6" fill="${COR.terra}"/>`);
  y += 6 + 40;

  partes.push(caminhoTexto(f['is-700'], apoio, 24 / CAP_HEIGHT, X, y,
    { tracking: 1.2, cor: COR.ambar }).path);
  y += 34;
  partes.push(caminhoTexto(f['is-400'], detalhe, 18 / CAP_HEIGHT, X, y,
    { tracking: -0.2, cor: COR.apagado }).path);

  partes.push(caminhoTexto(f['is-500'], dominio ?? DOMINIO_PADRAO, 20, X, A - 50,
    { tracking: 1.2, cor: COR.dominio }).path);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${A}" viewBox="0 0 ${L} ${A}">
  <defs>
    <radialGradient id="brilho" cx="0.18" cy="0.5" r="0.95">
      <stop offset="0" stop-color="#6C3811"/>
      <stop offset="0.42" stop-color="#4F290D"/>
      <stop offset="1" stop-color="#2B1708"/>
    </radialGradient>
    <radialGradient id="reflexo" cx="1" cy="0" r="0.62">
      <stop offset="0" stop-color="#8A5A28" stop-opacity="0.40"/>
      <stop offset="1" stop-color="#8A5A28" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="rodape" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.25" stop-color="#180C03" stop-opacity="0"/>
      <stop offset="1" stop-color="#180C03" stop-opacity="0.40"/>
    </linearGradient>
  </defs>
  <rect width="${L}" height="${A}" fill="url(#brilho)"/>
  <rect width="${L}" height="${A}" fill="url(#reflexo)"/>
  <rect width="${L}" height="${A}" fill="url(#rodape)"/>
  ${partes.join('\n  ')}
  <rect x="0" y="${A - BARRA}" width="${L}" height="${BARRA}" fill="${COR.barra}"/>
</svg>`;
}

async function gera({ arquivoSaida, chapeu, titulo, apoio, detalhe, dominio, f }) {
  const ajuste = ajustaTitulo(f['is-700'], titulo);
  if (!ajuste) {
    throw new Error(
      `título não cabe na arte nem no corpo mínimo (${CAP_MIN}px), ` +
      `mesmo em ${MAX_LINHAS} linhas: "${titulo}". ` +
      `Encurta o título, ou define um titleSeo mais curto no frontmatter.`,
    );
  }
  const svg = svgArte({ chapeu, ...ajuste, apoio, detalhe, dominio, f });

  // O logo vem com folga transparente em volta; sem o trim ele entraria
  // pequeno demais dentro da caixa.
  const logo = await sharp(path.join(raiz, 'public/assets/logo.png'))
    .trim().resize({ width: LOGO_W }).toBuffer();
  const alturaLogo = (await sharp(logo).metadata()).height;

  await sharp(Buffer.from(svg))
    .composite([{ input: logo, left: 150, top: Math.round((A - alturaLogo) / 2) }])
    .jpeg({ quality: 82, chromaSubsampling: '4:4:4' })
    .toFile(arquivoSaida);

  const meta = await sharp(arquivoSaida).metadata();
  const kb = (fs.statSync(arquivoSaida).size / 1024).toFixed(0);
  console.log(`${path.relative(raiz, arquivoSaida)} — ${meta.width}x${meta.height}, ${kb} kB, ` +
              `título em ${ajuste.linhas.length} linha(s) a ${ajuste.cap}px`);
}

function postsPublicados() {
  return fs.readdirSync(POSTS_DIR)
    .filter(n => n.endsWith('.md'))
    .map(n => ({ slug: n.replace(/\.md$/, ''), dados: leFrontmatter(path.join(POSTS_DIR, n)) }))
    .filter(p => p.dados.draft !== 'true');
}

const arg = process.argv[2];

if (arg === '--check') {
  const faltando = postsPublicados()
    .map(p => p.slug)
    .filter(slug => !fs.existsSync(path.join(SAIDA_DIR, `og-blog-${slug}.jpg`)));
  for (const extra of PAGINAS_EXTRA) {
    if (!fs.existsSync(path.join(SAIDA_DIR, extra.arquivo))) faltando.push(`(${extra.arquivo})`);
  }
  if (faltando.length) {
    console.error(`faltam cards de OG:\n  ${faltando.join('\n  ')}\n\nrode: node scripts/og-post.mjs --all`);
    process.exit(1);
  }
  console.log('todos os posts têm card de OG.');
  process.exit(0);
}

const f = await carregaFontes();
CAP_HEIGHT = f['is-700'].tables.os2.sCapHeight / f['is-700'].unitsPerEm;

if (arg === '--all') {
  for (const { slug, dados } of postsPublicados()) {
    await gera({
      arquivoSaida: path.join(SAIDA_DIR, `og-blog-${slug}.jpg`),
      chapeu: `// ${CATEGORIA_LABEL[dados.category] ?? 'BLOG'}`,
      titulo: dados.titleSeo ?? dados.title,
      apoio: 'BLOG DO SERTÃO TECH',
      detalhe: 'Evento de tecnologia em Parnaíba - PI · 09 out 2026',
      f,
    });
  }
  // Cards das páginas que não são post mas usam a mesma arte.
  for (const extra of PAGINAS_EXTRA) {
    const { arquivo, ...conteudo } = extra;
    await gera({ arquivoSaida: path.join(SAIDA_DIR, arquivo), ...conteudo, f });
  }
} else if (arg) {
  const arquivo = path.join(POSTS_DIR, `${arg}.md`);
  if (!fs.existsSync(arquivo)) {
    console.error(`post não encontrado: src/content/blog/${arg}.md`);
    process.exit(1);
  }
  const dados = leFrontmatter(arquivo);
  await gera({
    arquivoSaida: path.join(SAIDA_DIR, `og-blog-${arg}.jpg`),
    chapeu: `// ${CATEGORIA_LABEL[dados.category] ?? 'BLOG'}`,
    titulo: dados.titleSeo ?? dados.title,
    apoio: 'BLOG DO SERTÃO TECH',
    detalhe: 'Evento de tecnologia em Parnaíba - PI · 09 out 2026',
    f,
  });
} else {
  console.error('uso: node scripts/og-post.mjs <slug> | --all | --check');
  process.exit(1);
}
