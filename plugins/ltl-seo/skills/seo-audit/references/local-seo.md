# Local SEO

For a business that serves a geographic area, local search is a different game
from general organic search — and the website is **supporting cast, not the
lead.** An audit that reports only on-site findings for a plumber, salon, dental
practice, or repair shop has audited the smaller half of the problem.

Say this plainly in the report. It is more useful than a longer on-site list,
and it is the honest framing.

## The three factors

Google resolves local results through **relevance, distance, and prominence**:

- **Relevance** — how well the business matches the query. Driven heavily by the
  Business Profile's primary category, services, and description.
- **Distance** — proximity between the searcher and the business location. Not
  controllable, and it caps how far a business can realistically rank.
- **Prominence** — how well-known and well-regarded the business is. Reviews
  (count, recency, content, response rate), citations, links, and general web
  presence feed this.

Two consequences for how you write recommendations:

1. **Never promise a business it can rank across a whole metro.** Distance is a
   real ceiling. A shop in Plainfield will not rank for "auto repair Naperville"
   the way a Naperville shop does, and saying otherwise is the kind of promise
   this skill exists to avoid.
2. **Prominence can beat distance, but only over time.** Frame authority work as
   the long game, not a switch.

## Google Business Profile comes first

The Business Profile is the highest-leverage surface in local search — industry
surveys consistently put it at roughly a third of local-pack weight, with the
**primary category** the single most influential field. It is also free to fix.

**You cannot audit a GBP programmatically.** There is no curl equivalent. Say so
in the "Limits of this audit" section and either inspect it manually or ask the
client to share it. Do not infer its state from the website.

What to check manually, roughly in order of impact:

| Check | Why it matters |
|---|---|
| Profile claimed and verified | Unclaimed profiles can be edited by the public |
| **Primary category** exact and specific | Highest-impact relevance field; "Auto Repair Shop" ≠ "Car Dealer" |
| Secondary categories | Cover real services without diluting the primary |
| Name matches real-world signage | Keyword-stuffed names violate guidelines and risk suspension |
| Address / service-area configured correctly | Storefront vs. service-area business are different setups |
| Hours, including holiday exceptions | Wrong hours generate one-star reviews |
| Services / products populated | Feeds relevance directly |
| Photos, recent and real | Affects engagement and perceived legitimacy |
| Website URL points to the right page | Multi-location businesses should link to the *location* page |
| Reviews: volume, recency, and owner responses | Prominence engine; response rate is within the client's control |

A thin or unclaimed profile outranks every on-site finding in priority. When you
find one, say so explicitly and move it to the top of the fix list.

## LocalBusiness structured data

Verify current requirements against
https://developers.google.com/search/docs/appearance/structured-data/local-business
before reporting; the properties below were accurate at last check but this is a
page worth re-reading.

- **Required:** `name`, `address` (a `PostalAddress`).
- **Recommended:** `telephone`, `geo` (`GeoCoordinates`), `openingHoursSpecification`,
  `priceRange`, `url`, plus `aggregateRating` / `review` **only where the site
  genuinely captures reviews about other businesses** — never self-declared.
- **Use the most specific subtype**, not bare `LocalBusiness`: `AutoRepair`,
  `HairSalon`, `Dentist`, `Restaurant`, `Plumber`, `DaySpa`, `HealthClub`, etc.
  `LocalBusiness` is itself a subtype of `Organization`, so the Organization
  fields are worth following too.
- **One entity per physical location.** A two-location business needs two
  `LocalBusiness` nodes, each with its own address and hours — ideally on its own
  location page. A single entity covering multiple towns is a common and
  costly gap.

**The most frequent real finding is a hollow entity, not a missing one.** Sites
routinely declare the right type with only `name`, `logo` and `url` — no address,
no phone, no hours. That fails even the required-property bar while looking fine
to a casual check. Always enumerate properties, not just types, and remember
microdata and RDFa count (see `common-false-positives.md`).

## NAP consistency

Name, Address, Phone should be identical everywhere they appear — site, markup,
Business Profile, and directories. Inconsistency muddies entity resolution.

```bash
# Phone numbers present anywhere in the source
curl -s https://SITE.com/ | grep -oE '\(?[0-9]{3}\)?[ .-][0-9]{3}[ .-][0-9]{4}' | sort -u

# tel: links — check format AND that they all match
curl -s https://SITE.com/ | grep -oE 'href="tel:[^"]*"' | sort -u

# ZIPs and state mentions (thin geo signal is common)
curl -s https://SITE.com/ | grep -oE '\b[0-9]{5}\b' | sort -u
curl -s https://SITE.com/ | grep -oicE '\b(Illinois|IL)\b'
```

Two specific defects worth checking for, both seen in live audits:

- **Malformed `tel:` URIs.** Per RFC 3966 a `tel:` URI cannot contain spaces or
  parentheses. `href="tel:(815) 985-9891"` and `href="tel:+(815) 985-9891"` are
  both invalid; some mobile browsers repair them, some silently do nothing.
  Correct form: `tel:+18159859891`. For a business where the phone *is* the
  conversion, this is a direct revenue finding and non-technical owners
  immediately grasp it.
- **Leftover theme/demo contact data.** Placeholder numbers like `800-123-4567`
  survive in templates far more often than you would expect. **Check whether the
  element is CSS-hidden before characterizing the impact** — if it is hidden on
  every breakpoint, no customer sees it, and claiming "customers are calling a
  dead number" is false and checkable. The honest finding is NAP noise in
  crawlable source plus evidence the site was never cleaned up after install.

## Location and service-area pages

- Create a location page only where there is a **real, distinct location or
  customer need** with substantive original content — hours, staff, directions,
  parking, local specifics, genuine photos.
- City-name-swapped duplicates are a spam pattern, not a strategy. If ten pages
  differ only by town name, that is thin programmatic content; see
  `programmatic-seo-at-scale.md` for the consolidate-vs-differentiate decision.
- Service-area businesses without a storefront should configure a service area
  in GBP rather than publishing a fake address. Never invent a location.
- Geographic text signal on the site is worth measuring — a business whose entire
  market is a 20-mile radius but mentions its state twice on the homepage has a
  real, cheap gap. Fix it in service-area copy that reads naturally, not by
  stuffing town names.

## Reviews — the policy boundary

Reviews drive prominence, which makes them a magnet for bad advice. Recommend
earning and responding to genuine reviews under each platform's rules. Never
recommend or facilitate buying, fabricating, gating (soliciting only from
customers likely to be positive), or incentivizing reviews in prohibited ways.
Never mark up self-declared ratings the site did not actually collect — that
violates Google's structured-data policies and risks manual action.

Responding to reviews is within the client's control, costs nothing, and is a
legitimate recurring deliverable for a retainer.

## What you cannot check without their data

State these as limits rather than guessing:

- Business Profile state, insights, and search-query data — needs their login.
- Local pack position, which varies by the searcher's physical location; a single
  observation is not a ranking. Position claims need a location-aware rank tool.
- Citation consistency across directories — needs a citation audit tool or
  manual sweep.
- Competitor review volume and velocity — observable manually, not by curl.

## Reporting

Lead the local section with the Business Profile, then structured data, then NAP,
then on-site content. That order reflects actual leverage, and it signals to the
client that the audit understands their business rather than just their HTML.
