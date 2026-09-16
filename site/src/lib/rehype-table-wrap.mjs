/**
 * Envolve cada <table> gerada pelo markdown num <div class="table-wrap">.
 *
 * Sem isso, tabela larga estoura a coluna de leitura no celular e o corpo da
 * página passa a rolar na horizontal. O CSS (public/css/article.css) já tem a
 * regra `.article .table-wrap { overflow-x: auto }` — o que faltava era o
 * elemento, que o markdown não produz.
 */
export function rehypeTableWrap() {
  return (arvore) => {
    const visita = (no) => {
      if (!Array.isArray(no.children)) return;
      no.children = no.children.map((filho) => {
        visita(filho);
        if (filho.type !== 'element' || filho.tagName !== 'table') return filho;
        return {
          type: 'element',
          tagName: 'div',
          properties: { className: ['table-wrap'] },
          children: [filho],
        };
      });
    };
    visita(arvore);
  };
}
