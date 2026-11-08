# Módulo de certificados

Como o módulo funciona hoje, do rascunho ao e-mail. As decisões e o porquê de
cada uma estão em [PLANO-CERTIFICADOS.md](PLANO-CERTIFICADOS.md). Este documento
descreve o que está implementado e como operar.

## Visão geral

- Cada pessoa recebe um certificado por papel em cada edição: participante,
  palestrante, ministrante ou organização. Quem deu palestra e fez check-in
  recebe dois.
- O certificado nasce como **rascunho**, é revisado no painel e, ao ser
  **emitido**, vira documento: ganha código, PDF guardado no R2 e hash SHA-256.
  A partir daí não muda mais.
- Erro depois de emitir não se corrige: o certificado é **revogado** e um novo é
  emitido, com outro código.
- Cada e-mail recebe **um aviso por edição**, com um botão por certificado.
- Qualquer pessoa confere a validade em `osertaotech.com.br/certificado/validar`,
  pelo código ou pelo QR Code impresso no PDF.

## Situações

| Situação | Como chega lá | O que pode mudar |
|---|---|---|
| Rascunho | "Preparar" ou "Adicionar" no painel | Tudo: nome, e-mail, tipo, título, carga horária, atividades |
| Descartado | Botão "Descartar" num rascunho | Nada. A linha fica para o "Preparar" não recriá-la |
| Emitido | "Emitir" (fila) ou "Emitir agora" (linha) | Só a revogação ou o cancelamento pela LGPD |
| Revogado | "Revogar", com motivo | Só o cancelamento pela LGPD |
| Cancelado (LGPD) | Exclusão a pedido do titular | Nada |

A situação sai de `Certificado::situacao()`, a partir das colunas `emitido_em`,
`descartado_em`, `revogado_em` e `anonimizado_em`.

## Fluxo de uma edição

1. **Importar a planilha de ingressos.** Por SSH, uma vez por edição:

   ```bash
   php artisan participantes:importar planilha.xlsx --edicao=2026 --por=admin@exemplo.com
   ```

   Use `--dry-run` antes para conferir os totais sem gravar.

2. **Preparar.** No painel, em Pessoas › Certificados, escolha a edição e clique
   em "Preparar". O sistema cria rascunhos:
   - de participante para quem fez check-in, com a carga horária do evento;
   - de palestrante para o cupom `PALESTRANTE` e de organização para o cupom
     `ORGANIZACAO`, com ou sem check-in, porque cupom sem check-in pode ser de
     quem cancelou e a revisão decide.

   Ingresso anonimizado fica de fora. Rodar de novo só cria o que falta: não
   duplica e não recria o que foi descartado.

3. **Revisar.**
   - **Tipo:** o cupom `PALESTRANTE` não separa palestrante de ministrante.
     Troque o tipo e ajuste a carga horária (ministrante leva 2 h).
   - **Título:** palestrante e ministrante sem título aparecem em vermelho na
     tabela. Sem título, o PDF sai com "atuou como palestrante".
   - **Minicurso:** a coluna "Atividade" marca o minicurso direto na linha, a
     partir da lista impressa. Quem fez o minicurso e faltou ao check-in entra
     por "Adicionar › Com ingresso" (a busca inclui quem faltou), com o
     minicurso marcado. Recebe certificado de participante com 2 h.
   - **Quem não tem ingresso** (equipe de 2025, palestrante sem cupom) entra por
     "Adicionar › Sem ingresso", com nome e e-mail.
   - **Descartar** quem não deve receber, por exemplo o cupom de quem cancelou.

4. **Conferir a arte.** O cartão "Prévia do modelo" baixa o PDF de cada tipo com
   dados de exemplo, sem emitir nada.

5. **Emitir um certificado de teste.** O botão "Emitir agora" da linha emite na
   hora, sem fila. Abra o PDF e confira antes de emitir a edição.

