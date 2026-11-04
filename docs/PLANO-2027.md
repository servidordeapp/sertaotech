# Plano de migração — Sertão Tech 2027

Documento vivo. Edite à vontade e versione junto com o código.

**Objetivo:** arquivar a edição 2026 em `/2026` e transformar a home numa página
de captação para 2027, com três listas de espera (participantes, palestrantes e
patrocinadores) e prova social da 2ª edição.

## Regras

1. O site atual vai para a rota `/2026`.
2. A home tem fotos da 2ª edição.
3. O objetivo da home é levar as pessoas para a lista de espera de 2027.
4. Lista de espera para patrocinadores.
5. Lista de espera para palestrantes.
6. Lista de espera para participantes.
7. Seção de prova social com os patrocinadores de 2026.

## Estado atual (base para a migração)

- Site estático, sem framework, na Vercel com `cleanUrls` (`vercel.json`). Não tem backend.
- A captação de hoje fica fora do site: palestrantes via Google Forms
  (`palestrantes/index.html:108`), patrocínio e lista de espera via WhatsApp
  (`index.html:1307`).
- `index.html` tem 9 caminhos relativos (`assets/...`, `css/site.css`,
  `ds/styles.css`, nas linhas 19-20, 40-41, 506, 543, 1278, 1319). Eles
  quebram quando o arquivo for para `/2026/`.
- O mural de patrocinadores (`#patrocinadores`, `index.html:724`) já tem CSS e
  eventos GA4 (`sponsor_impression` e `sponsor_click`). Vai ser reaproveitado.
- Fotos da 2ª edição: em `assets/fotos/` (ver Fase 0).

## Fase 0 — Fotos

- [x] Otimizar com a skill `webp-optimizer` (sharp, qualidade 80): WebP em
      640, 1280 e 1920 px de largura, salvo em `assets/fotos/2026-<slug>-<largura>.webp`.
      Ficou 2 MB no total, contra 125 MB dos originais.
- [x] Meta de peso: até ~250 KB na versão de 1920 px e até ~60 KB na de 640 px.
      Resultado: 149 a 234 KB em 1920 px, 89 a 124 KB em 1280 px, 35 a 47 KB em 640 px.
- [x] Remover os metadados EXIF (GPS e dados da câmera). Conferido: as saídas
      não têm EXIF nem XMP.
- [x] Apagar os originais (`SOUZ*.jpg`) depois de otimizar.
- [x] Foto do hero: `foto-oficial`.
- [x] Ordem da galeria: a mesma da tabela abaixo. Na galeria do participante
      entram, nesta ordem, `abertura`, `minicurso` e `equipe-organizadora`. A
      `foto-oficial` já está no hero e as fotos do After vão para os cards.
- [x] `alt` de cada foto revisado: vale o texto da tabela.
- [x] Autorização de uso: as fotos foram feitas por um fotógrafo profissional
      contratado pela organização. A página não leva crédito do fotógrafo.

**Fase 0 concluída.**

Todas em paisagem, proporção 3:2. Todas com 640, 1280 e 1920 px de largura.

| Slug | Original | Momento | Cena (rascunho de `alt`) |
| --- | --- | --- | --- |
| `foto-oficial` | SOUZ6513 | Evento | Foto oficial: participantes e organização reunidos de pé no auditório da UFDPar. **Hero.** |
| `abertura` | SOUZ6128 | Evento | Abertura: três convidados à mesa e o público no auditório, com o logo do Sertão Tech no telão. |
| `minicurso` | SOUZ6152 | Evento | Minicurso: participantes atentos numa sala de aula. |
| `equipe-organizadora` | SOUZ6313 | Evento | Equipe organizadora: dez pessoas com a camiseta do Sertão Tech, lado a lado no auditório. |
| `palestra` | SOUZ6160 | Evento | Palestra: palestrante de microfone na mão, de costas, falando para o auditório cheio. |
| `publico` | SOUZ6155 | Evento | Público: participantes sentados no auditório, atentos à palestra. |
| `coffee-break` | SOUZ6305 | Evento | Coffee break: participantes e organização em volta da mesa de lanches. |
| `organizacao-camiseta` | SOUZ6202 | Evento | Integrante da organização, de costas, com a camiseta do Sertão Tech, olhando para o auditório. |
| `after-networking` | SOUZ6578 | After | Sertão Tech After: três convidados conversando. |
| `after-petiscos` | SOUZ6573 | After | Sertão Tech After: convidados se servindo de petiscos. |
| `after-bar` | SOUZ6575 | After | Sertão Tech After: bartender preparando drinks para os convidados. |

