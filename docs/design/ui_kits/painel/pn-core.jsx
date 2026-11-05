/* Painel interno — primitivos derivados do DS. Exportados para window. */
const pnDS = () => window.SertOTechDesignSystem_26fb13;

const PN_PATHS = {
  users: [["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }], ["circle", { cx: 9, cy: 7, r: 4 }], ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }], ["path", { d: "M16 3.13a4 4 0 0 1 0 7.75" }]],
  chart: [["path", { d: "M3 3v16a2 2 0 0 0 2 2h16" }], ["path", { d: "M18 17V9" }], ["path", { d: "M13 17V5" }], ["path", { d: "M8 17v-3" }]],
  mail: [["rect", { width: 20, height: 16, x: 2, y: 4, rx: 2 }], ["path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" }]],
  shield: [["path", { d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" }]],
  presentation: [["path", { d: "M2 3h20" }], ["path", { d: "M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" }], ["path", { d: "m7 21 5-5 5 5" }]],
  wallet: [["path", { d: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" }], ["path", { d: "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" }]],
  logout: [["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }], ["path", { d: "m16 17 5-5-5-5" }], ["path", { d: "M21 12H9" }]],
  download: [["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }], ["path", { d: "m7 10 5 5 5-5" }], ["path", { d: "M12 15V3" }]],
  upload: [["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }], ["path", { d: "m17 8-5-5-5 5" }], ["path", { d: "M12 3v12" }]],
  copy: [["rect", { width: 14, height: 14, x: 8, y: 8, rx: 2 }], ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" }]],
  printer: [["path", { d: "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" }], ["path", { d: "M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" }], ["rect", { x: 6, y: 14, width: 12, height: 8, rx: 1 }]],
  lock: [["rect", { width: 18, height: 11, x: 3, y: 11, rx: 2 }], ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4" }]],
  eye: [["path", { d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" }], ["circle", { cx: 12, cy: 12, r: 3 }]],
  trash: [["path", { d: "M3 6h18" }], ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }], ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }]],
  clip: [["path", { d: "m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" }]],
  link: [["path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" }], ["path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" }]],
  file: [["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" }], ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4" }], ["path", { d: "M16 13H8" }], ["path", { d: "M16 17H8" }]],
  kanban: [["rect", { width: 18, height: 18, x: 3, y: 3, rx: 2 }], ["path", { d: "M8 7v7" }], ["path", { d: "M12 7v4" }], ["path", { d: "M16 7v9" }]],
  list: [["path", { d: "M3 12h.01" }], ["path", { d: "M3 18h.01" }], ["path", { d: "M3 6h.01" }], ["path", { d: "M8 12h13" }], ["path", { d: "M8 18h13" }], ["path", { d: "M8 6h13" }]],
  more: [["circle", { cx: 12, cy: 12, r: 1 }], ["circle", { cx: 19, cy: 12, r: 1 }], ["circle", { cx: 5, cy: 12, r: 1 }]],
  grid: [["rect", { width: 7, height: 7, x: 3, y: 3, rx: 1 }], ["rect", { width: 7, height: 7, x: 14, y: 3, rx: 1 }], ["rect", { width: 7, height: 7, x: 14, y: 14, rx: 1 }], ["rect", { width: 7, height: 7, x: 3, y: 14, rx: 1 }]],
  refresh: [["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" }], ["path", { d: "M21 3v5h-5" }], ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" }], ["path", { d: "M8 16H3v5" }]],
  user: [["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" }], ["circle", { cx: 12, cy: 7, r: 4 }]],
  up: [["path", { d: "M22 7 13.5 15.5 8.5 10.5 2 17" }], ["path", { d: "M16 7h6v6" }]],
  down: [["path", { d: "M22 17 13.5 8.5 8.5 13.5 2 7" }], ["path", { d: "M16 17h6v-6" }]],
  edit: [["path", { d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" }]],
  inbox: [["path", { d: "M22 12h-6l-2 3h-4l-2-3H2" }], ["path", { d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" }]],
  ext: [["path", { d: "M15 3h6v6" }], ["path", { d: "M10 14 21 3" }], ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" }]],
  search: [["circle", { cx: 11, cy: 11, r: 8 }], ["path", { d: "m21 21-4.3-4.3" }]],
  check: [["path", { d: "M20 6 9 17l-5-5" }]],
  x: [["path", { d: "M18 6 6 18" }], ["path", { d: "m6 6 12 12" }]],
  plus: [["path", { d: "M5 12h14" }], ["path", { d: "M12 5v14" }]],
  cdown: [["path", { d: "m6 9 6 6 6-6" }]],
  cright: [["path", { d: "m9 18 6-6-6-6" }]],
  calendar: [["path", { d: "M8 2v4" }], ["path", { d: "M16 2v4" }], ["rect", { width: 18, height: 18, x: 3, y: 4, rx: 2 }], ["path", { d: "M3 10h18" }]],
  alert: [["path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" }], ["path", { d: "M12 9v4" }], ["path", { d: "M12 17h.01" }]],
  info: [["circle", { cx: 12, cy: 12, r: 10 }], ["path", { d: "M12 16v-4" }], ["path", { d: "M12 8h.01" }]],
  ok: [["path", { d: "M21.801 10A10 10 0 1 1 17 3.335" }], ["path", { d: "m9 11 3 3L22 4" }]],
  loader: [["path", { d: "M21 12a9 9 0 1 1-6.219-8.56" }]],
  history: [["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }], ["path", { d: "M3 3v5h5" }], ["path", { d: "M12 7v5l4 2" }]],
  layers: [["path", { d: "m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" }], ["path", { d: "m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" }], ["path", { d: "m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" }]],
};

function PIcon({ n, s = 18, w = 2, style }) {
  const p = PN_PATHS[n] || [];
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", display: "block", ...style }}>{p.map(([t, a], i) => React.createElement(t, { key: i, ...a }))}</svg>;
}

const PN_MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const pnFmt = {
  brl: (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }),
  brl2: (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 }),
  mil: (v) => Math.abs(v) >= 1000 ? "R$ " + (v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " mil" : pnFmt.brl(v),
  pct: (v) => Math.round(v * 100) + "%",
  num: (v) => v.toLocaleString("pt-BR"),
  dt: (s) => { if (!s) return "—"; const [y, m, d] = s.split("-"); return `${d}/${m}/${y}`; },
  dts: (s) => { if (!s) return "—"; const [, m, d] = s.split("-"); return `${+d} ${PN_MES[+m - 1]}`; },
};

const PnCtx = React.createContext({ m: false, role: "admin", st: "ok", ed: "2027" });
const usePn = () => React.useContext(PnCtx);

/* ---- Tipografia aplicada ---- */
const pnT = {
  eyebrow: { fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--espresso-600)", fontWeight: 400 },
  h1: { fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 600, letterSpacing: "-0.015em", lineHeight: 1.15, color: "var(--text-strong)", margin: 0 },
  h2: { fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, letterSpacing: "-0.005em", lineHeight: 1.3, color: "var(--text-strong)", margin: 0 },
  body: { fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.5, color: "var(--text-body)" },
  muted: { fontFamily: "var(--font-body)", fontSize: 13, lineHeight: 1.45, color: "var(--espresso-600)" },
  num: { fontFamily: "var(--font-display)", fontWeight: 700, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em", color: "var(--text-strong)" },
  mono: { fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--espresso-700)" },
};

/* ---- Tags de status ---- */
const PN_TAGS = {
  funil: {
    prospeccao: ["Prospecção", 1], proposta: ["Proposta enviada", 2], negociacao: ["Negociação", 3],
    fechado: ["Fechado", 4], assinado: ["Contrato assinado", 5], pago: ["Pago", 6],
  },
  despesa: { planejado: ["Planejado", "expense-planned"], comprometido: ["Comprometido", "expense-committed"], pago: ["Pago", "expense-paid"], vencido: ["Vencido", "expense-overdue"] },
  tipo: { participante: ["Participante", "var(--terra-100)", "var(--terra-700)"], palestrante: ["Palestrante", "var(--blue-100)", "var(--blue-700)"], patrocinador: ["Patrocinador", "var(--cactus-100)", "var(--cactus-600)"] },
  papel: { admin: ["admin", "var(--espresso-800)", "var(--sand-50)"], financeiro: ["financeiro", "var(--amber-100)", "var(--amber-700)"], comercial: ["comercial", "var(--terra-100)", "var(--terra-700)"], curadoria: ["curadoria", "var(--agave-100)", "var(--agave-600)"] },
  email: { entregue: ["Entregue", "var(--cactus-100)", "var(--cactus-600)"], enviado: ["Enviado", "var(--agave-100)", "var(--agave-600)"], falhou: ["Falhou", "var(--brick-100)", "var(--brick-600)"], fila: ["Na fila", "var(--sand-200)", "var(--espresso-700)"] },
  material: { deck: ["Deck reveal.js", "var(--sand-200)", "var(--espresso-700)"], relatorio: ["Relatório", "var(--sand-200)", "var(--espresso-700)"], impresso: ["Impresso", "var(--sand-200)", "var(--espresso-700)"], links: ["Página de links", "var(--sand-200)", "var(--espresso-700)"] },
};
const PN_FUNIL_ORDEM = ["prospeccao", "proposta", "negociacao", "fechado", "assinado", "pago"];

function PTag({ k, v, size = "md", style }) {
  const def = (PN_TAGS[k] || {})[v];
  if (!def) return null;
  let label = def[0], bg, fg, step = null;
  if (k === "funil") { bg = `var(--funnel-${def[1]}-bg)`; fg = `var(--funnel-${def[1]}-fg)`; step = def[1]; }
  else if (k === "despesa") { bg = `var(--${def[1]}-bg)`; fg = `var(--${def[1]}-fg)`; }
  else { bg = def[1]; fg = def[2]; }
  const isRole = k === "papel";
  const sm = size === "sm";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: sm ? 22 : 26, padding: sm ? "0 8px" : "0 10px", borderRadius: "var(--radius-pill)", background: bg, color: fg, whiteSpace: "nowrap", fontFamily: isRole ? "var(--font-mono)" : "var(--font-body)", fontSize: isRole ? 11 : sm ? 12 : 13, fontWeight: isRole ? 700 : 600, letterSpacing: isRole ? "0.08em" : 0, textTransform: isRole ? "uppercase" : "none", ...style }}>
      {step ? <span aria-label={`etapa ${step} de 6`} style={{ display: "inline-flex", gap: 2 }}>{[1, 2, 3, 4, 5, 6].map((i) => <span key={i} style={{ width: 3, height: 10, borderRadius: 1, background: "currentColor", opacity: i <= step ? 1 : 0.22 }}></span>)}</span> : null}
      {k === "despesa" && v === "vencido" ? <PIcon n="alert" s={13} /> : null}
      {label}
    </span>
  );
}

/* ---- Superfícies ---- */
function PPanel({ title, sub, actions, children, pad = true, style }) {
  const { m } = usePn();
  return (
    <section style={{ background: "var(--surface-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-xs)", minWidth: 0, ...style }}>
      {title ? (
        <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: m ? "14px 16px 0" : "18px 20px 0", flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}><h2 style={{ ...pnT.h2, fontSize: 16 }}>{title}</h2>{sub ? <div style={{ ...pnT.muted, marginTop: 2 }}>{sub}</div> : null}</div>
          {actions ? <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{actions}</div> : null}
        </header>
      ) : null}
      <div style={{ padding: pad ? (m ? 16 : 20) : 0 }}>{children}</div>
    </section>
  );
}

function PPage({ eyebrow, title, desc, actions, children }) {
  const { m } = usePn();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: m ? 16 : 24, padding: m ? "20px 16px 96px" : "32px 40px 56px", maxWidth: 1280, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: m ? "stretch" : "flex-end", gap: 16, flexDirection: m ? "column" : "row" }}>
        <div style={{ minWidth: 0 }}>
          {eyebrow ? <div style={{ ...pnT.eyebrow, marginBottom: 6 }}>// {eyebrow}</div> : null}
          <h1 style={{ ...pnT.h1, fontSize: m ? 24 : 30 }}>{title}</h1>
          {desc ? <p style={{ ...pnT.muted, fontSize: 14, margin: "6px 0 0", maxWidth: 640, textWrap: "pretty" }}>{desc}</p> : null}
        </div>
        {actions ? <div style={{ display: "flex", gap: 8, flexWrap: m ? "wrap" : "nowrap", alignItems: "center", flex: "none" }}>{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

/* ---- Cartão de KPI ---- */
function PKpi({ label, value, sub, delta, good = true, tone, icon, children, accent }) {
  const { m } = usePn();
  const neg = tone === "neg";
  return (
    <div style={{ background: accent ? "var(--surface-ink)" : "var(--surface-card)", border: accent ? "1px solid var(--espresso-800)" : neg ? "1.5px solid var(--brick-500)" : "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: m ? 14 : 18, display: "flex", flexDirection: "column", gap: 6, minWidth: 0, boxShadow: neg ? "3px 3px 0 var(--brick-500)" : "var(--shadow-xs)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, ...pnT.eyebrow, color: accent ? "var(--text-on-ink-muted)" : neg ? "var(--brick-600)" : "var(--espresso-600)" }}>
        {icon ? <PIcon n={icon} s={14} /> : null}<span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      </div>
      <div style={{ ...pnT.num, fontSize: m ? 24 : 30, lineHeight: 1.1, color: accent ? "var(--sand-50)" : neg ? "var(--brick-600)" : "var(--text-strong)", display: "flex", alignItems: "center", gap: 8 }}>
        {neg ? <PIcon n="alert" s={m ? 18 : 22} w={2.4} /> : null}{value}
      </div>
      {(sub || delta) ? (
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", fontSize: 12.5, fontFamily: "var(--font-body)", color: accent ? "var(--text-on-ink-muted)" : "var(--espresso-600)" }}>
          {delta ? <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontWeight: 700, color: accent ? "var(--amber-300)" : good ? "var(--cactus-600)" : "var(--brick-600)" }}><PIcon n={delta.startsWith("−") || delta.startsWith("-") ? "down" : "up"} s={13} />{delta}</span> : null}
          {sub ? <span>{sub}</span> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

/* ---- Barra de execução orçamentária ---- */
function PExec({ orcado, comprometido, pago, compact, label, showLegend }) {
  const max = Math.max(orcado, comprometido);
  const pct = orcado ? comprometido / orcado : 0;
  const over = comprometido > orcado;
  const warn = !over && pct >= 0.85;
  const w = (v) => (max ? (v / max) * 100 : 0) + "%";
  const h = compact ? 8 : 14;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 4 : 8, minWidth: 0 }}>
      {!compact || label ? (
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
          <span style={{ ...pnT.body, fontWeight: 600, fontSize: compact ? 13 : 14 }}>{label || "Execução do orçado"}</span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: over ? "var(--brick-600)" : warn ? "var(--honey-700)" : "var(--espresso-600)", fontWeight: over || warn ? 700 : 500, fontVariantNumeric: "tabular-nums", display: "inline-flex", gap: 4, alignItems: "center" }}>
            {over ? <PIcon n="alert" s={13} /> : null}{pnFmt.pct(pct)} {over ? `· estourou ${pnFmt.brl(comprometido - orcado)}` : warn ? "· atenção" : ""}
          </span>
        </div>
      ) : null}
      <div role="meter" aria-valuenow={Math.round(pct * 100)} aria-valuemin={0} aria-valuemax={100} style={{ position: "relative", height: h, borderRadius: 999, background: "var(--exec-track)", overflow: "hidden", display: "flex" }}>
        <div style={{ width: w(Math.min(pago, orcado)), background: "var(--exec-paid)" }}></div>
        <div style={{ width: w(Math.max(0, Math.min(comprometido, orcado) - Math.min(pago, orcado))), background: "repeating-linear-gradient(135deg, var(--exec-committed) 0 4px, var(--terra-500) 4px 7px)" }}></div>
        {over ? <div style={{ width: w(comprometido - orcado), background: "repeating-linear-gradient(135deg, var(--exec-over) 0 4px, var(--brick-600) 4px 7px)" }}></div> : null}
        {over ? <div style={{ position: "absolute", left: w(orcado), top: 0, bottom: 0, width: 2, background: "var(--espresso-900)" }}></div> : null}
      </div>
      {showLegend ? (
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: "var(--espresso-600)", fontFamily: "var(--font-body)" }}>
          <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><i style={{ width: 10, height: 10, borderRadius: 3, background: "var(--exec-paid)" }}></i>Pago {pnFmt.brl(pago)}</span>
          <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><i style={{ width: 10, height: 10, borderRadius: 3, background: "repeating-linear-gradient(135deg, var(--exec-committed) 0 3px, var(--terra-500) 3px 5px)" }}></i>Comprometido {pnFmt.brl(comprometido - pago)}</span>
          <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><i style={{ width: 10, height: 10, borderRadius: 3, background: "var(--exec-track)", border: "1px solid var(--sand-400)" }}></i>Livre {pnFmt.brl(Math.max(0, orcado - comprometido))}</span>
        </div>
      ) : null}
    </div>
  );
}

/* ---- Campo monetário ---- */
function PMoney({ label, value, onChange, hint, error, required, size = "md", style }) {
  const [focus, setFocus] = React.useState(false);
  const [raw, setRaw] = React.useState("");
  const shown = focus ? raw : value == null || value === "" ? "" : Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const h = size === "sm" ? 36 : 44;
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0, ...style }}>
      {label ? <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--text-strong)" }}>{label}{required ? <span style={{ color: "var(--brick-600)" }}> *</span> : null}</span> : null}
      <span style={{ display: "flex", alignItems: "center", height: h, borderRadius: "var(--radius-field)", border: `1.5px solid ${error ? "var(--brick-500)" : focus ? "var(--amber-500)" : "var(--border-default)"}`, background: "var(--surface-card)", boxShadow: focus ? "var(--shadow-focus)" : "none", padding: "0 12px", gap: 8, transition: "box-shadow var(--dur-fast)" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--espresso-600)" }}>R$</span>
        <input inputMode="decimal" value={shown} placeholder="0,00" onFocus={() => { setFocus(true); setRaw(value ? String(value).replace(".", ",") : ""); }} onBlur={() => { setFocus(false); const n = parseFloat(raw.replace(/\./g, "").replace(",", ".")); onChange && onChange(isNaN(n) ? "" : n); }} onChange={(e) => setRaw(e.target.value.replace(/[^\d,.]/g, ""))} style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: "transparent", textAlign: "right", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: size === "sm" ? 14 : 16, fontVariantNumeric: "tabular-nums", color: "var(--text-strong)" }} />
      </span>
      {error ? <span style={{ fontSize: 12.5, color: "var(--brick-600)", fontFamily: "var(--font-body)" }}>{error}</span> : hint ? <span style={{ fontSize: 12.5, color: "var(--espresso-600)", fontFamily: "var(--font-body)" }}>{hint}</span> : null}
    </label>
  );
}

/* ---- Popover simples ---- */
function PPop({ trigger, children, align = "left", width = 240 }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => { if (!open) return; const f = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }; document.addEventListener("mousedown", f); return () => document.removeEventListener("mousedown", f); }, [open]);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open ? <div style={{ position: "absolute", top: "calc(100% + 6px)", [align]: 0, width, zIndex: 40, background: "var(--surface-card)", border: "1px solid var(--border-ink)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-badge-sm), var(--shadow-md)", padding: 6, animation: "pnPop var(--dur-base) var(--ease-out)" }} onClick={() => setOpen(false)}>{children}</div> : null}
    </div>
  );
}
function PMenuItem({ icon, children, onClick, danger, active, right }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", minHeight: 40, padding: "0 10px", border: 0, borderRadius: 8, background: active ? "var(--surface-hover)" : "transparent", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: active ? 700 : 500, color: danger ? "var(--brick-600)" : "var(--text-body)", textAlign: "left" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover)")} onMouseLeave={(e) => (e.currentTarget.style.background = active ? "var(--surface-hover)" : "transparent")}>
      {icon ? <PIcon n={icon} s={16} /> : null}<span style={{ flex: 1 }}>{children}</span>{right}
    </button>
  );
}

/* ---- Seletor de edição ---- */
function PEdition({ value, onChange, editions, onInk, compact }) {
  const cur = editions.find((e) => e.id === value) || editions[0];
  return (
    <PPop width={260} trigger={({ toggle, open }) => (
      <button onClick={toggle} aria-haspopup="listbox" aria-expanded={open} style={{ display: "inline-flex", alignItems: "center", gap: 8, height: compact ? 34 : 38, padding: "0 12px 0 14px", borderRadius: 999, border: onInk ? "1.5px solid var(--border-on-ink)" : "1.5px solid var(--border-ink)", background: onInk ? "rgba(245,234,208,.06)" : "var(--surface-card)", color: onInk ? "var(--sand-50)" : "var(--text-strong)", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, boxShadow: onInk ? "none" : "var(--shadow-badge-sm)" }}>
        <span style={{ width: 8, height: 8, borderRadius: 99, background: cur.atual ? "var(--amber-400)" : onInk ? "var(--espresso-400)" : "var(--espresso-500)" }}></span>
        {compact ? cur.id : `Edição ${cur.id}`}
        <PIcon n="cdown" s={14} />
      </button>
    )}>
      <div style={{ ...pnT.eyebrow, padding: "6px 10px 8px" }}>Edição em foco</div>
      {editions.map((e) => (
        <PMenuItem key={e.id} active={e.id === value} onClick={() => onChange(e.id)} right={e.id === value ? <PIcon n="check" s={15} /> : null}>
          <span style={{ display: "flex", flexDirection: "column" }}><span style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>Edição {e.id}</span><span style={{ fontSize: 12, color: "var(--espresso-600)" }}>{e.status}</span></span>
        </PMenuItem>
      ))}
    </PPop>
  );
}

/* ---- Busca e filtros ---- */
function PSearch({ value, onChange, placeholder, style }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 14px", borderRadius: 999, border: "1.5px solid var(--border-default)", background: "var(--surface-card)", minWidth: 0, flex: 1, ...style }}>
      <PIcon n="search" s={16} style={{ color: "var(--espresso-600)" }} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: "transparent", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-strong)" }} />
      {value ? <button onClick={() => onChange("")} aria-label="Limpar busca" style={{ border: 0, background: "transparent", cursor: "pointer", color: "var(--espresso-600)", padding: 0 }}><PIcon n="x" s={15} /></button> : null}
    </label>
  );
}
function PChips({ options, value, onChange, locked }) {
  if (locked) {
    const o = options.find((x) => x.value === locked);
    return <span title="Filtro definido pelo seu papel" style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 40, padding: "0 14px", borderRadius: 999, background: "var(--sand-200)", color: "var(--espresso-700)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}><PIcon n="lock" s={14} />Somente {o ? o.label.toLowerCase() : locked}</span>;
  }
  return (
    <div role="radiogroup" style={{ display: "flex", gap: 4, padding: 4, borderRadius: 999, background: "var(--sand-200)", overflowX: "auto", flex: "none", maxWidth: "100%" }}>
      {options.map((o) => {
        const on = o.value === value;
        return <button key={o.value} role="radio" aria-checked={on} onClick={() => onChange(o.value)} style={{ height: 32, padding: "0 12px", borderRadius: 999, border: 0, cursor: "pointer", whiteSpace: "nowrap", background: on ? "var(--surface-card)" : "transparent", boxShadow: on ? "var(--shadow-xs)" : "none", color: on ? "var(--text-strong)" : "var(--espresso-700)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: on ? 700 : 500, display: "inline-flex", alignItems: "center", gap: 6 }}>{o.label}{o.count != null ? <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--espresso-600)" }}>{o.count}</span> : null}</button>;
      })}
    </div>
  );
}

