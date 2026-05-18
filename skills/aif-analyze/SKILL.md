---
name: aif-analyze
description: Bootstrap project context. Resolves localization and stack, creates/updates config.yaml and rules/base.md, then checks DESCRIPTION and guides core skill execution.
version: 0.7.0
author: ichi
---

# AIF Analyze

Bootstrap project context for AI Factory. This skill prepares configuration and rules, then checks core artifacts and guides the next core skills.

## Ownership Boundary

| Artifact | Owner | This Skill |
|----------|-------|------------|
| `config.yaml` | **aif-analyze** | Creates/updates |
| `rules/base.md` | **aif-analyze** | Creates if missing |
| `DESCRIPTION.md` | core `aif` | Checks existence, suggests the selected runtime invocation (`$aif` for `codex-app`, `/aif` for slash-command runtimes) if missing |
| `ARCHITECTURE.md` | core `aif-architecture` | Initiates the selected runtime invocation based on workflow flag |
| `ROADMAP.md` | core `aif-roadmap` | Initiates the selected runtime invocation based on workflow flag |

## Workflow

### Step 1: Resolve Localization

- Follow `skills/shared/LANGUAGE-POLICY.md` when producing user-facing responses or generated artifacts; this skill remains the owner of localization discovery and config persistence.
- This step is mandatory and must finish before any repository analysis.
- Treat the language as a project-level preference, not a user-level global setting.
- Read project memory in this order: `.ai-factory/config.yaml`, then `AGENTS.md`, then `CLAUDE.md`, then `.ai-factory/RULES.md`.
- Check `config.language.ui` and `config.language.artifacts`
- If config.yaml exists with localization settings, use them without asking.
- Treat only explicit localization markers as saved memory.
- Valid memory in `AGENTS.md` or `CLAUDE.md` is a dedicated `## Interaction Preferences` section containing both `Preferred language:` and `Translation scope:` lines.
- Valid memory in `.ai-factory/RULES.md` is both exact bullets `- Preferred language: ...` and `- Translation scope: ...`.
- Never treat tech-stack fields such as `Language: TypeScript`, the current conversation language, or OS locale as a saved project language.
- If the explicit localization markers are missing or incomplete, asking is mandatory before repository inspection or artifact generation. Do not infer the answer.
- Ask question 1 exactly as the project language selector.
- The language options must always include `original (English)` and `russian`.
- Add one context-derived language option only when strong evidence exists.
- Ask question 2 exactly as the translation-scope selector with these options: `communication only`, `communication and artifacts`, `artifacts only`.
- Persist answers to config.yaml (preferred) or bridge file if present.
- If `.ai-factory/config.yaml` is missing, do not create a full config only to persist localization answers before bootstrap mode is resolved. Keep localization answers as pending config values until bootstrap mode is resolved.
- If the translation scope excludes artifacts, keep generated artifacts in the original project language.
- If the translation scope includes artifacts, generate them in the preferred language.
- Keep file names, commands, and identifiers in English.
- Choose the question format by runtime. See `skills/shared/QUESTION-TOOL.md` for the mapping:
  - Claude Code / Kilo CLI / OpenCode: use `question(questions: [...])`.
  - Codex Default mode: use plain-text questions only (no form tool available).
  - Codex Plan mode: use `request_user_input` only when the user already switched the session into Plan mode, and only for 1-3 short questions.
  - If Codex planning guidance needs Plan mode, recommend manual `/plan-mode` as a user action; do not imply this skill can switch modes itself.
  - Autonomous / subagent mode: do not ask interactive questions; record assumptions and blockers/open questions and return them to the parent.

### Step 1.5: Check Extension Compatibility

If this project is an ai-factory extension (has `extension.json`):

1. Read `.ai-factory.json` to get installed ai-factory version
2. Read `aifhub-extension.json` to get `compat.ai-factory` semver range
3. If both exist, compare:
   - If version satisfies range → continue normally
   - If version does NOT satisfy range → output warning:

```
⚠️ Compatibility Warning

ai-factory {installed_version} несовместим с extension (requires {compat_range})

Рекомендации:
- Обновите ai-factory до совместимой версии
- Или обновите compat range в aifhub-extension.json
```

4. Continue execution (warning only, do not block)

### Step 1.6: Check Legacy Workflow Aliases

If this project contains legacy skill-context directories under `.ai-factory/skill-context/` for deprecated `*-plus` workflow names:

then emit a non-blocking migration note:

