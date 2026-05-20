[Back to Documentation](README.md) | [Back to README](../README.md) | [Next Page](context-loading-policy.md)

# Usage

This guide documents the v1 OpenSpec-native workflow for AIFHub Extension.

```text
setup and mode:
  /aif-mode status                                  # recommended
  /aif-analyze                                      # required once per project
  /aif-mode openspec                                # required when switching modes
  /aif-mode doctor                                  # optional readiness check

optional discovery:
  /aif-explore "<topic>"                            # optional
  /aif-grounded "<question>"                        # optional upstream certainty gate

planning:
  /aif-plan full "<request>"                        # required
  /aif-improve <change-id>                          # optional, repeatable
  /aif-mode sync --change <change-id>               # recommended

implementation:
  /aif-implement <change-id>                        # required

validation gates:
  /aif-mode sync --change <change-id>               # optional if specs/rules changed
  /aif-rules-check                                  # optional/recommended rules gate
  /aif-review                                       # optional read-only review gate
  /aif-security-checklist                           # optional for security-sensitive changes

verification:
  /aif-verify <change-id>                           # required
    fail -> /aif-fix <change-id>                    # required only after failed verify
         -> optional /aif-rules-check
         -> /aif-verify <change-id>

finalization:
  /aif-mode doctor --change <change-id>             # recommended before archive
  /aif-done <change-id>                             # required after passing verify
  /aif-mode sync                                    # recommended after archive
  /aif-commit                                       # recommended AI Factory commit gate
  /aif-evolve                                       # optional learning step
```

OpenSpec-native mode uses OpenSpec artifacts as canonical planning/spec artifacts and AI Factory paths for runtime state, QA evidence, and generated rules in user projects.

The `aifhub-extension` package repository stays artifact-light: root `openspec/`, `.ai-factory/state/`, `.ai-factory/qa/`, `.ai-factory/plans/`, and `.ai-factory/rules/generated/` are not extension package source. Root `.ai-factory/rules/generated/` is derived in user projects and safe to regenerate. OpenSpec examples may be committed only under fixture paths such as `test/fixtures/` or `scripts/fixtures/`.

AIFHub commands request OpenSpec validation, status, instructions, and archive through `scripts/openspec-runner.mjs` when the CLI is available. Slash-command runtimes should keep using `/aif-*` commands. Codex app uses `$aif-*` skill invocations, as shown in the Recommended Codex App Flow. This extension does not install or rely on OpenSpec slash commands.

## Optional Graphify Context

Graphify can be used as a manual, user-owned repository research aid before or during AIFHub work. AIFHub Extension does not require Graphify, does not install `graphifyy`, does not run `graphify`, does not add Graphify to extension dependencies, and does not start or register Graphify MCP automatically.

Manual usage, outside AIFHub command ownership:

```powershell
python -m pip install graphifyy
graphify .
```

Use `graphify .` in PowerShell; do not prefix it as `/graphify .`.

Graphify writes local outputs under `graphify-out/`, including:

- `graphify-out/GRAPH_REPORT.md`
- `graphify-out/graph.json`
- `graphify-out/graph.html`

Its CLI may also expose research commands such as `graphify query`, `graphify path`, and `graphify explain`.

When `graphify-out/GRAPH_REPORT.md` already exists, AIFHub commands may read it as optional supporting context. To keep reviewed output for later context loading, copy it only to:

- `.ai-factory/references/graphify/` for project-wide reference context.
- `.ai-factory/state/<change-id>/graphify/` for change-scoped runtime context.

Do not store Graphify generated files under `openspec/changes/<change-id>/`, `openspec/specs/`, `.ai-factory/rules/generated/`, or `.ai-factory/qa/<change-id>/`.

Treat Graphify findings as supporting evidence only. Reports can include extracted, inferred, ambiguous, or confidence-labeled relationships, so final plans, review findings, verification status, generated rules, and roadmap completion still need direct repository evidence from canonical OpenSpec artifacts, source files, tests, runtime state, or QA evidence.

Before copying a report into `.ai-factory/`, review it for sensitive information. Do not persist API keys, tokens, raw authorization headers, credential helper output, private backend diagnostics, or unreviewed sensitive output in AIFHub artifacts.

