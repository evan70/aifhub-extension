[Previous Page](openspec-validation.md) | [Back to Documentation](README.md) | [Next Page](legacy-plan-migration.md)

# OpenSpec Coverage Matrix

`scripts/openspec-coverage-matrix.mjs` builds a deterministic coverage artifact for OpenSpec-native verification:

```text
OpenSpec requirement -> task -> implementation evidence -> tests -> rules gate
```

The matrix is runtime QA evidence. It is written to `.ai-factory/qa/<change-id>/coverage.json` and never into `openspec/changes/<change-id>/`.

## Usage

Build and write coverage for one change:

```bash
node scripts/openspec-coverage-matrix.mjs --change <change-id> --write --json
```

Policy can be selected explicitly:

```bash
node scripts/openspec-coverage-matrix.mjs --change <change-id> --policy strict --write --json
node scripts/openspec-coverage-matrix.mjs --change <change-id> --policy normal --write --json
```

Exit codes:

| Code | Meaning |
|---|---|
| `0` | Coverage status is `pass` or `warn` |
| `1` | Coverage status is `fail` |
| `2` | Invalid arguments or unresolved change |

## JSON Contract

The output shape is stable:

```json
{
  "schema_version": 1,
  "change_id": "add-oauth-login",
  "status": "pass",
  "blocking": false,
  "policy": {
    "mode": "strict",
    "missing_requirement": "fail"
  },
  "requirements": [
    {
      "id": "auth.login-success",
      "source": "openspec/changes/add-oauth-login/specs/auth/spec.md",
      "status": "covered",
      "tasks": ["1.1", "1.2"],
      "implementation_evidence": [
        "src/auth/login.ts",
        "src/auth/session.ts"
      ],
      "test_evidence": [
        "tests/auth/login.test.ts"
      ],
      "rules_gate": "pass"
    }
  ],
  "summary": {
    "covered": 1,
    "partial": 0,
    "missing": 0,
    "not_applicable": 0
  },
  "sources": [
    {
      "path": "openspec/changes/add-oauth-login/specs/auth/spec.md",
      "sha256": "..."
    }
  ],
  "stale": false
}
```

Requirement `status` is one of `covered`, `partial`, `missing`, or `not-applicable`. Top-level `status` is `pass`, `warn`, or `fail`.

## Policy

The default policy follows `workflow.verify_mode` from `.ai-factory/config.yaml`; missing config falls back to `normal`.

| Condition | Strict | Normal |
|---|---|---|
| Missing requirement coverage | `fail` | `warn` |
| Partial requirement coverage | `warn` | `warn` |
| Rules gate failure | `fail` | `fail` |
| Stale coverage artifact | finalization failure | finalization failure |

`/aif-verify` writes `coverage.json` and includes the coverage summary in `verify.md`. Missing requirement coverage makes the final verify gate `fail` in strict mode and `warn` in normal mode.

`/aif-mode doctor --change <change-id>` reads the latest coverage artifact and reports missing, stale, failed, warning, or passing coverage diagnostics.

`/aif-done` requires a current coverage artifact. It refuses missing, invalid, stale, or failed coverage. A `warn` coverage matrix is accepted when the policy produced a non-blocking warning.

## Evidence Sources

The matrix uses:

- OpenSpec delta requirements from `openspec/changes/<change-id>/specs/**/spec.md`
- task checklist entries from `openspec/changes/<change-id>/tasks.md`
- implementation and fix traces under `.ai-factory/state/<change-id>/`
- generated rules state from `.ai-factory/rules/generated/`
- optional existing verification evidence under `.ai-factory/qa/<change-id>/verify.md`

Each material source gets a SHA-256 fingerprint. If any fingerprint changes, the matrix is stale and `/aif-done` requires rerunning `/aif-verify <change-id>`.

## See Also

- [Usage](usage.md)
- [OpenSpec Artifact Validation](openspec-validation.md)
- [OpenSpec Compatibility](openspec-compatibility.md)
- [Active Change Resolver](active-change-resolver.md)
