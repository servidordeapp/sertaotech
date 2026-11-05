import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { api } from './api.js';

export const edicoes = ref([]);
export const falhaDasEdicoes = ref(null);

export async function carregaEdicoes() {
  falhaDasEdicoes.value = null;

  try {
    edicoes.value = await api('/api/painel/edicoes');
  } catch (e) {
    falhaDasEdicoes.value = e;
  }
}

/** A edição em foco mora na URL (?edicao=2027): sobrevive ao F5 e vai junto num link. */
export function useEdicao() {
  const route = useRoute();

  return computed(() => {
    const pedida = Number(route.query.edicao);

    const encerrada = route.meta.edicaoEncerrada ? edicoes.value.find((e) => !e.atual) : null;

    return edicoes.value.find((e) => e.ano === pedida) ?? encerrada ?? edicoes.value.find((e) => e.atual) ?? null;
  });
}
