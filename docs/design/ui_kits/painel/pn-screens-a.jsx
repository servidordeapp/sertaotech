/* Painel interno — telas existentes redesenhadas: Inscrições, Métricas, E-mails, LGPD. */
function pnGate(st, shape, empty) {
  if (st === "ok") return null;
  if (st === "empty") return <PState kind="empty" {...empty} />;
  return <PState kind={st} shape={shape} />;
}
const PN_TIPOS = [{ value: "todos", label: "Todos" }, { value: "participante", label: "Participante" }, { value: "palestrante", label: "Palestrante" }, { value: "patrocinador", label: "Patrocinador" }];
const pnRoleTipo = { comercial: "patrocinador", curadoria: "palestrante" };

function PnInscricoes() {
  const DS = pnDS();
  const { m, role, st, ed, toast } = usePn();
  const D = window.PN_DATA;
  const locked = pnRoleTipo[role];
  const [q, setQ] = React.useState("");
  const [tipo, setTipo] = React.useState("todos");
  const t = locked || tipo;
  const base = D.inscritos.filter((r) => !locked || r.tipo === locked);
  const rows = base.filter((r) => (t === "todos" || r.tipo === t) && (!q || (r.nome + r.cidade + r.email).toLowerCase().includes(q.toLowerCase())));
  const opts = PN_TIPOS.map((o) => ({ ...o, count: o.value === "todos" ? base.length : base.filter((r) => r.tipo === o.value).length }));
  const cols = [
    { key: "nome", label: "Nome", mobile: "title", render: (r) => <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 600, color: "var(--text-strong)" }}>{r.nome}{r.reinscricao ? <span title="Reinscrição — já esteve em edição anterior" style={{ ...pnT.mono, fontSize: 10, letterSpacing: ".08em", color: "var(--terra-700)", background: "var(--terra-100)", padding: "2px 6px", borderRadius: 4 }}>REINSCR.</span> : null}</span> },
    { key: "email", label: "E-mail", mobile: "meta", render: (r) => <span style={{ ...pnT.mono, fontSize: 12.5 }}>{r.email}</span> },
    { key: "cidade", label: "Cidade", mobile: "meta", render: (r) => r.cidade },
    { key: "tipo", label: "Tipo", mobile: "tag", render: (r) => <PTag k="tipo" v={r.tipo} size="sm" /> },
    { key: "data", label: "Inscrição", sort: true, mobile: "meta", render: (r) => pnFmt.dt(r.data) },
  ];
  const detail = (r) => {
    const extra = r.tipo === "participante" ? [["Perfil", r.perfil], ["Experiência", r.experiencia], ["Interesse", r.interesse]] : r.tipo === "palestrante" ? [["Tema proposto", r.tema], ["Experiência em palco", r.palco], ["Formato", r.formato]] : [["Empresa", r.empresa], ["Cota pretendida", r.cota], ["Cargo", r.cargo]];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 12 }}>
        <PDefList items={[["Telefone", <span style={pnT.mono}>{r.tel}</span>], ["Inscrição", `#${r.id} · ${pnFmt.dt(r.data)}`], ["Edições", r.reinscricao ? "2026, 2027" : ed], ...extra]} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <DS.Button size="sm" variant="outline" iconLeft={<PIcon n="eye" s={14} />} onClick={() => toast({ variant: "info", title: "Contato revelado", description: "Acesso registrado no histórico LGPD." })}>Revelar contato</DS.Button>
          {r.tipo === "patrocinador" && pnCan(role, "orcamento") ? <DS.Button size="sm" variant="secondary" iconLeft={<PIcon n="wallet" s={14} />} onClick={() => toast({ variant: "success", title: "Receita prevista criada", description: `${r.empresa} · cota ${r.cota} entrou no funil como Prospecção.` })}>Virar receita prevista</DS.Button> : null}
          <span style={{ ...pnT.muted, fontSize: 12 }}>Revelar contato fica registrado no histórico de acesso.</span>
        </div>
      </div>
    );
  };
  return (
    <PPage eyebrow={`Pessoas · lista de espera ${ed}`} title="Inscrições" desc={locked ? `Você vê apenas inscrições de ${locked}s, conforme o seu papel.` : "Quem entrou na lista de espera da edição. Contatos aparecem mascarados até você abrir o detalhe."} actions={st === "ok" ? <DS.Button size="sm" variant="outline" iconLeft={<PIcon n="download" s={15} />} onClick={() => toast({ variant: "success", title: "CSV gerado", description: `${rows.length} linhas · filtro atual aplicado.` })}>Exportar CSV</DS.Button> : null}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <PSearch value={q} onChange={setQ} placeholder="Buscar por nome, cidade ou e-mail" style={{ minWidth: m ? "100%" : 280 }} />
        <PChips options={opts} value={tipo} onChange={setTipo} locked={locked} />
      </div>
      {pnGate(st, "table", { title: `Nenhuma inscrição em ${ed} ainda`, text: "A lista abre quando o formulário da edição for publicado no site." }) || (
        <PPanel pad={false}>
          {rows.length ? <PTable cols={cols} rows={rows} expand={detail} footer={<PTableFoot shown={rows.length} total={base.length}><span style={{ display: "flex", gap: 6 }}><DS.Button size="sm" variant="ghost" disabled>Anterior</DS.Button><DS.Button size="sm" variant="ghost">Próxima</DS.Button></span></PTableFoot>} /> : <div style={{ padding: 24 }}><PState kind="empty" title="Nada encontrado" text={`Nenhuma inscrição bate com “${q}”. Tente outro termo ou limpe o filtro.`} /></div>}
        </PPanel>
      )}
    </PPage>
  );
}

