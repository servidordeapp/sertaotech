#!/usr/bin/env python3
"""Gera a versao HTML de impressao a partir do roteiro em markdown.

Cada bloco (## BLOCO ...) vira um cartao de meia folha A4; dois cartoes
por folha. Uso: python3 cerimonial/build-html.py
"""
import html
import re
from pathlib import Path

BASE = Path(__file__).resolve().parent
SRC = BASE / "roteiro-cerimonialista.md"
OUT = BASE / "roteiro-cerimonialista.html"


def inline(text):
    """Converte marcacao inline de markdown para HTML."""
    out = html.escape(text)
    out = re.sub(r"`([^`]+)`", r'<span class="fill">\1</span>', out)
    out = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", out)
    out = re.sub(r"\*([^*]+)\*", r"<em>\1</em>", out)
    return out


def render(lines):
    """Renderiza o corpo de um bloco (lista de linhas markdown)."""
    out = []
    quote, ul, table = [], [], []

    def flush_ul():
        if ul:
            out.append("<ul>" + "".join(f"<li>{inline(i)}</li>" for i in ul) + "</ul>")
            ul.clear()

    def flush_quote():
        if quote:
            body = []
            sub = []
            for q in quote:
                if q.startswith("- "):
                    sub.append(q[2:])
                    continue
                if sub:
                    body.append("<ul>" + "".join(f"<li>{inline(i)}</li>" for i in sub) + "</ul>")
                    sub.clear()
                body.append(f"<p>{inline(q)}</p>" if q else "")
            if sub:
                body.append("<ul>" + "".join(f"<li>{inline(i)}</li>" for i in sub) + "</ul>")
            out.append('<blockquote class="fala">' + "".join(body) + "</blockquote>")
            quote.clear()

    def flush_table():
        if not table:
            return
        head = [c.strip() for c in table[0].strip("|").split("|")]
        rows = [[c.strip() for c in r.strip("|").split("|")] for r in table[2:]]
        th = "".join(f"<th>{inline(c)}</th>" for c in head)
        tb = "".join("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in rows)
        out.append(f"<table><thead><tr>{th}</tr></thead><tbody>{tb}</tbody></table>")
        table.clear()

    for raw in lines:
        line = raw.rstrip()
        if line.startswith("|"):
            flush_ul(), flush_quote()
            table.append(line)
            continue
        flush_table()
        if line.startswith(">"):
            flush_ul()
            quote.append(line.lstrip(">").strip())
            continue
        flush_quote()
        if line.startswith("- "):
            ul.append(line[2:])
            continue
        flush_ul()
        if not line:
            continue
        if line.startswith("### "):
            out.append(f"<h3>{inline(line[4:])}</h3>")
        elif line.startswith("⚠️"):
            out.append(f'<p class="alerta">{inline(line)}</p>')
        elif line.startswith("🎤"):
            out.append(f'<p class="cue">{inline(line[1:].strip())}</p>')
        else:
            out.append(f"<p>{inline(line)}</p>")

    flush_ul(), flush_quote(), flush_table()
    return "\n".join(o for o in out if o)


def parse(md):
    """Separa o cabecalho e os blocos do roteiro."""
    md = re.sub(r"<!--.*?-->", "", md, flags=re.S)
    md = md.replace('<div style="page-break-after: always"></div>', "")
    parts = re.split(r"^## ", md, flags=re.M)
    head = parts[0].strip().splitlines()
    blocos = []
    for part in parts[1:]:
        title, *body = part.splitlines()
        blocos.append((title.strip(), render(body)))
    return head, blocos


def cabecalho(head):
    titulo = next((l[2:] for l in head if l.startswith("# ")), "Roteiro")
    resto = [l for l in head if not l.startswith("# ") and l.strip() not in ("", "---")]
    sub = [l for l in resto if not l.startswith(">")]
    legenda = [l.lstrip(">").strip() for l in resto if l.startswith(">")]
    return titulo, " ".join(sub), legenda


def main():
    head, blocos = parse(SRC.read_text(encoding="utf-8"))
    titulo, sub, legenda = cabecalho(head)

    cards = []
    for title, body in blocos:
        num, _, resto = title.partition("—")
        cards.append(
            '<article class="bloco">'
            f'<header class="bloco__head"><span class="bloco__num">{inline(num.strip())}</span>'
            f'<h2 class="bloco__title">{inline(resto.strip())}</h2></header>'
            f'<div class="bloco__body">{body}</div>'
            "</article>"
        )

    folhas = []
    for i in range(0, len(cards), 2):
        folhas.append('<section class="folha">' + "".join(cards[i:i + 2]) + "</section>")

    legenda_html = "".join(f"<p>{inline(l)}</p>" for l in legenda)
    OUT.write_text(TEMPLATE.format(
        titulo=html.escape(titulo),
        sub=inline(sub),
        legenda=legenda_html,
        folhas="\n".join(folhas),
    ), encoding="utf-8")
    print(f"{OUT} — {len(blocos)} blocos em {len(folhas)} folhas A4")


TEMPLATE = """<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{titulo}</title>
<style>
  @page {{ size: A4 portrait; margin: 10mm; }}

  :root {{
    --ink: #16130f;
    --muted: #5c554c;
    --line: #d9d2c7;
    --terra: #b4451f;
    --amber: #b8860b;
    --paper: #fff;
  }}

  * {{ box-sizing: border-box; }}

  body {{
    margin: 0;
    background: #efece6;
    color: var(--ink);
    font: 400 10.5pt/1.45 "Georgia", "Iowan Old Style", serif;
  }}

  .capa, .folha {{
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto 8mm;
    padding: 10mm;
    background: var(--paper);
    box-shadow: 0 2px 12px rgba(0,0,0,.18);
    display: flex;
    flex-direction: column;
  }}

  .capa {{ justify-content: center; gap: 6mm; text-align: center; }}
  .capa h1 {{ font-size: 30pt; line-height: 1.1; margin: 0; letter-spacing: -.5pt; }}
  .capa .sub {{ font-size: 12pt; color: var(--muted); margin: 0; }}
  .capa .legenda {{
    margin: 6mm auto 0;
    max-width: 130mm;
    padding: 5mm;
    border: 1px solid var(--line);
    border-radius: 3mm;
    font-size: 10pt;
    color: var(--muted);
    text-align: left;
  }}
  .capa .legenda p {{ margin: 0 0 2mm; }}
  .capa .legenda p:last-child {{ margin: 0; }}

  /* duas metades por folha, com linha de corte no meio */
  .folha {{ padding: 0; gap: 0; }}
  .bloco {{
    flex: 1 1 50%;
    min-height: 138.5mm;
    max-height: 138.5mm;
    padding: 9mm 11mm;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }}
  .bloco + .bloco {{ border-top: 1px dashed var(--line); }}

  .bloco__head {{
    border-bottom: 2px solid var(--ink);
    padding-bottom: 2mm;
    margin-bottom: 3.5mm;
  }}
  .bloco__num {{
    display: block;
    font: 700 8pt/1 "Helvetica Neue", Arial, sans-serif;
    letter-spacing: 1.2pt;
    text-transform: uppercase;
    color: var(--terra);
    margin-bottom: 1.5mm;
  }}
  .bloco__title {{
    margin: 0;
    font: 700 13pt/1.2 "Helvetica Neue", Arial, sans-serif;
    letter-spacing: -.2pt;
  }}

  .bloco__body {{ flex: 1; min-height: 0; }}
  .bloco__body > :first-child {{ margin-top: 0; }}
  p {{ margin: 0 0 2.5mm; }}

  /* o que o cerimonialista fala em voz alta */
  .fala {{
    margin: 0 0 3mm;
    padding: 0 0 0 5mm;
    border-left: 3px solid var(--amber);
    font-size: 11pt;
  }}
  .fala p {{ margin: 0 0 2.5mm; }}
  .fala p:last-child {{ margin: 0; }}
  .fala ul {{ margin: 0 0 2mm; padding-left: 5mm; }}

  .cue {{
    font: 700 8.5pt/1.2 "Helvetica Neue", Arial, sans-serif;
    letter-spacing: .6pt;
    text-transform: uppercase;
    color: var(--muted);
    margin: 0 0 1.5mm;
  }}

  .alerta {{
    font: 400 9pt/1.35 "Helvetica Neue", Arial, sans-serif;
    color: var(--terra);
    margin: 0 0 1.5mm;
  }}

  /* lacunas a preencher a mao antes de imprimir */
  .fill {{
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 9.5pt;
    background: #fdf3d3;
    border-bottom: 1px solid var(--amber);
    padding: 0 1mm;
  }}

  h3 {{
    margin: 0 0 2mm;
    font: 700 10pt/1.2 "Helvetica Neue", Arial, sans-serif;
    text-transform: uppercase;
    letter-spacing: .5pt;
  }}

  ul {{ margin: 0 0 2.5mm; padding-left: 5mm; }}
  li {{ margin-bottom: 1mm; }}

  table {{
    width: 100%;
    border-collapse: collapse;
    font: 400 8pt/1.25 "Helvetica Neue", Arial, sans-serif;
  }}
  th, td {{ padding: .8mm 1.5mm; text-align: left; border-bottom: .5px solid var(--line); }}
  th {{ text-transform: uppercase; font-size: 7pt; letter-spacing: .5pt; color: var(--muted); }}
  td:first-child, td:nth-child(2) {{ white-space: nowrap; font-variant-numeric: tabular-nums; }}

  @media print {{
    body {{ background: none; }}
    .capa, .folha {{
      margin: 0;
      padding: 0;
      box-shadow: none;
      min-height: auto;
      height: 277mm;
      page-break-after: always;
      break-after: page;
    }}
    .capa {{ padding: 30mm 15mm; }}
    .bloco {{ min-height: 138.5mm; max-height: 138.5mm; padding: 8mm 6mm; }}
    .folha:last-child {{ page-break-after: auto; break-after: auto; }}
  }}
</style>
</head>
<body>
<section class="capa">
  <h1>{titulo}</h1>
  <p class="sub">{sub}</p>
  <div class="legenda">{legenda}
    <p><strong>Como imprimir:</strong> A4, retrato, margens padrão, sem redimensionar. Cada folha traz dois blocos — corte ou dobre na linha tracejada do meio.</p>
    <p>Os campos destacados em amarelo precisam ser preenchidos com a organização antes de imprimir.</p>
  </div>
</section>
{folhas}
</body>
</html>
"""

if __name__ == "__main__":
    main()
