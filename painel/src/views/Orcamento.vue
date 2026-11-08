<script setup>
import { computed, ref, watch } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import Menu from 'primevue/menu';
import SelectButton from 'primevue/selectbutton';
import { useToast } from 'primevue/usetoast';
import Estado from '../components/Estado.vue';
import Pagina from '../components/Pagina.vue';
import Despesas from '../components/orcamento/Despesas.vue';
import FormDespesa from '../components/orcamento/FormDespesa.vue';
import FormReceita from '../components/orcamento/FormReceita.vue';
import PlanejarLote from '../components/orcamento/PlanejarLote.vue';
import Receitas from '../components/orcamento/Receitas.vue';
import VisaoGeral from '../components/orcamento/VisaoGeral.vue';
import { api, salvaArquivo } from '../api.js';
import { auth } from '../auth.js';
import { carregaEdicoes, falhaDasEdicoes, useEdicao } from '../edicao.js';
import { csv, dia, ETAPAS, SITUACOES_DE_DESPESA, valorCsv } from '../orcamento.js';

const toast = useToast();
const edicao = useEdicao();

const ano = computed(() => edicao.value?.ano ?? null);
const veTudo = computed(() => ['admin', 'financeiro'].includes(auth.usuario?.papel));
const editavel = computed(() => Boolean(edicao.value?.atual) || auth.usuario?.papel === 'admin');

const aba = ref(veTudo.value ? 'geral' : 'receitas');
const ABAS = [
  { valor: 'geral', rotulo: 'Visão geral' },
  { valor: 'receitas', rotulo: 'Receitas' },
  { valor: 'despesas', rotulo: 'Despesas' },
];

const dados = ref(null);
const erro = ref(null);

// Trocar de edição com uma resposta a caminho não pode pintar o dinheiro de uma
// edição na tela da outra: só a última requisição vale.
let ultimoPedido = 0;

async function carrega() {
  if (!ano.value) return;

  ultimoPedido += 1;
  const pedido = ultimoPedido;
  const base = `/api/painel/orcamento/${ano.value}`;
  erro.value = null;

  try {
    const [receitas, listaDeEspera, despesas, resumo] = await Promise.all([
      api(`${base}/receitas`),
      api(`${base}/lista-de-espera`),
      // O comercial só enxerga o funil: pedir o resto daria 403.
      veTudo.value ? api(`${base}/despesas`) : null,
      veTudo.value ? api(`${base}/resumo`) : null,
    ]);

    if (pedido !== ultimoPedido) return;

    dados.value = {
      receitas: receitas.data,
      listaDeEspera: listaDeEspera.data,
      despesas: despesas?.data ?? [],
      categorias: despesas?.categorias ?? [],
      resumo,
    };
  } catch (e) {
    if (pedido === ultimoPedido) erro.value = e;
  }
}

const semLancamentos = computed(() => dados.value && !dados.value.receitas.length && !dados.value.despesas.length);

const form = ref(null);
const lote = ref(null);
const copiando = ref(false);
const reajuste = ref(8);

const anterior = computed(() => dados.value?.resumo?.anterior ?? null);
const temBaseParaCopia = computed(() => anterior.value && Object.keys(anterior.value.por_categoria).length > 0);

function aoCriarLote() {
  lote.value = null;
  aba.value = 'despesas';
  carrega();
}

function revisarCopia() {
  lote.value = {
    ano: anterior.value.ano,
    reajuste: reajuste.value ?? 0,
    por_categoria: anterior.value.por_categoria,
  };
  copiando.value = false;
}

async function mover(receita, etapa) {
  try {
    await api(`/api/painel/orcamento/receitas/${receita.id}`, { metodo: 'PATCH', corpo: { status: etapa } });
    toast.add({ severity: 'success', summary: 'Etapa atualizada', detail: `${receita.patrocinador}: ${ETAPAS.find((e) => e.valor === etapa).rotulo}`, life: 3000 });
    await carrega();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Não deu para mover', detail: e.message, life: 5000 });
  }
}

