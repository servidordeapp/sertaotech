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

**Decisão pendente:** Google Forms (recomendado) ou formulário próprio no site.

- **Google Forms:** é a ferramenta que o projeto já usa, não exige código e as
  respostas caem no Sheets. Desvantagem: a pessoa sai do site.
- **Formulário no site enviando para o `formResponse` do Google Forms:** a
  pessoa não sai do site, mas a integração quebra se o form mudar.
- Uma função na Vercel com banco seria exagero para três listas.

Campos:

- [ ] **Participante:** nome, e-mail, WhatsApp, cidade, perfil (estudante,
      profissional, curioso).
- [ ] **Palestrante:** nome, e-mail, WhatsApp, tema ou área, link (LinkedIn ou
      GitHub), já palestrou?
- [ ] **Patrocinador:** empresa, nome do contato, e-mail, WhatsApp, cota de
      interesse.
- [ ] Os três forms com aviso de LGPD: para que o dado vai ser usado e como
      pedir a remoção.

## Fase 3 — Nova home `/` (regras 2, 3 e 7)

Usa os mesmos `ds/styles.css` e `css/site.css`. O CSS novo fica só na galeria.

1. [ ] **Hero com foto da 2ª edição:** título "Sertão Tech 2027", subtítulo e
       um botão principal, "Entrar na lista de espera" (participante).
2. [ ] **Números de 2026:** inscritos, palestras, caravanas, cidades.
3. [ ] **Galeria:** de 4 a 6 fotos em grid CSS com `srcset`. Todas com
       `loading="lazy"`, exceto a do hero, que leva `fetchpriority="high"`.
4. [ ] **Três cards:** Participar, Palestrar e Patrocinar, cada um levando ao
       seu formulário.
5. [ ] **"Quem apoiou em 2026" (regra 7):** cópia do bloco `#patrocinadores`
       com `utm_content=home2027-<cota>`.
6. [ ] **Botão final** para a lista de espera, mais o link "Ver como foi a
       edição 2026" apontando para `/2026`.
7. [ ] **Nav enxuta:** "Edição 2026" e o botão da lista de espera.

## Fase 4 — SEO e analytics

- [ ] Novos `<title>`, `description` e `og:*` focados em 2027.
- [ ] Novo `og-cover` gerado com `scripts/og-card.mjs`.
- [ ] JSON-LD só com `Organization`. O `Event` de 2027 entra quando houver data.
- [ ] `sitemap.xml`: entram `/` e `/2026`, saem as URLs antigas.
- [ ] Evento GA4 `waitlist_click` com o parâmetro `tipo` (participante,
      palestrante ou patrocinador), no mesmo padrão do `sponsor_click`.
      Registrar `tipo` como custom dimension no GA4 antes de publicar.

## Fase 5 — Documentação e verificação

- [ ] Atualizar `assets/patrocinadores/README.md`, que hoje diz que o mural
      fica em `/` e `/patrocinio`.
- [ ] Testar com `vercel dev`, que respeita `cleanUrls` e os redirects:
  - [ ] as rotas antigas redirecionam para `/2026/...`;
  - [ ] nenhum asset dá 404 em `/2026`;
  - [ ] os três formulários abrem e registram a resposta;
  - [ ] Lighthouse mobile da home ≥ 90 em performance.

## Decisões em aberto

- [ ] Formulários: Google Forms ou formulário no site?
- [ ] 2027 já tem data ou local, ou fica "em breve"?
- [ ] Números de 2026 para a prova social.
- [ ] "Apoio e comunidades" (PHP PI, PHPWomen PI, UFDPar) entra na prova social?

## Histórico

- 2026-10-21 — Primeira versão do plano.
- 2026-10-21 — Fase 0: fotos otimizadas em `assets/fotos/` e originais apagados.
- 2026-10-21 — Fotos renomeadas por momento (abertura, After), foto da
  equipe organizadora adicionada e hero definido (`foto-oficial`).
- 2026-10-21 — Fase 0 concluída: ordem da galeria, `alt` e autorização de uso definidos.
- 2026-10-21 — Fase 1 concluída: edição 2026 arquivada em `/2026` com redirects.
