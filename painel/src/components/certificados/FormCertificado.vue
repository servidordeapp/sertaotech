<script setup>
import { computed, reactive, ref, watch } from 'vue';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Select from 'primevue/select';
import SelectButton from 'primevue/selectbutton';
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';
import { api } from '../../api.js';
import { TIPOS } from '../../certificados.js';

/**
 * Três usos: editar um rascunho (`item`), adicionar (sem `item`) e reemitir um
 * revogado (`base`, que preenche os campos e entra sem ingresso, porque a linha
 * revogada ocupa a chave do ingresso).
 */
const props = defineProps({
  ano: { type: Number, required: true },
  atividades: { type: Object, required: true },
  item: { type: Object, default: null },
  base: { type: Object, default: null },
});

const emit = defineEmits(['fechar', 'salvo']);

const toast = useToast();
const aberto = ref(true);

const MODOS = [
  { rotulo: 'Com ingresso', valor: 'ingresso' },
  { rotulo: 'Sem ingresso', valor: 'manual' },
];

const origem = props.item ?? props.base;
const modo = ref(props.base ? 'manual' : 'ingresso');
const campos = reactive({
  nome: origem?.nome ?? '',
  email: origem?.email ?? '',
  tipo: origem?.tipo ?? 'participante',
  titulo: origem?.titulo ?? '',
  carga_horaria: origem?.carga_horaria ?? null,
  atividades: [...(origem?.atividades ?? [])],
});

const participante = ref(null);
const busca = ref('');
const encontrados = ref([]);
const buscando = ref(false);

const erros = ref({});
const erroGeral = ref('');
const salvando = ref(false);

const comTitulo = computed(() => ['palestrante', 'ministrante'].includes(campos.tipo));
const listaDeAtividades = computed(() => Object.entries(props.atividades).map(([chave, a]) => ({ chave, ...a })));
const titulo = computed(() => {
  if (props.item) return 'Editar rascunho';
  return props.base ? 'Reemitir certificado' : 'Adicionar certificado';
});

let agendado;
watch(busca, () => {
  clearTimeout(agendado);
  agendado = setTimeout(procura, 300);
});

/** A busca inclui quem faltou ao check-in: marcar o minicurso cria o certificado dessa pessoa. */
async function procura() {
  const termo = busca.value.trim();
  if (termo.length < 2) {
    encontrados.value = [];
    return;
  }

  buscando.value = true;
  try {
    encontrados.value = (await api(`/api/painel/participantes/${props.ano}?${new URLSearchParams({ busca: termo, por_pagina: 8 })}`)).data;
  } catch (e) {
    erroGeral.value = e.message;
  } finally {
    buscando.value = false;
  }
}

function escolhe(pessoa) {
  participante.value = pessoa;
  encontrados.value = [];
  busca.value = '';
}

function fecha() {
  aberto.value = false;
  emit('fechar');
}

function corpo() {
  const dados = {
    tipo: campos.tipo,
    titulo: comTitulo.value ? campos.titulo.trim() || null : null,
    // Atividade é linha do certificado de participante: nos outros tipos não vai impressa.
    atividades: campos.tipo === 'participante' ? campos.atividades : [],
    ...(campos.carga_horaria ? { carga_horaria: campos.carga_horaria } : {}),
  };

  if (props.item || modo.value === 'manual') {
    return { ...dados, nome: campos.nome.trim(), email: campos.email.trim() };
  }

  return { ...dados, participante_id: participante.value?.id };
}

async function salva() {
  erros.value = {};
  erroGeral.value = '';

  if (!props.item && modo.value === 'ingresso' && !participante.value) {
    erros.value.participante_id = ['Escolha a pessoa na busca.'];
    return;
  }

  salvando.value = true;

  try {
    const salvo = props.item
      ? await api(`/api/painel/certificados/${props.item.id}`, { metodo: 'PATCH', corpo: corpo() })
      : await api(`/api/painel/certificados/${props.ano}`, { metodo: 'POST', corpo: corpo() });

    toast.add({ severity: 'success', summary: props.item ? 'Rascunho salvo' : 'Rascunho criado', detail: salvo.data.nome, life: 3000 });
    emit('salvo');
    fecha();
  } catch (e) {
    erros.value = e.erros ?? {};
    // Erro de item da lista (atividades.0) aparece junto do campo da lista.
    const deAtividades = Object.entries(erros.value).find(([chave]) => chave.startsWith('atividades'));
    if (deAtividades) erros.value.atividades = deAtividades[1];
    erroGeral.value = Object.keys(erros.value).length ? '' : e.message;
  } finally {
    salvando.value = false;
  }
}
</script>

