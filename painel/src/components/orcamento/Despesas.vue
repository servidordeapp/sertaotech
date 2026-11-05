<script setup>
import { computed, ref } from 'vue';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Select from 'primevue/select';
import SelectButton from 'primevue/selectbutton';
import Tag from 'primevue/tag';
import AcoesAnexo from './AcoesAnexo.vue';
import { brl, dia, SITUACOES_DE_DESPESA } from '../../orcamento.js';

const props = defineProps({
  despesas: { type: Array, required: true },
  categorias: { type: Array, required: true },
  editavel: { type: Boolean, required: true },
});

defineEmits(['editar']);

const situacao = ref('todos');
const categoria = ref(null);
const expandidas = ref({});

const situacaoDe = (despesa) => (despesa.vencida ? 'vencido' : despesa.status);

const opcoes = computed(() => [
  { valor: 'todos', rotulo: 'Todos' },
  ...Object.entries(SITUACOES_DE_DESPESA).map(([valor, rotulo]) => ({
    valor,
    rotulo: valor === 'vencido' ? `${rotulo} ${props.despesas.filter((d) => d.vencida).length}` : rotulo,
  })),
]);

const linhas = computed(() => props.despesas.filter((d) => (situacao.value === 'todos' || situacaoDe(d) === situacao.value)
  && (!categoria.value || d.categoria === categoria.value)));

const total = (campo) => linhas.value.reduce((soma, d) => soma + d[campo], 0);

const acimaDoOrcado = (d) => d.comprometido_centavos > d.orcado_centavos;
</script>

<template>
  <div class="despesas">
    <div class="filtros">
      <SelectButton
        v-model="situacao"
        :options="opcoes"
        option-label="rotulo"
        option-value="valor"
        :allow-empty="false"
        aria-label="Filtrar por situação"
      />
      <Select
        v-model="categoria"
        :options="categorias"
        placeholder="Todas as categorias"
        show-clear
        aria-label="Filtrar por categoria"
      />
    </div>

    <section class="cartao cartao--tabela">
      <DataTable v-model:expanded-rows="expandidas" :value="linhas" data-key="id">
        <template #empty>Nenhuma despesa com esse filtro.</template>

        <Column expander style="width: 3rem" />
        <Column field="descricao" header="Descrição">
          <template #body="{ data }">
            <strong>{{ data.descricao }}</strong>
            <div class="despesas__apoio">{{ data.categoria }}<template v-if="data.fornecedor"> · {{ data.fornecedor }}</template></div>
          </template>
        </Column>
        <Column field="orcado_centavos" header="Orçado" header-class="coluna-valor" body-class="coluna-valor">
          <template #body="{ data }">{{ brl(data.orcado_centavos) }}</template>
        </Column>
        <Column field="comprometido_centavos" header="Realizado" header-class="coluna-valor" body-class="coluna-valor">
          <template #body="{ data }">
            <strong :class="{ despesas__acima: acimaDoOrcado(data) }">
              <i v-if="acimaDoOrcado(data)" class="pi pi-exclamation-triangle" />
              {{ data.status === 'planejado' ? '—' : brl(data.comprometido_centavos) }}
            </strong>
          </template>
        </Column>
        <Column header="Status">
          <template #body="{ data }">
            <Tag
              class="tag-despesa"
              :class="`tag-despesa-${situacaoDe(data)}`"
              :icon="data.vencida ? 'pi pi-exclamation-triangle' : undefined"
              :value="SITUACOES_DE_DESPESA[situacaoDe(data)]"
            />
          </template>
        </Column>
        <Column field="vencimento" header="Vencimento">
          <template #body="{ data }">{{ dia(data.vencimento) }}</template>
        </Column>
        <Column field="responsavel" header="Resp.">
          <template #body="{ data }">{{ data.responsavel ?? '—' }}</template>
        </Column>

        <template #expansion="{ data }">
          <div class="despesas__detalhe">
            <dl class="dados">
              <div><dt>Categoria</dt><dd>{{ data.categoria }}</dd></div>
              <div><dt>Fornecedor</dt><dd>{{ data.fornecedor ?? '—' }}</dd></div>
              <div><dt>Responsável</dt><dd>{{ data.responsavel ?? '—' }}</dd></div>
            </dl>

            <p v-if="acimaDoOrcado(data)" class="despesas__acima">
              <i class="pi pi-exclamation-triangle" />
              Acima do orçado em {{ brl(data.comprometido_centavos - data.orcado_centavos) }}.
            </p>

            <div class="despesas__botoes">
              <Button v-if="editavel" label="Editar despesa" icon="pi pi-pencil" size="small" severity="secondary" outlined @click="$emit('editar', data)" />
              <AcoesAnexo
                v-if="data.anexo_nome"
                :url="data.anexo_url"
                :rota="`/api/painel/orcamento/despesas/${data.id}/anexo`"
                :nome="data.anexo_nome"
              />
            </div>
          </div>
        </template>
      </DataTable>

      <footer class="despesas__rodape numero-tabular">
        <span>{{ linhas.length }} {{ linhas.length === 1 ? 'item' : 'itens' }}</span>
        <span class="despesas__totais">
          <span>Orçado <strong>{{ brl(total('orcado_centavos')) }}</strong></span>
          <span>Comprometido <strong>{{ brl(total('comprometido_centavos')) }}</strong></span>
        </span>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.despesas {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.despesas__apoio {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.despesas__acima {
  color: var(--brick-600);
}

.despesas__detalhe {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.despesas__detalhe p {
  margin: 0;
  font-size: 0.8125rem;
}

.despesas__botoes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
}

.despesas__rodape {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  font-size: 0.84375rem;
  background: var(--sand-100);
  border-top: 1px solid var(--border-subtle);
}

.despesas__totais {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-5);
}
</style>
