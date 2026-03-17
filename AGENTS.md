# AGENTS.md

> Project map for AI agents. Keep this file up-to-date as the project evolves.

## Project Overview

AIFHub Extension — это расширение для ai-factory 2.x CLI, предоставляющее spec-driven workflow для AI-агентов. Включает навыки анализа проекта, создания планов, верификации и управления артефактами.

## Tech Stack

- **Language:** Markdown (SKILL.md файлы)
- **Platform:** ai-factory 2.x CLI
- **Architecture:** Skill-Based Extension

## Project Structure

```
aifhub-extension/
├── .ai-factory/              # AI Factory context
│   ├── config.yaml           # Project configuration (localization, workflow)
│   ├── DESCRIPTION.md        # Project specification
│   ├── ARCHITECTURE.md       # Architecture decisions
│   ├── ROADMAP.md            # Project roadmap
│   ├── plans/                # Active plans
│   └── specs/                # Finalized specs
│
├── skills/                   # Extension skills
│   ├── aif-analyze/          # Project analysis
│   │   ├── SKILL.md
│   │   └── references/
│   ├── aif-new/              # Plan creation
│   │   ├── SKILL.md
│   │   └── references/
│   └── aif-roadmap-plus/     # Enhanced roadmap
│       ├── SKILL.md
│       └── references/
│
├── .agents/skills/           # Built-in skills (aif-*)
├── .github/workflows/        # CI: auto-tagging
├── extension.json            # Extension manifest
├── AGENTS.md                 # This file
└── README.md                 # User documentation
```

## Key Entry Points

| Skill | Purpose | Output |
|-------|---------|--------|
| `aif-analyze` | Analyze project, create DESCRIPTION.md + config.yaml | `.ai-factory/DESCRIPTION.md`, `.ai-factory/config.yaml` |
| `aif-new` | Create plan folder with artifacts | `.ai-factory/plans/<plan-id>/` |
| `aif-roadmap-plus` | Create maturity roadmap | `.ai-factory/ROADMAP.md` |

## Documentation

| Document | Path | Description |
|----------|------|-------------|
| Description | `.ai-factory/DESCRIPTION.md` | Project specification and tech stack |
| Architecture | `.ai-factory/ARCHITECTURE.md` | Architecture decisions and guidelines |
| Roadmap | `.ai-factory/ROADMAP.md` | Project maturity and progress |
| Config | `.ai-factory/config.yaml` | Localization and workflow settings |

## Workflow

```
aif-analyze → aif-explore → aif-new → aif-implement → aif-verify+ → aif-fix → aif-done
```

### Plan Folder Structure

```
.ai-factory/plans/<plan-id>/
  task.md        # What is being done
  context.md     # Local context for this plan
  rules.md       # Plan-specific rules
  verify.md      # Verification checklist
  status.yaml    # Workflow status tracking
```

## Configuration

Project configuration is stored in `.ai-factory/config.yaml`:

```yaml
language_mode: russian
artifact_language: russian
technical_terms_language: english
plans_dir: .ai-factory/plans
specs_dir: .ai-factory/specs
```

## Interaction Preferences

- Preferred language: russian
- Translation scope: communication and artifacts

## Agent Rules

- Never combine shell commands with `&&`, `||`, or `;` — execute each command as a separate Bash tool call. This applies even when a skill, plan, or instruction provides a combined command — always decompose it into individual calls.
  - ❌ Wrong: `npm install && npm run build`
  - ✅ Right: Two separate Bash tool calls — first `npm install`, then `npm run build`