/* ---- Tabela padrão (DataTable) ---- */
function PTable({ cols, rows, getKey = (r) => r.id, expand, footer, minWidth = 720 }) {
  const { m } = usePn();
  const [open, setOpen] = React.useState(null);
  const th = { ...pnT.eyebrow, fontSize: 11, textAlign: "left", padding: "0 14px", height: 40, background: "var(--sand-100)", borderBottom: "1px solid var(--border-subtle)", whiteSpace: "nowrap", position: "sticky", top: 0 };
  if (m) {
    const title = cols.find((c) => c.mobile === "title"), tag = cols.find((c) => c.mobile === "tag"), metas = cols.filter((c) => c.mobile === "meta");
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        {rows.map((r, i) => {
          const k = getKey(r), isOpen = open === k;
          return (
            <div key={k} style={{ borderTop: i ? "1px solid var(--border-subtle)" : 0 }}>
              <button onClick={() => expand && setOpen(isOpen ? null : k)} style={{ display: "flex", gap: 10, width: "100%", padding: "14px 16px", border: 0, background: isOpen ? "var(--sand-100)" : "transparent", textAlign: "left", cursor: expand ? "pointer" : "default", alignItems: "flex-start", minHeight: 56 }}>
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ ...pnT.body, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title ? title.render(r) : null}</span>
                    {tag ? tag.render(r) : null}
                  </div>
                  <div style={{ display: "flex", gap: "2px 12px", flexWrap: "wrap", ...pnT.muted, fontSize: 12.5 }}>{metas.map((c) => <span key={c.key}>{c.render(r)}</span>)}</div>
                </div>
                {expand ? <PIcon n="cdown" s={18} style={{ color: "var(--espresso-600)", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform var(--dur-base)", marginTop: 2 }} /> : null}
              </button>
              {isOpen ? <div style={{ padding: "4px 16px 16px", background: "var(--sand-100)" }}>{expand(r)}</div> : null}
            </div>
          );
        })}
        {footer}
      </div>
    );
  }
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", minWidth, borderCollapse: "separate", borderSpacing: 0, fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-body)" }}>
        <thead><tr>{expand ? <th style={{ ...th, width: 44, padding: 0 }}></th> : null}{cols.map((c) => <th key={c.key} style={{ ...th, textAlign: c.align || "left", width: c.width }}>{c.label}{c.sort ? <span aria-hidden="true" style={{ marginLeft: 4 }}>↓</span> : null}</th>)}</tr></thead>
        <tbody>
          {rows.map((r) => {
            const k = getKey(r), isOpen = open === k;
            const td = { padding: "0 14px", height: 52, borderBottom: "1px solid var(--border-subtle)", background: isOpen ? "var(--sand-100)" : "transparent", verticalAlign: "middle" };
            return (
              <React.Fragment key={k}>
                <tr onClick={() => expand && setOpen(isOpen ? null : k)} style={{ cursor: expand ? "pointer" : "default" }} onMouseEnter={(e) => { if (!isOpen) [...e.currentTarget.children].forEach((c) => (c.style.background = "var(--surface-hover)")); }} onMouseLeave={(e) => { if (!isOpen) [...e.currentTarget.children].forEach((c) => (c.style.background = "transparent")); }}>
                  {expand ? <td style={{ ...td, padding: "0 0 0 14px" }}><PIcon n="cright" s={16} style={{ color: "var(--espresso-600)", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform var(--dur-base)" }} /></td> : null}
                  {cols.map((c) => <td key={c.key} style={{ ...td, textAlign: c.align || "left", fontVariantNumeric: c.align === "right" ? "tabular-nums" : "normal" }}>{c.render(r)}</td>)}
                </tr>
                {isOpen ? <tr><td colSpan={cols.length + 1} style={{ padding: "4px 20px 20px 58px", background: "var(--sand-100)", borderBottom: "1px solid var(--border-subtle)" }}>{expand(r)}</td></tr> : null}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
      {footer}
    </div>
  );
}
function PTableFoot({ shown, total, children }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "12px 16px", flexWrap: "wrap", ...pnT.muted }}><span>Mostrando <b style={{ color: "var(--text-strong)" }}>{shown}</b> de {total}</span>{children}</div>;
}
function PDefList({ items, cols = 3 }) {
  const { m } = usePn();
  return (
    <dl style={{ display: "grid", gridTemplateColumns: `repeat(${m ? 1 : cols}, minmax(0,1fr))`, gap: m ? 12 : "14px 24px", margin: 0 }}>
      {items.map(([k, v]) => <div key={k} style={{ minWidth: 0 }}><dt style={{ ...pnT.eyebrow, fontSize: 10.5, marginBottom: 3 }}>{k}</dt><dd style={{ margin: 0, ...pnT.body, overflowWrap: "anywhere" }}>{v}</dd></div>)}
    </dl>
  );
}

/* ---- Estados: carregando / vazio / erro / 403 ---- */
function PSkel({ w = "100%", h = 14, r = 6, style }) { return <span style={{ display: "block", width: w, height: h, borderRadius: r, background: "var(--skeleton)", animation: "pnPulse 1.4s ease-in-out infinite", ...style }}></span>; }
function PState({ kind, shape = "table", title, text, action, code }) {
  const { m, role } = usePn();
  const DS = pnDS();
  if (kind === "loading") {
    return (
      <div aria-busy="true" aria-label="Carregando" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {shape !== "table" ? <div style={{ display: "grid", gridTemplateColumns: `repeat(${m ? 2 : 4}, minmax(0,1fr))`, gap: 12 }}>{[0, 1, 2, 3].map((i) => <div key={i} style={{ background: "var(--surface-card)", border: "1px solid var(--border-subtle)", borderRadius: 16, padding: 18, display: "flex", flexDirection: "column", gap: 10 }}><PSkel w="50%" h={10} /><PSkel w="70%" h={26} /><PSkel w="40%" h={10} /></div>)}</div> : null}
        <div style={{ background: "var(--surface-card)", border: "1px solid var(--border-subtle)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ height: 40, background: "var(--sand-100)" }}></div>
          {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} style={{ display: "flex", gap: 16, alignItems: "center", padding: "0 16px", height: 52, borderTop: "1px solid var(--border-subtle)" }}><PSkel w={m ? "55%" : "22%"} /><PSkel w="18%" /><PSkel w="14%" style={{ marginLeft: "auto" }} /></div>)}
        </div>
      </div>
    );
  }
  const cfg = {
    empty: { icon: "inbox", bg: "var(--sand-200)", fg: "var(--espresso-700)", t: title || "Nada por aqui ainda", d: text || "Quando chegarem registros, eles aparecem nesta lista." },
    error: { icon: "alert", bg: "var(--brick-100)", fg: "var(--brick-600)", t: title || "Não deu pra carregar agora", d: text || "O servidor não respondeu. Seus dados estão seguros — tente de novo em instantes." },
    forbidden: { icon: "lock", bg: "var(--sand-200)", fg: "var(--espresso-800)", t: title || "Esta área não faz parte do seu papel", d: text || "Se você precisa deste acesso, peça a alguém com papel admin." },
  }[kind];
  return (
    <div role={kind === "error" ? "alert" : undefined} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12, padding: m ? "40px 20px" : "64px 24px", background: "var(--surface-card)", border: kind === "forbidden" ? "2px solid var(--border-ink)" : "1px dashed var(--border-default)", borderRadius: 16, boxShadow: kind === "forbidden" ? "var(--shadow-badge-sm)" : "none" }}>
      <span style={{ width: 56, height: 56, borderRadius: 99, display: "grid", placeItems: "center", background: cfg.bg, color: cfg.fg }}><PIcon n={cfg.icon} s={24} /></span>
      <h3 style={{ ...pnT.h2, fontSize: 18 }}>{cfg.t}</h3>
      <p style={{ ...pnT.muted, fontSize: 14, margin: 0, maxWidth: 420, textWrap: "pretty" }}>{cfg.d}</p>
      {kind === "forbidden" ? <div style={{ display: "flex", gap: 8, alignItems: "center", ...pnT.muted }}>Seu papel: <PTag k="papel" v={role} /> <span style={{ ...pnT.mono, fontSize: 11 }}>HTTP 403</span></div> : null}
      {kind === "error" ? <code style={{ ...pnT.mono, fontSize: 11.5, background: "var(--sand-100)", padding: "4px 10px", borderRadius: 6 }}>{code || "GET /api · 502 Bad Gateway"}</code> : null}
      {kind === "error" ? <DS.Button variant="outline" size="sm" iconLeft={<PIcon n="refresh" s={15} />}>Tentar de novo</DS.Button> : action || null}
    </div>
  );
}

/* ---- Gráficos (SVG de protótipo; produção = Chart.js com as mesmas cores/tokens) ---- */
function usePnWidth(ref, initial = 600) {
  const [w, setW] = React.useState(initial);
  React.useLayoutEffect(() => { if (!ref.current) return; const ro = new ResizeObserver(([e]) => setW(e.contentRect.width)); ro.observe(ref.current); return () => ro.disconnect(); }, []);
  return w;
}
function PLegend({ items }) {
  return <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--chart-axis)" }}>{items.map((s) => <span key={s.name} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><i style={{ width: 14, height: 0, borderTop: `3px ${s.dash ? "dashed" : "solid"} ${s.color}` }}></i>{s.name}{s.total != null ? <b style={{ color: "var(--text-strong)", fontVariantNumeric: "tabular-nums" }}>{s.total}</b> : null}</span>)}</div>;
}
function PLine({ series, labels, height = 220, yFmt = (v) => v, splitAt, area }) {
  const ref = React.useRef(null);
  const W = usePnWidth(ref);
  const pad = { l: 44, r: 12, t: 10, b: 26 };
  const all = series.flatMap((s) => s.data.filter((v) => v != null));
  const maxV = Math.max(...all, 1) * 1.1;
  const step = Math.pow(10, Math.floor(Math.log10(maxV))) / (maxV / Math.pow(10, Math.floor(Math.log10(maxV))) < 3 ? 2 : 1);
  const ticks = []; for (let v = 0; v <= maxV; v += step) ticks.push(v);
  const n = labels.length, iw = W - pad.l - pad.r, ih = height - pad.t - pad.b;
  const x = (i) => pad.l + (n === 1 ? 0 : (i / (n - 1)) * iw), y = (v) => pad.t + ih - (v / maxV) * ih;
  const every = Math.ceil(n / Math.max(2, Math.floor(iw / 64)));
  return (
    <div ref={ref} style={{ width: "100%" }}>
      <svg width={W} height={height} style={{ display: "block", overflow: "visible" }}>
        {ticks.map((t) => <g key={t}><line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="var(--chart-grid)" /><text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fontFamily="var(--font-body)" fill="var(--chart-axis)">{yFmt(t)}</text></g>)}
        {labels.map((l, i) => i % every === 0 || i === n - 1 ? <text key={i} x={x(i)} y={height - 6} textAnchor="middle" fontSize="11" fontFamily="var(--font-body)" fill="var(--chart-axis)">{l}</text> : null)}
        {splitAt != null ? <g><line x1={x(splitAt)} x2={x(splitAt)} y1={pad.t} y2={pad.t + ih} stroke="var(--espresso-700)" strokeDasharray="2 3" /><text x={x(splitAt) + 6} y={pad.t + 10} fontSize="11" fontFamily="var(--font-mono)" fill="var(--espresso-700)">HOJE</text></g> : null}
        {series.map((s) => {
          const pts = s.data.map((v, i) => (v == null ? null : [x(i), y(v)])).filter(Boolean);
          const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
          return <g key={s.name}>
            {area && pts.length ? <path d={`${d} L${pts[pts.length - 1][0]} ${pad.t + ih} L${pts[0][0]} ${pad.t + ih} Z`} fill={s.color} opacity="0.08" /> : null}
            <path d={d} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={s.dash ? "6 5" : undefined} />
          </g>;
        })}
      </svg>
    </div>
  );
}
function PBars({ items, color = "var(--chart-serie)", fmt = pnFmt.num, max }) {
  const mx = max || Math.max(...items.map((i) => i.v), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((it) => (
        <div key={it.label} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: "4px 12px", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.label}</span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--text-strong)", fontVariantNumeric: "tabular-nums" }}>{fmt(it.v)}</span>
          <span style={{ gridColumn: "1 / -1", height: 8, borderRadius: 99, background: "var(--chart-grid)", overflow: "hidden" }}><span style={{ display: "block", height: "100%", width: (it.v / mx) * 100 + "%", background: it.color || color, borderRadius: 99 }}></span></span>
        </div>
      ))}
    </div>
  );
}
function PCols({ data, labels, height = 160, color = "var(--chart-serie)" }) {
  const mx = Math.max(...data, 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height, borderBottom: "1px solid var(--chart-grid)" }}>
        {data.map((v, i) => <div key={i} title={`${labels[i]}: ${v}`} style={{ flex: 1, height: Math.max(2, (v / mx) * 100) + "%", background: color, borderRadius: "3px 3px 0 0", minWidth: 2 }}></div>)}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-body)", fontSize: 11, color: "var(--chart-axis)" }}><span>{labels[0]}</span><span>{labels[Math.floor(labels.length / 2)]}</span><span>{labels[labels.length - 1]}</span></div>
    </div>
  );
}

