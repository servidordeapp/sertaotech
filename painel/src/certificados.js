/** Rótulos e cores dos certificados, iguais nas telas de Certificados e de LGPD. */
export const TIPOS = [
  { valor: 'participante', rotulo: 'Participante' },
  { valor: 'palestrante', rotulo: 'Palestrante' },
  { valor: 'ministrante', rotulo: 'Ministrante' },
  { valor: 'organizacao', rotulo: 'Organização' },
];

export const SITUACOES = {
  rascunho: { rotulo: 'Rascunho', severidade: 'warn' },
  emitido: { rotulo: 'Emitido', severidade: 'success' },
  descartado: { rotulo: 'Descartado', severidade: 'secondary' },
  revogado: { rotulo: 'Revogado', severidade: 'danger' },
  cancelado: { rotulo: 'Cancelado (LGPD)', severidade: 'contrast' },
};

export function rotuloDoTipo(valor) {
  return TIPOS.find((tipo) => tipo.valor === valor)?.rotulo ?? valor;
}
