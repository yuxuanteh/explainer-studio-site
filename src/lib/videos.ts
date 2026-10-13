// 视频列表：发布网站时自动从 YouTube 读取最新视频（RSS），
// 再用 src/data/videos.json 补上系列分类和英文标题。
import site from '../data/site.json';
import manual from '../data/videos.json';

export interface Video {
  id: string;          // YouTube video ID ('' if unknown)
  title: string;
  titleEn?: string;
  series: string;
  date: Date;
  thumb?: string;
  href: string;
  format: 'video' | 'short';   // short = YouTube Short, shown in the「60秒看懂」section
}

type ManualVideo = { youtubeId?: string; title: string; titleEn?: string; series?: string; date?: string; format?: string };

function decode(s: string): string {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

async function fetchRss(): Promise<{ id: string; title: string; date: Date; short: boolean }[]> {
  const feed = `https://www.youtube.com/feeds/videos.xml?channel_id=${site.youtubeChannelId}`;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(feed, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    const entries = xml.split('<entry>').slice(1);
    return entries.map((e) => ({
      id: (e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) || [])[1] || '',
      title: decode((e.match(/<title>([^<]*)<\/title>/) || [])[1] || ''),
      date: new Date((e.match(/<published>([^<]+)<\/published>/) || [])[1] || Date.now()),
      short: /<link rel="alternate" href="[^"]*\/shorts\//.test(e),   // the feed links Shorts as /shorts/<id>
    })).filter((v) => v.id);
  } catch (err) {
    console.warn(`[videos] Could not read YouTube RSS (${(err as Error).message}); using src/data/videos.json only.`);
    return [];
  }
}

let cache: Promise<Video[]> | undefined;

export function getVideos(): Promise<Video[]> {
  cache ??= (async () => {
    const list = (manual.videos as ManualVideo[]) ?? [];
    const byId = new Map(list.filter((m) => m.youtubeId).map((m) => [m.youtubeId!, m]));
    const rss = await fetchRss();
    const toVideo = (id: string, title: string, date: Date, m?: ManualVideo, short = false): Video => {
      const isShort = m?.format ? m.format === 'short' : short;
      return {
        id,
        title: m?.title || title,
        titleEn: m?.titleEn,
        series: m?.series || 'other',
        date,
        thumb: id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : undefined,
        href: !id ? site.youtubeUrl : isShort ? `https://www.youtube.com/shorts/${id}` : `https://www.youtube.com/watch?v=${id}`,
        format: isShort ? 'short' : 'video',
      };
    };

    let videos: Video[];
    if (rss.length) {
      videos = rss.map((r) => toVideo(r.id, r.title, r.date, byId.get(r.id), r.short));
      // Older videos that are in videos.json but no longer in the RSS (it only lists the latest 15)
      for (const m of list) {
        if (m.youtubeId && !rss.some((r) => r.id === m.youtubeId)) {
          videos.push(toVideo(m.youtubeId, m.title, new Date(m.date || 0), m));
        }
      }
    } else {
      videos = list.map((m) => toVideo(m.youtubeId || '', m.title, new Date(m.date || 0), m));
    }
    return videos.sort((a, b) => b.date.getTime() - a.date.getTime());
  })();
  return cache;
}
