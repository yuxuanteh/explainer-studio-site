// 找出"还没有另一种语言版本"的文章和测验，交给 Claude 翻译。
// 输出：每行一个 "原文件 -> 翻译后要存的文件"，写进 GitHub Actions 的 output。
import { readdirSync, readFileSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';

const dirs = [
  { dir: 'src/content/posts', ext: '.md' },
  { dir: 'src/content/quizzes', ext: '.json' },
];

function meta(file, ext) {
  const text = readFileSync(file, 'utf8');
  if (ext === '.json') {
    const d = JSON.parse(text);
    return { slug: d.slug, lang: d.lang || 'zh', draft: !!d.draft };
  }
  const fm = (text.match(/^---\r?\n([\s\S]*?)\r?\n---/) || [])[1] || '';
  const get = (k) => ((fm.match(new RegExp(`^${k}:[ \\t]*(.*)$`, 'm')) || [])[1] || '').trim().replace(/^["']|["']$/g, '');
  return { slug: get('slug'), lang: get('lang') || 'zh', draft: get('draft') === 'true' };
}

const pairs = [];
for (const { dir, ext } of dirs) {
  const files = readdirSync(dir).filter((f) => f.endsWith(ext));
  const items = files.map((f) => {
    const path = `${dir}/${f}`;
    const m = meta(path, ext);
    const slug = String(m.slug || f.slice(0, -ext.length)).toLowerCase().replace(/[^a-z0-9一-鿿]+/g, '-').replace(/^-+|-+$/g, '');
    return { path, file: f, ...m, slug };
  });
  for (const it of items) {
    if (it.draft) continue; // 草稿先不翻译，等发布了再说
    const other = it.lang === 'zh' ? 'en' : 'zh';
    const hasTwin = items.some((o) => o.slug === it.slug && o.lang === other); // 草稿版也算（避免重复翻译）
    if (hasTwin) continue;
    const base = it.file.slice(0, -ext.length);
    const target = base.endsWith(`-${it.lang}`)
      ? `${base.slice(0, -it.lang.length)}${other}${ext}`
      : `${base}-${other}${ext}`;
    pairs.push(`${it.path} -> ${dir}/${target} (${it.lang} → ${other})`);
  }
}

console.log(pairs.length ? pairs.join('\n') : 'Nothing to translate.');
if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `count=${pairs.length}\npairs<<EOF\n${pairs.join('\n')}\nEOF\n`);
}
