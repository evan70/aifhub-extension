# context-mode

Repository: [mksglu/context-mode](https://github.com/mksglu/context-mode)

Tested package: `context-mode 1.0.146`.

## Мета Для Анализа

```yaml
tool_id: context-mode
decision: manual_helper_only
recommendation_action: suggest_only_for_large_temporary_outputs
role: temporary_output_index
install_policy: explicit_user_opt_in_only
read_scope: explicit_indexed_content
purge_path: ctx_purge_session_or_project
recommend_when:
  tasks:
    - large_command_output_compression
    - temporary_one_session_retrieval
do_not_recommend_when:
  project_shapes:
    - small_microservice
  tasks:
    - persistent_project_memory
    - source_code_indexing
analysis_hint: "Предлагать только когда анализ упирается в большой generated output; не использовать как постоянную memory."
```

## Что Это

`context-mode` - context-window optimization и temporary retrieval tool. Он может выполнять команды, индексировать output, искать по indexed content и purge project/session knowledge base.

Это не clean memory provider для AIFHub. Он шире, чем memory, потому что включает shell execution, hooks, browser/insight helpers и output virtualization.

## CLI И MCP

CLI:

- `context-mode doctor` работал.
- Server и SQLite/FTS5 checks прошли.
- Hook checks warned, потому что hooks не были registered.
- `--help` и `--version` не вернули полезного output в trial.

MCP exposed 11 tools:

- `ctx_execute`
- `ctx_execute_file`
- `ctx_index`
- `ctx_search`
- `ctx_fetch_and_index`
- `ctx_batch_execute`
- `ctx_stats`
- `ctx_doctor`
- `ctx_upgrade`
- `ctx_purge`
- `ctx_insight`

## Результаты Тестов

Live MCP test:

- Indexed маленький explicit text source.
- Search успешно нашёл его.
- Проверено, что canary text retrievable before purge.
- Вызван `ctx_purge({ confirm: true, scope: "project" })`.
- Проверено, что knowledge base empty after purge.
- Total live test time: 1,922 ms.
- `ctx_stats` reported 582 B entered context.

## Результаты По Project Profiles (2026-05-22)

`context-mode` не запускался против source fixtures P1-P5 как project index. Controlled run использовал маленький explicit text source для проверки indexing, search, canary retrieval и purge behavior.

| Profile | Project Fixture Run | Scenario Tested | Result | Решение для профиля |
|---|---|---|---|---|
| P1 - Большой legacy PHP проект с интеграциями | Not run on source fixture | Temporary output indexing applicability | Может помочь с compression большого command output, но command execution/indexing должны быть explicit. | Manual helper only. |
| P2 - Go-сервис с интеграциями | Not run on source fixture | Temporary output indexing applicability | Project-specific benefit over `rg` не доказан. | Manual helper only. |
| P3 - Laravel/Vue продукт | Not run on source fixture | Temporary output indexing applicability | Project-specific benefit over `rg` не доказан; полезен только для большого generated output. | Manual helper only. |
| P4 - Multirepo продукт | Not run on source fixture | Temporary output indexing applicability | Может индексировать selected multi-command output, но не должен становиться persistent memory. | Manual helper only. |
| P5 - Малый Go микросервис | Not run on source fixture | Temporary output indexing applicability | Overhead, скорее всего, не нужен. | Не использовать по умолчанию. |

Shared controlled result: explicit indexed canary был retrievable before purge, а `ctx_purge({ confirm: true, scope: "project" })` очистил его.

## Локальный Прогон На Anonymous Profiles (2026-05-22)

Проверка выполнялась только на explicit generated text: anonymous profile summary + canary. Source files не индексировались. Для каждого профиля использовался отдельный `CONTEXT_MODE_DATA_DIR`, затем выполнялся `ctx_purge({ confirm: true, scope: "project" })`.

| Profile | Shape | Indexed Tokens | Index | Search | Found | Purge | Decision |
|---|---|---:|---:|---:|---|---|---|
| R2026-05-22-P01 | `go_service` | ~43 | 59 ms | 8 ms | yes | PASS | Manual helper для explicit generated output. |
| R2026-05-22-P02 | `large_framework_app` | ~46 | 49 ms | 8 ms | yes | PASS | Manual helper для explicit generated output. |
| R2026-05-22-P03 | `small_microservice` | ~54 | 35 ms | 6 ms | yes | PASS | Manual helper для explicit generated output. |
| R2026-05-22-P04 | `large_framework_app` | ~47 | 43 ms | 6 ms | yes | PASS | Manual helper для explicit generated output. |
| R2026-05-22-P05 | `large_legacy` | ~43 | 38 ms | 7 ms | yes | PASS | Manual helper для explicit generated output. |
| R2026-05-22-P06 | `small_microservice` | ~42 | 37 ms | 6 ms | yes | PASS | Manual helper для explicit generated output. |
| R2026-05-22-P07 | `small_microservice` | ~47 | 40 ms | 7 ms | yes | PASS | Manual helper для explicit generated output. |
| R2026-05-22-P08 | `large_framework_app` | ~50 | 41 ms | 7 ms | yes | PASS | Manual helper для explicit generated output. |
| R2026-05-22-P09 | `small_microservice` | ~47 | 38 ms | 7 ms | yes | PASS | Manual helper для explicit generated output. |
| R2026-05-22-P10 | `large_framework_app` | ~46 | 41 ms | 7 ms | yes | PASS | Manual helper для explicit generated output. |
| R2026-05-22-P11 | `multirepo` | ~41 | 46 ms | 7 ms | yes | PASS | Manual helper для explicit generated output. |
| R2026-05-22-P12 | `multirepo` | ~50 | 38 ms | 6 ms | yes | PASS | Manual helper для explicit generated output. |
| R2026-05-22-P13 | `multirepo` | ~37 | 42 ms | 8 ms | yes | PASS | Manual helper для explicit generated output. |

Вывод по этому прогону: `context-mode` быстро работает как temporary index для явного generated output, но это не доказательство пользы как source-code retrieval tool. Рекомендация остаётся manual/helper-only.

## Scope И Privacy

Privacy content-driven:

- Он не читал private files сам по себе в live test.
- Всё, что explicit indexed, становится retrievable.
- Command execution tools могут читать или emit private data при неосторожном использовании.

Для AIFHub это значит, что `context-mode` не должен регистрироваться как default provider. Если используется, то только как manual, per-session helper для большого command output и docs, а не persistent project memory.

## Purge

`ctx_purge` поддерживает explicit scopes:

- `scope: "session"` с session id.
- `scope: "project"` для whole project knowledge base.

Live canary test подтвердил, что project purge работает.

## Вывод

Полезен как optional temporary context compression tool. Не подходит как default AIFHub memory.

Рекомендуемая роль в AIFHub: docs-only/manual helper для уменьшения большого command output и one-session retrieval noise.
