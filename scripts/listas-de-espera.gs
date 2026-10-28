// Cria os três formulários de lista de espera de 2027 (participante, palestrante
// e patrocinador) no Google Forms, com o conteúdo da Fase 2 do PLANO-2027.md, e
// liga os três a uma planilha nova (uma aba por form).
//
// Não roda no site nem em Node: é Google Apps Script, executado uma vez na conta
// Google da organização.
//
// Uso:
//   1. Logado na conta da organização, abra https://script.google.com → Novo projeto.
//   2. Apague o conteúdo do Code.gs, cole este arquivo inteiro e salve.
//   3. Escolha a função `criarListasDeEspera` e clique em Executar. Autorize o
//      acesso a Forms e Planilhas quando pedir.
//   4. Os links aparecem no "Registro de execução". Os `viewform` vão para o
//      PLANO-2027.md; os de edição ficam para a organização.
//
// Rodar de novo cria outros três forms e outra planilha (não atualiza os
// existentes). Se precisar refazer, apague os antigos no Drive antes.
//
// Se o texto de um form mudar no plano, mude aqui também, ou ajuste à mão no
// próprio form depois de criado.

const LGPD_TITULO = 'Como usamos seus dados';
const LGPD_TEXTO = (finalidade) =>
  'Os dados deste formulário servem só para a organização do Sertão Tech ' +
  `avisar você sobre a edição 2027: ${finalidade}. Só a organização tem acesso ` +
  'a eles, e não vendemos nem repassamos para terceiros. Guardamos os dados ' +
  'até o fim da edição 2027. Para corrigir ou apagar os seus dados a qualquer ' +
  'momento, chame a organização no WhatsApp +55 (86) 99920-2231 ou no ' +
  'Instagram @osertaotech.';
const LGPD_PERGUNTA = 'Li e concordo com o uso dos meus dados como descrito acima.';

const FORMS = [
  {
    tipo: 'participante',
    titulo: 'Sertão Tech 2027 — Lista de espera',
    descricao:
      'A 2ª edição esgotou. Deixe seu contato e avisamos você primeiro quando ' +
      'as inscrições de 2027 abrirem.',
    finalidade: 'abertura das inscrições, data e local',
    perguntas: (f) => {
      curta(f, 'Nome');
      email(f);
      curta(f, 'WhatsApp (com DDD)').setHelpText('Ex.: (86) 99999-9999');
      curta(f, 'Cidade');
      escolha(f, 'Qual seu perfil?', [
        'Estudante',
        'Profissional de tecnologia',
        'Migrando de carreira',
        'Curioso(a)',
      ]);
    },
  },
  {
    tipo: 'palestrante',
    titulo: 'Sertão Tech 2027 — Quero palestrar',
    descricao:
      'A chamada de palestras de 2027 ainda não abriu. Deixe seu contato e o ' +
      'tema que você quer apresentar, e avisamos você quando abrir.',
    finalidade: 'abertura da chamada de palestras e próximos passos da curadoria',
    perguntas: (f) => {
      curta(f, 'Nome');
      email(f);
      curta(f, 'WhatsApp (com DDD)');
      f.addParagraphTextItem()
        .setTitle('Tema ou área da palestra')
        .setHelpText('Pode ser só uma ideia, a gente ajuda a lapidar.')
        .setRequired(true);
      curta(f, 'LinkedIn ou GitHub', false).setValidation(
        FormApp.createTextValidation()
          .requireTextIsUrl()
          .setHelpText('Cole o link completo, começando com https://')
          .build(),
      );
      escolha(f, 'Já palestrou antes?', [
        'Nunca palestrei',
        'Já palestrei em eventos menores',
        'Já palestrei em eventos grandes',
      ]);
    },
  },
  {
    tipo: 'patrocinador',
    titulo: 'Sertão Tech 2027 — Quero patrocinar',
    descricao:
      'Em 2026 o Sertão Tech reuniu a comunidade de tecnologia do Piauí na ' +
      'UFDPar. Deixe seu contato e enviamos as cotas de 2027 assim que saírem.',
    finalidade: 'cotas, valores e prazos de patrocínio',
    perguntas: (f) => {
      curta(f, 'Empresa');
      curta(f, 'Nome do contato');
      email(f);
      curta(f, 'WhatsApp (com DDD)');
      escolha(f, 'Cota de interesse', [
        'Ouro',
        'Prata',
        'Bronze',
        'Apoio (espaço, coffee break, brindes)',
        'Ainda não sei',
      ]);
    },
  },
];

function curta(f, titulo, obrigatoria = true) {
  return f.addTextItem().setTitle(titulo).setRequired(obrigatoria);
}

function email(f) {
  return curta(f, 'E-mail').setValidation(
    FormApp.createTextValidation()
      .requireTextIsEmail()
      .setHelpText('Digite um e-mail válido.')
      .build(),
  );
}

function escolha(f, titulo, opcoes) {
  return f.addMultipleChoiceItem().setTitle(titulo).setChoiceValues(opcoes).setRequired(true);
}

function criarListasDeEspera() {
  const planilha = SpreadsheetApp.create('Sertão Tech 2027 — Listas de espera');
  const links = [];

  for (const cfg of FORMS) {
    const f = FormApp.create(cfg.titulo)
      .setDescription(cfg.descricao)
      // O e-mail já é uma pergunta; coletar pelo Google exigiria login.
      .setCollectEmail(false)
      .setLimitOneResponsePerUser(false)
      .setProgressBar(false);

    cfg.perguntas(f);

    // Bloco LGPD: última seção, texto + consentimento obrigatório.
    f.addPageBreakItem().setTitle(LGPD_TITULO).setHelpText(LGPD_TEXTO(cfg.finalidade));
    f.addCheckboxItem().setTitle('Consentimento').setChoiceValues([LGPD_PERGUNTA]).setRequired(true);

    f.setDestination(FormApp.DestinationType.SPREADSHEET, planilha.getId());
    // Forms criados por script podem nascer sem publicar (mudança do Google em 2025).
    if (typeof f.setPublished === 'function') f.setPublished(true);

    links.push(`${cfg.tipo}:\n  responder: ${f.getPublishedUrl()}\n  editar:    ${f.getEditUrl()}`);
  }

  // setDestination cria uma aba por form; a aba vazia padrão da planilha sobra.
  const vazia = planilha.getSheetByName('Sheet1') || planilha.getSheetByName('Página1');
  if (vazia && planilha.getSheets().length > 1) planilha.deleteSheet(vazia);

  Logger.log(`${links.join('\n\n')}\n\nplanilha: ${planilha.getUrl()}`);
}
