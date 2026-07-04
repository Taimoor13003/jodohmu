# SEO Invariants — read before touching robots, sitemap, metadata, or language

The site lost 6 months of indexing (only the homepage was indexed) because SEO
signals were changed repeatedly. The fundamentals have been correct since
2026-07-03. **Stability is the strategy.** Do not "improve" these signals
without a concrete, diagnosed reason.

## Never change these

1. **Canonical host is `https://www.jodohmu.com`** (www, https). `metadataBase`
   in `src/app/layout.tsx` and `NEXT_PUBLIC_SITE_URL` stay pointed there.
   Non-www 301s to www in `next.config.mjs`.
2. **One URL per page, one language per URL.** The id/en toggle is client-side
   (localStorage). There are NO `/en/*` or `/id/*` alternate pages; `/id/*`
   301-redirects to `/*`. Keep those redirects forever.
3. **Never add hreflang** (`alternates.languages`) unless real alternate URLs
   exist. Pointing hreflang at non-existent routes hurts crawling.
4. **Never set a global `alternates.canonical` in `layout.tsx`.** Children
   inherit it and Google deindexes every page as a homepage duplicate (this
   was the original bug, fixed 2026-06-05). Every public page sets its own
   self-referential canonical.
5. **Slugs are frozen.** Renaming a blog slug throws away its index entry.
   If a rename is truly unavoidable, add a 301 redirect in `next.config.mjs`.
6. **`src/app/sitemap.ts`: add URLs only** — never remove or restructure.
   **`src/app/robots.ts`: don't touch** unless something is actually broken.
7. **JSON-LD must be server-rendered** via plain `<script type="application/ld+json">`
   tags — never `next/script` with `strategy="afterInteractive"` (crawlers may
   never hydrate the page, so the schema would be invisible).
8. **Google Search Console verification meta tag** in `layout.tsx` stays.
9. **Titles must NOT include "| Jodohmu"** — the root layout template
   (`"%s | Jodohmu"`) appends the brand automatically. Adding it manually
   produces "… | Jodohmu | Jodohmu".

## Language rules (Indonesian-first)

- SSR always renders Indonesian: `<html lang="id">`, LanguageContext defaults
  to `"id"`. English is a client-side toggle only.
- **`src/locales/id.json` must contain every key `en.json` has.** `t()` falls
  back to English when an id key is missing — a missing key silently ships
  English text into the Indonesian server-rendered page.
- No hardcoded user-visible strings in public components — always `t()`.
- Exception: the language-switcher labels "Bahasa Indonesia" / "English" in
  `header.tsx` are intentionally untranslated (endonym convention — users
  stuck in the wrong language must recognize their own).
- `/pricing/international` is intentionally English — it targets foreigners
  seeking Indonesian partners. Do not translate it.

## AEO (AI discoverability)

- `public/llms.txt` is the plain-language business summary AI models read.
  Keep it factual and current (pricing page links, contact, service model).
- Structured data lives in `layout.tsx` (WebSite + LocalBusiness + Service),
  per-article BlogPosting/Breadcrumb in `article-is-jodohmu.tsx`, FAQPage in
  `faq-page.tsx` only.

## After deploying metadata changes

Request re-indexing of changed URLs in Google Search Console (URL Inspection).
Do NOT resubmit or restructure the sitemap for copy-only changes.
