import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // O design system mora no site; fora disto o dev server recusa servir o CSS e o logo.
    fs: { allow: ['.', '../site/public'] },
    // Mesmo knob do site: `VITE_POLLING=1` troca o watcher por polling, para o
    // caso de o bind mount não propagar inotify pro container.
    watch: process.env.VITE_POLLING ? { usePolling: true, interval: 300 } : undefined,
  },
});
