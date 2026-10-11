import { getCollection } from 'astro:content';
import type { Lang } from './i18n';
import { withUntranslated } from './twins';

export async function getQuizzes(lang?: Lang) {
  const all = await getCollection('quizzes', ({ data }) => !data.draft && (!lang || data.lang === lang));
  return all.sort((a, b) => a.data.order - b.data.order);
}

/** Quizzes for a language, plus quizzes in the other language that have no translation yet */
export async function getQuizzesForLang(lang: Lang) {
  const { items, fallback } = withUntranslated(await getQuizzes(), lang);
  return { quizzes: items.sort((a, b) => a.data.order - b.data.order), fallback };
}
