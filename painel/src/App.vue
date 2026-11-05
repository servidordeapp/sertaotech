<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Drawer from 'primevue/drawer';
import Menu from 'primevue/menu';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';
import Estado from './components/Estado.vue';
import Marca from './components/Marca.vue';
import Pagina from './components/Pagina.vue';
import SeletorEdicao from './components/SeletorEdicao.vue';
import { auth, sai } from './auth.js';
import { carregaEdicoes } from './edicao.js';

const route = useRoute();
const router = useRouter();

const GRUPOS = [
  {
    rotulo: 'Pessoas',
    itens: [
      { nome: 'inscricoes', rotulo: 'Inscrições', icone: 'pi-users' },
      { nome: 'emails', rotulo: 'E-mails', icone: 'pi-envelope' },
      { nome: 'lgpd', rotulo: 'LGPD', icone: 'pi-shield' },
    ],
  },
  {
    rotulo: 'Evento',
    itens: [
      { nome: 'metricas', rotulo: 'Métricas', icone: 'pi-chart-bar' },
      { nome: 'apresentacoes', rotulo: 'Apresentações', icone: 'pi-desktop' },
    ],
  },
  {
    rotulo: 'Finanças',
    itens: [{ nome: 'orcamento', rotulo: 'Orçamento', icone: 'pi-wallet' }],
  },
];

// No celular cabem quatro abas: o que o papel mais usa, na ordem. O resto vai para "Mais".
const ABAS_NO_CELULAR = {
  admin: ['inscricoes', 'metricas', 'orcamento', 'apresentacoes'],
  comercial: ['inscricoes', 'orcamento', 'apresentacoes', 'metricas'],
  curadoria: ['inscricoes', 'apresentacoes', 'metricas'],
  financeiro: ['orcamento', 'apresentacoes'],
};

const papel = computed(() => auth.usuario?.papel);

function podeVer(meta) {
  return !meta.papeis || meta.papeis.includes(papel.value);
}

// O que o papel não vê some do menu, em vez de ficar apagado.
const grupos = computed(() => GRUPOS
  .map((grupo) => ({ ...grupo, itens: grupo.itens.filter((item) => podeVer(router.resolve({ name: item.nome }).meta)) }))
  .filter((grupo) => grupo.itens.length));

const abas = computed(() => ABAS_NO_CELULAR[papel.value] ?? []);
const temMais = computed(() => grupos.value.some((grupo) => grupo.itens.some((item) => !abas.value.includes(item.nome))));

const proibido = computed(() => !podeVer(route.meta));

// Trocar de tela não pode perder a edição em foco.
function destino(nome) {
  return { name: nome, query: route.query.edicao ? { edicao: route.query.edicao } : {} };
}

const iniciais = computed(() => (auth.usuario?.nome ?? '')
  .split(' ')
  .map((parte) => parte[0])
  .slice(0, 2)
  .join(''));

const menu = ref();
const maisAberto = ref(false);

watch(() => auth.usuario, (usuario) => {
  if (usuario) carregaEdicoes();
}, { immediate: true });

async function sair() {
  await sai();
  router.push({ name: 'login' });
}

const opcoesDaConta = [{ label: 'Sair', icon: 'pi pi-sign-out', command: sair }];
</script>

<template>
  <div v-if="auth.usuario" class="topo">
    <header class="barra">
      <div class="barra__miolo">
        <Marca claro legenda="Painel" class="barra__marca" />

        <SeletorEdicao />

        <Tag :value="auth.usuario.papel" class="barra__papel" />

        <button
          type="button"
          class="conta"
          aria-label="Conta"
          aria-haspopup="true"
          aria-controls="menu-da-conta"
          @click="menu.toggle($event)"
        >
          <span class="conta__iniciais">{{ iniciais }}</span>
          <span class="conta__nome">{{ auth.usuario.nome }}</span>
          <i class="pi pi-angle-down conta__seta" />
        </button>

        <Menu id="menu-da-conta" ref="menu" :model="opcoesDaConta" popup>
          <template #start>
            <div class="conta__detalhe">
              <strong>{{ auth.usuario.nome }}</strong>
              <span>{{ auth.usuario.email }}</span>
            </div>
          </template>
        </Menu>
      </div>
    </header>

    <!-- Um <nav> só: no celular o CSS leva a faixa para o rodapé, como barra de abas. -->
    <nav class="navegacao" aria-label="Navegação principal">
      <div class="navegacao__miolo">
        <div v-for="grupo in grupos" :key="grupo.rotulo" class="navegacao__grupo">
          <span class="eyebrow navegacao__rotulo">{{ grupo.rotulo }}</span>
          <RouterLink
            v-for="item in grupo.itens"
            :key="item.nome"
            :to="destino(item.nome)"
            class="navegacao__item"
            :class="{ 'navegacao__item--secundario': !abas.includes(item.nome) }"
            :style="{ '--ordem': abas.indexOf(item.nome) }"
          >
            <i class="pi" :class="item.icone" />
            {{ item.rotulo }}
          </RouterLink>
        </div>

        <button v-if="temMais" type="button" class="navegacao__item navegacao__mais" @click="maisAberto = true">
          <i class="pi pi-th-large" />
          Mais
        </button>
      </div>
    </nav>

    <Drawer v-model:visible="maisAberto" position="bottom" header="Todas as telas" style="height: auto">
      <div v-for="grupo in grupos" :key="grupo.rotulo" class="mais__grupo">
        <div class="eyebrow">{{ grupo.rotulo }}</div>
        <RouterLink
          v-for="item in grupo.itens"
          :key="item.nome"
          :to="destino(item.nome)"
          class="mais__item"
          @click="maisAberto = false"
        >
          <i class="pi" :class="item.icone" />
          {{ item.rotulo }}
        </RouterLink>
      </div>
    </Drawer>
  </div>

  <main class="conteudo" :class="{ 'conteudo--logado': auth.usuario }">
    <Pagina v-if="auth.usuario && proibido" titulo="Sem permissão">
      <Estado tipo="proibido" />
    </Pagina>
    <RouterView v-else />
  </main>

  <Toast />
