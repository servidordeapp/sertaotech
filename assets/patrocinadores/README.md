# Logos dos patrocinadores

Arquivos usados no mural `#patrocinadores`, que existe em duas páginas:

- `/index.html` — seção "Quem apoia o Sertão Tech"
- `/patrocinio/index.html` — mesma seção, logo depois da tabela de cotas

**As duas páginas precisam ser atualizadas juntas.**

## Regra zero: não altere a marca do patrocinador

Recortar fundo, mudar cor, isolar o símbolo, redesenhar espaçamento — nada
disso. A maioria das empresas tem manual de marca e essas mexidas violam.

Se a arte que chegou não funciona no card (fundo chapado, logo claro demais pro
cream, versão vertical), **peça a versão oficial pra empresa**: "vocês têm o
logo em fundo claro / com fundo transparente?". Quase sempre têm.

Só trate a arte quando a empresa autorizar, e mesmo assim confirme que o
resultado bate com uma versão oficial que eles já usam.

> Foi o que aconteceu com o Programe Studio: a arte veio em cima do bloco
> amarelo da marca e o fundo foi removido sem perguntar. O resultado passava
> por certo, mas estava errado — no arquivo oficial pra fundo claro o `</>`
> dentro do hexágono é **amarelo**, e na arte de fundo amarelo ele é branco.
> Recortar o fundo trocou a cor do símbolo sem ninguém notar. O arquivo no ar
> hoje é o oficial que a empresa mandou depois.

## 1. Preparar o arquivo do logo

- **Formato**: `.svg` quando a empresa mandar vetor — é o melhor caso, fica
  nítido em qualquer tamanho e pesa menos (3 a 7 KB nos dois logos atuais, contra
  25 KB de um WebP equivalente). Sem vetor, `.webp`. Nada de `.png`/`.jpg`
  direto.
- **SVG**: confira que o arquivo só tem `<path>`/`<g>` e cores literais, sem
  `<script>`, `<image>` ou `xlink:href` — ele é servido como está.
- **Fundo transparente**, na versão oficial da empresa. Fundo branco fica com
  moldura visível no card cream — nesse caso peça o arquivo transparente, não
  recorte por conta própria.
- **Versão do logo**: horizontal, colorida ou escura. O card tem fundo claro
  (`--surface-card`), então logo branco/claro some — peça a versão pra fundo
  claro.
- **Tamanho** (só pra raster): altura mínima de 200px no arquivo original, que
  a exibição é menor mas tela retina precisa da folga. SVG não tem esse
  problema.
- **Área de respiro**: arquivo oficial costuma trazer a margem de segurança
  embutida no viewBox — o do Programe Studio gasta um terço da altura com isso.
  Não recorte pra "aproveitar melhor o card": essa margem é parte do manual de
  marca. Se o logo ficou pequeno demais no tile, aumente `--logo-min` /
  `--logo-h` da cota no CSS, não mexa no arquivo.
- **Nome do arquivo**: `kebab-case` sem acento. Ex.: `agencia-delta.svg`.

Converter: o `cwebp` não está instalado nesta máquina. O caminho testado é o
script do repositório, que só precisa de Node — ele serve tanto pra logo já
transparente quanto pra logo com fundo chapado:

```sh
npm i sharp   # não é dependência do site, instale sob demanda
node scripts/logo-fundo-chapado.mjs "arte-original.png" nome-da-empresa
```

