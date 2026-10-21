#!/usr/bin/env node
"use strict";
/*
 * ltl-persistence - Stop hook (the enforcement half).
 *
 * When the model is about to end its turn, check every project this session wrote
 * to. If a project's handoff is missing, or its latest change is more than
 * graceMinutes (default 20) newer than the handoff, block the stop once with a
 * reason that names the file and what changed. The model refreshes the handoff and
 * stops; the second pass arrives with stop_hook_active=true and is let through, so
 * this can never loop.
 *
 * Never blocks: when stop_hook_active is set, when the stop is a clear/resume/compact
 * transition, when the session wrote nothing, or on any internal error (fail-open).
 *
 * Output on block: {"decision":"block","reason":"..."} (exit 0).
 * Debug: node stop-hook.js --dry-run < input.json   (prints the verdict, never blocks)
 */

const lib = require("./lib/persistence-lib.js");

(async () => {
  const dryRun = process.argv.includes("--dry-run") || process.argv.includes("--debug");
  try {
    const cfg = lib.loadConfig();
    const input = lib.parseJson(await lib.readStdin(), {}) || {};
    if (input.stop_hook_active) return process.exit(0);
    const why = String(input.reason || input.source || input.trigger || "").toLowerCase();
    if (/compact|clear|resume/.test(why)) return process.exit(0);

    const { assessments, timings } = lib.analyze(input, cfg, { tailBytes: cfg.stopTailBytes || lib.DEFAULTS.stopTailBytes, lazy: true });
    const stale = assessments.filter((a) => a.stale && a.active);
    if (dryRun) {
      process.stderr.write("timings " + JSON.stringify(timings) + "\n");
      process.stderr.write(
        JSON.stringify(
          assessments.map((a) => ({ dir: a.project.dir, handoff: a.handoff.path, state: a.state, active: a.active, lastWrite: lib.fmtTime(a.lastWriteExcl), lastChange: lib.fmtTime(a.lastChange), since: a.since.length })),
          null,
          2
        ) + "\n"
      );
      process.stderr.write(stale.length ? "WOULD BLOCK:\n" + lib.stopMessage(stale, cfg) + "\n" : "would allow the stop\n");
      return process.exit(0);
    }
    if (stale.length) {
      process.stdout.write(JSON.stringify({ decision: "block", reason: lib.stopMessage(stale, cfg) }) + "\n");
    }
  } catch (e) {
    if (dryRun) process.stderr.write(String((e && e.stack) || e) + "\n");
  }
  process.exit(0);
})();
