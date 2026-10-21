"use strict";
/*
 * ltl-persistence - shared library for the PreCompact, SessionStart and Stop hooks.
 *
 * What it knows how to do:
 *   - read the hook's stdin JSON (session_id, transcript_path, cwd, ...)
 *   - scan the session transcript (JSONL) for the projects this session touched,
 *     by looking at the paths in tool calls (Write/Edit/Read file paths, shell commands)
 *   - resolve each project's handoff file (HANDOFF.md at the project root, or the
 *     file named by an `ltl-persistence: handoff=<path|none>` line in its CLAUDE.md)
 *   - judge whether that handoff is fresh, stale or missing, using the transcript,
 *     the file mtimes and git (last commit, uncommitted changes)
 *   - build the messages the three hooks emit
 *
 * Node >= 18, no dependencies. Everything is fail-open: callers catch and exit 0.
 *
 * Optional config at ~/.claude/ltl-persistence.json:
 *   { "graceMinutes": 20, "inlineMaxBytes": 8192, "maxProjects": 3,
 *     "workspaceRoots": ["C:/Claude"], "projectRoots": [] }
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");

const DEFAULTS = {
  graceMinutes: 20, // changes younger than this after the handoff's mtime do not count as stale
  inlineMaxBytes: 8192, // SessionStart inlines the primary handoff when it is at most this big
  maxProjects: 3, // how many projects the messages list
  tailBytes: 16 * 1024 * 1024, // how much of the transcript to scan (from the end)
  stopTailBytes: 6 * 1024 * 1024, // the Stop hook runs every turn, so it scans less
  workspaceRoots: [], // dirs that hold projects but are not projects themselves
  projectRoots: [], // dirs that are projects even if they look like workspaces
};

const WRITE_TOOLS = new Set(["Write", "Edit", "MultiEdit", "NotebookEdit"]);
const SHELL_TOOLS = new Set(["Bash", "PowerShell"]);
// Absolute paths: C:\x, C:/x, /c/x (Git Bash). Stops at whitespace, quotes and shell operators.
const PATH_RE = /(?:[A-Za-z]:[\\/]|\/[a-zA-Z]\/)[^\s"'`;&|<>()]+/g;
// Shell commands that change files, as a heuristic for "this session wrote here".
const MUTATING_RE =
  /(?:^|[\s;|&(])(?:tee|cp|mv|rm|mkdir|touch|sed\s+-i|perl\s+-\w*i|python3?|py|node|npm|npx|pnpm|yarn|cargo|dotnet|make|msbuild|git\s+(?:add|commit|push|mv|rm|checkout|switch|merge|rebase|reset|stash)|wrangler|Set-Content|Out-File|Add-Content|New-Item|Copy-Item|Move-Item|Remove-Item|Rename-Item)\b/i;
// A redirect to a real file (not /dev/null, $null, NUL or another descriptor).
const REDIRECT_RE = /(?:^|[^<>])>>?\s*(?!&|\/dev\/null|\$null|NUL\b)["']?[^\s"'<>|&;]/i;

const TEMPLATE_PATH = path.join(__dirname, "..", "handoff.template.md").replace(/\\/g, "/");
const STATE_DIR = path.join(os.homedir(), ".claude", "ltl-persistence");
const STATE_FILE = path.join(STATE_DIR, "last-compact.json");

// ---------------------------------------------------------------- basics

function loadConfig() {
  const file = path.join(os.homedir(), ".claude", "ltl-persistence.json");
  try {
    return Object.assign({}, DEFAULTS, JSON.parse(fs.readFileSync(file, "utf8")));
  } catch {
    return Object.assign({}, DEFAULTS);
  }
}

function parseJson(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function readStdin(timeoutMs = 1500) {
  return new Promise((resolve) => {
    let raw = "";
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        resolve(raw);
      }
    };
    try {
      process.stdin.setEncoding("utf8");
      process.stdin.on("data", (chunk) => (raw += chunk));
      process.stdin.on("end", finish);
      process.stdin.on("error", finish);
      setTimeout(finish, timeoutMs).unref();
    } catch {
      finish();
    }
  });
}

/** Normalise any absolute path spelling to "C:/dir/file" (no trailing slash). */
function norm(p) {
  if (!p) return null;
  let s = String(p).trim().replace(/^["']+|["']+$/g, "");
  const m = /^\/([a-zA-Z])\/(.*)$/.exec(s);
  if (m) s = m[1].toUpperCase() + ":/" + m[2];
  s = s.replace(/\\/g, "/");
  const unc = s.startsWith("//") ? "/" : "";
  s = unc + s.replace(/\/{2,}/g, "/"); // "C:\\x" inside a quoted command string arrives as C://x
  if (/^[a-zA-Z]:\//.test(s)) s = s[0].toUpperCase() + s.slice(1);
  s = s.replace(/\/+$/, "");
  return s || null;
}

function keyOf(p) {
  const n = norm(p);
  return n ? n.toLowerCase() : null;
}

const statCache = new Map();
function statOf(p) {
  if (!p) return null;
  if (statCache.has(p)) return statCache.get(p);
  let s = null;
  try {
    s = fs.statSync(p);
  } catch {
    s = null;
  }
  statCache.set(p, s);
  return s;
}
const isDir = (p) => !!(statOf(p) && statOf(p).isDirectory());
const isFile = (p) => !!(statOf(p) && statOf(p).isFile());

function fmtTime(ms) {
  if (!ms) return "never";
  const d = new Date(ms);
  const two = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())} ${two(d.getHours())}:${two(d.getMinutes())}`;
}

function relTo(file, dir) {
  const f = norm(file);
  const d = norm(dir);
  if (!f || !d) return f || "";
  return f.toLowerCase().startsWith(d.toLowerCase() + "/") ? f.slice(d.length + 1) : f;
}

// ---------------------------------------------------------------- projects

function hasMarker(dir) {
  return isFile(dir + "/CLAUDE.md") || isDir(dir + "/.git") || isFile(dir + "/.git");
}

const wsCache = new Map();
/** A workspace is a directory that holds projects but is not one itself. */
function isWorkspace(dir, cfg) {
  const k = keyOf(dir);
  if (wsCache.has(k)) return wsCache.get(k);
  let ws = false;
  if ((cfg.workspaceRoots || []).some((r) => keyOf(r) === k)) ws = true;
  else if ((cfg.projectRoots || []).some((r) => keyOf(r) === k)) ws = false;
  else {
    let n = 0;
    try {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.isDirectory() && !e.name.startsWith(".") && isFile(dir + "/" + e.name + "/CLAUDE.md")) {
          n++;
          if (n >= 2) break;
        }
      }
    } catch {
      n = 0;
    }
    ws = n >= 2;
  }
  wsCache.set(k, ws);
  return ws;
}

/** Nearest ancestor (or the path itself) that is a project: has CLAUDE.md or .git and is not a workspace. */
const HOME = norm(os.homedir()) || "";
/** Never a project: the home directory itself, Claude's own data (~/.claude, scratchpads) and app data. */
function isExcluded(p) {
  const k = keyOf(p) || "";
  if (!k) return true;
  if (HOME && k === HOME.toLowerCase()) return true;
  return k.includes("/.claude/") || k.endsWith("/.claude") || k.includes("/appdata/");
}

function projectOf(absPath, cfg) {
  let dir = norm(absPath);
  if (!dir || isExcluded(dir)) return null;
  if (!isDir(dir)) dir = path.posix.dirname(dir);
  for (let i = 0; i < 12; i++) {
    if (!dir || !dir.includes("/") || isExcluded(dir)) return null;
    if (hasMarker(dir)) return isWorkspace(dir, cfg) ? null : dir;
    const parent = path.posix.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
  return null;
}

// ---------------------------------------------------------------- transcript

function readTail(file, maxBytes) {
  const st = statOf(file);
  if (!st || !st.isFile()) return "";
  const size = st.size;
  const start = Math.max(0, size - maxBytes);
  const fd = fs.openSync(file, "r");
  try {
    const buf = Buffer.alloc(size - start);
    fs.readSync(fd, buf, 0, buf.length, start);
    let s = buf.toString("utf8");
    if (start > 0) {
      const nl = s.indexOf("\n");
      s = nl >= 0 ? s.slice(nl + 1) : "";
    }
    return s;
  } finally {
    fs.closeSync(fd);
  }
}

function extractPaths(str) {
  const out = [];
  if (!str) return out;
  const re = new RegExp(PATH_RE.source, "g");
  let m;
  while ((m = re.exec(str))) out.push(m[0]);
  return out;
}

function textOf(content) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map((b) => (b && typeof b.text === "string" ? b.text : "")).join("\n");
  return "";
}

/**
 * Scan the transcript for tool calls that name paths. Returns
 *   { ok, events: [{ts, tool, paths, files, write, shell}], summaryPaths: [] }
 * Only assistant records are read (api-request blobs repeat history and would skew recency).
 */
function scanTranscript(file, cfg, tailBytes) {
  const res = { ok: false, events: [], summaryPaths: [] };
  const f = norm(file);
  if (!f) return res;
  const text = readTail(f, tailBytes || cfg.tailBytes || DEFAULTS.tailBytes);
  if (!text) return res;
  res.ok = true;
  for (const line of text.split("\n")) {
    if (!line.startsWith('{"parentUuid"')) continue;
    const isSummary = line.includes('"isCompactSummary":true');
    if (!isSummary && !line.includes('"tool_use"')) continue;
    const obj = parseJson(line, null);
    if (!obj) continue;
    const ts = Date.parse(obj.timestamp) || 0;
    if (isSummary) {
      for (const p of extractPaths(textOf(obj.message && obj.message.content))) res.summaryPaths.push(p);
      continue;
    }
    if (obj.type !== "assistant" || !obj.message || !Array.isArray(obj.message.content)) continue;
    for (const block of obj.message.content) {
      if (!block || block.type !== "tool_use") continue;
      const name = String(block.name || "");
      const input = block.input || {};
      const paths = [];
      const files = [];
      for (const k of ["file_path", "notebook_path", "path"]) {
        if (typeof input[k] === "string") {
          paths.push(input[k]);
          if (WRITE_TOOLS.has(name)) files.push(input[k]);
        }
      }
      let write = WRITE_TOOLS.has(name);
      let shell = false;
      if (SHELL_TOOLS.has(name) && typeof input.command === "string") {
        shell = true;
        paths.push(...extractPaths(input.command));
        if (MUTATING_RE.test(input.command) || REDIRECT_RE.test(input.command)) write = true;
      }
      if (paths.length) res.events.push({ ts, tool: name, paths, files, write, shell });
    }
  }
  return res;
}

function newProject(dir) {
  return { dir, lastWrite: 0, lastAny: 0, shellWriteTs: 0, writes: new Map(), mentions: 0, summaryMentions: 0 };
}

/** Aggregate transcript events into projects, most relevant first. */
function projectsFrom(scan, cfg) {
  const map = new Map();
  const get = (dir) => {
    const k = keyOf(dir);
    if (!map.has(k)) map.set(k, newProject(dir));
    return map.get(k);
  };
  for (const ev of scan.events) {
    const dirs = new Set();
    for (const p of ev.paths) {
      const d = projectOf(p, cfg);
      if (d) dirs.add(d);
    }
    for (const d of dirs) {
      const pr = get(d);
      pr.lastAny = Math.max(pr.lastAny, ev.ts);
      pr.mentions++;
      if (ev.write) {
        pr.lastWrite = Math.max(pr.lastWrite, ev.ts);
        if (ev.shell) pr.shellWriteTs = Math.max(pr.shellWriteTs, ev.ts);
      }
    }
    if (ev.write) {
      for (const f of ev.files) {
        const d = projectOf(f, cfg);
        if (!d) continue;
        const n = norm(f);
        const prev = get(d).writes.get(keyOf(n));
        if (!prev || prev.ts < ev.ts) get(d).writes.set(keyOf(n), { path: n, ts: ev.ts });
      }
    }
  }
  for (const p of scan.summaryPaths) {
    const d = projectOf(p, cfg);
    if (d) get(d).summaryMentions++;
  }
  const list = [...map.values()];
  list.sort((a, b) => b.lastWrite - a.lastWrite || b.summaryMentions - a.summaryMentions || b.lastAny - a.lastAny);
  return list;
}

// ---------------------------------------------------------------- handoff + git

/**
 * The handoff file for a project: <project>/HANDOFF.md unless its CLAUDE.md says
 *   ltl-persistence: handoff=none            (project opts out)
 *   ltl-persistence: handoff=<path>          (absolute, or relative to the project)
 */
function handoffFor(dir) {
  let target = dir + "/HANDOFF.md";
  let redirected = false;
  let skip = false;
  try {
    const claudeMd = fs.readFileSync(dir + "/CLAUDE.md", "utf8");
    const m = /ltl-persistence:\s*handoff\s*=\s*([^\s>]+)/i.exec(claudeMd);
    if (m) {
      const v = m[1].replace(/^["']+|["']+$/g, "");
      if (/^none$/i.test(v)) skip = true;
      else {
        const nv = norm(v);
        target = /^[A-Za-z]:\//.test(nv) || nv.startsWith("/") ? nv : norm(path.posix.normalize(dir + "/" + nv));
        redirected = true;
      }
    }
  } catch {
    /* no CLAUDE.md: default handoff */
  }
  const st = statOf(target);
  return { path: target, exists: !!(st && st.isFile()), mtime: st && st.isFile() ? st.mtimeMs : 0, size: st ? st.size : 0, redirected, skip };
}

function git(args, dir) {
  try {
    return execFileSync("git", ["-C", dir, ...args], {
      encoding: "utf8",
      timeout: 3000,
      stdio: ["ignore", "pipe", "ignore"],
      windowsHide: true,
    }).trim();
  } catch {
    return "";
  }
}

/** Last commit time and the uncommitted files of the repo that contains `dir`. */
function gitSignals(dir) {
  const out = { isRepo: false, lastCommit: 0, changed: [] };
  const top = isDir(dir + "/.git") || isFile(dir + "/.git") ? dir : norm(git(["rev-parse", "--show-toplevel"], dir));
  if (!top) return out;
  out.isRepo = true;
  const ct = parseInt(git(["log", "-1", "--format=%ct"], dir), 10);
  if (ct) out.lastCommit = ct * 1000;
  const args = ["status", "--porcelain", "--untracked-files=normal"];
  if (keyOf(top) !== keyOf(dir)) args.push("--", dir); // a project nested in a bigger repo: only its own subtree
  const status = git(args, dir);
  for (const line of status.split("\n")) {
    if (line.length < 4) continue;
    let p = line.slice(3).trim();
    const arrow = p.indexOf(" -> ");
    if (arrow >= 0) p = p.slice(arrow + 4);
    p = p.replace(/^"+|"+$/g, "");
    const a = norm(top + "/" + p);
    const b = norm(dir + "/" + p);
    out.changed.push(isFile(a) ? a : isFile(b) ? b : a);
  }
  return out;
}

/**
 * Judge one project's handoff: fresh | stale | missing (null when the project opts out).
 * opts.lazy: skip git for projects this session did not write to (the Stop hook never
 * blocks on those, so the expensive signal is not needed).
 */
function assess(pr, cfg, opts = {}) {
  const h = handoffFor(pr.dir);
  if (h.skip) return null;
  const hk = keyOf(h.path);
  const grace = (cfg.graceMinutes != null ? cfg.graceMinutes : DEFAULTS.graceMinutes) * 60000;
  let lastWriteExcl = pr.shellWriteTs || 0;
  const changed = new Map();
  for (const [k, w] of pr.writes) {
    if (k === hk) continue;
    lastWriteExcl = Math.max(lastWriteExcl, w.ts);
    changed.set(k, w.path);
  }
  const active = lastWriteExcl > 0;
  // git costs two process spawns: consult it only when the transcript alone cannot settle the verdict
  const settled = h.exists && lastWriteExcl > h.mtime + grace;
  const needGit = !settled && !(opts.lazy && !active);
  const g = needGit ? gitSignals(pr.dir) : { isRepo: false, lastCommit: 0, changed: [] };
  for (const f of g.changed) {
    const k = keyOf(f);
    if (k && k !== hk) changed.set(k, f);
  }
  let maxMtime = 0;
  const changedList = [];
  for (const f of changed.values()) {
    const s = statOf(f);
    const mtime = s ? s.mtimeMs : 0;
    maxMtime = Math.max(maxMtime, mtime);
    changedList.push({ path: f, mtime });
  }
  const lastChange = Math.max(lastWriteExcl, g.lastCommit, maxMtime);
  let state;
  if (!h.exists) state = "missing";
  else if (lastChange > h.mtime + grace) state = "stale";
  else state = "fresh";
  const since = (h.exists ? changedList.filter((c) => c.mtime > h.mtime) : changedList).sort((a, b) => b.mtime - a.mtime);
  // relevant = worth reporting: written to in this session (analyze adds the cwd project; summary mentions are a last resort)
  const relevant = active;
  return { project: pr, dirs: [pr.dir], names: [path.posix.basename(pr.dir)], handoff: h, git: g, state, stale: state !== "fresh", active, relevant, lastChange, lastWriteExcl, since };
}

const STATE_RANK = { fresh: 0, stale: 1, missing: 2 };

/** Projects that share one handoff file (handoff=<path>) are judged together. */
function mergeByHandoff(assessments) {
  const groups = new Map();
  const order = [];
  for (const a of assessments) {
    const k = keyOf(a.handoff.path);
    const g = groups.get(k);
    if (!g) {
      groups.set(k, a);
      order.push(k);
      continue;
    }
    g.dirs.push(...a.dirs);
    g.names.push(...a.names);
    if (STATE_RANK[a.state] > STATE_RANK[g.state]) {
      g.state = a.state;
      g.stale = a.stale;
    }
    g.active = g.active || a.active;
    g.relevant = g.relevant || a.relevant;
    g.lastChange = Math.max(g.lastChange, a.lastChange);
    g.lastWriteExcl = Math.max(g.lastWriteExcl, a.lastWriteExcl);
    if (a.git.lastCommit > g.git.lastCommit) g.git = a.git;
    g.since = g.since.concat(a.since).sort((x, y) => y.mtime - x.mtime);
  }
  return order.map((k) => groups.get(k));
}

function assessDir(dir, cfg) {
  const d = norm(dir);
  if (!d || !isDir(d)) return null;
  const a = assess(newProject(d), cfg);
  if (a) a.relevant = true;
  return a;
}

/** Everything a hook needs: scan the transcript, rank projects, assess each. */
function analyze(input, cfg, opts = {}) {
  const t0 = Date.now();
  const scan = scanTranscript(input.transcript_path, cfg, opts.tailBytes);
  const t1 = Date.now();
  const projects = projectsFrom(scan, cfg);
  const cwdProject = input.cwd ? projectOf(input.cwd, cfg) : null;
  if (cwdProject && !projects.some((p) => keyOf(p.dir) === keyOf(cwdProject))) projects.push(newProject(cwdProject));
  const t2 = Date.now();
  const assessed = projects.map((p) => assess(p, cfg, opts)).filter(Boolean);
  for (const a of assessed) if (cwdProject && keyOf(a.project.dir) === keyOf(cwdProject)) a.relevant = true;
  const merged = mergeByHandoff(assessed);
  const max = cfg.maxProjects || DEFAULTS.maxProjects;
  const assessments = merged.filter((a) => a.relevant).slice(0, max);
  // Last resort when the transcript holds no tool calls (a fresh post-compaction file): the projects the summary names.
  const summaryFallback = assessments.length ? [] : merged.filter((a) => (a.project.summaryMentions || 0) > 0).slice(0, 2);
  const timings = { scanMs: t1 - t0, projectsMs: t2 - t1, assessMs: Date.now() - t2, events: scan.events.length };
  return { scan, projects, assessments, summaryFallback, timings };
}

// ---------------------------------------------------------------- state file (PreCompact -> SessionStart)

function saveState(obj) {
  try {
    fs.mkdirSync(STATE_DIR, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(obj, null, 2));
  } catch {
    /* fail-open */
  }
}

function loadState(maxAgeMs) {
  try {
    const o = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    if (o && Date.now() - (o.ts || 0) <= maxAgeMs) return o;
  } catch {
    /* none */
  }
  return null;
}

// ---------------------------------------------------------------- messages

function describe(a) {
  const h = a.handoff;
  const name = (a.names || [path.posix.basename(a.project.dir)]).join(" + ");
  const dirs = a.dirs || [a.project.dir];
  const rel = (file) => {
    for (const d of dirs) {
      const r = relTo(file, d);
      if (r !== norm(file)) return r;
    }
    return norm(file);
  };
  const files = (list) => list.slice(0, 4).map((c) => rel(c.path) + (c.mtime ? " " + fmtTime(c.mtime).slice(11) : "")).join(", ");
  if (a.state === "missing") {
    const n = a.since.length;
    return `${name}: ${h.path} is MISSING` + (n ? ` (${n} changed file(s) here${a.active ? " this session" : ""}: ${files(a.since)})` : "");
  }
  const parts = [];
  if (a.since.length) parts.push(`${a.since.length} file(s) changed since: ${files(a.since)}`);
  if (a.git.lastCommit > h.mtime) parts.push(`last commit ${fmtTime(a.git.lastCommit)}`);
  return `${name}: ${h.path} updated ${fmtTime(h.mtime)} - ${a.state.toUpperCase()}` + (parts.length ? ` (${parts.join("; ")})` : "");
}

const GUIDE =
  "A handoff is the resume-here snapshot: current task, very next step, what is waiting on whom, open threads, deferred items, anchors. Prune done items; keep it under two screens; stable facts belong in CLAUDE.md.";

function fallbackMessage() {
  return (
    "[ltl-persistence] Preserve continuity across this compaction: make the summary instruct the next session to READ the project's HANDOFF.md FIRST " +
    "(current task, next step, open threads, deferred items). If it is missing or stale, say so and have the next session create or refresh it before other work. Carry a pointer, not a copy."
  );
}

function precompactMessage(assessments) {
  if (!assessments.length) return fallbackMessage();
  const lines = ["[ltl-persistence] Compaction continuity. Handoff status per project touched in this session (most recent first):"];
  assessments.forEach((a, i) => lines.push(`${i + 1}. ${describe(a)}`));
  const primary = assessments[0];
  const bad = assessments.filter((a) => a.stale);
  lines.push("Instructions for the summary:");
  lines.push(`- Open with "READ ${primary.handoff.path} FIRST"` + (assessments.length > 1 ? ", then name the other handoff(s) above" : "") + ". Carry pointers, not copies, of what a FRESH handoff already holds.");
  if (bad.length) {
    lines.push(
      `- The handoff(s) marked STALE or MISSING do not reflect the latest work, so the summary itself must carry, for each of them: current task, next step, what is waiting on whom, open threads, and the decisions and file changes since the handoff was last written. It must instruct the next session to refresh or create ${bad.map((a) => a.handoff.path).join(" and ")} as its FIRST action (template: ${TEMPLATE_PATH}).`
    );
  } else {
    lines.push("- Every handoff is fresh: the summary only needs the pointer plus anything decided after the handoff's timestamp.");
  }
  return lines.join("\n");
}

function sessionStartMessage(assessments, source, cfg) {
  if (!assessments.length) return "";
  const primary = assessments[0];
  const lines = [`[ltl-persistence] Resume context (session start: ${source || "unknown"}).`];
  assessments.forEach((a, i) => lines.push(`${i + 1}. ${describe(a)}`));
  const h = primary.handoff;
  const limit = cfg.inlineMaxBytes != null ? cfg.inlineMaxBytes : DEFAULTS.inlineMaxBytes;
  if (h.exists && h.size <= limit && limit > 0) {
    let body = "";
    try {
      body = fs.readFileSync(h.path, "utf8").trim();
    } catch {
      body = "";
    }
    if (body) {
      lines.push(`--- ${h.path} ---`);
      lines.push(body);
      lines.push("--- end of handoff ---");
    }
  } else if (h.exists) {
    lines.push(`Read ${h.path} first (not inlined: ${h.size} bytes).`);
  } else {
    lines.push(`No handoff exists at ${h.path}. Create it as the first action, from the compaction summary and the template ${TEMPLATE_PATH}, before other work.`);
  }
  if (primary.state === "stale") lines.push("The primary handoff is STALE: refresh it from the summary and the changes listed above before other work.");
  lines.push(`Keep it current at breakpoints: the Stop hook blocks the end of a turn while a touched project's handoff is missing or more than ${cfg.graceMinutes != null ? cfg.graceMinutes : DEFAULTS.graceMinutes} minutes behind its changes. ${GUIDE}`);
  return lines.join("\n");
}

function stopMessage(stale, cfg) {
  const grace = cfg.graceMinutes != null ? cfg.graceMinutes : DEFAULTS.graceMinutes;
  const lines = [`[ltl-persistence] Handoff refresh required before this turn ends. This session changed files in the project(s) below and their resume-here handoff does not reflect it (grace ${grace} min):`];
  stale.forEach((a) => lines.push(`- ${describe(a)}`));
  lines.push(`Update each handoff now, then stop. ${GUIDE} A missing handoff: create it from ${TEMPLATE_PATH}. To exempt a project, add a line "ltl-persistence: handoff=none" (or "handoff=<path>" to share another project's file) to its CLAUDE.md.`);
  return lines.join("\n");
}

module.exports = {
  DEFAULTS,
  TEMPLATE_PATH,
  STATE_FILE,
  loadConfig,
  parseJson,
  readStdin,
  norm,
  keyOf,
  fmtTime,
  projectOf,
  isWorkspace,
  scanTranscript,
  projectsFrom,
  handoffFor,
  gitSignals,
  assess,
  assessDir,
  mergeByHandoff,
  analyze,
  saveState,
  loadState,
  describe,
  fallbackMessage,
  precompactMessage,
  sessionStartMessage,
  stopMessage,
};
