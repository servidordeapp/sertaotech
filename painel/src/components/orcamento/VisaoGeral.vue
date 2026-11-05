<script setup>
import { computed } from 'vue';
import Button from 'primevue/button';
import Chart from 'primevue/chart';
import { CORES_ORCAMENTO, GRADE, TINTA } from '../../cores.js';
import { brl, brlCurto, dia } from '../../orcamento.js';
import BarraExecucao from './BarraExecucao.vue';

const props = defineProps({
  resumo: { type: Object, required: true },
  ano: { type: Number, required: true },
  totalReceitas: { type: Number, required: true },
  totalDespesas: { type: Number, required: true },
});

defineEmits(['ver-despesas']);

const estouradas = computed(() => props.resumo.categorias.filter((c) => c.comprometido > c.orcado));
const negativo = computed(() => props.resumo.saldo_projetado < 0);

function largura(valor, teto) {
  return `${teto ? (valor / teto) * 100 : 0}%`;
}

const blocos = computed(() => [
  {
    titulo: 'Receita',
    icone: 'pi-arrow-up-right',
    cor: CORES_ORCAMENTO.receita,
    apoio: `${props.totalReceitas} no funil`,
    linhas: [
      ['Prevista', props.resumo.receita_prevista],
      ['Contratada', props.resumo.receita_contratada],
      ['Recebida', props.resumo.receita_recebida],
    ],
  },
  {
    titulo: 'Despesa',
    icone: 'pi-arrow-down-right',
    cor: CORES_ORCAMENTO.despesa,
    apoio: `${props.totalDespesas} ${props.totalDespesas === 1 ? 'item' : 'itens'} em ${props.resumo.categorias.length} categorias`,
    linhas: [
      ['Orçada', props.resumo.despesa_orcada],
      ['Comprometida', props.resumo.despesa_comprometida],
      ['Paga', props.resumo.despesa_paga],
    ],
  },
]);

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const mes = (chave) => {
  const [ano, numero] = chave.split('-');
  return `${MESES[Number(numero) - 1]}/${ano.slice(2)}`;
};

const evolucao = computed(() => {
  const dados = props.resumo.evolucao;
  const serie = (rotulo, valores, cor, previsto) => ({
    label: rotulo,
    data: valores,
    borderColor: cor,
    backgroundColor: cor,
    borderWidth: 2,
    borderDash: previsto ? [6, 5] : [],
    pointRadius: 0,
    pointHoverRadius: 5,
    tension: 0,
  });

  return {
    labels: dados.meses.map(mes),
    datasets: [
      serie('Receita', dados.receita, CORES_ORCAMENTO.receita, false),
      serie('Receita prevista', dados.receita_prevista, CORES_ORCAMENTO.receita, true),
      serie('Despesa', dados.despesa, CORES_ORCAMENTO.despesa, false),
      serie('Despesa prevista', dados.despesa_prevista, CORES_ORCAMENTO.despesa, true),
    ],
  };
});

const FONTE = { family: "'Instrument Sans', system-ui, sans-serif", size: 12 };

const opcoesDoGrafico = {
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { labels: { color: TINTA, font: FONTE, usePointStyle: true, pointStyle: 'line' } },
    tooltip: {
      filter: (item) => item.raw !== null,
      callbacks: { label: (item) => `${item.dataset.label}: ${brl(item.raw)}` },
    },
  },
  scales: {
    x: { ticks: { color: TINTA, font: FONTE, maxRotation: 0, autoSkip: true }, grid: { display: false } },
    y: {
      beginAtZero: true,
      ticks: { color: TINTA, font: FONTE, callback: (valor) => brlCurto(valor) },
      grid: { color: GRADE },
    },
  },
};

