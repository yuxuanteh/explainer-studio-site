# Explainer Studio · channel website template

A free, bilingual home for a YouTube science channel: a home page, videos pulled automatically from your
channel, a blog, quizzes, a specimen / photo gallery, an About page, and an optional live earthquake monitor.
It runs on GitHub Pages, so there is no server and no cost, and you write posts in a web editor (Pages CMS).
It started as the website of the 金釘子 GoldenSpike channel.

It is built with Astro 5. The default languages are Chinese (the main language) and English (under `/en/`).

## The easy way: let Claude do it

Install the `explainer-studio` plugin in Claude Code and say **"make my channel website"**. The plugin is at
https://github.com/yuxuanteh/explainer-studio. The `channel-website` skill creates your copy of this template,
puts in your name, logo, colours, fonts and links, and publishes it. It also walks you through connecting the
web editor.

## By hand

1. Click **Use this template → Create a new repository**. Name it `<your-github-name>.github.io` and make it
   public. With that name the site lives at `https://<your-github-name>.github.io`, and images inside posts
   work. Under any other repo name the site gets a sub-path, and images inserted in posts break.
2. In the new repo go to **Settings → Pages → Source** and choose **GitHub Actions**. Wait for the green tick
   under **Actions** (1-2 minutes), then open the site.
3. Go to https://app.pagescms.org, sign in with GitHub, and give the Pages CMS app access to this repo only.
4. In Pages CMS, open **网站设定** (site settings). Fill in your name, YouTube channel ID (the `UC...` string
   under YouTube Studio → Settings → Channel → Advanced), links and home page text. Save, and the site
   rebuilds by itself.

## What to change where

| What | Where |
|---|---|
| Name, links, home page text, YouTube channel ID, analytics token | `src/data/site.json` (Pages CMS: 网站设定) |
| Every button and heading, in both languages | `src/data/ui.json` (Pages CMS: 网站文字) |
| Colours | the top of `src/styles/global.css` |
| Fonts | the Google Fonts link in `src/layouts/Base.astro`, plus `--font-*` in `global.css` |
| Logo and icons | `public/logo-mark.svg`, `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `og-default.png` |
| Home page layout | `src/views/Home.astro` (the striped "rock layers" behind the hero are in there too) |
| Menu items | `src/components/Nav.astro` |
| Blog categories, video series, gallery types | `src/lib/i18n.ts`, `src/content.config.ts`, `.pages.yml` (keep the three in step) |
| Editor labels (currently Chinese) | `.pages.yml` |
| Posts, quizzes, About page | `src/content/` (or Pages CMS) |
| Uploaded images | `public/uploads/` |

Optional extras:
- **Earthquake monitor** (`/monitor`) shows live USGS data. If it doesn't suit your channel, remove it from the
  menu in `Nav.astro` and delete `src/pages/monitor.astro`, `src/pages/en/monitor.astro` and
  `src/views/Monitor.astro`.
- **Auto-translate.** When you publish a post or quiz in one language, Claude writes the other-language version
  as a draft for you to check. Setting it up: run `claude setup-token` on your computer, then add the token
  under **Settings → Secrets and variables → Actions** as `CLAUDE_CODE_OAUTH_TOKEN`. Without the secret, the
  workflow just skips. The rules are in `scripts/translate-prompt.md`.

## YouTube Shorts

Shorts get their own **"In 60 Seconds"** section on the videos page, grouped by series, and they stay out of the
main grid and the home page. The site recognises Shorts from your channel feed automatically. You can also
mark one yourself: in Pages CMS → **视频分类**, add the video ID and set the type (类型) to *短片* (short), or put
`"format": "short"` on its entry in `src/data/videos.json`. The section title and subtitle can be edited in
**网站文字**. If there are no Shorts, the section is hidden.

## Visitor statistics (optional, free)

The site can count visitors with **Cloudflare Web Analytics**. It uses no cookies, so you don't need a cookie
banner, and it doesn't need your site to be hosted on Cloudflare.

1. Sign up free at https://dash.cloudflare.com, then open **Analytics & Logs → Web Analytics → Add a site**.
2. Enter your site's address (e.g. `yourname.github.io`) and choose the manual **JS snippet** option.
3. Copy only the token: the value after `"token": "` in the snippet, a 32-character code.
4. Paste it in Pages CMS → **网站设定** → *Cloudflare 访客统计代码* (or into `cloudflareAnalyticsToken` in
   `src/data/site.json`) and save. After the rebuild, visits show up in the Cloudflare dashboard within a few
   minutes.

Leave the field empty to turn analytics off. Nothing is loaded then. The token is not a secret; it is visible in
your page source anyway.

## Writing posts

- Pull quote: a paragraph on its own starting with `> `.
- Callout box: a quote that starts with a bold label, e.g. `> **Did you know?** ...` or `> **小知识**：...`.
- Citations: `[1]` in the text plus a numbered list under `## References` (or `## 参考资料`) at the end.
- Images: drag them into the editor. Keywords in the alt text control the size and position: `#小` small,
  `#中` medium, `#左` left, `#右` right.
- Translations: the other-language version uses the **same slug** with the other language selected. The two
  posts link to each other automatically.

## Preview on your own computer (optional)

Install Node.js 22, then run `npm install` and `npm run dev`, and open http://localhost:4321.

## Licence

MIT. Fonts are loaded from Google Fonts (SIL OFL). Earthquake data comes from USGS (public domain). The monitor
basemap is Esri World Dark Gray.