function exportar() {
  const nome = `orcamento-${ano.value}`;
  const situacao = (d) => SITUACOES_DE_DESPESA[d.vencida ? 'vencido' : d.status];

  salvaArquivo(csv(
    ['Categoria', 'Descrição', 'Fornecedor', 'Responsável', 'Orçado', 'Realizado', 'Status', 'Vencimento', 'Anotações'],
    dados.value.despesas.map((d) => [d.categoria, d.descricao, d.fornecedor, d.responsavel, valorCsv(d.orcado_centavos), valorCsv(d.realizado_centavos), situacao(d), d.vencimento ? dia(d.vencimento) : '', d.anotacoes ?? '']),
  ), `${nome}-despesas.csv`);

  salvaArquivo(csv(
    ['Patrocinador', 'Cota', 'Valor', 'Etapa', 'Previsto', 'Recebido'],
    dados.value.receitas.map((r) => [r.patrocinador, r.cota, valorCsv(r.valor_centavos), ETAPAS.find((e) => e.valor === r.status).rotulo, r.pagamento_previsto ? dia(r.pagamento_previsto) : '', r.recebido_em ? dia(r.recebido_em) : '']),
  ), `${nome}-receitas.csv`);
}

const menuDePlanejamento = ref();
const opcoesDePlanejamento = computed(() => [
  { label: 'Criar despesas em lote', icon: 'pi pi-list', command: () => { lote.value = { reajuste: 0, por_categoria: {} }; } },
  ...(temBaseParaCopia.value ? [{ label: `Copiar orçamento de ${anterior.value.ano}`, icon: 'pi pi-copy', command: () => { copiando.value = true; } }] : []),
  { label: 'Exportar CSV', icon: 'pi pi-download', command: exportar },
]);

const descricao = computed(() => {
  if (!veTudo.value) return 'Seu papel vê as receitas de patrocínio. Despesas e saldo ficam com financeiro e admin.';
  if (!edicao.value?.atual) {
    return auth.usuario?.papel === 'admin'
      ? 'Edição encerrada. Como admin, você ainda lança o histórico dela, de onde saem o comparativo e a cópia.'
      : 'Edição encerrada: valores congelados para consulta e comparação.';
  }
  return 'Receitas de patrocínio, despesas por categoria e o saldo da edição em foco.';
});

// Roda de cara e a cada troca; `ano` é null até a lista de edições chegar.
watch(ano, () => {
  dados.value = null;
  lote.value = null;
  form.value = null;
  carrega();
}, { immediate: true });
</script>

