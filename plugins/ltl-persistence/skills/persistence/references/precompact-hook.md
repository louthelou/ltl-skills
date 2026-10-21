# The opt-in hooks: PreCompact, SessionStart, Stop

A skill only runs when it is invoked, so it cannot checkpoint by itself. Three small hooks (one shared library, `assets/lib/persistence-lib.js`) close that gap. They are read-only apart from a small state file under `~/.claude/ltl-persistence/`, fail-open (any error → exit 0, nothing blocked), and finish in well under a second on multi-megabyte transcripts.

| Hook | When it fires | What it does |
|---|---|---|
| **PreCompact** (`assets/precompact-hook.js`) | right before a manual or automatic compaction | Names the exact handoff file(s) for the projects this session touched, says whether each is **fresh / stale / missing**, and tells the summary what it must carry itself when one is stale or missing. Saves the project list to `~/.claude/ltl-persistence/last-compact.json`. Plain text on stdout. |
| **SessionStart** (`assets/session-start-hook.js`) | startup, resume, clear, and right after a compaction | Reports the touched projects' handoffs and **inlines the primary one** (up to `inlineMaxBytes`, default 6 KB) as `additionalContext`, so the model has it without a tool call. Falls back to the PreCompact state file when the post-compaction transcript is a fresh file. |
| **Stop** (`assets/stop-hook.js`) | when the model is about to end its turn | For every project **this session wrote to**: if the handoff is missing, or its newest change is more than `graceMinutes` (default 20) newer than the handoff, block the stop **once** with a reason naming the file and what changed. The model refreshes the handoff and stops; the second pass carries `stop_hook_active=true` and is let through, so it can never loop. Never blocks on clear / resume / compact transitions or when nothing was written. |

## How the hooks find "the project"

They do not assume `cwd` is the project (in a workspace that holds many projects it is not). They read the session transcript (`transcript_path` from the hook input) and collect the paths named in tool calls: `Write` / `Edit` / `Read` file paths and absolute paths inside `Bash` / `PowerShell` commands (`C:\x`, `C:/x`, `/c/x`). Each path maps to its project: the nearest ancestor directory that has a `CLAUDE.md` or `.git`. A directory with two or more children that have their own `CLAUDE.md` is treated as a **workspace**, not a project. The cwd's project is added when it is one. Projects are ranked by their most recent write.

## Which file is the handoff

`<project>/HANDOFF.md`, unless the project's `CLAUDE.md` contains a line

```
ltl-persistence: handoff=none
ltl-persistence: handoff=../Other-Project/HANDOFF.md
```

(`none` opts the project out; a path, absolute or relative to the project, makes it share another project's handoff, for example a website owned by a venture project). An HTML comment is a fine place for it.

## What "stale" means

The handoff's mtime is compared with the project's latest change: the last write this session made (file paths from Write/Edit, or a shell command whose mutating part names the project: copies, moves, deletes, in-place edits, redirects, git commits. A shell command is judged per segment, so a path counts as written when its own segment mutates, or when it anchors the command through `cd`, `Set-Location`, `git -C` or a variable assignment and some segment mutates; *running* a project's script with node, python, npm and the like does not count, even in a command that also deletes a scratch file elsewhere), the mtimes of files `git status` reports as changed, and the last commit time. If the latest change is more than `graceMinutes` newer than the handoff, it is stale. The grace window means a turn that edits a file five minutes after the handoff was refreshed is not nagged; a session that edits for an hour without a checkpoint is blocked once, at the end of that turn.

## Install

**As a plugin:** `hooks/hooks.json` registers all three automatically when the plugin is enabled (paths use `${CLAUDE_PLUGIN_ROOT}`).

**Manually** (user-level `~/.claude/settings.json` or project-level `.claude/settings.json`), pointing at the installed or cloned skill's `assets/` directory:

```json
{
  "hooks": {
    "PreCompact":   [{ "hooks": [{ "type": "command", "command": "node \"<abs-path>/assets/precompact-hook.js\"",     "timeout": 20 }] }],
    "SessionStart": [{ "hooks": [{ "type": "command", "command": "node \"<abs-path>/assets/session-start-hook.js\"", "timeout": 20 }] }],
    "Stop":         [{ "hooks": [{ "type": "command", "command": "node \"<abs-path>/assets/stop-hook.js\"",          "timeout": 20 }] }]
  }
}
```

Do not wire the same scripts both ways, or each hook runs twice. Hooks load when a session starts: after editing `settings.json`, start a new session. The `update-config` skill can do the edit.

No `matcher` is set, so PreCompact fires on both manual (`/compact`) and automatic compaction, and SessionStart on every source; add `"matcher": "auto"` / `"matcher": "compact"` to narrow them.

## Configuration (optional)

`~/.claude/ltl-persistence.json`:

```json
{
  "graceMinutes": 20,
  "inlineMaxBytes": 6144,
  "maxProjects": 3,
  "workspaceRoots": [],
  "projectRoots": []
}
```

`workspaceRoots` forces directories to be treated as workspaces; `projectRoots` forces the opposite (a monorepo that has sub-folders with their own `CLAUDE.md`). `inlineMaxBytes: 0` disables inlining.

## Debugging

```
printf '{"cwd":"C:/work","transcript_path":"C:/Users/me/.claude/projects/<dir>/<session>.jsonl"}' | node assets/stop-hook.js --dry-run
printf '{"source":"compact","transcript_path":"..."}' | node assets/session-start-hook.js --debug
printf '{"transcript_path":"..."}' | node assets/precompact-hook.js --debug
```

`--dry-run` prints the verdict and never blocks; `--debug` prints the per-project analysis to stderr.

## Honest limits

- The hooks **cannot write the handoff**; the Stop hook makes the model do it before the turn ends, which is the closest thing to automatic that exists.
- A file written by a shell command with a **relative** path (after a `cd`) is attributed to the project only because the command names the project directory; `git status` catches the file itself.
- The Stop hook blocks **once per turn**; a model that ignores the reason and stops again is let through (by design: no loops).
- Hook output schemas vary by Claude Code version; the scripts use plain stdout (PreCompact), `hookSpecificOutput.additionalContext` (SessionStart) and `{"decision":"block","reason":...}` (Stop), the shapes documented for current versions.

## Uninstall

Remove the three entries from `settings.json` (or disable the plugin) and delete `~/.claude/ltl-persistence/`.
