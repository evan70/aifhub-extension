## AIFHub OpenSpec-native Override

Apply this block before the upstream `aif-explore` body. When any rule below conflicts with the base skill text, this block wins.

Follow `skills/shared/LANGUAGE-POLICY.md` before producing user-facing responses or generated artifacts.

### Goal

Keep `/aif-explore` as a research-oriented command while making the extension aware of OpenSpec-native artifact ownership.

### Mode Detection

Before resolving exploration inputs, read `.ai-factory/config.yaml` when it exists.

- If the config contains `aifhub.artifactProtocol: openspec`, use **OpenSpec-native mode**.
- Otherwise, use **Legacy AI Factory-only mode**.
- If the config is missing, continue with Legacy AI Factory-only mode and state that no OpenSpec-native protocol was detected.

### OpenSpec-native mode

When `.ai-factory/config.yaml` declares `aifhub.artifactProtocol: openspec`, `/aif-explore` is research-oriented and must not create canonical OpenSpec change artifacts.

Use shared vocabulary consistently: `OpenSpec-native mode`, `canonical OpenSpec change`, `active change`, `change-id`, `base specs`, `delta specs`, `generated rules`, `runtime state`, `QA evidence`, and `legacy AI Factory-only mode`.

Allowed read context:

- `.ai-factory/config.yaml`
- `.ai-factory/DESCRIPTION.md`
- `.ai-factory/ARCHITECTURE.md`
- `.ai-factory/RESEARCH.md`
- `openspec/specs/**`
- `openspec/changes/<change-id>/**`
- `.ai-factory/state/<change-id>/`
- optional reviewed Graphify outputs such as `graphify-out/GRAPH_REPORT.md`, `graphify-out/graph.json`, `.ai-factory/references/graphify/GRAPH_REPORT.md`, and `.ai-factory/state/<change-id>/graphify/GRAPH_REPORT.md`
- optional reviewed Context7 notes under `.ai-factory/references/context7/` and `.ai-factory/state/<change-id>/context7/`

Enabled optional tool use:

- Before using any optional provider, call the installed wrapper when available: `ai-factory aifhub-memory-tools select --from-project --command aif-explore --json`.
- The wrapper reads `utilities.context_tools.enabled`, compatibility utility flags, local `recommendation-metadata.yaml`, command-specific `tool_permissions`, and project/task signals.
- Use only entries returned in `selected_tools`. For each selected entry, follow its `tool_id`, `permission`, `execution`, `forbidden_operations`, `protected_artifacts`, read scope, purge path, and privacy caveat.
- Do not use tools that are absent from `selected_tools`, including tools listed in `not_selected_tools`, tools missing from config, tools forbidden for `/aif-explore`, or tools whose execution guidance is unavailable.
- If no optional provider is selected, continue with the rg baseline and source/OpenSpec evidence.
- Optional provider output is supporting context only; conclusions must remain grounded in source files, canonical OpenSpec artifacts, generated rules, runtime state, QA evidence, or other direct repository evidence.

Optional Graphify context:

- This provider-specific boundary applies only when `selected_tools` includes Graphify, or when reading already reviewed Graphify output that exists in an allowed context path.
- Graphify is optional supporting context for large repository architecture/relation discovery.
- `/aif-explore` may recommend that the user run Graphify manually outside AIFHub command ownership only when the selection output allows Graphify, but it must not install `graphifyy`, run `graphify`, add Graphify dependencies, or start/register Graphify MCP automatically.
- Missing Graphify or missing `graphify-out/GRAPH_REPORT.md` is degraded context, not an exploration failure.
- When existing Graphify output is available, treat extracted, inferred, ambiguous, or confidence-labeled relationships as hypotheses for direct repository inspection.
- Research conclusions must remain grounded in source files, canonical OpenSpec artifacts, generated rules, runtime state, QA evidence, or other direct repository evidence.
- Project-wide reviewed Graphify copies belong under `.ai-factory/references/graphify/`; change-scoped reviewed copies belong under `.ai-factory/state/<change-id>/graphify/`.
- Do not store Graphify generated files such as `GRAPH_REPORT.md`, `graph.json`, or `graph.html` under `openspec/changes/<change-id>/`, `openspec/specs/`, `.ai-factory/rules/generated/`, or `.ai-factory/qa/<change-id>/`.
- Do not persist API keys, tokens, raw authorization headers, credential helper output, private backend diagnostics, or unreviewed sensitive output in `.ai-factory/`, `openspec/`, docs, runtime state, QA evidence, generated rules, or Graphify reference copies.

Optional Context7 context:

