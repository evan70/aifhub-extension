# Shared Language Policy

Apply this policy before producing user-facing responses or generated artifacts from AIFHub extension-owned skills, injections, and packaged agents.

## Source Of Truth

- Read `.ai-factory/config.yaml` first when it is available.
- Treat `language.ui`, `language.artifacts`, and `language.technical_terms` as project-level preferences, not global user memory.
- Do not infer or persist project language from OS locale, repository programming language, or the current conversation alone.

## Output Rules

- Use `language.ui` for user-facing responses.
- Use `language.artifacts` for generated or updated artifacts.
- Keep commands, filenames, file paths, code identifiers, JSON keys, YAML keys, package names, and CLI flags in English.
- When `language.technical_terms` is missing or set to `keep`, keep technical terms in English unless an existing artifact already uses a localized term consistently.

## Missing Or Incomplete Config

- If `.ai-factory/config.yaml` is missing or does not contain complete language settings, preserve the current conversation language for the current response only.
- Do not persist inferred language guesses to config, rules, memory, or generated artifacts.
- When creating a durable artifact without explicit language config, prefer the existing project artifact language when one is clearly established.

## Existing Artifacts

- When editing an existing artifact, preserve its established language unless the owning command is creating or replacing the artifact.
- Translate an existing artifact only when the user explicitly asks for translation or the owning workflow explicitly performs a language migration.
- This policy does not expand ownership boundaries: prompts may only create or update artifacts they already own.
