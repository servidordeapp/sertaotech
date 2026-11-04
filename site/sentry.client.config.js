import * as Sentry from '@sentry/astro';

Sentry.init({
  // DSN de browser é público por design.
  dsn: 'https://2a5d411036ebeff7c4822ec8dd784740@o4507074601484288.ingest.us.sentry.io/4512371248398336',
  environment: import.meta.env.MODE,
  // Site de divulgação com pico de tráfego perto do evento: amostra 10% dos traces.
  tracesSampleRate: 0.1,
});