## Bug Fix Workflows

OpenSpec-native mode separates new bug reports from fixes for failed verification findings.

### Workflow A: New Bug Report

A new bug report starts as planned OpenSpec work:

```text
/aif-plan full "fix <bug description>"
/aif-improve <change-id>
/aif-mode sync --change <change-id>
/aif-implement <change-id>
/aif-rules-check                  # optional
/aif-verify <change-id>
/aif-done <change-id>
/aif-mode sync
/aif-commit
```

- A bug fix is still an OpenSpec change when it changes product or workflow behavior.
- Create delta specs when behavior changes.
- Docs/tooling-only bug fixes may omit delta specs only when the proposal explains why no product or workflow behavior changes.
- Missing OpenSpec CLI means degraded validation, not planning failure.
- No OpenSpec-native bug-fix path creates `.ai-factory/plans/<id>/`.

### Workflow B: Fix After Failed Verification

`/aif-fix` handles selected findings inside an existing active OpenSpec change:

```text
/aif-verify <change-id> -> fail
/aif-fix <change-id>
/aif-mode sync --change <change-id>     # optional if canonical artifacts changed
/aif-rules-check                        # optional
/aif-verify <change-id>
```

- `/aif-fix` requires existing QA evidence or selected findings.
- `/aif-fix` does not create a new OpenSpec change.
- `/aif-fix` writes fix traces under `.ai-factory/state/<change-id>/fixes/`.
- `/aif-fix` does not write QA verdicts.
- `/aif-fix` does not archive.
- `/aif-fix` routes back to `/aif-verify <change-id>`.
- No OpenSpec-native bug-fix path creates `.ai-factory/plans/<id>/`.

## Artifact Ownership

| Path | Role |
|---|---|
| `openspec/specs/**/spec.md` | Canonical current behavior |
| `openspec/changes/<change-id>/proposal.md` | Canonical change intent |
| `openspec/changes/<change-id>/design.md` | Canonical design notes |
| `openspec/changes/<change-id>/tasks.md` | Canonical implementation checklist |
| `openspec/changes/<change-id>/specs/**/spec.md` | Canonical proposed behavior deltas |
| `.ai-factory/state/<change-id>/` | Runtime execution state and summaries |
| `.ai-factory/qa/<change-id>/` | Verification and finalization evidence |
| `.ai-factory/rules/generated/` | Derived rules, safe to regenerate |
| `.ai-factory/plans/` | Legacy AI Factory-only compatibility and migration input |

Extension behavior requirements are validated by prompt contracts and tests, not by root project OpenSpec specs committed into this repository.

## Manifest Metadata

`extension.json` follows the upstream AI Factory extension manifest schema and should not contain AIFHub-private fields. Its `$schema` value points at:

```text
https://raw.githubusercontent.com/lee-to/ai-factory/2.x/schemas/extension.schema.json
```

The private AIFHub metadata contract lives in `aifhub-extension.json` and is described by `schemas/aifhub-extension.schema.json`. `compat.ai-factory` and `sources.*` belong there, not in `extension.json`.

## Command Boundaries

### `/aif-mode`

Reads:

- `.ai-factory/config.yaml`
- `openspec/changes/**`
- `openspec/specs/**`
- `.ai-factory/plans/**`
- `.ai-factory/rules/generated/**`

Writes by subcommand:

- `openspec`: `.ai-factory/config.yaml`, OpenSpec skeleton paths, runtime directories, generated rules, optional legacy migration outputs when `--yes` is passed, and `.ai-factory/state/mode-switches/*.md`
- `ai-factory`: `.ai-factory/config.yaml`, legacy skeleton paths, optional compatibility export outputs when `--export-openspec` is passed, and `.ai-factory/state/mode-switches/*.md`
- `sync`: derived generated rules or compatibility export outputs for the current mode, plus a sync report
- `status` and `doctor`: no writes

Does not write:

- OpenSpec skills or slash commands
- manual changes to `openspec/specs/**`
- archive output or `/aif-done` finalization
- runtime files under `openspec/changes/<change-id>/`

