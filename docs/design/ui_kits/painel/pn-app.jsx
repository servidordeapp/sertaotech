/* Painel interno — app de protótipo com barra de revisão (tela · papel · dispositivo · estado). */
const PN_SCREENS = { inscricoes: PnInscricoes, metricas: PnMetricas, emails: PnEmails, lgpd: PnLgpd, apresentacoes: PnApresentacoes, orcamento: PnOrcamento };
const PN_KEY = "pn-proto-v1";

function PnSeg({ label, value, options, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--text-on-ink-muted)" }}>{label}</span>
      <div style={{ display: "flex", gap: 2, padding: 3, borderRadius: 999, background: "rgba(245,234,208,.08)" }}>
        {options.map(([v, l]) => <button key={v} onClick={() => onChange(v)} style={{ height: 26, padding: "0 10px", borderRadius: 999, border: 0, cursor: "pointer", background: value === v ? "var(--amber-300)" : "transparent", color: value === v ? "var(--espresso-900)" : "var(--sand-100)", fontFamily: "var(--font-body)", fontSize: 12, fontWeight: value === v ? 700 : 500, whiteSpace: "nowrap" }}>{l}</button>)}
      </div>
    </div>
  );
}

function PnApp() {
  const DS = pnDS();
  const saved = (() => { try { return JSON.parse(localStorage.getItem(PN_KEY)) || {}; } catch (e) { return {}; } })();
  const [screen, setScreen] = React.useState(saved.screen || "inscricoes");
  const [role, setRole] = React.useState(saved.role || "admin");
  const [dev, setDev] = React.useState(saved.dev || "desktop");
  const [st, setSt] = React.useState(saved.st || "ok");
  const [ed, setEd] = React.useState("2027");
  const [toasts, setToasts] = React.useState([]);
  React.useEffect(() => { localStorage.setItem(PN_KEY, JSON.stringify({ screen, role, dev, st })); }, [screen, role, dev, st]);
  const toast = React.useCallback((t) => { const id = Math.random(); setToasts((ts) => [...ts, { ...t, id }]); setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 3800); }, []);
  const m = dev === "mobile";
  const allowed = screen === "login" || pnCan(role, screen);
  const effSt = !allowed ? "forbidden" : st;
  const Screen = PN_SCREENS[screen];
  const loginVariant = st === "error" ? "erro" : st === "loading" ? "enviando" : "ok";
  const ctx = { m, role, st: effSt, ed, toast };
  const content = (
    <PnCtx.Provider value={ctx}>
      {screen === "login" ? <PnLogin variant={loginVariant} onLogin={() => setScreen(pnNavFor(role)[0].items[0].id)} /> : (
        <PnShell screen={screen} go={setScreen} role={role} edition={ed} setEdition={setEd} onLogout={() => setScreen("login")}>
          {effSt === "forbidden" ? <PPage eyebrow="Acesso" title={(pnItem(screen) || {}).label}><PState kind="forbidden" /></PPage> : <Screen key={screen + role + ed} />}
        </PnShell>
      )}
      <DS.ToastViewport position={m ? "top-right" : "bottom-right"}>{toasts.map((t) => <DS.Toast key={t.id} variant={t.variant} title={t.title} description={t.description} onClose={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))} />)}</DS.ToastViewport>
    </PnCtx.Provider>
  );
  const scrOpts = [["login", "Login"], ...PN_NAV.flatMap((g) => g.items.map((i) => [i.id, i.label]))];
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: m ? "var(--sand-200)" : "var(--surface-page)" }}>
      <div data-spec-toolbar="" style={{ background: "var(--espresso-950)", padding: "10px 20px", display: "flex", gap: "10px 22px", flexWrap: "wrap", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--amber-300)", letterSpacing: ".12em" }}>// PROTÓTIPO</span>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--text-on-ink-muted)" }}>Tela</span>
          <select value={screen} onChange={(e) => setScreen(e.target.value)} style={{ height: 30, borderRadius: 999, border: "1px solid var(--border-on-ink)", background: "var(--espresso-900)", color: "var(--sand-50)", padding: "0 10px", fontFamily: "var(--font-body)", fontSize: 12.5 }}>{scrOpts.map(([v, l]) => <option key={v} value={v}>{l}{v !== "login" && !pnCan(role, v) ? " (sem acesso)" : ""}</option>)}</select>
        </label>
        <PnSeg label="Papel" value={role} onChange={setRole} options={[["admin", "admin"], ["financeiro", "financeiro"], ["comercial", "comercial"], ["curadoria", "curadoria"]]} />
        <PnSeg label="Dispositivo" value={dev} onChange={setDev} options={[["desktop", "Desktop"], ["mobile", "Celular"]]} />
        <PnSeg label="Estado" value={st} onChange={setSt} options={[["ok", "Normal"], ["loading", "Carregando"], ["empty", "Vazio"], ["error", "Erro de API"], ["forbidden", "403"]]} />
        <a href="Especificacao.html" style={{ marginLeft: "auto", fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--amber-300)" }}>Especificação →</a>
      </div>
      {m ? (
        <div style={{ flex: 1, display: "grid", placeItems: "start center", padding: "28px 16px" }}>
          <div style={{ width: 390, height: 844, borderRadius: 44, border: "10px solid var(--espresso-900)", boxShadow: "var(--shadow-xl)", overflow: "hidden", background: "var(--surface-page)", position: "relative", transform: "translateZ(0)" }}>
            <div style={{ position: "absolute", inset: 0, overflowY: "auto", scrollbarWidth: "none" }}>{content}</div>
          </div>
        </div>
      ) : <div style={{ flex: 1, position: "relative" }}>{content}</div>}
    </div>
  );
}

Object.assign(window, { PnApp, PN_SCREENS });
