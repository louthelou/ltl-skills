# ltl-skills — project context

Public marketplace repo (`github.com/louthelou/ltl-skills`, MIT) for Claude Code plugins:
`ltl-seo` (skill `seo-audit`), `ltl-parity` (skill `parity`) and `ltl-persistence` (skill
`persistence`). Marketplace manifest: `.claude-plugin/marketplace.json`. Each plugin lives in
`plugins/<name>/` with `.claude-plugin/plugin.json`, `skills/<skill>/SKILL.md`, `references/`
and `assets/`; ltl-persistence also ships `hooks/hooks.json` and three hook scripts on a shared
library (`skills/persistence/assets/lib/persistence-lib.js`).

Go-live: edit → commit → push to `main`; an installed copy is refreshed with
`/plugin marketplace update louthelou` then `/plugin update <plugin>`. Lou's own machine wires
the ltl-persistence hook scripts from this checkout by path (user `settings.json`), so hook
edits here take effect at the next session start without a plugin update. Test a hook by
piping a stdin JSON into it with `--dry-run` / `--debug` (see
`skills/persistence/references/precompact-hook.md`).

Rules: bump the plugin's `plugin.json` version on every behaviour change and the marketplace
`metadata.version` on every release; no AI-authorship markers or commit trailers (the repo is
public); `ruvector.db` is an unknown tooling artifact, leave it alone.

State lives in git; this repo keeps no resume-here handoff.
<!-- ltl-persistence: handoff=none -->
