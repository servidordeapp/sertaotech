<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';
import { api, baixaExport } from '../api.js';
import { auth } from '../auth.js';
import { dataHora } from '../formato.js';

const toast = useToast();

const linhas = ref([]);
const total = ref(0);
const carregando = ref(false);
const expandidas = ref({});

const primeiro = ref(0);
const porPagina = ref(25);
const tipo = ref(null);
const busca = ref('');

// O papel manda: quem só enxerga um tipo não precisa de filtro de tipo.
const tipos = computed(() => auth.usuario?.tipos_visiveis ?? []);

const filtros = computed(() => ({
  ...(tipo.value ? { tipo: tipo.value } : {}),
  ...(busca.value.trim() ? { busca: busca.value.trim() } : {}),
}));

async function carrega() {
  carregando.value = true;

  try {
    const resposta = await api(`/api/painel/inscricoes?${new URLSearchParams({
      ...filtros.value,
      por_pagina: porPagina.value,
      page: primeiro.value / porPagina.value + 1,
    })}`);

    linhas.value = resposta.data;
    total.value = resposta.meta.total;
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

// Digitar não dispara uma requisição por tecla.
let agendado;
watch(busca, () => {
  clearTimeout(agendado);
  agendado = setTimeout(() => {
    primeiro.value = 0;
    carrega();
  }, 350);
});

watch(tipo, () => {
  primeiro.value = 0;
  carrega();
});

onMounted(carrega);

const exportando = ref(false);

async function exporta() {
  exportando.value = true;

  try {
    await baixaExport(filtros.value);
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Não deu para exportar', detail: e.message, life: 5000 });
  } finally {
    exportando.value = false;
  }
}


function whatsapp(digitos) {
  const m = /^(\d{2})(\d{4,5})(\d{4})$/.exec(digitos ?? '');
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : digitos;
}

/**
 * O consentimento de compartilhamento está em coluna própria na tabela e
 * também dentro de `dados` (o formulário manda os dois). Mostrar as duas
 * cópias só confunde, então aqui fica a de cima.
 */
function semConsentimento(dados) {
  return Object.fromEntries(
    Object.entries(dados ?? {}).filter(([chave]) => !chave.startsWith('compartilhamento')),
  );
}

const cores = { participante: 'info', palestrante: 'warn', patrocinador: 'success' };
</script>

<template>
  <DataTable
    v-model:expanded-rows="expandidas"
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
      <div class="cabecalho">
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText v-model="busca" placeholder="Nome, e-mail ou whatsapp" />
        </IconField>

        <Select
          v-if="tipos.length > 1"
          v-model="tipo"
          :options="tipos"
          placeholder="Todos os tipos"
          show-clear
        />

        <Button
          label="Exportar CSV"
          icon="pi pi-download"
          severity="secondary"
          :loading="exportando"
          @click="exporta"
        />
      </div>
    </template>

    <template #empty>Nenhuma inscrição com esses filtros.</template>

    <Column expander style="width: 3rem" />
    <Column field="tipo" header="Tipo">
      <template #body="{ data }">
        <Tag :value="data.tipo" :severity="cores[data.tipo]" />
      </template>
    </Column>
    <Column field="nome" header="Nome" />
    <Column field="email" header="E-mail" />
    <Column field="whatsapp" header="WhatsApp">
      <template #body="{ data }">{{ whatsapp(data.whatsapp) }}</template>
    </Column>
    <Column field="inscrito_em" header="Inscrito em">
      <template #body="{ data }">{{ dataHora(data.inscrito_em) }}</template>
    </Column>

    <!-- `dados` muda de forma por tipo (cidade, tema, cota...), então vira
         lista chave/valor em vez de coluna fixa. -->
    <template #expansion="{ data }">
      <dl class="dados">
        <template v-for="(valor, chave) in semConsentimento(data.dados)" :key="chave">
          <dt>{{ chave }}</dt>
          <dd>{{ valor }}</dd>
        </template>
        <template v-if="data.compartilha">
          <dt>compartilhamento</dt>
          <dd>autorizado</dd>
        </template>
      </dl>
    </template>
  </DataTable>
</template>

<style scoped>
.cabecalho {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.cabecalho > :last-child {
  margin-left: auto;
}

.cabecalho :deep(input) {
  width: 18rem;
}

.dados {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.25rem 1rem;
  margin: 0;
  padding: 0.5rem 1rem;
}

.dados dt {
  font-weight: 600;
  text-transform: capitalize;
}

.dados dd {
  margin: 0;
}
</style>
