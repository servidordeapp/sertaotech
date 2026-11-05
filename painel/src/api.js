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
 * Download do CSV por navegação, não por fetch: o navegador manda o cookie de
 * sessão (mesmo domínio registrável) e cuida do "salvar como" sozinho.
 */
export function urlDeExport(parametros) {
  return `${BASE}/api/painel/inscricoes/export?${new URLSearchParams(parametros)}`;
}
