# AI Tester Token Matrices: Python OpenSpec All Tools

Источник таблиц - `ai-tester` trace JSON из sanitized local fixture. Durable docs фиксируют labels и агрегированные метрики; raw traces остаются в локальном state.

Raw artifacts:

- `.ai-factory/state/ai-tester-matrix-for-memory-tool-metadata/model-gen-all-tools-grouped-clean-20260528-212755/matrix-summary.json`
- `.ai-factory/state/ai-tester-matrix-for-memory-tool-metadata/model-gen-all-tools-grouped-clean-20260528-212755/ai-tester-token-matrices.json`
- `.ai-factory/state/ai-tester-matrix-for-memory-tool-metadata/model-gen-all-tools-grouped-clean-20260528-212755/ai-tester-token-matrices.md`

## Project Labels

| Dimension | Value | Evidence |
|---|---|---|
| language | `python` | Python markers: `core/dedupe.py`, `core/embedder.py`, `core/kb_worker.py`, `core/loader.py`, `core/model_config.py`, `core/model_loader.py`, `core/processor.py` |
| volume | `standard` | 143 scanned files by label helper; sanitized ai-tester fixture copied 198 files after ignore rules |
| complexity | `framework` | Framework-sized Python project with manifests and multiple core modules |
| repo shape | `single_repo` | no workspace or multirepo markers |
| artifact mode | `openspec_native` | `openspec/config.yaml`, `openspec/specs/document-ingest/spec.md` |
| project shape | `large_framework_app` | Python manifests `pyproject.toml`, `requirements.txt` plus framework-sized source layout |

Sanitizer excluded AI/IDE/agent and dependency/runtime files, including `.claude`, `.agents`, `.idea`, `.vscode`, `.venv`, `.uv-cache`, caches, logs, `.gitignore`-ignored generated files, `.dockerignore` patterns, lock files, and `.env*`.

## Matrix Summary

| Metric | Value |
|---|---:|
| Skills | 10 |
| Optional tools | 5 |
| Total rows | 100 |
| Executed rows | 100 |
| PASS rows | 100 |
| FAIL rows | 0 |
| NOT_RUN rows | 0 |
| Trace files read | 616 |

Representative skills: `aif-analyze`, `aif-explore`, `aif-plan`, `aif-implement`, `aif-fix`, `aif-review`, `aif-rules-check`, `aif-verify`, `aif-docs`, `aif-commit`.

## Expectation Counts

`tool_run` is not always actual tool usage. For `negative` and `not_applicable` rows, ai-tester verifies that the tool is not used even when it is enabled in config. Token wins in those rows are policy-enforcement noise, not evidence that the tool helped.

| Tool | rg baseline | positive usage | negative policy | not applicable |
|---|---:|---:|---:|---:|
| CodeGraph | 10 | 2 | 8 | 0 |
| Graphify | 10 | 0 | 6 | 4 |
| Context7 | 10 | 0 | 5 | 5 |
| context-mode | 10 | 0 | 8 | 2 |
| codex-agent-mem | 10 | 0 | 7 | 3 |

## Positive Usage Rows

Only CodeGraph had positive usage rows for this label set. Both lost to `rg`.

### CodeGraph + aif-analyze

| run | status | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens |
|---|---|---:|---:|---:|---:|---:|---:|
| `rg baseline` | PASS | 152.0s | 50 | 2,487,995 | 1,275,389 | 10,174 | 1,285,563 |
| `codegraph tool_run` | PASS | 360.9s | 67 | 5,180,258 | 2,628,729 | 20,841 | 2,649,570 |

| Metric | CodeGraph delta vs rg |
|---|---:|
| duration | +137.4% |
| tool calls | +34.0% |
| total tokens | +108.2% |
| input+output tokens | +106.1% |

### CodeGraph + aif-explore

| run | status | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens |
|---|---|---:|---:|---:|---:|---:|---:|
| `rg baseline` | PASS | 101.8s | 14 | 967,038 | 484,303 | 5,679 | 489,982 |
| `codegraph tool_run` | PASS | 179.3s | 42 | 2,339,882 | 1,180,137 | 11,585 | 1,191,722 |

| Metric | CodeGraph delta vs rg |
|---|---:|
| duration | +76.1% |
| tool calls | +200.0% |
| total tokens | +142.0% |
| input+output tokens | +143.2% |

## Policy Enforcement Rows

| Tool | Result | Interpretation |
|---|---|---|
| Graphify | 10/10 PASS, 0 positive usage rows | Selector/policy kept Graphify out of architecture discovery for this profile. No token/time usefulness evidence for this label set. |
| Context7 | 10/10 PASS, 0 positive usage rows | No explicit library/API/version question was present, so Context7 correctly stayed out. |
| context-mode | 10/10 PASS, 0 positive usage rows | It stayed limited to large generated-output use cases; source discovery did not select it. |
| codex-agent-mem | 10/10 PASS, 0 positive usage rows | No prior memory DB / continuity task, so it correctly stayed out. |

## Conclusions

For labels `python`, `standard`, `framework`, `single_repo`, `openspec_native`, `large_framework_app` and task `architecture_or_impact_discovery`:

- `rg` remains the only recommended baseline.
- CodeGraph should not be selected for `aif-analyze` or `aif-explore`: both positive rows were slower and used more tokens.
- Graphify should not be selected automatically; keep only `explicit_graph_quality_experiment`.
- Context7 should be selected only for explicit `version_sensitive_library_docs`, not for project labels alone.
- context-mode should remain a helper for already-large generated output, not source/project discovery.
- codex-agent-mem should remain continuity-only: `resume_previous_work`, `open_work_or_completion_check`, or explicit prior memory DB.
