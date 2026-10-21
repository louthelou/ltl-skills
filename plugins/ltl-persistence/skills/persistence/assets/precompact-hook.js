#!/usr/bin/env node
"use strict";
/*
 * ltl-persistence - PreCompact hook.
 *
 * Fires right before Claude Code compacts the conversation. It cannot write the
 * handoff (that needs a model turn); its job is to make the compaction summary
 * precise: which handoff file(s) the next session must read, whether each one is
 * fresh, stale or missing, and what the summary must carry itself when a handoff
 * is stale or missing. It also saves the project list to
 * ~/.claude/ltl-persistence/last-compact.json so the SessionStart hook can find the
 * handoff even when the post-compaction transcript is a fresh file.
 *
 * Plain text on stdout (surfaced as compaction guidance). Fail-open: a generic
 * reminder on any error.
 * Debug: node precompact-hook.js --debug < input.json
 */

const lib = require("./lib/persistence-lib.js");

(async () => {
  const debug = process.argv.includes("--debug");
  let out = "";
  try {
    const cfg = lib.loadConfig();
    const input = lib.parseJson(await lib.readStdin(), {}) || {};
    const { assessments } = lib.analyze(input, cfg);
    out = lib.precompactMessage(assessments);
    lib.saveState({
      ts: Date.now(),
      sessionId: input.session_id || null,
      cwd: input.cwd || null,
      transcript: input.transcript_path || null,
      projects: assessments.map((a) => ({ dir: a.project.dir, handoff: a.handoff.path, state: a.state })),
    });
    if (debug) {
      process.stderr.write(JSON.stringify(assessments.map((a) => ({ dir: a.project.dir, handoff: a.handoff.path, state: a.state, active: a.active, since: a.since.length })), null, 2) + "\n");
    }
  } catch (e) {
    out = lib.fallbackMessage();
    if (debug) process.stderr.write(String((e && e.stack) || e) + "\n");
  }
  process.stdout.write(out + "\n");
  process.exit(0);
})();
