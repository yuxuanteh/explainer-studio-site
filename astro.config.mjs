// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
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
  // Astro 7 默认用新的 Sätteri 处理器；这两个外挂要用 unified 处理器才会生效。
  markdown: { processor: unified({ rehypePlugins: [rehypeFigures, rehypeBlog] }) },
  // 保留以前的 HTML 压缩方式（Astro 7 默认的 'jsx' 会去掉行内元素之间的空格）
  compressHTML: true,
});
