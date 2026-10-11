// @ts-check
import { defineConfig } from 'astro/config';
import rehypeFigures from './src/lib/rehype-figures.mjs';
import rehypeBlog from './src/lib/rehype-blog.mjs';

// 网址设定：GitHub 自动发布时会自动填入，平常不用改。
// SITE_URL 例如 https://你的账号.github.io
// BASE_PATH 例如 /my-site（如果仓库名是 你的账号.github.io 就是 /）
export default defineConfig({
  site: process.env.SITE_URL || 'https://example.github.io',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'ignore',
  // 文章图片（rehype-figures）+ 小知识框、参考资料编号（rehype-blog）
  markdown: { rehypePlugins: [rehypeFigures, rehypeBlog] },
});
