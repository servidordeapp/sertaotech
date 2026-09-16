/**
 * 1ª edição do Sertão Tech — 22 de agosto de 2025.
 *
 * Fonte: os números fechados pela organização e os posts publicados no
 * @osertaotech, que foi o único canal usado na divulgação da edição. Nada aqui
 * é estimativa: o que não foi medido não está registrado.
 *
 * Nota de grafia: o Alessandro aparece como "Feitosa" no post do Instagram de
 * 2025 e como "Feitoza" no resto do site (inclusive nos nomes de arquivo dos
 * assets). Mantido "Feitoza" pra não criar duas entidades pra mesma pessoa —
 * ele volta em 2026, agora na keynote.
 */
export const EDICAO_2025 = {
  ordinal: '1ª',
  nome: 'Sertão Tech 2025',
  inicio: '2025-08-22T18:00:00-03:00',
  fim: '2025-08-22T22:00:00-03:00',
  gratuito: true,
  local: {
    nome: 'Faculdade Maurício de Nassau — Parnaíba',
    cidade: 'Parnaíba',
    uf: 'PI',
  },
  /** Números fechados pela organização. */
  numeros: [
    {
      valor: '191',
      rotulo: 'inscritos',
      nota: 'numa primeira edição, sem histórico e sem mídia paga',
    },
    {
      valor: '91',
      rotulo: 'presentes no dia',
      nota: '48% de comparecimento, num evento gratuito',
    },
    {
      valor: '3',
      rotulo: 'palestras',
      nota: 'uma noite inteira de conteúdo para iniciantes',
    },
    {
      valor: '3.938',
      rotulo: 'visualizações no Instagram',
      nota: 'no período do evento, no perfil @osertaotech',
    },
  ],
  palestras: [
    {
      titulo: 'Programação Dialética: vivendo entre 2 mundos',
      palestrante: 'Alessandro Feitoza',
      de: 'Fortaleza - CE',
      cargo: 'Senior Software Engineer e Technical Lead',
      sobre:
        'Professor no Centro Universitário Estácio Ceará e na Digital College, alia experiência prática em desenvolvimento de software a uma forte atuação acadêmica. Voltou em 2026, agora na keynote de encerramento.',
    },
    {
      titulo: 'Arquitetura de Aplicativos Flutter',
      palestrante: 'Lucas Souza',
      de: 'Parnaíba - PI',
      cargo: 'Desenvolvedor Flutter',
      sobre:
        'Três anos de Flutter e cinco de tecnologia, cursando Análise e Desenvolvimento de Sistemas na Unicesumar. Trouxe conceitos e boas práticas pra estruturar projeto Flutter de forma escalável e organizada.',
    },
    {
      titulo: 'Quebrando Barreiras: A Força da Diversidade no Mercado Tech',
      palestrante: 'Liam Hoffman',
      de: 'Parnaíba - PI',
      cargo: 'Analista de Qualidade',
      sobre:
        'Falou a partir da própria vivência sobre a importância da pluralidade e do respeito na construção de ambientes mais justos e acolhedores no setor de tecnologia.',
    },
  ],
} as const;
