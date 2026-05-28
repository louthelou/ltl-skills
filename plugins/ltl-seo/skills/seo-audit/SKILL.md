---
name: seo-audit
description: All-in-one, verification-first SEO — technical SEO, on-page, structured data, internal linking & site architecture, keyword & content strategy, competitor analysis, AEO/AI-visibility, and programmatic-SEO-at-scale. MANDATORY verification methodology: inspect the actual rendered HTML and source files BEFORE claiming anything is missing, and web-search current search-engine documentation to verify any time-sensitive recommendation BEFORE reporting it. Use whenever the user asks for an SEO audit, says "improve SEO" or "rank better", wants keyword research or a content-gap or competitor analysis, asks to "review" or "verify" another AI's SEO report, is debugging Search Console issues, is reviewing structured data / JSON-LD, wants to be cited by AI search engines (AEO), or is questioning canonical/architecture strategy for large programmatic sites. Especially valuable when the user pastes an SEO report from another tool or AI and asks to apply it — the verification-first methodology catches the false positives those audits routinely produce.
---

# SEO Audit — all-in-one, verification-first

This skill runs the full surface of SEO work — technical auditing, on-page, structured data, internal linking and site architecture, keyword and content strategy, competitor analysis, AI-visibility (AEO), and programmatic-SEO-at-scale — on a single discipline: **inspect first, web-verify second, recommend third.**

That discipline is the whole point. SEO guidance changes constantly — directives get deprecated, new schema types appear, search engines change their stance on canonicals and rich results, and a ranking signal from last year may be neutral or penalized today. Breadth without verification is worse than useless: it produces confident, wrong recommendations at scale.

LLM-generated SEO work fails in two distinct, repeatable ways. Every part of this skill exists to prevent them:

1. **Confabulating absences.** "No robots.txt." "No sitemap." "Canonical tags missing." "No JSON-LD found." These claims appear in nearly every AI SEO audit and are usually wrong — the auditor looked at rendered visible content and never actually requested `/robots.txt`, `/sitemap.xml`, or read the document `<head>`. The fix: curl those URLs / grep the source before claiming absence.

2. **Stale recommendations from training data.** Confidently recommending FAQ schema for rich snippets (deprecated for most sites by 2026), `role="img"` on decorative icons (they should be `aria-hidden`), AMP (largely deprecated), or outdated structured-data property names. The fix: web-search the current search-engine documentation for the specific feature before reporting it.

Both failure modes are eliminated by the same discipline. Apply it to every section below.

## Core methodology — three phases

Run every engagement in three phases, in order. Don't compress them.

### Phase 1 — Ground-truth inventory (before claiming anything)

Before saying anything is missing, broken, or unconfigured, inspect the actual state. `references/verification-checklist.md` has the concrete commands — robots/sitemap presence, head-section inspection, response headers and status codes, schema enumeration, and source grepping.

With codebase access: grep the build script / templates for the generators (where canonical tags are emitted, where schemas are constructed, where titles are assembled). With only URL access: curl the rendered HTML and inspect it directly. Either way, your claims must be backed by what you observed, not what you assume from a screenshot or a summary.

### Phase 2 — Web-verify time-sensitive recommendations

For every recommendation you might report, ask: "Has the search engines' guidance on this changed in the last ~18 months?" If yes — or if unsure — web-search the current documentation BEFORE including it. `references/current-docs-to-verify.md` lists the authoritative URLs per topic. If a search confirms the current position, cite the URL + access date. If results are ambiguous, flag the uncertainty rather than picking a side.

### Phase 3 — Categorize and report

Group every finding into exactly one category. The category sets the tone and effort:

| Category | Meaning | What to do |
|---|---|---|
| **Already implemented** | Verified present and correct | Note as verified; keep it out of the fix list |
| **High-confidence fix** | Documented best practice, current guidance verified | Recommend with file:line evidence + doc URL |
| **Strategic decision** | Multiple defensible options | Present options + tradeoffs; defer to the user |
| **Deprecated advice** | Frequently suggested but currently wrong/neutral | Push back explicitly; cite the deprecation source |
| **Unknown / needs data** | Requires Search Console / analytics / backlink tools | Acknowledge the limit; do not speculate |

Use **"already implemented"** generously — naming what's done proves the work was verified and lets the user trust the real fixes. Most AI audits skip it and recommend implementing things that already exist, burying real issues in noise.

## What this skill covers — and where the depth lives

The SKILL.md stays lean; each area has a reference file with the detailed method. Pull the relevant ones per engagement.

