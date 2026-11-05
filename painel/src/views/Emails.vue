<script setup>
import { onMounted, ref, watch } from 'vue';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Estado from '../components/Estado.vue';
import Pagina from '../components/Pagina.vue';
import { api } from '../api.js';
import { dataHora } from '../formato.js';

// Null até a primeira resposta, como em Inscricoes.vue.
const linhas = ref(null);
const total = ref(0);
const carregando = ref(false);
const erro = ref(null);
const primeiro = ref(0);
const porPagina = ref(25);
const busca = ref('');

async function carrega() {
  carregando.value = true;
  erro.value = null;

  try {
    const resposta = await api(`/api/painel/emails?${new URLSearchParams({
      ...(busca.value.trim() ? { busca: busca.value.trim() } : {}),
      por_pagina: porPagina.value,
      page: primeiro.value / porPagina.value + 1,
    })}`);

    linhas.value = resposta.data;
    total.value = resposta.total;
  } catch (e) {
    erro.value = e;
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
  <Pagina
    eyebrow="Pessoas · log de envio"
    titulo="E-mails"
    descricao="O que saiu de e-mail, para quem e quando. O corpo da mensagem não é guardado, só o assunto."
  >
    <div class="filtros">
      <IconField class="busca">
        <InputIcon class="pi pi-search" />
        <InputText v-model="busca" placeholder="Destinatário ou assunto" aria-label="Buscar" />
      </IconField>
    </div>

    <Estado v-if="erro" tipo="erro" :falha="erro" @tentar="carrega" />
    <Estado v-else-if="!linhas" tipo="carregando" />

    <section v-else class="cartao cartao--tabela">
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
        <template #empty>
          <Estado
            tipo="vazio"
            :titulo="busca.trim() ? 'Nada encontrado' : 'Nenhum e-mail enviado ainda'"
            :texto="busca.trim() ? 'Tente outro termo.' : 'Os e-mails aparecem aqui assim que saírem.'"
          />
        </template>

        <Column field="para" header="Para">
          <template #body="{ data }"><span class="mono">{{ data.para }}</span></template>
        </Column>
        <Column field="assunto" header="Assunto" />
        <Column field="mailable" header="Tipo">
          <template #body="{ data }"><span class="mono">{{ mailable(data.mailable) }}</span></template>
        </Column>
        <Column field="enviado_em" header="Enviado em">
          <template #body="{ data }">{{ dataHora(data.enviado_em) }}</template>
        </Column>
      </DataTable>
    </section>
  </Pagina>
</template>
