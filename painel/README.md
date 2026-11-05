# painel

SPA interna do Sertão Tech, em `painel.osertaotech.com.br`. Lê o banco da api
pelas rotas `/api/painel/*`; não tem banco nem backend próprio.

| Peça | Escolha | Por quê |
|---|---|---|
| Build | Vite | É o que a Vercel serve estático, sem SSR para manter |
| UI | Vue 3 + PrimeVue (Aura com os tokens do DS) | O `DataTable` já traz ordenação, paginação e filtro — que é a tela inteira de inscrições |
| Rotas | vue-router | Poucas telas e um guarda de sessão |
| Estado | um `reactive` em `src/auth.js` | Só o usuário logado é global. Pinia não paga o preço |

## Autenticação

Sessão por cookie (Sanctum em modo SPA), **não** token: o JavaScript nunca vê
credencial. Como `painel.osertaotech.com.br` e `api.osertaotech.com.br` são o
mesmo domínio registrável, o cookie vale nos dois com
`SESSION_DOMAIN=.osertaotech.com.br` no `.env` da api.

Toda chamada vai com `credentials: 'include'`; antes de um POST, `src/api.js`
busca `/sanctum/csrf-cookie` e devolve o valor no cabeçalho `X-XSRF-TOKEN`.

Conta nova não se cria por aqui. É por SSH, na api:

```bash
php artisan painel:usuario    # pergunta e-mail, nome, papel e senha
```

Papéis: `admin` vê os três tipos de inscrição, `comercial` vê patrocinador,
`curadoria` vê palestrante, `financeiro` não vê inscrição nenhuma. O recorte é feito na api — o front só esconde o
filtro que não serve. Volume de e-mail, LGPD e auditoria são do evento inteiro, não de um tipo: só o
`admin`. O menu esconde as telas e quem chega pela URL vê o estado de 403, mas
quem tranca é a api — as rotas estão atrás de `can:painel-admin` e respondem
403 de qualquer jeito.

## Telas

| Rota | O que mostra |
|---|---|
| `/inscricoes` | Tabela com busca, filtro de tipo, linha expansível e export em CSV |
| `/metricas` | Totais, inscrições por dia, distribuições (cidade, perfil, experiência, cota) e volume de e-mail |
| `/emails` | O que saiu de e-mail, com busca por destinatário ou assunto. Só `admin` |
| `/lgpd` | Direitos do titular: consultar tudo de uma pessoa, anonimizar, e o histórico de quem acessou. Só `admin` |
| `/apresentacoes` | Decks, relatórios e impressos do site, por edição. Lista fixa em `src/materiais.js`; as URLs são públicas (ver `docs/MELHORIAS-FUTURAS.md`) |
| `/orcamento` | Receitas em funil, despesas, saldo e comparativo por edição. `admin` e `financeiro` veem tudo; `comercial`, só as receitas |

Inscrições e métricas ainda não têm edição: `waitlist_entries` é uma lista só, e por
isso o seletor do topo só aparece em Apresentações e Orçamento.

## Orçamento

Dinheiro anda em centavos inteiros entre api e tela; só o campo do formulário
trabalha em reais. A edição atual é a de maior ano na tabela `edicoes`: edição nova
entra por migration, quando o ciclo virar. Edição encerrada é só leitura, menos para
o `admin`, que lança o histórico dela, de onde saem o comparativo e a cópia.

As cotas e os preços de cada kit estão em `src/orcamento.js`. Anexos são PDF de até
10 MB, em `orcamento/` no bucket S3 (R2 em produção, RustFS em dev). Cada escopo tem
a sua pasta no mesmo bucket. O bucket `osertaotech` é público por decisão do projeto:
quem tiver o caminho abre o arquivo, e o que protege é o nome aleatório e a api nunca
devolver o caminho. O arquivo passa pela api na ida e na volta, por isso o limite do
PHP em `api/public/.user.ini` ainda vale.

As cores dos gráficos estão em `src/cores.js`, validadas (banda de
luminosidade, croma, separação para daltonismo e contraste) contra a
superfície dos cartões — não escolhidas no olho. Cor segue a entidade: o
participante é o mesmo laranja em qualquer gráfico.

## Design system

A especificação está em [`docs/design`](../docs/design/README.md). O painel não tem tokens próprios: `src/main.js` importa
`site/public/ds/styles.css`, e `src/tema.js` aponta o Aura para esses tokens por
`var()`. Token novo entra em `site/public/ds/tokens/`, seguido de
`./scripts/build-ds.sh`.

O import sai da pasta do painel, e isso tem duas consequências: o compose monta
`site/public` em `/site/public`, para o caminho relativo valer dentro do
container, e o projeto da Vercel precisa de "Include files outside the Root
Directory" ligado. Desligado, o build falha e a produção fica no deploy anterior.

## Como rodar

Pelo `docker compose up` da raiz, junto com site e api:

<http://localhost:5173> (a api em `http://localhost:8000` chega pela variável
`VITE_API_URL` do compose).

Para o login local funcionar, o `.env` da api precisa de
`SANCTUM_STATEFUL_DOMAINS=localhost:5173` e da mesma origem em
`CORS_ALLOWED_ORIGINS` — o `.env.example` já traz as duas.

Mexeu no `package.json`? Reconstrua, porque o `node_modules` fica num volume do
container:

```bash
docker compose up -d --build --renew-anon-volumes painel
```

Sem o `--renew-anon-volumes` o compose reaproveita o volume anônimo do
container anterior e a dependência nova não aparece, por mais que a imagem
tenha sido reconstruída.

## Deploy

Projeto próprio na Vercel, Root Directory `painel/`, domínio
`painel.osertaotech.com.br`. A variável `VITE_API_URL` não é obrigatória: sem
ela o código cai em `https://api.osertaotech.com.br`.

O `.vercelignore` da raiz vale para todos os projetos da Vercel, então `/painel`
não pode entrar lá — apagaria este projeto antes do build.

## Erros

Sentry, projeto `sertaotech-painel` (mesma org do site e da api). O DSN fica
cravado em `src/main.js`, igual ao do site: DSN de browser é público por
design, vai no bundle de qualquer jeito. `enabled: import.meta.env.PROD`
desliga tudo em dev — só o build da Vercel reporta.

Só captura de erro: sem tracing e sem session replay. O painel é interno e de
pouco uso, então trace não paga o bundle, e gravar a sessão de uma tela que
lista dado pessoal de inscrito seria vazar o que a `/lgpd` existe para
proteger. `sendDefaultPii: false` pelo mesmo motivo.
