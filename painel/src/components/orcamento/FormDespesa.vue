<script setup>
import { computed, reactive, ref } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Select from 'primevue/select';
import SelectButton from 'primevue/selectbutton';
import { useToast } from 'primevue/usetoast';
import { api, enviaArquivo } from '../../api.js';
import { brl, centavos, reais } from '../../orcamento.js';
import CampoAnexo from './CampoAnexo.vue';

const props = defineProps({
  ano: { type: Number, required: true },
  item: { type: Object, default: null },
  categorias: { type: Array, required: true },
});

const emit = defineEmits(['fechar', 'salvo']);

const toast = useToast();
const aberto = ref(true);

const STATUS = [
  { valor: 'planejado', rotulo: 'Planejado' },
  { valor: 'comprometido', rotulo: 'Comprometido' },
  { valor: 'pago', rotulo: 'Pago' },
];

const vazio = (categoria) => ({
  categoria,
  descricao: '',
  fornecedor: '',
  responsavel: '',
  orcado: null,
  realizado: null,
  status: 'planejado',
  vencimento: '',
});

// `atual` e não `item`: se o upload falhar depois de criar, tentar de novo não duplica.
const atual = ref(props.item);
const campos = reactive(props.item ? {
  categoria: props.item.categoria,
  descricao: props.item.descricao,
  fornecedor: props.item.fornecedor ?? '',
  responsavel: props.item.responsavel ?? '',
  orcado: reais(props.item.orcado_centavos),
  realizado: reais(props.item.realizado_centavos),
  status: props.item.status,
  vencimento: props.item.vencimento ?? '',
} : vazio(props.categorias[0]));

const arquivo = ref(null);
const erros = ref({});
const erroGeral = ref('');
const salvando = ref(false);
const confirmandoExclusao = ref(false);

const excesso = computed(() => {
  if (campos.realizado === null || campos.orcado === null) return 0;
  return Math.max(0, centavos(campos.realizado) - centavos(campos.orcado));
});

function fecha() {
  aberto.value = false;
  emit('fechar');
}

async function salva(criarOutra = false) {
  erros.value = {};
  erroGeral.value = '';

  if (!campos.descricao.trim()) erros.value.descricao = ['Descreva a despesa.'];
  if (campos.orcado === null) erros.value.orcado_centavos = ['Informe o valor orçado.'];
  if (Object.keys(erros.value).length) return;

  salvando.value = true;

  try {
    const corpo = {
      categoria: campos.categoria,
      descricao: campos.descricao.trim(),
      fornecedor: campos.fornecedor.trim() || null,
      responsavel: campos.responsavel.trim() || null,
      orcado_centavos: centavos(campos.orcado),
      realizado_centavos: campos.realizado === null ? null : centavos(campos.realizado),
      status: campos.status,
      vencimento: campos.vencimento || null,
    };

    atual.value = (atual.value
      ? await api(`/api/painel/orcamento/despesas/${atual.value.id}`, { metodo: 'PATCH', corpo })
      : await api(`/api/painel/orcamento/${props.ano}/despesas`, { metodo: 'POST', corpo })).data;

    if (arquivo.value) {
      await enviaArquivo(`/api/painel/orcamento/despesas/${atual.value.id}/anexo`, arquivo.value);
    }

    toast.add({ severity: 'success', summary: props.item ? 'Alterações salvas' : 'Despesa criada', detail: corpo.descricao, life: 3000 });
    emit('salvo');

    if (criarOutra) {
      atual.value = null;
      arquivo.value = null;
      Object.assign(campos, vazio(campos.categoria));
    } else {
      fecha();
    }
  } catch (e) {
    erros.value = e.erros ?? {};
    erroGeral.value = Object.keys(erros.value).length ? '' : e.message;
    // Falhou só o upload: o lançamento já existe e a lista de trás precisa mostrar.
    if (atual.value && !props.item) emit('salvo');
  } finally {
    salvando.value = false;
  }
}

async function exclui() {
  salvando.value = true;

  try {
    await api(`/api/painel/orcamento/despesas/${atual.value.id}`, { metodo: 'DELETE' });
    toast.add({ severity: 'success', summary: 'Despesa excluída', detail: atual.value.descricao, life: 3000 });
    emit('salvo');
    fecha();
  } catch (e) {
    erroGeral.value = e.message;
  } finally {
    salvando.value = false;
  }
}

