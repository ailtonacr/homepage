---
name: portfolio-code-review
description: Review changes to the Astro portfolio (ailtonacr/homepage) for real regressions in browser-language navigation, consent/analytics, accessibility, Cloudflare deployment, content truthfulness, and bilingual SEO. Use for PR review, audits, or pre-merge security checks.
---

# Portfolio code review

## Boundaries

Review the actual PR diff AND the code paths it changes. Do not automatically trust generated code, old memories, or CI success. Use the current branch and its tests as evidence; respect the repo's AGENTS.md.

## Specialized review passes

1. **Correctness and integration.** Trace each changed entry point through real renderers; validate built output, direct links, error paths, locale persistence, keyboard behavior and mobile layout. Flag user-observable failures.
2. **Privacy and security.** Trace Google tag loading, consent transitions, collection after revocation, localStorage failures, event payloads, external requests and links. Prefer fail-closed defaults; use OWASP's risk-based secure review checklist.
3. **Multilingual SEO and performance.** Both locales must have unique URLs and directly accessible, correctly localized HTML, canonical/hreflang tags, and project copy. Redirects must not make URLs unindexable. Check language detection edge cases and script use.
4. **Personal truthfulness.** Cross-check names, dates, roles, schools, company affiliations, skills and public-project status against user-confirmed evidence. Don't turn a planned feature into a shipped accomplishment.
5. **Cloudflare and CI.** Check build scripts, Wrangler assets, generated routes, dependency changes, tests and whether dry-run is mistakenly interpreted as deployment success.

## Method

- Follow Anthropic's code-review approach: independently inspect bug categories, cross-check the diff and context, verify high-confidence findings, deduplicate, and rank by severity.
- Follow Codex review guidance: add a few durable repo-specific guardrails to AGENTS.md rather than noisy formatting instructions.
- For each consequential finding: source path/line, reproducer or concrete path to failure, severity P0–P3, fix, and a regression test against the real code.
- Don't report speculative issues as confirmed. If proof is missing, say so.
- Separate automated checks from human judgments. CI passing is not proof of correct behavior.

## Acceptance

Run the real Astro build and typecheck, test both language variants, and the actual generated locale + consent inline scripts. Verify Wrangler --dry-run without deploying. Leave the PR open for review unless explicitly asked to merge.

## References

- https://github.com/anthropics/claude-code/blob/main/plugins/code-review/commands/code-review.md
- https://developers.openai.com/blog/custom-code-review-rules-for-codex
- https://cheatsheetseries.owasp.org/cheatsheets/Secure_Code_Review_Cheat_Sheet.html
- https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
