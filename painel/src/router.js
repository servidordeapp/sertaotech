import { createRouter, createWebHistory } from 'vue-router';
import { auth, carregaSessao, telaInicial } from './auth.js';
import Login from './views/Login.vue';
import Apresentacoes from './views/Apresentacoes.vue';
import Inscricoes from './views/Inscricoes.vue';
import Emails from './views/Emails.vue';
import Lgpd from './views/Lgpd.vue';
import Metricas from './views/Metricas.vue';
import Orcamento from './views/Orcamento.vue';

const COM_INSCRICOES = ['admin', 'comercial', 'curadoria'];

/**
 * `papeis` é quem vê a tela; sem ele, todo mundo logado. O App.vue usa isto para
 * montar o menu e para mostrar o 403 no lugar da tela, sem montá-la. Não é a
 * tranca: a api responde 403 de qualquer jeito. `porEdicao` liga o seletor.
 */
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: Login, meta: { publica: true } },
    { path: '/inscricoes', name: 'inscricoes', component: Inscricoes, meta: { papeis: COM_INSCRICOES } },
    { path: '/metricas', name: 'metricas', component: Metricas, meta: { papeis: COM_INSCRICOES } },
    { path: '/emails', name: 'emails', component: Emails, meta: { papeis: ['admin'] } },
    { path: '/lgpd', name: 'lgpd', component: Lgpd, meta: { papeis: ['admin'] } },
    { path: '/apresentacoes', name: 'apresentacoes', component: Apresentacoes, meta: { porEdicao: true } },
    {
      path: '/orcamento',
      name: 'orcamento',
      component: Orcamento,
      meta: { papeis: ['admin', 'financeiro', 'comercial'], porEdicao: true },
    },
    // Sem `redirect`: ele rodaria antes do guarda saber quem está logado, e a tela
    // inicial depende do papel. O guarda abaixo desvia daqui, a Login nunca monta.
    { path: '/:qualquer(.*)*', name: 'inicio', component: Login },
  ],
});

router.beforeEach(async (destino) => {
  // Primeira navegação da aba: pergunta à api se já existe sessão, senão um
  // F5 em /inscricoes jogaria no login mesmo com o cookie válido.
  if (!auth.carregado) await carregaSessao();

  if (!destino.meta.publica && !auth.usuario) {
    return { name: 'login', query: { destino: destino.fullPath } };
  }

  if (destino.name === 'inicio' || (destino.name === 'login' && auth.usuario)) {
    return telaInicial();
  }

  return true;
});
