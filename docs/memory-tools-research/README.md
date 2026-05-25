# Research По Memory Tools

Этот каталог фиксирует выводы по инструментам локальной памяти и retrieval для issue #85. Документы описывают результаты установки и полевых проверок без названий приватных проектов.

## Метаинформация Для Анализа

Файл [recommendation-metadata.yaml](recommendation-metadata.yaml) содержит machine-readable правила для analysis-этапа. Его можно читать при анализе проекта и превращать project signals в предложение пользователю:

- если проект выглядит как `multirepo` или large framework, предложить `Graphify` или `CodeGraph` как optional repo graph для broad architecture/impact mapping;
- если задача про resume/open work между сессиями, предложить `codex-agent-mem` в read-only MCP mode с explicit DB path;
- если задача про большой command output, предложить `context-mode` как temporary manual helper с обязательным purge;
- если проект маленький или нужен точный file/symbol lookup, оставить baseline `rg`;
- `codex-mem` и `eagle-mem` не предлагать по умолчанию из-за scope/privacy risks.
- `CodeGraph` можно предлагать только как `manual_cli_only` для `/aif-analyze` и использовать в `/aif-explore` только когда `select --command aif-explore --json` возвращает его в `selected_tools` с purge-командой; `install`/MCP/agent-config surface не принят.
- `Context7` можно предлагать как optional docs provider для version-sensitive library/API вопросов; `ctx7 setup` и MCP registration остаются user-owned.

Эта meta не разрешает auto-install. Любой инструмент из списка должен предлагаться пользователю только как explicit opt-in с объяснением read scope, purge path и privacy tradeoff.

## Алгоритм Тестирования

Этот алгоритм нужен для добавления нового инструмента или повторного прогона существующего. README хранит методику и итоговую рекомендацию; все датированные результаты пишутся только в файл конкретного инструмента.

1. Создать или обновить файл инструмента в этом каталоге.
   - Указать repository URL, tested package/version, назначение, CLI/MCP status, read scope, purge path и privacy вывод.
   - Добавить блок `Мета Для Анализа` с `tool_id`, `decision`, `recommendation_action`, `role`, `install_policy`, `read_scope`, `purge_path`, `recommend_when` и `do_not_recommend_when`.

2. Выбрать project profiles.
   - В первую очередь читать `.ai-factory/ARCHITECTURE.md`, если он есть.
   - Классифицировать проект как `large_legacy`, `multirepo`, `large_framework_app`, `go_service`, `small_microservice` или другой (если предложенные не подходят)
   - В docs использовать только anonymous profile ids. Реальные названия проектов и локальные пути не писать.

3. Подготовить sanitized fixtures.
   - Копировать каждый проект в temp directory.
   - Исключить `.git`, `.env*`, `node_modules`, `vendor`, lock-файлы, логи, cache/build artifacts, binary/media/data artifacts.
   - Все индексы, DB, output и tool installs держать внутри temp workspace.

4. Собрать baseline через `rg`.
   - Зафиксировать file count, fixture size, query latency, hit count и token estimate.
   - Token estimate считать как `ceil(chars / 4)`, если инструмент не отдаёт собственную метрику.
   - `rg` остаётся baseline для exact file/symbol lookup и small projects.

5. Проверить инструмент по safety gate.
   - Stable CLI: `--help`, `--version` или ближайшая безопасная команда.
   - MCP: `tools/list` и минимальные read-only calls, если MCP заявлен.
   - Read scope: только explicit temp path, explicit DB или explicit indexed content.
   - Очистка: удалить index/DB/sidecar files или вызвать documented purge command.
   - Privacy: не читать global history, user home, hooks или real source root без явного opt-in.

6. Проверить функциональные сценарии.
   - Code retrieval/repo graph tools сравнивать с `rg`: latency, token reduction, quality.
   - Continuity memory tools проверять на temp DB/manual notes, не на source indexing.
   - Temporary context tools проверять на explicit generated text или command output.
   - Tools с global hooks/background automation не устанавливать полностью, пока scoped read и purge не доказаны.

7. Оценить качество.
   - `good`: инструмент находит реальные слои/модули/impact areas и снижает шум относительно `rg`.
   - `partial`: есть полезные элементы, но нужна ручная validation или `rg`.
   - `poor`: generic/noisy/wrong, слишком медленно или хуже baseline.
   - `not_applicable`: инструмент не является code retrieval tool.

