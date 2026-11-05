import { reactive } from 'vue';
import { api } from './api.js';

/**
 * Quem está logado. Só isso é estado global — o resto vive na tela que usa, e
 * por isso não há Pinia aqui.
 */
export const auth = reactive({
  usuario: null,
  // Null = ainda não perguntamos à api; serve para o router esperar antes de
  // mandar alguém para o login só porque a página acabou de abrir.
  carregado: false,
});

/** Para onde vai quem entra sem destino: o financeiro não tem tela de inscrições. */
export function telaInicial() {
  return { name: auth.usuario?.papel === 'financeiro' ? 'orcamento' : 'inscricoes' };
}

export async function carregaSessao() {
  try {
    auth.usuario = await api('/api/painel/me');
  } catch {
    // 401 (nunca logou, sessão expirou) e api fora do ar caem no mesmo lugar:
    // sem usuário. Deixar o erro subir aqui travaria o router numa tela vazia,
    // e o erro de verdade reaparece na tentativa de login.
    auth.usuario = null;
  } finally {
    auth.carregado = true;
  }
}

export async function entra(email, password) {
  auth.usuario = await api('/api/painel/login', { metodo: 'POST', corpo: { email, password } });
  auth.carregado = true;
}

export async function sai() {
  await api('/api/painel/logout', { metodo: 'POST' });
  auth.usuario = null;
}
