// 文章里的图片：把「图片说明」变成图片下方的小字，并读取里面的排版关键词。
//   #小 / #small    → 小图（约 40% 宽）
//   #中 / #medium   → 中图（约 65% 宽）
//   #左 / #left     → 靠左，文字绕在右边（手机上自动变回整行）
//   #右 / #right    → 靠右，文字绕在左边
//   没写关键词      → 整行宽度、置中
// 例：图片说明写「吉隆坡的石灰岩山 #小 #右」

const KEYWORDS = {
  '小': 'small', small: 'small',
  '中': 'medium', medium: 'medium',
  '左': 'left', left: 'left',
  '右': 'right', right: 'right',
};
const KEYWORD_RE = /#(小|中|左|右|small|medium|left|right)(?![a-z])/gi;
// Pages CMS 上传时，预设说明会是文件名（例如 IMG_1234.jpg），这种不显示
const FILENAME_RE = /^[\w\-. ()]+\.(jpe?g|png|gif|webp|avif|svg|heic)$/i;

function parseAlt(alt) {
  const classes = new Set();
  const caption = String(alt || '')
    .replace(KEYWORD_RE, (_, k) => { classes.add(KEYWORDS[k.toLowerCase()] || KEYWORDS[k]); return ''; })
    .replace(/\s+/g, ' ')
    .trim();
  return { classes: [...classes].map((c) => `fig-${c}`), caption: FILENAME_RE.test(caption) ? '' : caption };
}

const isImg = (n) => n && n.type === 'element' && n.tagName === 'img';
const isBlank = (n) => n.type === 'text' && !n.value.trim();
const isBr = (n) => n.type === 'element' && n.tagName === 'br';

function toFigure(img) {
  const { classes, caption } = parseAlt(img.properties.alt);
  img.properties.alt = caption;
  img.properties.loading = 'lazy';
  const children = [img];
  if (caption) children.push({ type: 'element', tagName: 'figcaption', properties: {}, children: [{ type: 'text', value: caption }] });
  return { type: 'element', tagName: 'figure', properties: { className: ['fig', ...classes] }, children };
}

function walk(node) {
  if (!node.children) return;
  const out = [];
  for (const child of node.children) {
    // 一个段落里只有图片（可能好几张）→ 每张变成独立的 figure
    if (child.type === 'element' && child.tagName === 'p') {
      const meaningful = child.children.filter((c) => !isBlank(c) && !isBr(c));
      if (meaningful.length && meaningful.every(isImg)) {
        meaningful.forEach((img) => out.push(toFigure(img)));
        continue;
      }
    }
    walk(child);
    out.push(child);
  }
  node.children = out;
}

export default function rehypeFigures() {
  return (tree) => walk(tree);
}
