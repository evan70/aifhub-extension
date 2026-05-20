[Back to README](../README.md) | [Next Page](usage.md)

# Documentation

This documentation explains the AIFHub Extension v1 workflow:

```text
AI Factory UX + OpenSpec artifact protocol
```

OpenSpec-native artifacts under `openspec/` are canonical. AI Factory artifacts under `.ai-factory/` hold runtime state, QA evidence, generated rules, and legacy migration input.

OpenSpec CLI features are reached through AIFHub wrappers and `scripts/openspec-runner.mjs`; OpenSpec skills or slash commands are not installed by the extension.

## Reading Order

1. [Project README](../README.md) for the landing page, quick start, artifact layout, compatibility summary, migration summary, and troubleshooting summary.
2. [Usage](usage.md) for the full command flow, `/aif-mode` switching and sync, rules/review/security gates, verification/fix/finalization tail, commit/evolve handoff, OAuth example, troubleshooting, and smoke checks.
3. [Context Loading Policy](context-loading-policy.md) for consumer context, optional Graphify context guidance, GitHub-aware roadmap evidence, ownership boundaries, generated rules, quality gates, commit handoff, and legacy path rules.
4. [OpenSpec Compatibility](openspec-compatibility.md) for optional CLI adapter support, artifact sync points, rules gate behavior, Node requirements, validation policy flags, and degraded mode.
5. [OpenSpec Artifact Validation](openspec-validation.md) for the AIFHub contract validator layered over OpenSpec CLI validation.
6. [OpenSpec Coverage Matrix](spec-coverage.md) for requirement-to-task-to-code coverage evidence and verify/done policy.
7. [Legacy Plan Migration](legacy-plan-migration.md) if existing `.ai-factory/plans` artifacts need to move into OpenSpec-native changes.
8. [Active Change Resolver](active-change-resolver.md) for active change selection, runtime paths, current pointer behavior, and ambiguity diagnostics.
9. [Handoff Validation Profile](handoff-validation-profile.md) for the read-only orchestration summary contract.
10. [ADR 0001](adr/0001-openspec-native-artifact-protocol.md) for the v1 artifact ownership decision.

The remaining runtime-specific guides are supporting references:

- [AIFHub MCP](aifhub-mcp.md)
- [Codex Agents](codex-agents.md)
- [Claude Agents](claude-agents.md)
- [Codex Plan Mode](codex-plan-mode.md)
- [Handoff Naming](handoff.md)
- [Handoff Validation Profile](handoff-validation-profile.md)

## Guides

| Guide | Purpose |
|---|---|
| [Usage](usage.md) | Full OpenSpec-native command flow, optional Graphify context, gates, finalization tail, commit, and examples |
| [Context Loading Policy](context-loading-policy.md) | Runtime context, optional Graphify context, GitHub-aware roadmap evidence, ownership, gates, commit handoff, and legacy boundaries |
| [OpenSpec Compatibility](openspec-compatibility.md) | CLI adapter policy, validation policy flags, sync points, rules gate, version support, and degraded mode |
| [OpenSpec Artifact Validation](openspec-validation.md) | Read-only AIFHub contract validator for canonical artifacts, runtime evidence, QA, and generated rules |
| [OpenSpec Coverage Matrix](spec-coverage.md) | Requirement-to-task-to-code coverage evidence, policy, staleness, and integration points |
| [Legacy Plan Migration](legacy-plan-migration.md) | Explicit migration commands and artifact mapping |
| [Active Change Resolver](active-change-resolver.md) | Active change selection and runtime paths |
| [Handoff Validation Profile](handoff-validation-profile.md) | Read-only validation summary contract for Handoff orchestration |
| [ADR 0001](adr/0001-openspec-native-artifact-protocol.md) | Canonical OpenSpec and AI Factory runtime state contract |
| [AIFHub MCP](aifhub-mcp.md) | Optional MCP server tools and runtime-specific config shapes |
| [Codex Agents](codex-agents.md) | Namespaced Codex subagents and invocation contract |
| [Claude Agents](claude-agents.md) | Namespaced Claude subagents and install target |
| [Codex Plan Mode](codex-plan-mode.md) | Codex mode and question-format guidance |
| [Handoff Naming](handoff.md) | Stage vocabulary versus public CLI commands |

## Scope

This docs set covers:

- OpenSpec-native v1 workflow
- artifact mode switching and sync through `/aif-mode`
- command reads, writes, and forbidden writes
- optional Graphify context provider guidance
- optional rules, review, and security gates
- verification, fix, done, post-archive sync, commit, and evolve handoff
- OpenSpec requirement coverage evidence and policy
- canonical OpenSpec artifact ownership
- AI Factory runtime state, QA evidence, and generated rules
- legacy AI Factory-only compatibility and migration
- runtime-managed Codex and Claude agent files
- optional AIFHub MCP server registration and runtime-specific settings shapes

It does not document `.ai-factory/plans` as the normal v1 artifact model. Those paths are legacy compatibility and migration input only.

## Local Checks

Run:

```bash
npm run validate
npm test
```

`npm run validate` checks markdown links under `docs/`, `injections/`, and `skills/`. Root `README.md` links need a manual check when edited.

## See Also

- [Project README](../README.md)
- [Usage](usage.md)
- [Context Loading Policy](context-loading-policy.md)
- [OpenSpec Compatibility](openspec-compatibility.md)
- [OpenSpec Artifact Validation](openspec-validation.md)
- [OpenSpec Coverage Matrix](spec-coverage.md)
- [Legacy Plan Migration](legacy-plan-migration.md)
- [Active Change Resolver](active-change-resolver.md)
- [Handoff Validation Profile](handoff-validation-profile.md)
- [ADR 0001](adr/0001-openspec-native-artifact-protocol.md)
- [AIFHub MCP](aifhub-mcp.md)
