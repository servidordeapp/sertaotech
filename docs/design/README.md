# Design do painel

Cópia do `ui_kits/painel` do projeto "Sertão Tech Design System" no Claude Design,
trazida para cá em 2026-11-05 porque o Claude Design standalone fecha até
2026-12-14. É a especificação do painel, não código de produção.

- `ui_kits/painel/index.html`: protótipo navegável, com barra para trocar papel,
  dispositivo e estado.
- `ui_kits/painel/Especificacao.html`: fundamentos, navegação por papel,
  componentes, tokens e decisões.
- `ui_kits/painel/README.md`: o que é cada arquivo.

Para abrir, sirva a pasta (carrega React e Babel do unpkg, então precisa de rede):

```bash
python3 -m http.server -d docs/design 8080
# http://localhost:8080/ui_kits/painel/
```

`styles.css` e `assets/logo.png` são links simbólicos para `site/public`: os
tokens valem os de verdade, sem segunda cópia. No projeto original, `styles.css`
é uma lista de `@import`.

`_ds_bundle.js` é o único arquivo que não é cópia fiel. O download para em 256 KiB,
e o original passa disso porque compila também os `ui_kits`, que o protótipo carrega
à parte. Ficaram só os componentes do DS, com o fechamento que o corte levou junto.

Os dados do protótipo são fictícios, e nele há telas e botões que a api ainda não
sustenta. O que entrou no painel de fato está em `painel/README.md`.
