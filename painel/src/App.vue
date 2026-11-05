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

    <nav class="barra__nav">
      <RouterLink to="/inscricoes">Inscrições</RouterLink>
      <RouterLink to="/metricas">Métricas</RouterLink>
      <template v-if="auth.usuario.papel === 'admin'">
        <RouterLink to="/emails">E-mails</RouterLink>
        <RouterLink to="/lgpd">LGPD</RouterLink>
      </template>
    </nav>
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

.barra__nav {
  display: flex;
  gap: 1rem;
  margin-right: auto;
}

.barra__nav a {
  color: #6b4526;
  text-decoration: none;
  padding: 0.25rem 0;
  border-bottom: 2px solid transparent;
}

.barra__nav a.router-link-active {
  color: #2a1908;
  border-bottom-color: #a8511a;
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
