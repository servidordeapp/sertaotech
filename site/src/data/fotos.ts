/**
 * Fotos das edições. Os arquivos ficam em
 * `public/assets/fotos/<slug>-<largura>.webp`.
 *
 * Duas leituras do mesmo dado: a home de 2027 usa as listas soltas
 * (`GALERIA_2026`, `AFTER_2026`), que nasceram de 11 `<img>` escritas à mão
 * com `src`, `srcset` e `sizes` repetidos; /fotos e /fotos/<ano> usam
 * `EDICOES`, que agrupa as mesmas fotos por edição.
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

/** Maior arquivo que existe em disco pra essa foto — o que o botão de baixar entrega. */
export function maiorLargura(f: Foto): number {
  return Math.max(...f.larguras);
}

/** Nome do arquivo salvo no computador de quem baixa. */
export function nomeDownload(f: Foto): string {
  return `sertao-tech-${f.slug}-${maiorLargura(f)}.webp`;
}

/**
 * Foto oficial da 2ª edição. Fica fora de `GALERIA_2026` porque a home a usa
 * no hero, não na grade — mas na galeria da edição ela é a capa.
 */
export const FOTO_OFICIAL_2026: Foto = {
  slug: '2026-foto-oficial',
  src: 1280,
  larguras: [640, 1280, 1920],
  sizes: '(max-width: 1024px) 100vw, 520px',
  alt: 'Foto oficial: participantes e organização reunidos de pé no auditório da UFDPar.',
};

export interface Edicao {
  /** Usado na URL: /fotos/<ano>. */
  ano: string;
  titulo: string;
  descricao: string;
  fotos: Foto[];
}

/**
 * Galeria por edição. É a fonte de /fotos e /fotos/<ano>.
 *
 * Por enquanto é dado estático apontando pros arquivos que já estão em
 * `public/assets/fotos/` — as mesmas fotos que a home usa. Edição nova = uma
 * entrada aqui, sem tocar nas páginas. O cadastro de fotos (upload, API) ainda
 * não existe; quando existir, troca a origem deste objeto e nada mais muda.
 */
export const EDICOES: Record<string, Edicao> = {
  '2026': {
    ano: '2026',
    titulo: '2ª edição — 2026',
    descricao:
      'Um dia inteiro de tecnologia na UFDPar, em Parnaíba: palestras, minicursos, coffee break e o Sertão Tech After.',
    fotos: [FOTO_OFICIAL_2026, ...GALERIA_2026, ...AFTER_2026],
  },
};

/** Edições da mais recente pra mais antiga, que é como /fotos lista. */
export const EDICOES_RECENTES: Edicao[] = Object.values(EDICOES).sort((a, b) =>
  b.ano.localeCompare(a.ano),
);