function PnMetricas() {
  const { m, role, st, ed } = usePn();
  const D = window.PN_DATA, M = D.metricas;
  const only = pnRoleTipo[role];
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const tot = { participante: 859, palestrante: 47, patrocinador: 24 };
  const ser = [["participante", "Participantes", "var(--chart-participante)"], ["palestrante", "Palestrantes", "var(--chart-palestrante)"], ["patrocinador", "Patrocinadores", "var(--chart-patrocinador)"]].filter(([k]) => !only || k === only);
  const kpis = [
    !only && { label: "Total na lista", value: pnFmt.num(930), delta: "+18%", sub: "vs. 30 dias antes", icon: "users" },
    ...ser.map(([k, l]) => ({ label: l, value: pnFmt.num(tot[k]), sub: `${sum(M.series[k])} nos últimos 30 dias` })),
    { label: "Reinscrições", value: only ? (only === "palestrante" ? "12" : "8") : "214", sub: only ? "vieram em 2026" : "23% do total · vieram em 2026", icon: "refresh" },
  ].filter(Boolean);
  const bars = [
    !only && ["Cidades", "Participantes por cidade", M.cidades],
    !only && ["Perfil", "Participantes por perfil", M.perfil],
    (!only || only === "palestrante") && ["Experiência em palco", "Palestrantes", M.palco],
    (!only || only === "patrocinador") && ["Cota pretendida", "Patrocinadores na lista", M.cota],
  ].filter(Boolean);
  return (
    <PPage eyebrow={`Evento · edição ${ed}`} title="Métricas" desc={only ? `Recorte de ${only}s, conforme o seu papel.` : "Como a lista de espera está crescendo e quem está chegando."}>
      {pnGate(st, "kpis", { title: "Sem dados para métricas ainda", text: "Os gráficos aparecem com as primeiras inscrições da edição." }) || (<>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${m ? 150 : 200}px, 1fr))`, gap: m ? 10 : 16 }}>{kpis.map((k) => <PKpi key={k.label} {...k} />)}</div>
        <PPanel title="Inscrições por dia" sub="Últimos 30 dias" actions={<PLegend items={ser.map(([k, l, c]) => ({ name: l, color: c, total: sum(M.series[k]) }))} />}>
          <PLine labels={M.dias} series={ser.map(([k, l, c]) => ({ name: l, color: c, data: M.series[k] }))} height={m ? 180 : 240} />
        </PPanel>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${m ? 260 : 300}px, 1fr))`, gap: m ? 12 : 16 }}>
          {bars.map(([t, s, items]) => <PPanel key={t} title={t} sub={s}><PBars items={items.map(([label, v]) => ({ label, v }))} /></PPanel>)}
        </div>
        {!only ? <PPanel title="Volume de e-mail por dia" sub={`${pnFmt.num(sum(M.emails))} enviados nos últimos 30 dias`}><PCols data={M.emails} labels={M.dias} height={m ? 110 : 140} /></PPanel> : null}
      </>)}
    </PPage>
  );
}

