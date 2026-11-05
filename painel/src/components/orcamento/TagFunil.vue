<script setup>
import { computed } from 'vue';
import Tag from 'primevue/tag';
import { ETAPAS } from '../../orcamento.js';

const props = defineProps({ etapa: { type: String, required: true } });

const passo = computed(() => ETAPAS.findIndex((e) => e.valor === props.etapa) + 1);
</script>

<template>
  <!-- Cor nunca é o único sinal: o marcador diz a etapa também. -->
  <Tag class="tag-funil" :class="`tag-funil-${passo}`">
    <span class="marcador" role="img" :aria-label="`etapa ${passo} de ${ETAPAS.length}`">
      <span v-for="i in ETAPAS.length" :key="i" class="marcador__barra" :class="{ 'marcador__barra--feita': i <= passo }" />
    </span>
    {{ ETAPAS[passo - 1]?.rotulo }}
  </Tag>
</template>

<style scoped>
.marcador {
  display: inline-flex;
  gap: 2px;
}

.marcador__barra {
  width: 3px;
  height: 10px;
  background: currentColor;
  border-radius: 1px;
  opacity: 0.22;
}

.marcador__barra--feita {
  opacity: 1;
}
</style>
