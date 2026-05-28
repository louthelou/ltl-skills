# Internal Linking and Site Architecture

Audit how pages link to each other and how the site is structured — by building the actual link graph from source, not by eyeballing the nav.

The rule for this whole file: never claim a page is orphaned, under-linked, or cannibalizing until you have enumerated the real internal links from the rendered HTML or the build source. "I didn't see it linked" is not evidence. The check you ran is.

## Build the link graph first — don't eyeball it

You cannot reason about internal linking from a screenshot or a mental model of the nav. Enumerate every internal `<a href>` across every indexable page, then compute inbound and outbound counts per URL.

If you have the built output or can crawl:

```bash
# Every href on a page, normalized — keep only internal ones
curl -s https://SITE.com/PAGE/ \
  | grep -oE 'href="[^"]+"' \
  | sed -E 's/href="//; s/"$//' \
  | grep -E '^(/|https://SITE\.com)' | sort -u
```

If you have filesystem access, grep the templates for where links are emitted (nav partial, breadcrumb generator, "related" blocks, in-body contextual links) so you know which links are global boilerplate and which are page-specific. Boilerplate links (header/footer nav) inflate inbound counts for a handful of URLs and tell you little; the signal is in the contextual, in-body links.

For each URL record: inbound count (how many other pages link to it), outbound count, and whether each inbound link is boilerplate or contextual. That table is the spine of every finding below.

## Orphan-page detection

An orphan page is one with **zero internal inbound links** — it exists in the sitemap (or is reachable only by knowing the URL) but no other page on the site points to it.

Why it matters: internal links are how ranking signal (and crawl priority) flows between pages. A page that nothing links to gets none of that flow. Search engines may still discover it via the sitemap, but it sits starved of internal authority and is a weak candidate to rank.

How to find them: take the full set of indexable URLs (from the sitemap), subtract every URL that appears as an internal link target anywhere on the site. What remains, minus the homepage, is the orphan set.

```bash
# URLs in sitemap that never appear as a link target in the crawl
comm -23 <(sort sitemap-urls.txt) <(sort all-link-targets.txt)
```

The fix is almost never "add it to the footer." Add a *contextual* link from a relevant existing page — ideally a topically related hub or a higher-traffic article whose readers would genuinely want the orphan. Cite the source page and the natural anchor when you recommend it.

Intent check: confirm the page is *meant* to be indexed. Thank-you pages, transactional confirmation pages, and gated assets are intentionally unlinked and frequently `noindex`. Don't flag those as orphans — check the robots meta and the page's purpose first.

## Click-depth from the homepage

Click-depth is the minimum number of clicks from the homepage to reach a page, following internal links. Compute it as a breadth-first traversal of the link graph starting at `/`.

Deep pages (4+ clicks from home) tend to be crawled less and accumulate less internal signal. This is a guideline, not a law — a large catalog will legitimately have deep pages. Report the depth distribution and call out *important* pages buried deep (a money page or a flagship guide at depth 5), not every leaf.

Distinguish a real problem from scale: on a 50-page brochure site, depth 4 is a smell; on a 50,000-page catalog, it's arithmetic. Say which one you're looking at.

## Anchor-text quality, diversity, and over-optimization

For internal links, the anchor text is a relevance hint about the destination. Collect the anchor text for every internal link (especially the contextual ones) and assess three things:

- **Descriptiveness.** "Read our guide to email deliverability" beats "click here" or "read more." Generic anchors waste the relevance signal and hurt accessibility. List the worst offenders with the source page.
- **Diversity.** The same destination linked from many pages with the identical exact-match keyword anchor looks manipulated. Natural internal linking varies the phrasing.
- **Over-optimization caution.** Don't recommend stuffing exact-match keyword anchors everywhere. The goal is descriptive and natural, not keyword-saturated. Internal over-optimization is a real (if mild) risk; flag it if you see the same money-keyword anchor repeated mechanically.

Be specific in findings: quote the anchor, name the source page and the destination.

## Under-linked and over-linked pages

From the inbound/outbound counts:

