/**
 * Especificação dos 3 formulários de lista de espera (docs/PLANO-2027.md, Fase 2).
 * Perguntas, obrigatoriedade e textos de LGPD vivem aqui; a API valida o mesmo
 * contrato em api/app/Http/Controllers/WaitlistController.php.
 * Mudou um texto de LGPD? Suba também a versão (aqui e na API) — ela é gravada
 * com cada aceite.
 */
export type Tipo = 'participante' | 'palestrante' | 'patrocinador';

export interface Campo {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'radio';
  required?: boolean;
  hint?: string;
  options?: string[];
  autocomplete?: string;
}

export interface Lista {
  titulo: string;
  descricao: string;
  finalidade: string;
  campos: Campo[];
  compartilhamento?: boolean;
}

export const LGPD_VERSAO = 'lgpd-2027-v1';
export const COMPARTILHAMENTO_VERSAO = 'compartilhamento-2027-v1';

const whatsapp: Campo = { name: 'whatsapp', label: 'WhatsApp (com DDD)', type: 'tel', required: true, hint: 'Ex.: (86) 99999-9999', autocomplete: 'tel' };
const email: Campo = { name: 'email', label: 'E-mail', type: 'email', required: true, autocomplete: 'email' };

export const LISTAS: Record<Tipo, Lista> = {
  participante: {
    titulo: 'Sertão Tech 2027 — Lista de espera',
    descricao: 'A 2ª edição esgotou. Deixe seu contato e avisamos você primeiro quando as inscrições de 2027 abrirem.',
    finalidade: 'abertura das inscrições, data e local',
    compartilhamento: true,
    campos: [
      { name: 'nome', label: 'Nome', required: true, autocomplete: 'name' },
      email,
      whatsapp,
      { name: 'cidade', label: 'Cidade', required: true, autocomplete: 'address-level2' },
      { name: 'perfil', label: 'Qual seu perfil?', type: 'radio', required: true, options: ['Estudante', 'Profissional de tecnologia', 'Migrando de carreira', 'Curioso(a)'] },
    ],
  },
  palestrante: {
    titulo: 'Sertão Tech 2027 — Quero palestrar',
    descricao: 'A chamada de palestras de 2027 ainda não abriu. Deixe seu contato e o tema que você quer apresentar, e avisamos você quando abrir.',
    finalidade: 'abertura da chamada de palestras e próximos passos da curadoria',
    campos: [
      { name: 'nome', label: 'Nome', required: true, autocomplete: 'name' },
      email,
      whatsapp,
      { name: 'tema', label: 'Tema ou área da palestra', type: 'textarea', required: true, hint: 'Pode ser só uma ideia, a gente ajuda a lapidar.' },
      { name: 'perfil_online', label: 'LinkedIn ou GitHub', type: 'url', hint: 'Opcional. Ex.: https://github.com/seu-usuario' },
      { name: 'experiencia', label: 'Já palestrou antes?', type: 'radio', required: true, options: ['Nunca palestrei', 'Já palestrei em eventos menores', 'Já palestrei em eventos grandes'] },
    ],
  },
  patrocinador: {
    titulo: 'Sertão Tech 2027 — Quero patrocinar',
    descricao: 'Em 2026 o Sertão Tech reuniu a comunidade de tecnologia do Piauí na UFDPar. Deixe seu contato e enviamos as cotas de 2027 assim que saírem.',
    finalidade: 'cotas, valores e prazos de patrocínio',
    campos: [
      { name: 'empresa', label: 'Empresa', required: true, autocomplete: 'organization' },
      { name: 'contato', label: 'Nome do contato', required: true, autocomplete: 'name' },
      email,
      whatsapp,
      { name: 'cota', label: 'Cota de interesse', type: 'radio', required: true, options: ['Ouro', 'Prata', 'Bronze', 'Apoio (espaço, coffee break, brindes)', 'Ainda não sei'] },
    ],
  },
};
