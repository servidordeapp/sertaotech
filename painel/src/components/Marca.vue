<script setup>
import logo from '../../../site/public/assets/logo-96.webp';

defineProps({
  // Sobre a barra escura o wordmark é creme; sobre o papel, espresso.
  claro: { type: Boolean, default: false },
  legenda: { type: String, default: null },
});
</script>

<template>
  <span class="marca" :class="{ 'marca--clara': claro }">
    <img :src="logo" alt="" class="marca__logo" />
    <span class="marca__texto">
      <span class="marca__nome">Sertão Tech</span>
      <span v-if="legenda" class="marca__legenda">// {{ legenda }}</span>
    </span>
  </span>
</template>

<style scoped>
.marca {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
}

.marca__logo {
  display: block;
  height: 2.125rem;
}

.marca__texto {
  display: flex;
  flex-direction: column;
  line-height: 1;
  white-space: nowrap;
}

.marca__nome {
  font-family: var(--font-wordmark);
  font-size: 1.0625rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--espresso-900);
}

.marca__legenda {
  margin-top: 0.2rem;
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--terra-600);
}

.marca--clara .marca__nome {
  color: var(--sand-50);
}

.marca--clara .marca__legenda {
  color: var(--amber-300);
}
</style>
