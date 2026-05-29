---
name: parity
description: Keep two (or more) related codebases in sync — typically a website and its companion app, or any pair that deliberately mirrors the same data/logic/content across different stacks. Use whenever the user wants to "create parity", "sync the app with the site" (or vice-versa), "mirror this change to the other project", "check what's out of sync between X and Y", "port the recent changes across", set up an ongoing parity relationship, or asks whether two codebases have drifted. This skill provides a GUIDED, judgment-gated workflow (not blind copy-paste) with explicit risk warnings, classification of every change, and a both-sides verification gate — designed to be an aid that prevents drift, never a tool that silently corrupts the target.
---

# Cross-Codebase Parity

This skill keeps two related codebases in lockstep when they deliberately mirror the same product across different stacks — e.g. a static website (vanilla JS / HTML) and its native app (React Native / TypeScript). It was built for exactly this case: a content-driven website and its companion mobile app sharing the same data, logic, and brand, kept in sync through a single mapping document (such as a `HANDOFF.md`).

## Why this skill exists (and what it is NOT)

**Parity is not `diff A | apply to B`.** Two mirrored codebases are almost never 1:1. The same content/logic is expressed differently per stack:

- HTML template literals ↔ Markdown strings
- CSS `:root` variables ↔ a `tokens.ts` StyleSheet
- plain JS objects ↔ typed `Record<UnitKey, …>` unions
- DOM combobox ↔ native bottom-sheet picker (intentionally divergent — see "respect divergences")

A skill that blindly copied changes from one to the other would corrupt the target. So this skill is a **guided methodology with judgment gates**, not automation. It systematizes the *workflow* and enforces the *safeguards*; the per-change translation still needs reasoning.

**The prime directive:** never silently diverge, and never silently mis-port. Every change is either mirrored, deliberately skipped (with a recorded reason), or surfaced to the user as risky. Drift that nobody decided on is the failure this skill prevents.

**Source-of-truth default — the newer project usually wins, but verify first.** When you find a discrepancy (one side has something the other lacks, or they differ and intent is unclear), default to treating the **newer project's files as authoritative** — they more often reflect the latest decision. This never replaces the verify-before-acting gate below: the older artifact may be deliberately kept or worth porting forward, so always check *why* the discrepancy exists before resolving it. The same kind of discrepancy can resolve opposite ways — a guide the newer side **deleted** should be removed from the staler side, while a record the staler side is simply **missing** should be ported to it.

## Phase 0 — Establish the pair and the mapping

Before syncing anything, you need to know which two projects, and how they map.

