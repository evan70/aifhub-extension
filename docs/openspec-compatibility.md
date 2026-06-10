[Предыдущая страница](context-loading-policy.md) | [К документации](README.md) | [Следующая страница](openspec-validation.md)

# OpenSpec Compatibility

OpenSpec is an optional CLI adapter for the v1 OpenSpec-native artifact protocol.

AIFHub Extension can create and consume OpenSpec-native filesystem artifacts without a local OpenSpec CLI. Validation and archive operations require a compatible CLI.

OpenSpec-native mode uses this layering:

```text
OpenSpec artifacts = canonical truth
OpenSpec CLI = validator / status / instructions / archive adapter
AIFHub skills = UX and orchestration
AI Factory = execution runtime
```

## Supported Versions

| Capability | Requirement |
|---|---|
| AI Factory extension install/use | `ai-factory >=2.11.0 <3.0.0` |
| OpenSpec-native validation/archive | OpenSpec CLI `>=1.3.1 <2.0.0` |
| OpenSpec CLI runtime | Node `>=20.19.0` |
| OpenSpec skills/commands | Not installed by this extension |

AI Factory-only workflows follow AI Factory's runtime support. OpenSpec validation/archive follows the OpenSpec CLI runtime requirement.

## OpenSpec 1.4.1 Reviewed Baseline

AIFHub metadata records OpenSpec `1.4.1` as the reviewed upstream baseline while keeping the supported CLI range `>=1.3.1 <2.0.0`.

Reviewed upstream behavior:

- OpenSpec `1.4.1` includes an `openspec update` fix for projects that already have their own `workspace.yaml`.
- OpenSpec `1.4.0` includes Kimi CLI support, Mistral Vibe support, sync skills by default through `/opsx:sync`, case-insensitive requirement headers, and clearer validation hints.
- OpenSpec workspace beta view state is OpenSpec-owned and lives under `.openspec-workspace/view.yaml`.

AIFHub remains adapter-only: it does not install or manage OpenSpec skills, `/opsx:*` commands, Kimi CLI or Mistral Vibe integrations, OpenSpec workspace beta state, or `openspec update`. AIFHub does not install or manage Kimi CLI or Mistral Vibe integrations, does not own OpenSpec workspace beta state, and does not run or manage `openspec update`.

`openspec update` is upstream OpenSpec behavior. `/aif-mode sync` compiles AIFHub generated rules and requests OpenSpec validate/status through the adapter when configured and available.

## Опциональная Инициализация

Projects may initialize OpenSpec without tool integrations:

```bash
openspec init --tools none
```

This is optional. The extension installer does not run it.

OpenSpec skills and slash commands are not installed by this extension.

This initialization is for user projects. The `aifhub-extension` package repository does not ship root `openspec/` or root `.ai-factory/rules/generated/` content; generated rules are derived in user projects and safe to regenerate. OpenSpec examples in this repo belong only under fixture paths, and extension behavior requirements are validated by prompt contracts and tests instead of committed root OpenSpec specs.

## Artifact Protocol Profiles

The selected `aifhub.artifactProtocol` owns its active config profile. Legacy AI Factory-only mode does not add OpenSpec settings or OpenSpec runtime paths:

```yaml
aifhub:
  artifactProtocol: ai-factory

paths:
  plans: .ai-factory/plans
  specs: .ai-factory/specs
  rules: .ai-factory/rules

utilities:
  context_tools:
    enabled: []
  graphify:
    enabled: false
    uv_check: uv --version
    install: uv tool install graphifyy
    activate: graphify install
    report_command: graphify .
  codegraph:
    enabled: false
    command: codegraph
    status: codegraph status
    init: codegraph init .
    index: codegraph index --quiet .
    query: codegraph query --path . --limit 10 --json
    purge: codegraph uninit --force .
```

OpenSpec-native mode adds the OpenSpec settings and runtime path profile shown below.

## OpenSpec-Native Config

OpenSpec-native mode is selected through `.ai-factory/config.yaml`:

```yaml
aifhub:
  artifactProtocol: openspec
  openspec:
    root: openspec
    installSkills: false
    validateOnPlan: true
    validateOnImprove: true
    validateOnVerify: true
    statusOnVerify: true
    archiveOnDone: true
    useInstructionsApply: true
    compileRulesOnSync: true
    validateOnSync: true
    requireCliForPlan: false
    requireCliForImprove: false
    requireCliForVerify: false
    requireCliForDone: true
    requireGeneratedRulesForVerify: false
    requireGeneratedRulesForDone: true
    requireRulesPassForVerify: false
    requireRulesPassForDone: true
    requireSpecCoverageForVerify: false
    requireSpecCoverageForDone: true
    allowWarnOnDone:
      rules: false
      coverage: false
      openspecStatus: true

paths:
  plans: openspec/changes
  specs: openspec/specs
  state: .ai-factory/state
  qa: .ai-factory/qa
  generated_rules: .ai-factory/rules/generated

utilities:
  graphify:
    enabled: false
    uv_check: uv --version
    install: uv tool install graphifyy
    activate: graphify install
    report_command: graphify .
```

`installSkills: false` задан намеренно. AIFHub Extension использует OpenSpec artifacts и `scripts/openspec-runner.mjs` как optional CLI adapter, а не OpenSpec-installed skills или slash commands.

Секция `utilities` protocol-neutral. Она хранит только optional tool preferences. `utilities.context_tools.enabled` хранит user-accepted provider ids из `/aif-analyze`; follow-on skills вызывают `ai-factory aifhub-memory-tools select --from-project --command <skill> --json` и используют только `selected_tools`. Graphify остается manually installed/activated/run пользователем. CodeGraph остается manual CLI-only и может использоваться `/aif-explore` только когда выбран CLI, с purge перед завершением.

`paths.archive` is an upstream AI Factory legacy plan archive path. AIFHub documents the upstream default `.ai-factory/archive/`, but OpenSpec-native canonical archive/finalization does not use `paths.archive`; it remains under OpenSpec CLI archive behavior, accepted specs in `openspec/specs/**`, and AIFHub evidence under `.ai-factory/qa/<change-id>/` plus `.ai-factory/state/<change-id>/`.

On first bootstrap, `/aif-analyze` may create the OpenSpec marker after asking for the artifact protocol. If `.ai-factory/config.yaml` is missing and the user did not explicitly request OpenSpec-native mode, interactive runtimes ask the user to choose `legacy AI Factory-only` or `OpenSpec-native` before writing the config. Existing configs are preserved without prompting. Autonomous/subagent runs do not ask; they default to legacy AI Factory-only and report OpenSpec-native mode as an open question.

Localization preferences collected before this choice are carried as pending config values and written only after the artifact protocol is resolved.

Action toggles such as `validateOnPlan`, `validateOnImprove`, `validateOnVerify`, `statusOnVerify`, `archiveOnDone`, `compileRulesOnSync`, and `validateOnSync` decide which operations are attempted. Policy flags such as `require*` and `allowWarnOnDone` decide whether missing, stale, failed, or warning-only evidence blocks a command.

The defaults keep planning and verification degraded-friendly while making `/aif-done` strict: verify can warn on missing CLI, generated rules, rules gate evidence, or coverage evidence; done requires current generated rules, a passing durable rules gate, current passing coverage, and archive-capable CLI unless config relaxes those requirements.

## Workflow Plan ID Policy

OpenSpec-native mode uses OpenSpec `change-id` values and ignores AI Factory `workflow.plan_id_format` for canonical artifact names. The active change directory stays `openspec/changes/<change-id>/` whether upstream AI Factory is configured for `slug` or `sequential` legacy plan IDs.

Legacy AI Factory-only mode follows upstream `workflow.plan_id_format`. Use `slug` for slug-named plan files, or `sequential` for upstream sequential filenames under `paths.plans`.

