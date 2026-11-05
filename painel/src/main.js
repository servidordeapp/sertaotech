import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import ToastService from 'primevue/toastservice';
import 'primeicons/primeicons.css';
import './estilo.css';
import App from './App.vue';
import { router } from './router.js';

createApp(App)
  .use(PrimeVue, { theme: { preset: Aura } })
  .use(ToastService)
  .use(router)
  .mount('#app');
