/* Painel interno — tela nova: Orçamento (controle orçamentário por edição). */
function pnBudget(receitas, despesas) {
  const s = (a, f) => a.reduce((x, y) => x + f(y), 0);
  const contr = ["fechado", "assinado", "pago"];
  const r = { prevista: s(receitas, (x) => x.valor), contratada: s(receitas.filter((x) => contr.includes(x.status)), (x) => x.valor), recebida: s(receitas.filter((x) => x.status === "pago"), (x) => x.valor) };
  const comp = (d) => (d.status === "planejado" ? 0 : d.realizado);
  const d = { orcada: s(despesas, (x) => x.orcado), comprometida: s(despesas, comp), paga: s(despesas.filter((x) => x.status === "pago"), (x) => x.realizado) };
  const cats = window.PN_DATA.categorias.map((c) => { const it = despesas.filter((x) => x.categoria === c); return { c, orcado: s(it, (x) => x.orcado), comprometido: s(it, comp), pago: s(it.filter((x) => x.status === "pago"), (x) => x.realizado) }; });
  const saldoProj = r.contratada - d.orcada;
  return { r, d, cats, saldoProj, margem: r.contratada ? saldoProj / r.contratada : 0, caixa: r.recebida - d.paga, over: cats.filter((c) => c.comprometido > c.orcado) };
}

function PnTriple({ title, icon, rows, tone }) {
  const { m } = usePn();
  const max = rows[0][1] || 1;
  return (
    <div style={{ background: "var(--surface-card)", border: "1px solid var(--border-subtle)", borderRadius: 16, padding: m ? 16 : 20, display: "flex", flexDirection: "column", gap: 14, minWidth: 0, boxShadow: "var(--shadow-xs)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, ...pnT.eyebrow }}><PIcon n={icon} s={14} />{title}</div>
      {rows.map(([l, v, hint], i) => (
        <div key={l} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: "4px 12px", alignItems: "baseline" }}>
          <span style={{ ...pnT.body, fontSize: 13.5, color: i === rows.length - 1 ? "var(--text-strong)" : "var(--espresso-700)", fontWeight: i === rows.length - 1 ? 700 : 500 }}>{l}</span>
          <span style={{ ...pnT.num, fontSize: i === 0 ? (m ? 20 : 24) : (m ? 17 : 19) }}>{pnFmt.brl(v)}</span>
          <span style={{ gridColumn: "1 / -1", height: 6, borderRadius: 99, background: "var(--chart-grid)", overflow: "hidden" }}><span style={{ display: "block", height: "100%", width: (v / max) * 100 + "%", background: tone, opacity: 0.35 + i * 0.32, borderRadius: 99 }}></span></span>
          {hint ? <span style={{ gridColumn: "1 / -1", ...pnT.muted, fontSize: 12 }}>{hint}</span> : null}
        </div>
      ))}
    </div>
  );
}

