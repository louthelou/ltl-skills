# Keyword and Content Strategy

Do keyword research and content-gap analysis honestly — match intent to page type, cluster instead of sprawl, and never fabricate a number you can't source.

The governing rule: distinguish what you *measured* from what you *estimated*. Real search volume and difficulty come from a keyword tool or Search Console. Without those, you do web research and label every figure a relative estimate — you do not invent specific monthly-search numbers. Say so plainly in the output.

## Search-intent classification (do this before anything)

Every target query has an intent, and the page that targets it must match that intent or it won't rank no matter how well-optimized it is. Classify each query into one of four:

- **Informational** — the user wants to learn ("how does X work", "what is Y"). Page type: guide, explainer, tutorial.
- **Navigational** — the user wants a specific site/brand ("acme login"). Page type: the actual destination; rarely worth chasing if it's not your brand.
- **Commercial investigation** — the user is comparing before buying ("best X for Y", "X vs Z", "X review"). Page type: comparison, roundup, review.
- **Transactional** — the user is ready to act ("buy X", "X pricing", "X near me"). Page type: product, pricing, signup, local landing page.

The most common content mistake is intent mismatch: a sales page targeting an informational query, or a thin blog post targeting a transactional one. When auditing, check the query intent against the page it points at and flag mismatches. The fastest intent check is to look at what currently ranks for the query — the SERP tells you what the engine has decided the intent is.

## Keyword tiers

Organize targets into tiers rather than a flat list:

- **Primary** — the main query a page is built to win (one per page, usually).
- **Secondary / supporting** — closely related variants and subtopics the same page can also satisfy.
- **Long-tail** — longer, lower-competition, higher-specificity phrases. Individually low volume, collectively significant, and often easier to win.
- **Question-based** — the questions real users ask, mirroring "People Also Ask" boxes. These map directly to headings and to AEO extraction (see the AEO reference). Harvest them from PAA, autocomplete, and "related searches."

A single well-built page should own a primary keyword plus its secondary and long-tail variants — not a separate thin page per variant.

## Cluster into topics — one strong page beats many thin ones

Group related keywords into topical clusters and assign each cluster to one page (or a pillar + cluster structure, see the architecture reference). The failure mode this prevents: spinning up ten 300-word pages for ten near-identical keywords, which split signal, cannibalize each other, and read as thin.

Method: list the candidate keywords, group by shared intent and meaning (not just shared words), and decide for each cluster whether it warrants its own page or folds into an existing one. The output of clustering is a content plan, not a keyword dump.

## Data-source honesty — a first-class rule

This is not a footnote; it shapes the whole deliverable.

- **With a keyword tool or Search Console:** report actual volume and difficulty, cite the source and the date pulled, and note that tool volumes are estimates that disagree between vendors.
- **Without them:** you do not have real numbers. Do web research (autocomplete, PAA, related searches, what competitors target, SERP composition) and express demand and difficulty as **relative** labels — high / medium / low — explicitly marked as estimates. Never write "3,400 searches/month" when you don't have a tool open; that's fabrication and it destroys the audit's credibility.
- State the limitation in the report: "Volume/difficulty below are relative estimates from web research, not measured; confirm with [a keyword tool] or Search Console before prioritizing spend."

Difficulty signals you *can* read without a paid tool: who ranks (big established brands vs. forums and small sites), how many results, whether the SERP is saturated with ads, and whether the intent is well-served already. Label the conclusion as an estimate.

## Content-gap analysis

A content gap is a topic or query your target audience searches for that the site doesn't adequately cover. Look for several kinds:

- **Topic/query gaps** — subjects competitors rank for that the site doesn't address at all.
- **Content-type gaps** — formats the site is missing: in-depth guides, comparisons, glossaries/definitions, calculators or interactive tools, templates/checklists. A site with only blog posts and no comparison pages is invisible to commercial-investigation queries.
- **Funnel-stage gaps** — content that serves only one stage. A site with great top-of-funnel guides but nothing for the commercial/transactional stage (or vice versa) leaks intent it could capture.

Verification rule — do not claim a gap without checking the site actually lacks it:

```bash
# Does the site already cover the topic?
site:SITE.com "the topic phrase"      # run as a real search
# or, with filesystem/crawl access:
grep -rniE 'topic|synonym|related phrase' build-output/
```

Many "gaps" in AI audits are pages the auditor simply didn't find. Prove absence before reporting it, exactly as with technical findings.

## Thin and stale content

- **Thin** — pages with little substantive content relative to the query's intent (a 150-word answer to a question that needs depth, or boilerplate that adds nothing). Identify by word count *plus* a read for actual substance — word count alone is a weak proxy. Recommend: expand, merge into a stronger page, or remove.
- **Stale** — content that's outdated for a time-sensitive topic (old year in the title, superseded facts, dead recommendations). Identify by publish/update date and a content read. Recommend a refresh with a real content change (not just bumping the date — see the programmatic reference on `lastmod` honesty).

Confirm intent before flagging thin: a deliberately concise definition page or a glossary entry is supposed to be short. Match the depth expectation to the page type.

## Topic clusters and pillar pages

The strategic output of keyword work is usually a pillar-and-cluster map: one authoritative pillar per major topic, supported by cluster pages on subtopics, interlinked (the architecture reference covers the linking). When recommending new content, slot it into this structure rather than proposing orphan one-offs.

## Outputs

**Keyword-opportunity table** — one row per target, all difficulty/opportunity values labeled as relative estimates unless tool-sourced:

| Keyword | Intent | Relative difficulty | Relative opportunity | Recommended content type |
|---|---|---|---|---|
| example primary term | Commercial | Medium (est.) | High (est.) | Comparison page |
| example question phrase | Informational | Low (est.) | Medium (est.) | Guide section / FAQ block |

**Content-gap list** — one row per gap, each verified absent from the site first:

| Topic / query | Why it matters | Format | Priority | Effort |
|---|---|---|---|---|
| example missing subtopic | Competitors rank; matches buyer intent we don't serve | Pillar + 3 cluster pages | High | M |

Close the section by restating the data caveat: which figures are measured vs. estimated, and what tool/Search Console access would sharpen the prioritization.
