// 中英文"双胞胎"：同一个网址名称（slug）、不同语言的文章或测验，会自动互相连接。
// 内部编号：中文 = rock-cycle，英文 = rock-cycle@en（避免两篇撞名）。
import type { Lang } from './i18n';

type Entry = { id: string; data: { lang: Lang } };

/** 网址里用的名称（去掉 @en） */
export const slugOf = (e: { id: string }) => e.id.replace(/@en$/, '');

/** 给 content.config.ts 用：决定每篇内容的内部编号 */
export function twinId({ entry, data }: { entry: string; data: Record<string, unknown> }) {
  const raw = String(data.slug || entry.replace(/\.(md|json)$/, '').split('/').pop());
  // 整理网址名称：大写变小写，空格和符号变成 -（例如 "Hello World!" → hello-world）
  const slug = raw.toLowerCase().replace(/[^a-z0-9一-鿿]+/g, '-').replace(/^-+|-+$/g, '') || 'post';
  return data.lang === 'en' ? `${slug}@en` : slug;
}

/** 找另一种语言的版本（没有就 undefined） */
export function findTwin<T extends Entry>(entry: T, all: T[]): T | undefined {
  return all.find((e) => e.data.lang !== entry.data.lang && slugOf(e) === slugOf(entry));
}

/** 某语言的列表：该语言的全部 + 另一种语言里还没翻译的 */
export function withUntranslated<T extends Entry>(all: T[], lang: Lang): { items: T[]; fallback: boolean } {
  const own = all.filter((e) => e.data.lang === lang);
  const others = all.filter((e) => e.data.lang !== lang && !findTwin(e, all));
  return { items: [...own, ...others], fallback: others.length > 0 };
}