Use `--dry-run` for planned switching or sync writes. Use `--all` or `--change <id>` to control change selection. Use `--export-openspec` only for compatibility legacy exports from OpenSpec changes. In OpenSpec mode, sync respects `aifhub.openspec.compileRulesOnSync` and `aifhub.openspec.validateOnSync`.

`/aif-mode sync --change <change-id>` is recommended after `/aif-plan full` or `/aif-improve` and whenever canonical specs or tasks changed during implementation or fixes. It ensures OpenSpec skeleton paths, compiles `.ai-factory/rules/generated/openspec-base.md`, `.ai-factory/rules/generated/openspec-change-<change-id>.md`, `.ai-factory/rules/generated/openspec-merged-<change-id>.md`, `.ai-factory/rules/generated/openspec-rules-trace-<change-id>.json`, and `.ai-factory/rules/generated/index.json`, requests OpenSpec validation/status when the CLI is available and `validateOnSync` is enabled, detects legacy plans in OpenSpec mode, and writes a sync report under `.ai-factory/state/mode-switches/`.

`/aif-mode sync` without `--change` is recommended after `/aif-done`. After archive, there may be no active change. Sync still refreshes `.ai-factory/rules/generated/openspec-base.md` and `.ai-factory/rules/generated/index.json` from `openspec/specs/**`, skips change-specific generated rules and change validation when no active changes exist, and writes a sync report. OpenSpec skills are not installed.

`/aif-mode sync --all` is a maintenance sweep. It refreshes generated rules for active changes, validates only selected changes that contain `openspec/changes/<change-id>/specs/**/spec.md` delta specs, and reports selected no-delta changes as `no-delta-specs` warnings instead of failing solely because old or docs-only active changes have no delta specs. `/aif-verify <change-id>` remains the stricter verification gate for a specific change.

`/aif-mode doctor --change <change-id>` includes the read-only AIFHub OpenSpec artifact contract check and the latest coverage matrix diagnostic. It reports the full JSON result as `artifactContract`, reports coverage as `coverage`, and treats missing verification evidence as a pre-archive readiness failure. See [OpenSpec Artifact Validation](openspec-validation.md) and [OpenSpec Coverage Matrix](spec-coverage.md).

For CLI or IDE runtimes, planning commands may recommend an available planning mode for structured questions, but they must not fabricate unavailable tools or client actions. Codex mode switching remains a user action; see [Codex Plan Mode](codex-plan-mode.md).

### `/aif-analyze`

Reads:

- project files and repository metadata
- existing `.ai-factory/config.yaml` when present
- existing rules/context artifacts when present

Writes:

- `.ai-factory/config.yaml`
- `.ai-factory/rules/base.md`
- optional OpenSpec-native skeleton paths such as `openspec/specs/`, `openspec/changes/`, `.ai-factory/state/`, `.ai-factory/qa/`, and `.ai-factory/rules/generated/`

Does not write:

- OpenSpec skills or slash commands
- canonical change artifacts for a feature request
- `.ai-factory/plans` in OpenSpec-native mode

Select OpenSpec-native mode explicitly by asking for it or by starting from config with:

```yaml
aifhub:
  artifactProtocol: openspec
```

When `.ai-factory/config.yaml` is missing and the user did not explicitly ask for a protocol, `/aif-analyze` asks one artifact protocol question before writing config or creating mode-specific directories:

- `legacy AI Factory-only`
- `OpenSpec-native`

Existing configs are not prompted again. Codex Default mode asks this as plain text; Codex Plan mode may use `request_user_input`; autonomous/subagent runs default to legacy AI Factory-only and report OpenSpec-native mode as an open question.

If localization questions run first, `/aif-analyze` carries those answers forward and writes them only after the artifact protocol is selected, so language persistence does not accidentally lock in the legacy default.

The selected artifact protocol owns its config profile. Legacy `artifactProtocol: ai-factory` configs do not include `aifhub.openspec` settings or OpenSpec runtime path defaults; OpenSpec-native `artifactProtocol: openspec` configs include those settings and paths explicitly.

### `/aif-plan full`

Reads:

- `.ai-factory/config.yaml`
- project context and rules
- `openspec/specs/**/spec.md`
- optional `.ai-factory/RESEARCH.md`

Writes in OpenSpec-native mode:

- `openspec/changes/<change-id>/proposal.md`
- `openspec/changes/<change-id>/design.md`
- `openspec/changes/<change-id>/tasks.md`
- `openspec/changes/<change-id>/specs/**/spec.md` when behavior changes
- optional runtime notes under `.ai-factory/state/<change-id>/`

Does not write in OpenSpec-native mode:

- `.ai-factory/plans/<id>.md`
- `.ai-factory/plans/<id>/task.md`
- non-OpenSpec helper files under `openspec/changes/<change-id>/`

Docs/tooling-only changes may omit delta specs only when the proposal explains why no product or workflow behavior changes.

When `aifhub.openspec.validateOnPlan` is enabled, planning requests `openspec validate` through the AIFHub OpenSpec runner if a compatible CLI is available. Missing CLI is a degraded warning unless `aifhub.openspec.requireCliForPlan` is true.

### `/aif-explore`

Reads:

- `.ai-factory/config.yaml`
- project context and rules
- `openspec/specs/**/spec.md`
- `openspec/changes/<change-id>/**` when exploring an existing change

Writes:

- `.ai-factory/RESEARCH.md`
- `.ai-factory/state/<change-id>/explore.md` or equivalent runtime notes

Does not write:

- `openspec/changes/<change-id>/proposal.md`
- `openspec/changes/<change-id>/design.md`
- `openspec/changes/<change-id>/tasks.md`
- `openspec/changes/<change-id>/specs/**/spec.md`
- legacy `.ai-factory/plans` artifacts in OpenSpec-native mode

Exploration is research-only until promoted into canonical OpenSpec artifacts by planning or refinement.

### `/aif-roadmap`

Reads:

- `.ai-factory/config.yaml`
- project context and rules
- current `.ai-factory/ROADMAP.md`
- OpenSpec-native evidence under `openspec/specs/**` and `openspec/changes/**`
- local source, tests, CI, runtime state, QA evidence, and generated rules when relevant
- optional GitHub milestones, issues, PRs, labels, and linked branches when available
- current git tree, changed files, tags, and recent commits when available

Writes:

- configured roadmap artifact, `.ai-factory/ROADMAP.md` by default

Does not write:

- GitHub issues, milestones, PRs, labels, or linked branches
- `openspec/changes/**`
- `openspec/specs/**`
- `.ai-factory/state/<change-id>/`
- `.ai-factory/qa/<change-id>/`
- `.ai-factory/rules/generated/**`
- implementation source files

GitHub state is supporting evidence only. Closed issues, completed milestones, and merged PRs are useful signals, but local artifact evidence remains required before marking roadmap items `done`. If GitHub evidence is unavailable, unauthenticated, rate-limited, offline, or partial, `/aif-roadmap` continues from local evidence and summarizes the limitation without writing credentials or private authentication diagnostics.

When GitHub milestones are available, `/aif-roadmap` treats milestones as roadmap phases. Closed milestones produce phase audit sections with linked issues/PRs and local evidence status. Open milestones with `open_issues = 0` produce `phase-completion drift` instead of being treated as closed. Milestone-bound issues/PRs attach to their phase, while unmilestoned issues/PRs remain in `unphased backlog/drift`.

### `/aif-improve`

Reads:

- `openspec/changes/<change-id>/proposal.md`
- `openspec/changes/<change-id>/design.md`
- `openspec/changes/<change-id>/tasks.md`
- `openspec/changes/<change-id>/specs/**/spec.md`
- `openspec/specs/**/spec.md`
- project context and generated rules when relevant

Writes:

- patch-style edits to `proposal.md`, `design.md`, `tasks.md`, and `specs/**/spec.md`
- optional runtime evidence under `.ai-factory/state/<change-id>/`

Does not write:

- `task.md`, `context.md`, `rules.md`, `verify.md`, or `status.yaml` under OpenSpec changes
- legacy `.ai-factory/plans` artifacts in OpenSpec-native mode
- archived changes under `openspec/changes/archive/**` unless the user explicitly chooses a supported recovery path

When `aifhub.openspec.validateOnImprove` is enabled, refinement requests OpenSpec validation through the runner after canonical artifact edits. Missing CLI is a degraded warning unless `aifhub.openspec.requireCliForImprove` is true.