/* ---- Diálogo de confirmação destrutiva ---- */
function PConfirm({ open, onClose, onConfirm, title, subject, consequences = [], phrase = "ANONIMIZAR", cta = "Anonimizar definitivamente" }) {
  const DS = pnDS();
  const [txt, setTxt] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => { if (open) { setTxt(""); setBusy(false); } }, [open]);
  const ok = txt.trim().toUpperCase() === phrase;
  return (
    <DS.Dialog open={open} onClose={onClose} size="sm" title={title} closeOnBackdrop={false}
      footer={<div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap", width: "100%" }}><DS.Button variant="ghost" onClick={onClose}>Cancelar</DS.Button><DS.Button variant="danger" disabled={!ok || busy} iconLeft={<PIcon n={busy ? "loader" : "trash"} s={16} style={busy ? { animation: "pnSpin 0.9s linear infinite" } : null} />} onClick={() => { setBusy(true); setTimeout(() => onConfirm && onConfirm(), 900); }}>{busy ? "Anonimizando…" : cta}</DS.Button></div>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {subject ? <div style={{ ...pnT.body }}>Titular: <b>{subject}</b></div> : null}
        <div style={{ background: "var(--brick-100)", color: "var(--brick-600)", borderRadius: 12, padding: "12px 14px", display: "flex", gap: 10, fontFamily: "var(--font-body)", fontSize: 13.5, lineHeight: 1.5 }}>
          <PIcon n="alert" s={18} style={{ marginTop: 1 }} />
          <div><b>Esta ação não pode ser desfeita.</b><ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>{consequences.map((c) => <li key={c}>{c}</li>)}</ul></div>
        </div>
        <DS.Input label={`Para confirmar, digite ${phrase}`} value={txt} onChange={(e) => setTxt(e.target.value)} placeholder={phrase} autoComplete="off" />
      </div>
    </DS.Dialog>
  );
}

