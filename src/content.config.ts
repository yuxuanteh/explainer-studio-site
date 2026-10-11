import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { twinId } from './lib/twins';

// 博客文章：src/content/posts/*.md
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts', generateId: twinId }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    date: z.coerce.date(),
    category: z.enum(['geo', 'life', 'travel']).default('geo'),
    lang: z.enum(['zh', 'en']).default('zh'),
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    youtubeId: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

// 测验：src/content/quizzes/*.json
const quizzes = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/quizzes', generateId: twinId }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    lang: z.enum(['zh', 'en']).default('zh'),
    youtubeId: z.string().optional(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
    questions: z.array(z.object({
      question: z.string(),
      options: z.array(z.string()).min(2),
      answer: z.number().int().min(1), // 第几个选项是正确答案（从 1 开始数）
      explanation: z.string().default(''),
    })).min(1),
  }),
});

// 标本：src/content/specimens/*.md
const specimens = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/specimens' }),
  schema: z.object({
    name: z.string(),
    nameEn: z.string().optional(),
    type: z.enum(['igneous', 'sedimentary', 'metamorphic', 'mineral', 'fossil']),
    location: z.string().default(''),
    image: z.string(),
    date: z.coerce.date().optional(),
  }),
});

// 固定页面（关于我）：src/content/pages/*.md
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    photo: z.string().optional(),
  }),
});

export const collections = { posts, quizzes, specimens, pages };
