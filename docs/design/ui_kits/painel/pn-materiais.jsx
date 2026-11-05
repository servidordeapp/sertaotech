/* Painel interno — tela nova: Apresentações (hub de materiais). */
function PnShareDialog({ mat, onClose }) {
  const DS = pnDS();
  const { toast } = usePn();
  const [ver, setVer] = React.useState("web");
  const [val, setVal] = React.useState("30 dias");
  if (!mat) return null;
  const link = `https://painel.sertaotech.com.br/m/${mat.id}-${ver === "pdf" ? "pdf-" : ""}7Kq2xa`;
  return (
    <DS.Dialog open={!!mat} onClose={onClose} size="sm" title="Link para enviar" description={mat.titulo}
      footer={<div style={{ display: "flex", gap: 8, justifyContent: "flex-end", width: "100%" }}><DS.Button variant="ghost" onClick={onClose}>Fechar</DS.Button><DS.Button iconLeft={<PIcon n="copy" s={16} />} onClick={() => { onClose(); toast({ variant: "success", title: "Link copiado", description: `Válido por ${val}. Revogue quando quiser em Links ativos.` }); }}>Copiar link</DS.Button></div>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {mat.pdf ? <div style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600 }}>Versão</span><PChips options={[{ value: "web", label: "Apresentação" }, { value: "pdf", label: "PDF para imprimir" }]} value={ver} onChange={setVer} /></div> : null}
        <DS.Select label="Validade do link" options={["7 dias", "30 dias", "Até o fim da edição"]} value={val} onChange={(e) => setVal(e.target.value)} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 44, padding: "0 12px", borderRadius: 12, background: "var(--sand-100)", border: "1px solid var(--border-subtle)" }}><PIcon n="link" s={15} style={{ color: "var(--espresso-600)" }} /><span style={{ ...pnT.mono, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{link}</span></div>
        <p style={{ ...pnT.muted, margin: 0, fontSize: 12.5 }}>Quem receber vê só este material, sem login e sem acesso ao painel. Cada abertura fica registrada.</p>
      </div>
    </DS.Dialog>
  );
}

function PnApresentacoes() {
  const DS = pnDS();
  const { m, role, st, ed } = usePn();
  const D = window.PN_DATA;
  const [q, setQ] = React.useState("");
  const [fe, setFe] = React.useState("todas");
  const [ft, setFt] = React.useState("Todos os tipos");
  const [share, setShare] = React.useState(null);
  const tipoMap = { "Deck reveal.js": "deck", "Relatório": "relatorio", "Impresso": "impresso", "Página de links": "links" };
  const groups = [
    { id: ed, label: `Edição ${ed}`, atual: ed === "2027", note: ed === "2027" ? "Edição atual" : null },
    ...D.edicoes.filter((e) => e.id !== ed).map((e) => ({ id: e.id, label: `Edição ${e.id}` })),
    { id: "operacao", label: "Operação", note: "Vale para qualquer edição" },
  ];
  const filt = (g) => D.materiais.filter((x) => x.edicao === g.id && (st !== "empty") && (ft === "Todos os tipos" || x.tipo === tipoMap[ft]) && (!q || (x.titulo + x.desc).toLowerCase().includes(q.toLowerCase())));
  const shown = groups.filter((g) => fe === "todas" || g.id === fe);
  return (
    <PPage eyebrow="Evento · materiais" title="Apresentações" desc="Decks, relatórios e impressos do evento — agora atrás do login. Para mandar a alguém de fora, gere um link." actions={role === "admin" && st === "ok" ? <DS.Button size="sm" variant="outline" iconLeft={<PIcon n="plus" s={15} />}>Adicionar material</DS.Button> : null}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <PSearch value={q} onChange={setQ} placeholder="Buscar material" style={{ minWidth: m ? "100%" : 240 }} />
        <PChips options={[{ value: "todas", label: "Todas" }, ...groups.map((g) => ({ value: g.id, label: g.id === "operacao" ? "Operação" : g.id }))]} value={fe} onChange={setFe} />
        <div style={{ width: m ? "100%" : 200 }}><DS.Select size="sm" options={["Todos os tipos", ...Object.keys(tipoMap)]} value={ft} onChange={(e) => setFt(e.target.value)} aria-label="Tipo" /></div>
      </div>
      {st !== "ok" && st !== "empty" ? <PState kind={st} shape="table" /> : shown.map((g) => {
        const items = filt(g);
        return (
          <section key={g.id} style={{ display: "flex", flexDirection: "column", gap: 12, ...(g.atual ? { background: "var(--surface-card)", border: "2px solid var(--border-ink)", borderRadius: 20, boxShadow: "var(--shadow-badge)", padding: m ? 14 : 20 } : {}) }}>
            <header style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h2 style={{ ...pnT.h2, fontSize: g.atual ? 22 : 18 }}>{g.label}</h2>
              {g.atual ? <span style={{ ...pnT.eyebrow, fontWeight: 700, color: "var(--espresso-900)", background: "var(--amber-300)", padding: "3px 8px", borderRadius: 999 }}>{g.note}</span> : g.note ? <span style={pnT.muted}>{g.note}</span> : null}
              <span style={{ ...pnT.mono, fontSize: 11, marginLeft: "auto", color: "var(--espresso-600)" }}>{items.length} {items.length === 1 ? "material" : "materiais"}</span>
            </header>
            {items.length ? (
              <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${m ? 240 : 300}px, 1fr))`, gap: 12 }}>{items.map((x) => <PMaterial key={x.id} mat={x} onCopy={setShare} />)}</div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 20px", borderRadius: 16, border: "1px dashed var(--border-default)", background: g.atual ? "var(--sand-100)" : "transparent", flexWrap: "wrap" }}>
                <span style={{ width: 40, height: 40, borderRadius: 99, background: "var(--sand-200)", display: "grid", placeItems: "center", color: "var(--espresso-700)" }}><PIcon n="presentation" s={18} /></span>
                <div style={{ flex: 1, minWidth: 180 }}><div style={{ ...pnT.body, fontWeight: 600 }}>{q || ft !== "Todos os tipos" ? "Nada com esse filtro" : `${g.label} ainda não tem material`}</div><div style={pnT.muted}>{q || ft !== "Todos os tipos" ? "Limpe a busca ou troque o tipo." : "Quando o kit da edição sair, ele aparece aqui."}</div></div>
                {role === "admin" && !q ? <DS.Button size="sm" variant="ghost" iconLeft={<PIcon n="plus" s={14} />}>Adicionar</DS.Button> : null}
              </div>
            )}
          </section>
        );
      })}
      <PnShareDialog mat={share} onClose={() => setShare(null)} />
    </PPage>
  );
}

Object.assign(window, { PnApresentacoes, PnShareDialog });
