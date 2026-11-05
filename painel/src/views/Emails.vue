<script setup>
import { onMounted, ref, watch } from 'vue';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import { useToast } from 'primevue/usetoast';
import { api } from '../api.js';
import { dataHora } from '../formato.js';

const toast = useToast();
const linhas = ref([]);
const total = ref(0);
const carregando = ref(false);
const primeiro = ref(0);
const porPagina = ref(25);
const busca = ref('');

async function carrega() {
  carregando.value = true;

  try {
    const resposta = await api(`/api/painel/emails?${new URLSearchParams({
      ...(busca.value.trim() ? { busca: busca.value.trim() } : {}),
      por_pagina: porPagina.value,
      page: primeiro.value / porPagina.value + 1,
    })}`);

    linhas.value = resposta.data;
    total.value = resposta.total;
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Não deu para carregar', detail: e.message, life: 5000 });
  } finally {
    carregando.value = false;
  }
}

function paginar(evento) {
  primeiro.value = evento.first;
  porPagina.value = evento.rows;
  carrega();
}

let agendado;
watch(busca, () => {
  clearTimeout(agendado);
  agendado = setTimeout(() => {
    primeiro.value = 0;
    carrega();
  }, 350);
});

onMounted(carrega);


/** Só a classe do Mailable interessa, não o namespace inteiro. */
function mailable(classe) {
  return classe ? classe.split('\\').pop() : '—';
}
</script>

<template>
  <DataTable
    :value="linhas"
    :loading="carregando"
    data-key="id"
    lazy
    paginator
    :rows="porPagina"
    :first="primeiro"
    :total-records="total"
    :rows-per-page-options="[25, 50, 100]"
    current-page-report-template="{first}–{last} de {totalRecords}"
    paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
    @page="paginar"
  >
    <template #header>
      <IconField>
        <InputIcon class="pi pi-search" />
        <InputText v-model="busca" placeholder="Destinatário ou assunto" />
      </IconField>
    </template>

    <template #empty>Nenhum e-mail registrado.</template>

    <Column field="enviado_em" header="Enviado em">
      <template #body="{ data }">{{ dataHora(data.enviado_em) }}</template>
    </Column>
    <Column field="para" header="Para" />
    <Column field="assunto" header="Assunto" />
    <Column field="mailable" header="Tipo">
      <template #body="{ data }">{{ mailable(data.mailable) }}</template>
    </Column>
  </DataTable>
</template>

<style scoped>
:deep(.p-inputtext) {
  width: 20rem;
}
</style>
