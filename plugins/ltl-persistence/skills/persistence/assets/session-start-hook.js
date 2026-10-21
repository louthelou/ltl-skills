#!/usr/bin/env node
"use strict";
/*
 * ltl-persistence - SessionStart hook.
 *
 * Fires when a session starts, resumes, is cleared or has just been compacted.
 * Finds the projects the session touched (from the transcript, else from the state
 * the PreCompact hook saved, else the cwd), reports each handoff's state and inlines
 * the primary handoff so the model has it without a tool call. Silent when nothing
 * is found. Fail-open: any error exits 0 with no output.
 *
 * Output: JSON with hookSpecificOutput.additionalContext.
 * Debug:  node session-start-hook.js --debug < input.json   (also prints the analysis to stderr)
 */

const lib = require("./lib/persistence-lib.js");

(async () => {
  const debug = process.argv.includes("--debug");
  try {
    const cfg = lib.loadConfig();
    const input = lib.parseJson(await lib.readStdin(), {}) || {};
    const source = String(input.source || input.reason || "");
    const analysis = lib.analyze(input, cfg);
    let assessments = analysis.assessments;
    if (!assessments.length) {
      // a fresh post-compaction transcript has no tool calls yet: use what PreCompact saved
      const state = lib.loadState(30 * 60 * 1000);
      if (state && Array.isArray(state.projects)) {
        assessments = lib.mergeByHandoff(state.projects.map((p) => lib.assessDir(p.dir, cfg)).filter(Boolean));
      }
    }
    if (!assessments.length) assessments = analysis.summaryFallback;
    if (debug) {
      process.stderr.write(JSON.stringify(assessments.map((a) => ({ dir: a.project.dir, handoff: a.handoff.path, state: a.state, active: a.active, since: a.since.length })), null, 2) + "\n");
    }
    const text = lib.sessionStartMessage(assessments, source, cfg);
    if (text) {
      process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: text } }) + "\n");
    }
  } catch (e) {
    if (debug) process.stderr.write(String((e && e.stack) || e) + "\n");
  }
  process.exit(0);
})();
