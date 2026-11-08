<script setup>
import { computed, onMounted, ref } from 'vue';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import SelectButton from 'primevue/selectbutton';
import { useToast } from 'primevue/usetoast';
import Estado from '../components/Estado.vue';
import Pagina from '../components/Pagina.vue';
import { api } from '../api.js';
import { SITUACOES, rotuloDoTipo } from '../certificados.js';
import { dataHora } from '../formato.js';

const PALAVRA = 'ANONIMIZAR';

const toast = useToast();

const aba = ref('consulta');
const email = ref('');
const resultado = ref(null);
const buscando = ref(false);
const auditorias = ref(null);
const erroDoHistorico = ref(null);

const confirmando = ref(false);
const digitado = ref('');
const anonimizando = ref(false);
const podeAnonimizar = computed(() => digitado.value.trim().toUpperCase() === PALAVRA);

// Certificado emitido sai da página de validação: a pessoa tem de guardar o PDF antes.
const emitidos = computed(() => (resultado.value?.certificados ?? [])
  .filter((c) => ['emitido', 'revogado'].includes(c.situacao)));
const temAlgo = computed(() => resultado.value && (resultado.value.inscricoes.length
  || resultado.value.participantes.length
  || resultado.value.certificados.length));

async function consultar() {
  buscando.value = true;
  resultado.value = null;

  try {
    resultado.value = await api(`/api/painel/lgpd?email=${encodeURIComponent(email.value.trim())}`);
    await carregaAuditoria();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Não deu para consultar', detail: e.erros?.email?.[0] || e.message, life: 5000 });
  } finally {
    buscando.value = false;
  }
}

function pedirAnonimizacao() {
  digitado.value = '';
  confirmando.value = true;
}

async function anonimizar() {
  anonimizando.value = true;

  try {
    const feito = await api('/api/painel/lgpd', { metodo: 'DELETE', corpo: { email: resultado.value.email } });

    toast.add({
      severity: 'success',
      summary: 'Anonimizado',
      detail: `${feito.inscricoes} inscrição(ões), ${feito.participantes} ingresso(s), ${feito.certificados} certificado(s) e ${feito.emails} registro(s) de envio.`,
      life: 6000,
    });

    confirmando.value = false;
    resultado.value = null;
    email.value = '';
    await carregaAuditoria();
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Não deu para anonimizar', detail: e.message, life: 5000 });
  } finally {
    anonimizando.value = false;
  }
}

async function carregaAuditoria() {
  erroDoHistorico.value = null;

  try {
    auditorias.value = (await api('/api/painel/auditorias?por_pagina=25')).data;
  } catch (e) {
    erroDoHistorico.value = e;
  }
}

onMounted(carregaAuditoria);
</script>

