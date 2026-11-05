<script setup>
import { computed, ref } from 'vue';
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Select from 'primevue/select';
import { useToast } from 'primevue/usetoast';
import Pagina from '../Pagina.vue';
import { api } from '../../api.js';
import { brl, centavos } from '../../orcamento.js';

const props = defineProps({
  ano: { type: Number, required: true },
  categorias: { type: Array, required: true },
  // Vinda da cópia: { ano, reajuste, por_categoria: { Espaço: centavos } }. Null é do zero.
  base: { type: Object, default: null },
});

const emit = defineEmits(['voltar', 'criadas']);

const toast = useToast();
const salvando = ref(false);
const erro = ref('');

let proximoId = 0;

function linha(categoria, referencia = null) {
  proximoId += 1;

  // Arredonda em R$ 100: reajuste com centavo é precisão que o planejamento não tem.
  const orcado = referencia === null
    ? null
    : Math.round(((referencia / 100) * (1 + (props.base?.reajuste ?? 0) / 100)) / 100) * 100;

  return { id: proximoId, categoria, descricao: '', orcado, referencia };
}

const linhas = ref(props.categorias.map((categoria) => linha(categoria, props.base?.por_categoria[categoria] ?? null)));

const preenchidas = computed(() => linhas.value.filter((l) => l.orcado));
const total = computed(() => preenchidas.value.reduce((soma, l) => soma + centavos(l.orcado), 0));

function remove(id) {
  linhas.value = linhas.value.filter((l) => l.id !== id);
}

async function cria() {
  salvando.value = true;
  erro.value = '';

  try {
    await api(`/api/painel/orcamento/${props.ano}/despesas/lote`, {
      metodo: 'POST',
      corpo: {
        linhas: preenchidas.value.map((l) => ({
          categoria: l.categoria,
          // Descrição é opcional aqui e obrigatória na despesa: a categoria serve até detalhar.
          descricao: l.descricao.trim() || l.categoria,
          orcado_centavos: centavos(l.orcado),
        })),
      },
    });

    toast.add({
      severity: 'success',
      summary: `${preenchidas.value.length} despesas criadas`,
      detail: 'Todas como Planejado. Ajuste à medida que fechar fornecedores.',
      life: 5000,
    });
    emit('criadas');
  } catch (e) {
    erro.value = e.message;
  } finally {
    salvando.value = false;
  }
}
</script>

<template>
  <Pagina
    :eyebrow="`Finanças · orçamento ${ano}`"
    titulo="Planejar em lote"
    :descricao="base
      ? `Valores de ${base.ano} com reajuste de ${base.reajuste}%. Revise linha a linha antes de criar.`
      : 'Uma linha por item. Deixe em branco o que ainda não sabe: dá para completar depois.'"
  >
    <template #acoes>
      <Button label="Voltar ao orçamento" icon="pi pi-arrow-left" severity="secondary" text size="small" @click="$emit('voltar')" />
    </template>

    <Message v-if="erro" severity="error" :closable="false">{{ erro }}</Message>

    <section class="cartao cartao--tabela">
      <div class="linha linha--cabecalho">
        <span class="eyebrow">Categoria</span>
        <span class="eyebrow">Descrição</span>
        <span class="eyebrow linha__direita">Orçado {{ ano }}</span>
        <span class="eyebrow linha__direita">{{ base ? `Real. ${base.ano}` : '' }}</span>
        <span />
      </div>

      <div v-for="item in linhas" :key="item.id" class="linha">
        <Select v-model="item.categoria" :options="categorias" size="small" aria-label="Categoria" />
        <InputText v-model="item.descricao" size="small" placeholder="Descrição (opcional)" aria-label="Descrição" />
        <InputNumber
          v-model="item.orcado"
          size="small"
          mode="currency"
          currency="BRL"
          locale="pt-BR"
          :min="0"
          aria-label="Valor orçado"
        />
        <span class="linha__referencia numero-tabular">{{ item.referencia === null ? '—' : brl(item.referencia) }}</span>
        <Button icon="pi pi-trash" severity="secondary" text rounded size="small" aria-label="Remover linha" @click="remove(item.id)" />
      </div>

      <footer class="lote__rodape">
        <Button label="Adicionar linha" icon="pi pi-plus" severity="secondary" text size="small" @click="linhas.push(linha(categorias[categorias.length - 1]))" />
        <span class="lote__total">
          <span>Total orçado</span>
          <strong class="numero-tabular">{{ brl(total) }}</strong>
        </span>
      </footer>
    </section>

    <div class="lote__acoes">
      <Button label="Descartar" severity="secondary" text @click="$emit('voltar')" />
      <Button
        :label="`Criar ${preenchidas.length} despesas como Planejado`"
        icon="pi pi-check"
        :disabled="!preenchidas.length"
        :loading="salvando"
        @click="cria"
      />
    </div>
  </Pagina>
</template>

<style scoped>
.linha {
  display: grid;
  grid-template-columns: 13rem minmax(0, 1fr) 11rem 7.5rem 2.5rem;
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-2) var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
}

.linha :deep(.p-inputnumber-input) {
  width: 100%;
  text-align: right;
}

.linha--cabecalho {
  padding-block: 0.625rem;
  background: var(--sand-100);
}

.linha__direita,
.linha__referencia {
  text-align: right;
}

.linha__referencia {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.lote__rodape {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem var(--space-4);
}

.lote__total {
  display: flex;
  gap: 0.625rem;
  align-items: baseline;
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.lote__total strong {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  color: var(--text-strong);
}

.lote__acoes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: flex-end;
}

@media (max-width: 47.99rem) {
  .linha--cabecalho {
    display: none;
  }

  .linha {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 2.5rem;
    padding-block: var(--space-3);
  }

  .linha > :nth-child(1),
  .linha > :nth-child(2) {
    grid-column: 1 / -1;
  }
}
</style>
