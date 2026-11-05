<script setup>
import { computed, reactive, ref } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Select from 'primevue/select';
import { useToast } from 'primevue/usetoast';
import { api, enviaArquivo } from '../../api.js';
import { brl, centavos, COTAS, ETAPAS, reais } from '../../orcamento.js';
import CampoAnexo from './CampoAnexo.vue';

const props = defineProps({
  ano: { type: Number, required: true },
  item: { type: Object, default: null },
  // Quem veio da lista de espera: já chega com empresa e cota preenchidas.
  candidato: { type: Object, default: null },
});

const emit = defineEmits(['fechar', 'salvo']);

const toast = useToast();
const aberto = ref(true);
const cotas = computed(() => COTAS[props.ano] ?? []);

function cotaDoKit(nome) {
  return cotas.value.find((cota) => cota.nome === nome);
}

function vazio() {
  const cota = props.candidato?.cota ?? '';

  return {
    patrocinador: props.candidato?.empresa ?? '',
    cota,
    valor: cotaDoKit(cota)?.valor ?? null,
    status: 'prospeccao',
    pagamento_previsto: '',
    recebido_em: '',
  };
}

// `atual` e não `item`: se o upload falhar depois de criar, tentar de novo não duplica.
const atual = ref(props.item);
const campos = reactive(props.item ? {
  patrocinador: props.item.patrocinador,
  cota: props.item.cota,
  valor: reais(props.item.valor_centavos),
  status: props.item.status,
  pagamento_previsto: props.item.pagamento_previsto ?? '',
  recebido_em: props.item.recebido_em ?? '',
} : vazio());

const arquivo = ref(null);
const erros = ref({});
const erroGeral = ref('');
const salvando = ref(false);
const confirmandoExclusao = ref(false);

const kit = computed(() => cotaDoKit(campos.cota));

// Trocar a cota traz o preço do kit; cota de texto livre não mexe no que foi digitado.
function aoTrocarCota() {
  if (kit.value) campos.valor = kit.value.valor;
}

function fecha() {
  aberto.value = false;
  emit('fechar');
}

