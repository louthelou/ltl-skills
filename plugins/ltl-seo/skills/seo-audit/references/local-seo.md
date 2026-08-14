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
  `priceRange`, `url`.
- **Do not add `aggregateRating` / `review` to a business's own `LocalBusiness`
  entity expecting stars.** See the self-serving review rule below — this is one
  of the most confidently-given wrong recommendations in local SEO.
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

## Reviews — two separate boundaries

### 1. Self-serving review markup is ineligible — do not recommend it

This is the one to get right, because the wrong version is extremely common and
sounds authoritative. Google's review-snippet documentation states:

> "If the entity that's being reviewed controls the reviews about itself, their
> pages that use `LocalBusiness` or any other type of `Organization` structured
> data are ineligible for star review feature."

The rule in practice:

- A review about entity A, published on entity A's own website, is **self-serving** —
  whether hand-written into the markup **or pulled in by an embedded third-party
  widget**, explicitly including Google Business and Facebook review widgets.
- `LocalBusiness` (and every subtype — `AutoRepair`, `HairSalon`, `Dentist`…) and
  `Organization` are therefore **not eligible for review stars from on-site markup**.
- Review snippets remain available for other types where the reviewer isn't the
  reviewed party — `Product`, `Recipe`, `Book`, `Movie`, `Course`, `SoftwareApplication`.

**Where a local business's stars actually come from: the Google Business Profile.**
Local-pack and knowledge-panel star ratings are driven by real GBP reviews, not
by JSON-LD on the site. So the correct recommendation is "earn reviews on your
Business Profile," never "mark up your reviews for stars."

**Two audit consequences:**

- **Don't flag missing `aggregateRating` on a LocalBusiness as a gap.** It isn't
  one. It's ineligible.
- **Don't tell a client their competitor is "eligible for stars" because you found
  `AggregateRating` in the competitor's markup.** Plenty of local sites publish
  self-serving review markup that earns them nothing. Check whether stars
  actually appear in results before making a competitive claim — a claim the
  client can disprove with one search is worse than no claim at all.

### 2. How reviews are obtained

Recommend earning and responding to genuine reviews under each platform's rules.
Never recommend or facilitate buying, fabricating, gating (soliciting only from
customers likely to leave positive reviews), or incentivizing reviews in
prohibited ways. Responding to reviews is free, entirely within the client's
control, and a legitimate recurring retainer deliverable.

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
