<script setup>
import { computed, ref, watch } from 'vue';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import SelectButton from 'primevue/selectbutton';
import Tag from 'primevue/tag';
import Estado from '../components/Estado.vue';
import Pagina from '../components/Pagina.vue';
import { api } from '../api.js';
import { falhaDasEdicoes, carregaEdicoes, useEdicao } from '../edicao.js';
import { dataHora } from '../formato.js';

const OPCOES_DE_PRESENCA = [
  { rotulo: 'Todos', valor: '' },
  { rotulo: 'Compareceram', valor: 'compareceu' },
  { rotulo: 'Faltaram', valor: 'faltou' },
];

// O Select trata '' como "nada selecionado" e mostra o placeholder, não o rótulo da opção.
const ROTULO_SEM_FILTRO = 'Todos os perfis';

const edicao = useEdicao();
const ano = computed(() => edicao.value?.ano ?? null);

// Null até a primeira resposta: a carga inicial mostra o esqueleto, as outras
// só o indicador por cima da tabela que já está na tela.
const linhas = ref(null);
const total = ref(0);
const resumo = ref(null);
const cupons = ref([]);
const carregando = ref(false);
const erro = ref(null);

const primeiro = ref(0);
const porPagina = ref(25);
const presenca = ref('');
const cupom = ref('');
const busca = ref('');

const opcoesDeCupom = computed(() => [
  { rotulo: ROTULO_SEM_FILTRO, valor: '' },
  { rotulo: 'Público (sem palestrantes e organização)', valor: 'publico' },
  { rotulo: 'Sem cupom', valor: 'sem-cupom' },
  ...cupons.value.map((nome) => ({ rotulo: nome, valor: nome })),
]);

const filtros = computed(() => ({
  ...(presenca.value ? { presenca: presenca.value } : {}),
  ...(cupom.value ? { cupom: cupom.value } : {}),
  ...(busca.value.trim() ? { busca: busca.value.trim() } : {}),
}));

const faltaram = computed(() => resumo.value.ingressos - resumo.value.compareceram);
const comparecimento = computed(() => (resumo.value.ingressos
  ? Math.round((resumo.value.compareceram / resumo.value.ingressos) * 100)
  : 0));

// Resposta atrasada de outra edição ou filtro não pode sobrescrever a tela atual.
let requisicao = 0;

async function carrega() {
  if (!ano.value) return;

  const atual = ++requisicao;
  carregando.value = true;
  erro.value = null;

  try {
    const resposta = await api(`/api/painel/participantes/${ano.value}?${new URLSearchParams({
      ...filtros.value,
      por_pagina: porPagina.value,
      page: primeiro.value / porPagina.value + 1,
    })}`);

    if (atual !== requisicao) return;

    linhas.value = resposta.data;
    total.value = resposta.meta.total;
    resumo.value = resposta.resumo;
    cupons.value = resposta.cupons;
  } catch (e) {
    if (atual === requisicao) erro.value = e;
  } finally {
    if (atual === requisicao) carregando.value = false;
  }
}

function recarregaDoInicio() {
  primeiro.value = 0;
  carrega();
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
  agendado = setTimeout(recarregaDoInicio, 350);
});

watch([presenca, cupom], recarregaDoInicio);

// Cada edição tem os próprios cupons: o filtro de outro ano não vale aqui.
watch(ano, () => {
  cupom.value = '';
  recarregaDoInicio();
}, { immediate: true });
</script>

<template>
  <Pagina
    eyebrow="Pessoas · histórico do evento"
    titulo="Participantes"
    :descricao="`Quem teve ingresso aprovado na edição ${ano ?? ''}, conforme a plataforma de venda. Quem aguarda a próxima edição está em Inscrições.`"
  >
    <Estado v-if="falhaDasEdicoes" tipo="erro" :falha="falhaDasEdicoes" @tentar="carregaEdicoes" />
    <Estado v-else-if="erro" tipo="erro" :falha="erro" @tentar="carrega" />
    <Estado v-else-if="!linhas" tipo="carregando" com-numeros />

    <template v-else>
      <section class="numeros">
        <article class="cartao numero">
          <h2 class="eyebrow numero__rotulo">Ingressos aprovados</h2>
          <strong class="numero__valor">{{ resumo.ingressos }}</strong>
        </article>
        <article class="cartao numero">
          <h2 class="eyebrow numero__rotulo">Compareceram</h2>
          <strong class="numero__valor">{{ resumo.compareceram }} <small>{{ comparecimento }}%</small></strong>
        </article>
        <article class="cartao numero">
          <h2 class="eyebrow numero__rotulo">Faltaram</h2>
          <strong class="numero__valor">{{ faltaram }}</strong>
        </article>
        <article class="cartao numero">
          <h2 class="eyebrow numero__rotulo">Público presente</h2>
          <strong class="numero__valor">{{ resumo.compareceram - resumo.da_equipe }}</strong>
          <small class="numero__nota">Sem palestrantes e organização</small>
        </article>
      </section>

      <div class="filtros">
        <IconField class="busca">
          <InputIcon class="pi pi-search" />
          <InputText v-model="busca" placeholder="Nome ou e-mail" aria-label="Buscar" />
        </IconField>

        <SelectButton
          v-model="presenca"
          :options="OPCOES_DE_PRESENCA"
          option-label="rotulo"
          option-value="valor"
          :allow-empty="false"
          aria-label="Filtrar por presença"
        />

        <Select
          v-model="cupom"
          :options="opcoesDeCupom"
          option-label="rotulo"
          option-value="valor"
          :placeholder="ROTULO_SEM_FILTRO"
          aria-label="Filtrar por perfil ou cupom"
          class="filtro-cupom"
        />
      </div>

      <section class="cartao cartao--tabela">
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
              :titulo="Object.keys(filtros).length ? 'Nada encontrado' : 'Nenhum participante nesta edição'"
              :texto="Object.keys(filtros).length
                ? 'Tente outro termo ou limpe o filtro.'
                : 'A lista entra pela planilha da plataforma de venda, depois do evento.'"
            />
          </template>

          <Column field="nome" header="Nome">
            <template #body="{ data }"><strong>{{ data.nome }}</strong></template>
          </Column>
          <Column field="email" header="E-mail">
            <template #body="{ data }"><span class="mono">{{ data.email ?? '—' }}</span></template>
          </Column>
          <Column field="tipo_ingresso" header="Ingresso" />
          <Column field="cupom" header="Cupom">
            <template #body="{ data }"><span class="mono cupom">{{ data.cupom ?? '—' }}</span></template>
          </Column>
          <Column field="compareceu" header="Presença">
            <template #body="{ data }">
              <Tag :value="data.compareceu ? 'Compareceu' : 'Faltou'" :severity="data.compareceu ? 'success' : 'secondary'" />
            </template>
          </Column>
          <Column field="check_in_em" header="Check-in">
            <template #body="{ data }">{{ data.check_in_em ? dataHora(data.check_in_em) : '—' }}</template>
          </Column>
        </DataTable>
      </section>
    </template>
  </Pagina>
</template>

<style scoped>
/* auto-fit: em tela estreita os cartões descem de linha sem deixar buraco. */
.numeros {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: var(--space-4);
}

.numero {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.numero__rotulo {
  font-weight: 400;
  line-height: inherit;
}

.numero__valor {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: var(--fw-bold);
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--text-strong);
}

.numero__valor small {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 400;
  letter-spacing: 0;
  color: var(--text-muted);
}

.numero__nota {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.cupom {
  white-space: nowrap;
}

.filtro-cupom {
  flex: 0 1 15rem;
  min-width: 0;
}
</style>
