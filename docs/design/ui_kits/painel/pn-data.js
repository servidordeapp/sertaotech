/* Painel interno — dados FICTÍCIOS para o protótipo. Nenhum dado real de inscrito. */
(function () {
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const dias = Array.from({ length: 30 }, (_, i) => { const d = new Date(2026, 9, 7 + i); return `${d.getDate()}/${d.getMonth() + 1}`; });
  const serie = (base, amp) => dias.map((_, i) => Math.max(0, Math.round(base + amp * Math.sin(i / 4) + rnd() * amp + (i > 22 ? amp * 1.4 : 0))));

  const nomes = ["Ana Beatriz Moura", "Caio Rodrigues", "Joana Pires", "Raí Sampaio", "Luana Teixeira", "Mateus Araújo", "Iara Nogueira", "Davi Fontenele", "Bia Castelo", "Pedro Viana", "Samara Lopes", "Tiago Brito", "Nina Carvalho", "Ícaro Mendes", "Lara Furtado", "Heitor Sales", "Clara Rocha", "Otávio Lima"];
  const cidades = ["Parnaíba", "Teresina", "Luís Correia", "Piripiri", "Parnaíba", "Camocim", "Parnaíba", "São Luís", "Teresina", "Parnaíba", "Ilha Grande", "Fortaleza"];
  const tipos = ["participante", "participante", "palestrante", "participante", "patrocinador", "participante", "palestrante", "participante", "participante", "patrocinador", "participante", "palestrante", "participante", "participante", "patrocinador", "participante", "palestrante", "participante"];
  const mask = (n) => { const [a, b] = n.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(" "); return `${a[0]}${"•".repeat(4)}${b ? b[0] : ""}@exemplo.com`; };
  const inscritos = nomes.map((nome, i) => {
    const tipo = tipos[i];
    const base = { id: 1040 + i, nome, email: mask(nome), tel: `(86) 9 ••••-${String(1000 + i * 137).slice(-4)}`, cidade: cidades[i % cidades.length], tipo, data: `2026-${i < 6 ? "11" : "10"}-${String(28 - i).padStart(2, "0").replace(/^-|^0$/, "1")}`, reinscricao: i % 4 === 1 };
    if (tipo === "participante") Object.assign(base, { perfil: ["Estudante", "Profissional de TI", "Em transição de carreira", "Curiosa(o)"][i % 4], experiencia: ["Nenhuma", "Menos de 1 ano", "1 a 3 anos"][i % 3], interesse: ["Back-end", "Dados", "Front-end", "Carreira"][i % 4] });
    if (tipo === "palestrante") Object.assign(base, { tema: ["Primeiro deploy sem medo", "PHP moderno no interior", "Dados abertos do Piauí", "Acessibilidade na prática"][i % 4], palco: ["Nunca palestrou", "Já palestrou em meetup", "Palestrante frequente"][i % 3], formato: "Palestra 30 min" });
    if (tipo === "patrocinador") Object.assign(base, { empresa: ["Oeste Digital", "Litoral Dev", "Rede Delta Telecom"][i % 3], cota: ["Mandacaru", "Sol", "Caatinga"][i % 3], cargo: "Marketing" });
    return base;
  });

  const metricas = {
    dias,
    series: { participante: serie(9, 4), palestrante: serie(2, 1.4), patrocinador: serie(0.6, 0.8) },
    cidades: [["Parnaíba", 412], ["Teresina", 188], ["Luís Correia", 74], ["Piripiri", 51], ["Camocim", 39], ["Fortaleza", 33], ["Outras", 62]],
    perfil: [["Estudante", 361], ["Profissional de TI", 214], ["Em transição de carreira", 158], ["Curiosa(o)", 126]],
    palco: [["Nunca palestrou", 21], ["Já palestrou em meetup", 17], ["Palestrante frequente", 9]],
    cota: [["Sol", 3], ["Mandacaru", 7], ["Caatinga", 9], ["Apoio", 5]],
    emails: serie(40, 22),
  };

  const assuntos = [["Confirmação de lista de espera", "confirmacao"], ["Você está na lista do Sertão Tech 2027", "boas-vindas"], ["Recebemos sua proposta de palestra", "cfp"], ["Kit de patrocínio 2027", "kit"], ["Lembrete: complete seu cadastro", "lembrete"]];
  const status = ["entregue", "entregue", "entregue", "enviado", "entregue", "falhou", "entregue", "fila"];
  const emails = Array.from({ length: 14 }, (_, i) => ({ id: "em" + i, para: inscritos[i % inscritos.length].email, assunto: assuntos[i % 5][0], template: assuntos[i % 5][1], status: status[i % status.length], quando: `2026-11-0${5 - Math.floor(i / 4)} ${String(18 - i).padStart(2, "0")}:${String((i * 17) % 60).padStart(2, "0")}`, erro: status[i % status.length] === "falhou" ? "550 caixa inexistente" : null }));

  const acessos = [
    { quem: "Marina (admin)", acao: "Consultou dados", titular: "c••••r@exemplo.com", quando: "05/11/2026 14:12", motivo: "Pedido do titular por e-mail" },
    { quem: "Marina (admin)", acao: "Exportou JSON", titular: "c••••r@exemplo.com", quando: "05/11/2026 14:13", motivo: "Pedido do titular por e-mail" },
    { quem: "Rafa (curadoria)", acao: "Abriu detalhe", titular: "j••••p@exemplo.com", quando: "04/11/2026 09:40", motivo: "Leitura de proposta" },
    { quem: "Marina (admin)", acao: "Anonimizou", titular: "#1021", quando: "28/10/2026 17:02", motivo: "Solicitação de exclusão" },
  ];

  const materiais = [
    { id: "m1", edicao: "2027", titulo: "Kit de patrocínio 2027", desc: "Deck com cotas, contrapartidas e números da edição anterior.", tipo: "deck", pdf: false, url: "/materiais/2027/kit-patrocinio" },
    { id: "m2", edicao: "2027", titulo: "Kit de patrocínio 2027 · PDF", desc: "Mesmo kit em modo impressão, para anexar em e-mail.", tipo: "deck", pdf: true, url: "/materiais/2027/kit-patrocinio?print-pdf" },
    { id: "m3", edicao: "2027", titulo: "Caravanas 2027", desc: "Kit para instituições de ensino organizarem caravanas.", tipo: "deck", pdf: false, url: "/materiais/2027/caravanas" },
    { id: "m4", edicao: "2027", titulo: "Caravanas 2027 · PDF", desc: "Versão para imprimir e levar às escolas.", tipo: "deck", pdf: true, url: "/materiais/2027/caravanas?print-pdf" },
    { id: "m5", edicao: "2026", titulo: "Relatório para patrocinadores", desc: "Resultados da edição 2026: público, alcance e entregas.", tipo: "relatorio", pdf: true, url: "/materiais/2026/relatorio" },
    { id: "m6", edicao: "2026", titulo: "Sertão Tech After 2026", desc: "Deck do encontro pós-evento.", tipo: "deck", pdf: false, url: "/materiais/2026/after" },
    { id: "m7", edicao: "2026", titulo: "Kit de patrocínio 2026", desc: "Kit da edição passada — referência histórica.", tipo: "deck", pdf: true, url: "/materiais/2026/kit-patrocinio" },
    { id: "m8", edicao: "operacao", titulo: "Roteiro do cerimonial", desc: "Ordem de falas, tempos e deixas do palco.", tipo: "impresso", pdf: true, url: "/materiais/operacao/cerimonial" },
    { id: "m9", edicao: "operacao", titulo: "Guia da mesa redonda", desc: "Perguntas, tempos e papel da mediação.", tipo: "impresso", pdf: true, url: "/materiais/operacao/mesa-redonda" },
    { id: "m10", edicao: "operacao", titulo: "Listas de presença", desc: "Folhas por sala, geradas da lista de inscritos.", tipo: "impresso", pdf: true, url: "/materiais/operacao/presenca" },
    { id: "m11", edicao: "operacao", titulo: "Página de links", desc: "Links do evento para bio e QR code.", tipo: "links", pdf: false, url: "/materiais/operacao/links" },
  ];

  const cotas = [{ id: "Sol", valor: 20000 }, { id: "Mandacaru", valor: 12000 }, { id: "Caatinga", valor: 6000 }, { id: "Apoio", valor: 2500 }];
  const receitas = [
    { id: "r1", patrocinador: "Carnaúba Labs", cota: "Sol", valor: 20000, status: "pago", prevista: "2026-09-30", recebida: "2026-10-02", anexo: "contrato-carnauba.pdf" },
    { id: "r2", patrocinador: "Rede Delta Telecom", cota: "Mandacaru", valor: 12000, status: "assinado", prevista: "2026-12-15", recebida: null, anexo: "contrato-delta.pdf" },
    { id: "r3", patrocinador: "Litoral Dev", cota: "Mandacaru", valor: 12000, status: "fechado", prevista: "2027-01-20", recebida: null, anexo: null },
    { id: "r4", patrocinador: "Mangue Dados", cota: "Caatinga", valor: 6000, status: "negociacao", prevista: "2027-02-10", recebida: null, anexo: null },
    { id: "r5", patrocinador: "Coop. Sertaneja de Crédito", cota: "Sol", valor: 20000, status: "proposta", prevista: "2027-03-01", recebida: null, anexo: null },
    { id: "r6", patrocinador: "Pedra do Sal Café", cota: "Apoio", valor: 2500, status: "pago", prevista: "2026-10-15", recebida: "2026-10-20", anexo: "nf-pedradosal.pdf" },
    { id: "r7", patrocinador: "Igarassu Software", cota: "Caatinga", valor: 6000, status: "prospeccao", prevista: "2027-03-15", recebida: null, anexo: null },
    { id: "r8", patrocinador: "Farol Contabilidade", cota: "Apoio", valor: 2500, status: "negociacao", prevista: "2027-02-01", recebida: null, anexo: null },
    { id: "r9", patrocinador: "Vale do Longá Energia", cota: "Mandacaru", valor: 12000, status: "prospeccao", prevista: "2027-04-01", recebida: null, anexo: null },
  ];
  const categorias = ["Espaço", "Alimentação", "Estrutura/palco", "Audiovisual", "Material gráfico", "Brindes", "Viagem e hospedagem", "Marketing", "Taxas"];
  const despesas = [
    { id: "d1", categoria: "Espaço", desc: "Locação do centro de convenções (2 dias)", fornecedor: "Centro de Convenções Delta", orcado: 14000, realizado: 14000, status: "comprometido", venc: "2027-03-10", resp: "Marina", anexo: "contrato-espaco.pdf" },
    { id: "d2", categoria: "Alimentação", desc: "Coffee break · 2 dias · 600 pessoas", fornecedor: "Sabor do Delta Buffet", orcado: 9500, realizado: 0, status: "planejado", venc: "2027-04-20", resp: "Rafa", anexo: null },
    { id: "d3", categoria: "Estrutura/palco", desc: "Palco, tablado e backdrop", fornecedor: "Montagens Parnaíba", orcado: 7000, realizado: 6200, status: "comprometido", venc: "2027-04-01", resp: "Marina", anexo: "orcamento-palco.pdf" },
    { id: "d4", categoria: "Audiovisual", desc: "Som, telão e transmissão", fornecedor: "Áudio Litoral", orcado: 9000, realizado: 10800, status: "comprometido", venc: "2027-04-05", resp: "Caio", anexo: "orcamento-av.pdf" },
    { id: "d5", categoria: "Material gráfico", desc: "Crachás, banners e sinalização", fornecedor: "Gráfica Carnaúba", orcado: 3200, realizado: 1450, status: "pago", venc: "2026-11-01", resp: "Bia", anexo: "nf-grafica.pdf" },
    { id: "d6", categoria: "Brindes", desc: "Camisetas e ecobags", fornecedor: "Estamparia Sertão", orcado: 5400, realizado: 0, status: "planejado", venc: "2027-03-30", resp: "Bia", anexo: null },
    { id: "d7", categoria: "Viagem e hospedagem", desc: "Passagens e hotel de 6 palestrantes", fornecedor: "Várias", orcado: 8800, realizado: 3100, status: "comprometido", venc: "2027-04-10", resp: "Rafa", anexo: null },
    { id: "d8", categoria: "Marketing", desc: "Impulsionamento e vídeo de chamada", fornecedor: "Agência Mandacaru", orcado: 4000, realizado: 1200, status: "pago", venc: "2026-10-25", resp: "Caio", anexo: "nf-mkt.pdf" },
    { id: "d9", categoria: "Taxas", desc: "Taxas bancárias e plataforma de pagamento", fornecedor: "—", orcado: 900, realizado: 210, status: "vencido", venc: "2026-10-30", resp: "Marina", anexo: null },
  ];
  const meses = ["set", "out", "nov", "dez", "jan", "fev", "mar", "abr", "mai"];
  const evolucao = {
    meses,
    hoje: 2,
    receita: [0, 22500, 22500, null, null, null, null, null, null],
    despesa: [0, 1200, 2650, null, null, null, null, null, null],
    receitaPrev: [null, null, 22500, 34500, 46500, 55000, 67500, 73500, 73500],
    despesaPrev: [null, null, 2650, 4500, 9000, 18500, 41000, 62800, 63500],
  };
  const anterior = { id: "2026", receitaRecebida: 58500, despesaPaga: 54900, orcado: 57000, mesmoPonto: { receita: 14000, despesa: 3800 }, porCategoria: { "Espaço": 12000, "Alimentação": 8800, "Estrutura/palco": 6200, "Audiovisual": 8100, "Material gráfico": 2900, "Brindes": 4800, "Viagem e hospedagem": 7400, "Marketing": 3500, "Taxas": 1200 } };

  const edicoes = [{ id: "2027", status: "Em planejamento · atual", atual: true }, { id: "2026", status: "Encerrada · set 2026", atual: false }];
  const usuarios = { admin: "Marina Alves", comercial: "Caio Ribeiro", curadoria: "Rafa Monteiro", financeiro: "Bia Lacerda" };

  window.PN_DATA = { inscritos, metricas, emails, acessos, materiais, cotas, receitas, categorias, despesas, evolucao, anterior, edicoes, usuarios };
})();