- **Technical SEO** — crawlability, robots/sitemap, canonical strategy, redirects and status codes (permanent vs. temporary), HTTPS/host canonicalization, security/cache headers, performance and Core Web Vitals *signals*, mobile, indexation control. → `references/verification-checklist.md`
- **Structured data** — which JSON-LD types belong on which page types, validity vs. *eligibility*, and what's deprecated. → `references/structured-data-checklist.md`
- **On-page, measured at scale** — titles, meta descriptions, headings, keyword placement, alt text, URLs — evaluated as **distributions across all pages** (e.g. "N of M titles exceed the SERP limit"), not a hand-picked sample. → `references/programmatic-seo-at-scale.md` (+ `references/verification-checklist.md`)
- **Internal linking & site architecture** — build the actual link graph, find orphan pages, measure click-depth, audit anchor text, and detect duplication / keyword cannibalization. → `references/internal-linking-and-architecture.md`
- **Keyword & content strategy** — search-intent classification, keyword clustering, long-tail and question-based opportunities, content-gap analysis, freshness, thin content, and topic clusters / pillar pages. → `references/keyword-and-content-strategy.md`
- **Competitor analysis** — keyword overlap and gaps, content depth, SERP-feature ownership, and authority signals — with explicit honesty about what needs external data. → `references/competitor-analysis.md`
- **AEO / AI-visibility** — structuring content to be cited by AI search engines and LLM answers, verified against current practice (this area moves fast). → `references/aeo-and-ai-visibility.md`
- **Programmatic SEO at scale** — thin-template and near-duplicate detection, index-bloat and crawl-budget risk, and the consolidate-vs-differentiate-vs-noindex decision. → `references/programmatic-seo-at-scale.md`

Before any audit, read `references/common-false-positives.md` — it catalogs the specific claims AI audits get wrong, with the correct rebuttals, so you can apply the same pattern to new claims.

## Reporting format

Use this structure. Include only the sections relevant to the engagement — a pure technical audit won't have a keyword table; a keyword-research request won't have a redirect finding.

```markdown
# SEO Audit — [Site]

Audit date: [YYYY-MM-DD]
Inspection method: [URL crawl / codebase access / both]

## What's verified working
[Confirmed-implemented items — robots.txt, sitemap, canonicals, schemas, etc.]

## Real fixes needed (priority order)
[Each: what / why / evidence (file:line or rendered snippet) / current-doc URL]

## Strategic decisions for you
[Options with tradeoffs; do not auto-apply]

## Pushed back on (commonly suggested, currently wrong)
[Explicit deprecation note + source]

## Keyword / content / competitor findings (when in scope)
[Tables per references/keyword-and-content-strategy.md and references/competitor-analysis.md]

## Limits of this audit
[What couldn't be checked — backlinks, GSC data, field Core Web Vitals, etc.]
```

The **"Pushed back on"** section is this skill's most distinctive output. Most "findings" in AI audits are false positives or stale advice; explicit pushback proves the audit was actually verified.

## Scorecard mode — verifying another AI's audit

One of the most valuable invocations. Take the other audit's claims one by one and verify each. Expect ~50–70% to be false positives (confabulated absences) and ~10–20% stale; the remainder are real. Produce a transparent scorecard:

```markdown
| Original claim | Verdict | Evidence |
|---|---|---|
| "Missing robots.txt" | False | curl returns 200, content present |
| "Add FAQ schema for rich results" | Stale | FAQ rich results deprecated for most sites (cite) |
| "Add WebApplication schema" | Real | curl shows only WebSite + Organization; gap confirmed |
```

This scorecard is the entire value of a second audit — it separates signal from noise without quietly accepting either.

## When you have only URL access (no codebase)

The methodology is unchanged; you use curl and view-source instead of grep:

```bash
curl -s URL | grep -oE '<title>[^<]+</title>|<meta name="description"[^>]*>|rel="canonical"|application/ld\+json'
curl -s URL/robots.txt | head
curl -sI URL | grep -iE 'location|cache-control|x-robots-tag'
```

Don't claim "missing" without running the check. A 404 or an absent tag IS your evidence — cite the specific check you ran.

## When the audit reveals deprecated advice you can fix in the codebase

If you find code implementing deprecated practices (still generating FAQ schema for rich snippets, labeling decorative icons) and the user authorizes fixes, apply them with the same evidence standard, and reference the current doc that justifies the change in your commit message or comment.

## Output style

Be concrete and specific. Bad: "Improve internal linking." Good: "The `/pricing` page has no link to `/request-demo`; add a contextual link in its closing paragraph (template: `templates/pricing.html`, near line 120)."

Cite evidence inline — file:line for code findings, a URL for external sources, a specific rendered HTML snippet for crawl findings. Don't pad the report: three real fixes plus ten verified items beats a 20-page audit of speculation. If the site is in good shape, say so, briefly.
