# Melhorias futuras

Lacunas conhecidas, anotadas quando foram descobertas. Nenhuma delas bloqueia o
que está no ar; cada uma custa trabalho próprio e por isso ficou de fora do
escopo em que apareceu.

## Registrar e-mail que falhou

`emails_enviados` só tem uma linha por e-mail que **saiu** — o listener
`RegistraEmailEnviado` escuta `MessageSent`. E-mail que o provedor recusou, que
estourou o limite diário ou que morreu na fila não deixa rastro ali; o que
sobra é a linha genérica em `failed_jobs`.

Efeito: o painel consegue dizer "saíram 37 e-mails hoje", mas não "3 falharam".
Para auditoria de LGPD isso basta (prova do que foi enviado); para operação,
não — ninguém descobre que o aviso de inscrição não chegou.

Custo: capturar a falha de verdade exige um ponto de escuta a mais (falha de
job de mail e/ou retorno do provedor) e uma coluna de status na tabela.

Descoberto em 2026-11-04, mapeando o painel.

## Origem da inscrição (UTM)

`waitlist_entries` não guarda de onde a pessoa veio: não há UTM, referrer nem
página de origem. Então não dá para responder "a caravana rendeu quantas
inscrições?" ou "o post do Instagram converteu?".

Custo: campos novos no formulário do site (lidos da query string e levados no
POST), coluna nova na tabela e, no painel, o recorte por origem.

Descoberto em 2026-11-04, mapeando o painel.

## Métrica de patrocinador vive no GA4

`site/src/components/SponsorTelemetry.astro` manda `sponsor_impression` e
`sponsor_click` para o Google Analytics via `gtag`, não para a api. O número que
vai no relatório dos patrocinadores sai de lá, não do banco.

Efeito: o painel não consegue mostrar impressão/clique de logo junto com o
resto sem integrar com a API de dados do GA4 — que é autenticação nova,
dependência nova e cota de API. Projeto separado, não uma query.

Descoberto em 2026-11-04, mapeando o painel.
