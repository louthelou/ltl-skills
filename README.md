# ltl-skills

Lou Lohman's Claude Code skills, packaged as a marketplace you can add directly in Claude.

## What's inside

| Plugin | Skill | What it does |
|---|---|---|
| `ltl-seo` | `seo-audit` | All-in-one, **verification-first** SEO: technical, on-page, structured data, internal linking & site architecture, keyword & content strategy, competitor analysis, AEO / AI-visibility, and programmatic-SEO-at-scale. Inspects the real source/HTML before claiming anything is missing, web-verifies time-sensitive guidance, and pushes back on deprecated tactics. |
| `ltl-parity` | `parity` | Guided **cross-codebase parity** — keep a website and its companion app (or any deliberately mirrored pair) in sync without silent drift or mis-ports. Classifies each change, warns on safety/security/ambiguous risk, and verifies both sides. |

## Install

In Claude Code (or the Claude desktop app), add this marketplace once:

```
/plugin marketplace add louthelou/ltl-skills
```

Then install whichever plugins you want:

```
/plugin install ltl-seo@louthelou
/plugin install ltl-parity@louthelou
```

Once installed, each skill activates automatically when it's relevant. You can also invoke a skill directly by its `plugin:skill` name, e.g. `ltl-seo:seo-audit`.

## Why these exist

**`ltl-seo`** — LLM-generated SEO audits fail in two repeatable ways. They *confabulate* missing files ("no robots.txt!", "no canonical tags!") without actually looking, and they recommend *stale* tactics (FAQ rich results, AMP) that current guidance has deprecated. This skill is built around one discipline — **inspect first, web-verify second, recommend third** — and layers full-spectrum coverage (keyword, content, competitor, architecture, AEO) on top of it, every part gated by the same verification rules. Its most distinctive output is the "pushed back on" section: the false positives it *declined* to report.

**`ltl-parity`** — Two codebases that deliberately mirror the same product (a site and its app) are never 1:1; the same content is expressed differently per stack (HTML vs. Markdown, CSS variables vs. a StyleSheet, plain objects vs. typed unions). A naive `diff A | apply to B` corrupts the target. This skill is a guided, judgment-gated workflow that mirrors what should propagate, skips what shouldn't, and *stops and asks* on anything risky — especially safety-critical content, where a silent mis-port can do real harm.

## Independently authored

These skills are original works, written from functional specifications rather than copied from any other tool. They are not affiliated with, endorsed by, or derived from the source code of any third-party plugin. Where they reference external products (for example, an SEO data provider), it is descriptive only.

## Adding more skills

This repo is built to grow. Each skill is its own plugin under `plugins/<name>/`, with a `.claude-plugin/plugin.json` and a `skills/<skill>/SKILL.md`. To add one: create the plugin folder, then add an entry to `.claude-plugin/marketplace.json`.

## License

[MIT](./LICENSE) © 2026 Lou Lohman. Use them, fork them, adapt them.
