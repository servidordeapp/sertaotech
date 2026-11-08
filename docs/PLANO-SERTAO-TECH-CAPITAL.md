# Plano: Sertão Tech Capital

**Status:** em planejamento, nada constituído.
**Última revisão:** 2026-11-07.

Fundo privado de investimento em empresas de tecnologia, ligado ao Sertão Tech.
Estrutura jurídica pretendida: sociedade limitada (LTDA) com regência supletiva
da Lei das S/A. Capital inicial: 100 cotas de R$ 1.000, total de R$ 100.000.

O deck para o investidor está em `site/public/fundo/index.html` (`/fundo`,
PDF em `/fundo?print-pdf`). Este documento é o planejamento por trás dele.

## Objetivo

- Levantar R$ 100.000 em 100 cotas até 15 de outubro de 2027.
- Investir em 2 a 3 empresas de SaaS B2B e infraestrutura, com apoio técnico
  do gestor além do dinheiro.
- Usar a Trilha de Negócios do Sertão Tech 2027 como origem das primeiras
  empresas.

## Datas

Os dias e meses vieram da organização. **Os anos são suposição**: o evento é em
15 e 16 de outubro de 2027, então tudo fica em 2027, e o aporte em 2028.

| Data | O que acontece |
| --- | --- |
| 15 out 2027 | Fim da venda de cotas (mínimo: as 100 vendidas). No mesmo dia, o fundo participa do pitch de negócios do Sertão Tech procurando as primeiras empresas. |
| 01 nov a 01 dez 2027 | Análise do que o empreendedor apresentou: verificação e conversa mais profunda (due diligence). |
| 10 nov 2027 | Prazo para os investidores transferirem o dinheiro. Mesmo dia: entrada da abertura do fundo com a contabilidade. |
| 03 jan 2028 | Aporte nas empresas escolhidas no pitch. |

O que as datas não resolvem:

- A transferência vence no mesmo dia em que a abertura é protocolada, então
  **não existe conta do fundo** para receber. Decidir para onde vai o dinheiro
  (ver decisão 4).
- Entre 15 de outubro e 10 de novembro o investidor "comprou" cota de uma
  empresa que ainda não existe. Precisa de termo de reserva assinado.
- A análise vai até 01 de dezembro e o aporte é em 03 de janeiro. Se a análise
  reprovar todas as empresas, o dinheiro fica parado. Definir o que acontece.
- Não há data de **início** da venda de cotas. Sem ela o deck não diz quanto
  tempo o investidor tem para decidir.

## Estrutura jurídica

- **LTDA com Lei das S/A subsidiária.** Cláusula expressa no contrato social.
  O Código Civil permite (art. 1.053, parágrafo único).
- **Classe A (investidores):** R$ 1.000 por cota, direito a lucros, sem voto.
- **Classe B (gestor):** cotas com controle político.
- **Acordo de cotistas:** documento privado com taxa de administração e
  *carried interest* (comissão do gestor sobre o lucro acima do capital).
- **Gestor integraliza em dinheiro** 5 ou 7 cotas (R$ 5.000 ou R$ 7.000).
- **Nas investidas:** direitos políticos ou assento em conselho consultivo
  técnico, e *vesting* reverso para os fundadores executores.

### Pontos que precisam de advogado antes de vender qualquer cota

Não são objeções, são riscos que o material de origem não menciona.

1. **Sweat equity não existe em LTDA.** O Código Civil veda contribuição em
   prestação de serviços (art. 1.055, §2º). As cotas do gestor por "trabalho de
   gestão" não podem ser capital. Alternativa: o gestor é remunerado pela taxa
   de administração e pelo *carry* no acordo, e as cotas Classe B vêm do
   dinheiro dele.
2. **Cotas sem voto e classes diferentes** em LTDA são discutíveis. A
   flexibilidade existe, mas a cláusula que tira o investidor de todo resultado
   é nula (art. 1.008). Validar a redação.
3. **Venda de "cotas" para o público pode ser oferta de valor mobiliário.**
   Investimento coletivo com expectativa de lucro do esforço de terceiro cai na
   CVM (Lei 6.385/76, art. 2º, IX), e o deck é justamente material de venda.
   Ver se o círculo restrito de convidados e o valor baixo dão dispensa, e
   como a captação pode ser feita.
