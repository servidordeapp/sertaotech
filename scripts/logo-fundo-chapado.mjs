#!/usr/bin/env node
// Prepara o logo de um patrocinador que veio com fundo chapado (arte em cima de
// um bloco de cor da marca) para o mural #patrocinadores.
//
// ANTES DE RODAR: recortar o fundo é alterar a marca do patrocinador, e a
// maioria tem manual de marca que proíbe isso. O caminho certo é pedir a versão
// oficial em fundo transparente ou fundo claro — quase toda empresa tem. Use
// este script só quando a empresa autorizar, ou quando der pra confirmar que o
// resultado bate com uma versão oficial que eles já usam. Ver "Regra zero" em
// assets/patrocinadores/README.md.
//
// O que faz: lê a cor do canto superior esquerdo, joga todo pixel próximo dela
// pra alpha 0, corta no limite exato do desenho e exporta WebP lossless na
// largura de exibição vezes 4 (folga pra tela retina).
//
// Por que o recorte é binário e não com alpha proporcional: a arte é chapada
// (duas ou três cores sólidas), então o serrilhado do original tem 1-2px numa
// imagem de milhares de pixels. O resize do sharp é premultiplicado, então esse
// serrilhado vira antialias limpo no tamanho final — e keying proporcional
// deixaria semitransparentes os pixels internos que fazem borda entre duas
// cores do próprio logo (o `</>` branco dentro do hexágono preto, por exemplo).
//
// Uso:
//   npm i sharp        # não é dependência do site, instale sob demanda
//   node scripts/logo-fundo-chapado.mjs "arte-original.png" nome-da-empresa [largura]
//
// Depois confira o resultado sobre o cream do card antes de subir: fundo claro
// esconde logo branco, e sobra de fundo aparece como retângulo colorido.

import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const [src, slug, widthArg] = process.argv.slice(2);
if (!src || !slug) {
  console.error('uso: node scripts/logo-fundo-chapado.mjs <arte-original> <slug> [largura]');
  process.exit(1);
}

const TOL = 60; // distância máx. por canal pra considerar o pixel como fundo
const OUT_W = Number(widthArg) || 640;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(repoRoot, 'assets/patrocinadores', `${slug}.webp`);

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const bg = [data[0], data[1], data[2]];

let minX = W, minY = H, maxX = -1, maxY = -1;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * C;
    const d = Math.max(
      Math.abs(data[i]     - bg[0]),
      Math.abs(data[i + 1] - bg[1]),
      Math.abs(data[i + 2] - bg[2]),
    );
    if (d < TOL) data[i + 3] = 0;
    else {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

if (maxX < 0) {
  console.error('a imagem inteira bateu com a cor do canto — ela tem fundo chapado mesmo?');
  process.exit(1);
}

// Sem margem no recorte: o respiro visual vem do padding do .logo-card.
await sharp(data, { raw: { width: W, height: H, channels: C } })
  .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
  .resize({ width: OUT_W, fit: 'inside', kernel: 'lanczos3' })
  .webp({ lossless: true, effort: 6 })
  .toFile(out);

const m = await sharp(out).metadata();
console.log(`fundo removido: rgb(${bg}) | ${out} — ${m.width}x${m.height}`);
console.log(`no HTML: width="${m.width}" height="${m.height}"`);
