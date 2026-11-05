<script setup>
import { computed, onMounted, ref } from 'vue';
import Chart from 'primevue/chart';
import ProgressBar from 'primevue/progressbar';
import Estado from '../components/Estado.vue';
import Pagina from '../components/Pagina.vue';
import { api } from '../api.js';
import { CORES_POR_TIPO, COR_UNICA, GRADE, TINTA } from '../cores.js';

const metricas = ref(null);
const erro = ref(null);

async function carrega() {
  erro.value = null;

  try {
    metricas.value = await api('/api/painel/metricas');
  } catch (e) {
    erro.value = e;
  }
}

onMounted(carrega);

function diaCurto(iso) {
  // 2026-11-05 -> 05/11, sem passar por Date (que leria como UTC e voltaria um dia).
  const [, mes, dia] = iso.split('-');
  return `${dia}/${mes}`;
}

const inscricoesPorDia = computed(() => ({
  labels: metricas.value.por_dia.map((d) => diaCurto(d.dia)),
  datasets: metricas.value.tipos.map((tipo) => ({
    label: tipo,
    data: metricas.value.por_dia.map((d) => d[tipo]),
    borderColor: CORES_POR_TIPO[tipo],
    backgroundColor: CORES_POR_TIPO[tipo],
    borderWidth: 2,
    tension: 0.3,
    // 30 pontos com marcador viram ruído; o ponto aparece no hover.
    pointRadius: 0,
    pointHoverRadius: 5,
  })),
}));

const emailsPorDia = computed(() => ({
  labels: metricas.value.emails.por_dia.map((d) => diaCurto(d.dia)),
  datasets: [{
    label: 'e-mails',
    data: metricas.value.emails.por_dia.map((d) => d.total),
    backgroundColor: COR_UNICA,
    borderRadius: 4,
    maxBarThickness: 28,
  }],
}));

function distribuicao(itens) {
  return {
    labels: itens.map((i) => i.rotulo),
    datasets: [{
      data: itens.map((i) => i.total),
      backgroundColor: COR_UNICA,
      borderRadius: 4,
      maxBarThickness: 28,
    }],
  };
}

const FONTE = { family: "'Instrument Sans', system-ui, sans-serif", size: 12 };

/** Eixos e grade recessivos; a legenda só entra quando há mais de uma série. */
function opcoes({ horizontal = false, legenda = false } = {}) {
  const valor = { ticks: { color: TINTA, font: FONTE, precision: 0 }, grid: { color: GRADE } };
  const rotulo = {
    ticks: horizontal
      ? { color: TINTA, font: FONTE }
      // 30 dias não cabem como 30 rótulos: o eixo mostra ~8, na horizontal.
      : { color: TINTA, font: FONTE, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
    grid: { display: false },
  };

  return {
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' : 'x',
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: legenda, labels: { color: TINTA, font: FONTE, usePointStyle: true, boxHeight: 8 } },
    },
    scales: horizontal ? { x: valor, y: rotulo } : { x: rotulo, y: { ...valor, beginAtZero: true } },
  };
}

const consumoDeEmail = computed(() => {
  const { hoje, limite_diario: limite } = metricas.value.emails;
  return limite ? Math.round((hoje / limite) * 100) : 0;
});
</script>

<template>
  <Pagina
    eyebrow="Evento · lista de espera"
    titulo="Métricas"
    :descricao="metricas?.tipos.length === 1
      ? `Recorte de ${metricas.tipos[0]}, conforme o seu papel.`
      : 'Como a lista de espera está crescendo e quem está chegando.'"
  >
    <Estado v-if="erro" tipo="erro" :falha="erro" @tentar="carrega" />
    <Estado v-else-if="!metricas" tipo="carregando" com-numeros />

    <template v-else>
      <section class="numeros">
        <article class="cartao numero">
          <h2 class="eyebrow numero__rotulo">Inscrições</h2>
          <strong class="numero__valor">{{ metricas.total }}</strong>
        </article>

        <article v-for="tipo in metricas.tipos" :key="tipo" class="cartao numero">
          <h2 class="eyebrow numero__rotulo">
            <span class="bolinha" :style="{ background: CORES_POR_TIPO[tipo] }" />
            {{ tipo }}
          </h2>
          <strong class="numero__valor">{{ metricas.por_tipo[tipo] ?? 0 }}</strong>
        </article>

        <article class="cartao numero">
          <h2 class="eyebrow numero__rotulo">Reenviaram o formulário</h2>
          <strong class="numero__valor">{{ metricas.reinscricoes }}</strong>
        </article>

        <article v-if="metricas.emails" class="cartao numero">
          <h2 class="eyebrow numero__rotulo">E-mails hoje</h2>
          <strong class="numero__valor">{{ metricas.emails.hoje }} <small>de {{ metricas.emails.limite_diario }}</small></strong>
          <ProgressBar :value="consumoDeEmail" :show-value="false" />
        </article>
      </section>

      <section class="cartao">
        <h2 class="cartao__titulo">Inscrições por dia</h2>
        <p class="cartao__apoio">Últimos 30 dias</p>
        <Chart
          type="line"
          :data="inscricoesPorDia"
          :options="opcoes({ legenda: metricas.tipos.length > 1 })"
          class="grafico"
        />
      </section>

      <div class="distribuicoes">
        <section v-for="d in metricas.distribuicoes" :key="d.titulo" class="cartao">
          <h2 class="cartao__titulo">{{ d.titulo }}</h2>
          <p class="cartao__apoio">{{ d.tipo }}</p>
          <Chart type="bar" :data="distribuicao(d.itens)" :options="opcoes({ horizontal: true })" class="grafico" />
        </section>
      </div>

      <section v-if="metricas.emails" class="cartao">
        <h2 class="cartao__titulo">E-mails enviados por dia</h2>
        <p class="cartao__apoio">Últimos 30 dias</p>
        <Chart type="bar" :data="emailsPorDia" :options="opcoes()" class="grafico" />
      </section>
    </template>
  </Pagina>
</template>

<style scoped>
/* auto-fit: papel que perde um cartão não deixa buraco, os outros ocupam o espaço. */
.numeros {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: var(--space-4);
}

.distribuicoes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(18.75rem, 100%), 1fr));
  gap: var(--space-4);
}

.numero {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.numero__rotulo {
  display: flex;
  gap: 0.4rem;
  align-items: center;
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

.numero :deep(.p-progressbar) {
  height: 0.4rem;
  margin-top: 0.25rem;
}

.bolinha {
  flex: none;
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
}

.grafico {
  height: 16rem;
}
</style>