1. **Get the two project roots.** If the user didn't name them, ask: "Which two projects? Give me the paths or names." Don't guess.
2. **Find the mapping doc.** Look for an existing site↔app mapping (e.g. `HANDOFF.md`, `PARITY.md`, a section in `CLAUDE.md`/`AGENTS.md`). This doc is the source of truth for: which file in A corresponds to which in B, what translation each pair needs (HTML→MD, CSS→StyleSheet, etc.), and the explicit "propagates / web-only / app-only" lists.
3. **If no mapping doc exists, create one first.** You cannot reliably sync without it. Walk both trees, propose a file-map + translation rules + propagation rules, and write it to a `HANDOFF.md`-style doc. Get the user to confirm the divergence lists (what's intentionally one-sided) before proceeding — those lists are judgment calls only the user can ratify.

> The mapping doc is the foundation. A parity pass without one is guessing. If you find yourself inferring "this probably maps to that," stop and write the mapping down + confirm it.

## Phase 1 — Detect divergence

Determine what changed in the source project that may need mirroring.

- **Git-based (preferred):** if both repos are tracked, find what changed in the source since the last parity sync. Look for a parity marker (a tag, or the last "parity" commit), or diff against the point where the two last agreed. `git log`, `git diff <since>...HEAD` on the source.
- **Content-based (fallback):** if not git-tracked, diff the mapped files directly (source data file vs. target data file, accounting for the format translation).
- Produce a concrete list of candidate changes, each tied to a mapped target location.

## Phase 2 — Classify every candidate change

This is the heart of the skill. Put each change into exactly one bucket:

| Bucket | Meaning | Action |
|---|---|---|
| **Mechanical** | 1:1 data/logic with no translation (e.g. a new data record, a changed number) | Port directly, preserving the target's format |
| **Translation-needed** | Same content, different representation (HTML→MD, CSS→StyleSheet, JS→TS) | Port with the mapping's conversion rules; reason per-change |
| **One-side-only** | The mapping says this doesn't propagate (SEO/schema → web-only; navigation/EAS config → app-only) | Skip; note that it was correctly skipped |
| **Risky / unknown** | See the risk taxonomy below | STOP. Surface to the user. Do not auto-apply. |

Never apply a change you couldn't confidently classify. "I'm not sure which bucket" ≡ risky → surface it.

## Phase 3 — Warn on risk (the safeguard that makes this an aid, not a hazard)

For anything in the **risky / unknown** bucket, stop and surface it to the user with: what the change is, why it's risky, and the options. Categories that ALWAYS warrant a warning:

- **Safety-critical content** — food safety, medical, legal, financial. (For example, allergen or dietary-safety data on a food site: a wrong port here can harm a user.) Port these with extra verification and explicit user confirmation; never rush.
- **Security-sensitive** — auth, secrets, permissions, anything touching credentials or access control.
- **Irreversible / destructive** — deletions of data that one side still uses (e.g. a field that looks dead but feeds something — verify *both* sides actually stop reading it before deleting from either).
- **Ambiguous mapping** — the source change has no clean target equivalent, or could map two different ways.
- **Intentional-divergence collision** — the change touches an area the mapping marks as a deliberate native-idiom divergence (don't "fix" the divergence back to matching without a reason).
- **Cross-stack behavioral risk** — a translation that *looks* equivalent but might behave differently (e.g. a regex, a number-format, a date parse, a rendering quirk between platforms).

The warning is not optional politeness — it's the mechanism that keeps the skill from confidently doing the wrong thing. A silent mis-port of safety content is the worst-case failure; this phase exists to make it impossible.

## Phase 4 — Apply

Apply the **mechanical** and **translation-needed** changes (and any **risky** ones the user explicitly approved). Per change:

- Follow the target's existing conventions and the mapping's translation rules.
- Lean on the target's type system where it exists — e.g. widening a typed union (`UnitKey`) makes the compiler enforce that every dependent map gets updated. TypeScript turns "did I update everything?" into a compile check; use it.
- Keep edits surgical and reviewable. Don't refactor adjacent code mid-port.

## Phase 5 — Verify BOTH sides (the gate)

Do not declare parity on a broken build. Run each project's checks:

- Source side: its build / typecheck / tests (e.g. the site's build script; deploy if that's the workflow).
- Target side: its build / typecheck / tests (e.g. `npx tsc --noEmit`, `expo-doctor`).
- For safety-critical or logic ports, add a **runtime spot-check** — e.g. compile the ported pure-logic module standalone and assert a handful of known cases match the source's output. (For example, a ported food-safety module verified against known inputs — each one mapping to the correct warning — before being trusted.)
- If you cannot run the target (e.g. a mobile app you can't launch from here), say so explicitly and flag that the user must device-test before shipping. Don't imply verification you didn't do.

## Phase 6 — Record

- Commit the parity changes on both sides, with cross-referenced messages (or together) so the relationship is traceable.
- If the sync workflow itself changed (new file pair, new translation rule, new divergence), **update the mapping doc**. The doc is only useful if it stays current.
- Note anything deferred (risky items not yet ported) so it's never silently lost — the equivalent of the standing-rule clause "make the change OR explicitly flag it as a deferred parity gap."

## Reporting format

```markdown
# Parity sync — [Source] → [Target]

Mapping doc: [path]   |   Divergence basis: [git since X / content diff]

## Mirrored
[mechanical + translation changes applied, with target file:line]

## Correctly skipped (one-side-only)
[changes the mapping says don't propagate, + which rule]

## Surfaced for your call (risky/unknown)
[each: what / why risky / options] — these were NOT auto-applied

## Verification
[source checks + target checks run, results; runtime spot-checks; what couldn't be verified]

## Deferred parity gaps
[anything left, with the reason]
```

## Respect intentional divergences

Some differences are deliberate and correct — native idioms that *should* differ (a web dropdown vs. an app bottom-sheet; a web table vs. an app value-list on a narrow screen). The mapping doc should list these. Porting them back to "match" is a regression, not a fix. When a change touches a divergence zone, treat it as risky and confirm intent.

## Honest limitations (tell the user these)

- **Cross-stack translation needs judgment** — this skill structures and safeguards it; it doesn't make it mechanical.
- **The mapping doc is required.** The skill bootstraps one if missing, but it can't infer a perfect mapping cold — the user must ratify the divergence lists.
- **Git-tracked projects work best** for clean divergence detection; without git you fall back to content diffs.
- **You can't always verify the target** (e.g. an app you can't launch). Be explicit about that gap rather than implying parity is proven.

## When extending to more than two projects (a "factory")

The same workflow scales to one source feeding several targets (e.g. a site template → multiple sites, or a shared data set → site + app + a third surface). Run Phases 1–6 per target. Keep one mapping doc per pair (or a matrix). Warn-on-risk and verify-each-target still apply individually — a change safe for one target may be risky for another.
