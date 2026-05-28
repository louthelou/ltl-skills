# Verification Checklist

Concrete commands and inspection points for Phase 1 (ground-truth inventory). Run the checks that apply to the audit scope. Cite the actual output as evidence in findings — don't claim absence without showing the failed check.

## Robots, sitemap, headers

```bash
# Does robots.txt exist and reference the sitemap?
curl -s https://SITE.com/robots.txt
# Expected: User-agent + Allow/Disallow + Sitemap line

# Does sitemap.xml exist and have entries?
curl -s https://SITE.com/sitemap.xml | head -20
wc -l <(curl -s https://SITE.com/sitemap.xml)

# Are key assets sent with sensible Cache-Control?
curl -sI https://SITE.com/styles.css | grep -i cache-control
curl -sI https://SITE.com/app.js | grep -i cache-control
curl -sI https://SITE.com/                   # HTML cache headers

# HSTS, X-Content-Type-Options, CSP present?
curl -sI https://SITE.com/ | grep -iE 'strict-transport|content-type-options|content-security'
```

If the auditor or report claims any of these are missing, run the check and either confirm or push back with the output.

## HTML head inspection (per page)

```bash
curl -s https://SITE.com/PAGE/ | grep -oE '(<title>[^<]+</title>|<meta name="description"[^>]*>|rel="canonical"[^>]*>|application/ld\+json|<meta property="og:[^"]+"[^>]*>)'
```

Things to look for in the head:
- `<title>` — unique per page, reasonable length, keyword-relevant
- `<meta name="description">` — present, ~150-160 chars, unique
- `<link rel="canonical" href="...">` — present, points to a sensible URL
- `<link rel="alternate" hreflang="...">` — only if multi-language; otherwise ignore
- Open Graph and Twitter cards — for social previews
- One or more `<script type="application/ld+json">` — for structured data
- `<meta name="viewport" content="width=device-width, initial-scale=1">` — for mobile

## Structured data enumeration

```bash
# Pull all JSON-LD blocks from a page
curl -s https://SITE.com/PAGE/ | grep -A1 'application/ld+json' | grep -oE '"@type":"[^"]+"' | sort -u
```

Cross-reference the page type against `structured-data-checklist.md` to identify real gaps vs. confabulated ones. A homepage that has WebSite + Organization + WebApplication + FAQPage is well-served; an article page that has only BreadcrumbList is missing the Article schema.

Use Google's Rich Results Test for live validation:
- https://search.google.com/test/rich-results — paste URL or HTML; tells you which rich-result types are eligible

## Codebase grep (when you have filesystem access)

These greps catch the generators that produce the head content. Run them in the project root.

```bash
# Where is canonical emitted?
grep -nE 'rel=.canonical|canonical.*=' SOURCE/

# Where are JSON-LD schemas constructed?
grep -nE 'application/ld\+json|@type.*Article|@type.*FAQPage|@type.*WebSite|@type.*Organization' SOURCE/

# Robots & sitemap generation
grep -nE 'robots\.txt|sitemap\.xml|SITEMAP|robotsContent' SOURCE/

# Cache-Control configuration
grep -nE 'Cache-Control|max-age|_headers|netlify\.toml|vercel\.json' SOURCE/

# Image lazy-loading & alt text
grep -nE 'loading=.lazy|decoding=.async|<img|alt=' SOURCE/

# Internal linking patterns (anchor text, breadcrumb generation)
grep -nE 'crumbsHtml|crumbsSchema|BreadcrumbList' SOURCE/
```

## Programmatic SEO architecture (for pSEO sites)

If the site uses templated pages (e.g., per-ingredient pages, per-city pages, per-product variants):

1. Count templated pages: `wc -l sitemap.xml` or grep the build output.
2. Inspect a sample of variant pages — are titles unique? Are H1s unique? Are canonical tags self-pointing or to a parent?
3. Decision check: do variants self-canonicalize (independent indexation, long-tail strategy) or canonicalize to parent (consolidate signals)? Both are defensible — see Strategic Decision rubric in `common-false-positives.md`.

## Performance markers (proxies for CWV)

Without actual Lighthouse runs you can still spot likely problems:

```bash
# Large unoptimized images?
curl -sI https://SITE.com/hero.png | grep -i content-length

# Render-blocking resources in head?
curl -s https://SITE.com/ | grep -oE '<link rel="stylesheet"[^>]+>|<script[^>]+src=[^>]+>(?!\s*</script>)'

# Are critical assets preloaded?
curl -s https://SITE.com/ | grep -E 'rel="preload"|rel="preconnect"'
```

For real measurements, run https://pagespeed.web.dev/?url=SITE.com — produces both Lab (Lighthouse) and Field (CrUX) data.

## Accessibility-as-SEO inspection

Pull every `<img>` and `<svg>` from a representative page and check whether each is decorative or informative:

```bash
curl -s https://SITE.com/PAGE/ | grep -oE '<(img|svg)[^>]*>'
```

For each:
- Has visible accompanying text that conveys the meaning? → Decorative. Should have `aria-hidden="true"` (or empty alt for images). The right test is "would removing the icon lose meaning?" — if no, hide it.
- Is the icon the only conveyer of meaning (e.g., a status badge with no label)? → Informative. Needs descriptive `alt` text or `role="img" aria-label`.

This is the most common AI-audit error — see `common-false-positives.md` for the full rebuttal.

## Always-include outputs in evidence

When citing a check, include:
- The exact command run
- The relevant portion of the output (or note "no match" / "404")
- A file:line reference if you grep'd source

This makes findings reproducible and credible. Skipping evidence is what makes audits feel confabulated.
