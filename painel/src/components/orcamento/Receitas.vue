<script setup>
import { computed, ref } from 'vue';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Menu from 'primevue/menu';
import SelectButton from 'primevue/selectbutton';
import AcoesAnexo from './AcoesAnexo.vue';
import { brl, brlCurto, dia, ETAPAS } from '../../orcamento.js';
import TagFunil from './TagFunil.vue';

const props = defineProps({
  receitas: { type: Array, required: true },
  listaDeEspera: { type: Array, required: true },
  editavel: { type: Boolean, required: true },
});

const emit = defineEmits(['editar', 'mover', 'da-lista']);

const vista = ref('funil');
const expandidas = ref({});
const etapaNoCelular = ref(ETAPAS[0].valor);

const noFunil = computed(() => props.receitas.reduce((soma, r) => soma + r.valor_centavos, 0));

const colunas = computed(() => ETAPAS.map((etapa) => {
  const itens = props.receitas.filter((r) => r.status === etapa.valor);

  return { ...etapa, itens, soma: itens.reduce((soma, r) => soma + r.valor_centavos, 0) };
}));

const opcoesDeEtapaNoCelular = computed(() => colunas.value.map((c) => ({ valor: c.valor, rotulo: `${c.rotulo} ${c.itens.length}` })));

// Um menu só, reaproveitado: um por cartão pesaria a tela à toa.
const menu = ref();
const alvo = ref(null);
const opcoesDeMover = computed(() => [{
  label: 'Mover para',
  items: ETAPAS
    .filter((etapa) => etapa.valor !== alvo.value?.status)
    .map((etapa) => ({ label: etapa.rotulo, command: () => emit('mover', alvo.value, etapa.valor) })),
}]);

function abreMenu(evento, receita) {
  alvo.value = receita;
  menu.value.toggle(evento);
}

const ROTULO_DE_ETAPA = Object.fromEntries(ETAPAS.map((etapa) => [etapa.valor, etapa.rotulo]));
</script>

<template>
  <div class="receitas">
    <div class="receitas__topo">
      <SelectButton
        v-model="vista"
        :options="[{ rotulo: 'Funil', valor: 'funil' }, { rotulo: 'Tabela', valor: 'tabela' }]"
        option-label="rotulo"
        option-value="valor"
        :allow-empty="false"
        aria-label="Forma de ver as receitas"
      />
      <span class="receitas__soma">{{ receitas.length }} no funil · {{ brl(noFunil) }}</span>
    </div>

    <section v-if="listaDeEspera.length" class="cartao">
      <h2 class="cartao__titulo">Da lista de espera</h2>
      <p class="cartao__apoio">Quem preencheu o formulário de patrocínio no site. Vira receita prevista depois de você conferir cota e valor.</p>

      <ul class="lista">
        <li v-for="candidato in listaDeEspera" :key="candidato.id" class="lista__item">
          <strong>{{ candidato.empresa }}</strong>
          <span v-if="candidato.cota" class="mono lista__cota">cota pretendida: {{ candidato.cota }}</span>
          <span class="lista__acao">
            <TagFunil v-if="candidato.etapa" :etapa="candidato.etapa" />
            <Button
              v-else-if="editavel"
              label="Adicionar ao funil"
              icon="pi pi-plus"
              size="small"
              severity="secondary"
              @click="$emit('da-lista', candidato)"
            />
          </span>
        </li>
      </ul>
    </section>

    <section v-if="vista === 'tabela'" class="cartao cartao--tabela">
      <DataTable v-model:expanded-rows="expandidas" :value="receitas" data-key="id">
        <template #empty>Nenhuma receita lançada nesta edição.</template>

        <Column expander style="width: 3rem" />
        <Column field="patrocinador" header="Patrocinador">
          <template #body="{ data }"><strong>{{ data.patrocinador }}</strong></template>
        </Column>
        <Column field="cota" header="Cota" />
        <Column field="valor_centavos" header="Valor" header-class="coluna-valor" body-class="coluna-valor">
          <template #body="{ data }"><strong>{{ brl(data.valor_centavos) }}</strong></template>
        </Column>
        <Column field="status" header="Etapa">
          <template #body="{ data }"><TagFunil :etapa="data.status" /></template>
        </Column>
        <Column field="pagamento_previsto" header="Previsto">
          <template #body="{ data }">{{ dia(data.pagamento_previsto) }}</template>
        </Column>
        <Column field="recebido_em" header="Recebido">
          <template #body="{ data }">{{ dia(data.recebido_em) }}</template>
        </Column>

        <template #expansion="{ data }">
          <div class="receitas__detalhe">
            <Button v-if="editavel" label="Editar receita" icon="pi pi-pencil" size="small" severity="secondary" outlined @click="$emit('editar', data)" />
            <AcoesAnexo
              v-if="data.anexo_nome"
              :url="data.anexo_url"
              :rota="`/api/painel/orcamento/receitas/${data.id}/anexo`"
              :nome="data.anexo_nome"
            />
            <span v-if="!editavel && !data.anexo_nome" class="cartao__apoio">Sem anexo.</span>
          </div>
        </template>
      </DataTable>
    </section>

    <template v-else>
      <SelectButton
        v-model="etapaNoCelular"
        class="so-celular"
        :options="opcoesDeEtapaNoCelular"
        option-label="rotulo"
        option-value="valor"
        :allow-empty="false"
        aria-label="Etapa do funil"
      />

      <!-- Grade de CSS + "Mover para": o PrimeVue não tem kanban, e o menu funciona
           no celular e no teclado, onde arrastar não funcionaria. -->
      <div class="funil">
        <section
          v-for="coluna in colunas"
          :key="coluna.valor"
          class="coluna"
          :class="{ 'coluna--no-celular': coluna.valor === etapaNoCelular }"
          :aria-label="coluna.rotulo"
        >
          <header class="coluna__topo">
            <TagFunil :etapa="coluna.valor" />
            <span class="mono coluna__soma">{{ coluna.itens.length }} · {{ brlCurto(coluna.soma) }}</span>
          </header>

          <article v-for="receita in coluna.itens" :key="receita.id" class="ficha">
            <div class="ficha__topo">
              <button v-if="editavel" type="button" class="ficha__nome" @click="$emit('editar', receita)">{{ receita.patrocinador }}</button>
              <strong v-else class="ficha__nome">{{ receita.patrocinador }}</strong>
              <Button
                v-if="editavel"
                icon="pi pi-ellipsis-h"
                severity="secondary"
                text
                rounded
                size="small"
                :aria-label="`Mover ${receita.patrocinador}, hoje em ${ROTULO_DE_ETAPA[receita.status]}`"
                aria-haspopup="true"
                @click="abreMenu($event, receita)"
              />
            </div>
            <div class="ficha__meio">
              <span class="mono ficha__cota">{{ receita.cota }}</span>
              <strong class="ficha__valor">{{ brl(receita.valor_centavos) }}</strong>
            </div>
            <div class="ficha__data">
              <i class="pi pi-calendar" />
              {{ receita.recebido_em ? `Recebido ${dia(receita.recebido_em)}` : `Prev. ${dia(receita.pagamento_previsto)}` }}
              <i v-if="receita.anexo_nome" class="pi pi-paperclip ficha__clipe" :title="receita.anexo_nome" />
            </div>
          </article>

          <p v-if="!coluna.itens.length" class="coluna__vazia">Ninguém nesta etapa.</p>
        </section>
      </div>

      <Menu ref="menu" :model="opcoesDeMover" popup />
    </template>
  </div>
