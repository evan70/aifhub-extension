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

Doctor also reports `effectivePolicy` from `scripts/openspec-policy.mjs`, including CLI, generated-rules, rules-gate, spec-coverage, and `allowWarnOnDone` settings. Human diagnostics show whether missing or warning evidence is only degraded or blocking under the current policy.

`/aif-done` runs `scripts/openspec-done-readiness.mjs` before archive and writes `.ai-factory/qa/<change-id>/done-readiness.json`. The readiness gate checks OpenSpec validate, OpenSpec status, artifact contract, generated rules freshness, rules gate evidence, coverage, verify gate evidence, and dirty workspace state. Blocking failures refuse archive and include an exact suggested next command, such as `/aif-mode sync --change <change-id>`, `/aif-rules-check`, or `/aif-verify <change-id>`.

The readiness gate runs the artifact validator with verification evidence required and refuses to archive when the validator returns `fail` or blocking `warn`.

`/aif-verify` still writes validation/status/verify evidence under `.ai-factory/qa/<change-id>/` and does not archive. It also writes the separate OpenSpec coverage matrix described in [OpenSpec Coverage Matrix](spec-coverage.md).

## Done Readiness

Run the pre-archive gate directly when diagnosing `/aif-done` refusal:

```bash
node scripts/openspec-done-readiness.mjs --change <change-id> --json
```

It writes `.ai-factory/qa/<change-id>/done-readiness.json` unless `--no-write` is passed. Exit codes are `0` for `pass` or policy-accepted `warn`, `1` for blocking readiness failure, and `2` for invalid arguments or unresolved changes.

Stable JSON fields:

```json
{
  "schema_version": 1,
  "gate": "done-readiness",
  "change_id": "add-oauth-login",
  "status": "pass",
  "blocking": false,
  "checks": {
    "openspec_validate": "pass",
    "openspec_status": "pass",
    "artifact_contract": "pass",
    "generated_rules": "pass",
    "rules_gate": "pass",
    "coverage": "pass",
    "verify_gate": "pass",
    "dirty_workspace": "pass"
  },
  "diagnostics": [],
  "suggested_next": null
}
```

Each diagnostic includes `check`, `level`, `blocking`, `code`, `message`, optional `path`, and optional `suggested_next`.

Readiness checks:

| Check | Blocking behavior |
|---|---|
| `openspec_validate` | blocks when required OpenSpec validation fails or done policy requires an unavailable CLI |
| `openspec_status` | blocks only when status is unavailable or warning and `allowWarnOnDone.openspecStatus` is false |
| `artifact_contract` | requires aggregate artifact contract `pass` before archive |
| `generated_rules` | blocks stale or missing generated rules when `requireGeneratedRulesForDone` is true |
| `rules_gate` | blocks missing, failed, or disallowed warning rules evidence when `requireRulesPassForDone` is true |
| `coverage` | blocks missing, stale, failed, or disallowed warning coverage when `requireSpecCoverageForDone` is true |
| `verify_gate` | blocks missing, invalid, failed, or ambiguous final verify gate evidence |
| `dirty_workspace` | blocks uncommitted changes unless explicit dirty-state recording is enabled |

Policy is intentionally stricter for done than verify. Verify can run degraded when CLI, generated rules, rules gate, or coverage evidence is unavailable unless the matching verify flag is true. Done requires archive readiness and applies `allowWarnOnDone` before accepting warning-only rules, coverage, or OpenSpec status.

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
