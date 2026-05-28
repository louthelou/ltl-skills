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

### Core Web Vitals & Page Experience

- **Web Vitals overview:** https://web.dev/vitals/
- **Page Experience:** https://developers.google.com/search/docs/appearance/page-experience
  - Metric thresholds change (FID was retired in favor of INP in March 2024)
  - Current as of late 2025: LCP < 2.5s, INP < 200ms, CLS < 0.1

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

- **FAQ rich results** — deprecated for most sites in May 2026 (verify the current status before recommending FAQPage schema for SERP visibility)
- **HowTo rich results** — also deprecated for most sites; verify current status
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

> The original audit recommends adding FAQ schema for rich snippets. Pushing back: FAQ rich results were deprecated for most sites in May 2026 ([Google announcement, accessed 2026-05-25](https://developers.google.com/search/blog/...)). The structured data still aids entity understanding but no longer produces SERP rich results.

## A note on Schema.org

Schema.org spec is more stable than Google's rich-result eligibility — Google can stop *displaying* a schema type while the spec remains valid. Always distinguish "Schema.org accepts this" from "Google rewards this with rich results." Both matter, but they update on different cadences.

- **Schema.org:** https://schema.org/ — for type and property definitions
- **Google Search Central:** for rich-result eligibility