async function salva(criarOutra = false) {
  erros.value = {};
  erroGeral.value = '';

  if (!campos.patrocinador.trim()) erros.value.patrocinador = ['Informe o patrocinador.'];
  if (!campos.cota?.trim()) erros.value.cota = ['Informe a cota.'];
  if (campos.valor === null) erros.value.valor_centavos = ['Informe o valor.'];
  if (Object.keys(erros.value).length) return;

  salvando.value = true;

  try {
    const corpo = {
      patrocinador: campos.patrocinador.trim(),
      cota: campos.cota.trim(),
      valor_centavos: centavos(campos.valor),
      status: campos.status,
      pagamento_previsto: campos.pagamento_previsto || null,
      recebido_em: campos.status === 'pago' ? campos.recebido_em || null : null,
    };

    if (atual.value) {
      atual.value = (await api(`/api/painel/orcamento/receitas/${atual.value.id}`, { metodo: 'PATCH', corpo })).data;
    } else {
      const inscricao = props.candidato ? { waitlist_entry_id: props.candidato.id } : {};
      atual.value = (await api(`/api/painel/orcamento/${props.ano}/receitas`, { metodo: 'POST', corpo: { ...corpo, ...inscricao } })).data;
    }

    if (arquivo.value) {
      await enviaArquivo(`/api/painel/orcamento/receitas/${atual.value.id}/anexo`, arquivo.value);
    }

    toast.add({ severity: 'success', summary: props.item ? 'Alterações salvas' : 'Receita criada', detail: corpo.patrocinador, life: 3000 });
    emit('salvo');

    if (criarOutra) {
      atual.value = null;
      arquivo.value = null;
      Object.assign(campos, { ...vazio(), patrocinador: '', cota: campos.cota, valor: null });
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
    await api(`/api/painel/orcamento/receitas/${atual.value.id}`, { metodo: 'DELETE' });
    toast.add({ severity: 'success', summary: 'Receita excluída', detail: atual.value.patrocinador, life: 3000 });
    emit('salvo');
    fecha();
  } catch (e) {
    erroGeral.value = e.message;
  } finally {
    salvando.value = false;
  }
}

function aoRemoverAnexo() {
  atual.value = { ...atual.value, anexo_nome: null };
  emit('salvo');
}
</script>

<template>
  <Dialog
    v-model:visible="aberto"
    modal
    :draggable="false"
    :header="item ? 'Editar receita' : 'Nova receita'"
    :style="{ width: '36rem', maxWidth: 'calc(100vw - 2rem)' }"
    @hide="fecha"
  >
    <form id="form-receita" class="form" @submit.prevent="salva()">
      <Message v-if="erroGeral" severity="error" :closable="false">{{ erroGeral }}</Message>
      <Message v-if="erros.arquivo" severity="error" :closable="false">{{ erros.arquivo[0] }}</Message>
      <Message v-if="erros.waitlist_entry_id" severity="error" :closable="false">Esta inscrição já está no funil.</Message>

      <div class="campo">
        <label for="receita-patrocinador">Patrocinador</label>
        <InputText id="receita-patrocinador" v-model="campos.patrocinador" placeholder="Nome da empresa" :invalid="Boolean(erros.patrocinador)" autofocus />
        <span v-if="erros.patrocinador" class="campo__erro">{{ erros.patrocinador[0] }}</span>
      </div>

      <div class="campos-duplos">
        <div class="campo">
          <label for="receita-cota">Cota</label>
          <Select
            v-model="campos.cota"
            input-id="receita-cota"
            :options="cotas"
            option-label="nome"
            option-value="nome"
            editable
            :invalid="Boolean(erros.cota)"
            @update:model-value="aoTrocarCota"
          />
          <span v-if="erros.cota" class="campo__erro">{{ erros.cota[0] }}</span>
        </div>

        <div class="campo">
          <label for="receita-valor">Valor</label>
          <InputNumber
            v-model="campos.valor"
            input-id="receita-valor"
            mode="currency"
            currency="BRL"
            locale="pt-BR"
            :min="0"
            :invalid="Boolean(erros.valor_centavos)"
          />
          <span v-if="erros.valor_centavos" class="campo__erro">{{ erros.valor_centavos[0] }}</span>
          <span v-else-if="kit" class="campo__ajuda">Cota no kit: {{ brl(kit.valor * 100) }}</span>
        </div>
      </div>

      <div class="campos-duplos">
        <div class="campo">
          <label for="receita-etapa">Etapa do funil</label>
          <Select v-model="campos.status" input-id="receita-etapa" :options="ETAPAS" option-label="rotulo" option-value="valor" />
        </div>

        <div class="campo">
          <label for="receita-previsto">Pagamento previsto</label>
          <InputText id="receita-previsto" v-model="campos.pagamento_previsto" type="date" />
        </div>
      </div>

      <div v-if="campos.status === 'pago'" class="campo">
        <label for="receita-recebido">Recebido em</label>
        <InputText id="receita-recebido" v-model="campos.recebido_em" type="date" />
        <span class="campo__ajuda">Em branco, vale a data de hoje.</span>
      </div>

      <CampoAnexo
        v-model="arquivo"
        :rota="atual ? `/api/painel/orcamento/receitas/${atual.id}/anexo` : null"
        :nome="atual?.anexo_nome"
        dica="Escolha ou arraste o contrato ou a nota"
        @removido="aoRemoverAnexo"
      />
    </form>

    <template #footer>
      <template v-if="atual && item">
        <Button v-if="!confirmandoExclusao" label="Excluir" severity="danger" text class="form__excluir" @click="confirmandoExclusao = true" />
        <Button v-else label="Confirmar exclusão" icon="pi pi-trash" severity="danger" class="form__excluir" :loading="salvando" @click="exclui" />
      </template>
      <Button label="Cancelar" severity="secondary" text @click="fecha" />
      <Button v-if="!item && !candidato" label="Salvar e criar outra" severity="secondary" outlined :loading="salvando" @click="salva(true)" />
      <Button label="Salvar" type="submit" form="form-receita" :loading="salvando" />
    </template>
  </Dialog>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form__excluir {
  margin-right: auto;
}
</style>
