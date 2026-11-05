<script setup>
import { computed } from 'vue';
import { brl } from '../../orcamento.js';

const props = defineProps({
  rotulo: { type: String, default: 'Execução do orçado' },
  orcado: { type: Number, required: true },
  comprometido: { type: Number, required: true },
  pago: { type: Number, required: true },
  compacta: { type: Boolean, default: false },
  legenda: { type: Boolean, default: false },
});

const fracao = computed(() => (props.orcado ? props.comprometido / props.orcado : 0));
const estourou = computed(() => props.comprometido > props.orcado);
const atencao = computed(() => !estourou.value && fracao.value >= 0.85);

// A escala vai até o maior dos dois: estourado, a marca do orçado fica dentro da barra.
const largura = (valor) => {
  const teto = Math.max(props.orcado, props.comprometido);
  return `${teto ? (valor / teto) * 100 : 0}%`;
};
</script>

<template>
  <div class="execucao" :class="{ 'execucao--compacta': compacta }">
    <div class="execucao__topo">
      <span class="execucao__rotulo">{{ rotulo }}</span>
      <span class="execucao__nota numero-tabular" :class="{ 'execucao__nota--estouro': estourou, 'execucao__nota--atencao': atencao }">
        <i v-if="estourou" class="pi pi-exclamation-triangle" />
        {{ Math.round(fracao * 100) }}%
        <template v-if="estourou">· estourou {{ brl(comprometido - orcado) }}</template>
        <template v-else-if="atencao">· atenção</template>
      </span>
    </div>

    <div class="execucao__trilho" role="meter" :aria-label="rotulo" :aria-valuenow="Math.round(fracao * 100)" aria-valuemin="0" aria-valuemax="100">
      <div class="execucao__pago" :style="{ width: largura(Math.min(pago, orcado)) }" />
      <div class="execucao__comprometido" :style="{ width: largura(Math.max(0, Math.min(comprometido, orcado) - Math.min(pago, orcado))) }" />
      <template v-if="estourou">
        <div class="execucao__estouro" :style="{ width: largura(comprometido - orcado) }" />
        <div class="execucao__marca" :style="{ left: largura(orcado) }" />
      </template>
    </div>

    <div v-if="legenda" class="execucao__legenda">
      <span><i class="execucao__pago" /> Pago {{ brl(pago) }}</span>
      <span><i class="execucao__comprometido" /> Comprometido {{ brl(Math.max(0, comprometido - pago)) }}</span>
      <span><i class="execucao__livre" /> Livre {{ brl(Math.max(0, orcado - comprometido)) }}</span>
    </div>
  </div>
</template>

<style scoped>
.execucao {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
}

.execucao--compacta {
  gap: var(--space-1);
}

.execucao__topo {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: baseline;
  justify-content: space-between;
}

.execucao__rotulo {
  font-size: var(--text-sm);
  font-weight: var(--fw-semibold);
}

.execucao--compacta .execucao__rotulo {
  font-size: 0.8125rem;
}

.execucao__nota {
  font-size: 0.78125rem;
  color: var(--text-muted);
}

.execucao__nota--estouro {
  font-weight: var(--fw-bold);
  color: var(--brick-600);
}

.execucao__nota--atencao {
  font-weight: var(--fw-bold);
  color: var(--honey-700);
}

.execucao__trilho {
  position: relative;
  display: flex;
  height: 0.875rem;
  overflow: hidden;
  background: var(--exec-track);
  border-radius: var(--radius-pill);
}

.execucao--compacta .execucao__trilho {
  height: 0.5rem;
}

.execucao__pago {
  background: var(--exec-paid);
}

/* Listrado para o estado não depender só da cor. */
.execucao__comprometido {
  background: repeating-linear-gradient(135deg, var(--exec-committed) 0 4px, var(--terra-500) 4px 7px);
}

.execucao__estouro {
  background: repeating-linear-gradient(135deg, var(--exec-over) 0 4px, var(--brick-600) 4px 7px);
}

.execucao__marca {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--espresso-900);
}

.execucao__legenda {
  display: flex;
  flex-wrap: wrap;
  gap: 0.875rem;
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.execucao__legenda span {
  display: inline-flex;
  gap: 0.375rem;
  align-items: center;
}

.execucao__legenda i {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 3px;
}

.execucao__livre {
  background: var(--exec-track);
  border: 1px solid var(--sand-400);
}
</style>