// Linha do "hoje": é o que separa o que aconteceu do que ainda é promessa.
const marcaDeHoje = computed(() => [{
  id: 'marcaDeHoje',
  afterDatasetsDraw(grafico) {
    const { ctx, chartArea, scales } = grafico;
    const x = scales.x.getPixelForValue(props.resumo.evolucao.indice_hoje);

    ctx.save();
    ctx.strokeStyle = TINTA;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(x, chartArea.top);
    ctx.lineTo(x, chartArea.bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = TINTA;
    ctx.font = "11px 'Space Mono', monospace";
    ctx.fillText('HOJE', x + 6, chartArea.top + 10);
    ctx.restore();
  },
}]);

const anterior = computed(() => props.resumo.anterior);

// Mais receita é bom; mais despesa, não. Sem base não há o que comparar.
function variacao(antes, agora, maiorEBom) {
  if (agora == null || !antes) return null;
  const fracao = (agora - antes) / antes;

  return {
    texto: `${fracao >= 0 ? '+' : '−'}${Math.abs(Math.round(fracao * 100))}%`,
    bom: (fracao >= 0) === maiorEBom,
  };
}

const comparativo = computed(() => {
  if (!anterior.value) return [];
  const { ate_esta_data: ponto } = anterior.value;
  const hoje = props.resumo.ate_hoje;

  return [
    { rotulo: 'Receita até esta data', antes: ponto.receita, agora: hoje.receita, maiorEBom: true },
    { rotulo: 'Despesa paga até esta data', antes: ponto.despesa, agora: hoje.despesa, maiorEBom: false },
    { rotulo: 'Orçado total', antes: anterior.value.orcado, agora: props.resumo.despesa_orcada, maiorEBom: false },
    { rotulo: 'Receita final', antes: anterior.value.receita_recebida, agora: null },
    { rotulo: 'Despesa final', antes: anterior.value.despesa_paga, agora: null },
  ].map((linha) => ({ ...linha, variacao: variacao(linha.antes, linha.agora, linha.maiorEBom) }));
});
</script>

<template>
  <div class="geral">
    <div v-if="estouradas.length" class="alerta" role="alert">
      <span class="alerta__texto">
        <i class="pi pi-exclamation-triangle" />
        <span>
          <strong>{{ estouradas.map((c) => c.categoria).join(', ') }} {{ estouradas.length === 1 ? 'estourou' : 'estouraram' }} o orçado</strong>
          — comprometido {{ brl(estouradas[0].comprometido) }} de {{ brl(estouradas[0].orcado) }}.
        </span>
      </span>
      <Button label="Ver despesas" severity="danger" outlined size="small" @click="$emit('ver-despesas')" />
    </div>

    <div class="trio">
      <section v-for="bloco in blocos" :key="bloco.titulo" class="cartao bloco">
        <div class="eyebrow bloco__titulo"><i class="pi" :class="bloco.icone" /> {{ bloco.titulo }}</div>
        <div v-for="([rotulo, valor], i) in bloco.linhas" :key="rotulo" class="bloco__linha">
          <span class="bloco__rotulo" :class="{ 'bloco__rotulo--forte': i === 2 }">{{ rotulo }}</span>
          <strong class="bloco__valor" :class="{ 'bloco__valor--maior': i === 0 }">{{ brl(valor) }}</strong>
          <span class="bloco__trilho">
            <span
              class="bloco__preenchido"
              :style="{ width: largura(valor, bloco.linhas[0][1]), background: bloco.cor, opacity: 0.35 + i * 0.32 }"
            />
          </span>
          <span v-if="i === 0" class="bloco__apoio">{{ bloco.apoio }}</span>
        </div>
      </section>

      <section class="cartao saldo" :class="{ 'saldo--negativo': negativo }">
        <div class="eyebrow saldo__rotulo">Saldo projetado</div>
        <strong class="saldo__valor">
          <i v-if="negativo" class="pi pi-exclamation-triangle" />
          {{ negativo ? '−' : '' }}{{ brl(Math.abs(resumo.saldo_projetado)) }}
        </strong>
        <span class="saldo__apoio">receita contratada − despesa orçada</span>

        <dl class="saldo__lista">
          <div>
            <dt>Margem</dt>
            <dd :class="negativo ? 'saldo__ruim' : 'saldo__bom'">
              {{ resumo.margem === null ? '—' : `${negativo ? '−' : ''}${Math.abs(Math.round(resumo.margem * 100))}%` }}
            </dd>
          </div>
          <div>
            <dt>Em caixa hoje</dt>
            <dd>{{ resumo.caixa < 0 ? '−' : '' }}{{ brl(Math.abs(resumo.caixa)) }}</dd>
          </div>
        </dl>

        <p v-if="negativo" class="saldo__ruim saldo__nota">
          Faltam {{ brl(-resumo.saldo_projetado) }} em patrocínio contratado para fechar no zero.
        </p>
      </section>
    </div>

    <section v-if="resumo.categorias.length" class="cartao">
      <h2 class="cartao__titulo">Execução orçamentária</h2>
      <p class="cartao__apoio">Quanto do orçado já está comprometido</p>

      <BarraExecucao
        :orcado="resumo.despesa_orcada"
        :comprometido="resumo.despesa_comprometida"
        :pago="resumo.despesa_paga"
        legenda
      />

      <div class="categorias">
        <BarraExecucao
          v-for="c in resumo.categorias"
          :key="c.categoria"
          compacta
          :rotulo="c.categoria"
          :orcado="c.orcado"
          :comprometido="c.comprometido"
          :pago="c.pago"
        />
      </div>
    </section>

    <div class="dupla">
      <section class="cartao">
        <h2 class="cartao__titulo">Entradas × saídas</h2>
        <p class="cartao__apoio">Acumulado por mês · tracejado = previsto</p>

        <Chart
          v-if="resumo.evolucao.meses.length"
          type="line"
          :data="evolucao"
          :options="opcoesDoGrafico"
          :plugins="marcaDeHoje"
          class="grafico"
        />
        <p v-else class="cartao__apoio">O gráfico aparece quando houver lançamento com data.</p>
      </section>

      <section class="cartao">
        <template v-if="anterior">
          <h2 class="cartao__titulo">Comparativo com {{ anterior.ano }}</h2>
          <p class="cartao__apoio">"Até esta data" em {{ anterior.ano }} é até {{ dia(anterior.ate_esta_data.data) }}</p>

          <table class="comparativo">
            <thead>
              <tr>
                <th scope="col"><span class="visualmente-oculto">Indicador</span></th>
                <th scope="col">{{ anterior.ano }}</th>
                <th scope="col">{{ ano }}</th>
                <th scope="col">Δ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="linha in comparativo" :key="linha.rotulo">
                <th scope="row">{{ linha.rotulo }}</th>
                <td class="comparativo__antes">{{ brlCurto(linha.antes) }}</td>
                <td class="comparativo__agora">{{ linha.agora === null ? '—' : brlCurto(linha.agora) }}</td>
                <td :class="linha.variacao && (linha.variacao.bom ? 'saldo__bom' : 'saldo__ruim')">{{ linha.variacao?.texto }}</td>
              </tr>
            </tbody>
          </table>
        </template>

        <template v-else>
          <h2 class="cartao__titulo">Comparativo</h2>
          <p class="cartao__apoio">Esta é a primeira edição lançada: ainda não há com o que comparar.</p>
        </template>
      </section>
    </div>
  </div>
</template>

<style scoped>
.geral {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.alerta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-3) var(--space-4);
  color: var(--brick-600);
  background: var(--brick-100);
  border: 1.5px solid var(--brick-500);
  border-radius: 0.875rem;
}