<template>
  <PlanejarLote
    v-if="lote && dados"
    :ano="ano"
    :categorias="dados.categorias"
    :base="lote.ano ? lote : null"
    @voltar="lote = null"
    @criadas="aoCriarLote"
  />

  <Pagina
    v-else
    :eyebrow="ano ? `Finanças · edição ${ano}` : 'Finanças'"
    :titulo="veTudo ? 'Orçamento' : 'Funil de patrocínio'"
    :descricao="descricao"
  >
    <template v-if="dados && editavel" #acoes>
      <div class="acoes">
        <template v-if="veTudo">
          <Button
            label="Planejamento"
            icon="pi pi-angle-down"
            icon-pos="right"
            severity="secondary"
            text
            size="small"
            aria-haspopup="true"
            @click="menuDePlanejamento.toggle($event)"
          />
          <Menu ref="menuDePlanejamento" :model="opcoesDePlanejamento" popup />
          <Button label="Despesa" icon="pi pi-plus" severity="secondary" outlined size="small" @click="form = { tipo: 'despesa' }" />
        </template>
        <Button label="Receita" icon="pi pi-plus" size="small" @click="form = { tipo: 'receita' }" />
      </div>
    </template>

    <Estado v-if="falhaDasEdicoes" tipo="erro" :falha="falhaDasEdicoes" @tentar="carregaEdicoes" />
    <Estado v-else-if="erro" tipo="erro" :falha="erro" @tentar="carrega" />
    <Estado v-else-if="!dados" tipo="carregando" com-numeros />

    <template v-else>
      <div v-if="!editavel" class="so-leitura">
        <i class="pi pi-lock" />
        Somente leitura. Para editar, volte para a edição atual no seletor do topo.
      </div>

      <!-- Sem lançamento nenhum, o que importa é por onde começar. -->
      <section v-if="semLancamentos && editavel && veTudo" class="cartao comeco">
        <span class="comeco__icone"><i class="pi pi-wallet" /></span>
        <div>
          <h2 class="comeco__titulo">Edição {{ ano }} ainda não tem orçamento</h2>
          <p class="cartao__apoio">Escolha um ponto de partida. Dá para ajustar tudo depois.</p>
        </div>

        <div class="comeco__opcoes">
          <button type="button" class="comeco__opcao" :class="{ 'comeco__opcao--recomendada': temBaseParaCopia }" :disabled="!temBaseParaCopia" @click="copiando = true">
            <i class="pi pi-copy" />
            <strong>{{ anterior ? `Copiar de ${anterior.ano}` : 'Copiar da edição anterior' }}</strong>
            <span>
              {{ temBaseParaCopia ? 'Categorias e valores da edição passada, com reajuste.' : 'Ainda não há despesas lançadas na edição anterior.' }}
            </span>
          </button>
          <button type="button" class="comeco__opcao" @click="lote = { reajuste: 0, por_categoria: {} }">
            <i class="pi pi-list" />
            <strong>Planejar em lote</strong>
            <span>Uma linha por categoria, valores em branco.</span>
          </button>
          <button type="button" class="comeco__opcao" @click="form = { tipo: 'despesa' }">
            <i class="pi pi-plus" />
            <strong>Começar do zero</strong>
            <span>Lançar receitas e despesas uma a uma.</span>
          </button>
        </div>
      </section>

      <template v-else>
        <SelectButton
          v-if="veTudo"
          v-model="aba"
          :options="ABAS"
          option-label="rotulo"
          option-value="valor"
          :allow-empty="false"
          aria-label="Seção do orçamento"
          class="abas"
        />

        <VisaoGeral
          v-if="aba === 'geral'"
          :resumo="dados.resumo"
          :ano="ano"
          :total-receitas="dados.receitas.length"
          :total-despesas="dados.despesas.length"
          @ver-despesas="aba = 'despesas'"
        />
        <Receitas
          v-else-if="aba === 'receitas'"
          :receitas="dados.receitas"
          :lista-de-espera="dados.listaDeEspera"
          :editavel="editavel"
          @editar="form = { tipo: 'receita', item: $event }"
          @mover="mover"
          @da-lista="form = { tipo: 'receita', candidato: $event }"
        />
        <Despesas
          v-else
          :despesas="dados.despesas"
          :categorias="dados.categorias"
          :editavel="editavel"
          @editar="form = { tipo: 'despesa', item: $event }"
        />
      </template>
    </template>

    <FormReceita
      v-if="form?.tipo === 'receita'"
      :ano="ano"
      :item="form.item"
      :candidato="form.candidato"
      @fechar="form = null"
      @salvo="carrega"
    />
    <FormDespesa
      v-if="form?.tipo === 'despesa'"
      :ano="ano"
      :item="form.item"
      :categorias="dados.categorias"
      @fechar="form = null"
      @salvo="carrega"
    />

    <Dialog
      v-model:visible="copiando"
      modal
      :draggable="false"
      :header="`Copiar orçamento de ${anterior?.ano}`"
      :style="{ width: '30rem', maxWidth: 'calc(100vw - 2rem)' }"
    >
      <p class="copia__texto">
        As despesas de {{ anterior?.ano }}, por categoria, entram como ponto de partida para {{ ano }}.
        Nada é salvo até você revisar.
      </p>

      <div class="campo">
        <label for="copia-reajuste">Reajustar valores</label>
        <InputNumber v-model="reajuste" input-id="copia-reajuste" suffix="%" :min="-100" :max="500" show-buttons />
      </div>

      <template #footer>
        <Button label="Cancelar" severity="secondary" text @click="copiando = false" />
        <Button label="Revisar no planejamento em lote" icon="pi pi-angle-right" icon-pos="right" @click="revisarCopia" />
      </template>
    </Dialog>
  </Pagina>
</template>

<style scoped>
.acoes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
}

.abas {
  align-self: flex-start;
}

.so-leitura {
  display: flex;
  gap: 0.625rem;
  align-items: center;
  padding: 0.625rem 0.875rem;
  font-size: 0.84375rem;
  color: var(--espresso-800);
  background: var(--sand-200);
  border-radius: var(--radius-md);
}

.comeco {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  align-items: center;
  padding-block: var(--space-8);
  text-align: center;
}

.comeco__icone {
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  font-size: var(--text-xl);
  color: var(--amber-700);
  background: var(--amber-100);
  border-radius: 50%;
}

.comeco__titulo {
  margin-bottom: 0.375rem;
  font-size: var(--text-xl);
  font-weight: var(--fw-semibold);
}

.comeco .cartao__apoio {
  margin: 0;
}

.comeco__opcoes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(13rem, 100%), 14rem));
  gap: var(--space-3);
  justify-content: center;
  width: 100%;
}

.comeco__opcao {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  font-family: var(--font-body);
  font-size: 0.8125rem;
  color: var(--text-muted);
  text-align: left;
  cursor: pointer;
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
}

.comeco__opcao:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.comeco__opcao strong {
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: var(--fw-semibold);
  color: var(--text-strong);
}

.comeco__opcao--recomendada {
  border: 2px solid var(--border-ink);
  box-shadow: var(--shadow-badge-sm);
}

.copia__texto {
  margin: 0 0 var(--space-4);
  font-size: var(--text-sm);
}
</style>
