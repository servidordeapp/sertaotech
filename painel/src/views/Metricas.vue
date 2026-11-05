<script setup>
import { computed, onMounted, ref } from 'vue';
import Chart from 'primevue/chart';
import ProgressBar from 'primevue/progressbar';
import { useToast } from 'primevue/usetoast';
import { api } from '../api.js';
import { CORES_POR_TIPO, COR_UNICA, GRADE, TINTA } from '../cores.js';

const toast = useToast();
const metricas = ref(null);

onMounted(async () => {
  try {
    metricas.value = await api('/api/painel/metricas');
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Não deu para carregar', detail: e.message, life: 5000 });
  }
});

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

/** Eixos e grade recessivos; a legenda só entra quando há mais de uma série. */
function opcoes({ horizontal = false, legenda = false } = {}) {
  const valor = { ticks: { color: TINTA, precision: 0 }, grid: { color: GRADE } };
  const rotulo = {
    ticks: horizontal
      ? { color: TINTA }
      // 30 dias não cabem como 30 rótulos: o eixo mostra ~8, na horizontal.
      : { color: TINTA, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
    grid: { display: false },
  };

  return {
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' : 'x',
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: legenda, labels: { color: TINTA, usePointStyle: true } },
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
  <div v-if="metricas" class="metricas">
    <section class="numeros">
      <article class="numero">
        <h2>Inscrições</h2>
        <strong>{{ metricas.total }}</strong>
      </article>

      <article v-for="tipo in metricas.tipos" :key="tipo" class="numero">
        <h2>
          <span class="bolinha" :style="{ background: CORES_POR_TIPO[tipo] }" />
          {{ tipo }}
        </h2>
        <strong>{{ metricas.por_tipo[tipo] ?? 0 }}</strong>
      </article>

      <article class="numero">
        <h2>Reenviaram o formulário</h2>
        <strong>{{ metricas.reinscricoes }}</strong>
      </article>

      <article v-if="metricas.emails" class="numero">
        <h2>E-mails hoje</h2>
        <strong>{{ metricas.emails.hoje }} <small>de {{ metricas.emails.limite_diario }}</small></strong>
        <ProgressBar :value="consumoDeEmail" :show-value="false" />
      </article>
    </section>

    <section class="cartao">
      <h2>Inscrições por dia <small>· últimos 30 dias</small></h2>
      <Chart
        type="line"
        :data="inscricoesPorDia"
        :options="opcoes({ legenda: metricas.tipos.length > 1 })"
        class="grafico"
      />
    </section>

    <section v-for="d in metricas.distribuicoes" :key="d.titulo" class="cartao">
      <h2>{{ d.titulo }} <small>· {{ d.tipo }}</small></h2>
      <Chart type="bar" :data="distribuicao(d.itens)" :options="opcoes({ horizontal: true })" class="grafico" />
    </section>

    <section v-if="metricas.emails" class="cartao">
      <h2>E-mails enviados por dia <small>· últimos 30 dias</small></h2>
      <Chart type="bar" :data="emailsPorDia" :options="opcoes()" class="grafico" />
    </section>
  </div>
</template>

<style scoped>
.metricas {
  display: grid;
  gap: 1rem;
}

.numeros {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 1rem;
}

.numero,
.cartao {
  padding: 1rem 1.25rem;
  background: #fbf6ea;
  border: 1px solid #eedcb2;
  border-radius: 12px;
}

.numero h2,
.cartao h2 {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0 0.35rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6b4526;
}

.numero strong {
  font-size: 2rem;
  line-height: 1;
  color: #2a1908;
}

.numero small {
  font-size: 0.9rem;
  font-weight: 400;
  color: #6b4526;
}

.numero :deep(.p-progressbar) {
  height: 0.4rem;
  margin-top: 0.6rem;
}

.cartao h2 small {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 400;
}

.bolinha {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
}

.grafico {
  height: 16rem;
}

@media (min-width: 60rem) {
  .metricas {
    grid-template-columns: 1fr 1fr;
  }

  .numeros,
  .cartao:first-of-type {
    grid-column: 1 / -1;
  }
}
</style>
