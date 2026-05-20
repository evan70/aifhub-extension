[Previous Page](context-providers.md) | [Back to Documentation](README.md) | [Next Page](openspec-compatibility.md)

# Context Loading Policy

This policy defines which artifacts AIFHub Extension commands load and which artifacts they may write.

OpenSpec-native v1 has one core rule in user projects: canonical requirements and change intent live under `openspec/`; runtime state, QA evidence, and generated rules live under `.ai-factory/`.

The extension package repository is intentionally artifact-light. Root `openspec/`, `.ai-factory/state/`, `.ai-factory/qa/`, `.ai-factory/plans/`, and `.ai-factory/rules/generated/` are user-project/runtime artifacts, not extension package content. Root `.ai-factory/rules/generated/` is derived and safe to regenerate. This repo may include OpenSpec examples only under fixture paths such as `test/fixtures/` or `scripts/fixtures/`, and extension behavior requirements are validated by prompt contracts and tests rather than committed root OpenSpec specs.

OpenSpec CLI integration is a runner-backed adapter. Commands may request validation, status, instructions, and archive through `scripts/openspec-runner.mjs`, but they must not install or invoke OpenSpec slash-command skills.

## Modes

### OpenSpec-Native Mode

OpenSpec-native mode is selected when `.ai-factory/config.yaml` contains:

```yaml
aifhub:
  artifactProtocol: openspec
```

In this mode, plan-aware commands resolve active work from `openspec/changes/<change-id>/`, not from `.ai-factory/plans/`.

`/aif-mode openspec` is the mode-switching entrypoint. It may update config and ensure skeleton directories, but it does not create feature-specific canonical change content by itself.

### Legacy AI Factory-Only Mode

Legacy AI Factory-only mode uses the older companion plan model:

```text
.ai-factory/plans/<plan-id>.md
.ai-factory/plans/<plan-id>/
```

These paths remain supported only for legacy compatibility and explicit migration input.

`/aif-mode ai-factory` switches the config path profile back to this model. It preserves `openspec/` and treats OpenSpec-to-legacy output as compatibility export only.

## Base Context

Consumer commands load these project context files when present:

- `.ai-factory/config.yaml`
- `.ai-factory/DESCRIPTION.md`
- `.ai-factory/ARCHITECTURE.md`
- `.ai-factory/RULES.md`
- `.ai-factory/rules/base.md`
- configured area rules from `.ai-factory/config.yaml`

Consumer commands must not use bridge files such as `AGENTS.md`, `CLAUDE.md`, `QWEN.md`, or `AIFACTORY.md` as substitutes for configured context paths.

## OpenSpec-Native Context Set

Plan-aware consumer commands load these canonical artifacts:

- `openspec/changes/<change-id>/proposal.md`
- `openspec/changes/<change-id>/design.md`
- `openspec/changes/<change-id>/tasks.md`
- `openspec/changes/<change-id>/specs/**/spec.md`
- `openspec/specs/**/spec.md`

They may also load derived/runtime artifacts:

- `.ai-factory/rules/generated/openspec-base.md`
- `.ai-factory/rules/generated/openspec-change-<change-id>.md`
- `.ai-factory/rules/generated/openspec-merged-<change-id>.md`
- `.ai-factory/rules/generated/openspec-rules-trace-<change-id>.json`
- `.ai-factory/rules/generated/index.json`
- `.ai-factory/state/<change-id>/**`
- `.ai-factory/qa/<change-id>/**`

Generated rules and generated trace metadata are derived guidance only. If generated rules conflict with canonical OpenSpec artifacts, canonical OpenSpec artifacts win.

Runner output from OpenSpec CLI commands is runtime guidance or evidence. It does not replace the canonical filesystem artifacts under `openspec/`.

## Optional Context Providers

Optional providers are read-only supporting context. They are not command prerequisites, dependency requirements, generated rules input, QA evidence, verification gates, done gates, or canonical OpenSpec sources.

Provider output can be copied into `.ai-factory/` only after user review and only as concise notes or reviewed summaries. Raw provider output, MCP transcripts, setup output, generated provider configuration, and unreviewed sensitive output must stay out of canonical OpenSpec, generated rules, runtime QA, and validation artifacts.

See [Context Providers](context-providers.md) for the central provider guide.

## Optional Graphify Context

Graphify is an optional context/research provider. AIFHub commands may use existing Graphify output as supporting context, but they must not make Graphify a required extension dependency, install `graphifyy`, run `graphify`, add Graphify manifest dependencies, start or register Graphify MCP automatically, or turn Graphify availability into a verification gate.