**Sertão Tech After:** encontro privado com palestrantes, patrocinadores e
organização. Não é aberto aos inscritos. Na home, as fotos do After entram
como benefício de quem palestra e de quem patrocina (cards "Palestrar" e
"Patrocinar"), não na galeria do participante, para não prometer algo que o
ingresso não inclui.

## Fase 1 — Arquivar 2026 em `/2026`

- [x] `git mv index.html 2026/index.html`.
- [x] `git mv` de `palestrantes/`, `patrocinio/` e `caravanas/` para `2026/`,
      porque o conteúdo delas é todo de 2026.
- [x] Trocar os 9 caminhos relativos por absolutos (`/assets/...`, `/css/...`, `/ds/...`).
- [x] Atualizar os links internos `/palestrantes`, `/patrocinio` e
      `/caravanas` para `/2026/...` nas páginas movidas (nav, footer e corpo).
- [x] Atualizar `canonical` e `og:url` para `/2026...`.
- [x] Colocar uma faixa "Edição encerrada" no topo das páginas de 2026, com
      link para a home.
- [x] Os botões "Esgotado" e o modal do WhatsApp passam a levar para a lista de
      espera de 2027 na home.
- [x] Manter o JSON-LD do `Event` de 2026 (evento passado continua válido).
- [x] Em `vercel.json`, redirecionar `/palestrantes`, `/patrocinio` e
      `/caravanas` para `/2026/...` com `permanent: false`. Os links já
      compartilhados continuam funcionando e as rotas ficam livres para 2027.
- [x] `impressos/`, `cerimonial/` e `mesa-redonda/` ficam onde estão
      (são internas). Revisar os links de `links/index.html`.
      Conferido: `links/` só redireciona para um link externo e `impressos/`
      usa caminhos relativos entre pastas que não mudaram.

Notas da execução:

- Os botões "Esgotado" viraram "Lista de espera 2027" e apontam para
  `/#lista-de-espera`. **A Fase 3 precisa criar esse `id` na nova home.**
- O modal do WhatsApp (`#waitlistModal`) foi removido. Os dois botões que o
  abriam agora são links diretos para a lista de espera.
- Na home 2026 o `@id` do `Event` passou a ser `/2026#event`, e as páginas
  internas apontam para ele. O `WebSite` continua em `/#website`.
- O script de GA4 detectava a página com `pathname.indexOf('/patrocinio')`.
  Agora usa `/2026/patrocinio`, para manter `utm_content` e os eventos certos.
- Faixa: classe `.edition-banner` em `css/site.css`.
- Até a Fase 3, `/` não tem `index.html` e retorna 404. Não publicar antes.

**Fase 1 concluída.**


## Fase 2 — Listas de espera (regras 4, 5 e 6)

> **Decisão revista em 2026-11-03: Google Forms está fora.** As três listas
> vão virar **formulário próprio**, feito no site. Motivo: a pessoa não sai
> mais do site e os dados ficam com a organização.
>
> O que continua valendo desta fase: o **conteúdo** — perguntas, tipos,
> obrigatoriedade e o bloco de LGPD das seções abaixo. É a especificação do
> formulário próprio, só muda a implementação.
>
> O que saiu: os passos de criar form no Google, vincular ao Planilhas e
> coletar o `viewform`. `scripts/listas-de-espera.gs` ficou morto — apagar
> quando o formulário próprio existir (ou antes, está no histórico do git).
>
> Em aberto, para a fase do formulário próprio: onde a resposta é gravada
> (banco, planilha ou e-mail), e se precisa de `api/` — hoje o site é estático.

