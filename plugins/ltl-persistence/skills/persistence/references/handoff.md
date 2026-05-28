# The HANDOFF doc

A HANDOFF is the single "resume-here" snapshot a fresh or post-compaction session reads first. It holds *volatile current state* — not stable project facts (those belong in `CLAUDE.md`).

## One HANDOFF per project — its own sessions maintain it

Each project gets its **own** HANDOFF at its root, wired to its own auto-loaded layer; they're never shared. **Checkpoint and prune it from *within* that project, where the live context is — never edit another project's HANDOFF from a different session, or you're pruning state you can't see.** And not every project needs one: a HANDOFF is for ongoing volatile work; a stable repo's state lives in git + `CLAUDE.md`.

## Lean structure (top-to-bottom = most-needed first)

- **Now** — current task + the very next step. The first thing a cold session needs.
- **Open threads** — decisions pending, blockers, in-flight items.
- **Deferred** — noticed-but-not-done, so nothing is silently dropped.
- **Anchors** — the few files / commands / URLs needed to act.

Start from `assets/handoff.template.md`.

## The discovery wiring (the part that actually makes it survive)

A HANDOFF only helps if an *auto-loaded* file points to it. After a compaction the conversation is summarized, but `CLAUDE.md` and memory are reloaded fresh — so the pointer must live there:

- **Project has a `CLAUDE.md`:** add one line near the top —
  `> On resume, read ./HANDOFF.md first for current state.`
- **User uses the memory feature:** add the same one-liner to the auto-loaded memory index (e.g. `MEMORY.md`).
- **Neither:** the handoff still helps within a session, but say plainly that it won't be auto-found after a compaction unless they add the pointer or install the PreCompact hook.

A handoff nothing references is invisible post-compact. This wiring is the whole difference between "I keep notes" and "my notes actually load."

## Size discipline

Keep it to ~1–2 screens. A handoff that grows without bound stops being loadable (Claude Code may report it "too large to include") and burns context every turn. It's a *snapshot*, not a changelog — prune done items at every checkpoint. Long-lived detail belongs in `CLAUDE.md` or on-demand reference files, with the handoff pointing to them.

## HANDOFF vs. CLAUDE.md

- **HANDOFF** = volatile, changes constantly, "where we are right now." Prune aggressively.
- **CLAUDE.md** = stable, changes rarely, "how this project works / durable facts & conventions." Keep lean too, but it's the long-term home.

When something in the handoff stops being volatile (a settled convention, a permanent fact), promote it to `CLAUDE.md` and drop it from the handoff.
