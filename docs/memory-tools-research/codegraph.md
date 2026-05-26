# CodeGraph

Репозиторий: [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph)

Проверенный package: installed `@colbymchenry/codegraph 0.9.3`; npm latest на 2026-05-24: `0.9.4`. Global install был выполнен по явному запросу пользователя в предыдущем прогоне.

## Мета Для Анализа

```yaml
tool_id: codegraph
decision: manual_cli_only
recommendation_action: suggest_manual_cli_for_repo_graph_when_enabled_or_explicit
role: manual_cli_repo_graph_provider
install_policy: explicit_user_opt_in_only
read_scope: explicit_project_path_verified_for_cli_init_index_status_query
purge_path: codegraph_uninit_force_verified
recommend_when:
  project_shapes:
    - multirepo
    - large_framework_app
  tasks:
    - architecture_or_impact_discovery
    - multirepo_surface_mapping
do_not_recommend_when:
  tasks:
    - implementation
    - validation_gate
    - exact_file_or_symbol_lookup
analysis_hint: "Scoped CLI init/index/status/query/uninit worked on temp copies and selected ai-tester fixtures. Do not initialize on demand for mini projects. Reuse an existing index only after rg when the selection CLI returns CodeGraph for that command, a files/query/context data command gives non-empty useful output, and purge is guaranteed for temporary indexes."
```

## Что Это

CodeGraph - local code knowledge graph tool для AI agents. Public docs описывают repository indexing в local SQLite graph, symbol/call/impact queries, MCP tools и agent configuration support для Claude Code, Cursor, Codex CLI, OpenCode и Hermes Agent.

## Решение AIFHub

Использовать CodeGraph как `manual_cli_only`, а не как automatic provider.

Scoped CLI safety criterion теперь выполнен для explicit, user-requested local runs:

- `codegraph init <project>` и `codegraph index --quiet <project>` остались scoped to explicit project path;
- `codegraph status <project>` и `codegraph query --path <project> --json` работали после indexing;
- `codegraph uninit --force <project>` удалил `.codegraph/`;
- protected agent/config files не изменились во время run.

`/aif-analyze` может рекомендовать CodeGraph для broad repo graph questions и записывать accepted id в `utilities.context_tools.enabled` только после user approval. `/aif-explore` может запускать scoped CLI lifecycle только когда `ai-factory aifhub-memory-tools select --from-project --command aif-explore --json` возвращает CodeGraph в `selected_tools`, и только если команда может purge project-local `.codegraph/` перед завершением.

AIFHub все еще не должен install или register CodeGraph автоматически, потому что более широкий lifecycle surface не принят: `codegraph install`, MCP serving, agent configuration mutation, hooks/background behavior и long-term provider-output storage остаются вне approved integration contract.

## Границы

Не делать:

- auto-install CodeGraph;
- run `codegraph install`, `codegraph sync`, `codegraph serve`, `codegraph serve --mcp`, agent configuration commands, hooks или background services;
- run `codegraph init` или `codegraph index` из AIFHub commands, кроме `/aif-explore` с `manual_purged_cli_execution`, explicit project path и guaranteed purge;
- mutate `.mcp.json`, `.codex/config.toml`, `.cursor/`, `.opencode.json`, `AGENTS.md`, `CLAUDE.md` или agent permission files;
- use CodeGraph output as OpenSpec evidence, generated rules input, QA evidence, verify/done gate evidence или replacement for `rg`.

## Локальные CLI Probes (2026-05-23)

| Проверка | Результат | Решение |
|---|---|---|
| `codegraph --version` | `0.9.3` | CLI доступен. |
| `codegraph --help` | PASS | Command surface проверен. |
| `codegraph status <project>` до init | PASS; сообщает, что project не initialized | Safe non-mutating availability/status check. |
| `codegraph init --index <temp-copy>` | PASS | Создает только project-local `.codegraph/`. |
| `codegraph query --path <temp-copy> --limit 5 --json "message"` | PASS | Возвращает JSON results после indexing. |
| `codegraph files --path <temp-copy> --json` | PASS | Возвращает indexed file list после indexing. |
| `codegraph uninit --force <temp-copy>` | PASS | Удаляет `.codegraph/`. |

Temp-copy smoke использовал sanitized copy одного local service root. Generated `.codegraph/` directory был удален через `uninit`; temp path, project name, snippets и query output не сохраняются в docs.

## Прогон На Real Project Roots (2026-05-23)

Follow-up run покрыл 29 real local project roots, выбранных как git roots или top-level marker roots внутри project folders, которые запросил пользователь. Nested vendor/template/cache/config directories исключались как non-project roots. Документация хранит только aggregate counts и anonymous local ids; реальные project names, local paths, snippets, query output и temp paths исключены.

