/**
 * Checa o lightbox de /fotos/<ano> num Chrome de verdade, via CDP.
 *
 * Roda com `npm run check:lightbox`, depois de `npm run build`. Sobe o preview
 * e o Chrome sozinho e derruba os dois no fim. Sem dependência nova: o Node 24
 * já tem WebSocket, e o Chrome vem do cache do Playwright (ou de $CHROME).
 *
 * Por que existe: o lightbox tem índice circular e uma corrida de foco com a
 * restauração nativa do <dialog>, que é assíncrona. A primeira versão perdia
 * essa corrida sem erro nenhum no console — só um leitor de tela percebia.
 * Fica fora do verify-build.sh porque precisa de browser; rode ao mexer no
 * script da galeria.
 */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const PORTA_SITE = 4330;
const PORTA_CDP = 9333;

function acharChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  const cache = join(homedir(), '.cache/ms-playwright');
  if (!existsSync(cache)) return null;
  for (const dir of readdirSync(cache).filter((d) => d.startsWith('chromium-'))) {
    const bin = join(cache, dir, 'chrome-linux64/chrome');
    if (existsSync(bin)) return bin;
  }
  return null;
}

const chrome = acharChrome();
if (!chrome) {
  console.log('  pulado: nenhum Chrome encontrado (defina $CHROME ou instale o browser do Playwright)');
  process.exit(0);
}

const processos = [];
function sobe(cmd, args) {
  const p = spawn(cmd, args, { stdio: 'ignore', detached: true });
  processos.push(p);
  return p;
}
function derruba() {
  for (const p of processos) { try { process.kill(-p.pid, 'SIGKILL'); } catch {} }
}
process.on('exit', derruba);

async function esperaPorta(url) {
  for (let i = 0; i < 60; i++) {
    try { await fetch(url); return; } catch { await new Promise((r) => setTimeout(r, 250)); }
  }
  throw new Error(`nada respondeu em ${url}`);
}

sobe('npx', ['astro', 'preview', '--port', String(PORTA_SITE)]);
sobe(chrome, [
  '--headless', '--disable-gpu', '--no-sandbox',
  `--remote-debugging-port=${PORTA_CDP}`,
  `--user-data-dir=${join(process.env.TMPDIR ?? '/tmp', 'check-lightbox-profile')}`,
  'about:blank',
]);
await esperaPorta(`http://localhost:${PORTA_SITE}/fotos`);
await esperaPorta(`http://127.0.0.1:${PORTA_CDP}/json/version`);

const alvo = await (await fetch(`http://127.0.0.1:${PORTA_CDP}/json/new?http://localhost:${PORTA_SITE}/fotos/2026`, { method: 'PUT' })).json();
const ws = new WebSocket(alvo.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));

let id = 0;
const pendentes = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (pendentes.has(m.id)) pendentes.get(m.id)(m), pendentes.delete(m.id);
};
const envia = (method, params = {}) =>
  new Promise((r) => (pendentes.set(++id, r), ws.send(JSON.stringify({ id, method, params }))));

const js = async (expr) => {
  const r = await envia('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails));
  return r.result.result.value;
};

await envia('Page.enable');
for (let i = 0; i < 60 && !(await js('document.readyState === "complete"')); i++)
  await new Promise((r) => setTimeout(r, 200));

const total = await js('document.querySelectorAll(".gal-open").length');
assert.equal(total, 11, `esperava 11 fotos, veio ${total}`);

assert.equal(await js('document.getElementById("lightbox").open'), false, 'lightbox começa fechado');

// Abre na 3ª foto.
await js('document.querySelectorAll(".gal-open")[2].click()');
assert.equal(await js('document.getElementById("lightbox").open'), true, 'clique no thumbnail abre');
const terceira = await js('document.querySelectorAll(".gal-open")[2].dataset.full');
assert.equal(await js('new URL(document.getElementById("lbImg").src).pathname'), terceira, 'mostra a foto clicada');
assert.equal(await js('new URL(document.getElementById("lbDl").href).pathname'), terceira, 'download aponta pra foto aberta');
assert.ok(await js('document.getElementById("lbCap").textContent.length > 10'), 'legenda preenchida');

// Próxima e anterior.
await js('document.getElementById("lbNext").click()');
const quarta = await js('document.querySelectorAll(".gal-open")[3].dataset.full');
assert.equal(await js('new URL(document.getElementById("lbImg").src).pathname'), quarta, 'seta avança');
await js('document.getElementById("lbPrev").click()');
assert.equal(await js('new URL(document.getElementById("lbImg").src).pathname'), terceira, 'seta volta');

// Circular: da primeira, "anterior" vai pra última.
await js('document.getElementById("lbClose").click(); document.querySelectorAll(".gal-open")[0].click()');
await js('document.getElementById("lbPrev").click()');
const ultima = await js('document.querySelectorAll(".gal-open")[10].dataset.full');
assert.equal(await js('new URL(document.getElementById("lbImg").src).pathname'), ultima, 'anterior na 1ª dá a volta');

// Nome do arquivo baixado e fechamento devolvendo o foco.
assert.match(await js('document.getElementById("lbDl").getAttribute("download")'), /^sertao-tech-.*\.webp$/, 'nome do download');
// Fecha a partir da última foto e confere que o foco segue a navegação, não
// o thumbnail que abriu (que é pra onde o <dialog> restauraria sozinho).
await js('document.getElementById("lbClose").click()');
assert.equal(await js('document.getElementById("lightbox").open'), false, 'fecha');
const focado = await js(`(async () => {
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const b = document.querySelectorAll('.gal-open');
  return Array.prototype.indexOf.call(b, document.activeElement);
})()`);
assert.equal(focado, 10, `foco devia voltar pro thumbnail 10 (o aberto), veio ${focado}`);

// Download direto do grid não depende de JS.
assert.equal(await js('document.querySelectorAll(".gal-dl[download]").length'), 11, 'todo item tem <a download>');

console.log('ok   lightbox: abre, navega, circula, baixa e devolve o foco (11 fotos)');
ws.close();
derruba();
process.exit(0);
