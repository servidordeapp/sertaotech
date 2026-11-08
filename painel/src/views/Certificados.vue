<script setup>
import { computed, ref, watch } from 'vue';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Select from 'primevue/select';
import SelectButton from 'primevue/selectbutton';
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';
import Estado from '../components/Estado.vue';
import Pagina from '../components/Pagina.vue';
import FormCertificado from '../components/certificados/FormCertificado.vue';
import { api, baixaAnexo } from '../api.js';
import { SITUACOES, TIPOS, rotuloDoTipo } from '../certificados.js';
import { falhaDasEdicoes, carregaEdicoes, useEdicao } from '../edicao.js';

const OPCOES_DE_SITUACAO = [
  { rotulo: 'Todos', valor: '' },
  { rotulo: 'Rascunhos', valor: 'rascunho' },
  { rotulo: 'Emitidos', valor: 'emitido' },
  { rotulo: 'Revogados', valor: 'revogado' },
  { rotulo: 'Descartados', valor: 'descartado' },
];

const toast = useToast();
const edicao = useEdicao();
const ano = computed(() => edicao.value?.ano ?? null);

// Null até a primeira resposta, como em Participantes.
const linhas = ref(null);
const total = ref(0);
const resumo = ref(null);
const atividades = ref({});
const carregando = ref(false);
const erro = ref(null);

const primeiro = ref(0);
const porPagina = ref(25);
const situacao = ref('');
const tipo = ref('');
const atividade = ref('');
const busca = ref('');

const formulario = ref(null);
const revogando = ref(null);
const motivo = ref('');
const confirmando = ref(null);
const ocupado = ref(null);

const opcoesDeTipo = [{ rotulo: 'Todos os tipos', valor: '' }, ...TIPOS];
const opcoesDeAtividade = computed(() => [
  { rotulo: 'Todas as atividades', valor: '' },
  ...Object.entries(atividades.value).map(([chave, a]) => ({ rotulo: a.nome, valor: chave })),
]);
// Marcar na linha: os minicursos de 2026 foram ao mesmo tempo, então é um por pessoa.
const opcoesNaLinha = computed(() => [
  { rotulo: 'Nenhuma', valor: null },
  ...Object.entries(atividades.value).map(([chave, a]) => ({ rotulo: a.nome, valor: chave })),
]);
const temAtividades = computed(() => Object.keys(atividades.value).length > 0);

const filtros = computed(() => ({
  ...(situacao.value ? { situacao: situacao.value } : {}),
  ...(tipo.value ? { tipo: tipo.value } : {}),
  ...(atividade.value ? { atividade: atividade.value } : {}),
  ...(busca.value.trim() ? { busca: busca.value.trim() } : {}),
}));

let requisicao = 0;

