import { getCollection } from 'astro:content';
import type { Lang } from './i18n';
import { withUntranslated } from './twins';

/** Published posts, newest first */
export async function getPosts(lang?: Lang) {
  const all = await getCollection('posts', ({ data }) => !data.draft && (!lang || data.lang === lang));
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Posts for a language, plus posts in the other language that have no translation yet */
export async function getPostsForLang(lang: Lang) {
  const { items, fallback } = withUntranslated(await getPosts(), lang);
  return { posts: items.sort((a, b) => b.data.date.getTime() - a.data.date.getTime()), fallback };
}
