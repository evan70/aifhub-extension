# codex-mem

Пакет: `codex-mem 0.1.1`

Package metadata не содержит repository URL. Ближайший публичный repository, проверенный во время research: [Just-Boring-Cat/codex-mem](https://github.com/Just-Boring-Cat/codex-mem), но installed npm package сам не доказывает связь с этим repository.

## Мета Для Анализа

```yaml
tool_id: codex-mem
decision: reject_default
recommendation_action: do_not_suggest_install_by_default
role: none
install_policy: do_not_auto_install
read_scope: broad_codex_history_unless_fully_isolated
purge_path: delete_configured_sqlite_db_and_sidecars
avoid_when:
  - default_or_global_codex_home
  - cross_project_history_can_be_indexed
  - user_needs_safe_default_memory_provider
analysis_hint: "Не предлагать как default utility: scope слишком широкий и легко ошибиться с isolation."
```

## Что Это

`codex-mem` ingests local Codex session/history logs в SQLite + FTS5 и exposes retrieval через CLI и MCP. Он сфокусирован на Codex session memory, а не на project artifact retrieval.

## CLI И MCP

CLI commands работали:

- `save`
- `search`
- `stats`
- `sync`
- `mcp-server`
- context/project/session helpers

MCP exposed 8 tools:

- `search`
- `timeline`
- `get_observations`
- `save_memory`
- `stats`
- `list_projects`
- `recent_sessions`
- `build_context`

## Результаты Изолированных Тестов

С правильной explicit isolation:

- `CODEX_HOME` указывал на empty temp Codex home.
- `CODEX_MEM_DATA_DIR` указывал на temp data dir.
- `CODEX_MEM_DB_PATH` указывал на temp SQLite DB.

Результаты:

| Операция | Время |
|---|---:|
| `save` manual note | 413.4 ms |
| `search` manual note | 392.1 ms |
| `stats` | 402.5 ms |
| DB size | 57,344 bytes |
| Delete DB | PASS |

Это доказывает, что tool может работать safe, когда каждый path explicit и correct.

## Результаты По Project Profiles (2026-05-22)

`codex-mem` не запускался намеренно как source-code index против sanitized P1-P5 fixtures. Он тестировался как Codex session/history memory. Случайный default-scope run показал, что он может ingest cross-project Codex history, если isolation настроена неверно.

| Profile | Project Fixture Run | Scenario Tested | Result | Решение для профиля |
|---|---|---|---|---|
| P1 - Большой legacy PHP проект с интеграциями | Not run on sanitized source fixture | Default-scope risk observed through session history | Cross-project history может быть ingested, если `CODEX_HOME` не isolated. | Reject as default. |
| P2 - Go-сервис с интеграциями | Not run on sanitized source fixture | Default-scope risk observed through session history | Тот же privacy risk: prior sessions могут быть indexed. | Reject as default. |
| P3 - Laravel/Vue продукт | Not run on sanitized source fixture | Default-scope risk observed through session history | Тот же privacy risk: prior sessions могут быть indexed. | Reject as default. |
| P4 - Multirepo продукт | Not run on sanitized source fixture | Default-scope risk observed through session history | Тот же privacy risk, плюс scope ambiguity между repos. | Reject as default. |
| P5 - Малый Go микросервис | Not run on sanitized source fixture | Isolated manual note only | Safe только с explicit empty `CODEX_HOME` и DB paths; нет value over `rg` для code lookup. | Reject as default. |

Shared controlled result: explicit isolated manual note save/search/stats сработали примерно за 1.2 s total, DB deletion passed. Default-scope behavior остаётся blocker.

## Локальный Прогон На Anonymous Profiles (2026-05-22)

Проверка выполнялась только в full isolation: отдельные `CODEX_HOME`, `CODEX_MEM_DATA_DIR` и `CODEX_MEM_DB_PATH` на профиль. `sync` не запускался, глобальная Codex history не читалась.

| Profile | Shape | Save | Search | Stats | DB Size | Found | Очистка | Решение |
|---|---|---:|---:|---:|---:|---|---|---|
| R2026-05-22-P01 | `go_service` | 421 ms | 394 ms | 384 ms | 56.0 KB | yes | PASS | Safe only with full isolation; reject default. |
| R2026-05-22-P02 | `large_framework_app` | 531 ms | 395 ms | 406 ms | 56.0 KB | yes | PASS | Safe only with full isolation; reject default. |
| R2026-05-22-P03 | `small_microservice` | 397 ms | 393 ms | 390 ms | 56.0 KB | yes | PASS | Safe only with full isolation; reject default. |
| R2026-05-22-P04 | `large_framework_app` | 389 ms | 400 ms | 390 ms | 56.0 KB | yes | PASS | Safe only with full isolation; reject default. |
| R2026-05-22-P05 | `large_legacy` | 401 ms | 394 ms | 391 ms | 56.0 KB | yes | PASS | Safe only with full isolation; reject default. |
| R2026-05-22-P06 | `small_microservice` | 400 ms | 393 ms | 389 ms | 56.0 KB | yes | PASS | Safe only with full isolation; reject default. |
| R2026-05-22-P07 | `small_microservice` | 445 ms | 388 ms | 402 ms | 56.0 KB | yes | PASS | Safe only with full isolation; reject default. |
| R2026-05-22-P08 | `large_framework_app` | 417 ms | 384 ms | 392 ms | 56.0 KB | yes | PASS | Safe only with full isolation; reject default. |
| R2026-05-22-P09 | `small_microservice` | 398 ms | 383 ms | 389 ms | 56.0 KB | yes | PASS | Safe only with full isolation; reject default. |
| R2026-05-22-P10 | `large_framework_app` | 433 ms | 392 ms | 388 ms | 56.0 KB | yes | PASS | Safe only with full isolation; reject default. |
| R2026-05-22-P11 | `multirepo` | 397 ms | 414 ms | 409 ms | 56.0 KB | yes | PASS | Safe only with full isolation; reject default. |
| R2026-05-22-P12 | `multirepo` | 428 ms | 392 ms | 404 ms | 56.0 KB | yes | PASS | Safe only with full isolation; reject default. |
| R2026-05-22-P13 | `multirepo` | 394 ms | 380 ms | 397 ms | 56.0 KB | yes | PASS | Safe only with full isolation; reject default. |

Вывод по этому прогону: isolated manual-note mode работает стабильно, но это не снимает blocker по default broad Codex history scope. Рекомендация остаётся `reject_default`.

## Локальный Прогон На Real Project Roots (2026-05-23)

Проверка выполнялась только в full isolation: отдельные temp `CODEX_HOME`, `CODEX_MEM_DATA_DIR` и `CODEX_MEM_DB_PATH`. `sync`, `worker`, `init-mcp` и global Codex history не запускались. Каждая команда сохраняла только anonymous marker note с real project `--cwd` scope и проверяла scoped search.

| Profile | Shape | Save | Search | Stats | Scoped Search | Source Indexed | Решение |
|---|---|---:|---:|---:|---|---|---|
| real-profile-01 | `large_legacy_web_app` | 597 ms | 428 ms | 445 ms | 1 result | no | Safe only with full isolation; reject default. |
| real-profile-02 | `go_service` | 377 ms | 378 ms | 369 ms | 1 result | no | Safe only with full isolation; reject default. |
| real-profile-03 | `large_framework_app` | 403 ms | 427 ms | 415 ms | 1 result | no | Safe only with full isolation; reject default. |
| real-profile-04 | `multi_app_workspace` | 380 ms | 470 ms | 948 ms | 1 result | no | Safe only with full isolation; reject default. |
| real-profile-05 | `small_microservice` | 704 ms | 563 ms | 372 ms | 1 result | no | Safe only with full isolation; reject default. |

Вывод не меняется: isolated scoped notes работают, но опасным остается default/global Codex history scope. AIFHub не должен рекомендовать это как default provider.

## Сбой Privacy

Default behavior unsafe для AIFHub integration.

В тестировании неверно isolated run ingested real Codex session/history logs в local memory DB. Generated DB был около 624 MB. Вторая isolation mistake создала ещё один DB около 625 MB в temp area.

Оба generated indexes были quarantined, а global default store был removed из active home directory. Важный вывод не в operator mistake, а в том, что default source у tool - broad Codex session/history data.

## Границы И Privacy

Default read scope включает Codex session/history logs под user's Codex home. Там могут быть private prompts, tool outputs, paths, snippets и cross-project context.

Safe use требует explicit настройки всех переменных:

- `CODEX_HOME`
- `CODEX_MEM_DATA_DIR`
- `CODEX_MEM_DB_PATH`

Это слишком fragile для default AIFHub integration.

## Очистка

Очистка возможна удалением configured SQLite DB и sidecar files:

- `codex-mem.db`
- `codex-mem.db-wal`
- `codex-mem.db-shm`

В installed package не было dedicated CLI purge command.

## Вывод

Reject как default AIFHub provider. Он functional, но default read scope слишком broad и слишком легко misconfigure.

Рекомендуемая роль в AIFHub: none by default. Максимум - документировать как user-local experiment со строгими isolation warnings.