Project preference is recorded in `.ai-factory/config.yaml` as `utilities.graphify.enabled`. At the beginning of the optional Graphify check, `/aif-analyze` should test `uv` availability with `uv --version`. If Graphify is missing, or if `utilities.graphify.enabled` is missing or `false`, `/aif-analyze` should report Graphify as optional and recommended for large or unfamiliar repositories, including the manual setup commands `uv tool install graphifyy` and `graphify install`. This recommendation is advisory only and must not trigger installation, execution, dependency changes, or MCP registration.

Allowed Graphify inputs are existing local or copied outputs:

- `graphify-out/GRAPH_REPORT.md`
- `graphify-out/graph.json`
- `.ai-factory/references/graphify/GRAPH_REPORT.md`
- `.ai-factory/references/graphify/graph.json`
- `.ai-factory/state/<change-id>/graphify/GRAPH_REPORT.md`
- `.ai-factory/state/<change-id>/graphify/graph.json`

If Graphify is unavailable, or if no `graphify-out/GRAPH_REPORT.md` or copied report exists, commands continue normally and report Graphify context as unavailable or degraded rather than failing.

Graphify output remains supporting evidence only. `GRAPH_REPORT.md` may include extracted, inferred, ambiguous, or confidence-labeled relationships; commands must treat those graph-derived claims as hypotheses for further inspection. Final requirements, plans, findings, completion status, roadmap status, generated rules, and QA verdicts must be grounded in canonical OpenSpec artifacts, source files, tests, runtime state, QA evidence, or other direct repository evidence.

Allowed durable storage for reviewed Graphify context:

- `.ai-factory/references/graphify/` for project-wide reference copies.
- `.ai-factory/state/<change-id>/graphify/` for change-scoped runtime copies.

Forbidden storage for Graphify generated files such as `GRAPH_REPORT.md`, `graph.json`, or `graph.html`:

- `openspec/changes/<change-id>/`
- `openspec/specs/`
- `.ai-factory/rules/generated/`
- `.ai-factory/qa/<change-id>/`

Before copying Graphify output into `.ai-factory/`, review it for sensitive information. AIFHub guidance must not persist API keys, tokens, raw authorization headers, credential helper output, private backend diagnostics, or unreviewed sensitive output in `.ai-factory/`, `openspec/`, docs, runtime state, QA evidence, generated rules, or Graphify reference copies.

## Optional Context7 Documentation Context

Context7 is an optional documentation provider for current library/API docs. AIFHub commands and sidecars may use existing user-provided or reviewed Context7 notes as supporting context, but they must not make Context7 a required extension dependency, install `ctx7` or `@upstash/context7-mcp`, run `ctx7`, run `ctx7 setup`, add Context7 manifest dependencies, add Context7 MCP templates to `extension.json`, start or register Context7 MCP automatically, mutate `.mcp.json`, `.cursor/mcp.json`, `.opencode.json`, agent rules, or agent skills, or turn Context7 availability into a verification gate.

Manual CLI examples such as `npx ctx7 library <name> <query>` and `npx ctx7 docs <libraryId> <query>` are outside AIFHub command ownership. If a user-installed `ctx7` CLI is already available, the equivalent `ctx7 library <name> <query>` and `ctx7 docs <libraryId> <query>` commands are also user-owned. If Context7 is unavailable, unauthenticated, rate-limited, missing provider access, or blocked by local Node.js runtime constraints, commands continue normally and report Context7 context as unavailable or degraded rather than failing.

If the user has already configured Context7 MCP, agents may use it as optional read-only documentation context. The common flow is `resolve-library-id` followed by a docs retrieval tool. The retrieval tool name may be `get-library-docs` or `query-docs` depending on the Context7 client/server version.

Context7 output remains supporting evidence only. Library IDs such as `/org/project`, `/org/project/version`, `/org/project@version`, `/packages/<name>`, and `/websites/<name>` are provider output, not stable AIFHub schema. Final requirements, plans, review findings, completion status, roadmap status, generated rules, and QA verdicts must be source-grounded in canonical OpenSpec artifacts, source files, tests, runtime state, QA evidence, generated rules trace metadata, or other direct repository evidence.

Allowed durable storage for reviewed Context7 notes:

- `.ai-factory/references/context7/` for project-wide documentation notes.
- `.ai-factory/state/<change-id>/context7/` for change-scoped runtime notes.

