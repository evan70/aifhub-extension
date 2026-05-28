# Graphify

Репозиторий: [safishamsi/graphify](https://github.com/safishamsi/graphify)

Проверенный package: `graphifyy 0.8.17`.

Результаты тестов и выводы по labels: [graphify-benchmark-results.md](graphify-benchmark-results.md).

## Что Это

Graphify строит source-derived knowledge graph по явному project path. Для AIFHub это не memory provider, а ручной repo graph provider для явного quality experiment после baseline `rg`.

Полезная роль:

- проверить, даст ли graph-shaped обзор лучшее качество ответа, чем прямой `rg`;
- собрать surface mapping для multirepo/monorepo как вспомогательный эксперимент;
- дать дополнительный graph context для broad exploration после baseline `rg`;
- подсветить возможные impact areas перед планированием или review.

Не является:

- источником canonical evidence;
- durable session memory;
- заменой `rg` для exact file/symbol lookup;
- безопасным default indexer для каждого проекта.

## Политика AIFHub

Graphify остается `manual_quality_experiment_only` и `explicit_user_opt_in_only`.

Не рекомендовать автоматически по labels. Текущие paired `ai-tester` runs показали, что на `mini`, `large_framework_app` и `multirepo` Graphify потреблял больше total/input tokens и часто работал дольше, чем `rg`.

Допустимый сценарий: пользователь явно просит graph-shaped quality experiment после baseline `rg` и принимает overhead ради возможного улучшения структуры обзора.

Не рекомендовать:

- `small_microservice` и `mini` проекты;
- large framework, multirepo, legacy или Go проекты только на основании labels;
- exact lookup, validation gate, implementation/fix flow;
- задачи, где нужен line-level source proof.

## CLI И MCP

Проверенный безопасный CLI lifecycle:

```text
graphify --help
graphify update <temp-copy> --no-cluster
graphify query "<question>" --budget 1200
graphify benchmark <graphify-out/graph.json>
```

В field run использовался AST-only режим. `graphify extract` и semantic/LLM backend не запускались.

MCP smoke показал, что после установки Python package `mcp` server exposes graph tools вроде `query_graph`, `get_node`, `get_neighbors`, `graph_stats` и PR-impact helpers. Для AIFHub это остается user-owned setup; default команды не должны регистрировать MCP автоматически.

## Границы И Privacy

Read scope равен explicit project path. Graphify пишет derived данные в `graphify-out/` рядом с target path, поэтому для private roots предпочтителен sanitized/temp copy.

Запрещено по умолчанию:

- `graphify install`;
- запуск на real project root без согласия пользователя на derived index data;
- хранение raw graph output без review;
- использование Graphify output как единственного доказательства.

## Очистка

Очистка:

- удалить `graphify-out/`;
- или использовать `graphify uninstall --purge`, если пользователь сам включал project install.

## Мета Для Анализа

```yaml
tool_id: graphify
decision: manual_quality_experiment_only
recommendation_action: suggest_only_for_explicit_graph_quality_experiment
role: repo_graph_provider
install_policy: explicit_user_opt_in_only
read_scope: explicit_project_path
purge_path: delete_graphify_out_or_graphify_uninstall_purge
recommend_when:
  tasks:
    - explicit_graph_quality_experiment
do_not_recommend_when:
  project_shapes:
    - small_microservice
  tasks:
    - exact_file_or_symbol_lookup
    - durable_session_memory
analysis_hint: "Не выбирать Graphify автоматически по project labels; предлагать только как явный graph-quality experiment после rg."
```
