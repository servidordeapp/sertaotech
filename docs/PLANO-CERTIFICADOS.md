# Plano: módulo de certificados

**Status:** em planejamento, nada implementado.
**Última revisão:** 2026-11-05.

## Objetivo

- Ter um modelo de certificado por edição (2025, 2026, 2027 e seguintes).
- Avisar cada pessoa por e-mail que o certificado do seu tipo (participante, palestrante ou organização) está disponível.
- Enviar esse e-mail no máximo uma vez por edição.
- O botão do e-mail abre uma página que exibe o certificado e permite baixar o PDF.
- O PDF traz um código que qualquer pessoa pode conferir em `/certificado/validar`.

## Decisões

| # | Pergunta | Recomendação | Situação |
|---|---|---|---|
| 1 | Quem recebe certificado? | Só quem tem check-in, mais a equipe revisada, porque certificado atesta presença. O site de 2026 promete "certificado de participação pra todo mundo", e ficariam de fora 57 ingressos em 2026 e 81 em 2025. | Aberta |
| 2 | Como criar o modelo de cada edição? | Blade + arte versionados, como em "edição nova entra por migration". Editor no painel é bem mais caro e só compensa se alguém sem acesso ao código for criar modelos. | Aberta |
| 3 | Quem faz a arte? | A definir: arte existente ou proposta feita com a marca. | Aberta |
| 4 | O que vai escrito em cada certificado? | Ver [Conteúdo pendente](#conteúdo-pendente). | Aberta |
| 5 | Quem é a equipe de cada edição? | Lista de 2025 e conferência de 2026. Sem ela, palestrantes ficam de fora ou recebem certificado como participante. | Aberta |
| 6 | Qual a ordem de envio? | 2026 primeiro, como piloto, e 2025 depois. | Aberta |
| 7 | Aprovar `barryvdh/laravel-dompdf` e a pasta `app/Jobs`? | Sim. O `api/CLAUDE.md` exige aprovação para dependência e pasta novas. | Aberta |

### Conteúdo pendente

- **2025:** data do evento, que não está no repositório.
- **2026:** carga horária. O evento foi em 09/10/2026, das 14h às 21h10, cerca de 7h.
- **2027:** o mídia kit de caravanas promete razão social, CNPJ, nome e datas do evento, carga horária de 16 h, atividades e assinatura do responsável legal.
- **Emissor:** quem assina e com qual CNPJ. O `ROTEIRO-NEGOCIOS-2027.md` ainda tem "definir quem emite a NF" em aberto.

### Conferir em produção

- [ ] Existe cron do `queue:work` no cPanel? Não há nenhum no repositório.
- [ ] Qual o valor de `MAIL_LIMITE_DIARIO`? O padrão do `.env.example` é 100.
- [ ] As planilhas de 2025 e 2026 já foram importadas? O banco local está vazio.

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
- **Equipe de 2026:** a regra "cupom + check-in" deixa gente de fora. O palco teve 18 pessoas, então nem todas têm cupom.
- **Cancelamentos:** cupom sem check-in pode ser de quem cancelou. Por isso a emissão por cupom não é automática e passa por revisão humana.
- **Mesmo e-mail:** certificado é por pessoa, aviso é por e-mail. Um e-mail pode trazer vários botões.
- **Limite de envio:** o limitador `smtp` é compartilhado com a lista de espera. Com o padrão de 100/dia, o disparo de 172 e-mails travaria as confirmações da lista por 2 dias.

## Fluxo

1. **Importar:** `participantes:importar`, que já existe.
2. **Gerar:** no painel, em Certificados, escolher a edição e clicar em "Gerar". Quem tem check-in entra, e o tipo vem do cupom.
3. **Revisar:** corrigir nome ou tipo, adicionar equipe sem ingresso, revogar e enviar um e-mail de teste para si.
4. **Disparar:** o sistema enfileira um aviso por e-mail ainda não avisado.
5. **Receber:** o botão do e-mail abre `osertaotech.com.br/certificado?codigo=X`, com o certificado e "Baixar PDF".
6. **Validar:** em `/certificado/validar`, a pessoa digita o código e vê se é válido, com nome, tipo e edição.

## Banco de dados

```
certificados: edicao_id, participante_id (null = manual), nome, email, tipo,
              codigo (unique), revogado_em
              unique(edicao_id, participante_id)

avisos_certificado: edicao_id, email, enviado_em (null = pendente)
                    unique(edicao_id, email)
```

- Nome e tipo ficam copiados no certificado, para uma correção não se perder se a planilha for reimportada.
- Mesmo e-mail com mesmo nome gera um certificado só, no tipo mais alto: organização, depois palestrante, depois participante.
- "Gerar" é idempotente: só cria certificado para quem ainda não tem, e não recria o que foi revogado.

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
- Não é hash do arquivo. Hash do PDF quebraria a cada nova geração e não acrescentaria proteção.
- A integridade vem da comparação: quem altera o nome no PDF mantém o código, e o validador mostra o nome verdadeiro.
- A resposta traz nome, tipo e edição, nunca o e-mail. A rota tem limite de requisições para impedir tentativa em massa.

## Fases

### Fase 1: regras (API)

- Migrations, model `Certificado` e a geração idempotente.
- Rotas de painel com `can:painel-admin` e registro em auditoria.

### Fase 2: modelo e PDF

- `resources/views/certificados/{ano}.blade.php` mais a arte de fundo. Edição sem modelo não gera certificado.
- PDF com `barryvdh/laravel-dompdf`, porque hospedagem compartilhada não roda Chrome. Ele é gerado na hora e não fica guardado.
- Layout com posição absoluta, porque o dompdf não tem flexbox nem grid.
- Criar `storage/fonts` no post-deploy, porque o rsync exclui `/storage/`.

### Fase 3: API pública e site

- `GET /api/certificados/{codigo}`, `/html` e `/pdf`, todas com limite de requisições.
- Duas páginas Astro estáticas com `?codigo=`, com `noindex` e fora do sitemap, sem precisar de rewrite na Vercel.
- O certificado na tela é um iframe da mesma Blade do PDF, então existe um único modelo.

### Fase 4: e-mail e disparo

- Mailable HTML com tabelas e CSS inline, mais versão em texto. O texto muda por tipo e há um botão por certificado.
- Job com a garantia descrita acima.
- Limitador próprio de 70/dia além do `smtp`, reservando 30/dia para a lista de espera. 2026 leva cerca de 3 dias e as duas edições juntas cerca de 4, dentro do `retryUntil` de 7 dias.

### Fase 5: painel e LGPD

- Tela `Certificados.vue`, por edição, seguindo `Participantes.vue`: totais (enviados e pendentes), busca, edição, adição, revogação, teste e disparo com confirmação.
- `LgpdController`: `show` lista os certificados e `destroy` apaga certificados e avisos, invalidando o código.

## Testes das regras críticas

- Disparar duas vezes gera um envio.
- Rodar o job duas vezes gera um e-mail.
- Dois ingressos no mesmo e-mail geram um e-mail com dois botões.
- Mesmo e-mail com mesmo nome gera um certificado.
- Tipo vem do cupom. Faltante e anonimizado não geram certificado.
- Código revogado ou inválido é recusado, e o JSON não traz e-mail.
- O PDF começa com `%PDF`.
- Usuário não admin recebe 403.
- Exclusão por LGPD apaga certificados e avisos.

## Fora do escopo por enquanto

Dá para somar depois sem mexer no resto:

- QR code: o PDF traz um link clicável para o validador.
- Compartilhar no LinkedIn.
- Webhook de bounce do Resend.
