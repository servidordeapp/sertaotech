/**
 * Histórico de edições do Sertão Tech.
 *
 * Como a home (/) é sempre a edição vigente, cada edição precisa de um
 * destino permanente pra não perder a busca por "sertão tech <ano>" quando
 * a home for reescrita. O desenho é:
 *
 *   edição vigente  → href: '/'            (sem página própria, pra não
 *                                           duplicar conteúdo com a home)
 *   edição passada  → href: '/edicoes/<ano>'  (retrospectiva com Event
 *                                           próprio e eventStatus completo)
 *
 * Depois do evento de 09/10/2026: cria src/pages/edicoes/2026.astro com a
 * retrospectiva, troca `href` desta entrada pra '/edicoes/2026' e marca
 * `vigente: false`. A home então passa a ser a edição seguinte.
 */
export interface Edicao {
  ano: string;
  ordinal: string;
  titulo: string;
  /** Data de início, ISO com fuso. */
  inicio: string;
  fim: string;
  local: string;
  cidade: string;
  resumo: string;
  /** Destino permanente da edição. */
  href: string;
  /** true = é a edição corrente e mora na home. */
  vigente: boolean;
  destaques: string[];
}

export const EDICOES: Edicao[] = [
  {
    ano: '2026',
    ordinal: '2ª',
    titulo: 'Sertão Tech 2026',
    inicio: '2026-10-09T14:00:00-03:00',
    fim: '2026-10-09T21:30:00-03:00',
    local: 'UFDPar — Campus Ministro Reis Velloso',
    cidade: 'Parnaíba - PI',
    resumo:
      'Um dia inteiro de palestras, microtalks, dois minicursos em trilha paralela, roda de conversa sobre migração de carreira e keynote de encerramento. Nove áreas no palco, das 14h às 21h30.',
    href: '/',
    vigente: true,
    destaques: [
      '19 pessoas no palco, entre palestras, microtalks, minicursos e roda de conversa',
      'Dois minicursos de 2 horas em trilha paralela, escolhidos na inscrição',
      'Roda de conversa "ALT + TAB: Migrando para a área da Tecnologia"',
      'Apoio do PHP PI e da PHPWomen PI',
    ],
  },
  {
    ano: '2025',
    ordinal: '1ª',
    titulo: 'Sertão Tech 2025',
    inicio: '2025-08-22T18:00:00-03:00',
    fim: '2025-08-22T22:00:00-03:00',
    local: 'Faculdade Maurício de Nassau — Parnaíba',
    cidade: 'Parnaíba - PI',
    resumo:
      'A primeira edição: uma noite de 18h às 22h, gratuita, com três palestras voltadas a quem estava começando. 191 inscritos e 91 presentes, sem histórico e sem mídia paga.',
    href: '/edicoes/2025',
    vigente: false,
    destaques: [
      '191 inscritos e 91 presentes — 48% de comparecimento num evento gratuito',
      'Três palestras: arquitetura Flutter, diversidade no mercado tech e programação dialética',
      'Alessandro Feitoza abriu a edição e voltou em 2026, agora na keynote',
      'Divulgação só pelo @osertaotech, com 3.938 visualizações no período',
    ],
  },
];
