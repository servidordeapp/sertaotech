/**
 * Patrocinadores da 2ª edição. O mesmo mural aparece em 3 páginas (/2026,
 * /2026/patrocinio e a home de 2027), antes como 90 linhas de markup copiadas
 * em cada uma — com o comentário "se um logo for trocado lá, troque aqui
 * também". Agora é dado, e o markup sai do componente LogoWall.
 *
 * Patrocinador de 2026 não muda mais: a edição aconteceu.
 */
export interface Logo {
  nome: string;
  /** Arquivo em public/assets/patrocinadores/. Sem arquivo, entra como texto. */
  arquivo?: string;
  largura?: number;
  altura?: number;
  /** Site do patrocinador, sem query — o UTM é montado pelo componente. */
  url?: string;
}

export interface Cota {
  /** Sufixo do id do tier (`tier-ouro`) e do utm_content (`home2027-ouro`). */
  slug: string;
  nome: string;
  /** Modificador do `.logo-wall`. */
  classe?: string;
  /** Modificador do `.logo-card` (a cota ouro tem destaque próprio). */
  classeCard?: string;
  logos: Logo[];
}

export const COTAS_2026: Cota[] = [
  {
    slug: 'ouro',
    nome: 'Cota Ouro',
    classe: 'logo-wall--gold',
    classeCard: 'logo-card--gold',
    logos: [
      { nome: 'ParaDevs', arquivo: 'paradevs.webp', largura: 640, altura: 140, url: 'https://www.paradevs.io/' },
    ],
  },
  {
    slug: 'prata',
    nome: 'Cota Prata',
    classe: 'logo-wall--silver',
    logos: [
      { nome: 'Programe Studio', arquivo: 'programe-studio.svg', largura: 664, altura: 222, url: 'https://programe.studio/' },
      { nome: 'Exa', arquivo: 'exa.webp', largura: 640, altura: 228, url: 'https://www.exa.com.br/' },
    ],
  },
  {
    slug: 'bronze',
    nome: 'Cota Bronze',
    classe: 'logo-wall--bronze',
    logos: [
      { nome: 'Retake Brasil', arquivo: 'retake-brasil.svg', largura: 424, altura: 133, url: 'https://www.retake.com.br/' },
      { nome: 'Bruno Neves Advogado', arquivo: 'bruno-neves-advogado.webp', largura: 640, altura: 311, url: 'https://brunonevesadv.com.br/' },
      { nome: 'Cajutec', arquivo: 'cajutec-640.webp', largura: 640, altura: 369, url: 'https://app.cajutec.com.br/' },
      { nome: 'Cod3r', arquivo: 'cod3r.webp', largura: 640, altura: 121, url: 'https://www.formacao.dev/' },
    ],
  },
];

/**
 * Apoio e comunidades. Nas páginas de 2026 entram como texto; na home de 2027,
 * PHP PI e PHPWomen PI entram como logomarca.
 */
export const APOIO_2026: Record<'nomes' | 'logos', Cota> = {
  nomes: {
    slug: 'apoio',
    nome: 'Apoio e comunidades',
    classe: 'logo-wall--apoio',
    logos: [
      { nome: 'PHP PI' },
      { nome: 'PHPWomen PI' },
      { nome: 'Bacharelado em Inteligência Artificial - UFDPar' },
    ],
  },
  logos: {
    slug: 'apoio',
    nome: 'Apoio e comunidades',
    classe: 'logo-wall--apoio',
    logos: [
      { nome: 'PHP PI', arquivo: 'phppi.svg', largura: 240, altura: 186 },
      { nome: 'PHPWomen PI', arquivo: 'phpwomen-piaui.svg', largura: 240, altura: 309 },
      { nome: 'Bacharelado em Inteligência Artificial - UFDPar' },
    ],
  },
};