4. **O nome "fundo".** FIP e outros fundos são regulados pela CVM. Uma LTDA que
   se chama fundo confunde investidor e regulador. Considerar
   "Sertão Tech Capital Participações Ltda." e usar "fundo" só como apelido.
5. **Tributação.** LTDA paga IRPJ e CSLL e não tem a transparência de um
   fundo. O contador precisa dizer como ficam ganho de capital na venda de
   participação e distribuição de lucro ao investidor.
6. **Conflito de interesses.** O organizador do evento é também o gestor do
   fundo e o fundo participa do pitch que o evento promove. A banca e a
   Startup Piauí precisam saber, e o regulamento do pitch deve dizer que o
   fundo não tem tratamento especial.
7. **Marco Legal das Startups (LC 182/2021).** Vale para o lado das investidas:
   o contrato de investimento-anjo permite ao fundo aportar sem virar sócio com
   responsabilidade sobre dívidas. Escolher o instrumento por empresa.

## Tese de investimento

Startups que constroem a "cozinha" tecnológica de outras empresas.

- **Infraestrutura de software:** DevTools, cloud, monitoramento de
  microsserviços (APM), logs, FinOps.
- **B2B SaaS:** ERPs e CRMs de nicho, automação de processos, IA para
  produtividade corporativa.
- **Erro típico que o gestor ataca:** multi-tenancy (separação de dados de
  clientes), assinaturas e integrações de API.
- **Fora da tese:** consumo, marketplace, hardware.

## Estratégia da carteira

| | Validação (pré-seed) | Co-investimento | Concentração técnica |
| --- | --- | --- | --- |
| Cheque | R$ 20 a 25 mil | R$ 10 a 15 mil | R$ 30 a 50 mil |
| Empresas | 4 a 5 | 7 a 10 | 2 a 3 |
| Estágio | Ideação ou MVP | Rodada liderada por outro | MVP a primeiras vendas |
| Papel | Compra 5% a 8% cedo | Carona em anjo ou plataforma (CapTable, EqSeed) | Smart money técnico |
| Ponto fraco | 5 x R$ 25 mil = R$ 125 mil, passa do capital | Sem influência, sem vantagem técnica | Poucas apostas |

**Recomendação: concentração técnica.** O gestor é técnico e opera, então o
valor dele é o tempo sentado com o fundador, e 2 a 3 empresas é o máximo que
cabe. O deck usa essa. Mas o que decide é o dinheiro disponível (próxima
seção).

### Quanto sobra para investir

A contabilidade custa R$ 500 por mês, R$ 6.000 por ano: **6% do capital por
ano**, só de contador, fora registro, tarifas e taxa de administração.

| Horizonte | Contabilidade | Sobra dos R$ 100 mil | 2 empresas | 3 empresas |
| --- | --- | --- | --- | --- |
| 12 meses | R$ 6.000 | R$ 94.000 | R$ 47.000 | R$ 31.333 |
| 36 meses | R$ 18.000 | R$ 82.000 | R$ 41.000 | R$ 27.333 |

Com 3 empresas em 36 meses o cheque sai abaixo dos R$ 30 mil. Para a
concentração técnica fechar, ou o fundo reserva caixa para custos, ou investe
só em 2 empresas, ou o custo é coberto por fora.

### Referência de mercado para taxas

Fundos de venture capital costumam cobrar cerca de 2% ao ano de administração
e cerca de 20% de *carry*. Confirmar com advogado. Em R$ 100 mil, 2% são
R$ 2.000 por ano, **menos que a contabilidade sozinha**. A taxa de
administração precisa ser pensada junto com o custo fixo, não separada.

## Due diligence técnica

Startups nesse estágio quase não têm receita, então o foco é código, não
balanço.

1. **Revisão de repositório (GitHub/GitLab):** código limpo, padrões de
   mercado, modular ou "monolito macarrônico".
2. **Entrevista com o CTO ou fundador técnico:** entende de escalabilidade ou
   está colando componentes de um curso sem entender a segurança.
3. **Maturidade de segurança:** chaves de API, variáveis de ambiente, dados
   sensíveis.

