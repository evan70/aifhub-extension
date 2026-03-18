# DESCRIPTION Template (Deprecated in aif-analyze)

This reference is kept for backward compatibility only.

`aif-analyze` does NOT create or update `.ai-factory/DESCRIPTION.md`.

## Ownership

- `DESCRIPTION.md` is owned by core `/aif`
- `aif-analyze` owns only `config.yaml` and `rules/base.md`

## Current Behavior

- If `.ai-factory/DESCRIPTION.md` is missing, `aif-analyze` must guide the user to run `/aif`
- `aif-analyze` must not generate DESCRIPTION content from this template

## Note

If project description generation is required, use core `/aif` workflow.
