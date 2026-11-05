<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import SelectButton from 'primevue/selectbutton';
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';
import Estado from '../components/Estado.vue';
import Pagina from '../components/Pagina.vue';
import { api, baixaExport } from '../api.js';
import { auth } from '../auth.js';
import { dataHora } from '../formato.js';

const toast = useToast();

// Null até a primeira resposta: a carga inicial mostra o esqueleto, as outras
// só o indicador por cima da tabela que já está na tela.
const linhas = ref(null);
const total = ref(0);
const carregando = ref(false);
const erro = ref(null);
const expandidas = ref({});

const primeiro = ref(0);
const porPagina = ref(25);
const tipo = ref('');
const busca = ref('');

// O papel manda: quem só enxerga um tipo não precisa de filtro de tipo.
const tipos = computed(() => auth.usuario?.tipos_visiveis ?? []);
const opcoesDeTipo = computed(() => [
  { rotulo: 'Todos', valor: '' },
  ...tipos.value.map((valor) => ({ rotulo: valor[0].toUpperCase() + valor.slice(1), valor })),
]);

const filtros = computed(() => ({
  ...(tipo.value ? { tipo: tipo.value } : {}),
  ...(busca.value.trim() ? { busca: busca.value.trim() } : {}),
}));

async function carrega() {
  carregando.value = true;
  erro.value = null;

  try {
    const resposta = await api(`/api/painel/inscricoes?${new URLSearchParams({
      ...filtros.value,
      por_pagina: porPagina.value,
      page: primeiro.value / porPagina.value + 1,
    })}`);

    linhas.value = resposta.data;
    total.value = resposta.meta.total;
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
</script>

<template>
  <Pagina
    eyebrow="Pessoas · lista de espera"
    titulo="Inscrições"
    :descricao="tipos.length === 1
      ? `Você vê apenas inscrições de ${tipos[0]}, conforme o seu papel.`
      : 'Quem entrou na lista de espera pelo site.'"
  >
    <template #acoes>
      <Button
        label="Exportar CSV"
        icon="pi pi-download"
        severity="secondary"
        outlined
        size="small"
        :loading="exportando"
        @click="exporta"
      />
    </template>

    <div class="filtros">
      <IconField class="busca">
        <InputIcon class="pi pi-search" />
        <InputText v-model="busca" placeholder="Nome, e-mail ou whatsapp" aria-label="Buscar" />
      </IconField>

      <SelectButton
        v-if="tipos.length > 1"
        v-model="tipo"
        :options="opcoesDeTipo"
        option-label="rotulo"
        option-value="valor"
        :allow-empty="false"
        aria-label="Filtrar por tipo"
      />
      <Tag v-else-if="tipos.length" icon="pi pi-lock" :value="`Somente ${tipos[0]}`" severity="secondary" />
    </div>

    <Estado v-if="erro" tipo="erro" :falha="erro" @tentar="carrega" />
    <Estado v-else-if="!linhas" tipo="carregando" />

    <section v-else class="cartao cartao--tabela">
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
        <template #empty>
          <Estado
            tipo="vazio"
            :titulo="Object.keys(filtros).length ? 'Nada encontrado' : 'Nenhuma inscrição ainda'"
            :texto="Object.keys(filtros).length
              ? 'Tente outro termo ou limpe o filtro.'
              : 'Quem entrar na lista de espera pelo site aparece aqui.'"
          />
        </template>

        <Column expander style="width: 3rem" />
        <Column field="nome" header="Nome">
          <template #body="{ data }">
            <strong>{{ data.nome }}</strong>
            <Tag
              v-if="data.participou_em.length"
              :value="`Participou em ${data.participou_em.join(', ')}`"
              severity="success"
              class="selo-participou"
            />
          </template>
        </Column>
        <Column field="email" header="E-mail">
          <template #body="{ data }"><span class="mono">{{ data.email }}</span></template>
        </Column>
        <Column field="whatsapp" header="WhatsApp">
          <template #body="{ data }"><span class="mono">{{ whatsapp(data.whatsapp) }}</span></template>
        </Column>
        <Column field="tipo" header="Tipo">
          <template #body="{ data }">
            <Tag :value="data.tipo" class="tag-tipo" :class="`tag-${data.tipo}`" />
          </template>
        </Column>
        <Column field="inscrito_em" header="Inscrito em">
          <template #body="{ data }">{{ dataHora(data.inscrito_em) }}</template>
        </Column>

        <!-- `dados` muda de forma por tipo (cidade, tema, cota...), então vira
             lista chave/valor em vez de coluna fixa. -->
        <template #expansion="{ data }">
          <dl class="dados">
            <div v-for="(valor, chave) in semConsentimento(data.dados)" :key="chave">
              <dt>{{ chave }}</dt>
              <dd>{{ valor }}</dd>
            </div>
            <div v-if="data.compartilha">
              <dt>compartilhamento</dt>
              <dd>autorizado</dd>
            </div>
          </dl>
        </template>
      </DataTable>
    </section>
  </Pagina>
</template>

<style scoped>
.selo-participou {
  margin-left: var(--space-2);
}
</style>