Forbidden storage for raw Context7 output, MCP transcripts, API responses, setup output, or generated provider configuration:

- `openspec/changes/<change-id>/`
- `openspec/specs/`
- `.ai-factory/rules/generated/`
- `.ai-factory/qa/<change-id>/`

Before copying Context7 notes into `.ai-factory/`, review them for sensitive information. AIFHub guidance must not persist `CONTEXT7_API_KEY`, API keys, tokens, raw authorization headers, credential helper output, private provider diagnostics, private backend diagnostics, or unreviewed sensitive output in `.ai-factory/`, `openspec/`, docs, runtime state, QA evidence, generated rules, or Context7 reference copies.

## Bug Fix Context

OpenSpec-native bug fixes have two context shapes:

- New bug reports are planning input.
- Fresh bug reports must start with `/aif-plan full "fix <bug description>"`.
- A planned bug fix reads base specs and writes a canonical OpenSpec change under `openspec/changes/<change-id>/`.
- Bug fixes that change product or workflow behavior need delta specs.
- Docs/tooling-only bug fixes may omit delta specs only when the proposal explains why no product or workflow behavior changes.
- Missing OpenSpec CLI means degraded validation, not planning failure.
- Post-verify fixes are execution input.
- `/aif-fix` reads an existing active OpenSpec change and QA evidence or selected findings from `.ai-factory/qa/<change-id>/`.
- `/aif-fix` writes fix traces under `.ai-factory/state/<change-id>/fixes/`.
- `/aif-fix` must not create a canonical OpenSpec change, write QA verdicts, or archive.
- `/aif-fix` must not create `.ai-factory/plans/<id>/`.
- `/aif-fix` routes back to `/aif-verify <change-id>`.

## GitHub-Aware Roadmap Context

`/aif-roadmap` may additionally read GitHub and git-tracker context when available:

- GitHub milestones, issues, PRs, labels, and linked branches
- current git tree, changed files, tags, and recent commits

This context is supporting evidence only. Closed GitHub issues, completed milestones, and merged PRs do not by themselves make roadmap items `done`; local evidence from OpenSpec artifacts, source files, tests, CI, runtime state, QA evidence, or generated rules remains required.

When GitHub milestones are available, `/aif-roadmap` treats milestones as roadmap phases. Closed milestones produce phase audit sections with linked issues/PRs and local evidence status. Open milestones with `open_issues = 0` produce `phase-completion drift` instead of being treated as closed. Milestone-bound issues/PRs attach to their phase, while unmilestoned issues/PRs remain in `unphased backlog/drift`.

GitHub access is non-blocking. If `gh`, connector data, network access, authentication, or rate limits prevent complete GitHub evidence loading, `/aif-roadmap` should continue from local evidence and summarize whether GitHub evidence was unavailable or partial.

`/aif-roadmap` may update only the configured roadmap artifact. It must not mutate GitHub issues, milestones, PRs, labels, linked branches, canonical OpenSpec artifacts, runtime state, QA evidence, generated rules, or implementation files. It must not write tokens, authorization headers, raw credential helper output, or private authentication diagnostics into roadmap output.

## Command Ownership

| Command | May write canonical OpenSpec artifacts | May write runtime or QA artifacts |
|---|---|---|
| `/aif-mode` | skeleton only; never manual `openspec/specs/**` mutations | mode reports, generated rules, optional migration/export outputs |
| `/aif-analyze` | Optional `openspec/` skeleton only when configured | capability/config setup |
| `/aif-roadmap` | no | no |
| `/aif-plan full` | `openspec/changes/<change-id>/proposal.md`, `design.md`, `tasks.md`, `specs/**/spec.md` | optional `.ai-factory/state/<change-id>/` |
| `/aif-explore` | no | `.ai-factory/RESEARCH.md`, `.ai-factory/state/<change-id>/` |
| `/aif-improve` | `proposal.md`, `design.md`, `tasks.md`, `specs/**/spec.md` | optional `.ai-factory/state/<change-id>/` |
| `/aif-implement` | no, unless explicitly requested for selected scope | `.ai-factory/state/<change-id>/implementation/` |
| `/aif-fix` | no, unless explicitly requested for selected finding scope | `.ai-factory/state/<change-id>/fixes/` |
| `/aif-verify` | no | `.ai-factory/qa/<change-id>/` |
| `/aif-rules-check` | no | no |
| `/aif-review` | no | no |
| `/aif-security-checklist` | no | no |
| `/aif-done` | `openspec/specs/**` only through OpenSpec CLI archive | `.ai-factory/qa/<change-id>/`, `.ai-factory/state/<change-id>/final-summary.md` |
| `/aif-commit` | no | git commit only |
| `/aif-evolve` | no | skill-context or evolution artifacts only |

