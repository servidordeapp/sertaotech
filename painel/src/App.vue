<script setup>
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';
import { auth, sai } from './auth.js';

const router = useRouter();

async function sair() {
  await sai();
  router.push({ name: 'login' });
}
</script>

<template>
  <header v-if="auth.usuario" class="barra">
    <strong>Painel · Sertão Tech</strong>
    <span class="barra__usuario">
      {{ auth.usuario.nome }}
      <Tag :value="auth.usuario.papel" severity="secondary" />
      <Button label="Sair" icon="pi pi-sign-out" severity="secondary" text @click="sair" />
    </span>
  </header>

  <main class="conteudo">
    <RouterView />
  </main>

  <Toast />
</template>

<style scoped>
.barra {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  background: #fff;
  border-bottom: 1px solid #e5e0d6;
}

.barra__usuario {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.conteudo {
  padding: 1.25rem;
}
</style>
