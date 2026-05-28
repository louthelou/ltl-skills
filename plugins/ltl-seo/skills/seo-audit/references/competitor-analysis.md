# Competitor Analysis

Compare a site head-to-head against the pages that actually compete for its target queries — and be ruthless about separating what you observed from what you'd need a paid tool to know.

The governing rule: tag every finding with how it was determined and its confidence. SERP and content observations are high-confidence because you can see them. Backlink and authority claims are guesswork without external tools — never invent a DA/DR number to fill the gap.

## Identify who actually competes — confirm via the SERP

Business rivals are not necessarily search competitors. The competitors that matter for SEO are the pages ranking for *your target queries*, which may be publishers, aggregators, forums, or marketplaces you don't think of as rivals.

Method: take the priority target keywords and inspect the real SERP for each. Record which domains/pages occupy the top organic results. The domains that recur across your target queries are your search competitors — confirm them this way rather than assuming.

```bash
# Inspect the SERP for a target query (run as a real search; read the organic results)
# Note: scraping Google programmatically is unreliable and against ToS — read the SERP manually
# and record the top organic domains/URLs per query.
```

State explicitly that competitor identification is SERP-observed, not assumed from market position.

## Dimensions to compare

For each confirmed competitor, compare across dimensions you can actually observe:

- **Keyword overlap and gaps** — which target queries you both rank for, which they rank for and you don't (their content you're missing), and which you own that they don't. Derived from SERP inspection across the keyword set.
- **Content depth and breadth** — for shared topics, whose page is more thorough, better structured, more current? Breadth = how many subtopics in the cluster each covers. Read the pages; cite specifics.
- **Publishing cadence** — how often they ship new/updated content, read from visible dates and the blog index. A rough observation, label it as such.
- **On-page quality** — title/heading discipline, internal linking, readability, media. Observable from the rendered pages.
- **Technical posture** — observable signals only: page speed feel, mobile rendering, structured data present (`grep application/ld+json`), clean URLs, HTTPS. Don't claim a technical deficit you didn't check.
- **SERP-feature ownership** — who holds the featured snippet, the People-Also-Ask answers, image/video packs, and any knowledge panel for the target queries. This is directly observable in the SERP and is often the highest-leverage finding: a competitor owning the snippet for your money query is a concrete, beatable target.

## Authority and backlink signals — the loud caveat

Backlink quantity/quality and domain-authority-style scores genuinely matter for competitiveness. But:

- **You cannot measure them without an external backlink tool** (such as Ahrefs, Semrush, Moz, or Majestic). There is no way to read a site's backlink profile from its HTML.
- **Domain Authority / Domain Rating are third-party vendor metrics, not Google signals.** They're proxies, they disagree between vendors, and Google does not publish or use them.
- **Never invent a DA/DR number.** Writing "Competitor A has DR 72" without a tool open is fabrication. If you don't have the data, say "backlink/authority comparison requires [a backlink tool]; not assessed here," and move it to the needs-data bucket.

If the user *does* have a backlink tool, then report the figures with the vendor and date, and still note they're estimates.

What you *can* infer cheaply, labeled low-confidence: brand prominence (do they show up in non-SEO contexts?), age and size of the site, and whether they're a recognized authority in the niche. These are soft signals, not metrics.

## A method that works without paid tools

You can produce a useful competitive picture with zero paid subscriptions — just be honest about confidence:

1. **SERP inspection** for every priority keyword — record top organic domains, and who owns each SERP feature. (High confidence — observed.)
2. **Manual content comparison** — open the top-ranking competitor page for each shared query and compare depth, structure, freshness, and angle against yours. (High confidence — observed, though "better" involves judgment.)
3. **Web search for footprint** — search the competitor's brand and topic to gauge how often and where they appear (mentions, social, directories). (Medium/low confidence — indicative, not measured.)
4. **Observable technical checks** — curl/grep their pages for structured data, canonical strategy, and head hygiene the same way you audit your own site. (High confidence — observed.)

Everything authority/backlink-related stays explicitly in the needs-data category until a tool provides it.

## Outputs

**Comparison table** — every row tagged with how it was determined and confidence:

| Dimension | Your site | Competitor A | Competitor B | Who leads | Source / confidence |
|---|---|---|---|---|---|
| Featured snippet for [query] | Not held | Holds it | Not held | A | SERP-observed / high |
| Depth on [topic] | 1,200 wds, 3 subtopics | 3,000 wds, 8 subtopics | thin | A | Content read / high |
| Backlink authority | — | — | — | unknown | Needs backlink tool / n/a |
| Publishing cadence | ~2/mo | ~weekly | dormant | A | Visible dates / medium |

**Gap list** — what to do, each tagged:

| Gap | Recommendation | How determined | Confidence |
|---|---|---|---|
| A owns the PAA answers for [cluster] | Add a direct-answer block targeting those questions | SERP-observed | High |
| Competitors have comparison pages; we don't | Build a comparison page for the commercial query | SERP + content | High |
| Unknown link-gap | Defer until backlink tool available | — | Needs data |

## Verification rule

Keep two buckets visibly separate in the report: **observed** (SERP composition, SERP-feature ownership, on-page content and structure, observable technical signals) and **needs-data** (backlinks, authority scores, traffic estimates, anything requiring a paid tool or analytics access you don't have). Findings in the first bucket are actionable now; findings in the second are flagged with exactly what data would close them. Don't let a confident-sounding sentence smuggle a needs-data claim into the observed bucket.