**Pendente, bloqueando os 11 botões de `index.html`:**

- [ ] Definir e construir o formulário próprio (3 listas: participante,
      palestrante, patrocinador), com o conteúdo das seções abaixo e o bloco
      de LGPD como última seção.
- [ ] Form 1: caixa opcional de compartilhamento com patrocinadores, com as 4
      regras da seção "Bloco de compartilhamento" — principalmente gravar a
      versão do texto aceita e não bloquear o envio.
- [ ] Página pública de patrocinadores e parceiros de 2027, citada no texto do
      compartilhamento. Sem ela a finalidade fica indeterminada.
- [ ] Revisão jurídica do bloco de LGPD e do de compartilhamento.
- [ ] Decidir onde as respostas caem e como a organização as lê.
- [ ] Trocar os 3 marcadores `FORM_*` em `index.html` pelas URLs reais.
      A Fase 4 continua medindo `waitlist_click` pelo `data-waitlist`, que não
      depende do destino.

**Decisão antiga (Google Forms), mantida só como registro:**

- [x] ~~Criar os 3 forms no Google Forms.~~ Cancelado.
- [x] ~~Vincular ao Planilhas, uma aba por form.~~ Cancelado.

### Bloco LGPD

Vai como a **última seção** de cada form: um bloco de texto seguido da
pergunta de consentimento. O texto abaixo é igual nos três; o Form 1 ganha
um segundo bloco, de compartilhamento (ver adiante).

> **Como usamos seus dados**
>
> Os dados deste formulário servem só para a organização do Sertão Tech
> avisar você sobre a edição 2027: {FINALIDADE}. Só a organização tem acesso
> a eles, e não vendemos nem repassamos para terceiros. Guardamos os dados
> até o fim da edição 2027. Para corrigir ou apagar os seus dados a qualquer
> momento, chame a organização no WhatsApp +55 (86) 99920-2231 ou no
> Instagram @osertaotech.

Troque `{FINALIDADE}` por:

- Participante: "abertura das inscrições, data e local"
- Palestrante: "abertura da chamada de palestras e próximos passos da curadoria"
- Patrocinador: "cotas, valores e prazos de patrocínio"

Pergunta "Consentimento" (caixa de seleção, **obrigatória**), com uma única
opção: "Li e concordo com o uso dos meus dados como descrito acima."

Esta caixa cobre **só o uso interno**. Nada de compartilhamento entra aqui:
autorização genérica é nula (LGPD art. 8 §4) e repasse para outro controlador
exige consentimento específico (art. 7 §5). Juntar os dois numa caixa
obrigatória invalida o consentimento do repasse e derruba a conversão de quem
só quer saber a data do evento.

### Bloco de compartilhamento — **só no Form 1 (participante)**

Vem depois do bloco de LGPD, como penúltima coisa do form. Fora dos Forms 2 e
3 de propósito: palestrante já fala direto com a organização, e patrocinador é
o próprio parceiro.

> **Compartilhamento com patrocinadores e parceiros (opcional)**
>
> Se você autorizar abaixo, compartilhamos seu nome, e-mail e WhatsApp com as
> empresas e instituições que patrocinam ou apoiam a edição 2027 — a lista
> delas fica publicada em sertaotech.com.br. Elas podem falar com você sobre
> vagas, cursos e oportunidades, e passam a responder pelos seus dados por
> conta própria, pelo prazo e pela política de cada uma. É opcional: deixar
> desmarcado não muda nada na sua inscrição nem no aviso sobre o evento. Para
> voltar atrás, chame a organização no WhatsApp +55 (86) 99920-2231 — tiramos
> você dos próximos repasses, mas quem já recebeu precisa ser avisado caso a
> caso.

