<script setup>
import { computed, ref, watch } from 'vue';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Tag from 'primevue/tag';
import Estado from '../components/Estado.vue';
import Pagina from '../components/Pagina.vue';
import { api } from '../api.js';
import { falhaDasEdicoes, carregaEdicoes, useEdicao } from '../edicao.js';
import { dataHora } from '../formato.js';

const SEVERIDADE_DO_RETORNO = { Sim: 'success', 'Em parte': 'warn', Não: 'danger' };

const edicao = useEdicao();
const ano = computed(() => edicao.value?.ano ?? null);

const linhas = ref(null);
const resumo = ref(null);
const erro = ref(null);
const expandidas = ref({});

// Resposta atrasada de outra edição não pode sobrescrever a tela atual.
let requisicao = 0;

async function carrega() {
  if (!ano.value) return;

  const atual = ++requisicao;
  linhas.value = null;
  erro.value = null;

  try {
    const resposta = await api(`/api/painel/feedbacks/${ano.value}`);

    if (atual !== requisicao) return;

    linhas.value = resposta.data;
    resumo.value = resposta.resumo;
  } catch (e) {
    if (atual === requisicao) erro.value = e;
  }
}

watch(ano, carrega, { immediate: true });

// NPS vai de -100 a 100: sinal explícito para não ler "25" como nota.
const nps = computed(() => {
  const valor = resumo.value?.nps;
  if (valor === null || valor === undefined) return '—';
  return valor > 0 ? `+${valor}` : String(valor);
});
</script>

<template>
  <Pagina
    eyebrow="Evento · patrocinadores"
    titulo="Feedback"
    descricao="Respostas de quem patrocinou, pelo formulário em osertaotech.com.br/2026/patrocinio/feedback."
  >
    <Estado v-if="falhaDasEdicoes" tipo="erro" :falha="falhaDasEdicoes" @tentar="carregaEdicoes" />
    <Estado v-else-if="erro" tipo="erro" :falha="erro" @tentar="carrega" />
    <Estado v-else-if="!linhas" tipo="carregando" com-numeros />

    <template v-else>
      <section class="numeros">
        <article class="cartao numero">
          <h2 class="eyebrow numero__rotulo">Empresas que responderam</h2>
          <strong class="numero__valor">{{ resumo.empresas }} <small>de {{ resumo.patrocinadores }}</small></strong>
        </article>
        <article class="cartao numero">
          <h2 class="eyebrow numero__rotulo">Nota média</h2>
          <strong class="numero__valor">{{ resumo.nota_media ?? '—' }} <small v-if="resumo.nota_media !== null">de 10</small></strong>
        </article>
        <article class="cartao numero">
          <h2 class="eyebrow numero__rotulo">NPS</h2>
          <strong class="numero__valor">{{ nps }}</strong>
          <small class="numero__nota">De -100 a +100</small>
        </article>
        <article class="cartao numero">
          <h2 class="eyebrow numero__rotulo">Querem voltar</h2>
          <strong class="numero__valor">{{ resumo.querem_voltar }}</strong>
          <small class="numero__nota">Responderam "Sim" para a próxima edição</small>
        </article>
      </section>

      <section class="cartao cartao--tabela">
        <DataTable v-model:expanded-rows="expandidas" :value="linhas" data-key="id">
          <template #empty>
            <Estado
              tipo="vazio"
              titulo="Nenhuma resposta nesta edição"
              texto="Quem responder ao formulário aparece aqui."
            />
          </template>

          <Column expander style="width: 3rem" />
          <Column field="empresa" header="Empresa">
            <template #body="{ data }"><strong>{{ data.empresa }}</strong></template>
          </Column>
          <Column field="nota" header="Nota" />
          <Column field="retorno" header="Retorno">
            <template #body="{ data }">
              <Tag :value="data.retorno" :severity="SEVERIDADE_DO_RETORNO[data.retorno]" />
            </template>
          </Column>
          <Column field="interesse" header="Interesse na próxima edição" />
          <Column field="enviado_em" header="Enviado em">
            <template #body="{ data }">{{ dataHora(data.enviado_em) }}</template>
          </Column>

          <template #expansion="{ data }">
            <dl class="dados">
              <div>
                <dt>Teve mais valor</dt>
                <dd>{{ data.mais_valor.join(' · ') }}</dd>
              </div>
              <div>
                <dt>O que faltou ou poderia melhorar</dt>
                <dd class="texto">{{ data.melhorias ?? '—' }}</dd>
              </div>
              <div>
                <dt>Depoimento (publicação autorizada)</dt>
                <dd class="texto">{{ data.depoimento ?? '—' }}</dd>
              </div>
            </dl>
          </template>
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

/* Texto livre: mantém as quebras de linha que a pessoa digitou. */
.texto {
  white-space: pre-line;
}
</style>
