<script setup>
import { computed } from 'vue';
import Button from 'primevue/button';
import Skeleton from 'primevue/skeleton';
import Tag from 'primevue/tag';
import { auth } from '../auth.js';

const props = defineProps({
  tipo: { type: String, required: true }, // carregando | vazio | erro | proibido
  // Na carga, a forma do conteúdo que vem: cartões de número em cima da tabela ou só a tabela.
  comNumeros: { type: Boolean, default: false },
  titulo: { type: String, default: null },
  texto: { type: String, default: null },
  // O ErroApi da falha. Erro de rede não tem status, e aí não há código para mostrar.
  falha: { type: Object, default: null },
});

defineEmits(['tentar']);

const PADRAO = {
  vazio: { icone: 'pi-inbox', titulo: 'Nada por aqui ainda', texto: 'Quando chegarem registros, eles aparecem aqui.' },
  erro: { icone: 'pi-exclamation-triangle', titulo: 'Não deu para carregar agora', texto: 'A api não respondeu como devia. Nada foi alterado — tente de novo em instantes.' },
  proibido: { icone: 'pi-lock', titulo: 'Esta área não faz parte do seu papel', texto: 'Se você precisa deste acesso, peça a alguém com papel admin.' },
};

const conteudo = computed(() => PADRAO[props.tipo]);
</script>

<template>
  <div v-if="tipo === 'carregando'" class="esqueleto" aria-busy="true" aria-label="Carregando">
    <div v-if="comNumeros" class="esqueleto__numeros">
      <div v-for="i in 4" :key="i" class="cartao">
        <Skeleton width="50%" height="0.625rem" />
        <Skeleton width="70%" height="1.625rem" class="esqueleto__valor" />
      </div>
    </div>
    <div class="cartao">
      <Skeleton v-for="i in 6" :key="i" height="1rem" class="esqueleto__linha" />
    </div>
  </div>

  <div v-else class="estado" :class="`estado--${tipo}`" :role="tipo === 'erro' ? 'alert' : undefined">
    <span class="estado__icone"><i class="pi" :class="conteudo.icone" /></span>
    <h2 class="estado__titulo">{{ titulo ?? conteudo.titulo }}</h2>
    <p class="estado__texto">{{ texto ?? conteudo.texto }}</p>

    <div v-if="tipo === 'proibido'" class="estado__papel">
      Seu papel: <Tag :value="auth.usuario?.papel" severity="secondary" />
      <span class="mono">HTTP 403</span>
    </div>

    <template v-if="tipo === 'erro'">
      <code v-if="falha?.status" class="mono">HTTP {{ falha.status }}</code>
      <Button label="Tentar de novo" icon="pi pi-refresh" severity="secondary" outlined size="small" @click="$emit('tentar')" />
    </template>
  </div>
</template>

<style scoped>
.esqueleto,
.esqueleto__numeros {
  display: grid;
  gap: var(--space-4);
}

.esqueleto__numeros {
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
}

.esqueleto__valor {
  margin-top: 0.625rem;
}

.esqueleto__linha + .esqueleto__linha {
  margin-top: var(--space-5);
}

.estado {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-12) var(--space-6);
  text-align: center;
  background: var(--surface-card);
  border: 1px dashed var(--border-default);
  border-radius: var(--radius-card);
}

/* É uma parede, não uma falha: contorno de tinta no lugar do tracejado. */
.estado--proibido {
  border: 2px solid var(--border-ink);
  box-shadow: var(--shadow-badge-sm);
}

.estado__icone {
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  font-size: var(--text-xl);
  color: var(--espresso-700);
  background: var(--sand-200);
  border-radius: 50%;
}

.estado--erro .estado__icone {
  color: var(--brick-600);
  background: var(--brick-100);
}

.estado__titulo {
  font-size: var(--text-lg);
  font-weight: var(--fw-semibold);
}

.estado__texto {
  max-width: 26rem;
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.estado__papel {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  font-size: 0.8125rem;
  color: var(--text-muted);
}
</style>