When legacy AI Factory-only mode uses `sequential`, upstream `/aif-archive` excludes archived files under `paths.archive/plans/` from active plan discovery and from the next sequential number calculation. OpenSpec-native `change-id` directories remain non-sequential and are not renamed to `NNNN_` plan files.

In short: archived legacy plans are excluded from active plan discovery, while OpenSpec-native active changes remain `openspec/changes/<change-id>/` directories.

## AIFHub Wrapper Behavior

| AIFHub command | OpenSpec CLI feature |
|---|---|
| `/aif-analyze` | optional `openspec init --tools none` guidance or filesystem skeleton |
| `/aif-plan full` | `openspec validate <change>` when `validateOnPlan` is enabled; CLI absence blocks only when `requireCliForPlan` is true |
| `/aif-improve` | `openspec validate <change>` when `validateOnImprove` is enabled; CLI absence blocks only when `requireCliForImprove` is true |
| `/aif-implement` | `openspec instructions apply --change <id>` when `useInstructionsApply` is enabled and CLI is available |
| `/aif-verify` | `openspec validate`, optional `openspec status` evidence, policy-derived diagnostics, coverage, and final `aif-gate-result` with `"gate": "verify"` |
| `/aif-rules-check` | Upstream rules gate plus AIFHub generated-rules overlay for OpenSpec specs/deltas |
| `/aif-done` | AIFHub artifact contract check, then `openspec archive <change> --yes` when archive is required |
| `/aif-mode sync` | generated-rule compile plus validate/status according to sync flags; generated-rule compilation may call `openspec show <item> --json` through `scripts/openspec-rules-compiler.mjs` and `showOpenSpecItem()` |
| `/aif-mode doctor` | CLI, Node, active change, effective policy, generated rules, latest verify gate, rules gate, coverage, AIFHub artifact contract, and archive readiness diagnostics |

Do not route users to OpenSpec slash commands such as `/opsx:propose`, `/opsx:apply`, or `/opsx:archive`.

## AI Factory 2.12 Optional Artifact Audit Bridge

AI Factory 2.12+ provides an optional read-only artifact audit command that can inspect OpenSpec and AIFHub runtime evidence together:

```bash
ai-factory audit-artifacts openspec .ai-factory/qa .ai-factory/state --json
```

This audit bridge is diagnostic-only for AIFHub Extension. It may supplement `/aif-mode doctor` output when available, but it is not mandatory, not archive-blocking, and not a replacement for AIFHub generated rules, coverage, rules gate, verify gate, or OpenSpec archive readiness checks.

## AI Factory 2.13 Commit Plan and Distillation

AI Factory 2.13+ owns generic active plan `## Commit Plan` grouping in `/aif-commit`. AIFHub must not duplicate parent grouping logic. The AIFHub `aif-commit` injection remains a read-only roadmap/GitHub freshness overlay, and `/aif-commit` remains the only commit owner.

In OpenSpec-native mode, an active `openspec/changes/<change-id>/tasks.md` file may be the plan source that contains `## Commit Plan`. If no active change/plan resolves, AIFHub keeps upstream staged-diff behavior. When upstream detects the plan, AIFHub must preserve the upstream grouping prompt and options such as `Follow Commit Plan`, `Commit everything together`, and `Adjust grouping`.

AI Factory 2.13+ includes `/aif-distillation`. It is an upstream utility skill for turning books, docs, folders, or URLs into reusable Agent Skills. It is not an AIFHub lifecycle stage, does not create OpenSpec changes, and must not write `openspec/changes/**`, `openspec/specs/**`, `.ai-factory/qa/**`, or `.ai-factory/rules/generated/**`. It writes generated skill packages to the current agent skills directory.

Examples:

```text
/aif-distillation docs/memory-tools-research --name aifhub-memory-tool-selection
/aif-distillation docs/context-providers.md --name aifhub-context-providers
```

## AI Factory 2.15 Reviewed Baseline