6. **Emitir a edição.** "Emitir rascunhos" põe na fila um job por rascunho. O
   worker roda a cada minuto pelo agendador (ver [Produção](#produção)).

7. **Avisar por e-mail.** "Avisar por e-mail" cria um aviso para cada e-mail com
   certificado emitido e ainda não avisado. O envio respeita o limite diário
   (ver [E-mail](#e-mail)). Disparar de novo alcança só os e-mails novos, que é
   como entram os retardatários.

8. **Quem ganhou certificado depois do aviso** não é avisado de novo. Use o botão
   "Copiar link" da linha e mande o link à mão.

## Carga horária

Os valores de cada edição ficam em `api/config/certificados.php`:

| Tipo | Carga padrão |
|---|---|
| Participante | Do evento (8 h em 2026, 4 h em 2025) |
| Participante só do minicurso (sem check-in) | Soma das atividades (2 h) |
| Palestrante | Do evento |
| Ministrante | Informada no cadastro (2 h nos minicursos de 2026) |
| Organização | Da organização (18 h em 2026, 4 h em 2025) |

A carga de cada certificado pode ser ajustada na revisão, antes da emissão.

## Atividades

As atividades de cada edição ficam em `config/certificados.php`, com nome,
ministrante, carga horária e horário. O certificado guarda as chaves na coluna
`atividades`, por exemplo `["minicurso-cardinal"]`.

- Atividades com o mesmo `horario` aconteceram ao mesmo tempo, e o sistema
  recusa as duas no mesmo certificado.
- Atividade que não existe na edição é recusada.
- No PDF de participante sai a linha "Participou do minicurso X (2 h), parte da
  programação do evento.", sem somar às horas do evento.

## Emissão e PDF

O job `App\Jobs\EmiteCertificado` faz, nesta ordem:

1. Trava a linha, confere que ainda é rascunho e grava o código, se não tiver.
2. Se o PDF já existe em `certificados/{ano}/{codigo}.pdf`, para com erro, sem
   sobrescrever.
3. Gera o PDF, grava no disco `s3` (R2), guarda o SHA-256 e preenche
   `emitido_em`.

O código é gravado antes do PDF de propósito. Se o processo morrer depois do
upload, a retentativa encontra o arquivo no mesmo caminho e para. Nesse caso,
alguém confere o arquivo no R2 e decide: apagar o PDF e rodar de novo, ou
completar a linha à mão.

O job é único por certificado (`ShouldBeUnique`): dois cliques em "Emitir" não
enfileiram o mesmo certificado duas vezes.

### Código

Formato `ST26-7K3M-Q9XP-2TVH`: prefixo com os dois últimos dígitos do ano e 12
caracteres aleatórios do alfabeto Crockford base32, sem I, L, O e U. São 60 bits,
não sequenciais. Gerado em `Certificado::novoCodigo()`.

### Modelo

- `api/resources/views/certificados/base.blade.php` tem a arte comum, em A4
  paisagem: faixas, moldura, logos, texto por tipo, assinatura, código, QR Code
  e rodapé com razão social e CNPJ.
- `2025.blade.php` e `2026.blade.php` estendem a base e mudam só a cor de
  destaque. Edição sem Blade não emite: a emissão e a prévia respondem 422.
- O dompdf não tem flexbox, grid nem variáveis CSS. O layout é posição absoluta
  e tabelas, e as cores são os tokens de `site/public/ds/tokens/colors.css`
  copiados à mão.
- **Fontes:** os TTF de Space Grotesk, Instrument Sans, Space Mono e League
  Spartan ficam em `api/resources/fonts/`, com a licença em `OFL.txt`. O dompdf
  guarda as métricas em `storage/fonts`, que o post-deploy cria.
- **Logos:** JPEG em `api/resources/certificados/`, sobre o creme do papel. O
  dompdf só lê PNG com a extensão GD, que o servidor pode não ter. O QR Code é
  SVG pelo mesmo motivo.
- **Assinatura:** nome do responsável digitado sobre uma linha, sem imagem.

## Imutabilidade

Três travas garantem que um certificado emitido não muda:

1. **Model.** O evento `updating` do `Certificado` recusa alteração em
   certificado emitido, com estas exceções:
   - revogação, uma vez, tocando só `revogado_em` e `motivo_revogacao`;
   - cancelamento pela LGPD, tocando só `nome`, `email`, `pdf_caminho` e
     `anonimizado_em`.

   Depois do cancelamento, nada mais muda. Apagar certificado emitido também é
   recusado. A trava vale para o Eloquent: update em massa pelo query builder
   passa por fora, e nada no projeto altera certificado assim.
2. **Storage.** O PDF é gravado uma vez. Se o arquivo já existir, a emissão para.
3. **Hash.** O SHA-256 do PDF fica no banco. A página de validação compara o
   arquivo que a pessoa tem com ele.

## Revogação e reemissão

1. Na linha do certificado emitido, "Revogar" pede um motivo. O motivo fica no
   painel e na auditoria, e não sai no validador.
2. O validador passa a responder "revogado" para aquele código. O PDF continua
   no R2, mas a API pública não devolve mais o link.
3. Na linha revogada, "Reemitir" abre o formulário preenchido com os dados do
   antigo. O novo entra **sem ingresso**, porque a linha revogada ocupa a chave
   `(edição, ingresso, tipo)`.
4. Corrija o que estava errado, salve e emita: o novo ganha outro código.

## E-mail

- **Disparo:** `POST /api/painel/certificados/{ano}/avisar` insere uma linha por
  e-mail em `avisos_certificado`, com chave única `(edicao_id, email)`. Só quem
  insere a linha enfileira o job, então disparo repetido não reenvia.
- **Job `AvisaCertificado`:** marca `enviado_em` com
  `UPDATE ... WHERE enviado_em IS NULL` antes de enviar. Se o envio falhar,
  desmarca e a fila tenta de novo, por até 7 dias. Retentativa ou job repetido
  encontram a marca e saem sem enviar.
- **Limite diário:** o limitador `certificados` vale `MAIL_LIMITE_DIARIO` menos
  30 (70 com o limite de 100). Ele roda antes do limitador `smtp`, então quando
  segura o envio não gasta a cota das confirmações da lista de espera. Com 70 por
  dia, os 172 e-mails de 2026 levam cerca de 3 dias.
- **Conteúdo:** `App\Mail\CertificadoDisponivel`, em HTML (tabelas com CSS
  inline) e em texto. Um botão por certificado, para
  `CERTIFICADO_URL_PAGINA?codigo=...`. Nomes diferentes no mesmo e-mail viram
  saudação neutra e o nome em cada botão.
- **Registro:** todo e-mail aceito pelo provedor entra em `emails_enviados`, pelo
  listener que já existia.

Limitações conhecidas:

- Processo morto entre marcar e enviar deixa a pessoa sem e-mail. Aparece no
  cruzamento de `avisos_certificado` com `emails_enviados`.
- Timeout depois de o provedor aceitar pode duplicar um e-mail. É raro.

## Páginas públicas

As duas são estáticas, no Astro, leem `?codigo=` e buscam os dados na API pelo
navegador. Têm `noindex` e ficam fora do sitemap.

- **`/certificado`** (`site/src/pages/certificado/index.astro`): destino do
  botão do e-mail. Mostra o PDF guardado num iframe, com "Baixar PDF" e
  "Conferir validade". Como o PDF fica no domínio do R2, o navegador abre o
  arquivo numa aba em vez de baixar direto.
- **`/certificado/validar`** (`site/src/pages/certificado/validar.astro`):
  destino do QR Code. Mostra situação, nome, tipo, edição, carga horária e
  atividades. A conferência do arquivo calcula o SHA-256 do PDF no próprio
  navegador e compara com o do banco. O arquivo não sai do computador de quem
  confere.

| Resposta da conferência | Quando |
|---|---|
| Arquivo original, emitido pelo Sertão Tech | O hash bate, e o certificado é válido ou foi cancelado pela LGPD |
| Arquivo original, mas o certificado foi revogado | O hash bate e o certificado foi revogado |
| Este arquivo não é o original | O hash não bate |

## LGPD

Na tela de LGPD do painel, a consulta por e-mail lista os certificados da pessoa.
Se ela tiver certificado emitido, a tela avisa para orientá-la a guardar o PDF
antes da exclusão.

A exclusão (`DELETE /api/painel/lgpd`):

- apaga o rascunho inteiro;
- no certificado emitido, apaga o PDF do R2, troca nome e e-mail por marcadores
  anônimos e preenche `anonimizado_em`. Código e hash ficam;
- troca o e-mail de `avisos_certificado` por hash, como no log de envio.

O PDF é apagado depois que a mudança no banco é confirmada. O validador responde
"Certificado emitido e depois cancelado a pedido do titular", sem nome e sem data,
e a conferência do arquivo continua confirmando o original.

## Rotas

Públicas:

| Método | Rota | Para quê |
|---|---|---|
| GET | `/api/certificados/{codigo}` | Dados da página e da validação. 30 por minuto por IP. Nunca devolve e-mail nem motivo de revogação. Rascunho responde 404 |

Painel, todas com `can:painel-admin`:

| Método | Rota | Para quê |
|---|---|---|
| GET | `/api/painel/certificados/{ano}` | Lista com filtros (`tipo`, `situacao`, `atividade`, `busca`), resumo e atividades da edição |
| POST | `/api/painel/certificados/{ano}/preparar` | Cria os rascunhos que faltam |
| POST | `/api/painel/certificados/{ano}` | Adiciona: com `participante_id` ou com `nome` e `email` |
| PATCH | `/api/painel/certificados/{id}` | Revisa um rascunho |
| DELETE | `/api/painel/certificados/{id}` | Descarta um rascunho |
| GET | `/api/painel/certificados/{ano}/previa?tipo=` | PDF de exemplo, sem emitir |
| POST | `/api/painel/certificados/{ano}/emitir` | Enfileira os rascunhos. Pede `confirmar: true` |
| POST | `/api/painel/certificados/{ano}/emitir/{id}` | Emite um na hora, sem fila |
| POST | `/api/painel/certificados/{ano}/avisar` | Enfileira os avisos. Pede `confirmar: true` |
| POST | `/api/painel/certificados/{id}/revogar` | Revoga, com `motivo` |

Toda ação que altera dados fica em `auditorias`, com as ações
`certificados.preparou`, `adicionou`, `alterou`, `descartou`, `emitiu`, `avisou`
e `revogou`.

Para chamar pelo Postman, a sessão é por cookie: `GET /sanctum/csrf-cookie`,
`POST /api/painel/login` e então a rota, sempre com `Origin` e `Referer` do
painel e o header `X-XSRF-TOKEN`.

## Configuração

Variáveis do `.env` da API:

| Variável | Para quê |
|---|---|
| `CERTIFICADO_RESPONSAVEL` | Nome impresso na assinatura |
| `CERTIFICADO_RAZAO_SOCIAL` | Rodapé do PDF |
| `CERTIFICADO_CNPJ` | Rodapé do PDF |
| `CERTIFICADO_URL_VALIDACAO` | Para onde o QR Code aponta. Padrão: `https://osertaotech.com.br/certificado/validar` |
| `CERTIFICADO_URL_PAGINA` | Para onde o botão do e-mail aponta. Padrão: `https://osertaotech.com.br/certificado` |
| `MAIL_LIMITE_DIARIO` | Teto do provedor de SMTP. O limitador dos certificados usa esse valor menos 30 |

Em dev, aponte as duas URLs para o Astro local (`http://localhost:4321/...`)
para testar o fluxo inteiro.

O PDF vai para o disco `s3`: R2 em produção, RustFS em dev.

## Produção

- **Fila:** o cron do cPanel chama `schedule:run` a cada minuto, e o agendador
  (`api/routes/console.php`) roda `queue:work --stop-when-empty --max-time=50`.
  Sem isso, nem a emissão da edição nem os avisos saem.
- **Fontes do dompdf:** o post-deploy cria `storage/fonts`.
- **Antes do piloto:** conferir as variáveis `CERTIFICADO_*` e se o disco `s3`
  aponta para o R2.

## Nova edição

1. Criar a edição no banco, por migration, como as anteriores.
2. Adicionar a entrada da edição em `api/config/certificados.php`: número,
   data, local (com a preposição, "na ..."), cargas horárias e atividades.
3. Criar `api/resources/views/certificados/{ano}.blade.php` estendendo
   `certificados.base`.
4. Conferir a prévia no painel antes de emitir.

Mudar `base.blade.php` muda a arte de todas as edições, mas só para os próximos
PDFs: os já emitidos estão guardados e não são gerados de novo.

## Arquivos

| Onde | O quê |
|---|---|
| `api/app/Models/Certificado.php` | Trava, situação, "Preparar", código, QR Code e renderização do PDF |
| `api/app/Jobs/EmiteCertificado.php` | Emissão |
| `api/app/Jobs/AvisaCertificado.php` | Aviso por e-mail |
| `api/app/Mail/CertificadoDisponivel.php` | E-mail, com as views em `resources/views/mail/certificado-disponivel*.blade.php` |
| `api/app/Http/Controllers/Painel/CertificadosController.php` | Rotas do painel |
| `api/app/Http/Controllers/CertificadoPublicoController.php` | Rota pública |
| `api/app/Http/Controllers/Painel/LgpdController.php` | Consulta e exclusão pela LGPD |
| `api/config/certificados.php` | Edições, atividades, emissor e URLs |
| `api/resources/views/certificados/` | Modelos do PDF |
| `painel/src/views/Certificados.vue` | Tela do painel |
| `painel/src/components/certificados/FormCertificado.vue` | Adicionar, editar e reemitir |
| `site/src/pages/certificado/` | Páginas públicas |

Testes: `PainelCertificadosTest`, `EmissaoDeCertificadosTest`,
`CertificadoPublicoTest`, `AvisoDeCertificadosTest` e
`RevogacaoECancelamentoTest`, em `api/tests/Feature/`.

## Fora do escopo

Dá para somar depois sem mexer no resto:

- Compartilhar no LinkedIn.
- Webhook de bounce do Resend.
- Assinatura digital ICP-Brasil no PDF.
