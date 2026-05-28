---
name: persistence
description: Set up and maintain token-lean, compaction-surviving persistence for a project — a "resume-here" HANDOFF doc, an optional user-defined standing-rules file, and an opt-in PreCompact hook, all wired into Claude Code's native auto-loaded layer (CLAUDE.md / memory) so a post-compaction or brand-new session reliably picks up where work left off, without bloating the context window. Use whenever the user wants to "not lose context when compacting", "remember this across sessions", "set up a handoff", "create standing rules", "checkpoint before compacting", "make my notes/CLAUDE.md survive a compact", or asks to improve Claude's persistence or memory. Ships zero rules of its own — it captures the user's.
---

# Persistence (compaction-surviving, token-lean)

Make work survive context compaction and new sessions — at minimum token cost. This skill does **not** invent a new storage system. It layers a disciplined workflow + wiring on top of what Claude Code already auto-loads (`CLAUDE.md`, the memory feature), so persistence is both reliable and cheap.

> **Prime directive — persistence is not free.** Every standing doc reloads into context each session/turn. The goal is a *small, curated* persistent footprint, not a growing pile. **Load a pointer; fetch the payload on demand.** A persistence layer that bloats is worse than one that forgets.

## The two failure modes this prevents

1. **Context lost at compaction** — the in-flight task, recent decisions, and "where we were" vanish when the conversation is summarized.
2. **Persistence that bloats** — a fat `CLAUDE.md` / handoff that survives but eats the context window every turn (often the worse problem; a handoff can even grow "too large to include").

Both are solved by the same thing: a lean, wired, on-demand-structured persistence layer.

## The pieces (and where the detail lives)

- **HANDOFF** — a lean "resume-here" snapshot: current state, open threads, deferred gaps. → `references/handoff.md`
- **Discovery wiring** — a one-line pointer in the auto-loaded layer so the handoff is *found* after a compaction. The crux. → `references/handoff.md`
- **Standing rules** (optional) — durable, user-defined behavioral rules. **Ships empty; captures the user's own.** → `references/standing-rules.md`
- **PreCompact hook** (opt-in) — fires at compaction time to guarantee the "read the handoff" pointer survives. → `references/precompact-hook.md`
- **Leanness discipline** — how to keep all of it small. → `references/leanness.md`

## Four modes

### 1. Set up (first run in a project)
1. **Detect the native layer — don't assume.** Is there a project `CLAUDE.md`? Does the user use the memory feature (an auto-loaded `MEMORY.md`)? What's the project root; is it git-tracked?
2. **Create a lean HANDOFF** from `assets/handoff.template.md` at the project root (or a path the user picks).
3. **Wire discovery** (the step that makes it survive): add a one-line pointer to the auto-loaded layer — *"On resume, read ./HANDOFF.md first for current state."* Without this, the handoff is invisible after a compaction.
4. **Offer** (don't impose) the empty standing-rules scaffold and the PreCompact hook.

### 2. Checkpoint (the recurring action)
Run at milestones, before a likely compaction, or at session end:
- Update the HANDOFF to current state, with **"resume here" at the very top**.
- **Prune as you go** — delete done/stale items. A handoff is a snapshot, not a changelog.
- Log any **deferred gaps** ("noticed X, didn't do it") so nothing is silently lost.
- If it's growing past ~1–2 screens, you're logging, not checkpointing — see `references/leanness.md`.

### 3. Add a rule
Capture a durable rule the user actually stated:
- Write only the rule (lean) to the user's standing-rules file; keep provenance in an on-demand note.
- Make sure it's reachable from the auto-loaded layer (inline, or a pointer) or it won't fire.
- See `references/standing-rules.md`. **Never add a rule the user didn't ask for.**

### 4. Prune
Apply the leanness pass to existing persistence files (handoff, rules, `CLAUDE.md`, memory). The test for every line: *does it earn its context-window cost on every load?* See `references/leanness.md`.

## Honest limits (tell the user)

- This **overlaps `CLAUDE.md` / memory by design** — it's workflow + wiring + discipline, not new storage. It makes the native files work harder for fewer tokens, rather than replacing them.
- The **PreCompact hook nudges and wires; it can't author** the handoff — that needs a model turn. "Automatic" means "automatically reminded and correctly pointed," not "written by the hook."
- It **can't recover context already lost** to a compaction that happened before setup. Set up early.