8. Записать результаты.
   - В файл инструмента добавить новую секцию `Локальный Прогон На Anonymous Profiles (<date>)`.
   - Не перетирать старые таблицы: будущие прогоны добавлять новой датированной секцией.
   - В `recommendation-metadata.yaml` добавить или обновить `evidence_runs`, если новый прогон меняет recommendation logic.

9. Проверить и очистить.
   - Выполнить `npm run validate`.
   - Проверить YAML: `bunx js-yaml docs/memory-tools-research/recommendation-metadata.yaml`.
   - Просканировать docs на реальные project names, local paths и temp paths.
   - Удалить temp fixtures, DB, indexes, sidecars и isolated tool installs.

## Сводка

README содержит только общую сводку и итоговую рекомендацию. Датированные результаты тестирования, anonymous profile таблицы, safety evidence и выводы по конкретному инструменту находятся в файле этого инструмента.

| Tool | Repository | Проверенная версия | Где подходит | Решение |
|---|---|---:|---|---|
| [Graphify](graphify.md) | [safishamsi/graphify](https://github.com/safishamsi/graphify) | `graphifyy 0.8.17` | Repo graph / architecture / impact discovery. Не memory. | Оставить как optional guidance для больших/legacy/multirepo проектов; temp-copy run 2026-05-24 показал 54/55 AST PASS. |
| [Context7](context7.md) | [upstash/context7](https://github.com/upstash/context7) | `ctx7 0.4.4` | Version-sensitive library/API docs. | Optional docs provider; setup/MCP registration не выполнять из AIFHub. |
| [codex-agent-mem](codex-agent-mem.md) | [MarceloCaporale/codex-agent-mem](https://github.com/MarceloCaporale/codex-agent-mem) | Python source package `1.0.2` | Cross-session continuity, open work, closure checks, compact context packs. | Optional read-only continuity provider; source-installable from GitHub, isolated install/pytest/ruff/minimal MCP PASS on 2026-05-25. |
| [context-mode](context-mode.md) | [mksglu/context-mode](https://github.com/mksglu/context-mode) | `1.0.151` | Temporary output/context indexing and compression. | Только docs-only optional helper, не persistent AIFHub memory; temp MCP index/search/purge PASS. |
| [codex-mem](codex-mem.md) | package не содержит repository metadata; ближайший проверенный публичный repo: [Just-Boring-Cat/codex-mem](https://github.com/Just-Boring-Cat/codex-mem) | `0.1.1` | Codex session/history memory. | Reject as default; privacy risk без строгой изоляции. |
| [agent-memory](agent-memory.md) | [jayzeng/agentmemory](https://github.com/jayzeng/agentmemory) | `myagentmemory 0.4.12` | Manual markdown memory. | Docs-only/manual notes, без интеграции. |
| [eagle-mem](eagle-mem.md) | [eagleisbatman/eagle-mem](https://github.com/eagleisbatman/eagle-mem) | `4.9.10` | Shared memory + hooks + guardrails + lanes. | Reject/defer; слишком широкий surface для issue #85. |
| [CodeGraph](codegraph.md) | [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph) | installed `0.9.3`, npm `0.9.4` | Manual CLI-only repo graph для broad analyze/explore questions. | `manual_cli_only`; scoped CLI read/purge verified, но `install`/MCP/agent-config surface не принят. |

## Итоговая Рекомендация

Не делать generic memory-provider abstraction сейчас.

Использовать узкую opt-in модель:

- `rg` остаётся baseline для literal search, точного поиска файлов и маленьких проектов.
- `codex-agent-mem` можно документировать как optional read-only MCP continuity provider.
- `Graphify` можно документировать как optional repo-graph provider для исследования больших кодовых баз.
- `Context7` можно документировать как optional docs provider для актуальных library/API вопросов.
- `context-mode` может остаться manual helper для temporary indexing больших command outputs.
- `codex-mem`, `agent-memory` и `eagle-mem` не должны становиться default AIFHub integrations.
- `CodeGraph` можно рекомендовать из `/aif-analyze` как manual CLI-only opt-in и использовать из `/aif-explore` только когда selection CLI возвращает его в `selected_tools`; `install`/MCP/agent-config surface не принят.

Любая будущая реализация должна требовать explicit opt-in, explicit local paths, отсутствие global hooks по умолчанию, отсутствие canonical OpenSpec writes, отсутствие зависимости от install path и документированный purge/delete-index path.

Compression/context helpers не должны rewrite validation artifacts. Protected validation artifacts включают `aif-gate-result`, `coverage.json`, `done-readiness.json`, OpenSpec specs under `openspec/specs/**`, generated-rules traces и exact evidence snippets. Optional tools не должны compress protected artifacts in place.
