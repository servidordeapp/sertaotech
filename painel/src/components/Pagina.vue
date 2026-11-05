<script setup>
defineProps({
  eyebrow: { type: String, default: null },
  titulo: { type: String, required: true },
  descricao: { type: String, default: null },
});
</script>

<template>
  <div class="pagina">
    <header class="pagina__topo">
      <div>
        <div v-if="eyebrow" class="eyebrow">// {{ eyebrow }}</div>
        <h1 class="pagina__titulo">{{ titulo }}</h1>
        <p v-if="descricao" class="pagina__descricao">{{ descricao }}</p>
      </div>
      <slot name="acoes" />
    </header>
    <slot />
  </div>
</template>

<style scoped>
.pagina {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  box-sizing: border-box;
  width: 100%;
  max-width: 80rem;
  margin: 0 auto;
  padding: var(--space-8) var(--space-10) 3.5rem;
}

.pagina__topo {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  align-items: flex-end;
  justify-content: space-between;
}

.pagina__titulo {
  margin-top: 0.375rem;
  font-size: var(--text-3xl);
  font-weight: var(--fw-semibold);
  letter-spacing: -0.015em;
}

.pagina__descricao {
  max-width: 40rem;
  margin: 0.375rem 0 0;
  font-size: var(--text-sm);
  color: var(--text-muted);
}

@media (max-width: 47.99rem) {
  .pagina {
    gap: var(--space-4);
    padding: var(--space-5) var(--space-4);
  }

  .pagina__titulo {
    font-size: var(--text-2xl);
  }
}
</style>