<template>
  <Dialog
    v-model:visible="aberto"
    modal
    :draggable="false"
    :header="titulo"
    :style="{ width: '36rem', maxWidth: 'calc(100vw - 2rem)' }"
    @hide="fecha"
  >
    <form id="form-certificado" class="form" @submit.prevent="salva">
      <Message v-if="erroGeral" severity="error" :closable="false">{{ erroGeral }}</Message>
      <Message v-if="base" severity="info" :closable="false">
        O certificado {{ base.codigo }} foi revogado. O novo entra como rascunho, com outro código, e só vale depois de emitido.
      </Message>

      <SelectButton
        v-if="!item && !base"
        v-model="modo"
        :options="MODOS"
        option-label="rotulo"
        option-value="valor"
        :allow-empty="false"
        aria-label="Quem recebe"
        class="form__modo"
      />

      <div v-if="!item && modo === 'ingresso'" class="campo">
        <label for="cert-busca">Pessoa</label>
        <div v-if="participante" class="escolhido">
          <span><strong>{{ participante.nome }}</strong> <span class="mono">{{ participante.email }}</span></span>
          <Tag :value="participante.compareceu ? 'Compareceu' : 'Faltou'" :severity="participante.compareceu ? 'success' : 'secondary'" />
          <Button icon="pi pi-times" text rounded size="small" aria-label="Trocar pessoa" title="Trocar pessoa" @click="participante = null" />
        </div>
        <template v-else>
          <InputText id="cert-busca" v-model="busca" placeholder="Nome ou e-mail, como na planilha de ingressos" autocomplete="off" :invalid="Boolean(erros.participante_id)" autofocus />
          <ul v-if="encontrados.length" class="encontrados">
            <li v-for="pessoa in encontrados" :key="pessoa.id">
              <button type="button" @click="escolhe(pessoa)">
                <span><strong>{{ pessoa.nome }}</strong> <span class="mono">{{ pessoa.email ?? '—' }}</span></span>
                <Tag :value="pessoa.compareceu ? 'Compareceu' : 'Faltou'" :severity="pessoa.compareceu ? 'success' : 'secondary'" />
              </button>
            </li>
          </ul>
          <span v-else-if="busca.trim().length >= 2 && !buscando" class="campo__ajuda">Ninguém com esse nome. Sem ingresso? Use "Sem ingresso".</span>
        </template>
        <span v-if="erros.participante_id" class="campo__erro">{{ erros.participante_id[0] }}</span>
      </div>

      <div v-if="item || modo === 'manual'" class="campos-duplos">
        <div class="campo">
          <label for="cert-nome">Nome completo</label>
          <InputText id="cert-nome" v-model="campos.nome" :invalid="Boolean(erros.nome)" />
          <span v-if="erros.nome" class="campo__erro">{{ erros.nome[0] }}</span>
        </div>
        <div class="campo">
          <label for="cert-email">E-mail</label>
          <InputText id="cert-email" v-model="campos.email" type="email" :invalid="Boolean(erros.email)" />
          <span v-if="erros.email" class="campo__erro">{{ erros.email[0] }}</span>
        </div>
      </div>

      <div class="campos-duplos">
        <div class="campo">
          <label for="cert-tipo">Tipo</label>
          <Select v-model="campos.tipo" input-id="cert-tipo" :options="TIPOS" option-label="rotulo" option-value="valor" :invalid="Boolean(erros.tipo)" />
          <span v-if="erros.tipo" class="campo__erro">{{ erros.tipo[0] }}</span>
        </div>
        <div class="campo">
          <label for="cert-carga">Carga horária</label>
          <InputNumber v-model="campos.carga_horaria" input-id="cert-carga" :min="1" :max="200" suffix=" h" placeholder="Padrão da edição" :invalid="Boolean(erros.carga_horaria)" />
          <span v-if="erros.carga_horaria" class="campo__erro">{{ erros.carga_horaria[0] }}</span>
          <span v-else class="campo__ajuda">Em branco, vale a da edição. Ministrante: informe.</span>
        </div>
      </div>

      <div v-if="comTitulo" class="campo">
        <label for="cert-titulo">{{ campos.tipo === 'ministrante' ? 'Minicurso' : 'Palestra' }}</label>
        <InputText id="cert-titulo" v-model="campos.titulo" placeholder="Como vai impresso, sem aspas" :invalid="Boolean(erros.titulo)" />
        <span v-if="erros.titulo" class="campo__erro">{{ erros.titulo[0] }}</span>
      </div>

      <fieldset v-if="listaDeAtividades.length && campos.tipo === 'participante'" class="campo atividades">
        <legend class="campo__rotulo">Atividades</legend>
        <label v-for="a in listaDeAtividades" :key="a.chave" class="atividade">
          <Checkbox v-model="campos.atividades" :value="a.chave" />
          <span>{{ a.nome }} <small>({{ a.carga_horaria }} h, {{ a.horario }})</small></span>
        </label>
        <span v-if="erros.atividades" class="campo__erro">{{ erros.atividades[0] }}</span>
      </fieldset>
    </form>

    <template #footer>
      <Button label="Cancelar" severity="secondary" text @click="fecha" />
      <Button label="Salvar rascunho" type="submit" form="form-certificado" :loading="salvando" />
    </template>
  </Dialog>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form__modo {
  align-self: flex-start;
}

.escolhido,
.encontrados button {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  justify-content: space-between;
}

.escolhido {
  padding: var(--space-2) var(--space-3);
  background: var(--sand-100);
  border-radius: var(--radius-md);
}

.encontrados {
  max-height: 16rem;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
}

.encontrados button {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  font: inherit;
  text-align: left;
  color: inherit;
  background: none;
  border: 0;
  cursor: pointer;
}

.encontrados li + li {
  border-top: 1px solid var(--border-subtle);
}

.encontrados button:hover,
.encontrados button:focus-visible {
  background: var(--sand-100);
}

.atividades {
  margin: 0;
  padding: 0;
  border: 0;
}

.atividade {
  display: flex;
  gap: var(--space-2);
  align-items: flex-start;
  font-weight: 400;
}

.atividade small {
  color: var(--text-muted);
}
</style>