function aoRemoverAnexo() {
  atual.value = { ...atual.value, anexo_nome: null, anexo_url: null };
  emit('salvo');
}
</script>

<template>
  <Dialog
    v-model:visible="aberto"
    modal
    :draggable="false"
    :header="item ? 'Editar despesa' : 'Nova despesa'"
    :style="{ width: '36rem', maxWidth: 'calc(100vw - 2rem)' }"
    @hide="fecha"
  >
    <form id="form-despesa" class="form" @submit.prevent="salva()">
      <Message v-if="erroGeral" severity="error" :closable="false">{{ erroGeral }}</Message>
      <Message v-if="erros.arquivo" severity="error" :closable="false">{{ erros.arquivo[0] }}</Message>

      <div class="campo">
        <span class="campo__rotulo">Status</span>
        <SelectButton
          v-model="campos.status"
          :options="STATUS"
          option-label="rotulo"
          option-value="valor"
          :allow-empty="false"
          aria-label="Status"
          class="form__status"
        />
      </div>

      <div class="campo">
        <label for="despesa-descricao">Descrição</label>
        <InputText id="despesa-descricao" v-model="campos.descricao" placeholder="Ex.: Som, telão e transmissão" :invalid="Boolean(erros.descricao)" autofocus />
        <span v-if="erros.descricao" class="campo__erro">{{ erros.descricao[0] }}</span>
      </div>

      <div class="campos-duplos">
        <div class="campo">
          <label for="despesa-categoria">Categoria</label>
          <Select v-model="campos.categoria" input-id="despesa-categoria" :options="categorias" />
        </div>

        <div class="campo">
          <label for="despesa-vencimento">Vencimento</label>
          <InputText id="despesa-vencimento" v-model="campos.vencimento" type="date" />
        </div>
      </div>

      <div class="campos-duplos">
        <div class="campo">
          <label for="despesa-fornecedor">Fornecedor</label>
          <InputText id="despesa-fornecedor" v-model="campos.fornecedor" />
        </div>

        <div class="campo">
          <label for="despesa-responsavel">Responsável</label>
          <InputText id="despesa-responsavel" v-model="campos.responsavel" />
        </div>
      </div>

      <div class="campos-duplos">
        <div class="campo">
          <label for="despesa-orcado">Valor orçado</label>
          <InputNumber
            v-model="campos.orcado"
            input-id="despesa-orcado"
            mode="currency"
            currency="BRL"
            locale="pt-BR"
            :min="0"
            :invalid="Boolean(erros.orcado_centavos)"
          />
          <span v-if="erros.orcado_centavos" class="campo__erro">{{ erros.orcado_centavos[0] }}</span>
        </div>

        <div class="campo">
          <label for="despesa-realizado">Valor realizado</label>
          <InputNumber
            v-model="campos.realizado"
            input-id="despesa-realizado"
            mode="currency"
            currency="BRL"
            locale="pt-BR"
            :min="0"
          />
          <span v-if="excesso" class="campo__erro">Acima do orçado em {{ brl(excesso) }}.</span>
          <span v-else class="campo__ajuda">Contratado ou pago. Em branco, conta pelo orçado ao comprometer.</span>
        </div>
      </div>

      <CampoAnexo
        v-model="arquivo"
        :rota="atual ? `/api/painel/orcamento/despesas/${atual.id}/anexo` : null"
        :nome="atual?.anexo_nome"
        :url="atual?.anexo_url"
        dica="Escolha ou arraste o orçamento, contrato ou nota"
        @removido="aoRemoverAnexo"
      />
    </form>

    <template #footer>
      <template v-if="atual && item">
        <Button v-if="!confirmandoExclusao" label="Excluir" severity="danger" text class="form__excluir" @click="confirmandoExclusao = true" />
        <Button v-else label="Confirmar exclusão" icon="pi pi-trash" severity="danger" class="form__excluir" :loading="salvando" @click="exclui" />
      </template>
      <Button label="Cancelar" severity="secondary" text @click="fecha" />
      <Button v-if="!item" label="Salvar e criar outra" severity="secondary" outlined :loading="salvando" @click="salva(true)" />
      <Button label="Salvar" type="submit" form="form-despesa" :loading="salvando" />
    </template>
  </Dialog>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form__status {
  align-self: flex-start;
}

.form__excluir {
  margin-right: auto;
}
</style>