The reviewed AI Factory `2.15.0` baseline includes AI Factory `2.14.0` archive behavior and AI Factory `2.15.0` update behavior.

AI Factory 2.14+ includes upstream `/aif-archive` and `paths.archive`. AIFHub treats `/aif-archive` as legacy AI Factory-only cleanup, not as OpenSpec-native finalization:

- completed legacy `paths.plans/*.md` files move to `paths.archive/plans/*.md`;
- `paths.archive` defaults to `.ai-factory/archive/`;
- `/aif-archive --roadmap` may snapshot closed roadmap milestones under `paths.archive/roadmap/`;
- archived legacy plans are excluded from active sequential plan discovery and numbering;
- `/aif-archive` must not modify `openspec/changes/**`, `openspec/specs/**`, `.ai-factory/qa/**`, `.ai-factory/state/**`, or `.ai-factory/rules/generated/**`;
- `/aif-archive` must not run `openspec archive <change-id> --yes`.

OpenSpec-native finalization remains `/aif-verify <change-id>` followed by `/aif-done <change-id>`. `/aif-done` owns OpenSpec archive/finalization evidence; `/aif-archive` owns only upstream legacy plan cleanup.

For machine-checkable ownership: `/aif-archive` must not write `openspec/changes/**`, must not write `openspec/specs/**`, must not write `.ai-factory/qa/**`, must not write `.ai-factory/state/**`, and must not write `.ai-factory/rules/generated/**`.

AI Factory 2.15+ preserves managed agent config files during update/init workflows and can offer newly available built-in skills interactively during update. This is upstream installer/update behavior only. It does not make AIFHub the owner of OpenSpec canonical artifacts, generated rules, or project-specific agent config files.

## Artifact Sync Points

Recommended sync points:

- after `/aif-plan full` or `/aif-improve`: `/aif-mode sync --change <change-id>`
- after spec/task edits during implementation or fix: `/aif-mode sync --change <change-id>`
- after `/aif-done` archive: `/aif-mode sync`

`/aif-mode sync` compiles generated rules and requests OpenSpec validation/status when configured and available. Missing OpenSpec CLI is degraded mode for sync validation, not an install failure.

When no active changes exist after archive, `/aif-mode sync` still refreshes `.ai-factory/rules/generated/openspec-base.md` and `.ai-factory/rules/generated/index.json` from `openspec/specs/**`, skips change-specific generated rules, skips change validation, writes a sync report, and returns OK.

For `/aif-mode sync --all`, selected active changes without `openspec/changes/<change-id>/specs/**/spec.md` delta specs are reported as `no-delta-specs` warnings and skipped for sync validation. Changes with delta specs are still validated/statused when the CLI is available.

## Гейт Rules

`/aif-rules-check` is read-only. It uses AIFHub generated rules in OpenSpec-native mode and returns a machine-readable `aif-gate-result` with `gate: "rules"`.

When done policy requires a rules gate pass, save durable rules evidence under `.ai-factory/qa/<change-id>/rules.md` with the final fenced `aif-gate-result` block. Generated rules being present and current is a separate readiness signal; it does not satisfy `requireRulesPassForVerify` or `requireRulesPassForDone`.

Generated rules are compiled as markdown plus provenance JSON:

```text
.ai-factory/rules/generated/openspec-base.md
.ai-factory/rules/generated/openspec-change-<change-id>.md
.ai-factory/rules/generated/openspec-merged-<change-id>.md
.ai-factory/rules/generated/openspec-rules-trace-<change-id>.json
.ai-factory/rules/generated/index.json
```

Generated-rule failures must cite trace-backed `source.path` and `source.requirement`. The trace also records output hashes for generated markdown so status/doctor can detect manual edits to generated rule text. Missing or invalid trace metadata is warning-only and should be fixed with sync; it is not enough on its own for a generated-rule `FAIL`.

If generated rules are missing or stale, run:

```text
/aif-mode sync --change <change-id>
/aif-rules-check
```

## Mode Controller

`/aif-mode` is the extension-owned controller for artifact protocol changes:

```text
/aif-mode status
/aif-mode openspec
/aif-mode ai-factory
/aif-mode sync
/aif-mode doctor
```

`/aif-mode openspec` ensures:

```text
openspec/config.yaml
openspec/specs/
openspec/changes/
.ai-factory/state/
.ai-factory/qa/
.ai-factory/rules/generated/
```

It does not install OpenSpec skills or commands. If legacy plans exist, it reports migration commands and only runs migration when explicitly approved.

`/aif-mode ai-factory` switches the config marker and legacy paths back to `.ai-factory/plans`, `.ai-factory/specs`, and `.ai-factory/rules`. It does not delete `openspec/`.

## OpenSpec-Native Planning

`/aif-plan full` remains the public planning entrypoint. In OpenSpec-native mode it creates:

```text
openspec/changes/<change-id>/
  proposal.md
  design.md
  tasks.md
  specs/<capability>/spec.md
```

It does not create `.ai-factory/plans/<id>.md` or `.ai-factory/plans/<id>/task.md` in OpenSpec-native mode. Missing or unsupported OpenSpec CLI is degraded validation, not planning failure.

## Capability Shape

`scripts/openspec-runner.mjs` exposes capability detection with this stable minimum:

```yaml
openspec:
  available: boolean
  canValidate: boolean
  canArchive: boolean
  version: string | null
  supportedRange: ">=1.3.1 <2.0.0"
  requiresNode: ">=20.19.0"
```

The current runner also reports operational detail fields:

```yaml
openspec:
  nodeVersion: string
  nodeSupported: boolean
  versionSupported: boolean
  command: string
  reason: string | null
  errors:
    - code: string
      message: string
```

Commands should treat the stable minimum as the contract and the operational detail fields as diagnostics.

## Degraded Mode

When the OpenSpec CLI is missing or unsupported:

- extension install remains valid
- OpenSpec-native planning can still write `openspec/changes/<change-id>/`
- generated-rules and execution context may continue from filesystem artifacts
- `/aif-verify` records degraded validation unless strict config requires CLI availability
- `/aif-done` fails archive-required finalization because archive requires a compatible CLI

When Node is below `>=20.19.0`, the CLI is treated as unavailable for validate/archive capabilities even if an `openspec` command exists.

When `detectOpenSpec()` reports `reason: unsupported-version`, update or reinstall OpenSpec CLI to `>=1.3.1 <2.0.0`. This remains degraded capability for bootstrap and planning unless a command-specific policy requires CLI availability.

## Prompt Assets and Runtime Integration

OpenSpec-native prompt assets are mode-gated. They keep canonical changes under `openspec/changes/<change-id>/`, read generated rules as derived guidance, and write runtime state or QA evidence under `.ai-factory/state/<change-id>/` and `.ai-factory/qa/<change-id>/`.

Scoped runtime integrations are already documented in the active prompt assets: #31 covers implementation/fix runtime state alignment, #32 covers verify validate/status runtime behavior, and done finalization covers archive/finalizer integration.

## Validation and Archive

Validation uses:

```bash
openspec validate <change-id> --type change --strict --json --no-interactive --no-color
```

Status evidence uses:

```bash
openspec status --change <change-id> --json --no-color
```

Archive-required finalization uses:

```bash
openspec archive <change-id> --yes --no-color
```

`/aif-done --skip-specs` may add `--skip-specs` for docs/tooling-only changes.

AIFHub artifact contract validation is a separate read-only layer over the CLI adapter. It checks workflow ownership, runtime evidence placement, generated-rule freshness, and pre-archive verification evidence. See [OpenSpec Artifact Validation](openspec-validation.md).

## See Also

- [Usage](usage.md)
- [Context Loading Policy](context-loading-policy.md)
- [OpenSpec Artifact Validation](openspec-validation.md)
- [Active Change Resolver](active-change-resolver.md)
- [ADR 0001](adr/0001-openspec-native-artifact-protocol.md)