`/aif-roadmap` writes only the configured roadmap artifact, `.ai-factory/ROADMAP.md` by default.

## Quality Gates and Finalization Tail

OpenSpec-native quality gates:

| Command | Reads | Writes |
|---|---|---|
| `/aif-rules-check` | generated rules, project rules, changed files, optional OpenSpec context | none |
| `/aif-review` | changed files, OpenSpec context, generated rules | none |
| `/aif-security-checklist` | changed files, OpenSpec context, generated rules | none |
| `/aif-verify` | canonical OpenSpec artifacts, generated rules, runtime state, gate outputs when available | `.ai-factory/qa/<change-id>/` |
| `/aif-done` | passing verify evidence, verify gate result, OpenSpec change | final QA/state evidence and OpenSpec archive via CLI |
| `/aif-commit` | staged changes, done evidence, final summary, OpenSpec archive/spec changes | git commit |
| `/aif-evolve` | patches, evidence, skill-context inputs | skill-context/evolution artifacts |

`/aif-done` owns OpenSpec lifecycle finalization. `/aif-commit` owns git commit creation. `/aif-evolve` owns learning/evolution.

After `/aif-done`, `/aif-commit` may read finalization evidence, OpenSpec archive/spec mutations, the configured roadmap artifact, and optional GitHub issue/PR/milestone freshness context. It must not mutate OpenSpec lifecycle artifacts, `.ai-factory/ROADMAP.md`, runtime state, QA evidence, generated rules, or GitHub objects manually. If the roadmap is stale, `/aif-commit` reports a read-only freshness warning and hands off to `/aif-roadmap`; it still writes only the git commit after user confirmation.

## Legacy Artifact Boundaries

These files are legacy AI Factory-only artifacts or migration input only:

- `.ai-factory/plans/<id>.md`
- `.ai-factory/plans/<id>/task.md`
- `.ai-factory/plans/<id>/context.md`
- `.ai-factory/plans/<id>/rules.md`
- `.ai-factory/plans/<id>/verify.md`
- `.ai-factory/plans/<id>/status.yaml`
- `.ai-factory/plans/<id>/explore.md`
- `.ai-factory/plans/<id>/fixes/*.md`

OpenSpec-native commands must not require those files and must not create them as part of normal OpenSpec-native execution.

## Migration Context

Legacy migration is explicit. It reads `.ai-factory/plans` artifacts and writes:

- canonical migrated artifacts under `openspec/changes/<change-id>/`
- preserved runtime notes under `.ai-factory/state/<change-id>/`
- preserved legacy verification evidence under `.ai-factory/qa/<change-id>/`

Migration never silently deletes legacy source artifacts and never writes migrated artifacts under `openspec/specs/`.

See [Legacy Plan Migration](legacy-plan-migration.md).

## Compatibility Export

OpenSpec-to-legacy compatibility export is optional and lossy. It may write:

- `.ai-factory/plans/<id>.md`
- `.ai-factory/plans/<id>/task.md`
- `.ai-factory/plans/<id>/context.md`
- `.ai-factory/plans/<id>/rules.md`

The export does not make OpenSpec artifacts obsolete and does not delete or archive them. Existing legacy files are not overwritten unless the caller explicitly approves overwrite behavior.

## Generated Rules

`.ai-factory/rules/generated/` is owned by the OpenSpec generated-rules compiler. Files in that directory are safe to delete and regenerate from:

```text
openspec/specs/**/spec.md
openspec/changes/<change-id>/specs/**/spec.md
```

Read-only gates report missing or stale generated rules as warnings and do not regenerate them automatically.

`/aif-mode sync` owns regeneration of generated OpenSpec rules for mode maintenance. Consumer commands should still treat generated rules as derived guidance rather than source of truth.

## Fallback Behavior

If `.ai-factory/config.yaml` is missing or incomplete:

- consumer commands stop when they cannot resolve required paths safely
- they should suggest `/aif-analyze` to initialize or repair config
- they must not fabricate canonical artifacts from chat context alone

## See Also

- [Usage](usage.md)
- [OpenSpec Compatibility](openspec-compatibility.md)
- [Legacy Plan Migration](legacy-plan-migration.md)
- [ADR 0001](adr/0001-openspec-native-artifact-protocol.md)