function PnEmails() {
  const DS = pnDS();
  const { m, st, toast } = usePn();
  const D = window.PN_DATA;
  const [q, setQ] = React.useState("");
  const [s, setS] = React.useState("todos");
  const rows = D.emails.filter((e) => (s === "todos" || e.status === s) && (!q || (e.para + e.assunto).toLowerCase().includes(q.toLowerCase())));
  const cols = [
    { key: "para", label: "Destinatário", mobile: "title", render: (e) => <span style={{ ...pnT.mono, fontSize: 12.5, color: "var(--text-strong)" }}>{e.para}</span> },
    { key: "assunto", label: "Assunto", mobile: "meta", render: (e) => e.assunto },
    { key: "template", label: "Modelo", render: (e) => <span style={pnT.mono}>{e.template}</span> },
    { key: "status", label: "Status", mobile: "tag", render: (e) => <PTag k="email" v={e.status} size="sm" /> },
    { key: "quando", label: "Enviado em", sort: true, mobile: "meta", render: (e) => { const [d, h] = e.quando.split(" "); return `${pnFmt.dt(d)} ${h}`; } },
  ];
  const opts = [{ value: "todos", label: "Todos" }, { value: "entregue", label: "Entregues" }, { value: "falhou", label: "Falhas", count: D.emails.filter((e) => e.status === "falhou").length }, { value: "fila", label: "Na fila" }];
  return (
    <PPage eyebrow="Pessoas · todas as edições" title="E-mails" desc="Registro de tudo que o painel enviou. O corpo da mensagem não é guardado — só metadados.">
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <PSearch value={q} onChange={setQ} placeholder="Buscar por destinatário ou assunto" style={{ minWidth: m ? "100%" : 300 }} />
        <PChips options={opts} value={s} onChange={setS} />
      </div>
      {pnGate(st, "table", { title: "Nenhum e-mail enviado ainda", text: "Confirmações e lembretes aparecem aqui assim que saírem." }) || (
        <PPanel pad={false}>
          <PTable cols={cols} rows={rows} expand={(e) => (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 12 }}>
              <PDefList items={[["ID do provedor", <span style={pnT.mono}>msg_{e.id}a91f</span>], ["Modelo", e.template], ["Resposta do servidor", e.erro || "250 OK"]]} />
              {e.status === "falhou" ? <div><DS.Button size="sm" variant="outline" iconLeft={<PIcon n="refresh" s={14} />} onClick={() => toast({ variant: "success", title: "Reenvio na fila", description: e.para })}>Reenviar</DS.Button></div> : null}
            </div>
          )} footer={<PTableFoot shown={rows.length} total={D.emails.length} />} />
        </PPanel>
      )}
    </PPage>
  );
}