### `/aif-implement`

Reads:

- `openspec/changes/<change-id>/proposal.md`
- `openspec/changes/<change-id>/design.md`
- `openspec/changes/<change-id>/tasks.md`
- `openspec/changes/<change-id>/specs/**/spec.md`
- `openspec/specs/**/spec.md`
- `.ai-factory/rules/generated/*.md` when present
- optional OpenSpec `instructions apply` output when `aifhub.openspec.useInstructionsApply` is enabled and a compatible CLI is available

Runtime todo behavior:

- `openspec/changes/<change-id>/tasks.md` is the canonical implementation checklist.
- When the runtime exposes a todo or plan tool, `/aif-implement` mirrors checkbox tasks into runtime todo state before editing.
- In Codex this uses `update_plan` when available.
- If no todo tool is available, `/aif-implement` reports a task snapshot as a capability fallback and continues from `tasks.md`.
- Runtime todo hydration does not authorize broad task expansion; execution remains one task or one tightly coupled task group.

Writes:

- implementation source files in the selected task scope
- `.ai-factory/state/<change-id>/implementation/`
- task progress in `openspec/changes/<change-id>/tasks.md`

Does not write:

- runtime traces under `openspec/changes/<change-id>/`
- legacy `.ai-factory/plans/<id>/task.md`
- canonical OpenSpec artifacts outside the selected implementation scope unless the user explicitly expands scope

After implementation, optional read-only gates are available before final verification:

```text
/aif-rules-check
/aif-review
/aif-security-checklist
```

The authoritative final verification remains `/aif-verify <change-id>`.

### `/aif-rules-check`

Reads:

- `.ai-factory/rules/generated/openspec-merged-<change-id>.md`
- `.ai-factory/rules/generated/openspec-change-<change-id>.md`
- `.ai-factory/rules/generated/openspec-base.md`
- `.ai-factory/rules/generated/openspec-rules-trace-<change-id>.json`
- `.ai-factory/rules/generated/index.json`
- `.ai-factory/RULES.md`
- `.ai-factory/rules/base.md`
- optional canonical OpenSpec context under `openspec/specs/**` and `openspec/changes/<change-id>/**`

Writes:

- none

`/aif-rules-check` is optional after implementation or fixes and useful for strict/high-risk changes. In OpenSpec-native mode it uses generated rules first, loads trace JSON when present, returns a final `aif-gate-result` with `gate: "rules"`, and does not regenerate generated rules.

When `requireRulesPassForDone` is true, save the final `/aif-rules-check` output, or at least its final `aif-gate-result` block, to `.ai-factory/qa/<change-id>/rules.md`. Generated rules freshness and rules gate pass are separate signals.

```bash
ai-factory aifhub-write-gate-evidence \
  --change add-oauth-login \
  --gate rules \
  --from /tmp/aif-rules-check-output.md
```

```bash
ai-factory aifhub-write-gate-evidence --change add-oauth-login --gate rules
```

In the stdin form, paste or pipe the Markdown gate output into the command.

Generated-rule `FAIL` findings must cite trace-backed `source.path` and `source.requirement`. The generated trace includes output hashes for generated markdown, so status/doctor can warn when generated rule text is manually edited without source-spec changes. If the generated trace is missing or invalid, generated-rule findings are capped at `WARN`; rerun sync to regenerate trace metadata.

If generated rules or generated trace metadata are missing or stale:

```text
/aif-rules-check
/aif-mode sync --change <change-id>
/aif-rules-check
```

### `/aif-review`

Reads:

- changed files
- OpenSpec context and generated rules when available

Writes:

- none

`/aif-review` is an optional read-only code review gate. It returns a final `aif-gate-result` with `gate: "review"`, is useful before `/aif-verify` or for high-risk changes, and does not write OpenSpec, runtime, or QA artifacts.

### `/aif-security-checklist`

Reads:

- changed files
- OpenSpec context and generated rules when available

Writes:

- none

`/aif-security-checklist` is an optional security gate. It is recommended for auth, secrets, permissions, filesystem, shell, external service, API boundary, or data-handling changes. It returns a final `aif-gate-result` with `gate: "security"` and does not write artifacts.