Pergunta "Compartilhamento" (caixa de seleção, **não obrigatória**, desmarcada
por padrão), com uma única opção: "Autorizo o Sertão Tech a compartilhar meu
nome, e-mail e WhatsApp com os patrocinadores e parceiros da edição 2027."

Quatro regras que fazem esse consentimento valer. Não são detalhe de texto:

1. **Não bloqueia o envio.** Form só rejeita por causa da caixa obrigatória de
   LGPD. Desmarcar o compartilhamento tem que mandar normalmente.
2. **Lista nomeada e pública.** "Parceiros que ajudaram a construir o evento" é
   finalidade indeterminada. Precisa da página pública de patrocinadores,
   citada no texto. Patrocinador que entra depois **não** está coberto pelo
   consentimento já dado.
3. **Registro de quem aceitou.** O ônus de provar o consentimento é da
   organização (art. 37). Cada resposta grava data/hora e a **versão do texto**
   aceita. Mais um motivo para o formulário próprio: Google Forms não dá isso.
4. **Só nome, e-mail e WhatsApp.** Cidade e "qual seu perfil?" são para a
   curadoria, não para o comercial de terceiro.

Isso abre uma exceção na retenção prometida no bloco de LGPD ("até o fim da
edição 2027"): o que foi para o patrocinador não morre nessa data, e o texto
acima diz isso. Sem essa frase a promessa fica falsa.

Texto e desenho seguem a LGPD como escrita, mas vale revisão jurídica antes de
ir ao ar.

### Form 1 — Participante

- **Título:** Sertão Tech 2027 — Lista de espera
- **Descrição:** A 2ª edição esgotou. Deixe seu contato e avisamos você
  primeiro quando as inscrições de 2027 abrirem.

| Pergunta | Tipo | Obrigatória | Opções / validação |
| --- | --- | --- | --- |
| Nome | Resposta curta | Sim | |
| E-mail | Resposta curta | Sim | Validação: texto → e-mail |
| WhatsApp (com DDD) | Resposta curta | Sim | Ajuda: "Ex.: (86) 99999-9999" |
| Cidade | Resposta curta | Sim | |
| Qual seu perfil? | Múltipla escolha | Sim | Estudante · Profissional de tecnologia · Migrando de carreira · Curioso(a) |
| Bloco LGPD | | Sim | |
| Compartilhamento com patrocinadores | Caixa de seleção | **Não** | Desmarcada por padrão. Repassa nome, e-mail e WhatsApp |

### Form 2 — Palestrante

- **Título:** Sertão Tech 2027 — Quero palestrar
- **Descrição:** A chamada de palestras de 2027 ainda não abriu. Deixe seu
  contato e o tema que você quer apresentar, e avisamos você quando abrir.

| Pergunta | Tipo | Obrigatória | Opções / validação |
| --- | --- | --- | --- |
| Nome | Resposta curta | Sim | |
| E-mail | Resposta curta | Sim | Validação: texto → e-mail |
| WhatsApp (com DDD) | Resposta curta | Sim | |
| Tema ou área da palestra | Parágrafo | Sim | Ajuda: "Pode ser só uma ideia, a gente ajuda a lapidar." |
| LinkedIn ou GitHub | Resposta curta | Não | Validação: texto → URL |
| Já palestrou antes? | Múltipla escolha | Sim | Nunca palestrei · Já palestrei em eventos menores · Já palestrei em eventos grandes |
| Bloco LGPD | | Sim | |

### Form 3 — Patrocinador

- **Título:** Sertão Tech 2027 — Quero patrocinar
- **Descrição:** Em 2026 o Sertão Tech reuniu a comunidade de tecnologia do
  Piauí na UFDPar. Deixe seu contato e enviamos as cotas de 2027 assim que
  saírem.

| Pergunta | Tipo | Obrigatória | Opções / validação |
| --- | --- | --- | --- |
| Empresa | Resposta curta | Sim | |
| Nome do contato | Resposta curta | Sim | |
| E-mail | Resposta curta | Sim | Validação: texto → e-mail |
| WhatsApp (com DDD) | Resposta curta | Sim | |
| Cota de interesse | Múltipla escolha | Sim | Ouro · Prata · Bronze · Apoio (espaço, coffee break, brindes) · Ainda não sei |
| Bloco LGPD | | Sim | |

## Fase 3 — Nova home `/` (regras 2, 3 e 7)

Usa os mesmos `ds/styles.css` e `css/site.css`. O CSS novo fica só na galeria.

1. [x] **Hero com foto da 2ª edição:** título "Sertão Tech 2027", subtítulo e
       um botão principal, "Entrar na lista de espera" (participante).
2. [x] **Números de 2026:** 233 inscritos, 16 palestras e minicursos
       (contado do JSON-LD de `/2026`), 4 caravanas e 4 cidades (Parnaíba,
       Luís Correia, Buriti dos Lopes e Teresina).
3. [x] **Galeria:** de 4 a 6 fotos em grid CSS com `srcset`. Todas com
       `loading="lazy"`, exceto a do hero, que leva `fetchpriority="high"`.
4. [x] **Três cards:** Participar, Palestrar e Patrocinar, cada um levando ao
       seu formulário.
5. [x] **"Quem apoiou em 2026" (regra 7):** cópia do bloco `#patrocinadores`
       com `utm_content=home2027-<cota>`.
6. [x] **Botão final** para a lista de espera, mais o link "Ver como foi a
       edição 2026" apontando para `/2026`.
7. [x] **Nav enxuta:** "Edição 2026" e o botão da lista de espera.
8. [ ] Trocar os marcadores `FORM_PARTICIPANTE`, `FORM_PALESTRANTE` e
       `FORM_PATROCINADOR` em `index.html` pelas URLs do formulário próprio
       (Fase 2). **Único item que falta para a Fase 3 fechar.**

Notas da execução:

- A seção dos cards tem `id="lista-de-espera"`, o destino dos botões de `/2026`.
- Fotos: hero `foto-oficial`. Galeria com 7 fotos em 4 colunas (2 no
  celular): `abertura` (2x2), `palestra`, `publico`, `minicurso`,
  `coffee-break` e, na última linha, `organizacao-camiseta` e
  `equipe-organizadora` (2 colunas cada). As quatro do meio foram
  adicionadas em 2026-10-28, com o mesmo tratamento da Fase 0. Os cards ficaram só com ícone, para manter os três
  iguais. As três fotos do After ficam numa faixa "Sertão Tech After" logo
  abaixo dos cards, com o texto "quem palestra ou patrocina participa".
- "Apoio e comunidades" entrou no mural, igual a `/2026`. Para tirar, apague
  o `.logo-tier` de apoio em `index.html`.
- O script de métricas de patrocinador foi copiado com `sponsor_page:
  'home2027'`, para separar os cliques desta home dos da home de 2026.
- CSS novo no bloco "home 2027" de `css/site.css`.
- Hero sem data: "Data e local em breve".
- `<title>`, `description` e `og:*` provisórios (viraram definitivos na Fase 4).
- Não deu para testar no navegador (o Chromium do ambiente não roda por
  falta de libs do sistema). Conferido: todos os assets existem, as tags
  estão balanceadas e os `id` são únicos. Falta conferir o visual no
  desktop e no celular.

## Fase 4 — SEO e analytics

- [x] Novos `<title>`, `description` e `og:*` focados em 2027. Os textos
      provisórios da Fase 3 ficaram como definitivos.
- [x] Nova arte de compartilhamento gerada com `node scripts/og-card.mjs 2027`.
      Sai em `assets/og-2027.jpg`, e não em `og-cover.jpg`, porque `/2026`
      continua usando a `og-cover` e `/assets` tem cache `immutable` de 1 ano
      (sobrescrever deixaria a arte velha nos caches).
- [x] JSON-LD só com `Organization`. O `Event` de 2027 entra quando houver data.
- [x] `sitemap.xml`: entram `/` e `/2026`, saem as URLs antigas.
- [x] Evento GA4 `waitlist_click` com o parâmetro `tipo` (participante,
      palestrante ou patrocinador). O `tipo` vem do atributo `data-waitlist`
      de cada link de formulário. Link novo para um form só precisa do atributo.
- [ ] **Manual, antes de publicar:** no GA4 (Admin → Custom definitions),
      registrar `tipo` como dimensão personalizada com escopo de evento. Não é
      retroativo. Conferir no DebugView que o `waitlist_click` chega.

## Fase 5 — Documentação e verificação

- [ ] Atualizar `assets/patrocinadores/README.md`, que hoje diz que o mural
      fica em `/` e `/patrocinio`.
- [ ] Testar com `vercel dev`, que respeita `cleanUrls` e os redirects:
  - [ ] as rotas antigas redirecionam para `/2026/...`;
  - [ ] nenhum asset dá 404 em `/2026`;
  - [ ] os três formulários abrem e registram a resposta;
  - [ ] Lighthouse mobile da home ≥ 90 em performance.

## Decisões em aberto

- [x] Formulários: ~~Google Forms~~ → formulário próprio (revisto em 2026-11-03, ver Fase 2).
- [x] 2027 tem data e local: 15 e 16 de outubro de 2027, na UFDPar, em
      parceria com o Bacharelado em Inteligência Artificial. Na home:
      hero, CTA, rodapé, metas, JSON-LD `Event` e arte `og-2027-data.jpg`.
- [x] Números de 2026 para a prova social.
- [ ] "Apoio e comunidades" (PHP PI, PHPWomen PI, UFDPar) entra na prova social?

## Histórico

- 2026-10-21 — Primeira versão do plano.
- 2026-10-21 — Fase 0: fotos otimizadas em `assets/fotos/` e originais apagados.
- 2026-10-21 — Fotos renomeadas por momento (abertura, After), foto da
  equipe organizadora adicionada e hero definido (`foto-oficial`).
- 2026-10-21 — Fase 0 concluída: ordem da galeria, `alt` e autorização de uso definidos.
- 2026-10-21 — Fase 1 concluída: edição 2026 arquivada em `/2026` com redirects.
- 2026-10-21 — Fase 2: decidido Google Forms. Conteúdo dos 3 forms e do aviso de LGPD especificado.
- 2026-10-28 — Fase 2: script `scripts/listas-de-espera.gs` para criar os 3 forms e a planilha.
- 2026-10-28 — Fase 3: nova home em `index.html`, com marcadores no lugar dos links dos forms.
- 2026-10-28 — Fase 3: números de 2026 preenchidos e 4 fotos novas (SOUZ6155, 6160, 6202 e 6305) na galeria.
- 2026-10-28 — Fase 4: arte `og-2027.jpg`, JSON-LD `Organization`, sitemap e evento `waitlist_click`.
- 2026-11-02 — Data e local de 2027 definidos: 15 e 16 de outubro, UFDPar.
- 2026-11-02 — Home com a data: hero, CTA, rodapé, metas, JSON-LD `Event` de 2027 e arte nova `og-2027-data.jpg` (nome novo por causa do cache immutable).
- 2026-11-03 — Fase 2: Google Forms abandonado. As listas de espera vão virar
  formulário próprio; o conteúdo das perguntas e o bloco de LGPD continuam
  valendo como especificação. `scripts/listas-de-espera.gs` ficou morto.
- 2026-11-03 — Comentário dos marcadores `FORM_*` em `index.html` atualizado:
  os 11 botões seguem sem destino até o formulário próprio existir.
- 2026-11-03 — Fase 2: compartilhamento de dados com patrocinadores aceito, mas
  como caixa **opcional e separada** no Form 1 (participante), repassando só
  nome, e-mail e WhatsApp. Consentimento obrigatório segue cobrindo apenas o uso
  interno — juntar os dois anularia o do repasse (LGPD art. 8 §4 e art. 7 §5).
  Depende de página pública de patrocinadores e de revisão jurídica.
