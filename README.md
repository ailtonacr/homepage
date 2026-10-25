# Ailton.dev.br — Portfolio / Portfólio

Editorial portfolio of Ailton Rodrigues, built from the Figma design:
https://www.figma.com/design/kfbZl1LOxYt9vIxsvlqT7H

## Architecture

- Astro 5 + TypeScript and static pre-rendering (SSG).
- Cloudflare Workers Static Assets; deployment through Wrangler.
- Custom responsive CSS, Astro Content Collections and bilingual Markdown/MDX.
- Google Analytics 4 optionally enabled after visitor consent.

## Development

Node.js 22 or later. Install with npm ci, run locally with npm run dev, and create a production build with npm run build.
Run npm run check:i18n after the build to verify real generated multilingual routes, metadata, and browser-language logic.
Validate Cloudflare packaging with npx wrangler deploy --dry-run. Publish with npm run build && npm run deploy.

## English and Portuguese

- Default: Portuguese (Brazil), accessible at /, /projetos/, /projetos/pastemax/, /sobre/, /contato/, /privacidade/.
- English: /en/, /en/projects/, /en/projects/pastemax/, /en/about/, /en/contact/, /en/privacy/.
- Initial navigation: script reads navigator.languages / navigator.language. PT or EN is selected based on browser priority; unmatched languages default to Portuguese.
- Manual language selection in the header saves PT/EN to localStorage, with a first-party cookie fallback. Manual choice always wins over browser detection and persists across visits.
- The switcher keeps equivalent routes and project slugs. Query parameters and fragments survive the first automatic redirect.
- All SEO tags include appropriate document language, canonical URL, localized title/description, and hreflang alternates for PT-BR, EN and x-default.
- Static rendering means this initial redirect is client-side. With JavaScript disabled, the language of the requested canonical route is served. No geolocation is used.
- Translatable interface text lives in src/i18n/index.ts. Add new keys in both language dictionaries. The English dictionary is checked for key parity by TypeScript.
- Case study text lives in src/content/projects/*.mdx (Portuguese) and src/content/projects/en/*.mdx (English), with matching filenames and explicit English locale metadata.
- Project titles, code snippets and brand names may remain unchanged; all descriptive copy, headings, summaries, highlights, and narrative body are localized.

## Analytics

Set PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX in the Cloudflare build environment. Without it, GA4 and the consent banner are not loaded.
With a measurement ID, Analytics is loaded only after explicit visitor consent. The choice is saved locally and can be revisited using the footer option.
Consent text is localized and the same choice applies across both language routes. Rebuild after changing the public build-time variable.

## Tests and content integrity

The GitHub workflow installs exact dependencies, builds the real Astro source, validates generated localized pages and executes the actual browser redirect script with simulated browser languages and stored preferences. It then verifies the Cloudflare deployment package without publishing.
The i18n validator checks each case study has a paired English and Portuguese version.

## Current scope

- Contact is via working GitHub and LinkedIn links; no pretend form or unconfigured server.
- Preview visuals are HTML/CSS illustrations, not screenshots of deployed products.
- Fonts use Google Fonts. Self-hosting can be added later for additional privacy.
- Verify that any added external project URLs are public before exposing them.