```
ℹ️ Legacy Workflow Compatibility

This project still contains legacy skill-context for `aif-*-plus`.
Canonical workflow entries are runtime-specific:
- codex-app: `$aif-explore`, `$aif-plan full`, `$aif-improve`, `$aif-implement`, `$aif-verify`, `$aif-fix`
- slash-command runtimes: `/aif-explore`, `/aif-plan full`, `/aif-improve`, `/aif-implement`, `/aif-verify`, `/aif-fix`

If docs or handoff notes mention `Explore`, `New`, `Apply`, or `Done`, treat them only as stage names.
Do not present `/aif-new` or `/aif-apply` as current public commands.
Mention `aif-done` only as the explicit post-verify AIFHub finalizer using the selected runtime invocation style, not as a legacy alias or part of the canonical public workflow.

Backward-compatible fallback is still supported, but renaming the skill-context folders is recommended.
```

Do not rewrite or delete those folders automatically in this skill.

### Step 2: Inspect the Repository

- Use [references/project-scan-checklist.md](references/project-scan-checklist.md) as the scan order.
- Read existing `.ai-factory/*` context files before writing new content.
- Prefer direct evidence from manifests, source layout, config files, and project docs.
- Note the tech stack for rules/base.md generation.

### Step 2.5: Resolve Bootstrap Mode

Resolve the bootstrap/config mode before creating directories:

- Use `openspec-native` mode when the user explicitly asks for `openspec-native`, `OpenSpec-native`, or OpenSpec artifact protocol bootstrap.
- Use `openspec-native` mode when an existing `.ai-factory/config.yaml` has `aifhub.artifactProtocol: openspec`.
- Preserve legacy `ai-factory` mode when an existing `.ai-factory/config.yaml` does not declare `aifhub.artifactProtocol: openspec`.
- If `.ai-factory/config.yaml` is missing and no artifact protocol was explicitly requested, ask one artifact protocol question before writing config or creating mode-specific directories.
  - Options must be exactly `legacy AI Factory-only` and `OpenSpec-native`.
  - Codex Default mode: ask a short plain-text artifact protocol question; do not use `question(...)`, `questionnaire(...)`, or `request_user_input`.
  - Codex Plan mode: use one `request_user_input` question only when the user already switched the session into Plan mode.
  - Claude Code / Kilo CLI / OpenCode: use `question(questions: [...])`.
  - Autonomous / subagent mode: do not ask; choose legacy `ai-factory` mode by default and report OpenSpec-native mode as an open question/blocker.
- Use the selected first-bootstrap answer to choose legacy `ai-factory` mode or `openspec-native` mode.
- Do not silently migrate a legacy AI Factory-only project to OpenSpec-native mode.
- Preserve existing config values. Add only missing keys required by the resolved mode.
- Record the resolved mode and selection source for the final handoff: existing config, explicit user request, first-bootstrap answer, or autonomous default.

### Step 3: Create or Update config.yaml

- If config.yaml is missing, create it with v1 schema only after bootstrap mode is resolved.
- If config.yaml exists, preserve existing values and add missing fields.
- Preserve existing `language.ui`, `language.artifacts`, and `language.technical_terms` values. If `language.technical_terms` is missing, default it to `keep`; accepted values are `keep | translate | mixed`.
- If localization answers were collected while config was missing, write those pending config values into the selected legacy `ai-factory` or `openspec-native` config shape.
- Keep schema consistent with nested sections: `language`, `aifhub`, `paths`, `rules`, `workflow`.
- In legacy `ai-factory` mode:
  - Ensure this selected-protocol profile is present:

```yaml
aifhub:
  artifactProtocol: ai-factory
```

  - Preserve the existing AI Factory-only path defaults.
  - Keep `paths.plans` at `.ai-factory/plans` unless an existing value says otherwise.
  - Keep `paths.specs` at `.ai-factory/specs` unless an existing value says otherwise.
  - Do not add `aifhub.openspec`, OpenSpec policy defaults, or OpenSpec runtime path defaults (`paths.state`, `paths.qa`, `paths.generated_rules`) unless OpenSpec-native mode is selected.
  - Preserve existing user-authored config values unless the user explicitly requests mode cleanup or `/aif-mode` switching.
- In `openspec-native` mode:
  - Ensure this config shape is present:

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
```

  - Ensure canonical artifact paths are set or completed:

```yaml
paths:
  plans: openspec/changes
  specs: openspec/specs
  state: .ai-factory/state
  qa: .ai-factory/qa
  generated_rules: .ai-factory/rules/generated
