# User-defined standing rules

Durable behavioral rules that should apply across sessions (e.g. "deploy this way", "estimate in these units", "always do X before Y"). **This skill ships none** — it only captures what the user states. Never invent or assume a rule.

## Format — lean by construction

One rule per section: a short imperative title + the minimum needed to act on it (commands, paths, thresholds, skip-cases). That's it.

- **Keep provenance out of the canonical file.** *Why/when* a rule was added is occasionally useful but rarely needed — put it in an on-demand note (e.g. a memory `feedback_*.md` file), not in the always-paid rule text.
- **One example max**, and only if it genuinely sharpens the rule.
- **No "how to apply" restatement.** If a rule needs a paragraph explaining how to follow it, it isn't written tightly enough.

Start from `assets/standing-rules.template.md` (an empty scaffold).

## Usage — a rule only fires if it's loaded

Writing a rule to a file the model never sees does nothing. For a rule to take effect every session it must be in, or pointed-to from, the **auto-loaded layer**:

- **Simplest:** put the rules directly in the project `CLAUDE.md` (auto-loaded on entering the project).
- **One source across projects:** keep a canonical `STANDING-RULES.md` and add a one-line pointer in `CLAUDE.md` / memory (e.g. *"Standing rules: see STANDING-RULES.md"*). The canonical file is fetched on demand; only the pointer is always-paid.

## Capturing a rule ("add a rule" mode)

1. Confirm it's a *durable* rule the user actually wants standing — not a one-off request.
2. Write the lean rule to the canonical file.
3. Ensure it's reachable from the auto-loaded layer (inline or pointer).
4. Optionally stash provenance in an on-demand note.

If the user later says "that rule is wrong / gone," remove it from the canonical file *and* any mirror pointer so they don't drift.
