# Plano: Sertão Tech Capital

**Status:** em planejamento, nada constituído.
**Última revisão:** 2026-11-08.

Fundo privado de investimento em empresas de tecnologia, ligado ao Sertão Tech.
A estrutura adotada é a do OnePager (`capital/ONEPAGER.md`): este documento é o
planejamento por trás dele e, em caso de divergência, **o OnePager manda**.

- **Estrutura jurídica pretendida:** Holding S/A fechada, com acordo de
  acionistas e governança centralizada.
- **Capital:** R$ 1.000.000, em 10.000 cotas de R$ 100.
- **Lote:** 100 cotas = R$ 10.000. O cotista compra no mínimo 1 lote. Com 100
  cotistas de 1 lote chega-se a R$ 1.000.000.
- **Lançamento definitivo:** no dia da 4ª edição do Sertão Tech, em 2028 (a
  edição de 2026 foi a 2ª, a de 2027 será a 3ª). **A data exata da 4ª edição
  ainda não existe**; todas as datas abaixo são relativas a ela.

O deck para o investidor está em `site/public/fundo/index.html` (`/fundo`,
PDF em `/fundo?print-pdf`). **Está desatualizado**: ainda traz R$ 100 mil,
R$ 1.000 por cota, 2 a 3 empresas e datas de 2027. Refazer depois deste plano.

## Objetivo

- Levantar R$ 1.000.000 em 100 lotes de R$ 10.000, com fechamento do livro de
  cotas até o dia da 4ª edição (2028).
- Investir em 6 a 8 startups Pre-Seed de SaaS B2B e infraestrutura, com apoio
  técnico dos acionistas além do dinheiro.
- Usar a Trilha de Negócios do Sertão Tech (2027 e 2028) como origem das
  primeiras empresas.

## Datas

Janela de captação de 6 meses, **contada para trás a partir do dia da 4ª
edição**. Sem a data da edição não há calendário absoluto.

| Quando | O que acontece |
| --- | --- |
| Meses 1-2 | Reservas abertas para o círculo interno de tecnologia e parceiros estratégicos locais. |
| Meses 3-4 | Investidores anjos regionais e consolidação jurídica da Holding S/A. |
| Meses 5-6 | Fechamento do livro de cotas (máximo 100 lotes), com os cotistas comprometidos por termo de reserva. **Nenhuma chamada de capital nem aporte antes do lançamento.** |
| Dia da 4ª edição (2028) | Lançamento definitivo do fundo. |
| Após o lançamento | Chamadas de capital e, em seguida, primeiros aportes nas startups mapeadas. Decidido: **chamada de capital e aportes só depois do lançamento**. |

Pontos que as datas não resolvem:

- **Cotista comprometido, mas sem dinheiro no caixa até o lançamento.** Se
  desistir ou não pagar na chamada, o livro de 100 lotes fica furado depois do
  lançamento. O termo de reserva precisa prever multa ou perda do lote e
  lista de espera (decisão 4).
- **Prazo entre o lançamento, a chamada de capital e o primeiro aporte** ainda
  não existe. Definir (ex.: dias para o cotista pagar após a chamada).
- **Custos antes do lançamento** (contabilidade, jurídico da Holding nos meses
  3-4) não têm caixa para pagar, já que não há chamada. Definir quem adianta.
- Entre a reserva e a constituição o investidor reservou cota de empresa que
  ainda não existe. Precisa de termo de reserva assinado (decisão 4).
- Nada garante os R$ 1.000.000. Definir o mínimo para constituir e o que
  acontece abaixo dele (decisão 6).
- A análise técnica das startups (ver due diligence) precisa de prazo próprio
  entre o mapeamento e o aporte. Definir.

## Estrutura jurídica

- **Holding S/A fechada**, com acordo de acionistas e governança centralizada.
- **Cotas:** 10.000 cotas de R$ 100, vendidas em lotes de 100 (R$ 10.000).
  Sociedade anônima tem *ações*, não cotas. "Cota" fica como termo comercial
  do OnePager; o contrato usa o termo jurídico certo (decisão 11).
- **Gestor:** remunerado por taxa de administração e *carry*, definidos no
  acordo de acionistas. Detém as ações ordinárias (ver proposta abaixo).
- **Nas investidas:** direitos políticos ou assento em conselho consultivo
  técnico, e *vesting* reverso para os fundadores executores.

### Proposta de arquitetura societária

Desenho recebido em 2026-11-08, **proposta a validar com advogado**, não
decisão fechada.

**Classes de ações**

