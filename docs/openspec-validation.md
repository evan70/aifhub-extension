[Previous Page](openspec-compatibility.md) | [Back to Documentation](README.md) | [Next Page](spec-coverage.md)

# OpenSpec Artifact Validation

`scripts/openspec-artifact-validator.mjs` is the read-only AIFHub contract validator for OpenSpec-native artifacts.

It does not replace the OpenSpec CLI. The OpenSpec CLI validates OpenSpec syntax and archive behavior. This validator checks AIFHub workflow ownership: canonical change artifacts stay under `openspec/changes/<change-id>/`, runtime state stays under `.ai-factory/state/<change-id>/`, QA evidence stays under `.ai-factory/qa/<change-id>/`, and generated rules stay under `.ai-factory/rules/generated/`.

## Usage

Run the validator directly:

```bash
node scripts/openspec-artifact-validator.mjs --change <change-id> --json
```

Require verification evidence for finalization readiness:

```bash
node scripts/openspec-artifact-validator.mjs --change <change-id> --require-verification-evidence --json
```

Exit codes:

| Code | Meaning |
|---|---|
| `0` | Contract status is `pass` or `warn` |
| `1` | Contract status is `fail` |
| `2` | Invalid arguments or unresolved change |

## JSON Contract

The output shape is stable:

```json
{
  "schema_version": 1,
  "validator": "aifhub-openspec-artifact-contract",
  "change_id": "add-oauth-login",
  "status": "pass",
  "blocking": false,
  "checks": [
    {
      "id": "delta-specs-present",
      "status": "pass",
      "path": "openspec/changes/add-oauth-login/specs/auth/spec.md",
      "message": "Found 1 OpenSpec delta spec file(s)."
    }
  ],
  "suggested_next": null
}
```

`status` is `pass`, `warn`, or `fail`. `blocking` is true only for `fail`.

## Checks

The validator checks:

| Check | Result |
|---|---|
| `proposal.md` and `tasks.md` exist | `fail` when missing |
| `design.md` exists | `warn` when missing, or `fail` when `aifhub.openspec.requireDesign: true` |
| `specs/**/spec.md` delta exists | `fail` unless `proposal.md` has an explicit docs/tooling-only `skip-specs` reason |
| runtime or evidence files inside `openspec/changes/<change-id>/` | `fail` |
| `.ai-factory/qa/<change-id>/openspec-validation.json` and `verify.md` | required only with `--require-verification-evidence` |
| final verify `aif-gate-result` block | `fail` when verification evidence is required and the block is missing, invalid, or failing |
| generated rules under `.ai-factory/rules/generated/` | `warn` when missing or stale |
| supplied changed paths under `openspec/specs/**` | `fail` unless direct base spec mutation is explicitly allowed |

Generated-rule warnings suggest:

```text
/aif-mode sync --change <change-id>
```

Missing verification evidence suggests:

```text
/aif-verify <change-id>
```

## Integrations

`/aif-mode doctor --change <change-id>` includes the full validator result in JSON as `artifactContract` and adds a human diagnostic line. Doctor requires verification evidence because it is a pre-archive readiness check.

`/aif-done` runs the validator with verification evidence required and refuses to archive when the validator returns `fail`.

`/aif-verify` still writes validation/status/verify evidence under `.ai-factory/qa/<change-id>/` and does not archive. It also writes the separate OpenSpec coverage matrix described in [OpenSpec Coverage Matrix](spec-coverage.md).

## Read-Only Boundary

The validator never:

- runs the OpenSpec CLI
- archives a change
- writes canonical specs
- writes generated rules
- writes QA evidence
- moves files between `openspec/changes` and archives

Use `/aif-mode sync --change <change-id>` to regenerate derived rules and `/aif-done` to archive after passing verification.

## See Also

- [OpenSpec Compatibility](openspec-compatibility.md)
- [OpenSpec Coverage Matrix](spec-coverage.md)
- [Usage](usage.md)
- [Active Change Resolver](active-change-resolver.md)
