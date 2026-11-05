# painel

SPA interna do Sertão Tech, em `painel.osertaotech.com.br`. Lê o banco da api
pelas rotas `/api/painel/*`; não tem banco nem backend próprio.

| Peça | Escolha | Por quê |
|---|---|---|
| Build | Vite | É o que a Vercel serve estático, sem SSR para manter |
| UI | Vue 3 + PrimeVue (tema Aura) | O `DataTable` já traz ordenação, paginação e filtro — que é a tela inteira de inscrições |
| Rotas | vue-router | Duas telas e um guarda de sessão |
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
`curadoria` vê palestrante. O recorte é feito na api — o front só esconde o
filtro que não serve. Volume de e-mail, LGPD e auditoria são do evento inteiro, não de um tipo: só o
`admin`. O router esconde as telas, mas quem tranca é a api — as rotas estão
atrás de `can:painel-admin` e respondem 403 de qualquer jeito.

## Telas

| Rota | O que mostra |
|---|---|
| `/inscricoes` | Tabela com busca, filtro de tipo, linha expansível e export em CSV |
| `/metricas` | Totais, inscrições por dia, distribuições (cidade, perfil, experiência, cota) e volume de e-mail |
| `/emails` | O que saiu de e-mail, com busca por destinatário ou assunto. Só `admin` |
| `/lgpd` | Direitos do titular: consultar tudo de uma pessoa, anonimizar, e o histórico de quem acessou. Só `admin` |

As cores dos gráficos estão em `src/cores.js`, validadas (banda de
luminosidade, croma, separação para daltonismo e contraste) contra a
superfície dos cartões — não escolhidas no olho. Cor segue a entidade: o
participante é o mesmo laranja em qualquer gráfico.

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