function PnVisaoGeral({ receitas, despesas, goTab }) {
  const DS = pnDS();
  const { m, ed } = usePn();
  const D = window.PN_DATA, A = D.anterior, E = D.evolucao;
  const b = pnBudget(receitas, despesas);
  const neg = b.saldoProj < 0;
  const delta = (a, c) => { const p = (c - a) / a; return (p >= 0 ? "+" : "−") + Math.abs(Math.round(p * 100)) + "%"; };
  const cmp = [["Receita no mesmo ponto do ciclo", A.mesmoPonto.receita, b.r.recebida, true], ["Despesa paga no mesmo ponto", A.mesmoPonto.despesa, b.d.paga, false], ["Orçado total", A.orcado, b.d.orcada, false], ["Receita final", A.receitaRecebida, null], ["Despesa final", A.despesaPaga, null]];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: m ? 12 : 16 }}>
      {b.over.length ? (
        <div role="alert" style={{ display: "flex", gap: 12, alignItems: m ? "flex-start" : "center", padding: "12px 16px", borderRadius: 14, background: "var(--brick-100)", color: "var(--brick-600)", border: "1.5px solid var(--brick-500)", flexDirection: m ? "column" : "row" }}>
          <span style={{ display: "flex", gap: 10, alignItems: "center", flex: 1, fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.45 }}><PIcon n="alert" s={20} /><span><b>{b.over.map((c) => c.c).join(", ")} estourou o orçado</b> — comprometido {pnFmt.brl(b.over[0].comprometido)} de {pnFmt.brl(b.over[0].orcado)} ({pnFmt.pct(b.over[0].comprometido / b.over[0].orcado)}).</span></span>
          <DS.Button size="sm" variant="outline" onClick={() => goTab("despesas")}>Ver despesas</DS.Button>
        </div>
      ) : null}
      <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "repeat(3, minmax(0,1fr))", gap: m ? 12 : 16 }}>
        <PnTriple title="Receita" icon="up" tone="var(--chart-receita)" rows={[["Prevista", b.r.prevista, `${receitas.length} patrocinadores no funil`], ["Contratada", b.r.contratada], ["Recebida", b.r.recebida]]} />
        <PnTriple title="Despesa" icon="down" tone="var(--chart-despesa)" rows={[["Orçada", b.d.orcada, `${despesas.length} itens em ${b.cats.filter((c) => c.orcado).length} categorias`], ["Comprometida", b.d.comprometida], ["Paga", b.d.paga]]} />
        <PKpi label="Saldo projetado" tone={neg ? "neg" : undefined} value={(neg ? "−" : "") + pnFmt.brl(Math.abs(b.saldoProj))} sub="receita contratada − despesa orçada">
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6, paddingTop: 12, borderTop: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", ...pnT.body, fontSize: 13.5 }}><span>Margem</span><b style={{ color: neg ? "var(--brick-600)" : "var(--cactus-600)", fontVariantNumeric: "tabular-nums" }}>{neg ? "−" : ""}{Math.abs(Math.round(b.margem * 100))}%</b></div>
            <div style={{ display: "flex", justifyContent: "space-between", ...pnT.body, fontSize: 13.5 }}><span>Em caixa hoje</span><b style={{ fontVariantNumeric: "tabular-nums" }}>{pnFmt.brl(b.caixa)}</b></div>
            {neg ? <p style={{ ...pnT.muted, margin: 0, fontSize: 12.5, color: "var(--brick-600)" }}>Faltam {pnFmt.brl(-b.saldoProj)} em patrocínio contratado para fechar no zero.</p> : null}
          </div>
        </PKpi>
      </div>
      <PPanel title="Execução orçamentária" sub="Quanto do orçado já está comprometido">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <PExec orcado={b.d.orcada} comprometido={b.d.comprometida} pago={b.d.paga} showLegend />
          <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "repeat(3, minmax(0,1fr))", gap: m ? 14 : "16px 28px" }}>
            {b.cats.filter((c) => c.orcado).map((c) => <PExec key={c.c} compact label={c.c} orcado={c.orcado} comprometido={c.comprometido} pago={c.pago} />)}
          </div>
        </div>
      </PPanel>
      <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "minmax(0,1.6fr) minmax(0,1fr)", gap: m ? 12 : 16 }}>
        <PPanel title="Entradas × saídas" sub="Acumulado por mês · tracejado = previsto" actions={m ? null : <PLegend items={[{ name: "Receita", color: "var(--chart-receita)" }, { name: "Despesa", color: "var(--chart-despesa)" }]} />}>
          <PLine labels={E.meses} splitAt={E.hoje} yFmt={(v) => (v ? v / 1000 + "k" : "0")} height={m ? 200 : 250} series={[{ name: "Receita", color: "var(--chart-receita)", data: E.receita }, { name: "Despesa", color: "var(--chart-despesa)", data: E.despesa }, { name: "Receita prevista", color: "var(--chart-receita)", data: E.receitaPrev, dash: true }, { name: "Despesa prevista", color: "var(--chart-despesa)", data: E.despesaPrev, dash: true }]} />
          {m ? <div style={{ marginTop: 10 }}><PLegend items={[{ name: "Receita", color: "var(--chart-receita)" }, { name: "Despesa", color: "var(--chart-despesa)" }]} /></div> : null}
        </PPanel>
        <PPanel title={`Comparativo com ${A.id}`} sub="Mesmo ponto = 6 meses antes do evento">
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 76px 76px 48px", gap: 8, ...pnT.eyebrow, fontSize: 10, paddingBottom: 8, borderBottom: "1px solid var(--border-subtle)" }}><span></span><span style={{ textAlign: "right" }}>{A.id}</span><span style={{ textAlign: "right" }}>{ed}</span><span style={{ textAlign: "right" }}>Δ</span></div>
            {cmp.map(([l, a, c, up]) => (
              <div key={l} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 76px 76px 48px", gap: 8, alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border-subtle)", fontFamily: "var(--font-body)", fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
                <span style={{ color: "var(--text-body)" }}>{l}</span><span style={{ textAlign: "right", color: "var(--espresso-600)" }}>{pnFmt.mil(a)}</span><span style={{ textAlign: "right", fontWeight: 700, color: "var(--text-strong)" }}>{c == null ? "—" : pnFmt.mil(c)}</span>
                <span style={{ textAlign: "right", fontWeight: 700, color: c == null ? "var(--espresso-600)" : ((c >= a) === up ? "var(--cactus-600)" : "var(--brick-600)") }}>{c == null ? "" : delta(a, c)}</span>
              </div>
            ))}
          </div>
        </PPanel>
      </div>
    </div>
  );
}

