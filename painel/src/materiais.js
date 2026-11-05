/**
 * Os materiais do evento, servidos pelo site a partir de site/public. Material
 * novo entra aqui.
 *
 * ponytail: lista fixa apontando para URLs públicas: o login do painel não protege
 * nada, quem tiver o endereço abre. Os kits não deveriam ser públicos; ver
 * "Tirar os materiais do público" em docs/MELHORIAS-FUTURAS.md.
 */
// Produção mesmo em dev: o `astro dev` não resolve estas URLs sem `.html`, só o
// cleanUrls da Vercel. Com www porque o domínio sem www respondeu 404 em 2026-11-05.
const SITE = 'https://www.osertaotech.com.br';

export const TIPOS_DE_MATERIAL = {
  deck: { rotulo: 'Deck', icone: 'pi-desktop' },
  relatorio: { rotulo: 'Relatório', icone: 'pi-file' },
  impresso: { rotulo: 'Impresso', icone: 'pi-print' },
  links: { rotulo: 'Página de links', icone: 'pi-link' },
};

export const MATERIAIS = [
  {
    grupo: 2027,
    titulo: 'Kit de patrocínio 2027',
    descricao: 'Trilhas, cotas e ativações da 3ª edição.',
    tipo: 'deck',
    caminho: '/midia-kit/2027',
    temPdf: true,
  },
  {
    grupo: 2027,
    titulo: 'Caravanas 2027',
    descricao: 'Kit para instituições de ensino levarem caravanas de estudantes.',
    tipo: 'deck',
    caminho: '/midia-kit/caravanas-2027',
    temPdf: true,
  },
  {
    grupo: 2026,
    titulo: 'Relatório para patrocinadores',
    descricao: 'Índice com o relatório de cada patrocinador e o PDF de cada um.',
    tipo: 'relatorio',
    caminho: '/relatorio/2026',
  },
  {
    grupo: 2026,
    titulo: 'Sertão Tech After 2026',
    descricao: 'Deck do encontro privado com palestrantes e patrocinadores.',
    tipo: 'deck',
    caminho: '/after/2026',
    temPdf: true,
  },
  {
    grupo: 2026,
    titulo: 'Kit de patrocínio 2026',
    descricao: 'Apresentação comercial da 2ª edição.',
    tipo: 'deck',
    caminho: '/midia-kit/2026',
    temPdf: true,
  },
  {
    grupo: 'operacao',
    titulo: 'Roteiro da cerimonialista',
    descricao: 'Fichas de meia folha A4, dois blocos por folha.',
    tipo: 'impresso',
    caminho: '/cerimonial/roteiro-cerimonialista',
  },
  {
    grupo: 'operacao',
    titulo: 'Verso dos cartões',
    descricao: 'Logo para o verso das fichas do roteiro e do guia da mesa redonda.',
    tipo: 'impresso',
    caminho: '/cerimonial/verso-logo',
  },
  {
    grupo: 'operacao',
    titulo: 'Guia de perguntas da mesa redonda',
    descricao: 'Fichas de meia folha A4 para a mediação da roda de conversa.',
    tipo: 'impresso',
    caminho: '/mesa-redonda/guia-perguntas',
  },
  {
    grupo: 'operacao',
    titulo: 'Lista de presença dos minicursos',
    descricao: 'Uma lista por minicurso, 2 folhas A4 cada. Preencher a sala à mão.',
    tipo: 'impresso',
    caminho: '/cerimonial/lista-presenca-minicursos',
  },
  {
    grupo: 'operacao',
    titulo: 'Página de links',
    descricao: 'Links do evento para a bio e o QR code.',
    tipo: 'links',
    caminho: '/links',
  },
].map((material) => ({
  ...material,
  url: SITE + material.caminho,
  urlPdf: material.temPdf ? `${SITE}${material.caminho}?print-pdf` : null,
}));