| Classe | Quem detém | Voto | Direito econômico |
| --- | --- | --- | --- |
| Ordinárias (ON, Classe A) | Gestor | Sim, controle total ou majoritário | *Carry* |
| Preferenciais (PN, Classe B) | Investidores, coletivamente 100% das PN | Não nas decisões de investimento | Preferência em dividendos e nas saídas (*exits*) |

- O gestor escolhe as startups, audita o código e assina os cheques **sem
  assembleia com os 100 cotistas** a cada investimento.
- Os R$ 1.000.000 vêm dos investidores e viram as PN. Cada lote de R$ 10.000
  é 1% do capital financeiro.
- As ON do gestor têm valor nominal simbólico na fundação, pois o ganho dele
  vem do *carry*.

**Cascata de distribuição (*waterfall*)**, prevista no estatuto, quando uma
investida é vendida e o dinheiro entra na Holding:

1. **Devolução do principal** às PN, até recuperarem os R$ 10.000 por lote (ou
   a fração equivalente à fatia vendida).
2. **Excedente** dividido 80% para as PN e 20% para as ON (*carry*, padrão de
   mercado).

**Governança**

- **Conselho consultivo** de 3 ou 5 membros eleitos entre os acionistas
  seniores. Não vota investimentos; acompanha relatórios trimestrais do
  portfólio.
- **Cláusula de não-diluição** do poder de voto das ON, para novos acionistas
  ou rodadas futuras não diluírem o controle do gestor.
- **Custos enxutos:** usar as flexibilizações da Lei das S/A para publicar
  editais e demonstrações financeiras pela internet. Conferir com advogado se
  a Holding se enquadra.

**Onde a proposta esbarra no que já está no plano**

- **Limite de 50% de preferenciais sem voto.** Se os investidores têm 100% das
  PN e as ON são simbólicas, as PN passam de 99% do capital, e a lei limita as
  PN sem voto a 50% do total (Lei 6.404/76, art. 15, §2º). Ou os investidores
  recebem ON também (com voto, e sem a autonomia do gestor), ou o gestor
  integraliza ON em dinheiro até igualar, ou muda-se o desenho (por exemplo,
  acordo de acionistas que concentre o voto no gestor). **É o ponto que mais
  pesa.**
- **"Sweat equity" não entra como capital.** A S/A só aceita capital em bens
  avaliáveis em dinheiro (Lei 6.404/76, art. 7º); trabalho de gestão não conta.
  As ON simbólicas precisam ser pagas em dinheiro, ainda que pouco.
- **Não-diluição do gestor** protege o controle dele, não o investidor. Dizer
  isso com clareza no material de venda e no acordo.
- **O *carry* de 20% e o *waterfall* ainda não estão decididos** (decisão 2).
  O OnePager só diz que o gestor é pago pelo sucesso das saídas.

### Pontos que precisam de advogado antes de vender qualquer cota

Não são objeções, são riscos que o material de origem não menciona.

1. **Classes de ação e voto.** Na S/A, ações preferenciais sem voto são
   permitidas, mas há limite (Lei 6.404/76, art. 15, §2º: até 50% do capital).
   Se a ideia é investidor sem voto e gestor com o controle, validar a conta.
2. **Governança "centralizada" com 100 acionistas.** Assembleia, conselho,
   livro de registro e publicações têm custo e rotina de S/A. Ver o que a
   forma "fechada" dispensa.
3. **Venda de "cotas" para o público pode ser oferta de valor mobiliário.**
   Captar R$ 1.000.000 de até 100 pessoas com expectativa de lucro do esforço
   de terceiro cai na CVM (Lei 6.385/76, art. 2º, IX), e o OnePager e o deck
   são material de venda. Ver se há dispensa para a oferta e como a captação
   pode ser feita. Com 100 pessoas e esse valor, é o ponto mais pesado.
4. **O nome "fundo".** FIP e outros fundos são regulados pela CVM. Uma Holding
   S/A que se chama fundo confunde investidor e regulador. O OnePager já diz
   "Holding S/A" e que foge do FIP; considerar "Sertão Tech Capital
   Participações S.A." e usar "fundo" só como apelido.
5. **Tributação.** A Holding paga IRPJ e CSLL e não tem a transparência de um
   fundo. O contador precisa dizer como ficam ganho de capital na venda de
   participação e distribuição de dividendos ao investidor.
6. **Conflito de interesses.** O organizador do evento é também o gestor do
   fundo, e o lançamento é no próprio evento. Banca e Startup Piauí precisam
   saber, e o regulamento do pitch deve dizer que o fundo não tem tratamento
   especial. O OnePager também menciona "nossas próprias operações de
   tecnologia de pagamento": explicar ao investidor quais são.
