# Painel interno — Sertão Tech

Especificação visual do painel interno (Vue 3 + PrimeVue 4 Aura + Chart.js), desenhada sob o DS. **Não é código de produção.**

- `index.html` — protótipo navegável: 7 telas (login + 6), barra de revisão para trocar **papel** (admin/financeiro/comercial/curadoria), **dispositivo** (desktop/celular) e **estado** (normal/carregando/vazio/erro/403).
- `Especificacao.html` — fundamentos (shell, grid, tipografia aplicada), navegação × papéis, componentes derivados, estados, mapa de tokens, tokens propostos, decisões abertas.
- `tokens-propostos.css` — adições ao arquivo de tokens (funil, despesa, gráficos, degraus AA). Fora de `styles.css` até aprovação.
- `pn-core.jsx` (primitivos: KPI, tabela, tags, barra de execução, campo monetário, seletor de edição, confirmação destrutiva, cartão de material, gráficos), `pn-shell.jsx`, `pn-screens-a.jsx`, `pn-materiais.jsx`, `pn-orcamento.jsx`, `pn-app.jsx`, `pn-spec.jsx`, `pn-data.js` (dados fictícios).

Gráficos são SVG de protótipo; em produção, Chart.js com as mesmas cores (`--chart-*`).