Command sequence для каждого root:

```bash
codegraph init <project>
codegraph index --quiet <project>
codegraph status <project>
codegraph query --path <project> --limit 3 --json main
codegraph uninit --force <project>
```

Сводка:

| Проверка | Результат |
|---|---:|
| Проверено project roots | 29 |
| Полный command lifecycle прошел | 29 |
| Command failures | 0 |
| Query failures | 0 |
| Protected agent/config mutations | 0 |
| Оставшиеся `.codegraph/` directories после `uninit` | 0 |
| Диапазон index latency | 583-25,077 ms |
| Средняя index latency | 6,261 ms |
| Диапазон transient index DB size | 0.13-32.65 MB |
| Общий transient index DB size до purge | 177.11 MB |
| Roots без recognized source nodes | 3 |

Protected file snapshot включал root-level `.mcp.json`, `.codex/config.toml`, `.codex/hooks.json`, `.cursor/mcp.json`, `.cursor/settings.json`, `.opencode.json`, `opencode.json`, `AGENTS.md` и `CLAUDE.md`.

Anonymous per-root results:

| Profile | Lifecycle | Index Time | Transient DB | Очистка | Notes |
|---|---|---:|---:|---|---|
| cg-root-01 | PASS | 679 ms | 0.13 MB | PASS | Нет recognized source nodes. |
| cg-root-02 | PASS | 1,776 ms | 4.41 MB | PASS | JSON query вернул results. |
| cg-root-03 | PASS | 1,683 ms | 2.17 MB | PASS | JSON query вернул results. |
| cg-root-04 | PASS | 25,077 ms | 11.36 MB | PASS | Самый медленный root. |
| cg-root-05 | PASS | 1,868 ms | 3.97 MB | PASS | JSON query вернул results. |
| cg-root-06 | PASS | 6,833 ms | 9.76 MB | PASS | JSON query вернул results. |
| cg-root-07 | PASS | 805 ms | 0.72 MB | PASS | JSON query вернул results. |
| cg-root-08 | PASS | 10,723 ms | 12.57 MB | PASS | JSON query вернул results. |
| cg-root-09 | PASS | 22,314 ms | 32.65 MB | PASS | Самая большая transient DB. |
| cg-root-10 | PASS | 6,991 ms | 3.82 MB | PASS | JSON query вернул results. |
| cg-root-11 | PASS | 1,474 ms | 2.02 MB | PASS | JSON query вернул results. |
| cg-root-12 | PASS | 583 ms | 0.13 MB | PASS | Нет recognized source nodes. |
| cg-root-13 | PASS | 783 ms | 0.13 MB | PASS | Нет recognized source nodes. |
| cg-root-14 | PASS | 2,313 ms | 1.85 MB | PASS | JSON query вернул results. |
| cg-root-15 | PASS | 11,648 ms | 15.32 MB | PASS | JSON query вернул results. |
| cg-root-16 | PASS | 22,664 ms | 14.18 MB | PASS | Второй самый медленный root. |
| cg-root-17 | PASS | 10,923 ms | 9.35 MB | PASS | JSON query вернул results. |
| cg-root-18 | PASS | 1,355 ms | 1.48 MB | PASS | JSON query вернул results. |
| cg-root-19 | PASS | 20,753 ms | 11.95 MB | PASS | JSON query вернул results. |
| cg-root-20 | PASS | 13,201 ms | 14.31 MB | PASS | JSON query вернул results. |
| cg-root-21 | PASS | 2,663 ms | 4.33 MB | PASS | JSON query вернул results. |
| cg-root-22 | PASS | 1,864 ms | 2.89 MB | PASS | JSON query вернул results. |
| cg-root-23 | PASS | 665 ms | 0.20 MB | PASS | JSON query вернул results. |
| cg-root-24 | PASS | 1,186 ms | 1.81 MB | PASS | JSON query вернул results. |
| cg-root-25 | PASS | 4,114 ms | 6.41 MB | PASS | JSON query вернул results. |
| cg-root-26 | PASS | 2,676 ms | 7.08 MB | PASS | JSON query вернул results. |
| cg-root-27 | PASS | 982 ms | 1.30 MB | PASS | JSON query вернул results. |
| cg-root-28 | PASS | 790 ms | 0.43 MB | PASS | JSON query вернул results. |
| cg-root-29 | PASS | 2,191 ms | 0.36 MB | PASS | JSON query вернул results. |

## Повторный Safe Field Run На Temp Copies (2026-05-24)

Прогон выполнен через `scripts/memory-tool-field-run.mjs` на sanitized temp copies 55 anonymous profiles из локального projects root. Реальные roots не изменялись; `.codegraph/` создавался только внутри temp copies и удалялся через `codegraph uninit --force <temp-copy>`.

