[Previous Page](context-providers.md) | [Back to Documentation](README.md) | [Next Page](context-loading-policy.md)

# Memory Tool Recommendations

AIFHub uses local recommendation metadata to suggest optional memory and context tools during analysis. The metadata lives in the installed extension, not on GitHub:

```text
.ai-factory/extensions/aifhub-extension/docs/memory-tools-research/recommendation-metadata.yaml
```

When developing this extension itself, the source-tree copy under `docs/memory-tools-research/recommendation-metadata.yaml` may be used.

## Commands

Installed projects should use the wrapper command:

```bash
ai-factory aifhub-memory-tools recommend --from-project --json
ai-factory aifhub-memory-tools recommend --shape large_framework_app --task architecture_or_impact_discovery --json
ai-factory aifhub-memory-tools status --json
ai-factory aifhub-memory-tools metadata --json
```

The wrapper resolves scripts from the installed extension and keeps the user project as the working directory.

## Rules

The recommender is advisory only:

- `rg` remains the baseline for exact file and symbol lookup.
- Tools are explicit opt-in only.
- Missing tools are degraded context, not command failure.
- Provider output is supporting context only, never canonical OpenSpec evidence.
- AIFHub must not auto-install tools, run setup, index source, sync memory, register MCP servers, install hooks, start daemons, or write provider output.

## Tool Decisions

Allowed recommendations:

- `rg`: baseline search.
- Graphify: optional repo graph for large framework, legacy, and multirepo impact discovery after baseline `rg`.
- `codex-agent-mem`: optional read-only continuity memory with an explicit SQLite DB path.
- `context-mode`: manual temporary index for explicit generated output or large command output.
- Context7: optional docs provider for version-sensitive library/API questions.
- `agent-memory`: manual notes only when the user explicitly asks for durable notes.

Not recommended by default:

- `codex-mem`: default scope may ingest broad Codex history.
- `eagle-mem`: scoped read and purge behavior is not proven.

## Safe Status Probes

`ai-factory aifhub-memory-tools status --json` may run only local, non-mutating probes:

- `rg --version`
- `uv --version`
- `graphify --version` or `graphify --help`
- `codex-agent-mem-policy --help` or `codex-agent-mem-smoke --help`
- `context-mode doctor`
- `ctx7 --version` or `npx --no-install ctx7 --help` only when `--check-docs-provider` is passed

These probes must not install packages, create indexes, run setup, register MCP servers, write hooks, or start background processes.

## Analyze Output

`/aif-analyze` should summarize recommendations like this:

```text
Optional local tools:

Baseline:
- rg: use for exact file/symbol lookup.

Recommended:
- Graphify: useful for broad architecture/impact discovery in this large framework project.
  Status: installed/not installed/unknown
  Read scope: explicit project path
  Purge: delete graphify-out/
  Note: supporting context only, not OpenSpec evidence.

Not recommended:
- codex-mem: broad Codex history scope can cross project boundaries.
- eagle-mem: scoped read and purge not proven.
```

If metadata is unavailable, `/aif-analyze` should report a degraded note and continue with `rg` as the baseline.
