# SEO local do Sertão Tech — o que só você pode fazer

O que está no repositório já está feito: estrutura de URL, schema, sitemap,
conteúdo, links internos e as verificações de build. Este documento é a outra
metade — a parte que não é código e sem a qual o resto rende bem menos.

Leia na ordem. Os itens 1 e 2 têm prazo; os outros são contínuos.

---

## 0. O que esperar, sem ilusão

Três coisas honestas antes de começar:

- **Busca local demora.** Página nova em domínio pequeno leva de semanas a
  meses pra estabilizar. O que você vai ver primeiro (em dias) é indexação;
  posição vem depois.
- **Schema não coloca você no mapa do Google.** O bloco do Google Maps com
  três resultados — o *local pack* — sai **exclusivamente** do Google Business
  Profile. Marcação no site ajuda o Google a entender e reconciliar a
  entidade, e gera rich result de evento, mas não substitui o perfil.
- **Rich result de FAQ e de HowTo praticamente não aparece mais.** O Google
  restringiu FAQ a sites de governo e saúde e aposentou o HowTo. A marcação
  continua no site porque é correta, ajuda máquina a entender a página e
  alimenta buscas com IA — mas não conte com o acordeão no resultado.
  O rich result que **vale de verdade** aqui é o de **Evento**, e esse já
  está funcionando.

---

## 1. Google Search Console — na primeira semana

Sem isso você está otimizando no escuro.

