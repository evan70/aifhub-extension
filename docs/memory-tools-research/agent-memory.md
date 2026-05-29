# agent-memory

Пакет: `myagentmemory 0.4.12`

Репозиторий: [jayzeng/agentmemory](https://github.com/jayzeng/agentmemory)

README репозитория говорит, что `agentmemory` - canonical GitHub repository для `agent-memory` CLI, опубликованный как `myagentmemory` в npm.

Результаты тестов и выводы по labels: [agent-memory-benchmark-results.md](agent-memory-benchmark-results.md).

## Что Это

`agent-memory` - markdown-oriented memory tool для coding agents. В проверках он вел себя как manual local memory directory, а не как AIFHub retrieval provider.

Полезная роль:

- manual durable notes;
- простой `MEMORY.md`/topic/scratchpad style context;
- user-owned local notebook.

Не подходит для:

- project analysis;
- codebase retrieval;
- MCP-based provider integration;
- semantic search без отдельного `qmd`;
- default AIFHub memory integration.

## Политика AIFHub

Решение: `docs_only_manual_notes`.

Не предлагать автоматически при анализе проекта. Можно упомянуть только если пользователь явно просит durable manual notes.

Project labels не являются сигналом к выбору: tool не читает source и не помогает `php`, `go`, `js`, `rust`, `multi` проектам с code discovery.

## CLI И MCP

Доступные CLI concepts:

- `init`;
- `write`;
- `read`;
- `context`;
- `search`;
- `sync`;
- `distil`;
- `scratchpad`.

Usable MCP server не найден.

Windows caveat: npm bin wrapper в installed package был сломан, потому что пытался запускать `dist\agent-memory` без `.exe` suffix. Compiled binary из source работал после `bun run build:cli`.

## Границы И Privacy

Safe scope возможен через explicit `--dir`. Это ограничивает storage выбранной memory directory и не требует project-source indexing.

Не принимать как default:

- optional skills/global setup;
- package `postinstall`, который может менять git hooks path;
- semantic search dependencies без отдельной проверки;
- source indexing.

## Очистка

Очистка - удалить выбранную memory directory или отдельные markdown файлы.

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
