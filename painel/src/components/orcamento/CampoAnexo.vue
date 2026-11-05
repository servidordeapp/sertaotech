<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import { api, baixaAnexo } from '../../api.js';

const props = defineProps({
  // Rota do anexo do lançamento; null enquanto ele não foi salvo.
  rota: { type: String, default: null },
  nome: { type: String, default: null },
  dica: { type: String, required: true },
});

const arquivo = defineModel({ type: Object, default: null });
const emit = defineEmits(['removido']);

const toast = useToast();
const erro = ref('');
const DEZ_MEGA = 10 * 1024 * 1024;

// Barra aqui o que a api recusaria: subir 50 MB para ouvir um não custa caro no celular.
function escolhe(evento) {
  const escolhido = evento.target.files[0] ?? null;
  erro.value = '';

  if (escolhido && (escolhido.type !== 'application/pdf' || escolhido.size > DEZ_MEGA)) {
    erro.value = 'Só PDF de até 10 MB.';
    evento.target.value = '';
    arquivo.value = null;
    return;
  }

  arquivo.value = escolhido;
}

async function baixa() {
  try {
    await baixaAnexo(props.rota, props.nome);
  } catch (e) {
    erro.value = e.message;
  }
}

async function remove() {
  try {
    await api(props.rota, { metodo: 'DELETE' });
    toast.add({ severity: 'success', summary: 'Anexo removido', life: 3000 });
    emit('removido');
  } catch (e) {
    erro.value = e.message;
  }
}
</script>

<template>
  <div class="campo">
    <span class="campo__rotulo">Anexo</span>

    <div v-if="nome && !arquivo" class="anexo__atual">
      <Button :label="nome" icon="pi pi-paperclip" severity="secondary" text size="small" @click="baixa" />
      <Button label="Remover" severity="danger" text size="small" @click="remove" />
    </div>

    <label class="anexo__zona">
      <i class="pi pi-upload" />
      <span class="anexo__texto">
        <strong v-if="arquivo">{{ arquivo.name }}</strong>
        <template v-else>{{ nome ? 'Trocar por outro arquivo' : dica }}</template>
      </span>
      <span class="mono anexo__limite">PDF · até 10 MB</span>
      <input type="file" accept="application/pdf" class="anexo__entrada" @change="escolhe" />
    </label>

    <span v-if="erro" class="campo__erro">{{ erro }}</span>
  </div>
</template>

<style scoped>
.anexo__atual {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  align-items: center;
}

.anexo__zona {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
  padding: 0.875rem var(--space-4);
  color: var(--espresso-700);
  cursor: pointer;
  background: var(--sand-100);
  border: 1.5px dashed var(--border-default);
  border-radius: var(--radius-md);
}

.anexo__zona:focus-within {
  border-color: var(--focus-ring);
  box-shadow: var(--shadow-focus);
}

.anexo__texto {
  flex: 1 1 10rem;
  font-size: 0.84375rem;
}

.anexo__limite {
  font-size: var(--text-2xs);
}

/* Cobre a zona inteira: clique e arrastar vão direto para o input nativo. */
.anexo__entrada {
  position: absolute;
  inset: 0;
  cursor: pointer;
  opacity: 0;
}
</style>
