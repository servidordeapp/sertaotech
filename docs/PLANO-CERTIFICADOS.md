# Plano: módulo de certificados

**Status:** decisões fechadas, fases 1, 2 e 3 implementadas. Faltam só os itens de [Conferir em produção](#conferir-em-produção) e os dados de razão social e CNPJ no `.env`.
**Última revisão:** 2026-11-07.

## Objetivo

- Ter um modelo de certificado por edição (2025, 2026, 2027 e seguintes).
- Emitir certificados de participante, palestrante, ministrante e organização.
- Tratar o certificado como documento imutável: depois de emitido, não é alterado nem gerado de novo, e o PDF fica guardado no R2 em `certificados/{ano}/`.
- Avisar cada pessoa por e-mail que o certificado está disponível, no máximo uma vez por edição.
- O botão do e-mail abre uma página que exibe o certificado e permite baixar o PDF.
- O PDF traz um código e um QR Code que qualquer pessoa pode conferir em `/certificado/validar`.

## Decisões

| # | Pergunta | Recomendação | Situação |
|---|---|---|---|
| 1 | Quem recebe certificado de participante? | Só quem tem check-in ou fez um minicurso, porque certificado atesta presença. O site de 2026 promete "certificado de participação pra todo mundo", e ficam de fora 57 ingressos em 2026 e 81 em 2025. | Decidida |
| 2 | Como criar o modelo de cada edição? | Um Blade por edição, versionado, como em "edição nova entra por migration". | Decidida |
| 3 | Quem faz a arte? | A arte é feita no próprio Blade, em HTML e CSS, seguindo o design system do projeto. Ver [Fase 2](#fase-2-modelo-pdf-e-emissão). | Decidida |
| 4 | O que vai escrito em cada certificado? | Ver [Conteúdo do certificado](#conteúdo-do-certificado). | Decidida |
| 5 | Quem é a equipe de cada edição? | Lista de palestrantes, ministrantes e organização de 2025 e conferência de 2026. | A organização cadastra pelo painel, na revisão |
| 6 | Qual a ordem de envio? | 2026 primeiro, como piloto, e 2025 depois. | Decidida |
| 7 | Aprovar `barryvdh/laravel-dompdf`, `chillerlan/php-qrcode` e a pasta `app/Jobs`? | Sim. O `api/CLAUDE.md` exige aprovação para dependência e pasta novas, e o QR Code não existe no projeto. | Aprovada |
| 8 | Como registrar quem fez o minicurso? | Marcar no painel, a partir da lista impressa. Ver [Atividades](#atividades). | Decidida |
| 9 | Quantas horas no certificado de organização? | Ver [Carga horária da organização](#carga-horária-da-organização). | Decidida: 18 h em 2026 e 4 h em 2025 |
| 10 | Uma pessoa pode ter mais de um certificado na mesma edição? | Sim, um por papel. Ver [Tipos de certificado](#tipos-de-certificado). | Decidida |
| 11 | O que fazer com certificado emitido quando a pessoa pede exclusão pela LGPD? | Apagar o PDF e anonimizar o registro, mantendo o código como "cancelado a pedido do titular". Ver [LGPD](#lgpd). | Decidida, texto do validador aprovado |
| 12 | Palestrante leva qual carga horária? | A do evento. | Decidida: 8 h em 2026 |

### Conferir em produção

- [x] Existe cron do `queue:work` no cPanel? Existe. Passa a ser `schedule:run` a cada minuto, e o `queue:work` sai do agendamento em `api/routes/console.php`. Falta trocar a linha no cPanel.
- [ ] Qual o valor de `MAIL_LIMITE_DIARIO`? O padrão do `.env.example` é 100.
- [ ] As planilhas de 2025 e 2026 já foram importadas? O banco local está vazio.
- [ ] O disco `s3` de produção aponta para o R2? O `.env.example` sugere que sim, com o bucket `osertaotech` público em `arquivos.osertaotech.com.br`.

## Conteúdo do certificado

Campos definidos para a versão inicial:

- Nome completo da pessoa.
- Nome do evento e edição.
- Data e local. Evento online informa que ocorreu em ambiente virtual.
- Carga horária total em horas.
- Logotipos do Sertão Tech, PHP Piauí e PHP Women Piauí.
- Assinatura do responsável.
- Código de validação e QR Code.
- Razão social e CNPJ no rodapé.

Valores por edição:

| Campo | 2025 | 2026 |
|---|---|---|
| Edição | 1ª | 2ª |
| Data | 22/08/2025 | 09/10/2026 |
| Local | Uninassau Parnaíba | Universidade Federal do Delta do Parnaíba (UFDPar), Parnaíba - PI |
| Carga horária do evento | 4 h | 8 h |
| Carga horária da organização | 4 h | 18 h |

- Os valores de cada edição ficam em `config/certificados.php`, versionados, junto com as atividades da edição. Edição nova ganha uma entrada ali e um modelo Blade.
- **Logos:** os três já estão no site, em `assets/patrocinadores/phppi.svg`, `assets/patrocinadores/phpwomen-piaui.svg` e no logo do evento.
- **Assinatura:** nome digitado sobre uma linha, sem imagem de assinatura. Assim nenhuma assinatura real entra no git.

Emissor, igual para todas as edições e vindo do `.env`:

```
CERTIFICADO_RESPONSAVEL="Maria Katriane de Sousa da Silva Oliveira"
CERTIFICADO_RAZAO_SOCIAL=
CERTIFICADO_CNPJ=
```

O mídia kit de caravanas 2027 também promete atividades no certificado, para o registro como extensão. Isso entra pela seção [Atividades](#atividades).

## Tipos de certificado

| Tipo | Quem | Texto principal | Carga horária |
|---|---|---|---|
| Participante | Quem fez check-in ou um minicurso | "participou do evento" | Do evento, ou 2 h para quem fez só o minicurso |
| Palestrante | Quem deu palestra, microtalk ou participou da roda de conversa | "proferiu a palestra 'X'" | Do evento |
| Ministrante | Quem deu um minicurso | "ministrou o minicurso 'X'" | 2 h |
| Organização | Equipe voluntária | "atuou como voluntário(a) na organização do evento, incluindo planejamento, montagem e execução" | Da organização |

Regras:

- **Um certificado por papel.** Um palestrante com check-in recebe o de palestrante e o de participante. Isso dispensa uma regra de prioridade entre tipos, e o e-mail único já mostra um botão por certificado.
- **Título:** palestrante e ministrante levam o título da palestra ou do minicurso, guardado no próprio certificado. Os de 2026 vêm da grade do site. Os de 2025 não estão no repositório e serão preenchidos pela organização na revisão.
- **Carga horária individual:** cada certificado guarda a própria carga horária, que vem do padrão da edição e pode ser ajustada na revisão, antes da emissão. Serve, por exemplo, para o voluntário que só trabalhou no dia.

Palestrante leva a carga horária do evento, e não só o tempo da palestra: o certificado é do evento, e uma palestra de 30 minutos daria "0,5 h".

### Carga horária da organização

**2026: 18 h**, definidas pela organização. Cobrem o dia do evento, com montagem antes e desmontagem depois, e as reuniões de planejamento e alinhamento.

**2025: 4 h**, a mesma carga do evento. A edição não exigiu trabalho extra da equipe.

O número precisa ser defensável, porque certificado de voluntariado vira hora complementar na faculdade e a instituição pode pedir prova. A carga horária de cada certificado ainda pode ser ajustada na revisão, antes da emissão, para quem só trabalhou no dia.

## Atividades

Só a 2ª edição teve atividades: dois minicursos, das 15h às 17h, ao mesmo tempo e em salas separadas, em paralelo ao palco principal. A lista de presença existe só impressa.

| Chave | Minicurso | Ministrante | Carga horária |
|---|---|---|---|
| `minicurso-cardinal` | Cardinal — um simulador de mundos para desenvolvedores de jogos | Germano Gomes | 2 h |
| `minicurso-freelancer` | O Kit do Freelancer Ágil: MVP do zero com Laravel, Flutter, Cockpit e IA | Rodrigo Castro | 2 h |

Fonte: grade de `site/src/pages/2026/index.astro`.

Regras:

- **Horas:** os minicursos aconteceram dentro do horário do evento, então não somam nas 8 h. O certificado de participante traz a linha "Participou do minicurso X (2 h), parte da programação do evento."
- **Um por pessoa:** como os dois foram ao mesmo tempo, o sistema recusa marcar os dois no mesmo certificado.
- **Só minicurso:** quem fez o minicurso sem check-in no evento recebe certificado de participante com 2 h.

Estratégia:

1. As atividades de cada edição ficam em `config/certificados.php`, com nome e carga horária.
2. O certificado guarda as atividades da pessoa numa coluna `atividades` (JSON com as chaves, por exemplo `["minicurso-cardinal"]`).
3. No painel, a tela tem um filtro por minicurso e, em cada linha, a escolha do minicurso. Quem tem a lista impressa busca cada nome e marca.
4. A busca do painel inclui quem tem ingresso e faltou ao check-in. Marcar o minicurso para essa pessoa cria o certificado dela, com 2 h.
5. Quem fez o minicurso mas não está na planilha de ingressos entra pelo "adicionar" da revisão, já com o minicurso marcado.

Por que marcar no painel em vez de importar uma planilha:

- **Nome:** a lista impressa tem nome escrito à mão, que não casa com o da plataforma de ingressos. Uma pessoa resolve isso na busca, o sistema não.
- **Volume:** uma lista de minicurso é curta, então digitar uma planilha só para importar dá mais trabalho que marcar direto.
- **Revisão:** a marcação fica registrada em auditoria, como o resto da revisão.

Por que chave no certificado e não tabela própria: atividade é poucas linhas por edição e não muda depois do evento. Tabela própria fica para quando houver atividade com inscrição ou presença controlada pelo sistema.

## O que os dados mudam

Totais extraídos das planilhas de ingressos em `originais/`.

| Indicador | 2025 | 2026 |
|---|---|---|
| Ingressos aprovados | 191 | 233 |
| Presentes identificados | 109 | 176 |
| E-mails distintos entre presentes | 107 | 172 |
| E-mails com mais de um ingresso presente | 2 | 4 |
| Desses, com nomes diferentes | 0 | 3 |
| Cupom PALESTRANTE (com / sem check-in) | não existe | 10 / 6 |
| Cupom ORGANIZACAO (com / sem check-in) | não existe | 6 / 4 |

Consequências:

- **Equipe de 2025:** não vem da planilha e precisa de cadastro manual.
- **Equipe de 2026:** a regra "cupom + check-in" deixa gente de fora. O palco teve 18 pessoas, então nem todas têm cupom. O cupom PALESTRANTE também não separa palestrante de ministrante.
- **Cancelamentos:** cupom sem check-in pode ser de quem cancelou. Por isso a emissão por cupom não é automática e passa por revisão humana.
- **Mesmo e-mail:** certificado é por pessoa e papel, aviso é por e-mail. Um e-mail pode trazer vários botões.
- **Limite de envio:** o limitador `smtp` é compartilhado com a lista de espera. Com o padrão de 100/dia, o disparo de 172 e-mails travaria as confirmações da lista por 2 dias.

## Fluxo

1. **Importar:** `participantes:importar`, que já existe.
2. **Preparar:** no painel, em Certificados, escolher a edição e clicar em "Preparar". Cria rascunhos de participante para quem tem check-in, e de palestrante ou organização pelo cupom.
3. **Revisar:** corrigir nome, tipo, título e carga horária, marcar minicursos, adicionar quem não tem ingresso e descartar rascunhos. Rascunho ainda não tem código nem PDF.
4. **Emitir:** com confirmação, o sistema gera o código e o PDF de cada rascunho, guarda no R2 e trava o certificado. A partir daqui nada muda.
5. **Disparar:** o sistema enfileira um aviso por e-mail com certificado emitido e ainda não avisado.
6. **Receber:** o botão do e-mail abre `osertaotech.com.br/certificado?codigo=X`, com o certificado e "Baixar PDF".
7. **Validar:** em `/certificado/validar`, a pessoa digita o código ou lê o QR Code e vê se é válido, com nome, tipo, edição e carga horária.

Antes de emitir a edição inteira, emitir o próprio certificado de teste e conferir o PDF.

## Imutabilidade

Um certificado emitido não muda e não é gerado de novo. Três travas garantem isso:

1. **Model:** com `emitido_em` preenchido, o `Certificado` recusa qualquer alteração, exceto a revogação. Um teste cobre a recusa.
2. **Storage:** o PDF é gravado uma vez em `certificados/{ano}/{codigo}.pdf`. Se o arquivo já existir, a emissão para com erro em vez de sobrescrever.
3. **Hash:** o SHA-256 do PDF fica no banco. Qualquer alteração no arquivo, no R2 ou na mão de alguém, é detectável na validação.

Erro depois da emissão, como nome errado: revogar com motivo e emitir um certificado novo, com outro código. O antigo continua no R2 e o validador responde "revogado". Isso não é gerar de novo: é outro documento, e os dois ficam registrados.

Não recomendo a trava de retenção do R2 (bucket lock): ela impediria apagar o PDF num pedido de exclusão pela LGPD.

## Banco de dados

```
certificados: edicao_id, participante_id (null = adicionado à mão), nome, email,
              tipo, titulo, carga_horaria, atividades (json),
              codigo (unique, null no rascunho), pdf_caminho, pdf_sha256,
              emitido_em, descartado_em, revogado_em, motivo_revogacao
              unique(edicao_id, participante_id, tipo)

avisos_certificado: edicao_id, email, enviado_em (null = pendente)
                    unique(edicao_id, email)
```

- Tudo que vai impresso fica copiado no certificado, para uma reimportação da planilha não mudar nada.
- "Preparar" é idempotente: só cria rascunho para quem ainda não tem certificado daquele tipo, e não recria o que foi descartado ou revogado. Por isso descartar marca `descartado_em` em vez de apagar a linha.
- O certificado reemitido depois de uma revogação entra sem `participante_id`, porque a linha revogada ocupa a chave única.
- `avisos_certificado` entra na fase 4, junto com o disparo.

## Garantia de um e-mail por edição

1. **Banco:** `unique(edicao_id, email)` com `insertOrIgnore`. Só quem inseriu a linha enfileira o envio, então clique duplo ou disparo repetido não reenvia.
2. **Job:** marca `enviado_em` com um `UPDATE ... WHERE enviado_em IS NULL` antes de enviar e desfaz a marca se der exceção. Retentativa da fila não reenvia.
3. **Disparo repetido:** só alcança e-mails novos, o que permite incluir retardatários.

Limitações conhecidas:

- Se o processo morrer no meio, a pessoa fica sem e-mail. Isso aparece no cruzamento com `emails_enviados`.
- Se o SMTP der timeout depois de o provedor aceitar, um e-mail duplicado ainda é possível, mas é raro.
- Quem recebe um certificado novo depois do aviso não é avisado de novo. O painel oferece copiar o link.

## Código validador

- Formato `ST26-7K3M-Q9XP-2TVH`: aleatório, 60 bits, não sequencial.
- O PDF traz o código em texto e um QR Code que abre `/certificado/validar?codigo=X`, já com o código preenchido.
- A validação mostra nome, tipo, edição, carga horária e situação (válido ou revogado), nunca o e-mail. A rota tem limite de requisições para impedir tentativa em massa.
- **Conferir o arquivo:** a página de validação aceita o PDF que a pessoa recebeu, calcula o SHA-256 no próprio navegador e compara com o do banco. O arquivo não sai do computador de quem confere.
- Quem altera o nome no PDF mantém o código: o validador mostra o nome verdadeiro e a conferência do arquivo acusa a diferença.

## LGPD

Imutabilidade e direito de exclusão entram em conflito. Decisão:

- O pedido de exclusão apaga o PDF do R2, anonimiza nome e e-mail do certificado e o cancela com motivo "exclusão a pedido do titular".
- O código e o hash continuam no banco, sem nenhum dado pessoal.
- `LgpdController::show` lista os certificados da pessoa.

O validador diferencia o cancelamento pela LGPD da revogação por erro, porque são situações opostas: na revogação o documento não vale, no cancelamento ele foi emitido de verdade e só os dados saíram do sistema. Texto proposto:

> **Certificado emitido e depois cancelado a pedido do titular.**
> Atendendo à Lei Geral de Proteção de Dados (LGPD), os dados da pessoa foram excluídos e este certificado não pode mais ser exibido aqui. Se você tem o arquivo PDF, confira abaixo se ele é o original.

- **Sem nome e sem data do pedido:** quem consulta normalmente já tem o PDF com o nome. Não repetir o nome evita que o sistema volte a ligar a pessoa ao certificado, e a data do pedido não acrescenta nada para quem confere.
- **Conferência do arquivo continua funcionando:** o hash não identifica ninguém sozinho. Se o PDF bater, o validador responde "arquivo original, emitido pelo Sertão Tech", e quem pediu a exclusão ainda consegue comprovar o próprio certificado.
- **Aviso no atendimento:** antes de excluir, avisar a pessoa que o certificado sai da página de validação e que ela deve guardar o PDF. A tela de LGPD do painel mostra esse aviso quando a pessoa tem certificado emitido.

## Fases

### Fase 1: regras (API)

- Migrations, model `Certificado` com a trava de imutabilidade e o "Preparar" idempotente.
- Rotas de painel com `can:painel-admin` e registro em auditoria.

### Fase 2: modelo, PDF e emissão

- `resources/views/certificados/{ano}.blade.php`, com a arte feita em HTML e CSS, sem imagem de fundo. Edição sem modelo não emite certificado.
- **Design system:** cores e fontes vêm dos tokens de `site/public/ds/styles.css`. Títulos em Space Grotesk, texto em Instrument Sans, código de validação em Space Mono e a marca SERTÃO TECH em League Spartan, em maiúsculas.
- **Fontes:** o site carrega as fontes do Google Fonts, mas o dompdf precisa dos arquivos TTF locais. Os quatro, todos com licença OFL, ficam versionados em `api/resources/fonts/`.
- **Logos:** convertidos para JPEG sobre o creme do papel e versionados em `api/resources/certificados/`. O suporte do dompdf a SVG é parcial, a WebP depende do servidor e o PNG exige a extensão GD, que não foi conferida no servidor. O JPEG entra no PDF sem GD.
- **Peças comuns:** cabeçalho com os logos, rodapé com responsável, razão social, CNPJ, código e QR Code ficam em partials, e o Blade de cada edição muda só o que for da edição.
- **Prévia:** `GET /api/painel/certificados/{ano}/previa?tipo=&nome=&titulo=` renderiza o modelo com dados de exemplo, sem emitir, para ajustar a arte antes do piloto.
- **Emissão:** `POST /api/painel/certificados/{ano}/emitir` com `confirmar: true` enfileira a edição. `POST /api/painel/certificados/{ano}/emitir/{id}` emite um certificado na hora, sem fila, para o teste.
- **Código antes do PDF:** o job grava o código no rascunho antes de gerar o PDF. Se o processo morrer depois do upload, a retentativa acha o arquivo no mesmo caminho e para com erro, sem sobrescrever.
- Nome do responsável, razão social e CNPJ são texto vindo do `.env`, então trocar de responsável não exige nova arte.
- QR Code com `chillerlan/php-qrcode` em SVG, embutido na Blade. SVG dispensa a extensão GD, que ainda não foi conferida no servidor.
- PDF com `barryvdh/laravel-dompdf`, porque hospedagem compartilhada não roda Chrome.
- Emissão em job, um por certificado: gera o PDF uma única vez, grava no disco `s3` (R2) em `certificados/{ano}/{codigo}.pdf`, guarda o SHA-256 e trava.
- Layout em A4 paisagem, com posição absoluta e tabelas, porque o dompdf não tem flexbox, grid nem variáveis CSS. Os valores dos tokens são copiados para o CSS do modelo, com um comentário apontando a origem.
- Criar `storage/fonts` no post-deploy, porque o rsync exclui `/storage/`.

### Fase 3: API pública e site

- `GET /api/certificados/{codigo}` com limite de requisições: dados para a página e para a validação.
- O PDF é servido pela URL pública do R2. O nome do arquivo é o código, que não dá para adivinhar, e é o mesmo que já está impresso no PDF.
- Duas páginas Astro estáticas com `?codigo=`, com `noindex` e fora do sitemap, sem precisar de rewrite na Vercel.
- O certificado na tela é o próprio PDF guardado, então o que a pessoa vê é exatamente o que baixa.
- Revogado responde com `situacao: revogado` e sem `pdf_url`, mas com o hash: o arquivo antigo ainda é conferido como "original, mas revogado". O motivo da revogação não sai na API pública.
- Páginas: `site/src/pages/certificado/index.astro` e `site/src/pages/certificado/validar.astro`. O "Baixar PDF" aponta para o R2, outro domínio, então o navegador abre o PDF numa aba em vez de baixar direto.

### Fase 4: e-mail e disparo

- Mailable HTML com tabelas e CSS inline, mais versão em texto. O texto cita os tipos de certificado e há um botão por certificado.
- Job com a garantia descrita acima.
- Limitador próprio de 70/dia além do `smtp`, reservando 30/dia para a lista de espera. 2026 leva cerca de 3 dias e as duas edições juntas cerca de 4, dentro do `retryUntil` de 7 dias.

### Fase 5: painel e LGPD

- Tela `Certificados.vue`, por edição, seguindo `Participantes.vue`: totais (rascunhos, emitidos, avisados), busca, revisão, minicursos, emissão, revogação, teste e disparo com confirmação.
- `LgpdController` conforme a seção [LGPD](#lgpd).

## Testes das regras críticas

- Certificado emitido recusa alteração, exceto revogação.
- Emitir quando o PDF já existe no storage falha sem sobrescrever.
- O SHA-256 guardado bate com o PDF gravado.
- Preparar duas vezes não duplica rascunhos.
- Disparar duas vezes gera um envio.
- Rodar o job de e-mail duas vezes gera um e-mail.
- Dois certificados no mesmo e-mail geram um e-mail com dois botões.
- Tipo vem do cupom. Faltante sem minicurso e anonimizado não geram certificado.
- Marcar minicurso para quem faltou ao check-in cria certificado de participante com 2 h.
- Os dois minicursos no mesmo certificado são recusados. Atividade que não existe na edição é recusada.
- Código revogado ou inválido é recusado, e o JSON não traz e-mail.
- O PDF começa com `%PDF`.
- O QR Code aponta para a URL de validação com o código do certificado.
- Usuário não admin recebe 403.
- Exclusão por LGPD apaga o PDF, anonimiza e cancela.
- Certificado cancelado pela LGPD responde com o texto de cancelamento, sem nome, e a conferência do arquivo original ainda confirma o hash.

## Fora do escopo por enquanto

Dá para somar depois sem mexer no resto:

- Compartilhar no LinkedIn.
- Webhook de bounce do Resend.
- Assinatura digital ICP-Brasil no PDF.
