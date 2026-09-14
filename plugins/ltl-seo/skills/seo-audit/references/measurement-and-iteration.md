# Measurement and Iteration

An audit is a snapshot. This file covers what happens after it — verifying that
fixes actually shipped, detecting regressions, and reading outcomes honestly.

This is also where recurring work earns its keep. The usual failure of monthly
SEO retainers is that after month two there is nothing genuinely new to do, so
reports get padded. The antidote is a real loop: **baseline → change → verify →
monitor → read outcomes → decide.**

## Baseline before you change anything

Capture the state *before* material changes, or you will have no way to attribute
anything later. Record the date alongside every figure.

- Re-run the audit commands and save the raw output (the screening scripts are
  the baseline — that is their second purpose).
- Search Console: impressions, clicks, CTR, average position, segmented by
  query / page / device / country. Index coverage status.
- Analytics: sessions, conversions, and **conversion quality** — not just volume.
- Core Web Vitals **field** data where available.
- Which templates and URL patterns are in scope.

Without their Search Console and analytics access, say so and mark every
trend conclusion provisional. Never invent baseline numbers.

## Verify the deployment, don't assume it

The single highest-value recurring check, and the cheapest. Fixes get half-shipped,
overwritten by a plugin update, or lost in a redeploy constantly.

After any release, re-run the same commands that produced the finding and show
before/after:

```bash
# The finding was "no meta description" — did it actually ship?
curl -s https://SITE.com/ | grep -oiE '<meta[^>]+name="description"[^>]*>'

# The finding was "no LocalBusiness entity" — enumerate all three syntaxes
curl -s https://SITE.com/ | grep -oE '"@type"[^,}]*' | sort -u
curl -s https://SITE.com/ | grep -oE 'itemtype="[^"]*"' | sort -u

# Redirect and canonical behaviour still correct?
curl -sIL https://SITE.com/ | grep -iE '^(HTTP/|location)'
```

Also verify: HTTP status codes, robots directives, structured data in the Rich
Results Test, internal links, analytics events firing, and the actual user flow
on a real device.

## Regression monitoring is the honest recurring product

Sites break silently. The failures that cost the most are the ones nobody
notices for months, and they are exactly what an automated monthly re-run catches.

Real example: a two-location salon whose `www` subdomain had **no DNS record at
all** — `nslookup www.example.com` returned NXDOMAIN while the apex resolved
fine. Anyone typing `www.` or arriving from an old printed link hit a browser
error. Nothing on the site looked wrong. A monthly check catches that in the
week it happens; without one it can persist indefinitely.

Worth checking every cycle:

- Host variants resolve and redirect correctly (`http://`, `https://`, `www.`, apex)
- robots.txt has not gained a stray `Disallow` after a plugin or platform update
- No accidental `noindex` on production (the classic staging-config leak)
- Canonicals still point where intended
- Structured data still present *and still populated* — plugin updates drop it
- Titles and meta descriptions still unique and present
- Sitemap still lists the right URLs and returns 200
- TLS certificate not near expiry
- Key pages still return 200

## Diagnosing a change

Before concluding anything about rankings or an algorithm update, rule out the
mundane explanations, roughly in this order:

1. **Tracking** — did analytics, consent, or tagging change? A "traffic drop" is
   very often a measurement drop.
2. **URL / template mapping** — did URLs change without redirects?
3. **Indexation** — check coverage reports for newly excluded pages.
4. **Demand and seasonality** — did query volume itself move? Compare year over year.
5. **SERP composition** — did the result page change shape, or a competitor move?
6. **Deployment timing** — line the change up against the release log.

**Do not call a traffic loss a penalty or an algorithmic hit without evidence.**
Check for manual actions in Search Console first. Attributing a drop to an
update, when it was a broken redirect or a consent-banner change, is the fastest
way to lose credibility and to fix the wrong thing.

**Line the drop up against the Search Status Dashboard** (dated table in
`current-docs-to-verify.md`). Real example: a content site's Google organic traffic
collapsed on 2026-08-18, the first day of the August 2026 spam update, which
targets scaled and thin programmatic content. That is a strong lead, not a
verdict: rule out tracking and indexation first, then audit the site against the
*named* policies of that update rather than "spam" in general.

## Reading results honestly

- Compare like windows (same weekday composition, comparable seasonality) and use
  a control segment — unaffected templates or pages — where one exists.
- **Correlation is not causation.** When the evidence cannot isolate a cause, say
  so. Multiple changes shipped together usually cannot be separated.
- Give changes time. Crawling, reprocessing and re-evaluation often take weeks;
  reading a week-one wobble as a verdict causes bad rollbacks.
- Label every conclusion: **verified** (observed and reproducible), **likely**
  (consistent evidence, alternatives not fully excluded), **hypothesis** (plausible,
  untested), **unknown** (needs data you don't have).

## Report outcomes in layers

Separating these prevents the classic trap of reporting activity as achievement.

| Layer | Example measures | What it decides |
|---|---|---|
| **Technical health** | indexability, status codes, canonical alignment, structured-data presence, field CWV | Is the site eligible, and have regressions crept in? |
| **Search visibility** | impressions, clicks, CTR, query and page coverage, rich-result eligibility | Where are users finding them? |
| **On-site behaviour** | engaged sessions, task completion, form errors, calls initiated | Do landing pages satisfy intent? |
| **Business result** | qualified leads, revenue, bookings, visits, retention | Was the work worth paying for? |

A monthly report that shows only layer 1 is a maintenance log. One that shows
only layer 4 cannot explain *why*. Report all four and the causal story becomes
legible — which is what renews a retainer.

## A workable monthly report structure

1. **What changed since last month** — fixes shipped, verified with before/after
   command output.
2. **Regressions caught** — what broke, when, whether it is fixed.
3. **Outcome layers** — the table above, versus baseline and versus last month.
4. **What moved and why** — with evidence labels, and an explicit "cannot
   attribute" where that is the truth.
5. **Next month's priorities** — scored, not vibes (see the prioritization rubric
   in `SKILL.md`).
6. **What still needs data or access.**

Keep it short. A two-page report a client reads beats a twenty-page export they
do not.

## Never promise the outcome

No ranking guarantees, no traffic projections, no recovery dates. Guarantee the
*work*: specific changes, on a schedule, verified with reproducible evidence.
Search engines decide what to crawl, index and show — and saying so plainly is a
differentiator in a field crowded with people who promise page one.