async function carrega() {
  if (!ano.value) return;

  const atual = ++requisicao;
  carregando.value = true;
  erro.value = null;

  try {
    const resposta = await api(`/api/painel/certificados/${ano.value}?${new URLSearchParams({
      ...filtros.value,
      por_pagina: porPagina.value,
      page: primeiro.value / porPagina.value + 1,
    })}`);

    if (atual !== requisicao) return;

    linhas.value = resposta.data;
    total.value = resposta.meta.total;
    resumo.value = resposta.resumo;
    atividades.value = resposta.atividades;
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

let agendado;
watch(busca, () => {
  clearTimeout(agendado);
  agendado = setTimeout(recarregaDoInicio, 350);
});

watch([situacao, tipo, atividade], recarregaDoInicio);

watch(ano, () => {
  atividade.value = '';
  recarregaDoInicio();
}, { immediate: true });

/** Roda uma ação, mostra o resultado e recarrega. `chave` trava o botão certo enquanto espera. */
async function executa(chave, acao, sucesso) {
  ocupado.value = chave;

  try {
    const resultado = await acao();
    toast.add({ severity: 'success', summary: sucesso(resultado), life: 4000 });
    await carrega();
    return true;
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Não deu certo', detail: Object.values(e.erros ?? {}).flat()[0] ?? e.message, life: 6000 });
    return false;
  } finally {
    ocupado.value = null;
  }
}

function preparar() {
  executa('preparar', () => api(`/api/painel/certificados/${ano.value}/preparar`, { metodo: 'POST' }), (r) => (r.criados
    ? `${r.criados} rascunho(s) novo(s)`
    : 'Nada novo: todo mundo com check-in ou cupom já tem rascunho'));
}

async function previa(tipoDaPrevia) {
  ocupado.value = `previa-${tipoDaPrevia}`;
  try {
    await baixaAnexo(`/api/painel/certificados/${ano.value}/previa?tipo=${tipoDaPrevia}`, `previa-${ano.value}-${tipoDaPrevia}.pdf`);
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Prévia indisponível', detail: e.message, life: 6000 });
  } finally {
    ocupado.value = null;
  }
}

async function confirma() {
  const acao = confirmando.value;
  const feito = await executa(acao, () => api(`/api/painel/certificados/${ano.value}/${acao}`, { metodo: 'POST', corpo: { confirmar: true } }), (r) => (acao === 'emitir'
    ? `${r.enfileirados} certificado(s) na fila de emissão`
    : `${r.enfileirados} aviso(s) na fila de e-mail`));

  if (feito) confirmando.value = null;
}

function emiteAgora(linha) {
  executa(`emitir-${linha.id}`, () => api(`/api/painel/certificados/${ano.value}/emitir/${linha.id}`, { metodo: 'POST' }), (r) => `Emitido: ${r.data.codigo}`);
}

function descarta(linha) {
  executa(`descartar-${linha.id}`, () => api(`/api/painel/certificados/${linha.id}`, { metodo: 'DELETE' }), () => `Descartado: ${linha.nome}`);
}

function marcaAtividade(linha, chave) {
  executa(`atividade-${linha.id}`, () => api(`/api/painel/certificados/${linha.id}`, {
    metodo: 'PATCH',
    corpo: { atividades: chave ? [chave] : [] },
  }), () => (chave ? `${linha.nome}: ${atividades.value[chave].nome}` : `${linha.nome}: sem atividade`));
}

function pedeRevogacao(linha) {
  motivo.value = '';
  revogando.value = linha;
}

async function revoga() {
  const linha = revogando.value;
  const feito = await executa('revogar', () => api(`/api/painel/certificados/${linha.id}/revogar`, {
    metodo: 'POST',
    corpo: { motivo: motivo.value.trim() },
  }), () => `Revogado: ${linha.codigo}`);

  if (feito) revogando.value = null;
}

async function copiaLink(linha) {
  try {
    await navigator.clipboard.writeText(linha.link);
    toast.add({ severity: 'success', summary: 'Link copiado', detail: linha.nome, life: 3000 });
  } catch {
    toast.add({ severity: 'warn', summary: 'Copie à mão', detail: linha.link, life: 10000 });
  }
}
</script>

<template>
  <Pagina
    eyebrow="Pessoas · documentos do evento"
    titulo="Certificados"
    :descricao="`Prepare, revise e emita os certificados da edição ${ano ?? ''}. Rascunho muda à vontade; emitido é documento e só se revoga.`"
  >
    <template #acoes>
      <div class="acoes">
        <Button label="Preparar" icon="pi pi-sync" severity="secondary" outlined :loading="ocupado === 'preparar'" @click="preparar" />
        <Button label="Adicionar" icon="pi pi-plus" severity="secondary" outlined @click="formulario = {}" />
        <Button label="Emitir rascunhos" icon="pi pi-verified" :disabled="!resumo?.rascunhos" @click="confirmando = 'emitir'" />
        <Button label="Avisar por e-mail" icon="pi pi-send" :disabled="!resumo?.emitidos" @click="confirmando = 'avisar'" />
      </div>
    </template>

    <Estado v-if="falhaDasEdicoes" tipo="erro" :falha="falhaDasEdicoes" @tentar="carregaEdicoes" />
    <Estado v-else-if="erro" tipo="erro" :falha="erro" @tentar="carrega" />
    <Estado v-else-if="!linhas" tipo="carregando" com-numeros />

    <template v-else>
      <section class="numeros">
        <article class="cartao numero">
          <h2 class="eyebrow numero__rotulo">Rascunhos</h2>
          <strong class="numero__valor">{{ resumo.rascunhos }}</strong>
        </article>
        <article class="cartao numero">
          <h2 class="eyebrow numero__rotulo">Emitidos</h2>
          <strong class="numero__valor">{{ resumo.emitidos }}</strong>
          <small v-if="resumo.revogados || resumo.cancelados" class="numero__nota">
            {{ resumo.revogados }} revogado(s), {{ resumo.cancelados }} cancelado(s) pela LGPD
          </small>
        </article>
        <article class="cartao numero">
          <h2 class="eyebrow numero__rotulo">E-mails avisados</h2>
          <strong class="numero__valor">{{ resumo.avisados }}</strong>
          <small v-if="resumo.avisos_na_fila" class="numero__nota">{{ resumo.avisos_na_fila }} na fila</small>
        </article>
        <article class="cartao numero previa">
          <h2 class="eyebrow numero__rotulo">Prévia do modelo</h2>
          <div class="previa__botoes">
            <Button
              v-for="t in TIPOS"
              :key="t.valor"
              :label="t.rotulo"
              size="small"
              severity="secondary"
              text
              :loading="ocupado === `previa-${t.valor}`"
              @click="previa(t.valor)"
            />
          </div>
        </article>
      </section>

      <div class="filtros">
        <IconField class="busca">
          <InputIcon class="pi pi-search" />
          <InputText v-model="busca" placeholder="Nome ou e-mail" aria-label="Buscar" />
        </IconField>

        <SelectButton
          v-model="situacao"
          :options="OPCOES_DE_SITUACAO"
          option-label="rotulo"
          option-value="valor"
          :allow-empty="false"
          aria-label="Filtrar por situação"
        />

        <Select v-model="tipo" :options="opcoesDeTipo" option-label="rotulo" option-value="valor" placeholder="Todos os tipos" aria-label="Filtrar por tipo" class="filtro" />
        <Select
          v-if="temAtividades"
          v-model="atividade"
          :options="opcoesDeAtividade"
          option-label="rotulo"
          option-value="valor"
          placeholder="Todas as atividades"
          aria-label="Filtrar por atividade"
          class="filtro"
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
              :titulo="Object.keys(filtros).length ? 'Nada encontrado' : 'Nenhum certificado nesta edição'"
              :texto="Object.keys(filtros).length
                ? 'Tente outro termo ou limpe o filtro.'
                : 'Clique em Preparar: quem fez check-in ganha rascunho de participante, e o cupom traz palestrantes e organização.'"
            />
          </template>

          <Column header="Pessoa">
            <template #body="{ data }">
              <strong>{{ data.nome }}</strong>
              <div class="mono apoio">{{ data.email }}</div>
            </template>
          </Column>
          <Column header="Tipo">
            <template #body="{ data }">
              {{ rotuloDoTipo(data.tipo) }}
              <div v-if="data.titulo" class="apoio">{{ data.titulo }}</div>
              <div v-else-if="['palestrante', 'ministrante'].includes(data.tipo)" class="apoio apoio--falta">Sem título</div>
            </template>
          </Column>
          <Column header="Horas">
            <template #body="{ data }"><span class="mono">{{ data.carga_horaria }} h</span></template>
          </Column>
          <Column v-if="temAtividades" header="Atividade">
            <template #body="{ data }">
              <Select
                v-if="data.situacao === 'rascunho' && data.tipo === 'participante' && data.atividades.length <= 1"
                :model-value="data.atividades[0] ?? null"
                :options="opcoesNaLinha"
                option-label="rotulo"
                option-value="valor"
                placeholder="Nenhuma"
                size="small"
                :loading="ocupado === `atividade-${data.id}`"
                :aria-label="`Atividade de ${data.nome}`"
                class="atividade-na-linha"
                @update:model-value="(chave) => marcaAtividade(data, chave)"
              />
              <span v-else class="apoio">{{ data.atividades.map((chave) => atividades[chave]?.nome ?? chave).join('; ') || '—' }}</span>
            </template>
          </Column>
          <Column header="Ingresso">
            <template #body="{ data }">
              <template v-if="data.participante_id">
                <Tag :value="data.compareceu ? 'Check-in' : 'Sem check-in'" :severity="data.compareceu ? 'success' : 'warn'" />
                <div v-if="data.cupom" class="mono apoio">{{ data.cupom }}</div>
              </template>
              <span v-else class="apoio">Sem ingresso</span>
            </template>
          </Column>
          <Column header="Situação">
            <template #body="{ data }">
              <Tag :value="SITUACOES[data.situacao].rotulo" :severity="SITUACOES[data.situacao].severidade" />
              <div v-if="data.codigo && data.situacao !== 'rascunho'" class="mono apoio">{{ data.codigo }}</div>
              <div v-if="data.motivo_revogacao" class="apoio">{{ data.motivo_revogacao }}</div>
            </template>
          </Column>
          <Column header="" class="coluna-acoes">
            <template #body="{ data }">
              <div class="acoes-linha">
                <template v-if="data.situacao === 'rascunho'">
                  <Button icon="pi pi-pencil" text rounded size="small" aria-label="Editar" title="Editar" @click="formulario = { item: data }" />
                  <Button
                    icon="pi pi-verified"
                    text
                    rounded
                    size="small"
                    aria-label="Emitir agora, sem fila"
                    title="Emitir agora, sem fila (teste)"
                    :loading="ocupado === `emitir-${data.id}`"
                    @click="emiteAgora(data)"
                  />
                  <Button
                    icon="pi pi-ban"
                    text
                    rounded
                    size="small"
                    severity="secondary"
                    aria-label="Descartar"
                    title="Descartar: o Preparar não recria"
                    :loading="ocupado === `descartar-${data.id}`"
                    @click="descarta(data)"
                  />
                </template>
                <template v-if="data.situacao === 'emitido'">
                  <Button as="a" :href="data.pdf_url" target="_blank" rel="noopener" icon="pi pi-file-pdf" text rounded size="small" aria-label="Abrir PDF" title="Abrir PDF" />
                  <Button icon="pi pi-link" text rounded size="small" aria-label="Copiar link" title="Copiar o link da página do certificado" @click="copiaLink(data)" />
                  <Button icon="pi pi-times-circle" text rounded size="small" severity="danger" aria-label="Revogar" title="Revogar" @click="pedeRevogacao(data)" />
                </template>
                <Button
                  v-if="data.situacao === 'revogado'"
                  icon="pi pi-replay"
                  text
                  rounded
                  size="small"
                  aria-label="Reemitir"
                  title="Reemitir com os dados corrigidos"
                  @click="formulario = { base: data }"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </section>
    </template>

    <FormCertificado
      v-if="formulario"
      :ano="ano"
      :atividades="atividades"
      :item="formulario.item"
      :base="formulario.base"
      @fechar="formulario = null"
      @salvo="carrega"
    />

    <Dialog
      :visible="Boolean(confirmando)"
      modal
      :draggable="false"
      :header="confirmando === 'emitir' ? 'Emitir os rascunhos?' : 'Avisar por e-mail?'"
      :style="{ width: '30rem', maxWidth: 'calc(100vw - 2rem)' }"
      @update:visible="confirmando = null"
    >
      <template v-if="confirmando === 'emitir'">
        <p>{{ resumo?.rascunhos }} rascunho(s) da edição {{ ano }} viram documento: ganham código e PDF e não mudam mais. Erro depois disso só se corrige revogando e emitindo outro.</p>
        <Message severity="warn" :closable="false">Antes da edição inteira, emita um certificado de teste pelo botão da linha e confira o PDF.</Message>
      </template>
      <template v-else>
        <p>Cada e-mail com certificado emitido e ainda não avisado recebe um aviso, uma vez só. Quem já foi avisado fica de fora.</p>
        <Message severity="info" :closable="false">A fila envia até 70 por dia, para não travar as confirmações da lista de espera.</Message>
      </template>

      <template #footer>
        <Button label="Cancelar" severity="secondary" text @click="confirmando = null" />
        <Button :label="confirmando === 'emitir' ? 'Emitir' : 'Avisar'" :loading="ocupado === confirmando" @click="confirma" />
      </template>
    </Dialog>

    <Dialog
      :visible="Boolean(revogando)"
      modal
      :draggable="false"
      header="Revogar certificado?"
      :style="{ width: '30rem', maxWidth: 'calc(100vw - 2rem)' }"
      @update:visible="revogando = null"
    >
      <template v-if="revogando">
        <p><strong>{{ revogando.nome }}</strong> · <span class="mono">{{ revogando.codigo }}</span></p>
        <p class="apoio">O validador passa a responder "revogado" para este código. Depois, use "Reemitir" na linha para criar o certo, com outro código.</p>
        <div class="campo">
          <label for="motivo">Motivo (fica no painel, não sai no validador)</label>
          <InputText id="motivo" v-model="motivo" placeholder="Ex.: nome com erro de digitação" maxlength="255" autofocus fluid />
        </div>
      </template>

      <template #footer>
        <Button label="Cancelar" severity="secondary" text @click="revogando = null" />
        <Button label="Revogar" severity="danger" :disabled="!motivo.trim()" :loading="ocupado === 'revogar'" @click="revoga" />
      </template>
    </Dialog>
  </Pagina>
</template>

<style scoped>
.acoes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

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

.numero__nota,
.apoio {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.apoio--falta {
  color: var(--brick-600);
}

.previa__botoes {
  display: flex;
  flex-wrap: wrap;
  margin-left: -0.5rem;
}

.filtro {
  flex: 0 1 14rem;
  min-width: 0;
}

.atividade-na-linha {
  width: 12rem;
}

.acoes-linha {
  display: flex;
  justify-content: flex-end;
  white-space: nowrap;
}
</style>
