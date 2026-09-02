#!/usr/bin/env node
// Gera as artes do LinkedIn na mesma linguagem visual das artes de Open Graph
// (scripts/og-card.mjs): fundo marrom em gradiente, o selo do Sertão Tech à
// esquerda, coluna de texto à direita e a barra terracota no rodapé.
//
// Dois formatos:
//   evento — 1920x1080 (16:9), a capa da página de evento. O LinkedIn pede
//            largura mínima de 480px; 1920 é o tamanho seguro em tela grande.
//   perfil — 1584x396 (4:1), a capa de perfil pessoal. A foto do perfil cobre o
//            canto inferior esquerdo no desktop, então o conteúdo começa só a
//            partir de ~440px e o selo é bem menor.
//
// As medidas do formato "evento" saíram das da arte 1200x630 multiplicadas por
// 1.6 (a escala entre as larguras) e reajustadas na vertical, que em 16:9 sobra
// bem mais espaço. As do "perfil" foram refeitas do zero — em 396px de altura
// não cabe título em duas linhas.
//
// Assim como no og-card, o texto vira path com opentype.js antes de ir pro SVG:
// Instrument Sans não está instalada na máquina que renderiza, e sem os paths a
// arte sairia em DejaVu.
//
// Uso:
//   npm i sharp opentype.js     # não são dependências do site, instale sob demanda
//   node scripts/linkedin-cover.mjs evento
//   node scripts/linkedin-cover.mjs perfil

import sharp from 'sharp';
import opentype from 'opentype.js';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Em `titulo`, cada palavra é [texto, cor, coladoNaProxima] — o ponto final
// entra colado na palavra em destaque; só as palavras entre si levam espaço.
// `cap` é a altura de caixa-alta em px (o corpo é derivado dela) e `y` é a
// linha de base.
const FORMATOS = {
  evento: {
    arquivo: 'linkedin-cover.jpg',
    largura: 1920, altura: 1080,
    logo: { largura: 392, x: 200 },
    x: 700, barra: 16,
    chapeu:  { texto: '// 2ª EDIÇÃO · PARNAÍBA - PI', cap: 26, y: 322, tracking: 0.96 },
    titulo: [
      { palavras: [['Dê o primeiro passo', 'creme', true]], cap: 66, y: 466, tracking: -1.76 },
      { palavras: [['na', 'creme', false], ['tecnologia', 'destaque', true], ['.', 'terra', true]], cap: 66, y: 578, tracking: -1.76 },
    ],
    regua:   { y: 632, largura: 154, altura: 6 },
    apoio:   { texto: '09 OUT 2026 · 14H ÀS 21H30', cap: 37, y: 748, tracking: 1.92 },
    detalhe: { texto: 'UFDPar · Campus Ministro Reis Velloso · Parnaíba - PI', cap: 27, y: 808, tracking: -0.32 },
    dominio: { corpo: 30, y: 902, tracking: 1.76 },
  },
  perfil: {
    arquivo: 'linkedin-perfil.jpg',
    largura: 1584, altura: 396,
    // O selo entra depois da área que a foto do perfil cobre no desktop.
    logo: { largura: 190, x: 372 },
    x: 640, barra: 8,
    chapeu:  { texto: '// 2ª EDIÇÃO · PARNAÍBA - PI', cap: 18, y: 112, tracking: 0.66 },
    titulo: [
      { palavras: [['Dê o primeiro passo na', 'creme', false], ['tecnologia', 'destaque', true], ['.', 'terra', true]], cap: 38, y: 188, tracking: -1.02 },
    ],
    regua:   { y: 216, largura: 96, altura: 4 },
    apoio:   { texto: '09 OUT 2026 · 14H ÀS 21H30', cap: 24, y: 282, tracking: 1.25 },
    detalhe: { texto: 'UFDPar · Parnaíba - PI', cap: 18, y: 322, tracking: -0.22 },
    dominio: { corpo: 20, y: 322, tracking: 1.15, alinhaDireita: 1504 },
  },
};

const DOMINIO = 'osertaotech.com.br';

// Amostradas do selo; correspondem a ds/tokens/colors.css.
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

