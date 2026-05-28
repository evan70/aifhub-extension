# CodeGraph

Репозиторий: [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph)

Проверенный package: installed `@colbymchenry/codegraph 0.9.3`; npm latest на 2026-05-24: `0.9.4`.

## Что Это

CodeGraph - локальный инструмент для построения code graph по проекту. Он индексирует explicit project path, создает project-local `.codegraph/`, а затем дает команды для получения структурной выборки по файлам, символам, вызовам и impact/surface questions.

В AIFHub это не memory-provider и не canonical evidence source. Это optional supporting context для случаев, где обычный `rg` дает слишком шумную выборку и нужен дополнительный graph/symbol context.

## Для Чего

CodeGraph может быть полезен для:

- broad architecture/impact discovery, когда нужно понять, какие части проекта связаны с изменением;
- multirepo или monorepo surface mapping, когда literal search находит слишком много нерелевантных файлов;
- symbol-oriented questions, где важны связи между файлами, exports, calls или usage;
- уже подготовленного warm index, если построение индекса сделано заранее и явно принято пользователем.

CodeGraph не заменяет `rg`. Baseline всегда остается `rg`, а результат CodeGraph нужно проверять по source files.

## Политика AIFHub

Текущее решение: `manual_cli_only` + `avoid_by_default`.

CodeGraph можно предлагать только при exact match по `skill + project labels` из `tools.codegraph.screening_policy.conditional_cases` в [recommendation-metadata.yaml](recommendation-metadata.yaml). Нельзя выбирать CodeGraph только по языку, только по skill или только по broad label вроде `large_framework_app`, `multirepo`, `go`, `framework`.

Минимальный contract:

- сначала выполнить `rg` baseline;
- использовать CodeGraph только как supporting context;
- запускать только на explicit project path;
- принимать результат только если `files/query/context` вернул non-empty useful output;
- завершать временный индекс через `codegraph uninit --force <project>`;
- не использовать output как OpenSpec evidence, QA evidence или verify/done gate evidence.

Подробные результаты тестов и labels, где инструмент оказался полезен или вреден, лежат в [codegraph-benchmark-results.md](codegraph-benchmark-results.md).

## Безопасный Lifecycle

Разрешенный manual lifecycle для scoped experiment:

```bash
codegraph --version
codegraph --help
codegraph status <project>

codegraph init <project>
codegraph index --quiet <project>
codegraph files --path <project> --json
codegraph query --path <project> --limit 10 --json "<query>"
codegraph context --path <project> --format markdown "<query>"
codegraph uninit --force <project>
```

Если в проекте уже есть user-owned `.codegraph/`, нельзя silently удалять, переинициализировать или считать его временным индексом.

## Что Запрещено

AIFHub не должен выполнять:

- auto-install CodeGraph;
- `codegraph install`;
- `codegraph sync`;
- `codegraph serve`;
- `codegraph serve --mcp`;
- agent configuration mutation commands;
- hooks или background services;
- silent writes в `.mcp.json`, `.codex/config.toml`, `.cursor/`, `.opencode.json`, `AGENTS.md`, `CLAUDE.md` или permission files;
- long-term storage сырого CodeGraph output как проекта или OpenSpec evidence.

## Мета Для Анализа

```yaml
tool_id: codegraph
decision: manual_cli_only
default_policy: avoid_by_default
recommendation_action: suggest_manual_cli_for_repo_graph_when_enabled_or_explicit
role: manual_cli_repo_graph_provider
install_policy: explicit_user_opt_in_only
read_scope: explicit_project_path_verified_for_cli_init_index_query_uninit
purge_path: codegraph uninit --force <project>
baseline_first: rg
selection_rule: exact skill + project labels from screening_policy
do_not_select_by:
  - language_only
  - skill_only
  - broad_shape_only
```
