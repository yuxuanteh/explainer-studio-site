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

## Security and secrets

These rules are permanent for every session in this project.

- **Secure coding.** Every time you write or change code, check it for security vulnerabilities (injection, missing auth,
  path traversal, open redirects, broad CORS, `${{ }}` expressions inside `run:`) and for secret exposure (secrets in logs,
  error messages, URLs, client bundles, CLI flags). Fix it or tell the owner.
- **No hardcoded secrets.** Never put API keys, tokens, passwords or credentials in code, config, docs, tests or CI files.
  Read them from environment variables (or the platform's secret store). Every file that holds a secret must be in
  `.gitignore` before it is created; `.env.example` files hold empty values only.
- **Scan before finishing or committing.** Run BOTH scanners on the repository and report the result (including "clean")
  before you finish a task that changed files and before every commit. Show findings redacted, never the full value,
  and stop for the owner's decision if anything is found:
  ```bash
  gitleaks git . --log-opts=--all --redact       # full history, all branches
  gitleaks git . --pre-commit --redact           # unstaged changes
  gitleaks git . --pre-commit --staged --redact  # staged changes
  trufflehog git file://. --no-verification      # full history
  ```
- Project specifics: this is a public template. `CLAUDE_CODE_OAUTH_TOKEN` exists only as a GitHub Actions secret.
  Workflows keep least-privilege `permissions:`, actions pinned to full commit SHAs, and `@anthropic-ai/claude-code`
  pinned to an exact version; the translate job checks out with `persist-credentials: false` so Claude never sees
  `GITHUB_TOKEN`.