```

  - Preserve `paths.description`, `paths.architecture`, `paths.roadmap`, `paths.research`, and `paths.rules` unless they are missing.
  - Do not install OpenSpec skills, slash commands, or dependencies.

Use [references/config-template.yaml](references/config-template.yaml) as reference.

### Step 3.5: Detect OpenSpec Capabilities

Run this step only in `openspec-native` mode, after config mode is resolved and before directory creation.

- Installed-project capability reads should prefer the AIFHub mode wrapper:

```bash
ai-factory aifhub-mode status --json
```

- Read `openspecCli` from the JSON output and report equivalent capability fields.
- Source-repo direct runner detection is allowed only when working inside the extension package source tree.
- If `scripts/openspec-runner.mjs` exists, use `detectOpenSpec()` from that file.
- In Node-capable runtimes, a valid detection command is:

```bash
node --input-type=module -e "import { detectOpenSpec } from './scripts/openspec-runner.mjs'; console.log(JSON.stringify(await detectOpenSpec(), null, 2));"
```

- Report capability fields equivalent to:

```yaml
openspec:
  available: boolean
  canValidate: boolean
  canArchive: boolean
  version: string | null
  supportedRange: ">=1.3.1 <2.0.0"
  requiresNode: ">=20.19.0"
  nodeSupported: boolean
  versionSupported: boolean
```

- The runner may also return `nodeVersion`, `command`, `reason`, and `errors`; include those when useful for troubleshooting.
- Do not print raw command output unless troubleshooting requires it.
- If the OpenSpec CLI is compatible, prefer or recommend `openspec init --tools none`.
- If the OpenSpec CLI is missing or unsupported, continue bootstrap with `canValidate: false` and `canArchive: false`.
- Missing or unsupported OpenSpec CLI is a degraded capability state, not a bootstrap failure.
- If `reason` is `unsupported-version`, recommend installing or updating OpenSpec CLI to `>=1.3.1 <2.0.0`.
- If `reason` is `unsupported-node`, recommend using Node `>=20.19.0` for OpenSpec validation/archive.
- If `scripts/openspec-runner.mjs` is missing, report that capability detection is unavailable and continue with degraded capability values.

### Step 4: Create rules/base.md

- Check if `.ai-factory/rules/base.md` exists.
- **If missing**: Create rules directory and base.md.
- Infer project-specific rules from codebase evidence:
  - Primary language and style conventions
  - Naming conventions (from existing code)
  - Module boundaries (from project structure)
  - Error handling patterns (from existing code)
  - Testing requirements (from test files presence)
- Use [references/rules-base-template.md](references/rules-base-template.md) as scaffold.
- Fill placeholders with project-specific values, not generic advice.
- Do NOT create optional area rules (api.md, frontend.md, etc.) — planning owns those when the active plan needs them.
- If `.ai-factory/RULES.md` exists, treat it as additional project-level rules (do not overwrite it).

### Step 5: Ensure Directories Exist

- In legacy `ai-factory` mode, create directories from config paths if missing:
  - `paths.plans` (typically `.ai-factory/plans`)
  - `paths.specs` (typically `.ai-factory/specs`)
  - `paths.rules` (typically `.ai-factory/rules`)
- In `openspec-native` mode:
  - If compatible OpenSpec CLI capabilities are available, prefer or recommend:

```bash
openspec init --tools none
```

  - Verify or create the OpenSpec skeleton without installing tool integrations:
    - `openspec/config.yaml`
    - `openspec/specs/`
    - `openspec/changes/`
  - Preserve an existing `openspec/config.yaml`; do not overwrite it.
  - Verify or create runtime/generated AI Factory directories:
    - `.ai-factory/state/`
    - `.ai-factory/qa/`
    - `.ai-factory/rules/generated/`
  - Do not install OpenSpec skills or slash commands.
  - Record created versus preserved skeleton paths for the final handoff.

### Step 6: Check DESCRIPTION and Guide Core Skills

- Check if `.ai-factory/DESCRIPTION.md` exists.
- If missing: do not generate DESCRIPTION content in this skill; suggest the selected runtime invocation for `aif` first (`$aif` for `codex-app`, `/aif` for slash-command runtimes).
- If DESCRIPTION exists and `workflow.analyze_updates_architecture: true`, suggest or initiate the selected runtime invocation for `aif-architecture`.
- If `workflow.architecture_updates_roadmap: true`, suggest or initiate the selected runtime invocation for `aif-roadmap`.
- If automatic invocation is not available in the current runtime, provide explicit next commands to the user in order.

### Step 7: Finish with Guided Handoff

- Use the saved scope plus preferred language for the reply.
- Mention created/updated files: `config.yaml`, `rules/base.md`, and artifact status (`DESCRIPTION.md`, `ARCHITECTURE.md`, `ROADMAP.md`).
- Report the resolved bootstrap mode.
- Report the bootstrap mode selection source: existing config, explicit user request, first-bootstrap answer, or autonomous default.
- Report whether config values were created or preserved.
- If autonomous/subagent mode defaulted to legacy `ai-factory` because the artifact protocol question could not be asked, report OpenSpec-native mode selection as an open question/blocker.
- Report the active path set.
- In `openspec-native` mode, include the OpenSpec capability object, degraded reason when present, created/preserved skeleton directories, and the statement that OpenSpec skill installation was skipped by design.
- In `openspec-native` mode, explicitly report whether `.ai-factory/state`, `.ai-factory/qa`, and `.ai-factory/rules/generated` were created or preserved.
- Report what was invoked automatically versus what remains as manual next command.
- If DESCRIPTION is missing, first recommended command must use the selected runtime invocation style: `$aif` for `codex-app`, `/aif` for slash-command runtimes.
- When reporting next commands, use the selected runtime invocation style: `codex-app` runtime uses `$aif-explore`, `$aif-plan full`, `$aif-verify`, and other `$aif-*` skills; slash-command runtimes use `/aif-explore`, `/aif-plan full`, `/aif-verify`, and other `/aif-*` commands.
- After bootstrap, describe the current public workflow as starting with the runtime-specific explore or plan invocation, not legacy `/aif-new`.
- If a new plan is needed, recommend the runtime-specific plan command (`$aif-plan full` for `codex-app`, `/aif-plan full` for slash-command runtimes) as the canonical entrypoint.
- If handoff stage vocabulary is mentioned, explicitly mark it as a naming layer, not as slash commands.
- If `aif-done` is mentioned, describe it as the explicit post-verify finalizer using the selected runtime invocation style, not as a legacy workflow alias.

## Config v1 Schema

Common fields:

```yaml
language:
  ui: russian                    # Communication language
  artifacts: russian             # Generated artifacts language
  technical_terms: keep          # keep | translate | mixed

