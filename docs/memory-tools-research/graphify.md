# Graphify

Repository: [safishamsi/graphify](https://github.com/safishamsi/graphify)

Tested package: `graphifyy 0.8.14` с дополнительным `mcp 1.27.1` для поддержки MCP server.

## Мета Для Анализа

```yaml
tool_id: graphify
decision: optional
recommendation_action: suggest_optional_install
role: repo_graph_provider
install_policy: explicit_user_opt_in_only
read_scope: explicit_project_path
purge_path: delete_graphify_out_or_graphify_uninstall_purge
recommend_when:
  project_shapes:
    - large_legacy
    - multirepo
    - large_framework_app
  tasks:
    - architecture_or_impact_discovery
    - multirepo_surface_mapping
    - token_reduction_for_broad_codebase_questions
do_not_recommend_when:
  project_shapes:
    - small_microservice
  tasks:
    - exact_file_or_symbol_lookup
    - durable_session_memory
analysis_hint: "Если анализ показывает multirepo или большой legacy проект, предложить Graphify как optional утилиту после baseline поиска через rg."
```

## Что Это

Graphify строит source-derived knowledge graph для репозитория. В этом research он рассматривался как кандидат для repository graph и impact discovery, а не как memory provider.

Полезен для:

- Навигации по архитектуре в больших проектах.
- Impact-area discovery, когда plain search возвращает слишком много шума.
- Multirepo surface mapping.
- Token reduction для широких вопросов по codebase.

Не подходит для:

- Durable session memory.
- User preferences.
- Open work tracking.
- Замены `rg` для точного поиска symbol/file.

## CLI И MCP

CLI работал стабильно:

- `graphify --help` работал.
- `graphify update <fixture> --no-cluster` создавал `graphify-out/graph.json`.
- `graphify query "<question>" --budget 1200` возвращал focused graph context.
- `graphify benchmark <graph.json>` возвращал corpus/query token estimates.

MCP не был готов сразу после установки `graphifyy`: `python -m graphify.serve` падал, пока в тот же venv не был установлен Python package `mcp`. После этого MCP exposed 10 tools:

- `query_graph`
- `get_node`
- `get_neighbors`
- `get_community`
- `god_nodes`
- `graph_stats`
- `shortest_path`
- PR-impact helper tools

## Результаты По Project Profiles (2026-05-22)

Эти результаты привязаны к профилям P1-P5 из README каталога. Будущие прогоны на других проектах нужно добавлять новой датированной таблицей.

| Profile | Files | Scenario | Cold Index | Warm Query | Graph | Benchmark Query Tokens | Reduction | Качество результата | Решение для профиля |
|---|---:|---|---:|---:|---|---:|---:|---|---|
| P1 - Большой legacy PHP проект с интеграциями | 1891 | explain flow | 31.8 s | 0.69 s | 4,062 nodes / 7,634 edges | ~25,316 | 10.7x | Partial/noisy | Optional; полезно только после `rg`, если search result слишком шумный. |
| P2 - Go-сервис с интеграциями | 504 | explain flow | 12.5 s | 0.60 s | 3,067 nodes / 8,227 edges | ~42,618 | 4.8x | Partial/noisy | Optional; `rg` остаётся лучше для exact locate. |
| P3 - Laravel/Vue продукт | 681 | explain flow | 47.8 s | 0.93 s | 14,460 nodes / 17,851 edges | ~1,901 | 507.1x | Лучшее token reduction, но всё равно нужна validation | Useful optional repo graph для broad exploration. |
| P4 - Multirepo продукт | 360 | multirepo scope | 7.8 s | 0.51 s | 1,102 nodes / 1,656 edges | ~3,012 | 24.4x | Полезен для surface mapping | Optional для repo-surface mapping, не для scope enforcement. |
| P5 - Малый Go микросервис | 57 | small project overhead | 2.25 s | 0.50 s CLI / 1.12 s MCP | 589 nodes / 1,247 edges | ~8,165 | 4.8x | Хуже `rg` | Не использовать; overhead не оправдан. |

На small Go microservice MCP `query_graph` для message-flow entry points вернул generic `Message` node вместо реального end-to-end flow. Это самый явный пример, что AST-only Graphify output недостаточен для корректности.

## Локальный Прогон На Anonymous Profiles (2026-05-22)

Все профили были скопированы в sanitized temp fixtures. Graphify запускался только на temp path; `graphify-out/` оставался внутри temp fixture и удаляется как derived index.

| Profile | Shape | Files | Cold Index | Query | Graph | Benchmark Query Tokens | Reduction | Quality | Decision |
|---|---|---:|---:|---:|---|---:|---:|---|---|
| R2026-05-22-P01 | `go_service` | 534 | 15.9 s | 5.4 s | 3328 nodes / 8785 edges | ~44226 | 5.1x | partial | Только после `rg` и ручной validation. |
| R2026-05-22-P02 | `large_framework_app` | 681 | 31.2 s | 3.2 s | 16056 nodes / 25592 edges | ~8193 | 120.9x | good | Optional для broad analysis. |
| R2026-05-22-P03 | `small_microservice` | 67 | 5.4 s | 1.1 s | 419 nodes / 966 edges | ~11331 | 2.6x | poor | Не рекомендовать; overhead. |
| R2026-05-22-P04 | `large_framework_app` | 615 | 20.8 s | 2.1 s | 13612 nodes / 21216 edges | ~18993 | 42x | good | Optional для broad analysis. |
| R2026-05-22-P05 | `large_legacy` | 1798 | 15.4 s | 4.6 s | 4185 nodes / 7634 edges | ~25316 | 10.7x | partial | Только после `rg` и ручной validation. |
| R2026-05-22-P06 | `small_microservice` | 124 | 14.8 s | 1.9 s | 6707 nodes / 7997 edges | ~2814 | 78.5x | poor | Не рекомендовать; overhead. |
| R2026-05-22-P07 | `small_microservice` | 61 | 3.3 s | 975 ms | 549 nodes / 1247 edges | ~8165 | 4.8x | poor | Не рекомендовать; overhead. |
| R2026-05-22-P08 | `large_framework_app` | 221 | 19.7 s | 5.2 s | 1833 nodes / 2937 edges | ~1089 | 125.1x | good | Optional для broad analysis. |
| R2026-05-22-P09 | `small_microservice` | 26 | 20.6 s | 8.5 s | 983 nodes / 2340 edges | ~9501 | 7.2x | poor | Не рекомендовать; overhead. |
| R2026-05-22-P10 | `large_framework_app` | 835 | 130.3 s | 6.2 s | 13326 nodes / 17929 edges | ~2323 | 312.7x | good | Optional для broad analysis. |
| R2026-05-22-P11 | `multirepo` | 839 | 77.6 s | 2.4 s | 15214 nodes / 18279 edges | ~1791 | 561.8x | good | Optional для surface mapping. |
| R2026-05-22-P12 | `multirepo` | 394 | 7.9 s | 1.7 s | 1020 nodes / 1658 edges | ~3017 | 25.3x | good | Optional для surface mapping. |
| R2026-05-22-P13 | `multirepo` | 134 | 4.1 s | 1.1 s | 947 nodes / 1073 edges | ~939 | 69.4x | good | Optional для surface mapping. |

Вывод по этому прогону: Graphify стоит предлагать для `large_framework_app` и `multirepo`, где broad `rg` output дорогой или шумный. Для `large_legacy` и `go_service` польза есть, но результат требует ручной проверки. Для `small_microservice` overhead не оправдан даже при красивом token reduction.

## Scope И Privacy

Read scope явный: project path, переданный Graphify. Output хранится в `graphify-out/`.

Safety constraints:

- Не запускать на unsanitized private roots, если пользователь явно не принял derived graph data.
- Считать `graphify-out/` локальным derived index data.
- Не запускать `graphify install` по умолчанию; он может добавлять agent/hook integrations.
- Предпочитать CLI/MCP usage с explicit `graph.json` path.

## Purge

Purge простой:

- Удалить `graphify-out/`.
- Или использовать `graphify uninstall --purge`, если Graphify был installed в проект.

## Вывод

Оставить Graphify как optional guidance для large legacy и multirepo exploration. Он не должен быть memory provider и не должен auto-install.

Рекомендуемая роль в AIFHub: optional repo graph provider, используемый только после `rg`, когда важна shape codebase или token/noise reduction.
