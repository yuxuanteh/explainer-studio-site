// Runs in the browser: reads live earthquake data from the USGS (free, no key needed).
export const FEEDS = {
  day45: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson',
  week45: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson',
  day25: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson',
} as const;
export type FeedKey = keyof typeof FEEDS;

// [south, west, north, east]
export const REGIONS = {
  global: null,
  japan: [24, 122, 46, 150],
  seasia: [-11, 92, 21, 128],
} as const;
export type RegionKey = keyof typeof REGIONS;

export interface Quake { id: string; mag: number; place: string; time: number; depth: number; lat: number; lon: number; url: string }

export async function fetchQuakes(feed: FeedKey): Promise<Quake[]> {
  const res = await fetch(FEEDS[feed]);
  if (!res.ok) throw new Error(`USGS ${res.status}`);
  const json = await res.json();
  return (json.features as any[]).map((f) => ({
    id: f.id,
    mag: f.properties.mag ?? 0,
    place: f.properties.place ?? '',
    time: f.properties.time,
    depth: f.geometry.coordinates[2],
    lon: f.geometry.coordinates[0],
    lat: f.geometry.coordinates[1],
    url: f.properties.url,
  })).sort((a, b) => b.time - a.time);
}

export function inRegion(q: Quake, region: RegionKey): boolean {
  const box = REGIONS[region];
  if (!box) return true;
  const [s, w, n, e] = box;
  return q.lat >= s && q.lat <= n && q.lon >= w && q.lon <= e;
}

/** Colour by magnitude: bigger = hotter */
export function magColor(m: number): string {
  if (m >= 7) return '#FF4D2E';
  if (m >= 6) return '#FF8A1F';
  if (m >= 5) return '#F2B90D';
  if (m >= 4) return '#E6D27A';
  return '#9FD8DC';
}

export function timeAgo(ms: number, lang: string): string {
  const mins = Math.round((Date.now() - ms) / 60000);
  const rtf = new Intl.RelativeTimeFormat(lang === 'zh' ? 'zh-CN' : 'en', { numeric: 'auto' });
  if (mins < 60) return rtf.format(-mins, 'minute');
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return rtf.format(-hrs, 'hour');
  return rtf.format(-Math.round(hrs / 24), 'day');
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

export function quakeItemHtml(q: Quake, lang: string, depthLabel: string): string {
  return `<li><a class="qitem" href="${escapeHtml(q.url)}" target="_blank" rel="noopener">
    <span class="qmag" style="--c:${magColor(q.mag)}">${q.mag.toFixed(1)}</span>
    <span class="qinfo"><span class="qplace">${escapeHtml(q.place)}</span>
    <span class="qmeta">${timeAgo(q.time, lang)} · ${depthLabel} ${Math.round(q.depth)} km</span></span></a></li>`;
}
