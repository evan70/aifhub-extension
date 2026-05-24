# agent-memory

Пакет: `myagentmemory 0.4.12`

Репозиторий: [jayzeng/agentmemory](https://github.com/jayzeng/agentmemory)

README репозитория говорит, что `agentmemory` - canonical GitHub repository для `agent-memory` CLI, опубликованный как `myagentmemory` в npm.

## Мета Для Анализа

```yaml
tool_id: agent-memory
decision: docs_only_manual_notes
recommendation_action: mention_only_if_user_requests_manual_notes
role: manual_markdown_memory
install_policy: explicit_user_opt_in_only
read_scope: explicit_memory_dir
purge_path: delete_selected_memory_directory
recommend_when:
  tasks:
    - manual_durable_notes
do_not_recommend_when:
  tasks:
    - codebase_retrieval
    - project_analysis
    - mcp_provider_integration
analysis_hint: "Не предлагать для анализа проекта; можно упомянуть только как ручной markdown notebook."
```

## Что Это

`agent-memory` - markdown-oriented memory tool для coding agents. В trial он вёл себя как manual local memory directory, а не как MCP provider.

Полезен для:

- Manual durable notes.
- Простого `MEMORY.md` style context.
- Agent-local scratchpad-like memory.

Не подходит для:

- AIFHub source-of-truth integration.
- Codebase retrieval.
- MCP-based provider integration.
- Semantic search без установленного и настроенного `qmd`.

## CLI И MCP

Canonical repository был cloned и протестирован отдельно от npm package. Repository version и npm version оба resolved to `0.4.12`.

Compiled binary, собранный из source, работал:

```powershell
dist\agent-memory.exe version
dist\agent-memory.exe --help
```

npm Windows bin wrapper в installed package всё ещё был сломан, потому что пытался запускать `dist\agent-memory` без `.exe` suffix:

```text
'...myagentmemory\dist\agent-memory' is not recognized as an internal or external command
```

Direct TypeScript/source execution with Bun работал, и compiled `.exe` работал после `bun run build:cli`.

Usable MCP server не найден.

Доступные CLI concepts:

- `init`
- `write`
- `read`
- `context`
- `search`
- `sync`
- `distil`
- `scratchpad`

## Результаты Тестов

Тесты использовали только explicit temp paths. Dependency install для cloned repo выполнялся через `bun install --ignore-scripts`, потому что package `postinstall` настраивает `git config core.hooksPath .githooks`, если запускается внутри git repository.

### Upstream Тесты

| Test Command | Результат | Заметки |
|---|---:|---|
| `bun test test/unit.test.ts` | 139 passed / 0 failed | Core memory, scratchpad, qmd mocks, distil и parser utilities прошли. |
| `bun test test/cli.test.ts` | 41 passed / 3 failed | Failures были Windows/environment-specific вокруг skill install detection и shell script execution. |
| `bun run build` | PASS | TypeScript `--noEmit` check passed. |
| `bun run build:cli` | PASS | Собран `dist\agent-memory.exe`; `version` и `--help` работали. |

CLI test failures:

- `install-skills copies SKILL.md into home`: test ожидал Claude detection, но temp HOME содержал только `.claude/` без `.claude/settings.json`; команды `claude` не было, поэтому detection корректно skipped.
- `install-skills.sh` tests: test вызывает `bash`; на этой машине он resolves to WSL `C:\Windows\system32\bash.exe`, а не Git Bash, поэтому Windows paths падают с exit `127`.

Manual skill install/uninstall через CLI работал, когда присутствовал temp `.claude/settings.json` marker.

### Manual CLI Smoke

Smoke test использовал explicit temp memory directory через `--dir`.

| Операция | Время | Результат |
|---|---:|---|
| `init --json` | 195.4 ms | Created memory dir; qmd disabled |
| `write --target long_term` | 147.3 ms | Wrote `MEMORY.md` |
| `write --target topic` | 151.6 ms | Wrote `topics/memory-tools.md` |
| `scratchpad add` | 154.3 ms | Wrote `SCRATCHPAD.md` |
| `context --no-search` | 177.8 ms | Returned scratchpad, topic, and long-term memory context |
| `search --mode keyword --json` | 178.2 ms | Failed gracefully because `qmd` was not installed |

Controlled run files:

- `MEMORY.md`
- `SCRATCHPAD.md`
- `topics/memory-tools.md`

## Результаты По Project Profiles (2026-05-22)

`agent-memory` не запускался против source fixtures P1-P5. Он тестировался как manual markdown memory с explicit temp `--dir`.

| Profile | Project Fixture Run | Scenario Tested | Result | Решение для профиля |
|---|---|---|---|---|
| P1 - Большой legacy PHP проект с интеграциями | Not run on source fixture | Manual memory applicability | Может хранить notes вручную, но не discover code или flows. | Docs-only/manual notes. |
| P2 - Go-сервис с интеграциями | Not run on source fixture | Manual memory applicability | Тот же результат; нет project-specific retrieval без qmd. | Docs-only/manual notes. |
| P3 - Laravel/Vue продукт | Not run on source fixture | Manual memory applicability | Тот же результат; нет project-specific retrieval без qmd. | Docs-only/manual notes. |
| P4 - Multirepo продукт | Not run on source fixture | Manual memory applicability | Manual notes могут упоминать repo scope, но tool не enforces it. | Docs-only/manual notes. |
| P5 - Малый Go микросервис | Not run on source fixture | Manual memory applicability | Overhead не оправдан для code lookup. | Обычно не нужен. |

Shared controlled result: `init`, long-term write, topic write, scratchpad add и context generation прошли; qmd-backed search был unavailable.

## Локальный Прогон На Anonymous Profiles (2026-05-22)

Проверка выполнялась как manual markdown memory. Для каждого профиля использовался отдельный temp `--dir`; source files не индексировались. `search` проверялся только для фиксации `qmd` limitation.

| Profile | Shape | Init | Write | Context | Search | qmd | Memory Size | Очистка | Решение |
|---|---|---:|---:|---:|---:|---|---:|---|---|
| R2026-05-22-P01 | `go_service` | 122 ms | 109 ms | 132 ms | 100 ms | missing | 323 B | PASS | Manual notes only. |
| R2026-05-22-P02 | `large_framework_app` | 122 ms | 118 ms | 121 ms | 107 ms | missing | 332 B | PASS | Manual notes only. |
| R2026-05-22-P03 | `small_microservice` | 193 ms | 157 ms | 119 ms | 105 ms | missing | 331 B | PASS | Manual notes only. |
| R2026-05-22-P04 | `large_framework_app` | 111 ms | 110 ms | 120 ms | 104 ms | missing | 332 B | PASS | Manual notes only. |
| R2026-05-22-P05 | `large_legacy` | 105 ms | 113 ms | 122 ms | 105 ms | missing | 325 B | PASS | Manual notes only. |
| R2026-05-22-P06 | `small_microservice` | 109 ms | 110 ms | 127 ms | 118 ms | missing | 331 B | PASS | Manual notes only. |
| R2026-05-22-P07 | `small_microservice` | 125 ms | 106 ms | 137 ms | 114 ms | missing | 331 B | PASS | Manual notes only. |
| R2026-05-22-P08 | `large_framework_app` | 105 ms | 106 ms | 120 ms | 102 ms | missing | 332 B | PASS | Manual notes only. |
| R2026-05-22-P09 | `small_microservice` | 127 ms | 114 ms | 119 ms | 114 ms | missing | 331 B | PASS | Manual notes only. |
| R2026-05-22-P10 | `large_framework_app` | 115 ms | 110 ms | 118 ms | 102 ms | missing | 332 B | PASS | Manual notes only. |
| R2026-05-22-P11 | `multirepo` | 112 ms | 106 ms | 123 ms | 105 ms | missing | 322 B | PASS | Manual notes only. |
| R2026-05-22-P12 | `multirepo` | 107 ms | 110 ms | 118 ms | 112 ms | missing | 322 B | PASS | Manual notes only. |
| R2026-05-22-P13 | `multirepo` | 129 ms | 107 ms | 121 ms | 104 ms | missing | 322 B | PASS | Manual notes only. |

Вывод по этому прогону: project shape не влияет на ценность tool, потому что это manual note directory. Без `qmd` нет usable retrieval. Рекомендация остаётся docs-only/manual notes.

## Локальный Прогон На Real Project Roots (2026-05-23)

Проверка выполнялась как manual markdown memory с отдельным temp `--dir` на каждый profile. Source files не индексировались. Команды запускались в форме `agent-memory <command> --dir <path> --json`; важный CLI caveat - если поставить `--dir` перед command, CLI печатает help и может завершиться без полезной операции, поэтому smoke должен проверять marker/file content, а не только exit code.

| Profile | Shape | Init | Write | Read | Context | Status | Marker Found | Решение |
|---|---|---:|---:|---:|---:|---:|---|---|
| real-profile-01 | `large_legacy_web_app` | 123 ms | 124 ms | 128 ms | 306 ms | 113 ms | yes | Manual notes only. |
| real-profile-02 | `go_service` | 94 ms | 99 ms | 116 ms | 94 ms | 98 ms | yes | Manual notes only. |
| real-profile-03 | `large_framework_app` | 97 ms | 100 ms | 94 ms | 96 ms | 98 ms | yes | Manual notes only. |
| real-profile-04 | `multi_app_workspace` | 97 ms | 99 ms | 147 ms | 99 ms | 131 ms | yes | Manual notes only. |
| real-profile-05 | `small_microservice` | 100 ms | 119 ms | 106 ms | 96 ms | 110 ms | yes | Manual notes only. |

Вывод не меняется: tool быстрый и пригоден как local markdown notebook, но это не project retrieval provider и он не оправдывает AIFHub integration.

## Границы И Privacy

Explicit `--dir` - хороший механизм. Он ограничивает storage выбранной memory directory и не требует project-source indexing.

Риск связан с optional skills/global setup, `postinstall` hook behavior и semantic search dependencies. Эти варианты не приняты как default integration behavior.

## Очистка

Очистка - удалить выбранную memory directory или файлы. Для controlled manual-memory case отдельная purge command не нужна.

## Вывод

Оставить как docs-only/manual memory. Он не подходит для AIFHub integration, потому что нет verified MCP provider, npm Windows wrapper сломан, package `postinstall` mutates git hook config, а semantic search требует отдельный `qmd` install.

Рекомендуемая роль в AIFHub: none for implementation; только optional user note-taking tool.
