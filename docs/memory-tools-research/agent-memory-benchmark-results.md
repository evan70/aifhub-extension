# Результаты Тестов agent-memory

Этот файл содержит evidence по `agent-memory`. Описание инструмента и политика использования находятся в [agent-memory.md](agent-memory.md).

Статус benchmark: paired `ai-tester` run для manual durable notes еще не выполнен. Таблицы ниже являются safety/availability evidence; они не должны использоваться как финальное доказательство экономии tokens/time против `rg`.

## Методика

Проверки использовали только explicit temp paths. Source files не индексировались. Dependency install для cloned repo выполнялся через `bun install --ignore-scripts`, потому что package `postinstall` настраивает `git config core.hooksPath .githooks`, если запускается внутри git repository.

Сравнение с `rg` для code lookup неприменимо: tool хранит manual notes, но не выполняет project retrieval.

## Upstream Тесты

| Test Command | Результат | Заметки |
|---|---:|---|
| `bun test test/unit.test.ts` | 139 passed / 0 failed | Core memory, scratchpad, qmd mocks, distil и parser utilities прошли. |
| `bun test test/cli.test.ts` | 41 passed / 3 failed | Windows/environment-specific failures вокруг skill install detection и shell script execution. |
| `bun run build` | PASS | TypeScript `--noEmit` check passed. |
| `bun run build:cli` | PASS | Собран `dist\agent-memory.exe`; `version` и `--help` работали. |

CLI test failures были связаны с environment detection и тем, что `bash` на машине resolves to WSL `C:\Windows\system32\bash.exe`, а не Git Bash.

## Manual CLI Smoke

Smoke использовал explicit temp memory directory через `--dir`.

| Операция | Время | Результат |
|---|---:|---|
| `init --json` | 195.4 ms | Created memory dir; qmd disabled |
| `write --target long_term` | 147.3 ms | Wrote `MEMORY.md` |
| `write --target topic` | 151.6 ms | Wrote `topics/memory-tools.md` |
| `scratchpad add` | 154.3 ms | Wrote `SCRATCHPAD.md` |
| `context --no-search` | 177.8 ms | Returned scratchpad, topic, and long-term memory context |
| `search --mode keyword --json` | 178.2 ms | Failed gracefully because `qmd` was not installed |

Controlled files:

- `MEMORY.md`;
- `SCRATCHPAD.md`;
- `topics/memory-tools.md`.

## Anonymous Profiles 2026-05-22

Проверка выполнялась как manual markdown memory. Для каждого профиля использовался отдельный temp `--dir`; source files не индексировались.

| Shape | Profiles | Init Range | Write Range | Context Range | Search | qmd | Очистка | Решение |
|---|---:|---:|---:|---:|---:|---|---|---|
| `go_service` | 1 | 122 ms | 109 ms | 132 ms | 100 ms | missing | PASS | Manual notes only. |
| `large_framework_app` | 4 | 105-122 ms | 106-118 ms | 118-121 ms | 102-107 ms | missing | PASS | Manual notes only. |
| `large_legacy` | 1 | 105 ms | 113 ms | 122 ms | 105 ms | missing | PASS | Manual notes only. |
| `small_microservice` | 4 | 109-193 ms | 106-157 ms | 119-137 ms | 105-118 ms | missing | PASS | Manual notes only. |
| `multirepo` | 3 | 107-129 ms | 106-110 ms | 118-123 ms | 104-112 ms | missing | PASS | Manual notes only. |

## Real Project Roots 2026-05-23

Команды запускались как `agent-memory <command> --dir <path> --json`. Smoke проверял marker/file content, а не только exit code.

| Profile | Shape | Init | Write | Read | Context | Status | Marker Found | Решение |
|---|---|---:|---:|---:|---:|---:|---|---|
| real-profile-01 | `large_legacy_web_app` | 123 ms | 124 ms | 128 ms | 306 ms | 113 ms | yes | Manual notes only. |
| real-profile-02 | `go_service` | 94 ms | 99 ms | 116 ms | 94 ms | 98 ms | yes | Manual notes only. |
| real-profile-03 | `large_framework_app` | 97 ms | 100 ms | 94 ms | 96 ms | 98 ms | yes | Manual notes only. |
| real-profile-04 | `multi_app_workspace` | 97 ms | 99 ms | 147 ms | 99 ms | 131 ms | yes | Manual notes only. |
| real-profile-05 | `small_microservice` | 100 ms | 119 ms | 106 ms | 96 ms | 110 ms | yes | Manual notes only. |

## Когда Использовать

Единственный полезный signal:

- пользователь явно просит manual durable notes или local markdown notebook.

Сильные стороны:

- explicit `--dir`;
- быстрые manual write/read/context операции;
- простой markdown storage;
- cleanup понятен через удаление directory.

## Когда Не Использовать

Плохие labels/signals:

- любые project analysis/retrieval tasks;
- `mini`, `standard`, `large` не важны, потому что source не читается;
- MCP provider integration;
- semantic search expectation without `qmd`;
- Windows npm wrapper path.

Слабые стороны:

- no verified MCP provider;
- npm Windows wrapper сломан;
- package `postinstall` может менять git hooks path;
- search degraded without `qmd`;
- нет пользы над `rg` для code lookup.

## Итог

`agent-memory` годится только как user-owned manual markdown notebook. Для AIFHub project analysis и memory provider selection его не рекомендовать.