function PnReceitas({ receitas, setReceitas, onEdit }) {
  const DS = pnDS();
  const { m, toast } = usePn();
  const D = window.PN_DATA;
  const [view, setView] = React.useState("funil");
  const [stage, setStage] = React.useState("negociacao");
  const move = (id, to) => { setReceitas((rs) => rs.map((r) => (r.id === id ? { ...r, status: to } : r))); toast({ variant: "success", title: "Etapa atualizada", description: PN_TAGS.funil[to][0] }); };
  const waitlist = D.inscritos.filter((i) => i.tipo === "patrocinador");
  const inFunil = (e) => receitas.find((r) => r.patrocinador === e);
  const card = (r) => (
    <div key={r.id} style={{ background: "var(--surface-card)", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 8, boxShadow: "var(--shadow-xs)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 6, alignItems: "flex-start" }}>
        <button onClick={() => onEdit(r)} style={{ border: 0, padding: 0, background: "none", textAlign: "left", cursor: "pointer", ...pnT.body, fontWeight: 700, fontSize: 13.5, color: "var(--text-strong)" }}>{r.patrocinador}</button>
        <PPop align="right" width={210} trigger={({ toggle }) => <button onClick={toggle} aria-label="Mover etapa" style={{ border: 0, background: "transparent", cursor: "pointer", color: "var(--espresso-600)", padding: 2, borderRadius: 6 }}><PIcon n="more" s={16} /></button>}>
          <div style={{ ...pnT.eyebrow, fontSize: 10, padding: "6px 10px" }}>Mover para</div>
          {PN_FUNIL_ORDEM.filter((s) => s !== r.status).map((s) => <PMenuItem key={s} onClick={() => move(r.id, s)}>{PN_TAGS.funil[s][0]}</PMenuItem>)}
        </PPop>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <span style={{ ...pnT.mono, fontSize: 11, color: "var(--espresso-700)" }}>COTA {r.cota.toUpperCase()}</span>
        <span style={{ ...pnT.num, fontSize: 15 }}>{pnFmt.brl(r.valor)}</span>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", ...pnT.muted, fontSize: 12 }}><PIcon n="calendar" s={13} />{r.recebida ? `Recebido ${pnFmt.dts(r.recebida)}` : `Prev. ${pnFmt.dts(r.prevista)}`}{r.anexo ? <PIcon n="clip" s={13} style={{ marginLeft: "auto" }} /> : null}</div>
    </div>
  );
  const cols = [
    { key: "p", label: "Patrocinador", mobile: "title", render: (r) => <b style={{ fontWeight: 600, color: "var(--text-strong)" }}>{r.patrocinador}</b> },
    { key: "c", label: "Cota", mobile: "meta", render: (r) => r.cota },
    { key: "v", label: "Valor", align: "right", mobile: "meta", render: (r) => <span style={{ ...pnT.num, fontSize: 14, fontWeight: 600 }}>{pnFmt.brl(r.valor)}</span> },
    { key: "s", label: "Etapa", mobile: "tag", render: (r) => <PTag k="funil" v={r.status} size="sm" /> },
    { key: "pr", label: "Previsto", sort: true, render: (r) => pnFmt.dt(r.prevista) },
    { key: "rc", label: "Recebido", render: (r) => pnFmt.dt(r.recebida) },
    { key: "a", label: "Anexo", render: (r) => r.anexo ? <span title={r.anexo} style={{ color: "var(--espresso-700)" }}><PIcon n="clip" s={16} /></span> : <span style={{ color: "var(--espresso-600)" }}>—</span> },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: m ? 12 : 16 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
        <PChips options={[{ value: "funil", label: "Funil" }, { value: "tabela", label: "Tabela" }]} value={view} onChange={setView} />
        <span style={{ ...pnT.muted }}>{receitas.length} patrocinadores · {pnFmt.brl(receitas.reduce((a, r) => a + r.valor, 0))} no funil</span>
      </div>
      <PPanel title="Da lista de espera" sub="Quem preencheu o formulário com cota pretendida — vira receita prevista em um clique.">
        <div style={{ display: "flex", flexDirection: "column" }}>
          {waitlist.map((w, i) => { const f = inFunil(w.empresa); return (
            <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: i ? "1px solid var(--border-subtle)" : 0, flexWrap: "wrap" }}>
              <span style={{ ...pnT.body, fontWeight: 600, minWidth: 140 }}>{w.empresa}</span>
              <span style={{ ...pnT.mono, fontSize: 11 }}>COTA PRETENDIDA: {w.cota.toUpperCase()}</span>
              <span style={{ ...pnT.muted, fontSize: 12 }}>inscrição #{w.id}</span>
              <span style={{ marginLeft: "auto" }}>{f ? <PTag k="funil" v={f.status} size="sm" /> : <DS.Button size="sm" variant="secondary" iconLeft={<PIcon n="plus" s={14} />} onClick={() => { setReceitas((rs) => [...rs, { id: "r" + Date.now(), patrocinador: w.empresa, cota: w.cota, valor: D.cotas.find((c) => c.id === w.cota).valor, status: "prospeccao", prevista: "2027-04-01", recebida: null, anexo: null }]); toast({ variant: "success", title: "Receita prevista criada", description: `${w.empresa} entrou em Prospecção.` }); }}>Adicionar ao funil</DS.Button>}</span>
            </div>
          ); })}
        </div>
      </PPanel>
      {view === "tabela" ? (
        <PPanel pad={false}><PTable cols={cols} rows={receitas} expand={(r) => <div style={{ paddingTop: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><DS.Button size="sm" variant="outline" iconLeft={<PIcon n="edit" s={14} />} onClick={() => onEdit(r)}>Editar receita</DS.Button>{r.anexo ? <DS.Button size="sm" variant="ghost" iconLeft={<PIcon n="clip" s={14} />}>{r.anexo}</DS.Button> : null}</div>} footer={<PTableFoot shown={receitas.length} total={receitas.length} />} /></PPanel>
      ) : m ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ overflowX: "auto", margin: "0 -16px", padding: "0 16px" }}><PChips options={PN_FUNIL_ORDEM.map((s) => ({ value: s, label: PN_TAGS.funil[s][0], count: receitas.filter((r) => r.status === s).length }))} value={stage} onChange={setStage} /></div>
          {receitas.filter((r) => r.status === stage).map(card)}
          {!receitas.some((r) => r.status === stage) ? <div style={{ ...pnT.muted, textAlign: "center", padding: 20, border: "1px dashed var(--border-default)", borderRadius: 12 }}>Ninguém nesta etapa.</div> : null}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(170px, 1fr))", gap: 10, overflowX: "auto", overflowY: "hidden", paddingBottom: 12 }}>
          {PN_FUNIL_ORDEM.map((s) => { const it = receitas.filter((r) => r.status === s); return (
            <div key={s} style={{ background: "var(--sand-200)", borderRadius: 14, padding: 10, display: "flex", flexDirection: "column", gap: 8, minHeight: 280 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "2px 2px 6px" }}><PTag k="funil" v={s} size="sm" style={{ alignSelf: "flex-start" }} /><span style={{ ...pnT.mono, fontSize: 11, color: "var(--espresso-700)" }}>{it.length} · {pnFmt.mil(it.reduce((a, r) => a + r.valor, 0))}</span></div>
              {it.map(card)}
            </div>
          ); })}
        </div>
      )}
    </div>
  );
}

