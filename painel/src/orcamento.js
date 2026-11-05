/** O que as telas do orçamento compartilham: etapas, cotas e dinheiro. */

export const ETAPAS = [
  { valor: 'prospeccao', rotulo: 'Prospecção' },
  { valor: 'proposta', rotulo: 'Proposta enviada' },
  { valor: 'negociacao', rotulo: 'Negociação' },
  { valor: 'fechado', rotulo: 'Fechado' },
  { valor: 'assinado', rotulo: 'Contrato assinado' },
  { valor: 'pago', rotulo: 'Pago' },
];

export const SITUACOES_DE_DESPESA = {
  planejado: 'Planejado',
  comprometido: 'Comprometido',
  pago: 'Pago',
  vencido: 'Vencido',
};

/**
 * As cotas e os preços de cada kit (site/public/midia-kit). Mudou o kit, muda aqui.
 * O campo aceita texto livre: "Apoio" da lista de espera e combinação de cotas não
 * estão na tabela.
 */
export const COTAS = {
  2027: [
    { nome: 'Master', valor: 15000 },
    { nome: 'Sertão Tech - Robótica', valor: 10000 },
    { nome: 'Sertão Tech - Negócios', valor: 10000 },
    { nome: 'Trilha Sênior+', valor: 7500 },
    { nome: 'Ouro', valor: 5000 },
    { nome: 'Prata', valor: 2500 },
    { nome: 'Bronze', valor: 1000 },
  ],
  2026: [
    { nome: 'Ouro', valor: 2000 },
    { nome: 'Prata', valor: 1000 },
    { nome: 'Bronze', valor: 500 },
  ],
};

export const centavos = (reais) => Math.round((reais ?? 0) * 100);
export const reais = (valor) => (valor == null ? null : valor / 100);

/** Centavos só quando existem: R$ 12.000 lê melhor que R$ 12.000,00 num cartão. */
export function brl(valor) {
  return (valor / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: valor % 100 ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

export function brlCurto(valor) {
  return Math.abs(valor) >= 100000
    ? `R$ ${(valor / 100000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil`
    : brl(valor);
}

/** A data da api é 2027-03-10, sem hora: passar por Date a leria como UTC e voltaria um dia. */
export function dia(valor) {
  if (!valor) return '—';
  const [ano, mes, dd] = valor.split('-');
  return `${dd}/${mes}/${ano}`;
}

/** Fórmula em CSV roda ao abrir a planilha: mesma defesa do export de inscrições na api. */
function celula(valor) {
  const texto = String(valor ?? '');
  const seguro = /^[=+\-@]/.test(texto) ? `'${texto}` : texto;

  return `"${seguro.replaceAll('"', '""')}"`;
}

/** BOM e ponto e vírgula: é o que o Excel em pt-BR espera. */
export function csv(colunas, linhas) {
  const corpo = [colunas, ...linhas].map((linha) => linha.map(celula).join(';')).join('\r\n');

  return new Blob([`﻿${corpo}`], { type: 'text/csv;charset=utf-8' });
}

export const valorCsv = (valor) => (valor == null ? '' : (valor / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