**Logo com fundo chapado** — só depois de a empresa autorizar (ver "Regra
zero" acima). O script lê a cor do canto da imagem, joga esse tom pra alpha 0,
corta no limite exato do desenho e exporta WebP lossless a 640px de largura
(ajustável no terceiro argumento). Ele imprime os `width`/`height` prontos pra
colar no `<img>`.

Confira o resultado sobre o cream do card antes de subir: logo branco some no
fundo claro, e sobra de fundo aparece como retângulo.

## 2. Colar o bloco da cota

Cada cota é um `.logo-tier`. Cole o bloco inteiro **acima** do bloco
"Apoio e comunidades", nas duas páginas. A ordem na página é
Ouro → Prata → Bronze → Apoio.

### Cota Ouro

```html
<div class="logo-tier">
  <div class="logo-tier__head">
    <span class="logo-tier__rule" aria-hidden="true"></span>
    <h3 class="logo-tier__name" id="tier-ouro">Cota Ouro</h3>
    <span class="logo-tier__rule" aria-hidden="true"></span>
  </div>
  <ul class="logo-wall logo-wall--gold" aria-labelledby="tier-ouro">
    <li>
      <a class="logo-card logo-card--gold" href="https://empresa.com.br/?utm_source=osertaotech.com.br&amp;utm_medium=referral&amp;utm_campaign=sertaotech-2026&amp;utm_content=PAGINA-COTA" target="_blank" rel="noopener sponsored">
        <img src="/assets/patrocinadores/nome-da-empresa.svg" alt="Nome da Empresa" width="664" height="222" loading="lazy" decoding="async">
      </a>
    </li>
  </ul>
</div>
```

### Cota Prata

```html
<div class="logo-tier">
  <div class="logo-tier__head">
    <span class="logo-tier__rule" aria-hidden="true"></span>
    <h3 class="logo-tier__name" id="tier-prata">Cota Prata</h3>
    <span class="logo-tier__rule" aria-hidden="true"></span>
  </div>
  <ul class="logo-wall logo-wall--silver" aria-labelledby="tier-prata">
    <li>
      <a class="logo-card" href="https://empresa.com.br/?utm_source=osertaotech.com.br&amp;utm_medium=referral&amp;utm_campaign=sertaotech-2026&amp;utm_content=PAGINA-COTA" target="_blank" rel="noopener sponsored">
        <img src="/assets/patrocinadores/nome-da-empresa.svg" alt="Nome da Empresa" width="664" height="222" loading="lazy" decoding="async">
      </a>
    </li>
  </ul>
</div>
```

### Cota Bronze

```html
<div class="logo-tier">
  <div class="logo-tier__head">
    <span class="logo-tier__rule" aria-hidden="true"></span>
    <h3 class="logo-tier__name" id="tier-bronze">Cota Bronze</h3>
    <span class="logo-tier__rule" aria-hidden="true"></span>
  </div>
  <ul class="logo-wall logo-wall--bronze" aria-labelledby="tier-bronze">
    <li>
      <a class="logo-card" href="https://empresa.com.br/?utm_source=osertaotech.com.br&amp;utm_medium=referral&amp;utm_campaign=sertaotech-2026&amp;utm_content=PAGINA-COTA" target="_blank" rel="noopener sponsored">
        <img src="/assets/patrocinadores/nome-da-empresa.svg" alt="Nome da Empresa" width="424" height="133" loading="lazy" decoding="async">
      </a>
    </li>
  </ul>
</div>
```

### Variações de um item

Mais de uma empresa na mesma cota: duplique só o `<li>`.

Empresa **sem site** — sem o `<a>`:

```html
<li class="logo-card">
  <img src="/assets/patrocinadores/nome-da-empresa.svg" alt="Nome da Empresa" width="424" height="133" loading="lazy" decoding="async">
</li>
```

Empresa que **ainda não mandou a arte** — o nome em texto segura o lugar e
evita imagem quebrada:

```html
<li class="logo-card"><p class="logo-card__name">Nome da Empresa</p></li>
```

Logo horizontal encaixa melhor que a versão vertical: o tile é largo e baixo,
então a vertical fica minúscula pra caber na altura. Quando a empresa mandar as
duas, use a horizontal.

`width` e `height` no `<img>` são as dimensões reais do arquivo (no SVG, as do
`viewBox`), não o tamanho de exibição — servem só pra reservar espaço e evitar layout shift. O CSS é quem
define o tamanho na tela.

Cota sem nenhum patrocinador: não deixe o `.logo-tier` vazio, apague o bloco
inteiro dela.

## 2.1. Parâmetros UTM no link

Todo link de logo carrega UTM para o patrocinador conseguir medir, no próprio
analytics dele, quantos cliques vieram daqui. Sem isso ele vê só "referral de
osertaotech.com.br" agregado, sem separar por página nem por cota.

| Parâmetro | Valor | Por quê |
| --- | --- | --- |
| `utm_source` | `osertaotech.com.br` | Quem mandou o tráfego. |
| `utm_medium` | `referral` | Link editorial, não anúncio pago. |
| `utm_campaign` | `sertaotech-2026` | Mesma campanha do CTA da Sympla. |
| `utm_content` | `PAGINA-COTA` | Onde o clique nasceu. |

`utm_content` é o único que muda por bloco. `PAGINA` é `home` (`/index.html`) ou
`patrocinio` (`/patrocinio/index.html`); `COTA` é `ouro`, `prata`, `bronze` ou
`apoio`. Então o mesmo patrocinador na Bronze das duas páginas fica
`home-bronze` num arquivo e `patrocinio-bronze` no outro — é o que deixa ele ver
se o clique veio da home ou da página de cotas.

Dois detalhes que quebram se ignorados:

- Dentro do HTML o separador é `&amp;`, não `&` cru. É o mesmo que o CTA da
  Sympla já usa. O navegador manda `&` normal na requisição.
- O `?` só vale se a URL da empresa não tiver query string própria. Se tiver
  (`https://empresa.com.br/?ref=x`), emende com `&amp;` no lugar do `?`.

O JSON-LD **não** leva UTM: lá vai a URL institucional limpa, que é o
identificador da empresa pro Google, não um link de clique.

## 2.2. Medição de cliques (GA4)

As duas páginas mandam dois eventos por logo pro GA4 `G-62RC94ZH1Z`, num bloco
no fim do `<script>` de cada arquivo:

| Evento | Quando dispara |
| --- | --- |
| `sponsor_impression` | metade do tile entrou na viewport, uma vez por pageview |
| `sponsor_click` | clique no logo (só nos que têm `<a>`) |

Ambos carregam `sponsor_name`, `sponsor_tier` e `sponsor_page`.

A impressão existe pra dar denominador ao clique. Sozinho, "47 cliques" não diz
nada; contra a impressão vira "47 de 1.203 que viram o logo", que é o número que
o patrocinador consegue usar.

**Patrocinador novo não exige mexer no script.** `sponsor_name` sai do `alt` da
imagem (ou do texto do `.logo-card__name`, quando não há arte) e `sponsor_tier`
sai do `aria-labelledby` do `.logo-wall`. Ou seja: `alt` errado ou vazio vira
nome errado no relatório — é mais um motivo pra preencher direito.

### Antes de contar com o dado

Duas configurações do GA4 que **não são retroativas** — feitas depois, o período
anterior fica vazio pra sempre:

1. **Custom definitions** (Admin → Custom definitions): registre `sponsor_name`,
   `sponsor_tier` e `sponsor_page` como dimensões personalizadas com escopo de
   evento. Sem isso os parâmetros chegam mas não aparecem em relatório.
2. **Data retention** (Admin → Data settings → Data retention): o padrão é 2
   meses. Suba pra 14 meses, senão o relatório pós-evento não alcança o período
   da divulgação.

Confira no DebugView que os dois eventos chegam antes de prometer número a
alguém. Bloqueador de anúncio derruba parte dos hits — o total daqui sempre vai
ser maior que o que o patrocinador vê no analytics dele, e vale dizer isso no
relatório em vez de deixar a diferença aparecer sozinha.

## 3. Atualizar o JSON-LD

No `<head>` do `/index.html`, adicione a empresa no array `"sponsor"`:

```json
"sponsor": [
  { "@type": "Organization", "name": "PHP PI" },
  { "@type": "Organization", "name": "PHPWomen PI" },
  { "@type": "Organization", "name": "Nome da Empresa", "url": "https://empresa.com.br" }
]
```

## Onde fica o CSS

`css/site.css`, bloco `sponsor logo wall`. O mural é flex com wrap: cada tile
tem a largura da cota (`--logo-min`) e a linha fica centralizada, então uma cota
com um patrocinador só não estica o card pela largura toda. A altura do tile sai
de `--logo-h`. Ambos vêm dos modificadores `.logo-wall--gold`, `--silver`,
`--bronze` e `--apoio`; o breakpoint de 760px reduz esses valores no celular.