1. Acesse [search.google.com/search-console](https://search.google.com/search-console)
   com a conta que administra o site.
2. Adicione **duas** propriedades:
   - **Domínio** (`osertaotech.com.br`) — cobre http, https e subdomínios.
     Verificação por registro **TXT no DNS**. O domínio está na Vercel, então
     o TXT é adicionado em *Project → Settings → Domains*, ou no painel de
     quem registrou o domínio.
   - **Prefixo de URL** (`https://osertaotech.com.br/`) — dá alguns relatórios
     que a propriedade de domínio não dá.
3. Em **Sitemaps**, envie `sitemap-index.xml`.
   `sitemap.xml` continua respondendo (existe um rewrite no `vercel.json`
   apontando pro índice), então nada que já estava enviado se perde.
4. Em **Inspeção de URL**, peça indexação de cada URL nova, uma por uma:

   ```
   /eventos-de-tecnologia-parnaiba      ← prioridade máxima, é a página-âncora
   /blog
   /sobre
   /edicoes
   /blog/sertao-tech-2026-guia-de-quem-vai
   /blog/eventos-de-tecnologia-no-piaui-2026
   /blog/como-comecar-na-tecnologia-em-parnaiba
   /blog/comunidades-de-tecnologia-no-norte-do-piaui
   /blog/como-organizar-caravana-para-evento-de-tecnologia
   /blog/primeira-palestra-em-evento-de-tecnologia
   /blog/vale-a-pena-patrocinar-evento-de-tecnologia-regional
   ```

5. Depois de 48h, confira:
   - **Páginas** → nada de erro novo. Se `/cerimonial/...` ou
     `/mesa-redonda/...` aparecerem como indexados, avise — o `robots.txt`
     bloqueia o rastreio, mas se já estavam no índice o que remove é o
     `noindex` (que já está no template do `build-html.py`), e pra ele ser
     lido o `Disallow` precisa sair por umas 4 semanas.
   - **Aprimoramentos → Eventos** → zero erro. Esse é o rich result que
     importa.

**Também vale:** conferir se o Google Analytics 4 (`G-62RC94ZH1Z`) continua
registrando `page_view` depois de cada deploy grande. É o alarme mais rápido
pra qualquer problema de script.

---

## 2. Google Business Profile — tente, mas sem depender

Aqui está a parte desconfortável: **o Sertão Tech pode não ser elegível.**
O Google exige, pra um perfil, um endereço físico onde a equipe atenda, ou
status de negócio com área de atendimento (contato presencial no local do
cliente). Um evento anual que empresta o campus da UFDPar por sete horas não
se encaixa bem em nenhum dos dois, e criar um perfil com o endereço da
universidade seria informação falsa — além de disputar com o perfil da própria
UFDPar.

Recomendação: **tente com o endereço comercial real da organização**, se
existir um (CNPJ, escritório, endereço de quem organiza), configurado como
negócio com área de atendimento cobrindo Parnaíba e região. Se for recusado,
sem drama — não construa a estratégia em cima disso.

Se der pra criar:

- **Categoria principal:** *Organizador de eventos*. Secundária: *Serviço de
  educação* ou similar.
- **Área de atendimento:** Parnaíba, Luís Correia, Piripiri, Teresina.
- **NAP consistente.** Escreva o nome, o endereço e o telefone **exatamente
  igual** em todo lugar — perfil, site, Sympla, Instagram, redes. Divergência
  de NAP é o erro clássico de SEO local. O telefone canônico é
  **+55 (86) 99920-2231**.
- **Fotos.** Do evento, do público, do palco. Perfil sem foto não ranqueia.
- **Posts.** Um por semana no mês do evento.
- **Avaliações.** No dia do evento, peça avaliação para participantes e
  patrocinadores. Volume e recência de avaliação são fatores reais do local
  pack.

---

## 3. Citações locais — onde o nome do evento tem que aparecer

Cada uma dessas é uma menção e, na maioria, um link. Mais importante que o
link: é onde uma pessoa da região realmente procura evento.

**Plataformas de evento**
- Sympla — já tem. Confira se a descrição e o endereço batem com o site.
- Meetup — crie o grupo "Sertão Tech" e publique o evento.
- Eventbrite e Facebook Events — mesmo evento, mesma descrição, link pro site.

**Instituições**
- **UFDPar** — a mais valiosa da lista. É um domínio `.edu.br` com autoridade
  alta. Peça notícia no portal da universidade e nos canais dos cursos
  envolvidos. Palestrante que é professor da casa é o caminho mais fácil
  (Ariel Teles está na programação de 2026).
- Coordenações de curso de UFPI, UESPI e institutos federais da região.
- Escolas técnicas que mandem caravana — quase sempre publicam no site.

**Poder público e entidades**
- Portal da Prefeitura de Parnaíba (agenda de eventos da cidade).
- Secretaria estadual de ciência e tecnologia do Piauí.
- SEBRAE Piauí e conselhos ligados a inovação.

**Imprensa local**
- Portais de notícia do Piauí. Mande release curto: o que é, quando, onde,
  quanto custa, quem palestra, e uma frase sobre por que importa pra região.
  Sete a dez dias antes do evento.

**Comunidades** — veja o item 4, é o de maior retorno.

---

## 4. Backlinks — as quatro fontes que realmente funcionam

Esqueça compra de link e diretório genérico. Estas quatro têm retorno real
para um evento regional:

**1. Reciprocidade de comunidade.** O post
[/blog/comunidades-de-tecnologia-no-norte-do-piaui](https://osertaotech.com.br/blog/comunidades-de-tecnologia-no-norte-do-piaui)
perfila PHP PI, PHPWomen PI, GDG Parnaíba e outras. Isso é um pedido de link
com motivo genuíno: mande a cada comunidade dizendo que ela está no post, e a
maioria compartilha. Algumas linkam.

**2. Página de patrocinador.** Faça de "linkar pro site do evento" um item
entregável da cota, e não um favor. Empresa patrocinadora costuma ter uma
página de "onde estamos" ou "eventos que apoiamos" — pedir na assinatura do
contrato é fácil, pedir depois é difícil.

**3. Palestrantes.** Todo palestrante anuncia a própria palestra. Mande a cada
um: o link direto de [/palestrantes](https://osertaotech.com.br/palestrantes),
a arte e o texto pronto. Quem tem blog ou site pessoal costuma linkar.

**4. Instituições de ensino.** Coordenação que envia turma quase sempre
publica no site do curso. Peça na mesma conversa da caravana — o modelo de
e-mail está em
[/blog/como-organizar-caravana-para-evento-de-tecnologia](https://osertaotech.com.br/blog/como-organizar-caravana-para-evento-de-tecnologia).

---

## 5. Calendário de manutenção

Conteúdo local envelhece rápido, e `dateModified` é o sinal de frescor mais
barato que existe. Atualizar `updatedDate` no frontmatter é uma linha.

| Quando | O quê |
|---|---|
| **Trimestral** | Revisar `/blog/eventos-de-tecnologia-no-piaui-2026` e `/blog/comunidades-de-tecnologia-no-norte-do-piaui`. São os dois posts que envelhecem. Atualize e bump o `updatedDate`. |
| **Trimestral** | Search Console → Desempenho. Veja por quais termos o site aparece de verdade (raramente são os que você imaginou) e ajuste título e descrição das páginas que têm impressão e não têm clique. |
| **Trimestral** | Checar canibalização: se `/blog/sertao-tech-2026-guia-de-quem-vai` começar a ranquear acima da home para a busca "sertão tech 2026", o guia rouba tráfego de conversão. Aí, ou marque o post como `noindex`, ou incorpore o conteúdo dele na home. |
| **Mensal, no mês do evento** | Post no Google Business Profile (se houver perfil) e no Instagram, sempre linkando pro site. |
| **Depois de 09/10/2026** | Ver item 6. |
| **Anual** | Ao anunciar a edição seguinte, ver item 6. |

---

## 6. O que fazer depois do evento (09/10/2026)

Essa é a rotina que faz o site acumular autoridade em vez de reiniciar todo
ano. A regra é: **a home é sempre a edição vigente; cada edição passada tem
URL permanente.**

Na semana seguinte ao evento:

1. **Crie `src/pages/edicoes/2026.astro`** com a retrospectiva: números
   finais, programação como aconteceu, palestrantes, patrocinadores, fotos.
   Use `src/data/evento-2026.json` como fonte, com `eventStatus` trocado pra
   `https://schema.org/EventCompleted`.
2. **Em `src/data/edicoes.ts`**, na entrada de 2026: troque `href` de `'/'`
   pra `'/edicoes/2026'` e `vigente` pra `false`.
3. **Na home**, tire o botão de inscrição e coloque um link visível pra
   "veja como foi a edição de 2026".
4. **No `astro.config.mjs`**, ajuste o mapa de `changefreq`/`priority` se
   surgirem rotas novas.
5. Peça indexação de `/edicoes/2026` no Search Console.

Quando a edição de 2027 for anunciada, a home é reescrita para ela, e a
edição de 2026 continua respondendo em `/edicoes/2026` — sem duplicar
conteúdo e sem perder quem busca "sertão tech 2026".

**Por que não existe `/edicoes/2026` agora:** teria duas URLs disputando a
busca "sertão tech 2026", e a que o Google escolhesse podia ser justamente a
que não tem botão de inscrição. Antes do evento, a home é a única resposta
certa pra essa busca.

---

## 7. Dados que faltam no repositório

Duas coisas que só você tem:

- **A 1ª edição.** Não existe nada sobre ela no repositório. Se você tem data,
  local, público, palestrantes e fotos, é só adicionar uma entrada em
  `src/data/edicoes.ts` e criar a página da retrospectiva — a busca por
  "sertão tech <ano da 1ª edição>" hoje não tem destino. Sem esses dados, é
  melhor não ter a página: retrospectiva de 150 palavras é pior que nenhuma.
- **Seu LinkedIn.** Os posts estão assinados por "Bruno Oliveira", e o
  `authorUrl` aponta pra `/sobre` como padrão. Com a URL do seu LinkedIn no
  campo `authorUrl` do frontmatter (ou como novo padrão em
  `src/content.config.ts`), a autoria fica associada a uma entidade real —
  que é o que o Google usa como sinal de autoria.

---

## 8. Como medir se está funcionando

Nesta ordem de prioridade, no Search Console:

1. **Páginas indexadas** deve subir de 4 para ~15 em duas semanas. Se não
   subir, o problema é técnico, não de conteúdo.
2. **Impressões** para consultas com "parnaíba", "piauí", "sertão tech" —
   é o primeiro sinal de que a página-âncora está pegando.
3. **Posição média** para "evento de tecnologia em parnaíba" e variações.
   Espere de 1 a 3 meses pra estabilizar.
4. **Cliques**, por último. Impressão sem clique é problema de título e
   descrição, que dá pra consertar em uma linha — e é a otimização de melhor
   retorno que existe.

No GA4, o que importa é: tráfego orgânico chegando no blog, e quantas dessas
sessões passam pela home ou pelo Sympla. Blog que não empurra ninguém pro
evento é blog bonito e inútil.
