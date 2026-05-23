# codex-agent-mem

Repository: [MarceloCaporale/codex-agent-mem](https://github.com/MarceloCaporale/codex-agent-mem)

Tested package: `codex-agent-mem 1.0.2`.

## Мета Для Анализа

```yaml
tool_id: codex-agent-mem
decision: optional
recommendation_action: suggest_when_continuity_needed
role: read_only_continuity_memory
install_policy: explicit_user_opt_in_only
read_scope: explicit_sqlite_db_path
purge_path: delete_configured_sqlite_db_and_sidecars
recommend_when:
  tasks:
    - resume_previous_work
    - open_work_or_completion_check
    - compact_handoff_context
  conditions:
    - prior_memory_db_exists
    - user_wants_cross_session_continuity
do_not_recommend_when:
  tasks:
    - initial_code_discovery
    - exact_file_or_symbol_lookup
    - architecture_graphing
analysis_hint: "Предлагать только для continuity между сессиями; для поиска по коду использовать rg или Graphify."
```

## Что Это

`codex-agent-mem` - local-first SQLite-backed MCP memory layer для agent continuity. Это не code index и не замена source search.

Полезен для:

- Resume context после session boundaries.
- Open work и completion checks.
- Compact continuity packs.
- Project/session-scoped memory retrieval.

Не подходит для:

- Initial code discovery.
- Точного поиска file/line.
- Построения architecture graphs.

## CLI И MCP

Установленные CLI scripts:

- `codex-agent-mem-smoke`
- `codex-agent-mem-bootstrap-codex`
- `codex-agent-mem-mcp`
- `codex-agent-mem-policy`
- `codex-agent-mem-snapshot`
- daemon/API/context helper commands

Smoke test:

- Time: 794.4 ms в первом controlled run.
- Отдельный delete-index smoke: 531.8 ms.
- DB size: 212,992 bytes.
- Result: `ok: true`, project/session scope present, health score 100.

Read-only minimal MCP работал и exposed 7 non-mutating tools:

- `mem_session_list`
- `mem_scope_resolve`
- `mem_bootstrap_context`
- `mem_open_work`
- `mem_completion_check`
- `mem_context_pack`
- `mem_health_runtime`

Live MCP calls заняли 411 ms total для session list, bootstrap context, context pack и runtime health.

## Результаты Тестов

| Check | Result |
|---|---|
| Stable CLI | PASS |
| MCP `tools/list` | PASS |
| Read-only mode | PASS |
| Explicit DB path | PASS |
| Purge/delete index | PASS через удаление SQLite DB |
| Private code indexing risk | Low в read-only continuity mode |
| Token output | Compact context pack reported `pack_tokens=130` |

MCP `mem_bootstrap_context` намеренно запросил narrowing, когда project-wide context был ambiguous. Это хорошее поведение для AIFHub, потому что broad project retrieval не должен молча подтягивать unrelated historical context.

## Результаты По Project Profiles (2026-05-22)

`codex-agent-mem` не запускался как source-code index против code fixtures P1-P5. Он тестировался как continuity memory с explicit temp DB. Будущие прогоны могут добавлять project-specific continuity rows, когда для этих проектов есть реальная prior session memory.

| Profile | Project Fixture Run | Scenario Tested | Result | Решение для профиля |
|---|---|---|---|---|
| P1 - Большой legacy PHP проект с интеграциями | Not run on source fixture | Continuity applicability only | Использовать только для resume/open-work context; для code discovery использовать `rg` или Graphify. | Optional, если есть previous memory. |
| P2 - Go-сервис с интеграциями | Not run on source fixture | Continuity applicability only | Ожидается то же поведение; tool не inspect source files в read-only mode. | Optional, если есть previous memory. |
| P3 - Laravel/Vue продукт | Not run on source fixture | Continuity applicability only | Ожидается то же поведение; compact packs не зависят от framework. | Optional, если есть previous memory. |
| P4 - Multirepo продукт | Not run on source fixture | Continuity applicability only | Broad project scope нужно narrowing по session/sub-scope перед использованием. | Полезен только с explicit narrowing. |
| P5 - Малый Go микросервис | Not run on source fixture | Continuity applicability only | Может помочь с resume context, но не лучше `rg` для code lookup. | Обычно не нужен, если continuity не важна. |

Shared controlled result: smoke DB работал за 794.4 ms, live read-only MCP calls заняли 411 ms, context pack reported `pack_tokens=130`, DB purge через deletion прошёл.

## Локальный Прогон На Anonymous Profiles (2026-05-22)

Проверка выполнялась как continuity smoke, а не source indexing. Для каждого профиля создавалась отдельная temp SQLite DB; MCP запускался в `--read-only --profile minimal` mode. Source files не индексировались.

| Profile | Shape | Smoke | MCP Calls | Tools | DB Size | Pack Tokens | Privacy/Purge | Decision |
|---|---|---:|---:|---:|---:|---:|---|---|
| R2026-05-22-P01 | `go_service` | 1.7 s | 839 ms | 7 | 208.0 KB | n/a | explicit DB; purge PASS | Optional только для continuity. |
| R2026-05-22-P02 | `large_framework_app` | 1.3 s | 1.0 s | 7 | 208.0 KB | n/a | explicit DB; purge PASS | Optional только для continuity. |
| R2026-05-22-P03 | `small_microservice` | 1.4 s | 595 ms | 7 | 208.0 KB | n/a | explicit DB; purge PASS | Optional только для continuity. |
| R2026-05-22-P04 | `large_framework_app` | 711 ms | 480 ms | 7 | 208.0 KB | n/a | explicit DB; purge PASS | Optional только для continuity. |
| R2026-05-22-P05 | `large_legacy` | 477 ms | 429 ms | 7 | 208.0 KB | n/a | explicit DB; purge PASS | Optional только для continuity. |
| R2026-05-22-P06 | `small_microservice` | 560 ms | 1.7 s | 7 | 208.0 KB | n/a | explicit DB; purge PASS | Optional только для continuity. |
| R2026-05-22-P07 | `small_microservice` | 1.7 s | 1.9 s | 7 | 208.0 KB | n/a | explicit DB; purge PASS | Optional только для continuity. |
| R2026-05-22-P08 | `large_framework_app` | 674 ms | 398 ms | 7 | 208.0 KB | n/a | explicit DB; purge PASS | Optional только для continuity. |
| R2026-05-22-P09 | `small_microservice` | 1.2 s | 544 ms | 7 | 208.0 KB | n/a | explicit DB; purge PASS | Optional только для continuity. |
| R2026-05-22-P10 | `large_framework_app` | 492 ms | 486 ms | 7 | 208.0 KB | n/a | explicit DB; purge PASS | Optional только для continuity. |
| R2026-05-22-P11 | `multirepo` | 551 ms | 379 ms | 7 | 208.0 KB | n/a | explicit DB; purge PASS | Optional только для continuity. |
| R2026-05-22-P12 | `multirepo` | 437 ms | 390 ms | 7 | 208.0 KB | n/a | explicit DB; purge PASS | Optional только для continuity. |
| R2026-05-22-P13 | `multirepo` | 1.3 s | 394 ms | 7 | 208.0 KB | n/a | explicit DB; purge PASS | Optional только для continuity. |

Вывод по этому прогону: project shape почти не влияет, потому что tool не читает source. Рекомендация остаётся прежней: предлагать только если нужна continuity между сессиями и есть explicit DB path.

## Scope И Privacy

Safe configuration использует:

- Explicit `--db-path`.
- `--read-only`.
- `--profile minimal`.
- Compact response mode.

В этом mode MCP не exposes mutating tools и не читает source files. Он читает только configured memory database.

Избегать default/global setup, пока пользователь явно не opt-in. Bootstrap был safe в trial, потому что он печатал config snippet и не мутировал Codex config automatically.

## Purge

Практический purge path - удалить configured SQLite DB и sidecar files, если они есть:

- `<db>.db`
- `<db>.db-wal`
- `<db>.db-shm`

Delete-index smoke подтвердил, что DB можно удалить cleanly.

## Вывод

Это лучший кандидат для issue #85, но только для continuity memory. Он должен быть optional и read-only по умолчанию.

Рекомендуемая роль в AIFHub: optional MCP continuity provider для resume context, open work, closure checks и compact handoff packs.
