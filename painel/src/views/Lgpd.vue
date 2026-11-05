<script setup>
import { onMounted, ref } from 'vue';
import Button from 'primevue/button';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import DataTable from 'primevue/datatable';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { api } from '../api.js';
import { dataHora } from '../formato.js';

const confirmar = useConfirm();
const toast = useToast();

const email = ref('');
const resultado = ref(null);
const buscando = ref(false);
const auditorias = ref([]);

async function consultar() {
  buscando.value = true;
  resultado.value = null;

  try {
    resultado.value = await api(`/api/painel/lgpd?email=${encodeURIComponent(email.value.trim())}`);
    await carregaAuditoria();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Não deu para consultar', detail: e.erros?.email?.[0] || e.message, life: 5000 });
  } finally {
    buscando.value = false;
  }
}

function pedirAnonimizacao() {
  confirmar.require({
    header: 'Anonimizar os dados desta pessoa?',
    message: `Nome, e-mail, WhatsApp e respostas de ${resultado.value.email} serão apagados das `
      + `${resultado.value.inscricoes.length} inscrição(ões). A data e a versão do aceite de LGPD ficam, `
      + 'como prova do consentimento. Não dá para desfazer.',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
    acceptProps: { label: 'Anonimizar', severity: 'danger' },
    accept: anonimizar,
  });
}

async function anonimizar() {
  try {
    const feito = await api('/api/painel/lgpd', { metodo: 'DELETE', corpo: { email: resultado.value.email } });

    toast.add({
      severity: 'success',
      summary: 'Anonimizado',
      detail: `${feito.inscricoes} inscrição(ões) e ${feito.emails} registro(s) de envio.`,
      life: 6000,
    });

    resultado.value = null;
    email.value = '';
    await carregaAuditoria();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Não deu para anonimizar', detail: e.message, life: 5000 });
  }
}

async function carregaAuditoria() {
  auditorias.value = (await api('/api/painel/auditorias?por_pagina=25')).data;
}

onMounted(carregaAuditoria);

</script>

<template>
  <div class="lgpd">
    <section class="cartao">
      <h2>Direitos do titular</h2>
      <p class="ajuda">
        Procure pelo e-mail que a pessoa usou na inscrição. A consulta e a anonimização
        ficam registradas no histórico abaixo, com quem fez e quando.
      </p>

      <form class="procura" @submit.prevent="consultar">
        <InputText v-model="email" type="email" placeholder="email@exemplo.com" required />
        <Button type="submit" label="Consultar" :loading="buscando" />
      </form>
    </section>

    <section v-if="resultado" class="cartao">
      <h2>{{ resultado.email }}</h2>

      <Message v-if="!resultado.inscricoes.length && !resultado.emails.length" severity="info" :closable="false">
        Não há nada guardado com esse e-mail.
      </Message>

      <template v-else>
        <h3>Inscrições ({{ resultado.inscricoes.length }})</h3>
        <dl v-for="i in resultado.inscricoes" :key="i.id" class="dados">
          <template v-for="(valor, chave) in i" :key="chave">
            <dt>{{ chave }}</dt>
            <dd>{{ typeof valor === 'object' && valor !== null ? JSON.stringify(valor) : valor ?? '—' }}</dd>
          </template>
        </dl>

        <h3>E-mails enviados ({{ resultado.emails.length }})</h3>
        <ul class="envios">
          <li v-for="e in resultado.emails" :key="e.id">
            {{ dataHora(e.enviado_em) }} — {{ e.assunto }}
          </li>
          <li v-if="!resultado.emails.length">Nenhum.</li>
        </ul>

        <Button
          v-if="resultado.inscricoes.length"
          label="Anonimizar"
          icon="pi pi-trash"
          severity="danger"
          @click="pedirAnonimizacao"
        />
      </template>
    </section>

    <section class="cartao">
      <h2>Histórico de acesso a dado pessoal</h2>
      <DataTable :value="auditorias" data-key="id" size="small">
        <template #empty>Nada registrado ainda.</template>
        <Column field="created_at" header="Quando">
          <template #body="{ data }">{{ dataHora(data.created_at) }}</template>
        </Column>
        <Column header="Quem">
          <template #body="{ data }">{{ data.user?.name ?? '—' }}</template>
        </Column>
        <Column field="acao" header="Ação" />
        <Column field="alvo" header="Alvo" />
        <Column field="ip" header="IP" />
      </DataTable>
    </section>

    <ConfirmDialog />
  </div>
</template>

<style scoped>
.lgpd {
  display: grid;
  gap: 1rem;
}

.cartao {
  padding: 1rem 1.25rem;
  background: #fbf6ea;
  border: 1px solid #eedcb2;
  border-radius: 12px;
}

.cartao h2 {
  margin: 0 0 0.35rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6b4526;
}

.cartao h3 {
  margin: 1rem 0 0.5rem;
  font-size: 0.95rem;
}

.ajuda {
  margin: 0 0 0.75rem;
  color: #6b4526;
}

.procura {
  display: flex;
  gap: 0.5rem;
}

.procura :deep(.p-inputtext) {
  width: 22rem;
}

.dados {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.2rem 1rem;
  margin: 0 0 1rem;
  padding: 0.75rem 1rem;
  background: #fff;
  border-radius: 8px;
}

.dados dt {
  font-weight: 600;
  color: #6b4526;
}

.dados dd {
  margin: 0;
  overflow-wrap: anywhere;
}

.envios {
  margin: 0 0 1rem;
  padding-left: 1.1rem;
}
</style>