7. **Marco Legal das Startups (LC 182/2021).** Vale para o lado das investidas:
   o contrato de investimento-anjo permite ao fundo aportar sem virar sócio com
   responsabilidade sobre dívidas. Escolher o instrumento por empresa.

## Tese de investimento

Startups que constroem a "cozinha" tecnológica de outras empresas.

- **B2B SaaS:** eficiência corporativa, automação e retenção de receita
  recorrente. ERPs e CRMs de nicho, IA para produtividade corporativa.
- **Infraestrutura e DevSecOps:** microsserviços, bancos de dados, APIs
  escaláveis, segurança da informação, DevTools, cloud, APM, logs, FinOps.
- **Erro típico que o gestor ataca:** multi-tenancy (separação de dados de
  clientes), assinaturas e integrações de API.
- **Fora da tese:** consumo, marketplace, hardware, e **fintechs amplas e
  payment gateways genéricos** (conflito com as operações de pagamento do
  gestor).

## Estratégia da carteira

Capital de R$ 1.000.000 em 6 a 8 startups Pre-Seed.

| | Cheque principal | Aposta em MVP |
| --- | --- | --- |
| Valor | R$ 100.000 a R$ 150.000 | R$ 20.000 a R$ 40.000 |
| Estágio | Pre-Seed com alguma tração | MVP, ideia ainda barata de testar |
| Papel | Posição relevante, apoio técnico próximo | Parte do capital arriscada em apostas menores |

- **Reserva de 20% a 30%** (R$ 200 a 300 mil) para *follow-on* nas empresas de
  maior tração.
- Só parte do capital vai para MVPs. Quanto, não está definido (decisão 7).

### Quanto sobra para investir

Custo conhecido: contabilidade de R$ 500 por mês, R$ 6.000 por ano, ou
**0,6% do capital por ano**, fora registro, tarifas e taxa de administração.

Conta de referência, só com contabilidade e sem taxa de administração:

| Horizonte | Contabilidade | Sobra dos R$ 1.000.000 | Com 25% de reserva | Em 6 empresas | Em 8 empresas |
| --- | --- | --- | --- | --- | --- |
| 12 meses | R$ 6.000 | R$ 994.000 | R$ 745.500 | R$ 124.250 | R$ 93.188 |
| 36 meses | R$ 18.000 | R$ 982.000 | R$ 736.500 | R$ 122.750 | R$ 92.063 |

Com 8 empresas o cheque médio cai abaixo de R$ 100 mil, o piso do OnePager.
Os MVPs de R$ 20 a 40 mil mudam essa conta: parte das empresas recebe menos e
sobra para as de cheque cheio. Fechar a divisão (decisão 7).

### Referência de mercado para taxas

Fundos de venture capital costumam cobrar cerca de 2% ao ano de administração
e cerca de 20% de *carry*. Confirmar com advogado. Em R$ 1.000.000, 2% são
R$ 20.000 por ano. O OnePager diz que a taxa de administração cobre **só**
custos contábeis e jurídicos: então ela é custo, não remuneração do gestor, e o
gestor vive do *carry*. Dizer isso com clareza ao investidor.

## Due diligence técnica

Startups nesse estágio quase não têm receita, então o foco é código, não
balanço.

1. **Revisão de repositório (GitHub/GitLab):** código limpo, padrões de
   mercado, modular ou "monolito macarrônico".
2. **Entrevista com o CTO ou fundador técnico:** entende de escalabilidade ou
   está colando componentes de um curso sem entender a segurança.
3. **Maturidade de segurança:** chaves de API, variáveis de ambiente, dados
   sensíveis.

Além do técnico, a análise confirma se o que o empreendedor apresentou no pitch
é verdade. A janela de análise precisa ser definida junto com o calendário. Como os
aportes só saem após o lançamento, a análise pode correr antes ou depois dele.

## Apoio técnico dos acionistas

- **Arquitetura e infraestrutura:** MVP em tecnologia escalável, boas práticas
  de API, multi-banco quando fizer sentido.
- **DevSecOps:** CI/CD automatizado e segurança desde o primeiro dia.
- **Produto e métricas:** feedback de cliente virando backlog.
- **Talentos técnicos:** atração de gente para as investidas.

O compromisso precisa estar escrito: horas por mês, canal e contrapartida do
fundador (por isso o *vesting* reverso e o assento no conselho técnico).