function PnLgpd() {
  const DS = pnDS();
  const { m, st, toast } = usePn();
  const D = window.PN_DATA;
  const [tab, setTab] = React.useState("consulta");
  const [q, setQ] = React.useState("c••••r@exemplo.com");
  const [found, setFound] = React.useState(true);
  const [conf, setConf] = React.useState(false);
  const [anon, setAnon] = React.useState(false);
  const p = D.inscritos[1];
  const cols = [
    { key: "quando", label: "Quando", mobile: "meta", render: (a) => a.quando },
    { key: "quem", label: "Quem", mobile: "title", render: (a) => <b style={{ fontWeight: 600 }}>{a.quem}</b> },
    { key: "acao", label: "Ação", mobile: "tag", render: (a) => <span style={{ fontWeight: 600, color: a.acao === "Anonimizou" ? "var(--brick-600)" : "var(--text-body)" }}>{a.acao}</span> },
    { key: "titular", label: "Titular", mobile: "meta", render: (a) => <span style={pnT.mono}>{a.titular}</span> },
    { key: "motivo", label: "Motivo", render: (a) => a.motivo },
  ];
  return (
    <PPage eyebrow="Pessoas · direitos do titular" title="LGPD" desc="Atenda pedidos de acesso, portabilidade e exclusão. Toda consulta pede motivo e fica registrada.">
      <PChips options={[{ value: "consulta", label: "Consultar titular" }, { value: "historico", label: "Histórico de acesso" }]} value={tab} onChange={setTab} />
      {pnGate(st, tab === "consulta" ? "kpis" : "table", { title: "Nenhum acesso registrado", text: "Consultas e exportações de dado pessoal aparecem aqui." }) || (tab === "consulta" ? (
        <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "minmax(0,1fr) minmax(0,2fr)", gap: 16, alignItems: "start" }}>
          <PPanel title="Localizar titular" sub="Busca exata — e-mail completo ou nº da inscrição.">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <DS.Input label="E-mail ou nº de inscrição" value={q} onChange={(e) => setQ(e.target.value)} iconLeft={<PIcon n="search" s={16} />} />
              <DS.Select label="Motivo da consulta" options={["Pedido do titular por e-mail", "Pedido do titular presencial", "Solicitação de exclusão", "Auditoria interna"]} defaultValue="Pedido do titular por e-mail" />
              <DS.Button onClick={() => { setFound(true); setAnon(false); }} iconLeft={<PIcon n="search" s={16} />}>Consultar</DS.Button>
            </div>
          </PPanel>
          {found ? (
            <PPanel title={anon ? "Titular anonimizado" : p.nome} sub={anon ? "Dados pessoais substituídos em 05/11/2026 14:20" : `Inscrição #${p.id} · ${p.email}`} actions={anon ? <span style={{ ...pnT.eyebrow, fontWeight: 700, background: "var(--sand-200)", color: "var(--espresso-800)", padding: "4px 8px", borderRadius: 999 }}>Anonimizado</span> : null}>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {[["Inscrição", [["Nome", anon ? "—" : p.nome], ["E-mail", anon ? "anon-1041@removido" : "caio.rodrigues@exemplo.com"], ["Telefone", anon ? "—" : "(86) 9 9812-1137"], ["Cidade", p.cidade], ["Tipo", <PTag k="tipo" v={p.tipo} size="sm" />], ["Data", pnFmt.dt(p.data)]]], ["Atividade", [["E-mails recebidos", "4"], ["Edições", "2026, 2027"], ["Último acesso ao dado", "05/11/2026 14:12"]]]].map(([g, items]) => (
                  <div key={g}><div style={{ ...pnT.eyebrow, marginBottom: 10 }}>{g}</div><PDefList items={items} /></div>
                ))}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 14, borderTop: "1px solid var(--border-subtle)" }}>
                  <DS.Button variant="outline" size="sm" iconLeft={<PIcon n="download" s={14} />} disabled={anon} onClick={() => toast({ variant: "success", title: "Exportação pronta", description: "JSON com todos os dados do titular · registrado no histórico." })}>Exportar dados (JSON)</DS.Button>
                  <span style={{ flex: 1 }}></span>
                  <DS.Button variant="danger" size="sm" iconLeft={<PIcon n="trash" s={14} />} disabled={anon} onClick={() => setConf(true)}>Anonimizar titular</DS.Button>
                </div>
              </div>
            </PPanel>
          ) : null}
        </div>
      ) : (
        <PPanel pad={false}><PTable cols={cols} rows={D.acessos} getKey={(a) => a.quando + a.acao} footer={<PTableFoot shown={D.acessos.length} total={D.acessos.length} />} /></PPanel>
      ))}
      <PConfirm open={conf} onClose={() => setConf(false)} title="Anonimizar titular?" subject={`${p.nome} · inscrição #${p.id}`}
        consequences={["Nome, e-mail, telefone e respostas livres serão substituídos por marcadores.", "Métricas agregadas continuam contando esta inscrição.", "O registro desta ação fica no histórico de acesso."]}
        onConfirm={() => { setConf(false); setAnon(true); toast({ variant: "success", title: "Titular anonimizado", description: "Inscrição #1041 · registrado no histórico." }); }} />
    </PPage>
  );
}

Object.assign(window, { pnGate, PnInscricoes, PnMetricas, PnEmails, PnLgpd });
