# Context + Rules + Templates Model

This document defines the artifact model for spec-driven workflow.

## Core Concepts

| Concept | Definition | Example |
|---------|------------|---------|
| **Context** | Facts about the project/plan | "Uses TypeScript", "Auth module in src/auth/" |
| **Rules** | Constraints and required behavior | "Must use async/await", "No direct DB calls in handlers" |
| **Templates** | Expected artifact shapes | SKILL.md structure, config.yaml schema |

## Two Levels

### Project Level (Persistent)

| Artifact | Type | Purpose |
|----------|------|---------|
| `.ai-factory/config.yaml` | Context + Rules | Localization, workflow settings |
| `AGENTS.md` | Context + Rules | Project structure map, agent rules |
| `.ai-factory/DESCRIPTION.md` | Context | Tech stack, modules, integrations |
| `.ai-factory/ARCHITECTURE.md` | Context + Rules | Architecture decisions, patterns |
| `.ai-factory/RULES.md` | Rules | Project conventions (optional) |
| `.ai-factory/ROADMAP.md` | Context | Strategic milestones |

### Plan Level (Ephemeral)

| Artifact | Type | Purpose |
|----------|------|---------|
| `plans/<id>/task.md` | Context | What and why |
| `plans/<id>/context.md` | Context | Local codebase context |
| `plans/<id>/rules.md` | Rules | Plan-specific constraints |
| `plans/<id>/constraints-*.md` | Rules | Additional constraint files |
| `plans/<id>/verify.md` | Rules + Template | Verification checklist |
| `plans/<id>/status.yaml` | Context | Workflow state |
| `plans/<id>/explore.md` | Context | Exploration notes (optional) |

## Inheritance Model

```
Project Level (Base)
    │
    ├── Context: Tech stack, modules, integrations
    ├── Rules: Project conventions, patterns
    └── Templates: Standard artifact shapes
        │
        ▼
Plan Level (Derived)
    │
    ├── Context: task.md + context.md + explore.md
    ├── Rules: rules.md + constraints + verify.md
    └── Templates: Templates for this plan's outputs
```

**Inheritance Rules:**

1. Plan inherits all project-level context
2. Plan rules can add to (not replace) project rules
3. Plan-specific rules take precedence when conflicts occur
4. Templates are shared across project and plans

## How Skills Use This Model

| Skill | Reads | Writes |
|-------|-------|--------|
| `aif-analyze` | Project files | config.yaml, DESCRIPTION.md |
| `aif-explore` | Project + plan context | RESEARCH.md, explore.md |
| `aif-new` | Project context + exploration | Plan folder artifacts |
| `aif-implement` | Plan context + rules | Code files |
| `aif-verify+` | Plan rules + verify.md | Verification results |
| `aif-done` | Plan artifacts | specs/ folder |

## Template Resolution

When a skill needs a template:

1. Check plan folder first (`plans/<id>/templates/`)
2. Fall back to project templates (`.ai-factory/templates/`)
3. Fall back to skill defaults (`skills/<name>/references/`)

```
plans/<id>/templates/     ← Plan-specific (highest priority)
    │
    ▼
.ai-factory/templates/    ← Project-specific
    │
    ▼
skills/<name>/references/ ← Skill defaults (fallback)
```

## Example: Creating a Plan

```yaml
# User runs: /aif-new "add dark mode"

# Skill reads project context:
project_context:
  - .ai-factory/config.yaml     # language_mode: russian
  - .ai-factory/DESCRIPTION.md  # React + TypeScript
  - AGENTS.md                   # Structure map

# Skill reads exploration (if exists):
exploration_context:
  - .ai-factory/RESEARCH.md     # Prior exploration
  - OR asks user for details

# Skill creates plan artifacts:
plan_folder: .ai-factory/plans/add-dark-mode/
  task.md:      # What: Add dark mode toggle
  context.md:   # Context: UI components, theme system
  rules.md:     # Rules: Use CSS variables, persist preference
  verify.md:    # Verify: Toggle works, colors correct
  status.yaml:  # Status: draft
```

## Constraints Files

Additional constraint files can be added for specific concerns:

| File | When to Use |
|------|-------------|
| `constraints-api.md` | API compatibility requirements |
| `constraints-security.md` | Security requirements |
| `constraints-performance.md` | Performance requirements |
| `constraints-accessibility.md` | A11y requirements |

## Updating This Model

When adding new artifacts:

1. Classify as Context, Rules, or Template
2. Assign to Project or Plan level
3. Define which skills read/write it
4. Update this document
