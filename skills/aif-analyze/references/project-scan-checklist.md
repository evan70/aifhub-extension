# Project Scan Checklist

Use this order to keep the analysis evidence-based and repeatable.

## Root Structure

Check the repository root for technology markers:

- `package.json` -> Node.js or JavaScript ecosystem
- `composer.json` -> PHP ecosystem
- `requirements.txt` or `pyproject.toml` -> Python ecosystem
- `go.mod` -> Go
- `Cargo.toml` -> Rust
- `pom.xml` or `build.gradle` -> Java
- `Dockerfile`, `compose.yml`, `docker-compose.yml` -> containerization
- `.github/workflows/`, `.gitlab-ci.yml`, `Jenkinsfile` -> CI/CD

## Application Directories

Look for the main working areas:

- `src/`, `app/`, `lib/`, `api/`
- `tests/`, `spec/`, `__tests__/`
- `docs/`, `config/`
- `migrations/`, `prisma/`, `db/`

## Optional Tool Recommendation Signals

Classify project shape from evidence, not from repository name:

- `small_microservice`: small file count, one service manifest, narrow source tree, exact `rg` lookup is likely enough.
- `go_service`: `go.mod` plus service-style packages or integrations; use baseline `rg` first.
- `large_framework_app`: framework markers such as `app/`, `src/`, routes/controllers/components, build config, and enough files that broad impact search may be noisy.
- `multirepo`: multiple manifests, workspace markers, or coordinated component directories.
- `large_legacy`: very large file count, mixed older layouts, dense integrations, and noisy literal search.

Detect task signals from the user's request and analysis context:

- `exact_file_or_symbol_lookup`: user asks for a known file, symbol, config key, or literal string.
- `architecture_or_impact_discovery`: user asks for architecture, dependencies, impact, ownership, or broad codebase understanding.
- `multirepo_surface_mapping`: user asks how multiple packages/repos/components connect.
- `resume_previous_work`: user asks to resume, continue, or recover previous session context.
- `open_work_or_completion_check`: user asks what remains open or whether work is complete.
- `large_command_output_compression`: analysis output is too large and needs temporary retrieval/compression.
- `version_sensitive_library_docs`: answer depends on current library/API docs, migrations, or deprecations.
- `manual_durable_notes`: user explicitly asks for durable manual notes.

Always keep `rg` as the baseline. Optional memory/context tools may only be recommended through local metadata and explicit opt-in.

## Source Control

Use git only to confirm repository state and remotes:

- `git rev-parse --is-inside-work-tree`
- `git remote -v`

Do not infer maturity from commit history alone.

## Existing AI Context

Read these files first when they exist:

- `.ai-factory/DESCRIPTION.md`
- `.ai-factory/ARCHITECTURE.md`
- `.ai-factory/ROADMAP.md`
- `.ai-factory/RULES.md`
- `AGENTS.md`
- `CLAUDE.md`

## Evidence Rules

- Prefer manifests, source files, configs, and generated outputs over README claims.
- Call out unclear areas explicitly instead of filling gaps with assumptions.
- Mention only integrations, security-sensitive areas, and modules that the repository actually shows.
