import { createRouter, createWebHistory } from 'vue-router';
import { auth, carregaSessao } from './auth.js';
import Login from './views/Login.vue';
import Inscricoes from './views/Inscricoes.vue';
import Emails from './views/Emails.vue';
import Lgpd from './views/Lgpd.vue';
import Metricas from './views/Metricas.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: Login, meta: { publica: true } },
    { path: '/inscricoes', name: 'inscricoes', component: Inscricoes },
    { path: '/metricas', name: 'metricas', component: Metricas },
    // Só admin: o App.vue mostra o estado de 403 no lugar da tela, sem montá-la,
    // e a api responde 403 de qualquer jeito — a tela não é a tranca.
    { path: '/emails', name: 'emails', component: Emails, meta: { admin: true } },
    { path: '/lgpd', name: 'lgpd', component: Lgpd, meta: { admin: true } },
    { path: '/:qualquer(.*)*', redirect: '/inscricoes' },
  ],
});

router.beforeEach(async (destino) => {
  // Primeira navegação da aba: pergunta à api se já existe sessão, senão um
  // F5 em /inscricoes jogaria no login mesmo com o cookie válido.
  if (!auth.carregado) await carregaSessao();

  if (!destino.meta.publica && !auth.usuario) {
    return { name: 'login', query: { destino: destino.fullPath } };
  }

  if (destino.name === 'login' && auth.usuario) {
    return { name: 'inscricoes' };
  }

  return true;
});