// Glifo a glifo pra poder aplicar o tracking de cada linha e somar o kerning do
// par. O `d` é montado à mão porque o toPathData() do opentype.js emite NaN em
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

const slug = process.argv[2] ?? 'evento';
const fmt = FORMATOS[slug];
if (!fmt) {
  console.error(`uso: node scripts/linkedin-cover.mjs <${Object.keys(FORMATOS).join('|')}>`);
  process.exit(1);
}

const f = await carregaFontes();
const capHeight = f['is-700'].tables.os2.sCapHeight / f['is-700'].unitsPerEm;
const corpoDe = cap => cap / capHeight;
const { largura: L, altura: A, x: X } = fmt;

const partes = [];
const fins = {};

partes.push(caminhoTexto(f['is-700'], fmt.chapeu.texto, corpoDe(fmt.chapeu.cap), X, fmt.chapeu.y,
  { tracking: fmt.chapeu.tracking, cor: COR.ambar }).path);

for (const linha of fmt.titulo) {
  const corpo = corpoDe(linha.cap);
  const espaco = corpo * 0.26;
  let x = X;
  for (const [texto, cor, colado] of linha.palavras) {
    const p = caminhoTexto(f['is-700'], texto, corpo, x, linha.y, { tracking: linha.tracking, cor: COR[cor] });
    partes.push(p.path);
    x += p.largura + (colado ? 0 : espaco);
  }
  fins.titulo = Math.max(fins.titulo ?? 0, x);
}

partes.push(`<rect x="${X}" y="${fmt.regua.y}" width="${fmt.regua.largura}" height="${fmt.regua.altura}" fill="${COR.terra}"/>`);

for (const [chave, fonte, cor] of [['apoio', 'is-700', COR.ambar], ['detalhe', 'is-400', COR.apagado]]) {
  const cfg = fmt[chave];
  const p = caminhoTexto(f[fonte], cfg.texto, corpoDe(cfg.cap), X, cfg.y, { tracking: cfg.tracking, cor });
  partes.push(p.path);
  fins[chave] = X + p.largura;
}

// No formato de perfil o domínio divide a linha com o detalhe, encostado na
// margem direita — daí a medição prévia pra descobrir onde ele começa.
const d = fmt.dominio;
const larguraDominio = caminhoTexto(f['is-500'], DOMINIO, d.corpo, 0, 0, { tracking: d.tracking }).largura;
const xDominio = d.alinhaDireita ? d.alinhaDireita - larguraDominio : X;
partes.push(caminhoTexto(f['is-500'], DOMINIO, d.corpo, xDominio, d.y, { tracking: d.tracking, cor: COR.dominio }).path);

// Três camadas: o brilho principal à esquerda na altura do selo, um reflexo
// quente no canto superior direito e o rodapé escurecendo antes da barra.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${A}" viewBox="0 0 ${L} ${A}">
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
  <rect x="0" y="${A - fmt.barra}" width="${L}" height="${fmt.barra}" fill="${COR.barra}"/>
</svg>`;

// O logo vem com folga transparente em volta; sem o trim ele entraria pequeno
// demais dentro da caixa.
const logo = await sharp(path.join(raiz, 'assets/logo.png')).trim().resize({ width: fmt.logo.largura }).toBuffer();
const alturaLogo = (await sharp(logo).metadata()).height;
const saida = path.join(raiz, 'assets', fmt.arquivo);
await sharp(Buffer.from(svg))
  .composite([{ input: logo, left: fmt.logo.x, top: Math.round((A - alturaLogo) / 2) }])
  .jpeg({ quality: 88, chromaSubsampling: '4:4:4' })
  .toFile(saida);

const m = await sharp(saida).metadata();
console.log(`${saida} — ${m.width}x${m.height}, ${(fs.statSync(saida).size / 1024).toFixed(0)} kB`);
console.log(`fim das linhas — título ${fins.titulo.toFixed(0)} · apoio ${fins.apoio.toFixed(0)} · detalhe ${fins.detalhe.toFixed(0)} (a arte tem ${L} de largura)`);
