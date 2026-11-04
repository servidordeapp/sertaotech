// Inicializa o mídia kit (palco 1920x1080 do reveal.js).
//
// No celular o palco escalado deixa o texto ilegível, então o reveal não é
// iniciado: a página ganha a classe .mk-flow e os slides viram uma página
// rolável (ver "Modo celular" em midia-kit.css).
//
// ?print-pdf sempre usa o reveal (é o modo de impressão dele) e abre a
// janela de impressão quando o layout e as fontes estão prontos.
(function () {
  var printing = /print-pdf/.test(location.search);

  if (!printing && matchMedia('(max-width: 900px)').matches) {
    document.documentElement.classList.add('mk-flow');
    return;
  }

  Reveal.initialize({
    width: 1920,
    height: 1080,
    margin: 0,
    center: false,
    display: 'flex',
    hash: true,
    slideNumber: 'c/t',
    pdfMaxPagesPerSlide: 1,
    plugins: [RevealNotes]
  });

  if (printing && !/headless/i.test(navigator.userAgent)) {
    Reveal.on('pdf-ready', function () {
      document.fonts.ready.then(function () { setTimeout(window.print, 500); });
    });
  }
})();
