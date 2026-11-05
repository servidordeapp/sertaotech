import { createApp } from 'vue';
import * as Sentry from '@sentry/vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import 'primeicons/primeicons.css';
import './estilo.css';
import App from './App.vue';
import { router } from './router.js';

const app = createApp(App);

// DSN de browser é público por design. `enabled` desliga em dev: erro de quem
// está escrevendo o código não é incidente, e o `vite dev` sozinho encheria o
// projeto de ruído. Só erro, nada de tracing nem replay — o painel é interno,
// com meia dúzia de usuários, e sessão gravada de uma tela que mostra dado
// pessoal de inscrito é o tipo de coisa que a LGPD não perdoa.
Sentry.init({
  app,
  dsn: 'https://b214235b6ffcb204256ad9d9c764fe7f@o4507074601484288.ingest.us.sentry.io/4512379713617920',
  enabled: import.meta.env.PROD,
  sendDefaultPii: false,
});

app
  // darkModeSelector: false trava o tema no claro. O padrão do PrimeVue é
  // 'system', e aí os componentes seguiam o modo escuro do sistema enquanto o
  // CSS daqui (fundo, cabeçalho, cartão de login) continuava claro — metade da
  // tela de cada cor.
  .use(PrimeVue, { theme: { preset: Aura, options: { darkModeSelector: false } } })
  .use(ToastService)
  .use(ConfirmationService)
  .use(router)
  .mount('#app');
