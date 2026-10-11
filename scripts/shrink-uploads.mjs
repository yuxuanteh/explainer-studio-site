// 发布网站前，把太大的上传照片缩小（最长边 1600px），让网页打开更快。
// 只在 GitHub 发布时处理「发布用的副本」，你仓库里的原始照片不会被改动。
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.log('[shrink-uploads] sharp not available, skipping.');
  process.exit(0);
}

const DIR = 'public/uploads';
const MAX = 1600;
let saved = 0;

for (const name of readdirSync(DIR)) {
  if (!/\.(jpe?g|png|webp)$/i.test(name)) continue;
  const path = `${DIR}/${name}`;
  const before = statSync(path).size;
  if (before < 400 * 1024) continue; // 小于 400KB 的不用处理
  const img = sharp(readFileSync(path)).rotate(); // 按照片里的方向资料转正
  const meta = await img.metadata();
  const resized = img.resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true });
  const out = /\.png$/i.test(name)
    ? await resized.png({ compressionLevel: 9, palette: true }).toBuffer()
    : /\.webp$/i.test(name)
      ? await resized.webp({ quality: 82 }).toBuffer()
      : await resized.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  if (out.length < before) {
    writeFileSync(path, out);
    saved += before - out.length;
    console.log(`[shrink-uploads] ${name}: ${meta.width}x${meta.height}, ${Math.round(before / 1024)}KB → ${Math.round(out.length / 1024)}KB`);
  }
}
console.log(`[shrink-uploads] saved ${Math.round(saved / 1024)}KB in total`);