<template>
  <Pagina
    eyebrow="Pessoas · direitos do titular"
    titulo="LGPD"
    descricao="Procure pelo e-mail que a pessoa usou na inscrição. A consulta e a anonimização ficam registradas no histórico, com quem fez e quando."
  >
    <SelectButton
      v-model="aba"
      :options="[{ rotulo: 'Consultar titular', valor: 'consulta' }, { rotulo: 'Histórico de acesso', valor: 'historico' }]"
      option-label="rotulo"
      option-value="valor"
      :allow-empty="false"
      aria-label="Seção"
      class="abas"
    />

    <!-- v-show: trocar de aba não pode perder a consulta aberta. -->
    <div v-show="aba === 'consulta'" class="consulta">
      <section class="cartao">
        <h2 class="cartao__titulo">Localizar titular</h2>
        <p class="cartao__apoio">Busca exata pelo e-mail completo.</p>

        <form class="procura" @submit.prevent="consultar">
          <label for="email-titular">E-mail</label>
          <InputText id="email-titular" v-model="email" type="email" placeholder="email@exemplo.com" required />
          <Button type="submit" label="Consultar" icon="pi pi-search" :loading="buscando" />
        </form>
      </section>

      <section v-if="resultado" class="cartao">
        <h2 class="cartao__titulo mono">{{ resultado.email }}</h2>

        <Message
          v-if="!temAlgo && !resultado.emails.length"
          severity="info"
          :closable="false"
          class="consulta__aviso"
        >
          Não há nada guardado com esse e-mail.
        </Message>

        <template v-else>
          <h3 class="eyebrow consulta__secao">Inscrições ({{ resultado.inscricoes.length }})</h3>
          <dl v-for="i in resultado.inscricoes" :key="i.id" class="dados consulta__inscricao">
            <div v-for="(valor, chave) in i" :key="chave">
              <dt>{{ chave }}</dt>
              <dd>{{ typeof valor === 'object' && valor !== null ? JSON.stringify(valor) : valor ?? '—' }}</dd>
            </div>
          </dl>

          <h3 class="eyebrow consulta__secao">Ingressos em edições ({{ resultado.participantes.length }})</h3>
          <dl v-for="p in resultado.participantes" :key="p.id" class="dados consulta__inscricao">
            <div v-for="(valor, chave) in p" :key="chave">
              <dt>{{ chave }}</dt>
              <dd>{{ valor ?? '—' }}</dd>
            </div>
          </dl>

          <h3 class="eyebrow consulta__secao">Certificados ({{ resultado.certificados.length }})</h3>
          <ul class="envios">
            <li v-for="c in resultado.certificados" :key="c.id">
              {{ c.ano }} · {{ rotuloDoTipo(c.tipo) }} · {{ SITUACOES[c.situacao].rotulo }}<template v-if="c.codigo"> · <span class="mono">{{ c.codigo }}</span></template>
            </li>
            <li v-if="!resultado.certificados.length">Nenhum.</li>
          </ul>

          <h3 class="eyebrow consulta__secao">E-mails enviados ({{ resultado.emails.length }})</h3>
          <ul class="envios">
            <li v-for="e in resultado.emails" :key="e.id">
              {{ dataHora(e.enviado_em) }} — {{ e.assunto }}
            </li>
            <li v-if="!resultado.emails.length">Nenhum.</li>
          </ul>

          <Message v-if="emitidos.length" severity="warn" :closable="false" class="consulta__aviso">
            Esta pessoa tem {{ emitidos.length }} certificado(s) emitido(s). Antes de excluir, avise que o certificado sai da página de validação e peça que guarde o PDF: com o arquivo, ela ainda comprova que é o original.
          </Message>

          <div v-if="temAlgo" class="consulta__acoes">
            <Button label="Anonimizar titular" icon="pi pi-trash" severity="danger" size="small" @click="pedirAnonimizacao" />
          </div>
        </template>
      </section>
    </div>

    <div v-show="aba === 'historico'">
      <Estado v-if="erroDoHistorico" tipo="erro" :falha="erroDoHistorico" @tentar="carregaAuditoria" />
      <Estado v-else-if="!auditorias" tipo="carregando" />

      <section v-else class="cartao cartao--tabela">
        <DataTable :value="auditorias" data-key="id">
          <template #empty>
            <Estado tipo="vazio" titulo="Nenhum acesso registrado" texto="Consultas e exportações de dado pessoal aparecem aqui." />
          </template>
          <Column field="created_at" header="Quando">
            <template #body="{ data }">{{ dataHora(data.created_at) }}</template>
          </Column>
          <Column header="Quem">
            <template #body="{ data }"><strong>{{ data.user?.name ?? '—' }}</strong></template>
          </Column>
          <Column field="acao" header="Ação">
            <template #body="{ data }"><span class="mono">{{ data.acao }}</span></template>
          </Column>
          <Column field="alvo" header="Alvo">
            <template #body="{ data }"><span class="mono">{{ data.alvo }}</span></template>
          </Column>
          <Column field="ip" header="IP">
            <template #body="{ data }"><span class="mono">{{ data.ip }}</span></template>
          </Column>
        </DataTable>
      </section>
    </div>

    <Dialog
      v-model:visible="confirmando"
      modal
      :draggable="false"
      header="Anonimizar titular?"
      :style="{ width: '30rem', maxWidth: 'calc(100vw - 2rem)' }"
    >
      <template v-if="resultado">
        <p class="confirma__titular">Titular: <strong class="mono">{{ resultado.email }}</strong></p>

        <div class="confirma__perigo">
          <i class="pi pi-exclamation-triangle" />
          <div>
            <strong>Esta ação não pode ser desfeita.</strong>
            <ul>
              <li>Nome, e-mail, WhatsApp e respostas somem de {{ resultado.inscricoes.length }} inscrição(ões).</li>
              <li>Nome, e-mail, telefone, ingresso e pedido somem de {{ resultado.participantes.length }} ingresso(s). A presença fica, sem identificar a pessoa, e futuras importações não a trazem de volta.</li>
              <li v-if="resultado.certificados.length">
                {{ resultado.certificados.length }} certificado(s): rascunho sai inteiro; emitido perde nome, e-mail e PDF e fica como "cancelado a pedido do titular". Código e hash ficam, sem dado pessoal.
              </li>
              <li>No log de envio e no aviso de certificado, o endereço vira um hash.</li>
              <li>A data e a versão do aceite de LGPD ficam, como prova do consentimento.</li>
              <li>A ação fica registrada no histórico de acesso.</li>
            </ul>
          </div>
        </div>

        <label for="palavra" class="confirma__rotulo">Para confirmar, digite {{ PALAVRA }}</label>
        <InputText id="palavra" v-model="digitado" :placeholder="PALAVRA" autocomplete="off" autofocus fluid />
      </template>

      <template #footer>
        <Button label="Cancelar" severity="secondary" text @click="confirmando = false" />
        <Button
          label="Anonimizar definitivamente"
          icon="pi pi-trash"
          severity="danger"
          :disabled="!podeAnonimizar"
          :loading="anonimizando"
          @click="anonimizar"
        />
      </template>
    </Dialog>
  </Pagina>
