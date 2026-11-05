<script setup>
import { computed, ref } from 'vue';
import Button from 'primevue/button';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import SelectButton from 'primevue/selectbutton';
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';
import Estado from '../components/Estado.vue';
import Pagina from '../components/Pagina.vue';
import { useEdicao } from '../edicao.js';
import { MATERIAIS, TIPOS_DE_MATERIAL } from '../materiais.js';

const toast = useToast();
const edicao = useEdicao();

const busca = ref('');
const grupoEscolhido = ref('todos');
const tipo = ref(null);

const opcoesDeTipo = Object.entries(TIPOS_DE_MATERIAL).map(([valor, { rotulo }]) => ({ valor, rotulo }));
const anos = [...new Set(MATERIAIS.map((m) => m.grupo).filter((g) => g !== 'operacao'))].sort((a, b) => b - a);

const opcoesDeGrupo = [
  { valor: 'todos', rotulo: 'Todas' },
  ...anos.map((ano) => ({ valor: ano, rotulo: String(ano) })),
  { valor: 'operacao', rotulo: 'Operação' },
];

// A edição em foco vem primeiro; Operação fica por último, vale para qualquer uma.
const grupos = computed(() => {
  const foco = edicao.value?.ano;
  const ordem = [...anos].sort((a, b) => (b === foco) - (a === foco));

  return [
    ...ordem.map((ano) => ({
      id: ano,
      titulo: `Edição ${ano}`,
      atual: edicao.value?.atual && ano === foco,
    })),
    { id: 'operacao', titulo: 'Operação', nota: 'Vale para qualquer edição' },
  ].filter((grupo) => grupoEscolhido.value === 'todos' || grupo.id === grupoEscolhido.value);
});

const termo = computed(() => busca.value.trim().toLowerCase());
const filtrando = computed(() => Boolean(termo.value || tipo.value));

function itens(grupo) {
  return MATERIAIS.filter((m) => m.grupo === grupo
    && (!tipo.value || m.tipo === tipo.value)
    && (!termo.value || `${m.titulo} ${m.descricao}`.toLowerCase().includes(termo.value)));
}

async function copiar(material) {
  try {
    await navigator.clipboard.writeText(material.url);
    toast.add({ severity: 'success', summary: 'Link copiado', detail: material.titulo, life: 3000 });
  } catch {
    // Permissão negada: o endereço na mensagem ainda dá para copiar à mão.
    toast.add({ severity: 'warn', summary: 'Copie o link', detail: material.url, life: 10000 });
  }
}
</script>

<template>
  <Pagina
    eyebrow="Evento · materiais"
    titulo="Apresentações"
    descricao="Decks, relatórios e impressos do evento. Por enquanto os links são públicos: quem tiver o endereço abre sem login."
  >
    <div class="filtros">
      <IconField class="busca">
        <InputIcon class="pi pi-search" />
        <InputText v-model="busca" placeholder="Buscar material" aria-label="Buscar material" />
      </IconField>

      <SelectButton
        v-model="grupoEscolhido"
        :options="opcoesDeGrupo"
        option-label="rotulo"
        option-value="valor"
        :allow-empty="false"
        aria-label="Filtrar por edição"
      />

      <Select
        v-model="tipo"
        :options="opcoesDeTipo"
        option-label="rotulo"
        option-value="valor"
        placeholder="Todos os tipos"
        show-clear
        aria-label="Filtrar por tipo"
      />
    </div>

    <section v-for="grupo in grupos" :key="grupo.id" class="grupo" :class="{ 'grupo--atual': grupo.atual }">
      <header class="grupo__topo">
        <h2 class="grupo__titulo">{{ grupo.titulo }}</h2>
        <span v-if="grupo.atual" class="eyebrow grupo__selo">Edição atual</span>
        <span v-else-if="grupo.nota" class="grupo__nota">{{ grupo.nota }}</span>
        <span class="mono grupo__contagem">
          {{ itens(grupo.id).length }} {{ itens(grupo.id).length === 1 ? 'material' : 'materiais' }}
        </span>
      </header>

      <div v-if="itens(grupo.id).length" class="materiais">
        <article v-for="material in itens(grupo.id)" :key="material.caminho" class="cartao material">
          <div class="material__corpo">
            <span class="material__icone"><i class="pi" :class="TIPOS_DE_MATERIAL[material.tipo].icone" /></span>
            <div>
              <h3 class="material__titulo">{{ material.titulo }}</h3>
              <p class="material__descricao">{{ material.descricao }}</p>
              <Tag :value="TIPOS_DE_MATERIAL[material.tipo].rotulo" severity="secondary" class="material__tag" />
            </div>
          </div>

          <div class="material__acoes">
            <Button
              as="a"
              :href="material.url"
              target="_blank"
              rel="noopener"
              label="Abrir"
              icon="pi pi-external-link"
              icon-pos="right"
              size="small"
              severity="contrast"
            />
            <Button
              v-if="material.urlPdf"
              as="a"
              :href="material.urlPdf"
              target="_blank"
              rel="noopener"
              label="PDF"
              icon="pi pi-print"
              size="small"
              severity="secondary"
              outlined
            />
            <Button label="Copiar link" icon="pi pi-link" size="small" severity="secondary" text @click="copiar(material)" />
          </div>
        </article>
      </div>

      <Estado
        v-else
        tipo="vazio"
        :titulo="filtrando ? 'Nada com esse filtro' : `${grupo.titulo} ainda não tem material`"
        :texto="filtrando ? 'Limpe a busca ou troque o tipo.' : 'Quando o kit da edição sair, ele aparece aqui.'"
      />
    </section>
  </Pagina>
</template>

<style scoped>
.grupo {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.grupo--atual {
  padding: var(--space-5);
  background: var(--surface-card);
  border: 2px solid var(--border-ink);
  border-radius: 1.25rem;
  box-shadow: var(--shadow-badge);
}

.grupo__topo {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
  align-items: center;
}

.grupo__titulo {
  font-size: var(--text-lg);
  font-weight: var(--fw-semibold);
}

.grupo--atual .grupo__titulo {
  font-size: var(--text-xl);
}

.grupo__selo {
  padding: 0.2rem 0.5rem;
  font-weight: var(--fw-bold);
  color: var(--espresso-900);
  background: var(--amber-300);
  border-radius: var(--radius-pill);
}

.grupo__nota {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.grupo__contagem {
  margin-left: auto;
  font-size: var(--text-2xs);
}

.materiais {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(18.75rem, 100%), 1fr));
  gap: var(--space-3);
}

.material {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  justify-content: space-between;
  padding: var(--space-4);
}

.material__corpo {
  display: flex;
  gap: var(--space-3);
}

.material__icone {
  display: grid;
  flex: none;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  color: var(--espresso-800);
  background: var(--sand-200);
  border-radius: var(--radius-md);
}

.material__titulo {
  font-size: 0.96875rem;
  font-weight: var(--fw-semibold);
  line-height: var(--leading-snug);
}

.material__descricao {
  margin: var(--space-1) 0 var(--space-2);
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.material__tag {
  font-size: var(--text-xs);
  font-weight: var(--fw-semibold);
}

.material__acoes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  padding-top: var(--space-3);
  border-top: 1px solid var(--border-subtle);
}
</style>
