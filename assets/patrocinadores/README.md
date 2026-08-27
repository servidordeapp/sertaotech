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
> amarelo da marca e o fundo foi removido sem perguntar. Deu certo por acaso —
> eles têm uma versão oficial em fundo claro, idêntica ao resultado. Podia ter
> dado errado.

## 1. Preparar o arquivo do logo

- **Formato**: `.svg` quando a empresa mandar vetor — é o melhor caso, fica
  nítido em qualquer tamanho e pesa menos (o do Retake tem 3 KB contra 25 KB do
  WebP do Programe Studio). Sem vetor, `.webp`. Nada de `.png`/`.jpg` direto.
- **SVG**: confira que o arquivo só tem `<path>`/`<g>` e cores literais, sem
  `<script>`, `<image>` ou `xlink:href` — ele é servido como está.
- **Fundo transparente**, na versão oficial da empresa. Fundo branco fica com
  moldura visível no card cream — nesse caso peça o arquivo transparente, não
  recorte por conta própria.
- **Versão do logo**: horizontal, colorida ou escura. O card tem fundo claro
  (`--surface-card`), então logo branco/claro some — peça a versão pra fundo
  claro.
- **Tamanho**: altura mínima de 200px no arquivo original (a exibição é menor,
  mas telas retina precisam da folga). Sem margem sobrando em volta — recorte
  no limite do desenho, o card já dá o respiro.
- **Nome do arquivo**: `kebab-case` sem acento. Ex.: `agencia-delta.webp`.

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
      <a class="logo-card logo-card--gold" href="https://empresa.com.br" target="_blank" rel="noopener sponsored">
        <img src="/assets/patrocinadores/nome-da-empresa.webp" alt="Nome da Empresa" width="320" height="120" loading="lazy" decoding="async">
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
      <a class="logo-card" href="https://empresa.com.br" target="_blank" rel="noopener sponsored">
        <img src="/assets/patrocinadores/nome-da-empresa.webp" alt="Nome da Empresa" width="640" height="158" loading="lazy" decoding="async">
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
      <a class="logo-card" href="https://empresa.com.br" target="_blank" rel="noopener sponsored">
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
  <img src="/assets/patrocinadores/nome-da-empresa.webp" alt="Nome da Empresa" width="240" height="90" loading="lazy" decoding="async">
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
