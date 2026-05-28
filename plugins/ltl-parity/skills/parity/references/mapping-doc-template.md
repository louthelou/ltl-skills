# [Project A] ↔ [Project B] — Parity Mapping

> Starter template for the parity skill's Phase 0. Fill every section with the
> real project specifics, then have the user ratify the divergence lists.

## The pair

| | Path | Stack |
|---|---|---|
| **[A — usually the source]** | `…` | e.g. static site, build script, vanilla JS |
| **[B — usually the mirror]** | `…` | e.g. React Native + Expo + TS |

One-line statement of the relationship: *"B is a native mirror of A — same data, same math, same brand; presentation adapts to each stack."*

## File map (source → target, with translation)

```
A                                  B                              translation
────────────────────────────      ──────────────────────────     ───────────
data/<dataset>.js              →   src/data/<dataset>.ts          JS object → typed
content/articles (HTML)        →   src/data/articles.ts           HTML → Markdown
<logic>.js (UNITS, convert)    →   src/lib/<logic>.ts             port + add types
styles (CSS :root tokens)      →   src/theme/tokens.ts            palette/radii/shadow
…                                  …
```

## What propagates (parity required)

- Data records (the shared dataset)
- Domain logic / math / conversion tables
- Article/guide content (with format translation)
- Safety/compliance content ← **flag as risky every time** (Phase 3)
- Brand design tokens

## What is A-only (do NOT propagate to B)

- e.g. SEO/schema/sitemap, ad-network markup specific to A, A's nav chrome, A's build/deploy config

## What is B-only (do NOT propagate to A)

- e.g. navigation/picker/modal code, B's build config, B's ad SDK config, anything under B's component/screen dirs that's a native-idiom divergence

## Intentional divergences (do NOT "fix" back to matching)

| A pattern | B equivalent | Why it differs |
|---|---|---|
| e.g. dropdown combobox | bottom-sheet picker | touch UX |
| e.g. data table | value-list | narrow screens |

## Translation cheatsheet (if articles/markup are involved)

```
<h2>X</h2>          → ## X
<strong>X</strong>  → **X**
<a href="/p/">X</a> → [X](/p/)        (keep internal /path/ scheme)
<div class="callout">X</div> → > X     (blockquote)
<table>…</table>    → value-list or GFM table (decide per target's renderer)
```

## Verification commands

- A: `[build / deploy / test command]`
- B: `[typecheck / doctor / test command]`
- Safety/logic ports: `[how to runtime-spot-check the ported module]`

## Parity log

Record each sync: date, what was mirrored, what was deferred (+ reason). Keep
this current — the doc is only useful if it reflects reality.