</template>

<style scoped>
.abas {
  align-self: flex-start;
}

.consulta {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: var(--space-4);
  align-items: start;
}

.procura {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.procura label,
.confirma__rotulo {
  display: block;
  font-size: 0.8125rem;
  font-weight: var(--fw-semibold);
  color: var(--text-strong);
}

.procura :deep(.p-button) {
  margin-top: var(--space-2);
}

.consulta__aviso {
  margin-top: var(--space-3);
}

.consulta__secao {
  margin: var(--space-5) 0 var(--space-3);
  font-weight: 400;
  line-height: inherit;
}

.consulta__inscricao {
  padding: var(--space-4);
  background: var(--sand-100);
  border-radius: var(--radius-md);
}

.consulta__inscricao + .consulta__inscricao {
  margin-top: var(--space-3);
}

.envios {
  margin: 0;
  padding-left: 1.1rem;
  font-size: var(--text-sm);
}

.consulta__acoes {
  display: flex;
  justify-content: flex-end;
  padding-top: var(--space-4);
  margin-top: var(--space-5);
  border-top: 1px solid var(--border-subtle);
}

.confirma__titular {
  margin: 0 0 var(--space-3);
  font-size: var(--text-sm);
}

.confirma__perigo {
  display: flex;
  gap: 0.625rem;
  padding: 0.75rem 0.875rem;
  margin-bottom: var(--space-4);
  font-size: 0.84375rem;
  color: var(--brick-600);
  background: var(--brick-100);
  border-radius: var(--radius-md);
}

.confirma__perigo ul {
  padding-left: 1.1rem;
  margin: 0.375rem 0 0;
}

.confirma__rotulo {
  margin-bottom: 0.375rem;
}

@media (max-width: 47.99rem) {
  .consulta {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