</template>

<style scoped>
.topo {
  position: sticky;
  top: 0;
  z-index: 20;
}

.barra {
  background: var(--surface-ink);
}

.barra__miolo,
.navegacao__miolo {
  box-sizing: border-box;
  max-width: 85rem;
  margin: 0 auto;
  padding: 0 1.75rem;
}

.barra__miolo {
  display: flex;
  gap: var(--space-4);
  align-items: center;
  height: 4rem;
}

.barra__marca {
  margin-right: var(--space-2);
}

.barra__papel {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--espresso-900);
  background: var(--sand-50);
}

.conta {
  display: inline-flex;
  gap: 0.625rem;
  align-items: center;
  padding: 0;
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: var(--fw-semibold);
  color: var(--sand-50);
  cursor: pointer;
  background: transparent;
  border: 0;
}

.conta__iniciais {
  display: grid;
  place-items: center;
  width: 2.125rem;
  height: 2.125rem;
  font-family: var(--font-display);
  font-weight: var(--fw-bold);
  color: var(--espresso-900);
  background: var(--amber-300);
  border-radius: 50%;
}

.conta__seta {
  font-size: var(--text-xs);
}

.conta__detalhe {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: var(--space-2) 0.75rem;
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.conta__detalhe strong {
  font-size: var(--text-sm);
  color: var(--text-strong);
}

.navegacao {
  background: var(--surface-card);
  border-bottom: 1px solid var(--border-subtle);
}

.navegacao__miolo {
  display: flex;
  height: 3.25rem;
}

.navegacao__grupo {
  display: flex;
  gap: 0.125rem;
  align-items: stretch;
}

.navegacao__grupo + .navegacao__grupo {
  padding-left: var(--space-3);
  margin-left: var(--space-3);
  border-left: 1px solid var(--border-subtle);
}

.navegacao__rotulo {
  align-self: center;
  margin-right: 0.375rem;
  font-size: 0.625rem;
}

.navegacao__item {
  display: inline-flex;
  gap: var(--space-2);
  align-items: center;
  padding: 0 0.75rem;
  font-family: var(--font-display);
  font-size: 0.90625rem;
  font-weight: var(--fw-medium);
  color: var(--espresso-700);
  text-decoration: none;
  white-space: nowrap;
}

.navegacao__item:hover {
  color: var(--text-strong);
}

.navegacao__item.router-link-active {
  font-weight: var(--fw-bold);
  color: var(--text-strong);
  box-shadow: inset 0 -3px 0 var(--brand-primary);
}

.navegacao__item.router-link-active .pi {
  color: var(--brand-primary);
}

.navegacao__mais {
  display: none;
}

.mais__grupo + .mais__grupo {
  margin-top: var(--space-4);
}

.mais__item {
  display: flex;
  gap: 0.625rem;
  align-items: center;
  min-height: 2.75rem;
  color: var(--text-body);
  text-decoration: none;
}

.mais__item.router-link-active {
  font-weight: var(--fw-bold);
  color: var(--brand-primary);
}

@media (max-width: 47.99rem) {
  .barra__papel,
  .barra__marca :deep(.marca__legenda) {
    display: none;
  }

  .barra__miolo {
    gap: var(--space-2);
  }

  .conta {
    margin-left: auto;
  }

  .barra__miolo {
    height: 3.5rem;
    padding: 0 0.875rem;
  }

  .conta__nome,
  .conta__seta {
    display: none;
  }

  .navegacao {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    border-top: 1px solid var(--border-subtle);
    border-bottom: 0;
    box-shadow: 0 -4px 16px rgba(60, 33, 11, 0.06);
  }

  .navegacao__miolo {
    height: auto;
    padding: 0.375rem 0.25rem 0.625rem;
  }

  /* Os grupos deixam de existir: os itens viram colunas iguais do <nav> inteiro. */
  .navegacao__grupo {
    display: contents;
  }

  .navegacao__rotulo {
    display: none;
  }

  .navegacao__item--secundario {
    display: none;
  }

  .navegacao__item.navegacao__mais {
    display: inline-flex;
    cursor: pointer;
    background: transparent;
    border: 0;
    order: 9;
  }

  .navegacao__item {
    flex: 1 1 0;
    order: var(--ordem);
    flex-direction: column;
    gap: 0.1875rem;
    min-height: 3rem;
    padding: 0.25rem 0;
    font-family: var(--font-body);
    font-size: 0.71875rem;
    text-align: center;
  }

  .navegacao__item .pi {
    font-size: 1.1875rem;
  }

  .navegacao__item.router-link-active {
    color: var(--brand-primary);
    box-shadow: none;
  }

  /* Sobra para a barra de abas não cobrir o fim da página. */
  .conteudo--logado {
    padding-bottom: 5rem;
  }
}
</style>
