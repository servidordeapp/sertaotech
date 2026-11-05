<script setup>
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import { baixaAnexo } from '../../api.js';

const props = defineProps({
  // Link público do arquivo no bucket.
  url: { type: String, required: true },
  // Rota autenticada do anexo, por onde o download passa.
  rota: { type: String, required: true },
  nome: { type: String, required: true },
});

const toast = useToast();

async function baixa() {
  try {
    await baixaAnexo(props.rota, props.nome);
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Não deu para baixar', detail: e.message, life: 5000 });
  }
}
</script>

<template>
  <div class="acoes-anexo">
    <span class="acoes-anexo__nome"><i class="pi pi-paperclip" /> {{ nome }}</span>
    <Button
      as="a"
      :href="url"
      target="_blank"
      rel="noopener"
      label="Abrir arquivo"
      icon="pi pi-external-link"
      :aria-label="`Abrir ${nome}`"
      size="small"
      severity="secondary"
      outlined
    />
    <Button
      type="button"
      label="Baixar"
      icon="pi pi-download"
      :aria-label="`Baixar ${nome}`"
      size="small"
      severity="secondary"
      outlined
      @click="baixa"
    />
  </div>
</template>

<style scoped>
.acoes-anexo {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
}

.acoes-anexo__nome {
  font-size: var(--text-sm);
  overflow-wrap: anywhere;
}
</style>
