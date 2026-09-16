import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/** Posts publicados, do mais novo pro mais antigo. Rascunho fica fora. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

/**
 * Resolve os posts relacionados na ordem declarada no frontmatter.
 * Slug inexistente é ignorado em silêncio no build de produção, mas o
 * schema já valida o formato — o que sobra aqui é post despublicado.
 */
export function resolveRelated(post: Post, todos: Post[]): Post[] {
  const byId = new Map(todos.map((p) => [p.id, p]));
  const escolhidos = post.data.related
    .map((slug) => byId.get(slug))
    .filter((p): p is Post => !!p && p.id !== post.id);
  if (escolhidos.length >= 2) return escolhidos.slice(0, 3);
  // completa com os mais recentes da mesma categoria, depois quaisquer outros
  const extra = todos.filter(
    (p) => p.id !== post.id && !escolhidos.includes(p) && p.data.category === post.data.category,
  );
  const resto = todos.filter((p) => p.id !== post.id && !escolhidos.includes(p) && !extra.includes(p));
  return [...escolhidos, ...extra, ...resto].slice(0, 3);
}

/** ~200 palavras por minuto, arredondado pra cima, mínimo 1. */
export function readingMinutes(body: string): number {
  const palavras = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(palavras / 200));
}
