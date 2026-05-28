# Результаты Тестов codex-mem

Этот файл содержит evidence по `codex-mem`. Описание инструмента и политика использования находятся в [codex-mem.md](codex-mem.md).

Статус benchmark: paired positive `ai-tester` run не выполняется, потому что инструмент запрещен по safety/privacy policy. Для него допустимы только ai-tester negative/forbidden selector scenarios; таблицы ниже являются safety evidence.

## Методика

`codex-mem` проверялся только в full isolation. Он не запускался как source-code index против fixtures, потому что его default domain - Codex session/history memory.

Для AIFHub решающим результатом стал privacy/scope risk, а не скорость isolated commands.

## Изолированные Тесты

Explicit isolation:

- `CODEX_HOME` указывал на empty temp Codex home;
- `CODEX_MEM_DATA_DIR` указывал на temp data dir;
- `CODEX_MEM_DB_PATH` указывал на temp SQLite DB.

| Операция | Время | Результат |
|---|---:|---|
| `save` manual note | 413.4 ms | PASS |
| `search` manual note | 392.1 ms | PASS |
| `stats` | 402.5 ms | PASS |
| DB size | 57,344 bytes | Created |
| Delete DB | n/a | PASS |

Вывод: tool functional в fully isolated manual-note режиме.

## Anonymous Profiles 2026-05-22

Проверка выполнялась на 13 profiles только с отдельными `CODEX_HOME`, `CODEX_MEM_DATA_DIR`, `CODEX_MEM_DB_PATH`. `sync` не запускался, global Codex history не читалась.

| Shape | Profiles | Save Range | Search Range | Stats Range | DB Size | Found | Решение |
|---|---:|---:|---:|---:|---:|---|---|
| `go_service` | 1 | 421 ms | 394 ms | 384 ms | 56 KB | yes | Safe only with full isolation; reject default. |
| `large_framework_app` | 4 | 389-531 ms | 384-400 ms | 388-406 ms | 56 KB | yes | Safe only with full isolation; reject default. |
| `large_legacy` | 1 | 401 ms | 394 ms | 391 ms | 56 KB | yes | Safe only with full isolation; reject default. |
| `small_microservice` | 4 | 397-445 ms | 383-393 ms | 389-402 ms | 56 KB | yes | Safe only with full isolation; reject default. |
| `multirepo` | 3 | 394-428 ms | 380-414 ms | 397-409 ms | 56 KB | yes | Safe only with full isolation; reject default. |

## Real Project Roots 2026-05-23

Каждая команда сохраняла только anonymous marker note с real project `--cwd` scope и проверяла scoped search. Source files не индексировались.

| Profile | Shape | Save | Search | Stats | Scoped Search | Source Indexed | Решение |
|---|---|---:|---:|---:|---|---|---|
| real-profile-01 | `large_legacy_web_app` | 597 ms | 428 ms | 445 ms | 1 result | no | Safe only with full isolation; reject default. |
| real-profile-02 | `go_service` | 377 ms | 378 ms | 369 ms | 1 result | no | Safe only with full isolation; reject default. |
| real-profile-03 | `large_framework_app` | 403 ms | 427 ms | 415 ms | 1 result | no | Safe only with full isolation; reject default. |
| real-profile-04 | `multi_app_workspace` | 380 ms | 470 ms | 948 ms | 1 result | no | Safe only with full isolation; reject default. |
| real-profile-05 | `small_microservice` | 704 ms | 563 ms | 372 ms | 1 result | no | Safe only with full isolation; reject default. |

## Privacy Failure

Default behavior unsafe для AIFHub integration.

В тестировании неверно isolated run ingested real Codex session/history logs в local memory DB. Generated DB был около 624 MB. Вторая isolation mistake создала ещё один DB около 625 MB в temp area.

Оба generated indexes были quarantined, а global default store был removed из active home directory. Важный вывод: default source у tool - broad Codex session/history data.

## Когда Использовать

Для AIFHub default flow: не использовать.

Теоретически пользователь может экспериментировать сам, если:

- все env paths explicit и isolated;
- `sync` и global history scan не запускаются;
- DB удаляется после проверки;
- результат не используется как source evidence.

## Когда Не Использовать

Плохие labels/signals:

- любые default AIFHub skills;
- `multirepo` и cross-project work;
- privacy-sensitive projects;
- source-code lookup;
- user expects bounded read scope without manual env isolation.

Слабые стороны:

- слишком легко ingest cross-project Codex history;
- no dedicated purge command found;
- MCP functional, но unsafe by default;
- нет пользы над `rg` для code lookup.

## Итог

`codex-mem` functional только в carefully isolated manual-note mode, но default scope слишком широкий. Для AIFHub: `reject_default`, не предлагать пользователю как рекомендуемый provider.
