# Rules Gate

```aif-gate-result
{
  "schema_version": 1,
  "gate": "rules",
  "status": "fail",
  "blocking": true,
  "blockers": [
    {
      "id": "fixture-rule-violation",
      "severity": "error",
      "file": "src/auth/login.ts",
      "summary": "Fixture intentionally violates generated rule guidance."
    }
  ],
  "affected_files": [
    "src/auth/login.ts"
  ],
  "suggested_next": null
}
```