### `/aif-verify`

Reads:

- canonical OpenSpec specs and change artifacts
- generated rules when present
- runtime state under `.ai-factory/state/<change-id>/`
- changed files and verification commands for the repository

Writes:

- `.ai-factory/qa/<change-id>/verify.md`
- `.ai-factory/qa/<change-id>/coverage.json`
- `.ai-factory/qa/<change-id>/openspec-validation.json`
- `.ai-factory/qa/<change-id>/openspec-status.json`
- `.ai-factory/qa/<change-id>/raw/`

`coverage.json` records OpenSpec requirement coverage as `requirement -> task -> implementation evidence -> tests -> rules gate`. `verify.md` includes the coverage summary and ends with a final fenced `aif-gate-result` JSON block using `"gate": "verify"` and `status` of `pass`, `warn`, or `fail`.

Does not write:

- `openspec/specs/**`
- `openspec/changes/archive/**`
- final archive output
- legacy `.ai-factory/specs` archives in OpenSpec-native mode

Invalid OpenSpec validation is a hard stop before code checks. Missing or unsupported CLI, generated rules, rules gate evidence, or coverage evidence is degraded mode unless the matching verify policy flag is true. `openspec-status.json` is written when `aifhub.openspec.statusOnVerify` is enabled. Missing requirement coverage makes verify `fail` in strict mode and `warn` in normal mode.

### `/aif-fix`

Reads:

- the same canonical OpenSpec artifacts as `/aif-implement`
- QA evidence under `.ai-factory/qa/<change-id>/`
- generated rules when present

Writes:

- implementation fixes in the selected finding scope
- `.ai-factory/state/<change-id>/fixes/`

Does not write:

- runtime traces under `openspec/changes/<change-id>/`
- legacy `.ai-factory/plans/<id>/task.md`
- canonical specs unless the user explicitly asks to fix the spec itself

After fixes, rerun:

```text
/aif-verify <change-id>
```

### `/aif-done`

Reads:

- `openspec/changes/<change-id>/**`
- passing verification evidence from `.ai-factory/qa/<change-id>/`
- the latest valid verify `aif-gate-result` block from `.ai-factory/qa/<change-id>/verify.md`
- current coverage evidence from `.ai-factory/qa/<change-id>/coverage.json`
- durable rules gate evidence from `.ai-factory/qa/<change-id>/rules.md` when policy requires it
- the read-only AIFHub OpenSpec artifact contract result
- the pre-archive readiness result from `scripts/openspec-done-readiness.mjs`
- git working tree state

Writes:

- `.ai-factory/qa/<change-id>/done-readiness.json`
- `.ai-factory/qa/<change-id>/done.md`
- `.ai-factory/qa/<change-id>/openspec-archive.json`
- `.ai-factory/qa/<change-id>/raw/`
- `.ai-factory/state/<change-id>/final-summary.md`
- `openspec/specs/**` only through `openspec archive <change-id> --yes`

Does not write:

- custom manual mutations to `openspec/specs/**`
- manual file moves from `openspec/changes` to archives
- legacy `.ai-factory/specs` archives in OpenSpec-native mode

Use `--skip-specs` for docs/tooling-only changes where no accepted spec update is expected. Archive-required finalization needs a compatible OpenSpec CLI when `aifhub.openspec.requireCliForDone` is true. `/aif-done` runs a pre-archive readiness gate and refuses archive on blocking OpenSpec validate, artifact contract, generated rules, rules gate, coverage, verify gate, or dirty workspace failures. The readiness output includes the exact next command to run.

If `requireRulesPassForDone` is true and readiness reports missing rules gate evidence, rerun `/aif-rules-check` and persist the final output with `ai-factory aifhub-write-gate-evidence --change add-oauth-login --gate rules --from /tmp/aif-rules-check-output.md`, or save at least the final `aif-gate-result` block to `.ai-factory/qa/<change-id>/rules.md`.

Next steps after `/aif-done`:

1. Run `/aif-mode sync` to refresh derived artifacts after OpenSpec archive.
2. Run `/aif-commit` to commit implementation, OpenSpec archive/spec changes, QA evidence, and final summaries.
3. Optionally run `/aif-evolve` when the change produced durable workflow or skill learnings.