/* ---- Cartão de material ---- */
function PMaterial({ mat, onCopy, layout = "card" }) {
  const DS = pnDS();
  const { m } = usePn();
  const icon = { deck: "presentation", relatorio: "file", impresso: "printer", links: "link" }[mat.tipo];
  const row = layout === "row" && !m;
  return (
    <article style={{ background: "var(--surface-card)", border: "1px solid var(--border-subtle)", borderRadius: 16, padding: m ? 14 : 18, display: "flex", flexDirection: row ? "row" : "column", alignItems: row ? "center" : "stretch", gap: row ? 16 : 12, minWidth: 0, boxShadow: "var(--shadow-xs)" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flex: 1, minWidth: 0 }}>
        <span style={{ width: 40, height: 40, borderRadius: 12, flex: "none", display: "grid", placeItems: "center", background: "var(--sand-200)", color: "var(--espresso-800)" }}><PIcon n={icon} s={20} /></span>
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          <h3 style={{ ...pnT.h2, fontSize: 15.5 }}>{mat.titulo}</h3>
          <p style={{ ...pnT.muted, margin: 0, textWrap: "pretty" }}>{mat.desc}</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}><PTag k="material" v={mat.tipo} size="sm" />{mat.pdf ? <span style={{ ...pnT.mono, fontSize: 11, alignSelf: "center" }}>+ versão PDF</span> : null}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: row ? "flex-end" : "flex-start", paddingTop: row ? 0 : 4, borderTop: row ? 0 : "1px solid var(--border-subtle)", paddingBlockStart: row ? 0 : 12 }}>
        <DS.Button size="sm" variant="secondary" iconRight={<PIcon n="ext" s={14} />}>Abrir</DS.Button>
        {mat.pdf ? <DS.Button size="sm" variant="outline" iconLeft={<PIcon n="printer" s={14} />}>PDF</DS.Button> : null}
        <DS.Button size="sm" variant="ghost" iconLeft={<PIcon n="link" s={14} />} onClick={() => onCopy && onCopy(mat)}>Copiar link</DS.Button>
      </div>
    </article>
  );
}

Object.assign(window, { pnDS, PIcon, pnFmt, PnCtx, usePn, pnT, PN_TAGS, PN_FUNIL_ORDEM, PTag, PPanel, PPage, PKpi, PExec, PMoney, PPop, PMenuItem, PEdition, PSearch, PChips, PTable, PTableFoot, PDefList, PSkel, PState, PLine, PLegend, PBars, PCols, PConfirm, PMaterial });