Janela: 01 de novembro a 01 de dezembro de 2027. Além do técnico, a análise
confirma se o que o empreendedor apresentou no pitch é verdade (decisão 8).

## Apoio técnico do gestor

- **Arquitetura e infraestrutura:** MVP em tecnologia escalável, boas práticas
  de API, multi-banco quando fizer sentido.
- **DevSecOps:** CI/CD automatizado e segurança desde o primeiro dia.
- **Produto e métricas:** feedback de cliente virando backlog.

O compromisso precisa estar escrito: horas por mês, canal e contrapartida do
fundador (por isso o *vesting* reverso e o assento no conselho técnico).

## Decisões

| # | Pergunta | Recomendação | Situação |
| --- | --- | --- | --- |
| 1 | O fundo é LTDA, FIP ou outra coisa? | Validar com advogado antes de vender qualquer cota (pontos 1 a 4 acima). | Aberta |
| 2 | Quais são a taxa de administração e o *carry*? | Fechar junto com o custo fixo. O deck não traz número e diz que está no acordo de cotistas. | Aberta |
| 3 | Quantas cotas o gestor integraliza, 5 ou 7? | A definir. | Aberta |
| 4 | Para onde vai o dinheiro de quem reservou, já que não há CNPJ até 10 de novembro? | Conta de custódia ou termo de reserva com pagamento só após o CNPJ. Não usar conta pessoal. | Aberta |
| 5 | Cota mínima e máxima por investidor? | O deck só diz "R$ 1.000 por cota". Máximo evita que um investidor tenha peso demais. | Aberta |
| 6 | Se não vender 100 cotas até 15 de outubro, o que acontece? | Devolução integral. Escrever no termo de reserva. | Aberta |
| 7 | Estratégia da carteira | Concentração técnica, com 2 empresas se o custo fixo apertar. | Aberta |
| 8 | A análise de 01 nov a 01 dez 2027 pode reprovar todas as empresas? | Sim, e o dinheiro continua no fundo para o próximo pitch. Escrever. | Aberta |
| 9 | Quando começa a venda de cotas? | Sem data, o prazo do investidor decidir é desconhecido. | Aberta |
| 10 | O WhatsApp (86) 99920-2231 do evento serve para o fundo? | Provavelmente um número ou link separado, para não misturar com patrocínio. | Aberta |

## Deck para o investidor

Estrutura (`site/public/fundo/index.html`):

| # | Slide | Para quê |
| --- | --- | --- |
| 1 | Capa | Nome, o que é, prazo |
| 2 | Por que existe | Deal flow do Sertão Tech, 2026 e Trilha de Negócios |
| 3 | O fundo em números | 100 cotas, R$ 1.000, R$ 100 mil |
| 4 | Tese | SaaS B2B, infraestrutura, tecnologia |
| 5 | Diferencial do gestor | Apoio técnico, não só cheque |
| 6 | Como escolhemos | Due diligence em 3 passos |
| 7 | Carteira | 2 a 3 empresas, cheque de R$ 30 a 50 mil |
| 8 | Estrutura | Classes, acordo de cotistas, o que o investidor tem |
| 9 | Datas | Cronograma de 15 out 2027 a 03 jan 2028 |
| 10 | Custos e riscos | Contabilidade R$ 500/mês, risco de perda |
| 11 | Como entrar | Chamada para o WhatsApp |

Regra do deck: **nenhuma promessa de retorno, rentabilidade ou prazo de saída.**
Startup em estágio inicial pode perder tudo, e o deck diz isso. Antes de
mandar a alguém, resolver as decisões 1, 2 e 6.

## Próximos passos

- [ ] Advogado societário: pontos 1 a 7, contrato social e acordo de cotistas.
- [ ] Contador: tributação e custo real da abertura (R$ 500/mês cobre só o
      recorrente?).
- [ ] Fechar taxa de administração, *carry* e cotas do gestor.
- [ ] Termo de reserva e conta de recebimento.
- [ ] Data de início da venda de cotas.
- [ ] Avisar banca e Startup Piauí sobre a participação do fundo no pitch.
- [ ] Revisar o deck depois das respostas acima e publicar.
