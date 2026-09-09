import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/**
 * Coleção de posts do blog.
 *
 * Cada campo existe por um motivo de SEO, não por enfeite:
 *  - `title` vira <h1> E <title>; `titleSeo` permite um <title> diferente
 *    (mais curto, com a keyword na frente) sem estragar o título na página.
 *  - `description` é a meta description: 120–160 caracteres, com a keyword
 *    principal e um motivo pra clicar. Validado no build.
 *  - `pubDate`/`updatedDate` alimentam datePublished/dateModified do
 *    BlogPosting e o <lastmod> do sitemap. Conteúdo local envelhece rápido;
 *    atualizar `updatedDate` é o sinal mais barato de frescor que existe.
 *  - `keywords` NÃO vira meta keywords (ignorada pelo Google desde 2009) —
 *    entra em BlogPosting.keywords e serve de checklist na redação.
 *  - `category` é uma só (define a trilha de navegação e articleSection);
 *    `tags` são livres e NÃO geram páginas próprias, pra não criar dezenas
 *    de URLs de conteúdo raso competindo com os posts.
 *  - `faq` gera FAQPage no post — é o rich result que mais aparece em busca
 *    local ("tem evento de tecnologia em Parnaíba?").
 */
const CATEGORIAS = ['eventos', 'carreira', 'comunidade', 'bastidores'] as const;

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(15).max(90),
      titleSeo: z.string().max(70).optional(),
      description: z.string().min(80).max(165),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      author: z.string().default('Bruno Oliveira'),
      authorUrl: z.string().url().default('https://osertaotech.com.br/sobre'),
      category: z.enum(CATEGORIAS),
      tags: z.array(z.string()).default([]),
      keywords: z.array(z.string()).min(1),
      /** Imagem de capa do post (opcional). Usa o pipeline de imagem do Astro. */
      cover: image().optional(),
      coverAlt: z.string().optional(),
      /** Card social. Cai pro og-blog.jpg quando não informado. */
      ogImage: z.string().default('/assets/og-blog.jpg'),
      ogImageAlt: z.string().default('Blog do Sertão Tech — evento de tecnologia em Parnaíba, PI'),
      draft: z.boolean().default(false),
      featured: z.boolean().default(false),
      /** Slugs de posts relacionados, na ordem em que devem aparecer. */
      related: z.array(z.string()).default([]),
      faq: z
        .array(z.object({ pergunta: z.string(), resposta: z.string() }))
        .default([]),
    })
    .refine((data) => !data.coverAlt || !!data.cover, {
      message: 'coverAlt sem cover',
      path: ['cover'],
    })
    .refine((data) => !data.cover || !!data.coverAlt, {
      message: 'cover precisa de coverAlt (imagem sem alt é falha de acessibilidade e de SEO)',
      path: ['coverAlt'],
    }),
});

export const collections = { blog };

export const CATEGORIA_LABEL: Record<(typeof CATEGORIAS)[number], string> = {
  eventos: 'Eventos',
  carreira: 'Carreira',
  comunidade: 'Comunidade',
  bastidores: 'Bastidores',
};
