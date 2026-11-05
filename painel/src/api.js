/**
 * Cliente da api. Sessão por cookie (Sanctum em modo SPA): nada de token no
 * JavaScript, então `credentials: 'include'` em toda chamada e o X-XSRF-TOKEN
 * lido do cookie que a api planta.
 */
const BASE = import.meta.env.VITE_API_URL || 'https://api.osertaotech.com.br';

export class ErroApi extends Error {
  constructor(status, corpo) {
    super(corpo?.message || 'Falha ao falar com a api.');
    this.status = status;
    // Erros de validação do Laravel: { campo: ['mensagem'] }.
    this.erros = corpo?.errors || {};
  }
}

function cookie(nome) {
  const achado = document.cookie.split('; ').find((c) => c.startsWith(`${nome}=`));
  return achado ? decodeURIComponent(achado.slice(nome.length + 1)) : null;
}

/** O cookie de CSRF vale para a sessão inteira; só é buscado quando falta. */
async function garanteCsrf() {
  if (cookie('XSRF-TOKEN')) return;
  await fetch(`${BASE}/sanctum/csrf-cookie`, { credentials: 'include' });
}

export async function api(caminho, { metodo = 'GET', corpo } = {}) {
  if (metodo !== 'GET') await garanteCsrf();

  const resposta = await fetch(BASE + caminho, {
    method: metodo,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(corpo ? { 'Content-Type': 'application/json' } : {}),
      ...(cookie('XSRF-TOKEN') ? { 'X-XSRF-TOKEN': cookie('XSRF-TOKEN') } : {}),
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });

  if (!resposta.ok) {
    throw new ErroApi(resposta.status, await resposta.json().catch(() => null));
  }

  return resposta.json();
}

/**
 * Download por fetch, não por navegação: link não manda `Origin` e, com
 * `Referrer-Policy: same-origin` no painel, também não manda `Referer` — sem um
 * dos dois o Sanctum não vê a request como stateful e ignora a sessão.
 */
async function baixa(caminho, nome, aceita) {
  const resposta = await fetch(BASE + caminho, { credentials: 'include', headers: { Accept: aceita } });

  if (!resposta.ok) {
    throw new ErroApi(resposta.status, await resposta.json().catch(() => null));
  }

  salvaArquivo(await resposta.blob(), nome);
}

export function salvaArquivo(blob, nome) {
  const url = URL.createObjectURL(blob);

  Object.assign(document.createElement('a'), { href: url, download: nome }).click();

  URL.revokeObjectURL(url);
}

export function baixaExport(parametros) {
  const carimbo = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

  return baixa(`/api/painel/inscricoes/export?${new URLSearchParams(parametros)}`, `inscricoes-${carimbo}.csv`, 'text/csv');
}

export function baixaAnexo(caminho, nome) {
  return baixa(caminho, nome, 'application/pdf');
}

/** Upload: sem Content-Type de propósito, é o navegador que põe o boundary do multipart. */
export async function enviaArquivo(caminho, arquivo) {
  await garanteCsrf();

  const corpo = new FormData();
  corpo.append('arquivo', arquivo);

  const resposta = await fetch(BASE + caminho, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(cookie('XSRF-TOKEN') ? { 'X-XSRF-TOKEN': cookie('XSRF-TOKEN') } : {}),
    },
    body: corpo,
  });

  if (!resposta.ok) {
    throw new ErroApi(resposta.status, await resposta.json().catch(() => null));
  }

  return resposta.json();
}