workflow:
  auto_create_dirs: true
  plan_id_format: slug
  analyze_updates_architecture: true
  architecture_updates_roadmap: true
  verify_mode: normal

rules:
  base: .ai-factory/rules/base.md
  # area rules added by planning when needed

agent_profile: default
```

Legacy AI Factory-only profile:

```yaml
aifhub:
  artifactProtocol: ai-factory

paths:
  description: .ai-factory/DESCRIPTION.md
  architecture: .ai-factory/ARCHITECTURE.md
  roadmap: .ai-factory/ROADMAP.md
  research: .ai-factory/RESEARCH.md
  plans: .ai-factory/plans
  specs: .ai-factory/specs
  rules: .ai-factory/rules
```

OpenSpec-native profile:

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
  description: .ai-factory/DESCRIPTION.md
  architecture: .ai-factory/ARCHITECTURE.md
  roadmap: .ai-factory/ROADMAP.md
  research: .ai-factory/RESEARCH.md
  plans: openspec/changes
  specs: openspec/specs
  rules: .ai-factory/rules
  state: .ai-factory/state
  qa: .ai-factory/qa
  generated_rules: .ai-factory/rules/generated
```

## Rules

- Use evidence over assumptions.
- Create/update `config.yaml` and `rules/base.md` first.
- Use OpenSpec-native mode only when explicitly requested, when existing config has `aifhub.artifactProtocol: openspec`, or when the user selects `OpenSpec-native` in the first-bootstrap artifact protocol question.
- Do not write a missing config with a default artifact protocol before first-bootstrap artifact protocol resolution completes.
- In OpenSpec-native mode, use `detectOpenSpec()` from `scripts/openspec-runner.mjs` when available and treat missing or unsupported CLI as degraded capability, not failure.
- In OpenSpec-native mode, AIFHub skills may request OpenSpec validation, status, instructions, and archive through `scripts/openspec-runner.mjs`; never install or depend on OpenSpec slash commands.
- In OpenSpec-native mode, use or recommend `openspec init --tools none` only for compatible CLI environments.
- Never install OpenSpec skills, slash commands, dependencies, or manifest entries.
- Never treat missing OpenSpec validate/archive capability as bootstrap failure; report it as degraded OpenSpec capability and continue with the configured runtime/generated path layout.
- Never generate DESCRIPTION directly in this skill.
- If DESCRIPTION is missing, suggest the selected runtime invocation for `aif` first (`$aif` for `codex-app`, `/aif` for slash-command runtimes).
- Follow workflow flags to suggest or initiate the selected runtime invocation for `aif-architecture` and `aif-roadmap`.
- Create `rules/base.md` with project-specific rules, not generic advice.
- Do NOT create optional area rules — planning owns those when needed.
- Ensure all directories from config paths exist.
- Keep the result concise and repository-specific.

## Example Requests

- "Bootstrap AI Factory config for this project."
- "Initialize project context and run required core skills."
- "Настрой конфигурацию AI Factory."
- "Create project rules."
- "Initialize config.yaml and rules, then suggest core commands for DESCRIPTION/ARCHITECTURE/ROADMAP."
