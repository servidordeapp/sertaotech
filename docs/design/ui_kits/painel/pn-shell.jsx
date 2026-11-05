/* Painel interno — shell, navegação e login. */
const PN_NAV = [
  { id: "pessoas", label: "Pessoas", items: [{ id: "inscricoes", label: "Inscrições", icon: "users" }, { id: "emails", label: "E-mails", icon: "mail" }, { id: "lgpd", label: "LGPD", icon: "shield" }] },
  { id: "evento", label: "Evento", items: [{ id: "metricas", label: "Métricas", icon: "chart" }, { id: "apresentacoes", label: "Apresentações", icon: "presentation" }] },
  { id: "financas", label: "Finanças", items: [{ id: "orcamento", label: "Orçamento", icon: "wallet" }] },
];
const PN_ACCESS = {
  inscricoes: ["admin", "comercial", "curadoria"],
  metricas: ["admin", "comercial", "curadoria"],
  emails: ["admin"],
  lgpd: ["admin"],
  apresentacoes: ["admin", "comercial", "curadoria", "financeiro"],
  orcamento: ["admin", "financeiro", "comercial"],
};
const PN_MOBILE_PRIO = { admin: ["inscricoes", "metricas", "orcamento", "apresentacoes"], comercial: ["inscricoes", "orcamento", "apresentacoes", "metricas"], curadoria: ["inscricoes", "apresentacoes", "metricas"], financeiro: ["orcamento", "apresentacoes"] };
const pnCan = (role, id) => (PN_ACCESS[id] || []).includes(role);
const pnNavFor = (role) => PN_NAV.map((g) => ({ ...g, items: g.items.filter((i) => pnCan(role, i.id)) })).filter((g) => g.items.length);
const pnItem = (id) => PN_NAV.flatMap((g) => g.items).find((i) => i.id === id);

function PnLogo({ size = 34, light = true, sub = "Painel" }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <img src="../../assets/logo.png" alt="" style={{ height: size, display: "block" }} />
      <span style={{ display: "flex", flexDirection: "column", lineHeight: 1, whiteSpace: "nowrap" }}>
        <span style={{ fontFamily: "var(--font-wordmark)", fontWeight: 800, fontSize: size * 0.5, textTransform: "uppercase", color: light ? "var(--sand-50)" : "var(--espresso-900)", letterSpacing: "0.01em" }}>Sertão Tech</span>
        {sub ? <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: light ? "var(--amber-300)" : "var(--terra-600)", marginTop: 3 }}>// {sub}</span> : null}
      </span>
    </span>
  );
}

function PnUser({ role, name, compact, onLogout }) {
  return (
    <PPop align="right" width={240} trigger={({ toggle }) => (
      <button onClick={toggle} aria-label="Conta" style={{ display: "inline-flex", alignItems: "center", gap: 10, height: 40, padding: compact ? 0 : "0 6px 0 0", border: 0, background: "transparent", cursor: "pointer", color: "var(--sand-50)" }}>
        <span style={{ width: 34, height: 34, borderRadius: 99, background: "var(--amber-300)", color: "var(--espresso-900)", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>{name.split(" ").map((p) => p[0]).slice(0, 2).join("")}</span>
        {!compact ? <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3 }}><span style={{ fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 600 }}>{name}</span></span> : null}
        {!compact ? <PIcon n="cdown" s={14} /> : null}
      </button>
    )}>
      <div style={{ padding: "8px 10px 10px", display: "flex", flexDirection: "column", gap: 6, borderBottom: "1px solid var(--border-subtle)", marginBottom: 6 }}>
        <span style={{ ...pnT.body, fontWeight: 600 }}>{name}</span>
        <span style={{ ...pnT.muted, fontSize: 12 }}>{name.split(" ")[0].toLowerCase()}@sertaotech.com.br</span>
        <span><PTag k="papel" v={role} size="sm" /></span>
      </div>
      <PMenuItem icon="logout" onClick={onLogout}>Sair</PMenuItem>
    </PPop>
  );
}

