<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Password from 'primevue/password';
import { entra } from '../auth.js';

const route = useRoute();
const router = useRouter();

const email = ref('');
const senha = ref('');
const erro = ref('');
const enviando = ref(false);

async function enviar() {
  erro.value = '';
  enviando.value = true;

  try {
    await entra(email.value, senha.value);
    router.push(route.query.destino || { name: 'inscricoes' });
  } catch (e) {
    // 422 vem com a mensagem do Laravel; 429 é o limite de 5 tentativas/min.
    erro.value = e.erros?.email?.[0]
      || (e.status === 429 ? 'Tentativas demais. Espere um minuto.' : 'Não deu para entrar. Tente de novo.');
  } finally {
    enviando.value = false;
  }
}
</script>

<template>
  <form class="login" @submit.prevent="enviar">
    <h1>Entrar no painel</h1>

    <Message v-if="erro" severity="error" :closable="false">{{ erro }}</Message>

    <label for="email">E-mail</label>
    <InputText id="email" v-model="email" type="email" autocomplete="username" required autofocus />

    <label for="senha">Senha</label>
    <!-- `input-id` e `input-props` vão para o <input> de dentro; `id` e
         `autocomplete` soltos cairiam na div que embrulha o campo. -->
    <Password
      v-model="senha"
      input-id="senha"
      :input-props="{ autocomplete: 'current-password', required: true }"
      :feedback="false"
      toggle-mask
      fluid
    />

    <Button type="submit" label="Entrar" :loading="enviando" />
  </form>
</template>

<style scoped>
.login {
  display: grid;
  gap: 0.5rem;
  max-width: 22rem;
  margin: 3rem auto;
  padding: 1.5rem;
  background: #fff;
  border-radius: 12px;
}

.login h1 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
}

.login :deep(input) {
  width: 100%;
}

.login button[type='submit'] {
  margin-top: 0.75rem;
}
</style>