function PnDespesas({ despesas, onEdit }) {
  const { m } = usePn();
  const D = window.PN_DATA;
  const DS = pnDS();
  const [s, setS] = React.useState("todos");
  const [cat, setCat] = React.useState("Todas as categorias");
  const rows = despesas.filter((d) => (s === "todos" || d.status === s) && (cat === "Todas as categorias" || d.categoria === cat));
  const over = (d) => d.status !== "planejado" && d.realizado > d.orcado;
  const tot = (f) => rows.reduce((a, d) => a + f(d), 0);
  const cols = [
    { key: "d", label: "Descrição", mobile: "title", render: (d) => <span style={{ display: "flex", flexDirection: "column", gap: 2 }}><b style={{ fontWeight: 600, color: "var(--text-strong)" }}>{d.desc}</b>{m ? null : <span style={{ ...pnT.muted, fontSize: 12 }}>{d.categoria} · {d.fornecedor}</span>}</span> },
    { key: "o", label: "Orçado", align: "right", mobile: "meta", render: (d) => <span style={{ fontVariantNumeric: "tabular-nums" }}>{m ? "Orçado " : ""}{pnFmt.brl(d.orcado)}</span> },
    { key: "r", label: "Realizado", align: "right", mobile: "meta", render: (d) => <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700, color: over(d) ? "var(--brick-600)" : "var(--text-strong)", display: "inline-flex", gap: 4, alignItems: "center" }}>{over(d) ? <PIcon n="alert" s={14} /> : null}{m ? "Real. " : ""}{d.status === "planejado" ? "—" : pnFmt.brl(d.realizado)}</span> },
    { key: "s", label: "Status", mobile: "tag", render: (d) => <PTag k="despesa" v={d.status} size="sm" /> },
    { key: "v", label: "Vencimento", sort: true, mobile: "meta", render: (d) => pnFmt.dt(d.venc) },
    { key: "p", label: "Resp.", render: (d) => d.resp },
    { key: "a", label: "", render: (d) => d.anexo ? <span title={d.anexo} style={{ color: "var(--espresso-700)" }}><PIcon n="clip" s={16} /></span> : null },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: m ? 12 : 16 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <PChips options={[{ value: "todos", label: "Todos" }, { value: "planejado", label: "Planejado" }, { value: "comprometido", label: "Comprometido" }, { value: "pago", label: "Pago" }, { value: "vencido", label: "Vencido", count: despesas.filter((d) => d.status === "vencido").length }]} value={s} onChange={setS} />
        <div style={{ width: m ? "100%" : 240 }}><DS.Select size="sm" options={["Todas as categorias", ...D.categorias]} value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Categoria" /></div>
      </div>
      <PPanel pad={false}>
        <PTable cols={cols} rows={rows} minWidth={860} expand={(d) => (
          <div style={{ paddingTop: 12, display: "flex", flexDirection: "column", gap: 14 }}>
            <PDefList cols={4} items={[["Categoria", d.categoria], ["Fornecedor", d.fornecedor], ["Responsável", d.resp], ["Anexo", d.anexo || "—"]]} />
            {over(d) ? <div style={{ ...pnT.body, fontSize: 13, color: "var(--brick-600)", display: "flex", gap: 8, alignItems: "center" }}><PIcon n="alert" s={16} />Acima do orçado em {pnFmt.brl(d.realizado - d.orcado)}. Ajuste o orçado ou registre a justificativa.</div> : null}
            <div><DS.Button size="sm" variant="outline" iconLeft={<PIcon n="edit" s={14} />} onClick={() => onEdit(d)}>Editar despesa</DS.Button></div>
          </div>
        )} footer={
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "var(--sand-100)", borderTop: "1px solid var(--border-subtle)", flexWrap: "wrap", gap: 8, fontFamily: "var(--font-body)", fontSize: 13.5, fontVariantNumeric: "tabular-nums" }}>
            <span style={{ color: "var(--espresso-600)" }}>{rows.length} itens</span>
            <span style={{ display: "flex", gap: 20 }}><span>Orçado <b>{pnFmt.brl(tot((d) => d.orcado))}</b></span><span>Realizado <b>{pnFmt.brl(tot((d) => (d.status === "planejado" ? 0 : d.realizado)))}</b></span></span>
          </div>
        } />
      </PPanel>
    </div>
  );
}

