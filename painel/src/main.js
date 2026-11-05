import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import ToastService from 'primevue/toastservice';
import 'primeicons/primeicons.css';
import './estilo.css';
import App from './App.vue';
import { router } from './router.js';

createApp(App)
  // darkModeSelector: false trava o tema no claro. O padrão do PrimeVue é
  // 'system', e aí os componentes seguiam o modo escuro do sistema enquanto o
  // CSS daqui (fundo, cabeçalho, cartão de login) continuava claro — metade da
  // tela de cada cor.
  .use(PrimeVue, { theme: { preset: Aura, options: { darkModeSelector: false } } })
  .use(ToastService)
  .use(router)
  .mount('#app');
