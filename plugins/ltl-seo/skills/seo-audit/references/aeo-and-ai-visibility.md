# AEO and AI Visibility

Optimize a site to be *cited* by AI search engines and answer assistants — not just ranked as a blue link — while staying honest that this field moves fast and most of it is unsettled.

The governing rule for this entire file: **AEO is fast-moving. Web-verify the current behavior of any specific engine before you make an engine-specific claim, and never present speculation as established practice.** Where classic SEO has years of documented, stable guidance, AEO has months of shifting behavior and vendor-specific quirks. Treat every "do this for engine X" statement as perishable.

## What AEO is and how it differs from classic SEO

Answer Engine Optimization (AEO) is optimizing content so that AI-driven answer surfaces — AI Overviews in search, chat assistants, and standalone answer engines — *quote, summarize, or cite* your content when responding to a user, instead of (or in addition to) listing your page as a ranked link.

The mental shift:

- **Classic SEO** competes for a *ranked position* on a results page; the user clicks through to you.
- **AEO** competes to be the *source the machine uses to compose its answer*; the user may read the answer without clicking, but your content is the cited authority behind it.

A page can rank well and still never get quoted, or get quoted while ranking modestly. The optimization targets overlap (good content, clear structure, authority) but are not identical. Be clear which one a given recommendation serves.

## Content patterns that aid extraction

Answer engines reward content that is easy to lift out and present as a standalone answer. Audit for and recommend:

- **Question-then-direct-answer structure.** Pose the user's likely question as a heading, then answer it directly and completely in the first sentence or two beneath — before the throat-clearing and context. The first 1–3 sentences after a question heading are what gets pulled.
- **Self-contained factual statements.** Write sentences that stand alone when quoted out of context. "The recommended interval is 90 days" beats "As mentioned above, it's 90 days" — the latter breaks when extracted.
- **Definitional clarity up front.** For "what is X" intents, define X cleanly in the opening, in one or two sentences, before elaborating.
- **Concise top-of-page summaries.** A short summary near the top (a TL;DR or a lead paragraph that states the core answer) gives the engine a clean candidate to quote.
- **Clean lists and tables.** Steps, comparisons, and specs in well-formed `<ol>/<ul>/<table>` markup are easy for a model to parse and reproduce. Avoid burying a list inside a wall of prose.
- **Explicit dates and attributions.** State when something was published/updated and who is responsible for a claim. Freshness and provenance help an engine decide whether to trust and cite the statement.

These are content/structure recommendations you can make with reasonable confidence because they aid *any* extraction system; they're less perishable than engine-specific tactics. Still, frame them as "improves extractability," not "guarantees citation."

## Entity and topical clarity

Answer engines reason over entities (people, organizations, products, concepts), not just keywords. Help them:

- **Consistent naming.** Refer to your product/brand/people the same way everywhere; don't alternate between variants that fragment the entity.
- **Clear author and organization.** Make it unambiguous who published the content and what organization stands behind it. Vague or anonymous content is a weaker citation candidate.
- **Internally consistent facts.** Contradictory figures across pages (one page says 90 days, another says 60) undercut trust and give the engine no clear value to quote. Flag internal contradictions you find.

## Structured data — role and limits

Structured data (JSON-LD) helps machines understand entities and relationships, which can support AI comprehension of your content. But keep three limits in view:

- **Google states there is no special structured data for AI features.** No schema type makes a page eligible for AI surfaces (see the AI optimization guide cited above). Recommend structured data on its ordinary merits — entity clarity and rich-result eligibility where one still exists — never as an AI-visibility lever.
- It is **not a magic citation trigger.** Adding schema does not entitle a page to be quoted by an assistant.
- Apply the same currency discipline as the rest of the SEO audit: several rich-result types have been deprecated, and what aids machine understanding versus what produces a visible SERP feature are different questions. **Web-verify the current status of any schema type before recommending it** (the main skill's verification methodology applies here unchanged — for example, FAQ rich results were removed for all sites in May 2026, though the markup can still aid entity understanding).

Recommend structured data for genuine entity/relationship clarity, not as an AEO silver bullet.

## Authority, trust, and freshness signals

The same signals that make content trustworthy to classic search tend to make it a better citation candidate: demonstrable expertise, accuracy, clear sourcing, and recency for time-sensitive topics. There's no separate "AEO authority" dial to turn — invest in the substance. Where a topic is time-sensitive, current and dated content is more likely to be both ranked and quoted.

## Google has published a position — use it

Google now documents this directly in **"Optimizing your website for generative AI features on Google Search"**
(https://developers.google.com/search/docs/fundamentals/ai-optimization-guide),
announced May 2026. It removes most of the guesswork for Google specifically, and it is the citation to reach for whenever a client or another audit proposes an "AEO/GEO" tactic.

What Google states:

- **No special files or markup are needed.** You do not need to create machine-readable files, "AI text files," special markup, or Markdown to appear in Google Search including its generative AI features.
- **No special structured data exists for AI features.** There is no schema.org type that makes a page eligible for AI surfaces.
- **Google's AI features run on the same ranking systems** as the rest of Search. Ordinary SEO fundamentals — crawlable, indexable, genuinely useful content — are the optimization.
- **Google explicitly names ineffective tactics:** content "chunking," keyword-variant rewrites of the same page, and pursuing inauthentic mentions.

### llms.txt specifically

**Google Search does not use `llms.txt`.** Per Google, maintaining one "will neither harm nor help your site's visibility or rankings in Google Search." Google has also said it is *fine* to keep one if other systems consume it — so the correct posture is neutral, not prohibitive.

How to report it:

- Never present `llms.txt` as a requirement, a ranking factor, or a Google-visibility tactic. That claim is now demonstrably wrong, not merely unverified.
- If a client already has one, leave it. It costs nothing and may serve non-Google consumers.
- **Other engines are a separate question.** Google's position does not speak for Perplexity, OpenAI, Anthropic, or any other assistant. If the client cares about a specific engine, web-verify that engine's behavior and report what you actually found — including "no confirmed support."

### When someone pitches a GEO/AEO tactic

Ask the two questions that resolve most of them: *does the engine's own documentation say it uses this?* and *would this be worth doing if AI answer engines did not exist?* A tactic that fails both is usually a repackaged 2010s SEO trick. Point at the Google guide and move on.

## Measuring AI visibility today

Measurement here is immature — be honest about that:

- **Manual prompting.** Ask the actual assistants/answer engines the questions your audience would ask, and observe whether your content is cited, summarized, or absent. Record the prompt, the engine, the date, and the result. This is the most direct signal available and it's a spot check, not a metric — outputs are non-deterministic and shift over time, so a single result is anecdotal.
- **Emerging tooling.** Some third-party tools claim to track brand mentions and citations across AI answer surfaces. Treat their numbers cautiously, name the methodology limits, and don't present them as settled metrics on par with Search Console data.
- **No equivalent of Search Console yet.** There is no authoritative, first-party "AI citation console" for most engines. Say so rather than implying precise measurement exists.

## Verification rule

Throughout the AEO section of any audit: flag claims as fast-moving, web-verify current engine behavior before any engine-specific recommendation, separate the relatively durable content/structure advice from the perishable engine-specific tactics, and never let speculation read as established practice. When you're unsure whether an engine behaves a certain way today, say you're unsure and what you'd check — exactly as the main methodology demands for any time-sensitive claim.
