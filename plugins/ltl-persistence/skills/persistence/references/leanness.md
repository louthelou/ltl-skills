# Leanness — the prime directive

Persistence is not free: every always-loaded doc costs tokens on every turn/session. A persistence layer succeeds by staying **small and curated**, not by accumulating. The job is curation + wiring, not storage.

## The test for every line

> Does this earn its place in the context window *every time it loads*?

If not: cut it, move it to an on-demand file, or replace it with a pointer.

## Rules

- **Split by access pattern.** Canonical file = the rule/state itself. Provenance, rationale, war-stories = on-demand notes. Always-loaded index = pointers only, never payloads.
- **One example max**, only where it sharpens meaning.
- **Cut restatement.** "How to apply" sections that merely re-say the rule are pure cost.
- **Lists/tables over prose** where they compress.
- **Prune as you checkpoint.** Delete done/stale items every time you touch a doc; don't let it become a log.
- **Cap the handoff** at ~1–2 screens.
- **Progressive disclosure.** A lean entry doc + detail in references fetched on demand. (This very skill is built that way.)

## Worked example (verbose → lean)

**Before** (~6 lines): a rule with an intro paragraph, two examples, a "Why" backstory, and a numbered "How to apply" list.

**After** (~2 lines): the imperative rule + the one command/threshold needed + a skip-case.

Same rule, ~70% fewer tokens, nothing actionable lost.

## The one caution

Pruning removes *form*, never *rules*. If you're unsure whether a detail is load-bearing, **move it to an on-demand file rather than deleting it** — you keep it recoverable without paying for it every load.