`/aif-done` finalizes the OpenSpec lifecycle. It does not replace `/aif-commit`.

### `/aif-commit`

Reads:

- staged changes and current diff
- `.ai-factory/qa/<change-id>/done.md` when present
- `.ai-factory/qa/<change-id>/openspec-archive.json` when present
- `.ai-factory/state/<change-id>/final-summary.md` when present
- OpenSpec archive/spec changes produced by `/aif-done`
- configured roadmap artifact, `.ai-factory/ROADMAP.md` by default
- optional GitHub issue, PR, milestone, label, and linked branch freshness context when available

Writes:

- git commit through the upstream AI Factory commit workflow

Does not write:

- `.ai-factory/ROADMAP.md`
- GitHub issues, milestones, PRs, labels, or linked branches
- OpenSpec lifecycle artifacts manually
- `.ai-factory/qa/<change-id>/`
- `.ai-factory/state/<change-id>/`
- `.ai-factory/rules/generated/**`

In OpenSpec-native mode, `/aif-commit` normally runs after `/aif-done`. It performs a read-only roadmap/GitHub freshness gate before the upstream commit prompt. Stale roadmap findings are warning-first unless strict checking was explicitly requested, and each stale finding should hand off to `/aif-roadmap`. The command still writes only the git commit after user confirmation.

### `/aif-evolve`

`/aif-evolve` is optional after commit/finalization. Use it when the implementation, fix, or finalization evidence contains durable lessons that should improve future skills or skill-context. It should not mutate OpenSpec canonical artifacts.

## OAuth Example

Create the change:

```text
/aif-plan full "add OAuth login"
```

Expected canonical artifacts:

```text
openspec/changes/add-oauth-login/
  proposal.md
  design.md
  tasks.md
  specs/
    auth/
      spec.md
```

Refine, sync, implement, gate, verify, finalize, sync, commit, and optionally evolve:

```text
/aif-improve add-oauth-login
/aif-mode sync --change add-oauth-login
/aif-implement add-oauth-login
/aif-rules-check
/aif-verify add-oauth-login
/aif-mode doctor --change add-oauth-login
/aif-done add-oauth-login
/aif-mode sync
/aif-commit
/aif-evolve
```

Expected runtime and QA output:

```text
.ai-factory/state/add-oauth-login/
.ai-factory/qa/add-oauth-login/
```

Implementation and verification traces stay out of `openspec/changes/add-oauth-login/`.

## Legacy AI Factory-Only Mode

Legacy AI Factory-only mode is still supported for compatibility. It is not the normal OpenSpec-native v1 creation path.

Legacy planning writes:

```text
.ai-factory/plans/<plan-id>.md
.ai-factory/plans/<plan-id>/
  task.md
  context.md
  rules.md
  verify.md
  status.yaml
  explore.md
```

Use the explicit migration command when existing legacy artifacts need to enter the OpenSpec-native workflow:

```bash
ai-factory aifhub-migrate-legacy-plans <change-id> --dry-run
ai-factory aifhub-migrate-legacy-plans <change-id>
```

After migration, run:

```text
/aif-improve <change-id>
```

See [Legacy Plan Migration](legacy-plan-migration.md).

## Mode Switching and Sync

Use `/aif-mode status` before changing modes:

```text
/aif-mode status
```

For installed-project automation, call the stable extension wrappers:

```bash
ai-factory aifhub-mode sync --change <change-id> --json
ai-factory aifhub-mode doctor --change <change-id> --json
```

Switch to OpenSpec-native mode:

```text
/aif-mode openspec --dry-run
/aif-mode openspec
```

If legacy plans exist, review migration first:

```bash
ai-factory aifhub-migrate-legacy-plans --all --dry-run
ai-factory aifhub-migrate-legacy-plans --all
```

Switch to legacy AI Factory-only mode without deleting OpenSpec artifacts:

```text
/aif-mode ai-factory
```

Export compatibility legacy files only when requested:

```text
/aif-mode ai-factory --export-openspec --change <change-id> --yes
```

Refresh derived artifacts without changing mode:

```text
/aif-mode sync --change <change-id>
/aif-mode sync
/aif-mode doctor
```

