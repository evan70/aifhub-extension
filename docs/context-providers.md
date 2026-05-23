[Previous Page](usage.md) | [Back to Documentation](README.md) | [Next Page](memory-tool-recommendations.md)

# Context Providers

AIFHub may use optional provider output as supporting context when a user has already produced or reviewed it. Providers help agents inspect a project or external documentation, but they do not become AIFHub dependencies, gates, canonical evidence, generated rules input, or runtime requirements.

Provider availability is always degraded behavior: missing tools, missing reports, missing MCP servers, missing API credentials, or unsupported local runtimes must not fail `/aif-explore`, `/aif-plan`, `/aif-review`, `/aif-implement`, `/aif-verify`, `/aif-done`, or any other AIFHub command by themselves.

## Provider Roles

Graphify is the optional repository architecture and relation-discovery provider. It can help identify dependencies, ownership paths, and impact areas before direct repository inspection.

Context7 is the optional documentation provider for current library/API docs. It can help reduce uncertainty around version-sensitive API behavior, framework migration details, and third-party usage patterns.

Both providers are supporting only. Final plans, review findings, generated rules, verification status, done status, and roadmap completion must remain source-grounded in canonical OpenSpec artifacts, source files, tests, runtime state, QA evidence, generated rules trace metadata, or other direct repository evidence.

## AIFHub Boundaries

AIFHub Extension must not:

- install provider CLIs or packages, including `ctx7` or `@upstash/context7-mcp`;
- run provider setup commands;
- start or register provider MCP servers automatically;
- add provider package dependencies or manifest dependencies;
- add Context7 MCP templates to `extension.json`;
- mutate `.mcp.json`, `.cursor/mcp.json`, `.opencode.json`, agent rules, agent skills, or runtime MCP settings for a provider;
- turn provider availability into validation, verification, review, rules, security, done, or commit gates.

Future runtime features such as a `context_provider_suggestion` metadata field may recommend manual provider usage, but they must not change the user-owned setup boundary.

For installed-project diagnostics and metadata-driven recommendations, use:

```bash
ai-factory aifhub-memory-tools recommend --from-project --json
ai-factory aifhub-memory-tools status --json
ai-factory aifhub-memory-tools metadata --json
```

The recommender reads only local installed metadata and must not fetch GitHub or the internet.

## Context7

Use Context7 only when current library/API documentation can materially reduce uncertainty. Common cases include framework version changes, package migration notes, deprecations, generated client APIs, or a review finding that depends on a third-party contract.

Do not install `ctx7` or `@upstash/context7-mcp`, run `ctx7`, run `ctx7 setup`, add Context7 dependencies, add Context7 MCP templates to `extension.json`, or start/register Context7 MCP automatically from AIFHub commands or sidecars.

Manual CLI usage is user-owned. Users may run Context7 with `npx`:

```bash
npx ctx7 library <name> <query>
npx ctx7 docs <libraryId> <query>
```

If the user already installed the CLI, the equivalent commands may be:

```bash
ctx7 library <name> <query>
ctx7 docs <libraryId> <query>
```

The Context7 CLI requires a suitable local Node.js runtime. If `npx ctx7` or `ctx7` is unavailable, too old, unauthenticated, or rate-limited, AIFHub guidance should continue with degraded documentation context.

Context7 library IDs can vary by source and version. Common examples include:

- `/org/project`
- `/org/project/version`
- `/org/project@version`
- `/packages/<name>`
- `/websites/<name>`

Treat exact IDs as provider output, not stable AIFHub schema.

Context7 MCP setup is also user-owned. If a user has already configured a Context7 MCP server, agents may use available MCP tools as optional read-only documentation context. The usual lookup flow is `resolve-library-id` followed by a docs retrieval tool. The docs retrieval tool name may be `get-library-docs` or `query-docs` depending on the Context7 client/server version, so prompt guidance must tolerate both names.

Do not run `ctx7 setup`. That command may write files such as `.mcp.json`, `.cursor/mcp.json`, `.opencode.json`, agent rules, or agent skills. AIFHub guidance may mention this as user-owned setup, but AIFHub commands and sidecars must not execute it or mutate those files.

Allowed durable storage for reviewed Context7 notes:

- `.ai-factory/references/context7/` for project-wide documentation notes.
- `.ai-factory/state/<change-id>/context7/` for change-scoped documentation notes.

A reviewed Context7 note should be concise and include the library name, resolved library ID when known, package version or docs version when known, query, retrieval date, source URL if available, and the short conclusion relevant to the AIFHub task.

Forbidden storage for raw Context7 output, MCP transcripts, API responses, setup output, or generated provider configuration:

- `openspec/changes/<change-id>/`
- `openspec/specs/`
- `.ai-factory/rules/generated/`
- `.ai-factory/qa/<change-id>/`

Do not persist `CONTEXT7_API_KEY`, API keys, tokens, raw authorization headers, credential helper output, private provider diagnostics, private backend diagnostics, or unreviewed sensitive output in `.ai-factory/`, `openspec/`, docs, runtime state, QA evidence, generated rules, or Context7 reference copies.

## Graphify

Graphify remains the optional repository research provider. AIFHub Extension does not require Graphify, does not install `graphifyy`, does not run `graphify`, does not add Graphify to extension dependencies, and does not start or register Graphify MCP automatically.

Manual Graphify usage, outside AIFHub command ownership:

```powershell
uv --version
uv tool install graphifyy
graphify install
graphify .
```

Use `graphify .` in PowerShell; do not prefix it as `/graphify .`.

Allowed durable storage for reviewed Graphify context:

- `.ai-factory/references/graphify/` for project-wide reference copies.
- `.ai-factory/state/<change-id>/graphify/` for change-scoped runtime copies.

Do not store raw Graphify generated files such as `GRAPH_REPORT.md`, `graph.json`, or `graph.html` under `openspec/changes/<change-id>/`, `openspec/specs/`, `.ai-factory/rules/generated/`, or `.ai-factory/qa/<change-id>/`.

See [Usage](usage.md) and [Context Loading Policy](context-loading-policy.md) for command-specific Graphify guidance.
