# Current Docs to Web-Verify

Authoritative Google and Schema.org documentation URLs to web-search BEFORE including any time-sensitive recommendation in an audit. The key insight: your training data on SEO topics is likely 6-18 months old; Google's guidance changes faster than that. A 90-second web-search saves you from recommending deprecated practice.

When in doubt, search for the topic + "Google Search Central" or "developers.google.com/search" to get the current authoritative position.

## Always check before recommending

### Structured data / rich results

- **Google Search Central — Structured Data Gallery:** https://developers.google.com/search/docs/appearance/structured-data
  - Tells you which rich result types are CURRENTLY eligible (deprecations announced here)
- **Per-type doc pages:** Article, FAQPage, HowTo, Recipe, Product, Review, VideoObject, SoftwareApplication, etc.
  - Each lists required and recommended properties (these change)
- **Rich Results Test (live validator):** https://search.google.com/test/rich-results
  - Paste a URL or HTML; tells you exactly which rich results the page is eligible for
  - **Caveat:** it only reports types Google still renders. Deprecated/removed types (HowTo; FAQ from ~June 2026) won't appear here even when the markup is valid Schema.org — absence in this tool ≠ invalid structured data. Distinguish *eligibility* (this tool) from *validity* (Schema.org).

### Core Web Vitals & Page Experience

- **Web Vitals overview:** https://web.dev/vitals/
- **Page Experience:** https://developers.google.com/search/docs/appearance/page-experience
  - Metric thresholds change (FID was retired in favor of INP in March 2024)
  - Re-verified 2026-08-14 — still current: **LCP < 2.5s, INP < 200ms, CLS < 0.1**, assessed at the **75th percentile** of page loads across mobile and desktop
  - Lab (Lighthouse) results are diagnostic; **field data (CrUX) is what Google uses.** Don't present a Lighthouse score as the site's Core Web Vitals.
  - The PageSpeed Insights API's keyless shared quota is frequently exhausted (HTTP 429). When it fails, say so and fall back to directly measured proxies — TTFB over several runs, stylesheet/script counts, lazy-loading coverage, preload/preconnect presence — labelled as proxies, not as CWV.

### AI features / generative search

- **Optimizing for generative AI features:** https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
  - Google's own position: no special files, markup, Markdown, or structured data are needed; `llms.txt` is not used by Google Search and "will neither harm nor help" rankings; content chunking, keyword-variant rewrites, and inauthentic mentions are named as ineffective
  - This is the citation to reach for whenever an "AEO/GEO" tactic is proposed
- **AI features and your website:** https://developers.google.com/search/docs/appearance/ai-features

### Local search

- **Google Business Profile ranking guidance:** https://support.google.com/business/answer/7091
  - Relevance / distance / prominence — the three factors, straight from Google
- **LocalBusiness structured data:** https://developers.google.com/search/docs/appearance/structured-data/local-business
  - Required vs recommended properties; use the most specific subtype; one entity per location

### Policy and fundamentals

- **Search spam policies:** https://developers.google.com/search/docs/essentials/spam-policies
  - The authority for refusing manipulative tactics — cite it rather than arguing from principle
- **Search Essentials / technical requirements:** https://developers.google.com/search/docs/essentials/technical
- **Helpful, reliable, people-first content:** https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- **Snippets and meta descriptions:** https://developers.google.com/search/docs/appearance/snippet
- **Crawlable links:** https://developers.google.com/search/docs/crawling-indexing/links-crawlable
- **Localized versions / hreflang:** https://developers.google.com/search/docs/specialty/international/localized-versions
- **Latest documentation updates (check when something feels stale):** https://developers.google.com/search/updates

### Indexing & canonical

- **Canonical link element:** https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- **Mobile-first indexing:** https://developers.google.com/search/mobile-sites/mobile-first-indexing
- **Sitemaps:** https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview

### Helpful Content & E-E-A-T

