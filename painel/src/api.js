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
 * Download do CSV por fetch, não por navegação: link não manda `Origin` e,
 * com `Referrer-Policy: same-origin` no painel, também não manda `Referer` —
 * sem um dos dois o Sanctum não vê a request como stateful e ignora a sessão.
 */
export async function baixaExport(parametros) {
  const resposta = await fetch(
    `${BASE}/api/painel/inscricoes/export?${new URLSearchParams(parametros)}`,
    { credentials: 'include', headers: { Accept: 'text/csv' } },
  );

  if (!resposta.ok) {
    throw new ErroApi(resposta.status, await resposta.json().catch(() => null));
  }

  const url = URL.createObjectURL(await resposta.blob());
  const carimbo = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

  Object.assign(document.createElement('a'), {
    href: url,
    download: `inscricoes-${carimbo}.csv`,
  }).click();

  URL.revokeObjectURL(url);
}