Use `/aif-mode sync --change <change-id>` before implementation and after refinement. Use `/aif-mode sync` after `/aif-done` to refresh base generated rules from accepted specs after archive.

## Recommended Codex App Flow

Codex cannot switch modes from extension prompts. The user controls the mode manually.

```text
# Plan mode, user action
$aif-explore "task description"
$aif-plan full "task description"
$aif-improve <change-id>
$aif-mode sync --change <change-id>

# Default mode, user action
$aif-implement <change-id>
$aif-rules-check
$aif-verify <change-id>
$aif-done <change-id>
$aif-mode sync
$aif-commit
```

Slash-command runtimes use the same workflow with `/aif-*` commands.

In Codex Default mode, prompts must ask plain-text questions rather than using `request_user_input`.

When implementation starts, Codex should hydrate runtime todo state from the selected OpenSpec `tasks.md` checklist with `update_plan` when available. If no todo tool is available, it should show a task snapshot and continue from canonical `tasks.md`.

See [Codex Plan Mode](codex-plan-mode.md) for question-format guidance.

## Troubleshooting

| Problem | Meaning | Action |
|---|---|---|
| OpenSpec CLI missing | `openspec` is not available on `PATH`. | Continue degraded planning or install a compatible CLI before validation/archive-required finalization. |
| Node too old | OpenSpec validate/archive requires Node `>=20.19.0`. | Use Node `>=20.19.0` for OpenSpec commands. |
| Invalid delta spec | OpenSpec validation failed for `specs/**/spec.md`. | Fix the delta spec and rerun `/aif-verify <change-id>`. |
| Ambiguous active change | More than one active change can be selected. | Pass `<change-id>` explicitly or update `.ai-factory/state/current.yaml`. |
| Missing generated rules | Derived rules are absent. | Regenerate `.ai-factory/rules/generated/*.md` from OpenSpec specs before relying on rules guidance. |
| Stale generated rules | Generated rules do not match canonical OpenSpec artifacts. | Regenerate them; do not edit generated rules as source of truth. |
| Missing or stale coverage | `.ai-factory/qa/<change-id>/coverage.json` is absent or fingerprints no longer match source artifacts. | Rerun `/aif-verify <change-id>` to regenerate coverage before `/aif-done`. |
| Artifact contract failure | Canonical OpenSpec artifacts, runtime state, QA evidence, or generated rules violate the AIFHub contract. | Fix the reported path or run the suggested command from `artifactContract.suggested_next`. |
| Dirty working tree before `/aif-done` | Finalization cannot prove archive/summary scope safely. | Commit, stash, or use an explicit supported dirty-state override when available. |

## Release Smoke Checks

1. Check the AI Factory version:

```bash
ai-factory --version
```

Expected range:

```text
>=2.11.0 <3.0.0
```

The supported range is tracked in `aifhub-extension.json -> compat.ai-factory`.

2. Install the extension:

```bash
ai-factory extension add https://github.com/ichinya/aifhub-extension.git
```

3. Run an OpenSpec-native smoke:

```text
/aif-analyze
/aif-plan full "smoke check feature"
/aif-improve <change-id>
/aif-implement <change-id>
/aif-verify <change-id>
```

Expected OpenSpec-native artifacts:

```text
openspec/changes/<change-id>/
.ai-factory/state/<change-id>/
.ai-factory/qa/<change-id>/
.ai-factory/qa/<change-id>/coverage.json
```

Legacy `.ai-factory/plans/` artifacts are expected only when the project is intentionally in legacy AI Factory-only mode.

4. Run local repository checks:

```bash
npm run validate
npm test
```

`npm run validate` checks the split manifest contract: upstream `extension.json`, private `aifhub-extension.json`, bundled agent files, and docs links.

## See Also

- [Documentation Index](README.md)
- [Context Loading Policy](context-loading-policy.md)
- [OpenSpec Compatibility](openspec-compatibility.md)
- [OpenSpec Coverage Matrix](spec-coverage.md)
- [Legacy Plan Migration](legacy-plan-migration.md)
- [Active Change Resolver](active-change-resolver.md)
- [ADR 0001](adr/0001-openspec-native-artifact-protocol.md)