function PnBudgetForm({ kind, item, onClose, onSave }) {
  const DS = pnDS();
  const { m } = usePn();
  const D = window.PN_DATA;
  const isR = kind === "receita";
  const [v, setV] = React.useState(item || (isR ? { cota: "Mandacaru", valor: 12000, status: "prospeccao" } : { categoria: "Audiovisual", status: "planejado", orcado: "", realizado: "" }));
  const [tried, setTried] = React.useState(false);
  const set = (k) => (x) => setV((o) => ({ ...o, [k]: x && x.target ? x.target.value : x }));
  const g2 = { display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr", gap: 14 };
  const missing = isR ? !v.valor || !v.patrocinador : !v.orcado || !v.desc;
  const save = (more) => { setTried(true); if (missing) return; onSave(v, more); if (more) { setV(isR ? { cota: v.cota, valor: "", status: "prospeccao" } : { categoria: v.categoria, status: "planejado", orcado: "", realizado: "" }); setTried(false); } };
  const kit = D.cotas.find((c) => c.id === v.cota);
  return (
    <DS.Dialog open onClose={onClose} size="md" title={`${item ? "Editar" : "Nova"} ${isR ? "receita" : "despesa"}`} description={isR ? "Patrocínio da edição em foco." : "Lançamento de despesa da edição em foco."}
      footer={<div style={{ display: "flex", gap: 8, justifyContent: "flex-end", width: "100%", flexWrap: "wrap" }}><DS.Button variant="ghost" onClick={onClose}>Cancelar</DS.Button>{!item ? <DS.Button variant="outline" onClick={() => save(true)}>Salvar e criar outra</DS.Button> : null}<DS.Button onClick={() => save(false)}>Salvar</DS.Button></div>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {isR ? (<>
          <DS.Input label="Patrocinador" value={v.patrocinador || ""} onChange={set("patrocinador")} placeholder="Nome da empresa" hint="Ou use “Adicionar ao funil” na lista de espera." error={tried && !v.patrocinador ? "Informe o patrocinador." : undefined} />
          <div style={g2}>
            <DS.Select label="Cota" options={D.cotas.map((c) => c.id)} value={v.cota} onChange={(e) => { const c = D.cotas.find((x) => x.id === e.target.value); setV((o) => ({ ...o, cota: c.id, valor: c.valor })); }} />
            <PMoney label="Valor" required value={v.valor} onChange={set("valor")} hint={kit ? `Cota no kit: ${pnFmt.brl(kit.valor)}` : null} error={tried && !v.valor ? "Informe o valor." : undefined} />
          </div>
          <div style={g2}>
            <DS.Select label="Etapa do funil" options={PN_FUNIL_ORDEM.map((s) => ({ value: s, label: PN_TAGS.funil[s][0] }))} value={v.status} onChange={set("status")} />
            <DS.Input label="Pagamento previsto" type="date" value={v.prevista || ""} onChange={set("prevista")} />
          </div>
          <div style={g2}>
            <DS.Input label="Recebido em" type="date" value={v.recebida || ""} onChange={set("recebida")} disabled={v.status !== "pago"} hint={v.status !== "pago" ? "Libera quando a etapa for Pago." : undefined} />
            <div></div>
          </div>
        </>) : (<>
          <div style={g2}>
            <DS.Select label="Categoria" options={D.categorias} value={v.categoria} onChange={set("categoria")} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--text-strong)" }}>Status</span><PChips options={[{ value: "planejado", label: "Planejado" }, { value: "comprometido", label: "Comprometido" }, { value: "pago", label: "Pago" }]} value={v.status} onChange={set("status")} /></div>
          </div>
          <DS.Input label="Descrição" value={v.desc || ""} onChange={set("desc")} placeholder="Ex.: Som, telão e transmissão" error={tried && !v.desc ? "Descreva a despesa." : undefined} />
          <div style={g2}>
            <DS.Input label="Fornecedor" value={v.fornecedor || ""} onChange={set("fornecedor")} />
            <DS.Select label="Responsável" options={["Marina", "Bia", "Caio", "Rafa"]} value={v.resp || "Bia"} onChange={set("resp")} />
          </div>
          <div style={g2}>
            <PMoney label="Valor orçado" required value={v.orcado} onChange={set("orcado")} error={tried && !v.orcado ? "Informe o valor orçado." : undefined} />
            <PMoney label="Valor realizado" value={v.realizado} onChange={set("realizado")} hint={v.status === "planejado" ? "Preencha ao comprometer." : v.realizado > v.orcado ? undefined : "Valor contratado ou pago."} error={v.realizado && v.orcado && v.realizado > v.orcado ? `Acima do orçado em ${pnFmt.brl(v.realizado - v.orcado)}` : undefined} />
          </div>
          <div style={g2}><DS.Input label="Vencimento" type="date" value={v.venc || ""} onChange={set("venc")} /><div></div></div>
        </>)}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", border: "1.5px dashed var(--border-default)", borderRadius: 12, background: "var(--sand-100)" }}>
          <PIcon n="upload" s={18} style={{ color: "var(--espresso-700)" }} />
          <span style={{ ...pnT.body, fontSize: 13.5, flex: 1 }}>{v.anexo ? <b>{v.anexo}</b> : <>Arraste o {isR ? "contrato ou nota" : "orçamento, contrato ou nota"} aqui ou <a href="#" onClick={(e) => e.preventDefault()}>escolha um arquivo</a></>}</span>
          <span style={{ ...pnT.mono, fontSize: 11 }}>PDF · até 10 MB</span>
        </div>
      </div>
    </DS.Dialog>
  );
}

function PnCopyDialog({ onClose, onGo }) {
  const DS = pnDS();
  const { ed } = usePn();
  const A = window.PN_DATA.anterior;
  const [aj, setAj] = React.useState(8);
  const cb = (label, sub, def = true) => <label style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px", borderRadius: 12, border: "1px solid var(--border-subtle)", background: "var(--surface-card)", cursor: "pointer" }}><input type="checkbox" defaultChecked={def} style={{ width: 18, height: 18, accentColor: "var(--brand-primary)", marginTop: 1 }} /><span style={{ display: "flex", flexDirection: "column", gap: 2 }}><b style={{ ...pnT.body, fontWeight: 600 }}>{label}</b><span style={pnT.muted}>{sub}</span></span></label>;
  return (
    <DS.Dialog open onClose={onClose} size="md" title={`Copiar orçamento de ${A.id}`} description={`Ponto de partida para ${ed}. Nada é salvo até você revisar.`}
      footer={<div style={{ display: "flex", gap: 8, justifyContent: "flex-end", width: "100%" }}><DS.Button variant="ghost" onClick={onClose}>Cancelar</DS.Button><DS.Button iconRight={<PIcon n="cright" s={16} />} onClick={() => onGo(aj)}>Revisar no planejamento em lote</DS.Button></div>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {cb("Despesas por categoria", `9 categorias · ${pnFmt.brl(A.despesaPaga)} realizados em ${A.id} → entram como Planejado`)}
        {cb("Patrocinadores de " + A.id, "Entram no funil como Prospecção, sem valor recebido", false)}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: "var(--sand-100)", flexWrap: "wrap" }}>
          <span style={{ ...pnT.body, fontWeight: 600, flex: 1, minWidth: 160 }}>Reajustar valores</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button onClick={() => setAj((a) => a - 1)} aria-label="Diminuir" style={{ width: 32, height: 32, borderRadius: 99, border: "1.5px solid var(--border-default)", background: "var(--surface-card)", cursor: "pointer", display: "grid", placeItems: "center" }}>−</button>
            <span style={{ ...pnT.num, fontSize: 18, minWidth: 56, textAlign: "center" }}>{aj > 0 ? "+" : ""}{aj}%</span>
            <button onClick={() => setAj((a) => a + 1)} aria-label="Aumentar" style={{ width: 32, height: 32, borderRadius: 99, border: "1.5px solid var(--border-default)", background: "var(--surface-card)", cursor: "pointer" }}>+</button>
          </div>
        </div>
      </div>
    </DS.Dialog>
  );
}

