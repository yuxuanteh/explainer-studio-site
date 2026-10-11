// 网站上固定的文字（按钮、标题等）都在这里，中英文各一份。
import ui from '../data/ui.json';
export type Lang = 'zh' | 'en';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Link to a page in the given language, e.g. url('en', '/blog') -> /en/blog */
export function url(lang: Lang, path = '/'): string {
  const clean = path === '/' ? '' : path.replace(/\/$/, '');
  return `${base}${lang === 'en' ? '/en' : ''}${clean}` || '/';
}

/** Link to a file in /public, e.g. an uploaded image */
export function asset(path?: string): string {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  return `${base}/${path.replace(/^\//, '')}`;
}

/** The same page in the other language */
export function switchLangPath(pathname: string, to: Lang): string {
  let p = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  p = p.replace(/^\/en(?=\/|$)/, '') || '/';
  return url(to, p);
}

export const categories = {
  geo: { zh: '地质与地震', en: 'Geology & Quakes' },
  life: { zh: '生活', en: 'Life' },
  travel: { zh: '旅行', en: 'Travel' },
} as const;

export const series = {
  rocks: { zh: '岩石', en: 'Rocks' },
  seismology: { zh: '地震', en: 'Seismology' },
  landforms: { zh: '地貌', en: 'Landforms' },
  quakes: { zh: '历史大地震', en: 'Famous Quakes' },
  news: { zh: '真实事件', en: 'Real Events' },
  vlog: { zh: 'Vlog', en: 'Vlog' },
  channel: { zh: '频道', en: 'Channel' },
  other: { zh: '其他', en: 'Other' },
} as const;

export const specimenTypes = {
  igneous: { zh: '火成岩', en: 'Igneous' },
  sedimentary: { zh: '沉积岩', en: 'Sedimentary' },
  metamorphic: { zh: '变质岩', en: 'Metamorphic' },
  mineral: { zh: '矿物', en: 'Mineral' },
  fossil: { zh: '化石', en: 'Fossil' },
} as const;

// 按钮、标题等文字放在 src/data/ui.json（可以在 Pages CMS「网站文字」里修改）
const dict: Record<string, { zh: string; en: string }> = ui;

export type Key = keyof typeof ui;
export function t(lang: Lang, key: Key): string {
  return dict[key]?.[lang] ?? '';
}

export function formatDate(d: Date, lang: Lang): string {
  return d.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
}

/** Rough reading time: ~400 Chinese characters or ~220 English words per minute */
export function readingTime(text: string): number {
  const cjk = (text.match(/[一-鿿]/g) || []).length;
  const words = text.replace(/[一-鿿]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(cjk / 400 + words / 220));
}