**Tensão a resolver:** a versão anterior deste plano concluía que o gestor, por
ser técnico e operar, só consegue sentar de verdade com 2 a 3 empresas. O
OnePager promete 6 a 8. O apoio passa a depender do **grupo de acionistas**
(mentores), não só do gestor. Dizer como esse grupo é organizado.

## Decisões

| # | Pergunta | Recomendação | Situação |
| --- | --- | --- | --- |
| 1 | Holding S/A fechada é a forma final? | Validar com advogado antes de vender qualquer cota (pontos 1 a 4). | Aberta |
| 2 | Quais são a taxa de administração e o *carry*? | Proposta recebida: *carry* de 20% após devolução do principal (80/20). Fechar junto com o custo fixo. Deck sem número, remete ao acordo de acionistas. | Proposta |
| 3 | Quantas ações o gestor integraliza em dinheiro? | A proposta pede ON simbólicas, mas o limite de 50% de PN pode exigir mais capital do gestor. Resolver junto com o ponto 1. | Aberta |
| 4 | Como proteger o fundo se não há dinheiro até o lançamento? | Decidido: sem chamada antes do lançamento, então não há conta de custódia. Falta o termo de reserva com multa por desistência e lista de espera. Não usar conta pessoal para custos. | Aberta |
| 5 | Máximo de lotes por investidor? | O mínimo é 1 lote (R$ 10.000). Teto evita um investidor com peso demais e mantém a meta de 100 cotistas. | Aberta |
| 6 | Mínimo para constituir e o que fazer se não vender os 100 lotes? | Devolução integral abaixo do mínimo. Escrever no termo de reserva. | Aberta |
| 7 | Quanto do capital vai para MVPs de R$ 20 a 40 mil e quanto para cheques de R$ 100 a 150 mil? | Fechar a divisão e o número de empresas (6 a 8). | Aberta |
| 8 | A análise técnica pode reprovar todas as empresas? | Sim, e o dinheiro continua no fundo para o próximo pitch. Escrever. | Aberta |
| 9 | Quando começa a venda de cotas? | Contar 6 meses para trás a partir da 4ª edição, assim que houver data. | Aberta |
| 10 | O WhatsApp (86) 99920-2231 do evento serve para o fundo? | Provavelmente um número ou link separado, para não misturar com patrocínio. | Aberta |
| 11 | Chamar de "cota" ou "ação" no contrato? | Ação, que é o termo de S/A. "Cota" fica na comunicação. | Aberta |
| 12 | Data da 4ª edição | Depende da organização. Sem ela, o calendário é só relativo. | Aberta |

## Deck para o investidor

**Desatualizado, refazer.** Estrutura prevista (`site/public/fundo/index.html`):

| # | Slide | Para quê |
| --- | --- | --- |
| 1 | Capa | Nome, o que é, prazo |
| 2 | Por que existe | Deal flow do Sertão Tech e Trilha de Negócios |
| 3 | O fundo em números | R$ 1.000.000, 10.000 cotas de R$ 100, lote de R$ 10.000 |
| 4 | Tese | SaaS B2B, infraestrutura e DevSecOps |
| 5 | Diferencial | Devs investindo em devs: apoio técnico, não só cheque |
| 6 | Como escolhemos | Due diligence em 3 passos |
| 7 | Carteira | 6 a 8 startups, cheques de R$ 100 a 150 mil, MVPs de R$ 20 a 40 mil, reserva de 20% a 30% |
| 8 | Estrutura | Holding S/A, acordo de acionistas, o que o investidor tem |
| 9 | Datas | Janela de 6 meses até o lançamento na 4ª edição |
| 10 | Custos e riscos | Contabilidade R$ 500/mês, risco de perda |
| 11 | Como entrar | Chamada para o WhatsApp |

Regra do deck: **nenhuma promessa de retorno, rentabilidade ou prazo de saída.**
Startup em estágio inicial pode perder tudo, e o deck diz isso. Antes de
mandar a alguém, resolver as decisões 1, 2, 6 e 12.

## Próximos passos

- [ ] Advogado societário: pontos 1 a 7, estatuto e acordo de acionistas.
- [ ] Contador: tributação e custo real da abertura (R$ 500/mês cobre só o
      recorrente?).
- [ ] Fechar taxa de administração, *carry* e ações do gestor.
- [ ] Fechar a divisão entre cheques principais e MVPs.
- [ ] Confirmar a data da 4ª edição e montar o calendário absoluto.
- [ ] Termo de reserva e conta de recebimento.
- [ ] Avisar banca e Startup Piauí sobre o fundo no evento.
- [ ] Refazer o deck depois das respostas acima e publicar.