function PnLote({ seed, onBack, onCreate }) {
  const DS = pnDS();
  const { m, ed } = usePn();
  const D = window.PN_DATA, A = D.anterior;
  const [rows, setRows] = React.useState(() => D.categorias.map((c, i) => ({ id: i, categoria: c, desc: "", orcado: seed != null ? Math.round((A.porCategoria[c] * (1 + seed / 100)) / 100) * 100 : "", ref: A.porCategoria[c] })));
  const upd = (id, k, val) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [k]: val } : r)));
  const total = rows.reduce((a, r) => a + (+r.orcado || 0), 0);
  const filled = rows.filter((r) => r.orcado).length;
  const inp = { height: 36, borderRadius: 10, border: "1.5px solid var(--border-default)", background: "var(--surface-card)", padding: "0 10px", fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--text-strong)", minWidth: 0, width: "100%", boxSizing: "border-box" };
  return (
    <PPage eyebrow={`Finanças · orçamento ${ed}`} title="Planejar em lote" desc={seed != null ? `Valores de ${A.id} reajustados em ${seed > 0 ? "+" : ""}${seed}%. Revise linha a linha antes de criar.` : "Uma linha por item. Deixe em branco o que ainda não sabe — dá pra completar depois."} actions={<DS.Button size="sm" variant="ghost" iconLeft={<PIcon n="cright" s={16} style={{ transform: "rotate(180deg)" }} />} onClick={onBack}>Voltar ao orçamento</DS.Button>}>
      <PPanel pad={false}>
        {!m ? <div style={{ display: "grid", gridTemplateColumns: "200px minmax(0,1fr) 170px 120px 40px", gap: 12, padding: "0 16px", height: 40, alignItems: "center", background: "var(--sand-100)", borderBottom: "1px solid var(--border-subtle)", borderRadius: "16px 16px 0 0", ...pnT.eyebrow, fontSize: 11 }}><span>Categoria</span><span>Descrição</span><span style={{ textAlign: "right" }}>Orçado {ed}</span><span style={{ textAlign: "right" }}>Real. {A.id}</span><span></span></div> : null}
        {rows.map((r) => (
          <div key={r.id} style={{ display: "grid", gridTemplateColumns: m ? "1fr 1fr" : "200px minmax(0,1fr) 170px 120px 40px", gap: m ? 8 : 12, padding: m ? "12px 16px" : "8px 16px", alignItems: "center", borderBottom: "1px solid var(--border-subtle)" }}>
            <select value={r.categoria} onChange={(e) => upd(r.id, "categoria", e.target.value)} style={{ ...inp, gridColumn: m ? "1 / -1" : "auto", fontWeight: 600 }}>{D.categorias.map((c) => <option key={c}>{c}</option>)}</select>
            <input value={r.desc} onChange={(e) => upd(r.id, "desc", e.target.value)} placeholder="Descrição (opcional)" style={{ ...inp, gridColumn: m ? "1 / -1" : "auto" }} />
            <PMoney size="sm" value={r.orcado} onChange={(v) => upd(r.id, "orcado", v)} />
            <span style={{ textAlign: "right", ...pnT.muted, fontVariantNumeric: "tabular-nums" }}>{m ? `${A.id}: ` : ""}{r.ref ? pnFmt.brl(r.ref) : "—"}</span>
            {!m ? <button aria-label="Remover linha" onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))} style={{ border: 0, background: "transparent", cursor: "pointer", color: "var(--espresso-600)" }}><PIcon n="trash" s={16} /></button> : null}
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "14px 16px", flexWrap: "wrap" }}>
          <DS.Button size="sm" variant="ghost" iconLeft={<PIcon n="plus" s={14} />} onClick={() => setRows((rs) => [...rs, { id: Date.now(), categoria: "Taxas", desc: "", orcado: "", ref: null }])}>Adicionar linha</DS.Button>
          <span style={{ display: "flex", alignItems: "baseline", gap: 10 }}><span style={pnT.muted}>Total orçado</span><span style={{ ...pnT.num, fontSize: 22 }}>{pnFmt.brl(total)}</span></span>
        </div>
      </PPanel>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
        <DS.Button variant="ghost" onClick={onBack}>Descartar</DS.Button>
        <DS.Button disabled={!filled} iconLeft={<PIcon n="check" s={16} />} onClick={() => onCreate(filled)}>Criar {filled} despesas como Planejado</DS.Button>
      </div>
    </PPage>
  );
}

