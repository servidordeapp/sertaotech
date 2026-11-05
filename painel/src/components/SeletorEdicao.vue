<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Select from 'primevue/select';
import { edicoes, useEdicao } from '../edicao.js';

const route = useRoute();
const router = useRouter();
const edicao = useEdicao();

// Inscrições e métricas ainda não têm edição no banco: waitlist_entries é uma lista só.
const porEdicao = computed(() => route.meta.porEdicao && edicoes.value.length);

const ano = computed({
  get: () => edicao.value?.ano,
  set: (valor) => router.replace({ query: { ...route.query, edicao: valor } }),
});
</script>

<template>
  <Select
    v-if="porEdicao"
    v-model="ano"
    :options="edicoes"
    option-label="ano"
    option-value="ano"
    aria-label="Edição em foco"
    class="seletor"
  >
    <template #value="{ value }">
      <span class="seletor__valor">
        <span class="seletor__ponto" :class="{ 'seletor__ponto--atual': edicao?.atual }" />
        <span class="seletor__palavra">Edição</span> {{ value }}
      </span>
    </template>
    <template #option="{ option }">
      <span class="seletor__opcao">
        <strong>Edição {{ option.ano }}</strong>
        <small>{{ option.atual ? 'Atual' : 'Encerrada' }}</small>
      </span>
    </template>
  </Select>

  <span v-else class="todas" title="Esta tela não tem recorte por edição">
    <i class="pi pi-clone" /> <span class="todas__texto">Todas as edições</span>
  </span>
</template>

<style scoped>
.seletor {
  color: var(--sand-50);
  background: rgba(245, 234, 208, 0.06);
  border: 1.5px solid var(--border-on-ink);
  border-radius: var(--radius-pill);
}

.seletor :deep(.p-select-label) {
  padding-block: 0.375rem;
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: var(--fw-semibold);
  color: var(--sand-50);
}

.seletor :deep(.p-select-dropdown) {
  color: var(--sand-50);
}

.seletor__valor {
  display: inline-flex;
  gap: var(--space-2);
  align-items: center;
  white-space: nowrap;
}

.seletor__ponto {
  width: 0.5rem;
  height: 0.5rem;
  background: var(--espresso-400);
  border-radius: 50%;
}

.seletor__ponto--atual {
  background: var(--amber-400);
}

.seletor__opcao {
  display: flex;
  flex-direction: column;
}

.seletor__opcao strong {
  font-family: var(--font-display);
  font-weight: var(--fw-semibold);
}

.seletor__opcao small {
  color: var(--text-muted);
}

.todas {
  display: inline-flex;
  gap: 0.375rem;
  align-items: center;
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  color: var(--text-on-ink-muted);
  white-space: nowrap;
  border: 1.5px dashed var(--border-on-ink);
  border-radius: var(--radius-pill);
}

@media (max-width: 47.99rem) {
  .todas__texto,
  .seletor__palavra {
    display: none;
  }
}
</style>
