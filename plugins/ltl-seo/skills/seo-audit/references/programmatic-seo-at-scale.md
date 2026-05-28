# Programmatic SEO at Scale

Audit large, template-generated sites by computing distributions across the *whole* built output — not by spot-checking three pages — and tell an inherent programmatic trade-off apart from an actual defect.

The governing rule: when a site has thousands of templated pages, a sample of three proves nothing. Count across the full set, report counts and percentages with worst-offender examples, and cite the distribution as your evidence. This file is also the on-page module the main `SKILL.md` points here for — on a programmatic site, on-page checks must be done at scale.

## Scale-aware on-page checks

On a small site you inspect each page's head by hand. On a 20,000-page site you compute the distribution of head-quality across all of them. For the full built output (or the largest sample you can crawl), measure and report:

- **Titles over the SERP length limit** — how many, what percentage, worst examples. (Length guidance shifts; web-verify the current practical limit before asserting a specific character/pixel cutoff.)
- **Pages missing a meta description** — count and percentage.
- **Duplicate titles** — groups of pages sharing the same `<title>`, with counts.
- **Duplicate H1s** — same, for `<h1>`.
- **Missing canonical tags** — count and percentage.

If you have the built output on disk, this is straightforward to compute:

```bash
# Distribution of title lengths across every built page
find build-output -name '*.html' -print0 \
  | xargs -0 grep -hoE '<title>[^<]*</title>' \
  | sed -E 's/<\/?title>//g' \
  | awk '{ print length, $0 }' | sort -n

# Count of pages missing a meta description
find build-output -name '*.html' | while read f; do
  grep -q '<meta name="description"' "$f" || echo "MISSING: $f"
done | tee /tmp/missing-desc.txt | wc -l

# Duplicate titles (groups sharing the same title)
find build-output -name '*.html' -print0 \
  | xargs -0 grep -hoE '<title>[^<]*</title>' \
  | sort | uniq -c | sort -rn | awk '$1 > 1'

# Pages missing a canonical
find build-output -name '*.html' | while read f; do
  grep -q 'rel="canonical"' "$f" || echo "NO CANONICAL: $f"
done | wc -l
```

Report like this: "4,812 of 20,140 pages (24%) have titles over the practical SERP limit; worst case is /x/… at N chars. 0 pages are missing canonicals (verified across all 20,140)." Counts and a couple of named examples — not adjectives, and not a claim generalized from one page.

## Thin-template detection

Programmatic pages are generated from a template with per-page values plugged in. The risk: pages that differ *only* by a value or a word, with no other unique substance. When many pages are near-identical, search engines often index only a subset and ignore the rest — the long-tail strategy quietly fails.

Detect it by measuring how much of each page is shared boilerplate versus unique content. A practical proxy: strip the common template chrome and compare what's left across pages. If two pages differ by one city name in an otherwise identical 400 words, that's a thin template.

```bash
# Crude uniqueness probe: how many distinct "body signatures" exist
# across pages that should be different? (normalize whitespace, hash)
find build-output -name '*.html' -print0 \
  | xargs -0 -I{} sh -c 'sed -E "s/<[^>]+>//g; s/[[:space:]]+/ /g" "{}" | md5sum | cut -d" " -f1' \
  | sort | uniq -c | sort -rn | head
```

If a large block of pages collapses to a handful of distinct signatures, the template is too thin. Report the ratio of distinct content to total pages.

## Near-duplicate and index bloat

Even when pages aren't byte-identical, a high boilerplate-to-unique ratio produces near-duplicates that bloat the index with low-value URLs. Estimate the boilerplate ratio (shared chrome ÷ total page text) on a sample and report it. High boilerplate ratio + large page count is the classic index-bloat signature: many URLs, little distinct value, diluted crawl and ranking signal.

## Crawl-budget impact

Search engines allocate finite crawl resources per site. Tens of thousands of thin or near-duplicate URLs spend that budget on pages that won't rank, at the expense of the pages that should. On large sites this is real; on small sites crawl budget is rarely the bottleneck — don't invoke it for a 200-page site. Tie any crawl-budget claim to the actual page count you measured.

## Decision framework for a thin-page set

When you've identified a set of thin/near-duplicate programmatic pages, there are three responses. Pick per set, with criteria:

- **Consolidate** — merge the thin pages into fewer, richer pages. Choose when the pages don't target genuinely distinct demand and their value overlaps. E.g., 50 near-identical "X in [tiny-town]" pages with no local substance → one strong regional page.
- **Differentiate** — keep the pages but add genuine per-page value (unique data, real local/contextual content, distinct media). Choose when each page *does* map to real, distinct search demand and you can actually supply unique content at scale. This is what makes programmatic SEO legitimate rather than spammy.
- **Noindex / remove** — drop the pages from the index (`noindex`) and from the sitemap, or remove them entirely. Choose when the pages serve neither users nor distinct demand and you can't justify unique content. Pruning dead weight can improve how the rest of the site is crawled and assessed.

Crucial intent check: a deliberate, well-executed set of variant pages targeting real long-tail demand is a *valid pattern*, not a defect — confirm whether the pages earn impressions/clicks (Search Console) before recommending consolidation. Some thinness is an inherent trade-off of the programmatic approach; only call it a defect when the pages target no real demand or are being ignored by the engine. Don't reflexively recommend "canonicalize all variants to parent" — that kills a working long-tail strategy.

## Sitemap hygiene at scale

- The sitemap should list **exactly the indexable set** — no `noindex` pages, no redirected URLs, no 404s, no pages canonicalized elsewhere. On a generated site it's easy for the sitemap to include everything the template produced regardless of index status; check that it doesn't.
- **`lastmod` must reflect real content changes**, not every rebuild. If the build stamps `lastmod` with the deploy timestamp on every page each deploy, the signal is worthless and can erode trust. Verify how `lastmod` is generated (grep the build) and recommend tying it to actual per-page content changes.

```bash
# Spot-check: are sitemap lastmod values all identical (= rebuild stamp, bad)?
curl -s https://SITE.com/sitemap.xml | grep -oE '<lastmod>[^<]+</lastmod>' | sort | uniq -c
```

## Monitoring via Search Console index coverage

The decisive real-world signal lives in Search Console's index-coverage report (if the user has access): how many of the published URLs are actually indexed. A plateau well below the published count — e.g., 60,000 pages published but only 8,000 indexed, the rest "Discovered/Crawled – currently not indexed" — is the engine telling you the thin-page set isn't earning indexation. That's the trigger to consolidate, differentiate, or prune.

Be honest about access: without Search Console you cannot see indexation counts. Don't fabricate them — flag it as needs-data and say what the report would reveal, exactly as the main methodology requires.

## Verification rule

Count across the full built output, never a handful of pages. Cite distributions (counts and percentages) plus a few named worst-offender examples as your evidence. And for every flagged page set, decide whether it's an inherent trade-off of the programmatic model (valid, possibly leave alone) or a genuine defect (thin pages targeting no demand, duplicate heads, dishonest `lastmod`, sitemap listing non-indexable URLs) — and confirm intent before recommending any structural change.