| Проверка | Результат |
|---|---:|
| Profiles | 55 |
| Installed CLI | `0.9.3` |
| Current npm version | `0.9.4` |
| `init/index/query/uninit` lifecycle | 55/55 PASS |
| Slowest lifecycle | 75,820 ms |
| Leftover `.codegraph/` in temp copies | 0 detected by lifecycle purge |
| Protected config mutation test | not needed; run used temp copies only |

Вывод не меняет permission model: CodeGraph остается `manual_cli_only`. Новое evidence добавляет version drift (`0.9.3` installed vs `0.9.4` npm latest) и подтверждает, что scoped lifecycle работает на temp copies across broad local profile set. AIFHub все еще не должен запускать `codegraph install`, MCP serving, agent config mutation или использовать output как canonical evidence.

## Forced Rg Baseline Matrix (2026-05-26)

Прогон выполнен через `scripts/memory-tool-codegraph-benchmark.mjs` на 47 sanitized anonymous profiles. Для каждого profile сравнивались:

- `rg --files` плюс `rg -l` по architecture/framework terms;
- `codegraph init`, `index --quiet`, `context --format markdown`, `uninit --force`.

Сводка:

| Проверка | Результат |
|---|---:|
| Profiles | 47 |
| Test rows | 94 |
| CodeGraph lifecycle PASS | 47 |
| Purge PASS | 47 |
| Mini projects avoided | 23 |
| Header-only / no useful context | 18 |
| Conditional useful noisy-rg cases | 4 |
| Conditional useful broad-graph cases | 2 |

Главный вывод: safe lifecycle не равен useful retrieval. На generic `architecture_or_impact_discovery` CodeGraph часто возвращал только короткий `## Code Context` header без полезной выборки. Поэтому low token count сам по себе не считается победой над `rg`.

Видимые строки тестов с `ai-tester` token traces, full 94-row CLI matrix и per-skill scenario matrix лежат в [CodeGraph Benchmark Results](codegraph-benchmark-results.md). Таблицы по skill с реальными input/output/cache token traces лежат в [AI Tester Token Matrices](ai-tester-token-matrices.md).

Preinitialized `ai-tester` runs отдельно проверяют warm-index режим: `setup_commands` заранее выполняют `codegraph init .` и `codegraph index --quiet .`, а model turn не имеет права повторять `init/index`. На текущем standard extension profile warm CodeGraph все равно потратил ~2.0x total tokens против `rg`; на одном mini js/md profile warm CodeGraph сэкономил 4.6% total tokens, но дал слабый дополнительный сигнал. Поэтому warm-index режим не меняет default policy: это conditional reuse, не рекомендация делать setup.

Interim all-skills `ai-tester` token matrix была остановлена после 59/940 строк, потому что результат уже достаточен для policy decision и дальнейший полный прогон тратил бы токены без смены вывода. На 29 paired rows CodeGraph против `rg`: +16.6% duration, +24.9% tool calls, +52.4% total tokens, +50.1% input+output tokens и 2 failed tool-run строки. CodeGraph был лучше по total tokens в 12/29 pairs (41.4%), по input+output tokens в 11/29 pairs (37.9%), быстрее в 11/29 pairs (37.9%) и с меньшим числом tool calls в 10/29 pairs (34.5%). Поэтому инструмент не считается default token/time saver.

Updated recommendation:

- avoid для mini проектов: setup/index дороже `rg`;
- existing-index reuse для mini проектов не запрещен технически, но не рекомендован как default из-за слабого дополнительного сигнала;
- avoid для generic architecture prompts, если CodeGraph context/query output пустой или header-only;
- conditional для large framework или multirepo только после `rg`, когда `rg` шумит и нужен explicit symbol/surface mapping; не предлагать как обычную рекомендацию для экономии токенов;
- always purge через `codegraph uninit --force <project>`.

## Очистка

Accepted purge для explicit user-owned CLI experiments:

```bash
codegraph uninit --force <project>
```

Real-root run подтвердил, что команда удаляет `.codegraph/` для roots, где не было pre-existing CodeGraph index. Если root уже содержит user-owned `.codegraph/`, не delete и не reinitialize его silently.

## Вывод

CodeGraph CLI scoped read и purge verified для explicit local experiments. Принятая AIFHub integration - manual CLI-only and conditional: `/aif-analyze` может упомянуть его только как optional broad graph helper after `rg`, а `/aif-explore` может использовать его только когда selection CLI возвращает его в `selected_tools`, когда `rg` шумит, когда CodeGraph возвращает non-empty useful `files/query/context`, и с `codegraph uninit --force <project>` before completion. `codegraph install`, MCP и agent-config mutation остаются rejected.
