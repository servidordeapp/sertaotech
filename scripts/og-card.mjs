#!/usr/bin/env node
// Gera a arte de compartilhamento (Open Graph / Twitter card) de uma rota do
// site, no mesmo template das artes de /patrocinio e /palestrantes: fundo
// marrom em gradiente, o selo do Sertão Tech à esquerda e a coluna de texto à
// direita, terminando na barra terracota do rodapé.
//
// O texto é convertido em path com opentype.js antes de ir pro SVG. Sem isso a
// arte dependeria da fonte instalada na máquina que renderiza — e Instrument
// Sans não está instalada em lugar nenhum aqui; o resultado sairia em DejaVu.
// Os TTFs vêm do Google Fonts e ficam num cache em /tmp (o endpoint responde
// TTF, e não WOFF2, quando o User-Agent é antigo — opentype.js não lê WOFF2).
//
// Uso:
//   npm i sharp opentype.js     # não são dependências do site, instale sob demanda
//   node scripts/og-card.mjs caravanas
//
// Medidas (posição, corpo e tracking de cada linha) foram tiradas pixel a pixel
// de assets/og-patrocinio.jpg pra arte nova entrar na mesma grade das antigas.
// Ao adicionar uma rota, mexa só no bloco ROTAS.

import sharp from 'sharp';
import opentype from 'opentype.js';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Cada arte: chapéu, título em duas linhas (com uma palavra em destaque âmbar),
// um par de linhas de apoio e o domínio no rodapé.
const ROTAS = {
  caravanas: {
    chapeu: '// CARAVANAS · 2ª EDIÇÃO',
    linha1: 'Traga sua caravana',
    linha2: ['pro Sertão', 'Tech', '2026.'],
    apoio: 'DE 20 A 50 PESSOAS',
    detalhe: '09 out 2026 · norte do Piauí',
  },
  patrocinio: {
    chapeu: '// PATROCÍNIO · 2ª EDIÇÃO',
    linha1: 'Patrocine o',
    linha2: ['Sertão', 'Tech', '2026.'],
    apoio: 'OURO · PRATA · BRONZE',
    detalhe: '09 out 2026 · norte do Piauí',
  },
  palestrantes: {
    chapeu: '// CHAMADA DE PALESTRAS',
    linha1: 'Palestre no',
    linha2: ['Sertão', 'Tech', '2026.'],
    apoio: 'SUBMISSÃO ABERTA',
    detalhe: '30 min de palco · 9 áreas · norte do Piauí',
  },
};

const DOMINIO = 'osertaotech.com.br';

// Amostradas da arte original (que por sua vez saiu do selo). Correspondem a
// ds/tokens/colors.css: amber-300, amber-400, terra-600, terra-500.
const COR = {
  creme:    '#FFFCF3',
  ambar:    '#F6C56C',
  destaque: '#EDA83E',
  apagado:  '#D5BB8A',
  terra:    '#A8511A',
  barra:    '#BC5E1A',
  dominio:  '#C2661D',
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

// Percorre glifo a glifo em vez de font.getPath(): assim dá pra aplicar o
// tracking de cada linha (o título é negativo, os caixa-alta são positivos) e
// ainda somar o kerning do par. stringToGlyphs quebra em acento — o shaper do
// opentype.js não implementa o lookup ccmp destas fontes —, então o mapa é
// direto por caractere, que já basta pra acentuação pré-composta do português.
// O toPathData() do opentype.js emite NaN em alguns corpos fracionários (o C de
// Instrument Sans a 22.22px, por exemplo) — e um NaN no meio do atributo faz o
// renderizador abandonar o resto do path, engolindo a linha da metade em
// diante. Os comandos em si vêm certos, então o `d` é montado aqui.
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

const slug = process.argv[2];
const rota = ROTAS[slug];
if (!rota) {
  console.error(`uso: node scripts/og-card.mjs <${Object.keys(ROTAS).join('|')}>`);
  process.exit(1);
}

const f = await carregaFontes();
const capHeight = f['is-700'].tables.os2.sCapHeight / f['is-700'].unitsPerEm;
// Corpos derivados da altura de caixa-alta medida na arte original.
const CORPO = { titulo: 38.5 / capHeight, chapeu: 16 / capHeight, apoio: 23 / capHeight, detalhe: 17 / capHeight, dominio: 18.6 };
const X = 524; // início da coluna de texto

const partes = [];
partes.push(caminhoTexto(f['is-700'], rota.chapeu, CORPO.chapeu, X, 150, { tracking: 0.6, cor: COR.ambar }).path);
partes.push(caminhoTexto(f['is-700'], rota.linha1, CORPO.titulo, X, 238, { tracking: -1.1, cor: COR.creme }).path);

const [pre, destaque, pos] = rota.linha2;
const espaco = CORPO.titulo * 0.26;
let x = X;
for (const [texto, cor] of [[pre, COR.creme], [destaque, COR.destaque], [pos, COR.creme]]) {
  const p = caminhoTexto(f['is-700'], texto, CORPO.titulo, x, 300, { tracking: -1.1, cor });
  partes.push(p.path);
  x += p.largura + espaco;
}
const fimTitulo = x - espaco;

partes.push(`<rect x="${X}" y="342" width="96" height="4" fill="${COR.terra}"/>`);
partes.push(caminhoTexto(f['is-700'], rota.apoio, CORPO.apoio, X, 417, { tracking: 1.2, cor: COR.ambar }).path);
partes.push(caminhoTexto(f['is-400'], rota.detalhe, CORPO.detalhe, X, 465, { tracking: -0.2, cor: COR.apagado }).path);
partes.push(caminhoTexto(f['is-500'], DOMINIO, CORPO.dominio, X, 580, { tracking: 1.1, cor: COR.dominio }).path);

// Três camadas porque um radial só não reproduz o fundo original: o brilho
// principal fica à esquerda na altura do selo, há um reflexo quente no canto
// superior direito e o rodapé escurece antes da barra terracota.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="brilho" cx="0.16" cy="0.47" r="0.98">
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
  <rect width="1200" height="630" fill="url(#brilho)"/>
  <rect width="1200" height="630" fill="url(#reflexo)"/>
  <rect width="1200" height="630" fill="url(#rodape)"/>
  ${partes.join('\n  ')}
  <rect x="0" y="620" width="1200" height="10" fill="${COR.barra}"/>
</svg>`;

// O logo vem com folga transparente em volta; sem o trim ele entraria pequeno
// demais dentro da caixa de 254px.
const logo = await sharp(path.join(raiz, 'assets/logo.png')).trim().resize({ width: 254 }).toBuffer();
const saida = path.join(raiz, 'assets', `og-${slug}.jpg`);
await sharp(Buffer.from(svg))
  .composite([{ input: logo, left: 151, top: 135 }])
  .jpeg({ quality: 82, chromaSubsampling: '4:4:4' })
  .toFile(saida);

const m = await sharp(saida).metadata();
console.log(`${saida} — ${m.width}x${m.height}, ${(fs.statSync(saida).size / 1024).toFixed(0)} kB`);
console.log(`linha 2 termina em x=${fimTitulo.toFixed(0)} (a arte tem 1200 de largura; passar de ~1140 encosta na borda)`);
