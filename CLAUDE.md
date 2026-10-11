# Channel website (Explainer Studio template)

Astro 5 static site, deployed to GitHub Pages by `.github/workflows/deploy.yml`, edited by the owner in Pages CMS
(`.pages.yml`). Bilingual: `zh` default, `en` under `/en/`. See README.md "What to change where".

- `git pull` before editing: Pages CMS commits straight to GitHub.
- Brand data lives in `src/data/site.json`; UI strings (both languages) in `src/data/ui.json` - a new string
  needs a key there and a field in the `ui` block of `.pages.yml`.
- Pages are thin wrappers in `src/pages/**` around `src/views/*.astro`.
- zh/en twins share a `slug`; build URLs with `slugOf()` (src/lib/twins.ts).
- Categories / series / specimen types must match in `src/lib/i18n.ts`, `src/content.config.ts` and `.pages.yml`.
- Post images inserted in the body use `/uploads/...`; this only works when the repo is `<user>.github.io`.
- Don't run `npm ci` inside a synced folder (Google Drive / OneDrive): build in a temporary clone.