function PnOrcamento() {
  const DS = pnDS();
  const { m, role, st, ed, toast } = usePn();
  const D = window.PN_DATA;
  const onlyR = role === "comercial";
  const [tab, setTab] = React.useState(onlyR ? "receitas" : "geral");
  React.useEffect(() => { if (onlyR) setTab("receitas"); }, [onlyR]);
  const [receitas, setReceitas] = React.useState(D.receitas);
  const [despesas, setDespesas] = React.useState(D.despesas);
  const [form, setForm] = React.useState(null);
  const [lote, setLote] = React.useState(null);
  const [copy, setCopy] = React.useState(false);
  const closed = ed !== "2027";
  if (lote) return <PnLote seed={lote.seed} onBack={() => setLote(null)} onCreate={(n) => { setLote(null); setTab("despesas"); toast({ variant: "success", title: `${n} despesas criadas`, description: "Todas como Planejado. Ajuste à medida que fechar fornecedores." }); }} />;
  const save = (v, more) => {
    if (form.kind === "receita") setReceitas((rs) => (v.id ? rs.map((r) => (r.id === v.id ? v : r)) : [...rs, { ...v, id: "r" + Date.now() }]));
    else setDespesas((ds) => (v.id ? ds.map((d) => (d.id === v.id ? v : d)) : [...ds, { ...v, id: "d" + Date.now() }]));
    if (!more) setForm(null);
    toast({ variant: "success", title: v.id ? "Alterações salvas" : `${form.kind === "receita" ? "Receita" : "Despesa"} criada`, description: v.patrocinador || v.desc });
  };
  const tabs = onlyR ? [] : [{ value: "geral", label: "Visão geral" }, { value: "receitas", label: "Receitas" }, { value: "despesas", label: "Despesas" }];
  const actions = st !== "ok" || closed ? null : (
    <>
      {!onlyR ? <PPop align={m ? "left" : "right"} width={250} trigger={({ toggle }) => <DS.Button size="sm" variant="ghost" onClick={toggle} iconRight={<PIcon n="cdown" s={14} />}>{m ? "Mais" : "Planejamento"}</DS.Button>}>
        <PMenuItem icon="list" onClick={() => setLote({ seed: null })}>Criar despesas em lote</PMenuItem>
        <PMenuItem icon="copy" onClick={() => setCopy(true)}>Copiar orçamento de 2026</PMenuItem>
        <PMenuItem icon="download">Exportar CSV</PMenuItem>
      </PPop> : null}
      {!onlyR ? <DS.Button size="sm" variant="outline" iconLeft={<PIcon n="plus" s={15} />} onClick={() => setForm({ kind: "despesa" })}>Despesa</DS.Button> : null}
      <DS.Button size="sm" iconLeft={<PIcon n="plus" s={15} />} onClick={() => setForm({ kind: "receita" })}>Receita</DS.Button>
    </>
  );
  let body;
  if (st === "empty") {
    body = (
      <PPanel>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center", textAlign: "center", padding: m ? "12px 0" : "28px 0" }}>
          <span style={{ width: 56, height: 56, borderRadius: 99, display: "grid", placeItems: "center", background: "var(--amber-100)", color: "var(--amber-700)" }}><PIcon n="wallet" s={24} /></span>
          <div><h3 style={{ ...pnT.h2, fontSize: 20 }}>Edição {ed} ainda não tem orçamento</h3><p style={{ ...pnT.muted, fontSize: 14, margin: "6px 0 0" }}>Escolha um ponto de partida. Dá pra ajustar tudo depois.</p></div>
          <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "repeat(3, minmax(0, 220px))", gap: 12, width: "100%", justifyContent: "center" }}>
            {[["copy", "Copiar de 2026", "Categorias e valores da edição passada, com reajuste.", () => setCopy(true), true], ["list", "Planejar em lote", "Uma linha por categoria, valores em branco.", () => setLote({ seed: null })], ["plus", "Começar do zero", "Lançar receitas e despesas uma a uma.", () => setForm({ kind: "despesa" })]].map(([ic, t, d, fn, rec]) => (
              <button key={t} onClick={fn} style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 8, padding: 16, borderRadius: 16, cursor: "pointer", background: "var(--surface-card)", border: rec ? "2px solid var(--border-ink)" : "1px solid var(--border-default)", boxShadow: rec ? "var(--shadow-badge-sm)" : "none" }}>
                <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--espresso-800)" }}><PIcon n={ic} s={20} />{rec ? <span style={{ ...pnT.eyebrow, fontSize: 10, color: "var(--espresso-900)", background: "var(--amber-300)", padding: "2px 6px", borderRadius: 99 }}>Recomendado</span> : null}</span>
                <b style={{ ...pnT.h2, fontSize: 15 }}>{t}</b><span style={pnT.muted}>{d}</span>
              </button>
            ))}
          </div>
        </div>
      </PPanel>
    );
  } else if (st !== "ok") body = <PState kind={st} shape="kpis" />;
  else if (tab === "geral") body = <PnVisaoGeral receitas={receitas} despesas={despesas} goTab={setTab} />;
  else if (tab === "receitas") body = <PnReceitas receitas={receitas} setReceitas={setReceitas} onEdit={(r) => setForm({ kind: "receita", item: r })} />;
  else body = <PnDespesas despesas={despesas} onEdit={(d) => setForm({ kind: "despesa", item: d })} />;
  return (
    <PPage eyebrow={`Finanças · edição ${ed}`} title={onlyR ? "Funil de patrocínio" : "Orçamento"} desc={onlyR ? "Seu papel vê as receitas de patrocínio. Despesas e saldo ficam com financeiro e admin." : closed ? "Edição encerrada — valores congelados para consulta e comparação." : "Receitas de patrocínio, despesas por categoria e o saldo da edição em foco."} actions={actions}>
      {closed && st === "ok" ? <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 14px", borderRadius: 12, background: "var(--sand-200)", color: "var(--espresso-800)", fontFamily: "var(--font-body)", fontSize: 13.5 }}><PIcon n="lock" s={16} />Somente leitura · para editar, volte para a edição atual no seletor do topo.</div> : null}
      {tabs.length && st === "ok" ? <PChips options={tabs} value={tab} onChange={setTab} /> : null}
      {body}
      {form ? <PnBudgetForm kind={form.kind} item={form.item} onClose={() => setForm(null)} onSave={save} /> : null}
      {copy ? <PnCopyDialog onClose={() => setCopy(false)} onGo={(aj) => { setCopy(false); setLote({ seed: aj }); }} /> : null}
    </PPage>
  );
}

Object.assign(window, { pnBudget, PnOrcamento, PnVisaoGeral, PnReceitas, PnDespesas, PnBudgetForm, PnCopyDialog, PnLote, PnTriple });
