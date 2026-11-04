/**
 * Fotos da 2ª edição usadas na home de 2027. Eram 11 `<img>` escritas à mão,
 * com `src`, `srcset` e `sizes` repetidos; aqui são dado, e o markup sai de um
 * `.map()`. Os arquivos ficam em `public/assets/fotos/<slug>-<largura>.webp`.
 */
export interface Foto {
  /** Nome do arquivo sem a largura. Ex.: `2026-abertura`. */
  slug: string;
  /** Largura do arquivo que vai no `src` (o fallback de quem ignora srcset). */
  src: number;
  /** Larguras que existem em disco, na ordem do `srcset`. */
  larguras: number[];
  sizes: string;
  alt: string;
  /** Classe extra além de `photo`. */
  classe?: string;
}

/** Caminho do arquivo de uma foto numa largura. */
export function foto(f: Foto, largura: number): string {
  return `/assets/fotos/${f.slug}-${largura}.webp`;
}

/** `srcset` completo da foto, nas larguras que existem em disco. */
export function srcset(f: Foto): string {
  return f.larguras.map((w) => `${foto(f, w)} ${w}w`).join(', ');
}

/** Galeria "como foi a 2ª edição", na ordem em que aparece. */
export const GALERIA_2026: Foto[] = [
  {
    slug: '2026-abertura',
    src: 1280,
    larguras: [640, 1280, 1920],
    sizes: '(max-width: 760px) 100vw, 560px',
    alt: 'Abertura: três convidados à mesa e o público no auditório, com o logo do Sertão Tech no telão.',
  },
  {
    slug: '2026-palestra',
    src: 640,
    larguras: [640, 1280],
    sizes: '(max-width: 760px) 50vw, 280px',
    alt: 'Palestra: palestrante de microfone na mão, de costas, falando para o auditório cheio.',
  },
  {
    slug: '2026-publico',
    src: 640,
    larguras: [640, 1280],
    sizes: '(max-width: 760px) 50vw, 280px',
    alt: 'Público: participantes sentados no auditório, atentos à palestra.',
  },
  {
    slug: '2026-minicurso',
    src: 640,
    larguras: [640, 1280],
    sizes: '(max-width: 760px) 50vw, 280px',
    alt: 'Minicurso: participantes atentos numa sala de aula.',
  },
  {
    slug: '2026-coffee-break',
    src: 640,
    larguras: [640, 1280],
    sizes: '(max-width: 760px) 50vw, 280px',
    alt: 'Coffee break: participantes e organização em volta da mesa de lanches.',
  },
  {
    slug: '2026-organizacao-camiseta',
    src: 1280,
    larguras: [640, 1280, 1920],
    sizes: '(max-width: 760px) 100vw, 560px',
    alt: 'Integrante da organização, de costas, com a camiseta do Sertão Tech, olhando para o auditório.',
    classe: 'photo photo--wide',
  },
  {
    slug: '2026-equipe-organizadora',
    src: 1280,
    larguras: [640, 1280, 1920],
    sizes: '(max-width: 760px) 100vw, 560px',
    alt: 'Equipe organizadora: dez pessoas com a camiseta do Sertão Tech, lado a lado no auditório.',
    classe: 'photo photo--wide',
  },
];

/** Fotos do Sertão Tech After, o encontro de palestrantes e patrocinadores. */
export const AFTER_2026: Foto[] = [
  {
    slug: '2026-after-networking',
    src: 640,
    larguras: [640, 1280],
    sizes: '(max-width: 760px) 100vw, 360px',
    alt: 'Sertão Tech After: três convidados conversando.',
  },
  {
    slug: '2026-after-petiscos',
    src: 640,
    larguras: [640, 1280],
    sizes: '(max-width: 760px) 100vw, 360px',
    alt: 'Sertão Tech After: convidados se servindo de petiscos.',
  },
  {
    slug: '2026-after-bar',
    src: 640,
    larguras: [640, 1280],
    sizes: '(max-width: 760px) 100vw, 360px',
    alt: 'Sertão Tech After: bartender preparando drinks para os convidados.',
  },
];
