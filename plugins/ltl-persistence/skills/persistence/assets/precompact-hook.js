#!/usr/bin/env node
/*
 * ltl-persistence — PreCompact hook.
 *
 * Fires before Claude Code compacts the conversation. Its job is WIRING,
 * not authoring: it injects a reminder so the compaction summary tells the
 * next session to read the HANDOFF first. Adapt the path/text to your setup.
 *
 * Output goes to stdout, which Claude Code surfaces as compaction guidance.
 */

const reminder = [
  "[ltl-persistence] Preserve continuity across this compaction:",
  "1) Make the summary explicitly instruct the next session to READ ./HANDOFF.md FIRST",
  "for current task, next step, open threads, and deferred items.",
  "2) If HANDOFF.md is missing or stale, note that it should be created/updated next turn.",
  "Keep it lean: carry a pointer to the handoff, not a copy of it.",
].join(" ");

process.stdout.write(reminder + "\n");
process.exit(0);
