// 博客排版小工具（在 Pages CMS 里照常写 Markdown 就会生效）：
// 1. 「小知识框」：引用块（> ）的第一个字是粗体标签，例如
//      > **小知识**：……   或   > **Did you know?** ……
//    就会变成一个有标签的提示框；普通引用块仍然是大字金句。
// 2. 参考资料编号：正文里的 [1] [2] 会变成上标小数字，点一下跳到文末对应的参考资料；
//    文末「参考资料 / References」标题下面的编号列表会自动加上锚点。

const REF_HEADING = /^(参考资料|参考文献|references|sources)$/i;
const CITE = /\[(\d{1,2})\]/g;

const el = (tagName, properties, children) => ({ type: 'element', tagName, properties, children });
const text = (value) => ({ type: 'text', value });
const textOf = (n) => (n.type === 'text' ? n.value : (n.children || []).map(textOf).join(''));

function markCallouts(node) {
  if (!node.children) return;
  for (const child of node.children) {
    if (child.type === 'element' && child.tagName === 'blockquote') {
      const first = child.children.find((c) => c.type === 'element');
      const lead = first && first.tagName === 'p' && first.children.find((c) => !(c.type === 'text' && !c.value.trim()));
      if (lead && lead.type === 'element' && lead.tagName === 'strong') {
        child.properties.className = ['callout'];
        lead.properties.className = ['callout-label'];
        // 标签单独一行显示，所以去掉标签后面的「：」
        const next = first.children[first.children.indexOf(lead) + 1];
        if (next && next.type === 'text') next.value = next.value.replace(/^\s*[：:]\s*/, '');
        continue;
      }
    }
    markCallouts(child);
  }
}

function markReferences(tree) {
  const kids = tree.children || [];
  for (let i = 0; i < kids.length; i++) {
    const h = kids[i];
    if (h.type !== 'element' || !/^h[23]$/.test(h.tagName) || !REF_HEADING.test(textOf(h).trim())) continue;
    const list = kids.slice(i + 1).find((n) => n.type === 'element');
    if (!list || list.tagName !== 'ol') continue;
    list.properties.className = ['refs'];
    const start = Number(list.properties.start) || 1;
    list.children.filter((n) => n.type === 'element' && n.tagName === 'li')
      .forEach((li, k) => { li.properties.id = `ref-${start + k}`; });
    return list;
  }
  return null;
}

function linkCitations(node, refsList) {
  if (!node.children || node === refsList) return;
  if (node.type === 'element' && ['a', 'code', 'pre'].includes(node.tagName)) return;
  const out = [];
  for (const child of node.children) {
    if (child.type === 'text' && CITE.test(child.value)) {
      CITE.lastIndex = 0;
      let last = 0;
      for (const m of child.value.matchAll(CITE)) {
        if (m.index > last) out.push(text(child.value.slice(last, m.index)));
        out.push(el('sup', { className: ['cite'] }, [el('a', { href: `#ref-${m[1]}` }, [text(m[1])])]));
        last = m.index + m[0].length;
      }
      if (last < child.value.length) out.push(text(child.value.slice(last)));
    } else {
      linkCitations(child, refsList);
      out.push(child);
    }
  }
  node.children = out;
}

export default function rehypeBlog() {
  return (tree) => {
    markCallouts(tree);
    const refs = markReferences(tree);
    if (refs) linkCitations(tree, refs);
  };
}