function PnShell({ screen, go, role, edition, setEdition, onLogout, children }) {
  const { m } = usePn();
  const D = window.PN_DATA;
  const nav = pnNavFor(role);
  const name = D.usuarios[role];
  const edDisabled = screen === "lgpd" || screen === "emails";
  const [more, setMore] = React.useState(false);
  const [vw, setVw] = React.useState(window.innerWidth);
  React.useEffect(() => { const f = () => setVw(window.innerWidth); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []);
  const narrow = vw < 1180;
  const edSel = edDisabled
    ? <span title="Esta tela vale para todas as edições" style={{ display: "inline-flex", alignItems: "center", gap: 6, height: m ? 34 : 38, padding: "0 12px", borderRadius: 999, border: "1.5px dashed var(--border-on-ink)", color: "var(--text-on-ink-muted)", fontFamily: "var(--font-body)", fontSize: 13 }}><PIcon n="layers" s={14} />{m ? "Todas" : "Todas as edições"}</span>
    : <PEdition value={edition} onChange={setEdition} editions={D.edicoes} onInk compact={m} />;

  if (m) {
    const prio = (PN_MOBILE_PRIO[role] || []).filter((id) => pnCan(role, id));
    const all = nav.flatMap((g) => g.items);
    const showMore = all.length > prio.length;
    const tabs = prio.map(pnItem);
    const inMore = !prio.includes(screen);
    return (
      <div style={{ minHeight: "100%", background: "var(--surface-page)", display: "flex", flexDirection: "column" }}>
        <header style={{ position: "sticky", top: 0, zIndex: 20, height: 56, background: "var(--surface-ink)", display: "flex", alignItems: "center", gap: 10, padding: "0 12px 0 14px" }}>
          <PnLogo size={30} sub={null} />
          <span style={{ flex: 1 }}></span>
          {edSel}
          <PnUser role={role} name={name} compact onLogout={onLogout} />
        </header>
        <main style={{ flex: 1 }}>{children}</main>
        <nav aria-label="Navegação principal" style={{ position: "sticky", bottom: 0, zIndex: 20, background: "var(--surface-card)", borderTop: "1px solid var(--border-subtle)", display: "grid", gridTemplateColumns: `repeat(${tabs.length + (showMore ? 1 : 0)}, minmax(0,1fr))`, padding: "6px 4px 10px", boxShadow: "0 -4px 16px rgba(60,33,11,.06)" }}>
          {tabs.map((it) => <PnTab key={it.id} it={it} on={screen === it.id} onClick={() => go(it.id)} />)}
          {showMore ? <PnTab it={{ label: "Mais", icon: "grid" }} on={inMore} onClick={() => setMore(true)} /> : null}
        </nav>
        {more ? (
          <div onClick={() => setMore(false)} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(31,19,5,.55)", display: "flex", alignItems: "flex-end", animation: "pnFade var(--dur-base)" }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", background: "var(--surface-card)", borderRadius: "20px 20px 0 0", padding: "10px 16px 24px", animation: "pnUp var(--dur-slow) var(--ease-out)" }}>
              <div style={{ width: 40, height: 4, borderRadius: 4, background: "var(--sand-400)", margin: "0 auto 14px" }}></div>
              {nav.map((g) => (
                <div key={g.id} style={{ marginBottom: 12 }}>
                  <div style={{ ...pnT.eyebrow, padding: "0 6px 6px" }}>{g.label}</div>
                  {g.items.map((it) => <PMenuItem key={it.id} icon={it.icon} active={screen === it.id} onClick={() => { go(it.id); setMore(false); }} right={<PIcon n="cright" s={16} />}>{it.label}</PMenuItem>)}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  }
  return (
    <div style={{ minHeight: "100%", background: "var(--surface-page)", display: "flex", flexDirection: "column" }}>
      <header style={{ background: "var(--surface-ink)", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ height: 64, display: "flex", alignItems: "center", gap: 20, padding: "0 28px", maxWidth: 1360, margin: "0 auto", boxSizing: "border-box" }}>
          <PnLogo />
          <span style={{ width: 1, height: 28, background: "var(--border-on-ink)" }}></span>
          {edSel}
          <span style={{ flex: 1 }}></span>
          <PTag k="papel" v={role} size="sm" style={{ background: role === "admin" ? "var(--sand-50)" : undefined, color: role === "admin" ? "var(--espresso-900)" : undefined }} />
          <PnUser role={role} name={name} onLogout={onLogout} />
        </div>
        <nav aria-label="Navegação principal" style={{ background: "var(--surface-card)", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "stretch", gap: 4, padding: "0 28px", maxWidth: 1360, margin: "0 auto", boxSizing: "border-box", height: 52, overflowX: "auto", scrollbarWidth: "none" }}>
            {nav.map((g, gi) => (
              <div key={g.id} style={{ display: "flex", alignItems: "stretch", gap: 2 }}>
                {gi ? <span style={{ width: 1, background: "var(--border-subtle)", margin: narrow ? "14px 6px" : "14px 12px" }}></span> : null}
                {!narrow ? <span style={{ ...pnT.eyebrow, fontSize: 10, alignSelf: "center", marginRight: 6, color: "var(--espresso-500)" }}>{g.label}</span> : null}
                {g.items.map((it) => {
                  const on = screen === it.id;
                  return <button key={it.id} onClick={() => go(it.id)} aria-current={on ? "page" : undefined} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: narrow ? "0 9px" : "0 12px", border: 0, background: "transparent", cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: on ? 700 : 500, fontSize: 14.5, color: on ? "var(--text-strong)" : "var(--espresso-700)", boxShadow: on ? "inset 0 -3px 0 var(--brand-primary)" : "none", whiteSpace: "nowrap" }}><PIcon n={it.icon} s={16} style={{ color: on ? "var(--brand-primary)" : "currentColor" }} />{it.label}</button>;
                })}
              </div>
            ))}
          </div>
        </nav>
      </header>
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
function PnTab({ it, on, onClick }) {
  return <button onClick={onClick} aria-current={on ? "page" : undefined} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minHeight: 48, border: 0, background: "transparent", cursor: "pointer", color: on ? "var(--brand-primary)" : "var(--espresso-700)", fontFamily: "var(--font-body)", fontSize: 11.5, fontWeight: on ? 700 : 500, padding: "4px 0" }}>
    <span style={{ width: 52, height: 28, borderRadius: 99, display: "grid", placeItems: "center", background: on ? "var(--terra-100)" : "transparent" }}><PIcon n={it.icon} s={19} /></span>{it.label}
  </button>;
}

function PnLogin({ variant = "ok", onLogin }) {
  const DS = pnDS();
  const { m } = usePn();
  const [st, setSt] = React.useState(variant);
  React.useEffect(() => setSt(variant), [variant]);
  const sending = st === "enviando";
  return (
    <div style={{ minHeight: "100%", background: "var(--surface-page)", display: "grid", placeItems: "center", padding: m ? "32px 16px" : 48, boxSizing: "border-box" }}>
      <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", justifyContent: "center" }}><PnLogo size={52} light={false} sub="Painel interno" /></div>
        <form onSubmit={(e) => { e.preventDefault(); setSt("enviando"); setTimeout(() => onLogin && onLogin(), 900); }} style={{ background: "var(--surface-card)", border: "2px solid var(--border-ink)", borderRadius: 20, boxShadow: "var(--shadow-badge)", padding: m ? 20 : 28, display: "flex", flexDirection: "column", gap: 16 }}>
          <div><h1 style={{ ...pnT.h1, fontSize: 24 }}>Entrar</h1><p style={{ ...pnT.muted, margin: "4px 0 0" }}>Acesso restrito à organização do evento.</p></div>
          {st === "erro" ? <div role="alert" style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "var(--brick-100)", color: "var(--brick-600)", borderRadius: 12, padding: "10px 12px", fontFamily: "var(--font-body)", fontSize: 13.5, lineHeight: 1.45 }}><PIcon n="alert" s={17} style={{ marginTop: 1 }} /><span><b>E-mail ou senha não conferem.</b> Confira e tente de novo — após 5 tentativas o acesso fica bloqueado por 15 min.</span></div> : null}
          <DS.Input label="E-mail" type="email" defaultValue={st === "erro" ? "marina@sertaotech.com.br" : ""} placeholder="voce@sertaotech.com.br" disabled={sending} iconLeft={<PIcon n="mail" s={16} />} />
          <DS.Input label="Senha" type="password" defaultValue={st !== "ok" ? "••••••••••" : ""} disabled={sending} error={st === "erro" ? " " : undefined} iconLeft={<PIcon n="lock" s={16} />} />
          <DS.Button type="submit" size="lg" fullWidth disabled={sending} iconLeft={sending ? <PIcon n="loader" s={18} style={{ animation: "pnSpin .9s linear infinite" }} /> : null}>{sending ? "Entrando…" : "Entrar"}</DS.Button>
          <a href="#" onClick={(e) => e.preventDefault()} style={{ alignSelf: "center", fontFamily: "var(--font-body)", fontSize: 13.5 }}>Esqueci minha senha</a>
        </form>
        <p style={{ ...pnT.muted, fontSize: 12, textAlign: "center", margin: 0 }}>Os acessos a dados pessoais ficam registrados (LGPD).</p>
      </div>
    </div>
  );
}

Object.assign(window, { PN_NAV, PN_ACCESS, pnCan, pnNavFor, pnItem, PnLogo, PnShell, PnLogin });
