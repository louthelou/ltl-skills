# The opt-in PreCompact hook

Claude Code can run a **PreCompact hook** — a command that fires right before the conversation is compacted. Its output is surfaced as guidance to the summarization step.

A skill can't checkpoint by itself (it only runs when invoked). The hook closes that gap: it fires automatically at compaction time and **guarantees the post-compact summary carries the "read the HANDOFF" pointer**, so the next session resumes cleanly even if nobody remembered to checkpoint.

## Honest limits

- The hook **nudges and wires; it does not author.** It can't write a fresh HANDOFF (that needs a model turn). The real checkpoint should happen on a normal turn *before* compaction (the skill's "Checkpoint" mode). The hook's reliable value is the discovery pointer.
- **Hook output schemas vary by Claude Code version.** The script here writes a plain reminder to stdout — the same mechanism the built-in compaction-guidance hook uses. If your version expects a specific JSON shape, adapt `assets/precompact-hook.js`.

## Install (opt-in)

Hooks live in `settings.json` (user-level or project-level `.claude/settings.json`). Add:

```json
{
  "hooks": {
    "PreCompact": [
      {
        "hooks": [
          { "type": "command", "command": "node \"<abs-path>/assets/precompact-hook.js\"" }
        ]
      }
    ]
  }
}
```

Replace `<abs-path>` with the installed skill's asset directory. Editing `settings.json` directly works, or use the `update-config` skill. Reload Claude Code so it picks up the hook.

## Uninstall

Remove the `PreCompact` entry from `settings.json`.
