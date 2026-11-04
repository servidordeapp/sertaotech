/**
 * Construtores de JSON-LD.
 *
 * O site inteiro publica um único @graph por página, com @id estáveis pra que
 * os nós se referenciem em vez de repetir dados:
 *
 *   #organization  → quem organiza (uma vez, em todas as páginas)
 *   #website       → o site
 *   #webpage       → a página atual (canonical + '#webpage')
 *   #event-2027     → a edição corrente do evento (definida na home)
 *   /2026#event     → a edição arquivada (definida em /2026)
 *
 * Sobre LocalBusiness: o Sertão Tech não tem endereço comercial próprio nem
 * atendimento no local, então LocalBusiness seria uma declaração falsa (e o
 * pacote local do Google vem do Google Business Profile, não do schema).
 * O par correto é Organization (com address da cidade-sede + areaServed) e
 * Place só pra descrever o local do evento, dentro do Event.
 */
import { SITE, abs } from './site';

type Json = Record<string, unknown>;

export const ID = {
  organization: `${SITE.url}/#organization`,
  website: `${SITE.url}/#website`,
  /** Edição vigente: o nó Event da home. Muda de sufixo a cada edição. */
  event: `${SITE.url}/#event-2027`,
  /** Edição arquivada, que vive na própria URL do arquivo. */
  event2026: `${SITE.url}/2026#event`,
  webpage: (path: string) => `${abs(path)}#webpage`,
} as const;

export function organization(): Json {
  return {
    '@type': 'Organization',
    '@id': ID.organization,
    name: SITE.name,
    legalName: SITE.legalName,
    url: `${SITE.url}/`,
    description:
      'Comunidade e evento de tecnologia do norte do Piauí. Reúne estudantes, profissionais e quem está migrando de carreira em Parnaíba - PI.',
    logo: {
      '@type': 'ImageObject',
      url: abs(SITE.logo),
      caption: 'Selo do Sertão Tech',
    },
    image: abs(SITE.defaultOgImage),
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE.cidade,
      addressRegion: SITE.uf,
      addressCountry: 'BR',
    },
    areaServed: [
      { '@type': 'City', name: 'Parnaíba' },
      { '@type': 'State', name: 'Piauí' },
      { '@type': 'AdministrativeArea', name: 'Nordeste do Brasil' },
    ],
    knowsLanguage: 'pt-BR',
    sameAs: [SITE.instagram],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'organização do evento',
      url: SITE.whatsapp,
      availableLanguage: 'pt-BR',
    },
  };
}

export function website(): Json {
  return {
    '@type': 'WebSite',
    '@id': ID.website,
    url: `${SITE.url}/`,
    name: SITE.name,
    inLanguage: SITE.lang,
    publisher: { '@id': ID.organization },
  };
}

export function webpage(opts: {
  path: string;
  name: string;
  description: string;
  image?: string;
  /**
   * Liga #webpage → o Event da página. `true`/ausente usa a edição vigente,
   * uma string usa o @id informado (as páginas de /2026 passam ID.event2026) e
   * `false` não liga nada — página que não fala de edição nenhuma.
   */
  aboutEvent?: boolean | string;
  datePublished?: string;
  dateModified?: string;
}): Json {
  const node: Json = {
    '@type': 'WebPage',
    '@id': ID.webpage(opts.path),
    url: abs(opts.path),
    name: opts.name,
    description: opts.description,
    inLanguage: SITE.lang,
    isPartOf: { '@id': ID.website },
  };
  if (opts.aboutEvent !== false) {
    node.about = { '@id': typeof opts.aboutEvent === 'string' ? opts.aboutEvent : ID.event };
  }
  if (opts.image) node.primaryImageOfPage = abs(opts.image);
  if (opts.datePublished) node.datePublished = opts.datePublished;
  if (opts.dateModified) node.dateModified = opts.dateModified;
  return node;
}

/** Trilha de navegação. `trail` NÃO inclui a home — ela é sempre a posição 1. */
export function breadcrumb(trail: { name: string; path: string }[]): Json {
  const items = [{ name: 'Sertão Tech 2026', path: '/' }, ...trail];
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

export function faqPage(qa: { pergunta: string; resposta: string }[]): Json {
  return {
    '@type': 'FAQPage',
    mainEntity: qa.map((item) => ({
      '@type': 'Question',
      name: item.pergunta,
      acceptedAnswer: { '@type': 'Answer', text: item.resposta },
    })),
  };
}

/** Lista ordenada de itens (edições, eventos da agenda local). */
export function itemList(opts: {
  name: string;
  description?: string;
  items: { name: string; path: string }[];
}): Json {
  return {
    '@type': 'ItemList',
    name: opts.name,
    ...(opts.description ? { description: opts.description } : {}),
    numberOfItems: opts.items.length,
    itemListElement: opts.items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: abs(item.path),
    })),
  };
}

/** Monta o envelope @graph, descartando nós vazios. */
export function graph(...nodes: (Json | null | undefined | false)[]): Json {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes.filter(Boolean) as Json[],
  };
}
