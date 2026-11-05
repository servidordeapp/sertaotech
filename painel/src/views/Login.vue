<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Password from 'primevue/password';
import Marca from '../components/Marca.vue';
import { entra, telaInicial } from '../auth.js';

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
    router.push(route.query.destino || telaInicial());
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
  <div class="entrada">
    <Marca legenda="Painel interno" class="entrada__marca" />

    <form class="login" @submit.prevent="enviar">
      <div>
        <h1 class="login__titulo">Entrar</h1>
        <p class="login__apoio">Acesso restrito à organização do evento.</p>
      </div>

      <Message v-if="erro" severity="error" :closable="false">{{ erro }}</Message>

      <div class="login__campo">
        <label for="email">E-mail</label>
        <InputText id="email" v-model="email" type="email" autocomplete="username" required autofocus />
      </div>

      <div class="login__campo">
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
      </div>

      <Button type="submit" label="Entrar" size="large" :loading="enviando" />
    </form>

    <p class="entrada__nota">Exportações e consultas de dado pessoal ficam registradas (LGPD).</p>
  </div>
</template>

<style scoped>
.entrada {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  box-sizing: border-box;
  width: 100%;
  max-width: 26.25rem;
  margin: 0 auto;
  padding: var(--space-12) var(--space-4);
}

.entrada__marca {
  align-self: center;
}

.entrada__nota {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--text-muted);
  text-align: center;
}

/* O único cartão-adesivo do painel, junto com o estado de 403. */
.login {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
  background: var(--surface-card);
  border: 2px solid var(--border-ink);
  border-radius: 1.25rem;
  box-shadow: var(--shadow-badge);
}

.login__titulo {
  font-size: var(--text-2xl);
  font-weight: var(--fw-semibold);
}

.login__apoio {
  margin: var(--space-1) 0 0;
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.login__campo {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.login__campo label {
  font-size: 0.8125rem;
  font-weight: var(--fw-semibold);
  color: var(--text-strong);
}
</style>
