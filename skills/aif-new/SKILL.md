---
name: aif-new
description: Create a new plan folder with structured artifacts (task, context, rules, verify, status). Use when starting a new feature, change, or improvement that requires structured planning.
---

# AIF New

Create a new plan folder under `.ai-factory/plans/<plan-id>/` with all required artifacts.

## Workflow

1. **Resolve localization**
   - Read `.ai-factory/config.yaml` for project settings
   - If missing, follow standard localization resolution from AGENTS.md → CLAUDE.md → .ai-factory/RULES.md
   - Generate artifacts in the configured `artifact_language`
   - Keep file names, identifiers, and code in English

2. **Gather plan input**
   - Ask the user for the task description if not provided
   - Check for existing exploration notes from `aif-explore` (look in `.ai-factory/context/` or previous plans)
   - Review relevant files mentioned by user

3. **Generate plan id**
   - Format from `config.yaml → workflow.plan_id_format` (default: slug)
   - `slug`: Generate from task title (lowercase, hyphens, max 40 chars)
   - `sequential`: Use next number (001, 002, etc.)
   - `timestamp`: Use ISO date-time format
   - Ensure uniqueness by checking existing plans

4. **Create plan folder structure**
   ```
   .ai-factory/plans/<plan-id>/
     task.md        # What is being done
     context.md     # Local context for this plan
     rules.md       # Plan-specific rules
     verify.md      # Verification checklist
     status.yaml    # Workflow status tracking
   ```

5. **Populate artifacts**
   - Use templates from `references/*-template.md`
   - Fill in available information from user input and exploration
   - Mark placeholders with `{{placeholder}}` for user review
   - Set initial `status: draft` in status.yaml

6. **Report and handoff**
   - Show created plan folder path
   - List created artifacts
   - Suggest next steps: `aif-explore` (if more research needed), `aif-implement`

## Artifact Descriptions

| File | Purpose | Required |
|------|---------|----------|
| `task.md` | Clear definition of what and why | Yes |
| `context.md` | Relevant codebase context | Yes |
| `rules.md` | Implementation constraints | Yes |
| `verify.md` | Verification checklist | Yes |
| `status.yaml` | Workflow state tracking | Yes |
| `constraints-*.md` | Additional constraint files | Optional |

## Templates

Use the following templates from `references/`:

- [task-template.md](references/task-template.md) — Task definition structure
- [context-template.md](references/context-template.md) — Context gathering template
- [rules-template.md](references/rules-template.md) — Rules and constraints template
- [verify-template.md](references/verify-template.md) — Verification checklist
- [status-schema.yaml](references/status-schema.yaml) — Status tracking schema

## Rules

- Always read `.ai-factory/config.yaml` first for project settings
- Create plan folder only under `.ai-factory/plans/`
- Never overwrite existing plans — generate unique plan id
- Keep all artifact file names in English
- Generate content in the configured `artifact_language`
- Leave placeholders clearly marked for user review
- Do not start implementation — only create the plan structure

## Example Usage

```
User: "Create a plan for adding dark mode to the UI"
Agent: Creates .ai-factory/plans/add-dark-mode/ with all artifacts
```

```
User: "Мне нужно добавить аутентификацию через OAuth"
Agent: Creates .ai-factory/plans/oauth-auth/ with artifacts in Russian
```

## Integration with Other Skills

| Skill | Relationship |
|-------|--------------|
| `aif-explore` | Exploration output feeds into context.md |
| `aif-implement` | Reads plan artifacts to guide implementation |
| `aif-verify+` | Uses verify.md as verification checklist |
| `aif-done` | Marks plan complete, archives to specs/ |

## Status Workflow

```
draft → exploring → planning → implementing → verifying → fixing → done
                                    ↑_______________|
```

- `draft`: Initial creation
- `exploring`: Research phase (optional)
- `planning`: Refining plan details
- `implementing`: Active implementation
- `verifying`: Running verification
- `fixing`: Addressing verification findings
- `done`: Completed and archived