- This provider-specific boundary applies only when `selected_tools` includes Context7, or when reading already reviewed Context7 notes that exist in an allowed context path.
- Context7 is optional supporting documentation context for current library/API docs.
- `/aif-explore` may recommend that the user run Context7 manually outside AIFHub command ownership only when the selection output allows Context7, with commands such as `npx ctx7 library <name> <query>` and `npx ctx7 docs <libraryId> <query>`, or user-installed equivalents `ctx7 library <name> <query>` and `ctx7 docs <libraryId> <query>`.
- Missing Context7, missing Node.js runtime support, missing provider access, or missing reviewed notes is degraded context, not an exploration failure.
- If the user already configured Context7 MCP, available tools may include `resolve-library-id` plus a docs retrieval tool named `get-library-docs` or `query-docs`; use them only as optional read-only documentation context.
- Do not install `ctx7` or `@upstash/context7-mcp`, run `ctx7`, run `ctx7 setup`, add Context7 dependencies or manifest entries, add Context7 MCP templates to `extension.json`, mutate `.mcp.json`, `.cursor/mcp.json`, `.opencode.json`, agent rules, or agent skills, or start/register Context7 MCP automatically.
- Treat Context7 output as supporting context only; research conclusions must remain source-grounded in source files, canonical OpenSpec artifacts, generated rules, runtime state, QA evidence, or other direct repository evidence.
- Reviewed project-wide Context7 notes belong under `.ai-factory/references/context7/`; reviewed change-scoped Context7 notes belong under `.ai-factory/state/<change-id>/context7/`.
- Do not store raw Context7 output, MCP transcripts, API responses, setup output, or generated provider configuration under `openspec/changes/<change-id>/`, `openspec/specs/`, `.ai-factory/rules/generated/`, or `.ai-factory/qa/<change-id>/`.
- Do not persist `CONTEXT7_API_KEY`, API keys, tokens, raw authorization headers, credential helper output, private provider diagnostics, private backend diagnostics, or unreviewed sensitive output in `.ai-factory/`, `openspec/`, docs, runtime state, QA evidence, generated rules, or Context7 reference copies.

Canonical OpenSpec change files under an active change are only:

- `openspec/changes/<change-id>/proposal.md`
- `openspec/changes/<change-id>/design.md`
- `openspec/changes/<change-id>/tasks.md`
- `openspec/changes/<change-id>/specs/**/spec.md`

Write boundaries:

- Write research output only to `.ai-factory/RESEARCH.md` or runtime notes under `.ai-factory/state/<change-id>/`.
- Valid runtime note targets include `.ai-factory/state/<change-id>/explore.md` and `.ai-factory/state/<change-id>/research-notes.md`.
- Do not create non-OpenSpec files under `openspec/changes/<change-id>/`.
- Do not write debug files, summaries, research notes, validation evidence, or runtime-only files under an OpenSpec change folder.
- If no change ID is known, write only to `.ai-factory/RESEARCH.md` and report that no change-scoped runtime path was selected.

Response and next-step guidance:

- Report where research was written in the normal response.
- Distinguish research output from canonical OpenSpec artifacts.
- Report the selected active change and runtime state path when change-scoped research was used.
- If generated rules or QA evidence were inspected, name those paths in the normal response.
- Suggest `/aif-plan full "<request>"` for new work that needs canonical change artifacts.
- Suggest `/aif-improve <change-id>` for refining an existing OpenSpec-native change.
- Suggest `/aif-implement <change-id>` only after an OpenSpec-native plan is ready for execution.
- Do not suggest deprecated `*-plus` aliases.
- Do not install OpenSpec skills or slash commands.

### Legacy AI Factory-only mode

When OpenSpec-native mode is not enabled, preserve the extension's companion plan behavior:

- Treat `.ai-factory/plans/<plan-id>.md` and `.ai-factory/plans/<plan-id>/` as one active plan pair.
- If `@path` points to the plan file, the plan folder, or one of its local artifacts (`task.md`, `context.md`, `rules.md`, `verify.md`, `status.yaml`, `explore.md`), resolve the whole pair before continuing.
- Persist exploration only to `config.paths.research` / `.ai-factory/RESEARCH.md`.
- Do not treat `DESCRIPTION.md`, `ARCHITECTURE.md`, `ROADMAP.md`, or `RULES.md` as writable from explore mode in this extension workflow.
- For next steps, prefer:
  - `/aif-plan full "<task>"` for new work
  - `/aif-improve <plan-id>` for plan refinement
  - `/aif-implement <plan-id>` for execution
- If a legacy folder-only plan is detected, present the canonical next step using the normalized plan id and companion plan-file model.

### Codex Runtime

When running in Codex app/CLI:

- The planning stage (`/aif-explore`, `/aif-plan full`, `/aif-improve`) should run in Codex Plan mode when structured clarifying questions are needed.
- This skill may recommend Plan mode, but it does not attempt or promise to switch the Codex session mode. The user controls the mode.
- In Codex Plan mode, use `request_user_input` only for 1-3 short questions.
- In Codex Default mode, if a question is needed, ask it as plain text in the assistant message. Do not use `question(...)`, `questionnaire(...)`, or `request_user_input`.
- If another CLI or IDE runtime exposes a planning mode, use that available planning-mode mechanism for structured planning questions; do not fabricate unavailable tools or client actions.
- In autonomous or subagent mode, do not ask interactive questions. Record assumptions and return blockers/open questions to the parent.
- See `skills/shared/QUESTION-TOOL.md` for the full runtime question format mapping.
