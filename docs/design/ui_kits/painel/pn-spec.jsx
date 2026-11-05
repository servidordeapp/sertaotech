/* Painel interno — documento de especificação (fundamentos, componentes, tokens, decisões). */
function SpSec({ n, id, title, lead, children }) {
  return (
    <section id={id} data-screen-label={n} style={{ display: "flex", flexDirection: "column", gap: 24, padding: "56px 0", borderTop: "2px solid var(--border-ink)" }}>
      <header style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 760 }}>
        <span style={{ ...pnT.eyebrow, color: "var(--terra-700)" }}>// {n}</span>
        <h2 style={{ ...pnT.h1, fontSize: 38 }}>{title}</h2>
        {lead ? <p style={{ ...pnT.body, fontSize: 16, margin: 0, color: "var(--espresso-700)", textWrap: "pretty" }}>{lead}</p> : null}
      </header>
      {children}
    </section>
  );
}
function SpSub({ title, note, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}><h3 style={{ ...pnT.h2, fontSize: 20 }}>{title}</h3>{note ? <span style={pnT.muted}>{note}</span> : null}</div>
      {children}
    </div>
  );
}
function SpBox({ children, pad = 24, bg = "var(--sand-200)", style }) { return <div style={{ background: bg, borderRadius: 20, padding: pad, minWidth: 0, ...style }}>{children}</div>; }
function SpTable({ head, rows, widths }) {
  return (
    <div style={{ overflowX: "auto", background: "var(--surface-card)", border: "1px solid var(--border-subtle)", borderRadius: 16 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-body)", minWidth: 640 }}>
        <thead><tr>{head.map((h, i) => <th key={i} style={{ ...pnT.eyebrow, textAlign: "left", padding: "12px 14px", background: "var(--sand-100)", borderBottom: "1px solid var(--border-subtle)", width: widths ? widths[i] : undefined }}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} style={{ padding: "11px 14px", borderBottom: i < rows.length - 1 ? "1px solid var(--border-subtle)" : 0, verticalAlign: "top", lineHeight: 1.45 }}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
const spCode = { fontFamily: "var(--font-mono)", fontSize: 12, background: "var(--sand-100)", padding: "1px 6px", borderRadius: 4, color: "var(--espresso-800)", overflowWrap: "anywhere" };
const C = ({ children }) => <code style={spCode}>{children}</code>;
const Yes = () => <span style={{ color: "var(--cactus-600)", fontWeight: 700 }}>✓ total</span>;
const No = () => <span style={{ color: "var(--espresso-600)" }}>— some do menu</span>;

function SpCallout({ n, title, children }) {
  return <div style={{ display: "flex", gap: 12 }}><span style={{ width: 26, height: 26, flex: "none", borderRadius: 99, background: "var(--espresso-800)", color: "var(--sand-50)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700 }}>{n}</span><div><b style={{ ...pnT.body, fontWeight: 700 }}>{title}</b><div style={{ ...pnT.muted, fontSize: 13.5 }}>{children}</div></div></div>;
}

function SpScaled({ w = 1280, h = 550, children }) {
  const ref = React.useRef(null);
  const bw = usePnWidth(ref, 500);
  const k = bw / w;
  return <div ref={ref} style={{ width: "100%", height: h * k, overflow: "hidden", position: "relative" }}><div style={{ width: w, height: h, overflow: "hidden", pointerEvents: "none", transform: `scale(${k})`, transformOrigin: "0 0", position: "absolute", top: 0, left: 0 }}>{children}</div></div>;
}
function SpGrid({ cols, gutter, margin, w, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ width: "100%", maxWidth: w, height: 120, background: "var(--surface-page)", border: "1px solid var(--border-default)", borderRadius: 10, display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: gutter / 3, padding: `0 ${margin / 3}px`, boxSizing: "border-box" }}>{Array.from({ length: cols }).map((_, i) => <span key={i} style={{ background: "rgba(188,94,26,.14)", borderInline: "1px solid rgba(188,94,26,.3)" }}></span>)}</div>
      <span style={pnT.muted}><b style={{ color: "var(--text-strong)" }}>{label}</b> · {cols} colunas · gutter {gutter}px · margem {margin}px</span>
    </div>
  );
}

function PnSpec() {
  const DS = pnDS();
  const D = window.PN_DATA;
  const [confirm, setConfirm] = React.useState(false);
  const [money, setMoney] = React.useState(12000);
  const [ed, setEd] = React.useState("2027");
  const [toasts, setToasts] = React.useState([]);
  const toast = (t) => { const id = Math.random(); setToasts((ts) => [...ts, { ...t, id }]); setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 3000); };
  const ctx = { m: false, role: "admin", st: "ok", ed: "2027", toast };
  const toc = [["fundamentos", "01 Fundamentos"], ["navegacao", "02 Navegação e papéis"], ["componentes", "03 Componentes"], ["estados", "04 Estados"], ["telas", "05 Telas"], ["tokens", "06 Tokens"], ["decisoes", "07 Decisões abertas"]];
  return (
    <PnCtx.Provider value={ctx}>
      <div style={{ background: "var(--surface-page)", minHeight: "100vh" }}>
        <header style={{ background: "var(--surface-ink)", color: "var(--sand-50)", padding: "48px 48px 40px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
            <PnLogo size={44} sub="Painel interno · especificação v1" />
            <h1 style={{ ...pnT.h1, fontSize: 48, color: "var(--sand-50)", maxWidth: 820 }}>Painel interno sob o design system</h1>
            <p style={{ ...pnT.body, fontSize: 17, color: "var(--text-on-ink-muted)", margin: 0, maxWidth: 760 }}>Shell, componentes derivados, estados, mapa de tokens e as duas telas novas — Apresentações e Orçamento. Vue 3 + PrimeVue 4 (Aura) + Chart.js, tema claro, pt-BR. O protótipo navegável está em <a href="index.html" style={{ color: "var(--amber-300)" }}>index.html</a>.</p>
            <nav style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{toc.map(([id, l]) => <a key={id} href={"#" + id} style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--sand-50)", textDecoration: "none", padding: "6px 12px", borderRadius: 99, border: "1px solid var(--border-on-ink)" }}>{l}</a>)}</nav>
          </div>
        </header>
        <main style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px 80px" }}>

          <SpSec n="01" id="fundamentos" title="Fundamentos" lead="O painel herda a marca inteira, mas fala mais baixo: o cartão creme, a tinta espresso e a pílula continuam; o sticker-shadow fica reservado a três momentos — login, edição atual em destaque e alerta de saldo negativo.">
            <SpSub title="Anatomia do shell · desktop">
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.7fr) minmax(0,1fr)", gap: 24, alignItems: "start" }}>
                <SpBox pad={0} style={{ overflow: "hidden", border: "1px solid var(--border-default)" }}><SpScaled><PnShell screen="inscricoes" go={() => {}} role="admin" edition="2027" setEdition={() => {}}><div style={{ padding: "28px 40px", display: "flex", flexDirection: "column", gap: 10 }}><PSkel w="20%" h={10} /><PSkel w="34%" h={26} /><PSkel w="60%" h={12} /><PSkel w="100%" h={80} r={16} /></div></PnShell></SpScaled></SpBox>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <SpCallout n="1" title="Barra de identidade · 64px · surface-ink">Logo + wordmark (League Spartan) + <C>// PAINEL</C>. Fixa no topo.</SpCallout>
                  <SpCallout n="2" title="Seletor de edição global">Vale para o painel inteiro e vai na URL (<C>?edicao=2027</C>). Telas sem recorte de edição (E-mails, LGPD) mostram “Todas as edições”.</SpCallout>
                  <SpCallout n="3" title="Papel + conta">Tag de papel sempre visível; menu da conta tem e-mail e Sair.</SpCallout>
                  <SpCallout n="4" title="Navegação agrupada · 52px · surface-card">Grupos Pessoas · Evento · Finanças, com rótulo mono. Item ativo: sublinhado de 3px <C>--brand-primary</C>.</SpCallout>
                </div>
              </div>
            </SpSub>
            <SpSub title="Grid" note="Conteúdo com largura máxima de 1280px; o shell estica até 1360px.">
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, alignItems: "end" }}>
                <SpGrid cols={12} gutter={16} margin={40} label="Desktop ≥ 1024" />
                <SpGrid cols={4} gutter={12} margin={16} w={200} label="Celular < 768" />
              </div>
              <p style={{ ...pnT.muted, margin: 0 }}>Cartões de KPI e painéis de gráfico usam <C>repeat(auto-fit, minmax(200px, 1fr))</C>: quando um papel perde um cartão, os demais ocupam o espaço — nunca sobra buraco. Espaçamento vertical entre blocos: 24px desktop, 16px celular.</p>
            </SpSub>
            <SpSub title="Tipografia aplicada">
              <SpTable head={["Papel", "Amostra", "Token / regra"]} widths={["18%", "47%", "35%"]} rows={[
                ["Título de página", <span style={{ ...pnT.h1 }}>Inscrições</span>, <span><C>--font-display</C> 30/600 · −1.5% · celular 24</span>],
                ["Título de painel", <span style={{ ...pnT.h2, fontSize: 16 }}>Inscrições por dia</span>, <span>display 16–18/600</span>],
                ["Eyebrow", <span style={pnT.eyebrow}>// Pessoas · lista de espera 2027</span>, <span><C>--font-mono</C> 11 · caixa alta · +12% · espresso-600</span>],
                ["Número de KPI", <span style={{ ...pnT.num, fontSize: 30 }}>R$ 46.500</span>, <span>display 30/700 · <C>tabular-nums</C></span>],
                ["Corpo / célula", <span style={pnT.body}>Ana Beatriz Moura · Parnaíba</span>, <span><C>--font-body</C> 14/1.5</span>],
                ["Cabeçalho de tabela", <span style={{ ...pnT.eyebrow }}>Inscrição ↓</span>, <span>mono 11 caixa alta sobre sand-100</span>],
                ["Dado técnico", <span style={pnT.mono}>a••••b@exemplo.com · msg_em0a91f</span>, <span>mono 12–12.5 · e-mail mascarado, IDs</span>],
                ["Apoio", <span style={pnT.muted}>Mostrando 18 de 18</span>, <span>body 13 · <b>espresso-600</b> (não 500 — ver tokens)</span>],
              ]} />
            </SpSub>
          </SpSec>

          <SpSec n="02" id="navegacao" title="Navegação e papéis" lead="O que o papel não vê, some do menu — não fica cinza. Se alguém chega pela URL, cai no estado 403 dentro do shell, com o papel dele visível.">
            <SpTable head={["Tela", "admin", "financeiro", "comercial", "curadoria"]} widths={["20%", "20%", "20%", "20%", "20%"]} rows={[
              ["Inscrições", <Yes />, <No />, <span>só patrocinador · filtro travado</span>, <span>só palestrante · filtro travado</span>],
              ["Métricas", <Yes />, <No />, <span>cartões e série de patrocinador</span>, <span>cartões e série de palestrante</span>],
              ["E-mails", <Yes />, <No />, <No />, <No />],
              ["LGPD", <Yes />, <No />, <No />, <No />],
              ["Apresentações", <Yes />, <span>leitura + copiar link</span>, <span>leitura + copiar link</span>, <span>leitura + copiar link</span>],
              ["Orçamento", <Yes />, <Yes />, <span>só Receitas (funil) — sem despesa, saldo ou margem</span>, <No />],
            ]} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 16 }}>
              <SpBox bg="var(--surface-card)" style={{ border: "1px solid var(--border-subtle)" }}><h4 style={{ ...pnT.h2, fontSize: 15, marginBottom: 6 }}>Como a navegação cresce</h4><p style={{ ...pnT.muted, fontSize: 13.5, margin: 0 }}>Itens entram em um dos 3 grupos de domínio. Até ~8 itens cabe tudo na faixa; acima de 1180px aparecem os rótulos dos grupos. Passando de 3 itens num grupo, o grupo vira menu suspenso (PrimeVue <C>Menubar</C> com submenu) — a faixa nunca vira uma fileira infinita.</p></SpBox>
              <SpBox bg="var(--surface-card)" style={{ border: "1px solid var(--border-subtle)" }}><h4 style={{ ...pnT.h2, fontSize: 15, marginBottom: 6 }}>Celular</h4><p style={{ ...pnT.muted, fontSize: 13.5, margin: 0 }}>Barra inferior com até 4 destinos priorizados por papel + “Mais”, que abre uma folha com todos os grupos. Alvos de toque ≥ 48px. A barra superior fica com logo, edição e conta.</p></SpBox>
              <SpBox bg="var(--surface-card)" style={{ border: "1px solid var(--border-subtle)" }}><h4 style={{ ...pnT.h2, fontSize: 15, marginBottom: 6 }}>Recorte dentro da tela</h4><p style={{ ...pnT.muted, fontSize: 13.5, margin: 0 }}>Quando o papel vê só parte dos dados, o filtro vira a tag <b>Somente patrocinadores</b> com cadeado, e o texto da página diz o recorte. Cartões e gráficos não permitidos não são renderizados; o grid reflui.</p></SpBox>
            </div>
          </SpSec>

          <SpSec n="03" id="componentes" title="Componentes derivados" lead="Cada um se apoia em um componente do PrimeVue — nada de dependência nova. Entre parênteses, a base de implementação.">
            <SpSub title="Cartão de KPI" note="(Card)">
              <SpBox><div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 16 }}>
                <PKpi label="Total na lista" icon="users" value="930" delta="+18%" sub="vs. 30 dias antes" />
                <PKpi label="Reinscrições" icon="refresh" value="214" sub="23% do total" />
                <PKpi label="Saldo projetado" tone="neg" value="−R$ 15.300" sub="negativo: borda + sombra brick, ícone e sinal" />
                <PKpi label="Em caixa" accent value="R$ 19.850" delta="+R$ 8,5 mil" sub="variante ink, uso raro" />
              </div></SpBox>
            </SpSub>
            <SpSub title="Tags de status" note="(Tag) — cor nunca é o único sinal: funil leva o indicador de etapa n/6; vencido leva ícone.">
              <SpBox><div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[["Funil de patrocínio", "funil", PN_FUNIL_ORDEM], ["Status de despesa", "despesa", ["planejado", "comprometido", "pago", "vencido"]], ["Papel de usuário", "papel", ["admin", "financeiro", "comercial", "curadoria"]], ["Tipo de inscrição", "tipo", ["participante", "palestrante", "patrocinador"]], ["Envio de e-mail", "email", ["entregue", "enviado", "falhou", "fila"]]].map(([l, k, vs]) => (
                  <div key={k} style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 12, alignItems: "center" }}><span style={pnT.eyebrow}>{l}</span><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{vs.map((v) => <PTag key={v} k={k} v={v} />)}</div></div>
                ))}
              </div></SpBox>
            </SpSub>
            <SpSub title="Tabela padrão" note="(DataTable · rowExpansion · globalFilter · exportCSV) — define o padrão de todas as listas.">
              <SpBox><PPanel pad={false}><PTable cols={[
                { key: "n", label: "Nome", render: (r) => <b style={{ fontWeight: 600 }}>{r.nome}</b> },
                { key: "e", label: "E-mail", render: (r) => <span style={pnT.mono}>{r.email}</span> },
                { key: "c", label: "Cidade", render: (r) => r.cidade },
                { key: "t", label: "Tipo", render: (r) => <PTag k="tipo" v={r.tipo} size="sm" /> },
                { key: "d", label: "Inscrição", sort: true, render: (r) => pnFmt.dt(r.data) },
              ]} rows={D.inscritos.slice(0, 4)} expand={(r) => <div style={{ paddingTop: 12 }}><PDefList items={[["Telefone", r.tel], ["Inscrição", "#" + r.id], ["Cidade", r.cidade]]} /></div>} footer={<PTableFoot shown={4} total={18} />} /></PPanel></SpBox>
              <ul style={{ ...pnT.muted, fontSize: 13.5, margin: 0, paddingLeft: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 32px" }}>
                <li>Linha 52px; cabeçalho 40px mono sobre sand-100; hairline <C>--border-subtle</C>.</li>
                <li>Hover <C>--surface-hover</C>; linha aberta e detalhe em sand-100.</li>
                <li>Números alinhados à direita, <C>tabular-nums</C>.</li>
                <li>Contato mascarado na lista; revelar no detalhe gera registro LGPD.</li>
                <li>Celular: cada linha vira cartão (título, tag, metadados) e expande no lugar.</li>
                <li>Busca + filtro segmentado acima; contagem e paginação no rodapé.</li>
              </ul>
            </SpSub>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 24 }}>
              <SpSub title="Barra de execução" note="(ProgressBar, em camadas)">
                <SpBox><div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                  <PExec orcado={61800} comprometido={36960} pago={2650} showLegend />
                  <PExec compact label="Estrutura/palco · atenção ≥ 85%" orcado={7000} comprometido={6200} pago={0} />
                  <PExec compact label="Audiovisual · estourado" orcado={9000} comprometido={10800} pago={0} />
                </div></SpBox>
              </SpSub>
              <SpSub title="Campo monetário" note="(InputNumber mode=currency locale=pt-BR)">
                <SpBox><div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <PMoney label="Valor" required value={money} onChange={setMoney} hint="Cota no kit: R$ 12.000" />
                  <PMoney label="Valor realizado" value={10800} hint="" error="Acima do orçado em R$ 1.800" />
                  <p style={{ ...pnT.muted, margin: 0 }}>Prefixo R$ fixo em mono; valor à direita, display 600 tabular. Durante a digitação aceita vírgula; ao sair formata <C>12.000,00</C>.</p>
                </div></SpBox>
              </SpSub>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 24 }}>
              <SpSub title="Seletor de edição" note="(Select com template)">
                <SpBox style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", minHeight: 120 }}>
                  <div style={{ background: "var(--surface-ink)", padding: 14, borderRadius: 14 }}><PEdition value={ed} onChange={setEd} editions={D.edicoes} onInk /></div>
                  <PEdition value={ed} onChange={setEd} editions={D.edicoes} />
                  <p style={{ ...pnT.muted, margin: 0, flexBasis: "100%" }}>Ponto âmbar = edição atual. Edição encerrada abre em somente leitura.</p>
                </SpBox>
              </SpSub>
              <SpSub title="Confirmação destrutiva" note="(Dialog modal, sem fechar no fundo)">
                <SpBox style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start", minHeight: 120 }}>
                  <p style={{ ...pnT.muted, margin: 0 }}>Lista as consequências, exige digitar a palavra da ação e só então habilita o botão danger. Cancelar fica à esquerda, como ação segura.</p>
                  <DS.Button variant="danger" size="sm" iconLeft={<PIcon n="trash" s={14} />} onClick={() => setConfirm(true)}>Abrir exemplo</DS.Button>
                </SpBox>
              </SpSub>
            </div>
            <SpSub title="Cartão de material" note="(Card) — layout cartão e linha">
              <SpBox><div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12 }}>{D.materiais.filter((x) => ["m1", "m5", "m8"].includes(x.id)).map((x) => <PMaterial key={x.id} mat={x} onCopy={() => toast({ variant: "success", title: "Link copiado", description: x.titulo })} />)}</div></SpBox>
            </SpSub>
            <PConfirm open={confirm} onClose={() => setConfirm(false)} onConfirm={() => setConfirm(false)} title="Anonimizar titular?" subject="Inscrição #1041" consequences={["Nome, e-mail e telefone viram marcadores.", "Métricas agregadas continuam contando.", "A ação fica no histórico de acesso."]} />
          </SpSec>

          <SpSec n="04" id="estados" title="Estados" lead="Toda tela que busca dados tem os quatro. O texto explica o que houve e o que fazer — sem jargão, sem culpar a pessoa.">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 16 }}>
              {[["Carregando", <PState kind="loading" shape="table" />, "Esqueleto com a forma do conteúdo final (Skeleton). Sem spinner de tela cheia."], ["Vazio", <PState kind="empty" title="Nenhuma inscrição em 2027 ainda" text="A lista abre quando o formulário da edição for publicado." />, "Diz por que está vazio e, se houver, o próximo passo."], ["Erro de API", <PState kind="error" code="GET /api/inscricoes · 502" />, "Tranquiliza sobre os dados, mostra o código para suporte e oferece tentar de novo."], ["Sem permissão (403)", <PState kind="forbidden" />, "Dentro do shell, com o papel atual visível. Borda ink: é uma parede, não um erro."]].map(([t, el, d]) => (
                <div key={t} style={{ display: "flex", flexDirection: "column", gap: 8 }}><div style={{ ...pnT.eyebrow }}>{t}</div><SpBox pad={16}>{el}</SpBox><p style={{ ...pnT.muted, margin: 0 }}>{d}</p></div>
              ))}
            </div>
            <p style={{ ...pnT.muted, margin: 0 }}>No protótipo, a barra “Estado” aplica cada um à tela aberta. O Orçamento tem um vazio próprio — o ponto de partida do planejamento (copiar de 2026 · lote · do zero).</p>
          </SpSec>

          <SpSec n="05" id="telas" title="Telas" lead="Desktop e celular, todos os papéis e estados estão no protótipo. Abaixo, o que cada tela decide.">
            <SpTable head={["Tela", "Decisões de design"]} widths={["18%", "82%"]} rows={[
              ["/login", "Único lugar com o cartão-sticker (ink + sombra dura). Erro de credencial em faixa brick acima dos campos, sem revelar qual campo errou. Envio: campos e botão desabilitados, “Entrando…”."],
              ["/inscricoes", "Padrão de tabela do painel. Contato mascarado; revelar no detalhe registra acesso. Patrocinador com cota pretendida tem atalho “Virar receita prevista”. CSV exporta o filtro atual."],
              ["/metricas", "KPIs em auto-fit; linha 30 dias com cor por entidade; barras horizontais (rótulos longos) em série única terracota; volume de e-mail em colunas. Recorte por papel remove cartões e séries."],
              ["/emails", "Metadados apenas (sem corpo). Filtro “Falhas” com contagem; reenviar no detalhe."],
              ["/lgpd", "Busca exata + motivo obrigatório. Exportar JSON (portabilidade) e anonimizar com confirmação digitada. Histórico de acesso em aba própria, também em tabela padrão."],
              ["/apresentacoes", "Agrupado por edição; edição atual no cartão-sticker com selo âmbar. Busca, filtro por edição e tipo. “Copiar link” gera link assinado com validade — material não fica mais público."],
              ["/orcamento", "Abas Visão geral · Receitas · Despesas. Saldo negativo com sinal, ícone, borda e sombra brick. Alerta de categoria estourada no topo. Receitas em funil (kanban) e tabela; no celular, etapa por chips. Criar/editar em diálogo; lote e cópia de 2026 em tela própria."],
            ]} />
          </SpSec>

          <SpSec n="06" id="tokens" title="Tokens" lead="Nenhuma cor nova de marca. As adições são degraus escuros para texto AA sobre fundos soft, e aliases semânticos para funil, despesa e gráficos. Proposta em tokens-propostos.css — ainda fora de styles.css.">
            <SpSub title="Mapa de tokens por componente">
              <SpTable head={["Componente", "Superfície / borda", "Texto", "Acento / estado"]} rows={[
                ["Shell · barra", <C>--surface-ink</C>, <span><C>--sand-50</C> · <C>--text-on-ink-muted</C></span>, <span><C>--amber-300</C> (avatar, edição atual)</span>],
                ["Shell · navegação", <span><C>--surface-card</C> · <C>--border-subtle</C></span>, <span><C>--espresso-700</C> → <C>--text-strong</C></span>, <span><C>--brand-primary</C> sublinhado 3px</span>],
                ["Cartão de KPI", <span><C>--surface-card</C> · <C>--shadow-xs</C></span>, <span><C>--text-strong</C> · eyebrow <C>--espresso-600</C></span>, <span>neg: <C>--brick-500/600</C> · delta <C>--cactus-600</C></span>],
                ["Tabela", <span>cabeçalho <C>--sand-100</C> · <C>--surface-hover</C></span>, <span><C>--text-body</C> · mono <C>--espresso-700</C></span>, <span>foco <C>--focus-ring</C></span>],
                ["Tag de funil", <C>--funnel-n-bg</C>, <C>--funnel-n-fg</C>, "indicador n/6 em currentColor"],
                ["Tag de despesa", <C>--expense-*-bg</C>, <C>--expense-*-fg</C>, "vencido + ícone"],
                ["Barra de execução", <C>--exec-track</C>, <span>rótulo <C>--espresso-600</C> / <C>--honey-700</C> / <C>--brick-600</C></span>, <span><C>--exec-paid</C> · <C>--exec-committed</C> · <C>--exec-over</C></span>],
                ["Campo monetário", <span><C>--surface-card</C> · <C>--border-default</C> · <C>--radius-field</C></span>, <C>--text-strong</C>, <span><C>--shadow-focus</C> · erro <C>--brick-500</C></span>],
                ["Seletor de edição", <span><C>--border-ink</C> · <C>--shadow-badge-sm</C></span>, <C>--text-strong</C>, <span>ponto <C>--amber-400</C></span>],
                ["Confirmação destrutiva", <span>Dialog do DS · faixa <C>--brick-100</C></span>, <C>--brick-600</C>, <span>Button <C>danger</C></span>],
                ["Gráficos", <span>grade <C>--chart-grid</C></span>, <span>eixos e rótulos <C>--chart-axis</C></span>, <span><C>--chart-participante</C> <C>--chart-palestrante</C> <C>--chart-patrocinador</C> <C>--chart-receita</C> <C>--chart-despesa</C></span>],
              ]} />
            </SpSub>
            <SpSub title="Adições propostas" note="contraste WCAG 2.x medido">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12 }}>
                {[["--text-muted → espresso-600", "#6B4526", "#F5EAD0", "7.01", "hoje espresso-500 = 4.42 em sand-100: reprova AA"], ["--honey-700", "#7A5208", "#F7E8C4", "5.69", "texto sobre honey-100 (honey-600 dava 3.37)"], ["--amber-700", "#7A4A06", "#FBEBC8", "6.34", "texto sobre amber-100 (funil: Fechado)"], ["--blue-700 / -100", "#154F82", "#D9E6F2", "6.69", "tag Palestrante, mesma família da série"], ["--funnel-1 Prospecção", "#4E2E13", "#EEDCB2", "9.00", "sand-200 / espresso-700"], ["--funnel-2 Proposta", "#245F57", "#D2E7E2", "5.71", "agave-100 / agave-600"], ["--funnel-5 Assinado", "#8A4015", "#F4E0C6", "5.78", "terra-100 / terra-700"], ["--funnel-6 Pago", "#4C6329", "#E7EDD3", "5.59", "cactus-100 / cactus-600"], ["--expense-overdue", "#97301A", "#F6DCD1", "5.84", "brick-100 / brick-600"], ["--chart-receita", "#245F57", "#FBF6EA", "6.83", "agave-600 · traço"], ["--chart-despesa", "#B4670B", "#FBF6EA", "3.99", "amber-600 · só traço (≥ 3:1 gráfico)"], ["--chart-patrocinador", "#5E8C1A", "#FBF6EA", "3.71", "validada · rótulo sempre em --chart-axis"]].map(([n, fg, bg, r, d]) => (
                  <div key={n} style={{ background: "var(--surface-card)", border: "1px solid var(--border-subtle)", borderRadius: 14, overflow: "hidden" }}>
                    <div style={{ background: bg, color: fg, height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20 }}><span>Aa</span><span style={{ fontSize: 14, fontVariantNumeric: "tabular-nums" }}>{r}:1</span></div>
                    <div style={{ padding: "10px 12px" }}><div style={{ ...pnT.mono, fontSize: 11.5, fontWeight: 700 }}>{n}</div><div style={{ ...pnT.muted, fontSize: 12 }}>{d}</div></div>
                  </div>
                ))}
              </div>
              <p style={{ ...pnT.muted, margin: 0 }}>Para o tema Aura: mapear <C>primary</C> → terra (600 como base), <C>surface</C> → sand/espresso, e os <C>--p-*</C> de Tag/DataTable/ProgressBar para os aliases acima via <C>definePreset</C>. Nenhum cinza do Aura sobrevive.</p>
            </SpSub>
          </SpSec>

          <SpSec n="07" id="decisoes" title="Decisões abertas" lead="Com a recomendação de cada uma — basta confirmar ou trocar.">
            <SpTable head={["Decisão", "Recomendação", "Por quê"]} widths={["24%", "34%", "42%"]} rows={[
              ["Seletor de edição: global ou só no Orçamento?", <b>Global, na barra, persistido na URL.</b>, "Inscrições, Métricas, Apresentações e Orçamento são todas por edição. Um só controle evita telas em edições diferentes ao mesmo tempo. E-mails e LGPD ignoram e dizem isso."],
              ["Criar/editar receita e despesa: diálogo ou tela?", <b>Diálogo para item único; tela própria para lote e cópia.</b>, "Item único tem 8–10 campos e o contexto (funil, tabela) precisa continuar visível. Lote é planilha — pede largura."],
              ["Papel novo `financeiro`", <b>Criar. Admin continua vendo tudo.</b>, "Separa quem mexe em valor de quem administra pessoas. Financeiro não vê dado pessoal de inscrito."],
              ["Comercial vê valores?", <b>Sim, só de receita (valor de cota).</b>, "O valor da cota já é público no kit. Despesa, saldo e margem ficam fora."],
              ["Curadoria e Orçamento", <b>Some do menu.</b>, "Não há recorte útil de orçamento para curadoria; viagem de palestrante é tocada por financeiro."],
              ["Material sem login para patrocinador", <b>Link assinado com validade (7d / 30d / fim da edição), revogável.</b>, "Tira os materiais do público sem quebrar o envio. Cada abertura registrada."],
              ["Kanban do funil sem dependência", <b>CSS grid + menu “Mover para”; arrastar com HTML5 drag nativo depois.</b>, "PrimeVue não tem kanban; o menu já resolve no celular e é acessível por teclado."],
              ["Gráfico de evolução", <b>Acumulado mensal, real sólido + previsto tracejado, marca HOJE.</b>, "Mostra se receita está chegando antes da despesa — a pergunta real de caixa de evento."],
              ["Nomes de cota", <b>Usar os do kit 2027.</b>, "No protótipo: Sol, Mandacaru, Caatinga, Apoio — são marcadores de lugar."],
              ["--text-muted", <b>Trocar para espresso-600 no DS inteiro.</b>, "O valor atual reprova AA no fundo de página; o briefing já assumia 600."],
            ]} />
          </SpSec>
        </main>
        <DS.ToastViewport>{toasts.map((t) => <DS.Toast key={t.id} {...t} />)}</DS.ToastViewport>
      </div>
    </PnCtx.Provider>
  );
}
Object.assign(window, { PnSpec });
