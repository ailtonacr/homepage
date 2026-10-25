# Portfolio — repository instructions for coding agents

This repo is the public personal portfolio for Ailton Rodrigues. Source of truth for the current app: Astro files and the GitHub PR, not a speculative Figma prototype. Use a feature branch and PR; never push directly to main or deploy without explicit authorization.

## Commands and acceptance

- npm ci
- npm run build
- npx tsc --noEmit
- npm run check:i18n
- npm run check:analytics
- npx wrangler deploy --dry-run

Do not reimplement application logic in tests. Integration regressions must execute the real code or actual compiled output.

## Product and content invariants

- Static Astro (SSG) on Cloudflare Workers Static Assets; no backend or pretend contact form.
- Every visitor-facing phrase must exist in both PT and EN. Shared copy lives in src/i18n/index.ts; project-specific copy lives in paired MDX documents.
- PT is the fallback on the canonical / entry; explicitly requested localized URLs must stay accessible. Persist PT/EN manual selection, and preserve translated routes. Check hreflang, canonical, OG, sitemap.
- GA4 must not load before opt-in. Declining/revoking must prevent further event collection, including in the already-running tab. Avoid PII in events; never infer visitor consent.
- Career claims require evidence from the user or their verified public profile. LinkedIn's publicly indexed snippet may be stale: do not assume current internship or completed degree.
- Never fabricate public repository links, product availability, education completion, team impact metrics, or professional titles.
- Use semantic HTML, keyboard focus, mobile-friendly type sizing and reduced motion.

## Review process

When reviewing a PR, use [.agents/skills/portfolio-code-review/SKILL.md](.agents/skills/portfolio-code-review/SKILL.md).