</template>

<style scoped>
.receitas {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.receitas__topo {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
  justify-content: space-between;
}

.receitas__soma {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.receitas__detalhe {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
}

.lista {
  padding: 0;
  margin: 0;
  list-style: none;
}

.lista__item {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
  padding: 0.625rem 0;
  font-size: var(--text-sm);
}

.lista__item + .lista__item {
  border-top: 1px solid var(--border-subtle);
}

.lista__cota {
  font-size: var(--text-2xs);
}

.lista__acao {
  margin-left: auto;
}

.funil {
  display: grid;
  grid-template-columns: repeat(6, minmax(11rem, 1fr));
  gap: 0.625rem;
  padding-bottom: var(--space-3);
  overflow-x: auto;
}

.coluna {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-height: 17.5rem;
  padding: 0.625rem;
  background: var(--sand-200);
  border-radius: 0.875rem;
}

.coluna__topo {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  align-items: flex-start;
  padding-bottom: 0.375rem;
}

.coluna__soma {
  font-size: var(--text-2xs);
}

.coluna__vazia {
  margin: var(--space-2) 0;
  font-size: var(--text-xs);
  color: var(--text-muted);
  text-align: center;
}

.ficha {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
}

.ficha__topo {
  display: flex;
  gap: 0.25rem;
  align-items: flex-start;
  justify-content: space-between;
}

.ficha__nome {
  padding: 0;
  font-family: var(--font-body);
  font-size: 0.84375rem;
  font-weight: var(--fw-bold);
  color: var(--text-strong);
  text-align: left;
  background: none;
  border: 0;
  overflow-wrap: anywhere;
}

button.ficha__nome {
  cursor: pointer;
}

button.ficha__nome:hover {
  text-decoration: underline;
}

.ficha__meio {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-2);
  align-items: center;
  justify-content: space-between;
}

.ficha__cota {
  font-size: var(--text-2xs);
  text-transform: uppercase;
}

.ficha__valor {
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: var(--fw-bold);
  font-variant-numeric: tabular-nums;
  color: var(--text-strong);
}

.ficha__data {
  display: flex;
  gap: 0.375rem;
  align-items: center;
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.ficha__clipe {
  margin-left: auto;
}

@media (max-width: 47.99rem) {
  /* Uma etapa por vez, escolhida no filtro de cima. */
  .funil {
    display: block;
  }

  .coluna {
    display: none;
    min-height: 0;
  }

  .coluna--no-celular {
    display: flex;
  }
}
</style>
