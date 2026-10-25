# SEO Invariants — read before touching robots, sitemap, metadata, or language

The site lost 6 months of indexing (only the homepage was indexed) because SEO
signals were changed repeatedly. The fundamentals have been correct since
2026-07-03. **Stability is the strategy.** Do not "improve" these signals
without a concrete, diagnosed reason.

## Never change these

1. **Canonical host is `https://www.jodohmu.com`** (www, https). `metadataBase`
   in `src/app/layout.tsx` and `NEXT_PUBLIC_SITE_URL` stay pointed there.
   Non-www 301s to www in `next.config.mjs`.
2. **One URL per page, one language per URL.** Indonesian lives at the root
   (`/pricing`), English under `/en` (`/en/pricing`). There are no `/id/*`
   pages; `/id/*` 301-redirects to `/*`. Keep that redirect forever.
3. **hreflang only through `languageAlternates()`** in `src/lib/i18n-routes.ts`.
   It emits a self-canonical plus reciprocal `id` / `en` / `x-default` links,
   and only for pairs that really exist. Never hand-write `alternates.languages`.
4. **Never set a global `alternates.canonical` in `layout.tsx`.** Children
   inherit it and Google deindexes every page as a homepage duplicate (this
   was the original bug, fixed 2026-06-05). Every public page sets its own
   self-referential canonical.
5. **Slugs are frozen**, in both languages. Renaming a blog slug throws away
   its index entry. If a rename is truly unavoidable, add a 301 redirect in
   `next.config.mjs`. Indonesian slugs never change to match the English ones.
6. **`src/app/sitemap.ts`: add URLs only** — never remove or restructure. It
   lists each paired page in both languages with the same hreflang set.
   **The one exception: a URL that now 301s.** A redirected URL must leave the
   sitemap (Google treats a sitemap URL that redirects as an error), and the
   URL it redirects to takes its place. The sitemap is built from `blogPosts`,
   so removing a post's entry there removes it here too. Only do this together
   with the redirect in `next.config.mjs`; never just drop a live URL.
   **`src/app/robots.ts`: don't touch** unless something is actually broken.
7. **JSON-LD must be server-rendered** via plain `<script type="application/ld+json">`
   tags — never `next/script` with `strategy="afterInteractive"` (crawlers may
   never hydrate the page, so the schema would be invisible).
8. **Google Search Console verification meta tag** in `layout.tsx` stays.
9. **Titles must NOT include "| Jodohmu"** — the root layout template
   (`"%s | Jodohmu"`) appends the brand automatically. Adding it manually
   produces "… | Jodohmu | Jodohmu".

## Language rules (Indonesian at the root, English under /en)

- **Two root layouts.** `src/app/(id)/layout.tsx` renders `<html lang="id">`
  for every root URL (and the app pages); `src/app/(en)/layout.tsx` renders
  `<html lang="en">` for `/en/*`. Both use `SiteRoot` in
  `src/components/layout/site-root.tsx`. Unknown URLs fall through to
  `(id)/[...notFound]` so the 404 keeps the site header and footer.
- **Every Indonesian ↔ English pair is listed once** in
  `src/lib/i18n-routes.ts` (pages) or as `enSlug` in `src/lib/blog-posts.ts`
  (posts). The sitemap, hreflang, the language switcher and in-page links all
  read from there. Adding an English page = add the pair + the `/en` route.
- **The language switcher navigates** between the twin URLs; it never
  translates a paired page in place. Pages without an English twin
  (mitra, presentations, dashboard, admin) still translate in place
  from the saved preference. Never auto-redirect by country or browser
  language — Googlebot crawls without one and would lose the Indonesian pages.
- **Internal links** in shared components go through `localize()` from
  `useLanguage()`, so English pages link to English pages.
- **English blog posts** are rendered by `src/app/(en)/en/blog/[slug]/page.tsx`
  from the `en` half of the same JSON in `src/content/blog/`; the search title
  and description for each live in that file. New posts get an Indonesian slug
  and an English slug from the start.
- **`src/locales/id.json` must contain every key `en.json` has.** `t()` falls
  back to English when an id key is missing — a missing key silently ships
  English text into an Indonesian page.
- No hardcoded user-visible strings in public components — always `t()` or a
  per-language copy object.
- Exception: the language-switcher labels "Bahasa Indonesia" / "English" are
  intentionally untranslated (endonym convention).

## AEO (AI discoverability)

- `public/llms.txt` is the plain-language business summary AI models read.
  Keep it factual and current (pricing page links, contact, service model).
  It is English-first on purpose and says Jodohmu is for every faith and for
  international clients — keep that framing.
- Structured data lives in `layout.tsx` (WebSite + LocalBusiness + Service),
  per-article BlogPosting/Breadcrumb (and FAQPage for the post's own FAQ) in
  each post's `page.tsx`, the site FAQPage in `faq-page.tsx`.

## Merged posts (Oct 2026)

Eleven thin 2024–25 posts were merged into four full guides in
`src/content/blog/`. Their old URLs 301 to the guide that covers the topic
(list in `next.config.mjs`). Keep those redirects forever:

- `dating-app-vs-biro-jodoh` ← why-dating-apps-fail, perjodohan-halal-vs-dating-app,
  cari-jodoh-serius, what-makes-taaruf-different-from-dating
- `cara-kerja-jodohmu` ← step-by-step-process, how-we-verify-every-candidate,
  how-meetings-are-supervised, syariah-safeguards
- `perkenalan-pertama-dan-keluarga` ← tips-taaruf-pertama, family-involvement
- `apakah-biro-jodoh-menjamin-jodoh` ← does-jodohmu-guarantee-a-match

## After deploying metadata changes

When new URLs are added (for example the /en pages), resubmit `sitemap.xml`
in Search Console once and request indexing for the most important new URLs.

Request re-indexing of changed URLs in Google Search Console (URL Inspection).
Do NOT resubmit or restructure the sitemap for copy-only changes.
