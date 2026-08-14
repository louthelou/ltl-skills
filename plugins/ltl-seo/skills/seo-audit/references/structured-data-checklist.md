# Structured Data Checklist by Page Type

Per-page-type expectations for JSON-LD schemas. Use this to identify real gaps vs. confabulated "missing schema" claims. A homepage that has WebSite + Organization + the page's primary entity is well-served; an article page that's missing Article schema is a real gap.

When a schema is "expected," it means it commonly appears on this page type AND Google or major search engines use it. "Optional" means it's nice-to-have but not a real gap. "Avoid" means commonly suggested but not actually useful.

**Always verify the current status of each recommendation against the docs** — see `current-docs-to-verify.md` for URLs.

## Homepage

**Expected:**
- `WebSite` — with `name`, `url`, `publisher` referenced via `@id`
- `Organization` — with `name`, `url`, `logo`; one canonical declaration referenced elsewhere by `@id`
- `WebApplication` or `SoftwareApplication` — if the site IS an interactive tool (e.g., calculator, converter, web app). With `applicationCategory`, `operatingSystem`, `browserRequirements`, optionally `offers` for free apps (`price: "0"`).

**Optional:**
- `SearchAction` (as `potentialAction` on WebSite) — eligible for sitelinks search box on branded SERPs. Requires the site actually handle the URL pattern (e.g., `?q={search_term_string}`).
- `FAQPage` — if the homepage has a substantive FAQ section. Note: FAQ rich results removed for all sites May 2026; markup is still parsed for entity understanding but produces no SERP feature. Only emit it if the same Q&A is visible on the page (Google's visible-content rule).

**Avoid (commonly wrongly recommended):**
- `Article` on the homepage — homepage is not an article
- `BreadcrumbList` on the homepage alone — no breadcrumb trail to describe

## Article / Blog post / Guide page

**Expected:**
- `Article` (or more specific subtype: `NewsArticle`, `BlogPosting`, `TechArticle`, etc.) — with `headline`, `datePublished`, `dateModified`, `author` (Person preferred for E-E-A-T), `publisher` (Organization), `image`, `mainEntityOfPage`
- `BreadcrumbList` — describes the navigation path

**Optional:**
- `Speakable` — only if optimizing for voice assistants; limited rollout
- `Image` ImageObject — for inline images, especially infographics

**Avoid:**
- `FAQPage` unless the article HAS a substantive FAQ section; don't add an empty schema

## Product page (e-commerce)

**Expected:**
- `Product` — with `name`, `image`, `description`, `brand`, `offers` (with `price`, `priceCurrency`, `availability`, `priceValidUntil`)
- `BreadcrumbList`
- `Review` or `AggregateRating` if reviews exist (this powers stars in SERP)

**Note:** Product structured data must reflect what's actually on the page — fake reviews / aggregate ratings violate Google's policies.

## Listing page (category, archive, index)

**Expected:**
- `BreadcrumbList`
- `CollectionPage` or `ItemList` describing the listed items — optional, currently low ROI

**Avoid:** trying to mark up every listed item as its own schema — link to detail pages instead.

## FAQ page (standalone)

**Expected:**
- `FAQPage` with each Question + Answer pair as `mainEntity`

**Verify:** FAQ rich results were removed for all sites as of May 2026 — structured data still helps entity understanding but won't produce SERP rich results. Don't recommend adding it solely for SERP appearance.

## Recipe page

**Expected:**
- `Recipe` — with `name`, `image`, `author`, `datePublished`, `description`, `recipeYield`, `recipeIngredient`, `recipeInstructions`, `nutrition` (NutritionInformation), `prepTime`, `cookTime`, `totalTime` (ISO 8601 durations)

**Optional:**
- `AggregateRating` if user reviews
- `Video` if there's a recipe video

## Video page

**Expected:**
- `VideoObject` — with `name`, `description`, `thumbnailUrl`, `uploadDate`, `duration` (ISO 8601), `contentUrl` or `embedUrl`

## Event page

**Expected:**
- `Event` — with `name`, `startDate`, `endDate`, `location` (Place), `eventStatus`, `eventAttendanceMode`, `organizer`

## Local business

Full treatment in `local-seo.md` — including Business Profile primacy, which outweighs anything on this page. Summary:

**Required by Google:** `name`, `address` (a `PostalAddress`).

**Recommended:** `telephone`, `geo` (`GeoCoordinates`), `openingHoursSpecification`, `priceRange`, `url`.

**Use the most specific subtype**, not bare `LocalBusiness` — `AutoRepair`, `HairSalon`, `Dentist`, `Restaurant`, `Plumber`, `DaySpa`, `HealthClub`, and so on. `LocalBusiness` is a subtype of `Organization`, so the Organization fields are worth following too.

**One entity per physical location.** A two-location business needs two nodes, each with its own address and hours, ideally on its own location page.

**Avoid:** `aggregateRating` or `review` describing the business's *own* self-declared ratings. Those properties are for sites that genuinely capture reviews about other businesses. Marking up ratings the site never collected violates Google's structured-data policies and risks manual action.

**The usual real finding is a hollow entity, not a missing one** — the correct type declared with only `name`, `logo` and `url`, missing the required `address`. Enumerate properties, not just types, and check microdata as well as JSON-LD.

## Author profile / About page

**Expected:**
- `Person` — with `name`, `jobTitle`, `worksFor`, `sameAs` (linking to authoritative profiles for E-E-A-T)

## Calculator / tool pages

**Expected:**
- `WebApplication` or `SoftwareApplication` — see Homepage section above
- `BreadcrumbList` — describes path to the tool

## Universal: @id cross-references

The modern best practice is `@id` cross-references between related schemas — your Organization schema gets a stable `@id` (e.g., `https://site.com/#organization`), and every other schema's `publisher` / `creator` / `provider` references it via `{ "@id": "https://site.com/#organization" }` instead of duplicating the Organization properties.

This produces a connected entity graph rather than independent floating nodes. Google's knowledge graph stitches them together accurately when the IDs match.

## When to flag a real gap

A real gap is: the page type has an Expected schema, the schema doesn't appear in the rendered JSON-LD, AND the current Google docs confirm the schema is still useful for this page type. Don't flag gaps for schemas in the "Optional" or "Avoid" rows.

When you flag a gap, include:
- What schema is missing
- Why this page type benefits from it (eligibility for which rich result, or entity-graph reason)
- Cite the current Google doc URL
- Provide a JSON-LD example tailored to the page

## When to push back

A confabulated gap is: claim that schema X is missing when it's actually present (verify with curl + grep), OR claim X should be added when current Google guidance is "deprecated" or "not used for this page type." Push back with the verification evidence and the deprecation citation.