.alerta__texto {
  display: flex;
  flex: 1 1 16rem;
  gap: 0.625rem;
  align-items: center;
  font-size: var(--text-sm);
}

.trio {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(17rem, 100%), 1fr));
  gap: var(--space-4);
}

.bloco {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.bloco__titulo {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.bloco__linha {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--space-1) var(--space-3);
  align-items: baseline;
}

.bloco__rotulo {
  font-size: 0.84375rem;
  color: var(--espresso-700);
}

.bloco__rotulo--forte {
  font-weight: var(--fw-bold);
  color: var(--text-strong);
}

.bloco__valor,
.saldo__valor {
  font-family: var(--font-display);
  font-weight: var(--fw-bold);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  color: var(--text-strong);
}

.bloco__valor {
  font-size: var(--text-lg);
}

.bloco__valor--maior {
  font-size: var(--text-2xl);
}

.bloco__trilho {
  grid-column: 1 / -1;
  height: 0.375rem;
  overflow: hidden;
  background: var(--chart-grid, rgba(107, 69, 38, 0.12));
  border-radius: var(--radius-pill);
}

.bloco__preenchido {
  display: block;
  height: 100%;
  border-radius: var(--radius-pill);
}

.bloco__apoio {
  grid-column: 1 / -1;
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.saldo {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

/* Sinal, ícone, borda e sombra: saldo negativo não pode passar batido. */
.saldo--negativo {
  border: 1.5px solid var(--brick-500);
  box-shadow: 3px 3px 0 var(--brick-500);
}

.saldo--negativo .saldo__rotulo,
.saldo--negativo .saldo__valor {
  color: var(--brick-600);
}

.saldo__valor {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  font-size: var(--text-3xl);
  line-height: 1.1;
}

.saldo__apoio {
  font-size: 0.78125rem;
  color: var(--text-muted);
}

.saldo__lista {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-top: var(--space-3);
  margin: var(--space-2) 0 0;
  border-top: 1px solid var(--border-subtle);
}

.saldo__lista div {
  display: flex;
  justify-content: space-between;
  font-size: 0.84375rem;
}

.saldo__lista dd {
  margin: 0;
  font-weight: var(--fw-bold);
  font-variant-numeric: tabular-nums;
}

.saldo__bom {
  font-weight: var(--fw-bold);
  color: var(--cactus-600);
}

.saldo__ruim {
  font-weight: var(--fw-bold);
  color: var(--brick-600);
}

.saldo__nota {
  margin: var(--space-1) 0 0;
  font-size: 0.78125rem;
}

.categorias {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr));
  gap: var(--space-4) var(--space-6);
  margin-top: var(--space-5);
}

.dupla {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: var(--space-4);
}

.grafico {
  height: 16rem;
}

.comparativo {
  width: 100%;
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  border-collapse: collapse;
}

.comparativo th,
.comparativo td {
  padding: 0.625rem 0 0.625rem var(--space-2);
  text-align: right;
  border-bottom: 1px solid var(--border-subtle);
}

.comparativo thead th {
  padding-top: 0;
  font-family: var(--font-mono);
  font-size: 0.625rem;
  font-weight: 400;
  letter-spacing: 0.12em;
  color: var(--text-muted);
}

.comparativo tbody th {
  padding-left: 0;
  font-weight: 400;
  text-align: left;
}

.comparativo__antes {
  color: var(--text-muted);
}

.comparativo__agora {
  font-weight: var(--fw-bold);
  color: var(--text-strong);
}

.visualmente-oculto {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

@media (max-width: 60rem) {
  .dupla {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
