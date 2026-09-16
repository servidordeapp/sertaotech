import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '../../lib/blog';
import { SITE, abs } from '../../lib/site';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: 'Blog do Sertão Tech',
    description:
      'Eventos de tecnologia, carreira e comunidades no norte do Piauí — pelo pessoal que organiza o Sertão Tech, em Parnaíba - PI.',
    site: context.site ?? SITE.url,
    customData: '<language>pt-BR</language>',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: abs(`/blog/${post.id}`),
      categories: [post.data.category, ...post.data.tags],
      author: post.data.author,
    })),
  });
}
