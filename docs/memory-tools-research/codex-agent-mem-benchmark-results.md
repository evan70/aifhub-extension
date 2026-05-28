# Результаты Тестов codex-agent-mem

Этот файл содержит evidence по `codex-agent-mem`. Описание инструмента и политика использования находятся в [codex-agent-mem.md](codex-agent-mem.md).

Статус benchmark: paired `ai-tester` run для `rg baseline` vs `codex-agent-mem tool_run` еще не выполнен. Таблицы ниже являются safety/availability evidence; они не должны использоваться как финальное доказательство экономии tokens/time против `rg`.

## Методика

`codex-agent-mem` проверялся как continuity memory, а не source-code index. Прогоны использовали explicit temp SQLite DB; source files не индексировались.

Сравнение с `rg` для code lookup неприменимо: если задача про код, `rg` остается baseline; если задача про continuity, `rg` не хранит prior session memory.

## Controlled Smoke

| Проверка | Результат |
|---|---:|
| Stable CLI | PASS |
| MCP `tools/list` | PASS |
| Read-only minimal mode | PASS |
| Explicit DB path | PASS |
| Delete-index smoke | PASS |
| DB size | 212,992 bytes |
| First smoke time | 794.4 ms |
| Delete-index smoke | 531.8 ms |
| Live MCP calls | 411 ms total |
| Compact context pack | `pack_tokens=130` |

`mem_bootstrap_context` намеренно запросил narrowing, когда project-wide context был ambiguous. Это полезное поведение: broad historical retrieval не должен молча подтягивать unrelated context.

## Anonymous Profiles 2026-05-22

Проверка выполнялась как continuity smoke на 13 profiles. Для каждого создавалась отдельная temp SQLite DB; MCP запускался в `--read-only --profile minimal` mode.

| Shape | Profiles | Smoke Range | MCP Calls Range | Tools | DB Size | Решение |
|---|---:|---:|---:|---:|---:|---|
| `go_service` | 1 | 1.7 s | 839 ms | 7 | 208 KB | Optional только для continuity. |
| `large_framework_app` | 4 | 492 ms-1.3 s | 398 ms-1.0 s | 7 | 208 KB | Optional только для continuity. |
| `large_legacy` | 1 | 477 ms | 429 ms | 7 | 208 KB | Optional только для continuity. |
| `small_microservice` | 4 | 560 ms-1.7 s | 544 ms-1.9 s | 7 | 208 KB | Обычно не нужен без continuity. |
| `multirepo` | 3 | 437 ms-1.3 s | 379-394 ms | 7 | 208 KB | Нужен explicit narrowing. |

Вывод: project shape почти не влияет, потому что tool не читает source. Решение зависит от наличия prior memory DB.

## Real Project Roots 2026-05-23

| Profile | Shape | Smoke | DB Created | Source Indexed | Результат | Решение |
|---|---|---:|---|---|---|---|
| real-profile-01 | `large_legacy_web_app` | 684 ms | yes | no | PASS | Optional для continuity/open work. |
| real-profile-02 | `go_service` | 510 ms | yes | no | PASS | Optional для continuity/open work. |
| real-profile-03 | `large_framework_app` | 493 ms | yes | no | PASS | Optional для continuity/open work. |
| real-profile-04 | `multi_app_workspace` | 484 ms | yes | no | PASS | Optional для continuity/open work. |
| real-profile-05 | `small_microservice` | 951 ms | yes | no | PASS | Usually unnecessary unless continuity matters. |

## Source Install And MCP Probe 2026-05-25

Проверка выполнялась в isolated temp directory: GitHub clone, Python venv, editable source install, temp SQLite DB и MCP stdio server. Real project roots, global Codex config, hooks, MCP registration и source indexing не использовались.

| Проверка | Результат |
|---|---|
| GitHub source clone | PASS, commit `d594c8a86207fb9a8a5b48a6aab323349680707a` |
| Package metadata | `codex-agent-mem 1.0.2`, Python `>=3.12` |
| Editable install | PASS через `pip install -e .[dev]` |
| CLI help | PASS для `codex-agent-mem-smoke`, `codex-agent-mem-mcp`, `codex-agent-mem-policy` |
| CLI smoke with explicit temp DB | PASS: 1 session, 1 turn, 3 observations, 1 active decision, health score 100 |
| Upstream tests | PASS: `121 passed` |
| Ruff | PASS: `All checks passed` |
| MCP minimal/read-only | PASS: initialized as version `1.0.2`, exposed 7 tools, no mutating tools exposed |
| MCP read-only calls | PASS: `mem_session_list`, `mem_completion_check`, `mem_context_pack`, `mem_health_runtime` |
| MCP full/read-only caveat | Mutating names visible, mutating call returned `isError: true` and did not write |
| Cleanup | PASS |

## Когда Использовать

Лучшие signals:

- task: resume/open-work/completion check;
- есть prior memory DB;
- пользователь хочет continuity;
- long-running change, где нужно compact handoff.

Сильные стороны:

- быстрый read-only continuity smoke;
- explicit DB path и clear purge path;
- minimal profile не exposes mutating tools;
- upstream tests прошли.

## Когда Не Использовать

Плохие signals:

- initial analysis of unknown project;
- exact file/symbol lookup;
- architecture graphing;
- implementation/fix/verify gates.

Слабые стороны:

- не читает source, значит не дает repo discovery;
- зависит от уже существующей memory DB;
- `full` profile шумит mutating tool names even in read-only;
- install/setup должен оставаться user-owned.

## Итог

`codex-agent-mem` полезен не по языку или размеру проекта, а по task label `continuity`. Для поиска по коду, выбора файлов и verification он не дает выгоды над `rg`.
