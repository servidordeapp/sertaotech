/**
 * URL dos CSS de public/ com o hash do conteúdo na query.
 *
 * Os arquivos têm nome fixo (/css/site.css), e na frente do site tem um
 * Cloudflare que devolve `max-age=31536000` pra eles — o vercel.json pede
 * 86400, mas quem manda no navegador é o header que chega. Resultado: quem já
 * tinha visitado o site continuava com o CSS velho depois do deploy, e as
 * páginas novas apareciam sem estilo. Com o hash na URL, CSS novo é URL nova e
 * nenhum cache antigo responde por ela.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Caminho a partir de public/. Ex.: 'css/site.css' -> '/css/site.css?v=1a2b3c4d'. */
export function cssUrl(caminho: string): string {
  // Resolvido a partir do cwd (a raiz de site/, onde o astro roda): no build
  // este módulo vira um chunk dentro de dist/, então import.meta.url apontaria
  // pro lugar errado.
  const arquivo = resolve('public', caminho);
  const hash = createHash('sha256').update(readFileSync(arquivo)).digest('hex').slice(0, 8);
  return `/${caminho}?v=${hash}`;
}

export const CSS_DS = cssUrl('ds/styles.css');
export const CSS_SITE = cssUrl('css/site.css');
export const CSS_ARTICLE = cssUrl('css/article.css');