- **Under-linked:** an important page (high commercial value, or a pillar you want to rank) with very few contextual inbound links. Recommend specific source pages to link from.
- **Over-linked / link dilution:** a page with an enormous number of outbound internal links (e.g., a mega-menu or a "links to everything" footer reproduced in-body) spreads its outbound signal thin and buries the few links that matter. The fix is editorial: prioritize the contextual links that serve the reader and demote the rest to nav.

Report counts, not adjectives. "The pricing page has 2 contextual inbound links; the blog index has 140 outbound" is a finding. "Linking could be better" is not.

## Duplication and keyword cannibalization

Cannibalization is when **multiple indexable URLs target the same query with near-identical intent and body content**, so they compete with each other — splitting signal and confusing which one the engine should rank.

How to detect it (evidence-first):

1. Pull the `<title>` and `<h1>` of every indexable page and group by near-duplicate.

   ```bash
   curl -s https://SITE.com/PAGE/ | grep -oE '<title>[^<]+</title>|<h1[^>]*>[^<]+</h1>'
   ```

2. For any group of pages with the same/overlapping title or H1, compare the bodies. If two pages say substantially the same thing for the same query, that's a cannibalization pair.
3. If you can crawl, a `site:SITE.com "exact query"` search shows which URLs the engine itself associates with the query — a strong real-world signal of overlap.

The fixes, in order of preference:

- **Consolidate** — merge the duplicates into one stronger page and 301-redirect the rest. Best when the pages genuinely cover the same thing.
- **Canonicalize** — if both must exist (e.g., a print version, a syndicated copy), point the canonical at the primary.
- **Differentiate** — if the pages *should* serve different intents, rewrite titles/H1s/bodies so each clearly targets its own query. Often the right call when an audit reveals two pages that drifted into the same topic.
- **Hub-and-detail** — keep a broad hub page and narrower detail pages, but link them correctly (hub links down to details with descriptive anchors; details link up to the hub) so the structure signals the hierarchy instead of competing.

Intent check before recommending: confirm the overlap is accidental. Two near-identical pages can be a deliberate A/B or localization split; verify before proposing a merge.

## Hub-and-spoke / pillar-cluster patterns

A healthy topical structure has a **pillar** (broad, authoritative page on a topic) linked bidirectionally to **cluster** pages (each covering one subtopic in depth). The pillar links out to every cluster page; each cluster page links back to the pillar and, where relevant, sideways to sibling clusters.

When auditing, check whether topical content is actually wired this way or just dumped in a flat blog roll. A set of strong articles with no pillar tying them together leaves signal on the table. Recommend the pillar and the specific linking, citing the existing pages that should form the cluster.

## Pagination and faceted-navigation pitfalls (brief)

- **Pagination** (`/blog/page/2`, etc.): make sure paginated pages are crawlable and that deep items aren't reachable *only* through pagination (that buries them). `rel="next"/"prev"` is no longer used by Google as an indexing signal — don't recommend adding it for ranking; do ensure each paginated URL is self-canonical, not canonicalized to page 1 (that can drop the deeper items from the index). Web-verify current guidance before making a pagination recommendation — this area has changed.
- **Faceted nav** (filters producing `?color=red&size=l` URLs): can explode into millions of low-value crawlable URLs and waste crawl budget. Check whether facet URLs are crawlable/indexable and whether that's intended. Confirm the intent — a deliberate set of indexable facet pages targeting real demand is fine; an accidental combinatorial explosion is a defect.

## What to report

Keep the internal-linking section of the audit to evidence-backed lists:

- **Orphan list** — each orphaned indexable URL, the check that proved zero inbound links, and a specific source page + anchor to fix it. Exclude intentionally-unlinked/`noindex` pages and say you excluded them.
- **Cannibalization pairs** — each pair/group, the matching titles/H1s, a note on body overlap, and the recommended fix (consolidate / canonicalize / differentiate / hub-and-detail).
- **Anchor-text issues** — generic ("click here") anchors and over-optimized repeated exact-match anchors, each quoted with its source page.
- **Structural notes** — important pages buried deep, under-linked money pages, over-linked dilution, and any pillar/cluster opportunities.

Every item carries its evidence and, where a structural change is proposed, an explicit "confirm this isn't intentional" caveat.