- **Creating helpful, reliable, people-first content:** https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- **E-E-A-T:** Search Quality Rater Guidelines are public PDFs, updated periodically

### Internal linking & site structure

- **Search Central — link best practices:** https://developers.google.com/search/docs/crawling-indexing/links-crawlable
- **JavaScript SEO:** https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics

## Often-stale topics (high verification priority)

The following topics turn over fast — always web-search before recommending:

- **FAQ rich results** — removed for *all* sites on 7 May 2026 (including the government/health sites kept after the Aug 2023 restriction). FAQ support also drops from the Rich Results Test (~June 2026) and the Search Console API (~Aug 2026). FAQPage markup is still parsed for entity understanding but yields no SERP feature. Verify before recommending FAQPage for SERP visibility.
- **HowTo rich results** — fully removed (2023; no surviving eligible sites). Don't recommend HowTo schema for SERP appearance; verify if a client insists.
- **Types retired in the 2025 "simplifying the search results page" round** — Book Actions, Course Info, Claim Review, Estimated Salary, Learning Video, Special Announcement, Vehicle Listing no longer produce rich results. Source: https://developers.google.com/search/blog/2025/06/simplifying-search-results
- **Practice Problems** — deprecation notice added; support removed from Search Console rich-result reporting, the Rich Results Test, and search-appearance filters from January 2026.
- **Retired SERP features often mistaken for structured-data types** — nutrition facts, nearby offers and events, local bikeshare station status, TV season selector, "Today's Doodle" box.
- **Rule of thumb for this whole category:** Google has been *reducing* the number of rich-result types for several years. When you are unsure whether a type still produces a SERP feature, the base rate favors "no." Check the gallery page for a deprecation notice before recommending anything.
- **Removing deprecated markup is not required** — Google has said unused structured data causes no problems for Search. Don't generate make-work by recommending cleanup.
- **AMP** — deprecated as Top Stories requirement; verify Google's current stance
- **Sitelinks search box** (SearchAction) — verify the current spec; the property structure has changed before
- **Author markup** (`author`, `sameAs`) — guidance shifted with E-E-A-T updates
- **Speakable schema** (for voice assistants) — currently limited rollout; verify scope
- **Indexing API** — only for JobPosting / BroadcastEvent currently; not general indexing
- **Crawl budget concerns** — guidance has shifted toward "most sites don't need to think about this"

## When the web-search finds contradictory results

If the official Google doc says one thing and a recent third-party article says another, trust the official doc. If two official docs contradict (this happens during transitions), note the conflict and recommend the more conservative interpretation.

If the web-search is inconclusive (no recent authoritative source), say so explicitly in the audit rather than picking a side: "Unable to verify current Google guidance on X; recommend deferring this recommendation until clarified."

## Format for citing current docs in audit output

When you include a verified-current recommendation, cite the doc URL + the date you accessed it:

> Add `WebApplication` schema to homepage to clarify the site is an interactive tool ([Google Search Central, accessed 2026-05-25](https://developers.google.com/search/docs/appearance/structured-data/software-app)).

This format makes the recommendation traceable and lets the next audit (yours or someone else's) verify the claim is still current.

## Format for citing deprecations in audit output

When pushing back on a deprecated recommendation, cite the source and date:

> The original audit recommends adding FAQ schema for rich snippets. Pushing back: FAQ rich results were removed for all sites in May 2026 ([Google announcement, accessed 2026-05-25](https://developers.google.com/search/blog/...)). The structured data still aids entity understanding but no longer produces SERP rich results.

## A note on Schema.org

Schema.org spec is more stable than Google's rich-result eligibility — Google can stop *displaying* a schema type while the spec remains valid. Always distinguish "Schema.org accepts this" from "Google rewards this with rich results." Both matter, but they update on different cadences.

- **Schema.org:** https://schema.org/ — for type and property definitions
- **Google Search Central:** for rich-result eligibility
