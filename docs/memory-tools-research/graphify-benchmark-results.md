# Результаты Тестов Graphify

Этот файл содержит evidence по Graphify. Описание инструмента и политика использования находятся в [graphify.md](graphify.md).

Важно: recommendation benchmark считается только по paired `ai-tester` runs `rg baseline` vs `graphify tool_run`. Field runs ниже являются safety/availability evidence и не заменяют ai-tester.

## Методика

Baseline для выбора инструмента: сначала `rg`. Graphify проверялся только как дополнительный graph context, а не как source-of-truth. В безопасных прогонах project roots копировались во временные sanitized fixtures; `graphify-out/` оставался внутри temp copy.

Не запускались:

- `graphify install`;
- semantic/LLM extraction;
- automatic MCP registration;
- запись derived graph data в real project root без temp copy.

## AI Tester Pilot 2026-05-28

Raw artifact: `.ai-factory/state/ai-tester-matrix-for-memory-tool-metadata/screening-graphify-ai-tester-pilot/ai-tester-token-matrices.json`.

Пилотный paired run: `screening-graphify-ai-tester-pilot`, `aif-explore`, task `architecture_or_impact_discovery`, profile labels `no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice`. Graphify был подготовлен через `fixtures.setup_commands` в project-local venv; model turn обязан был сначала вызвать `rg`, затем `graphify`.

| run | status | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens |
|---|---|---:|---:|---:|---:|---:|---:|
| `rg baseline` | PASS | 205.1s | 4 | 441,415 | 242,543 | 3,928 | 246,471 |
| `graphify tool_run` | PASS | 242.8s | 32 | 2,197,674 | 1,128,887 | 14,195 | 1,143,082 |

Дельта Graphify против `rg`:

| metric | delta |
|---|---:|
| duration | +18.4% |
| tool calls | +700.0% |
| total tokens | +397.9% |
| input tokens | +365.4% |
| output tokens | +261.4% |
| input+output tokens | +363.8% |

Вывод по ai-tester pilot: на `mini/small_microservice/no-primary-language` Graphify точно не использовать. Он прошел технически, но потребил заметно больше tokens, tool calls и времени.

## AI Tester Targeted Run 2026-05-28

Raw artifact: `.ai-factory/state/ai-tester-matrix-for-memory-tool-metadata/targeted-graphify-ai-tester/ai-tester-token-matrices.json`.

Targeted paired run: `targeted-graphify-ai-tester`, skill `aif-explore`, task `architecture_or_impact_discovery`, Graphify prepared через project-local venv.

| project | labels | run | status | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens |
|---|---|---|---|---:|---:|---:|---:|---:|---:|
| matrix-profile-04 | `js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app` | `rg baseline` | PASS | 189.0s | 12 | 564,018 | 314,681 | 9,337 | 324,018 |
| matrix-profile-04 | same | `graphify tool_run` | PASS | 191.0s | 12 | 1,031,559 | 542,081 | 6,790 | 548,871 |
| matrix-profile-07 | `js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo` | `rg baseline` | PASS | 141.9s | 6 | 713,935 | 388,208 | 4,575 | 392,783 |
| matrix-profile-07 | same | `graphify tool_run` | PASS | 247.7s | 16 | 1,626,512 | 842,739 | 11,677 | 854,416 |

Дельта Graphify против `rg`:

| project | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens |
|---|---:|---:|---:|---:|---:|---:|
| matrix-profile-04 | +1.1% | +0.0% | +82.9% | +72.3% | -27.3% | +69.4% |
| matrix-profile-07 | +74.6% | +166.7% | +127.8% | +117.1% | +155.2% | +117.5% |

Вывод targeted run: даже на `large_framework_app` и `multirepo` Graphify не показал экономии total/input tokens. Единственный положительный сигнал - output tokens на matrix-profile-04 снизились на 27.3%, но total tokens выросли на 82.9%. Поэтому Graphify нельзя рекомендовать как token/time saver; только как explicit quality experiment, если пользователю нужен graph-shaped обзор и он принимает overhead.

## AI Tester Cross Screening 2026-05-28

Raw artifact: `.ai-factory/state/ai-tester-matrix-for-memory-tool-metadata/cross-graphify-ai-tester/ai-tester-token-matrices.json`.

Reduced cross run: 2 representative skills x 2 project labels x `rg/tool_run`. Это нужный формат для решения `skill + project label + tool`, потому что один project label или один skill отдельно не показывает применимость.

| project | labels | skill | run | status | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens |
|---|---|---|---|---|---:|---:|---:|---:|---:|---:|
| matrix-profile-04 | `js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app` | `aif-analyze` | `rg baseline` | PASS | 102.2s | 1 | 151,883 | 98,727 | 1,188 | 99,915 |
| matrix-profile-04 | same | `aif-analyze` | `graphify tool_run` | PASS | 230.8s | 16 | 1,810,744 | 927,130 | 10,270 | 937,400 |
| matrix-profile-04 | same | `aif-explore` | `rg baseline` | PASS | 99.6s | 1 | 152,148 | 98,735 | 1,445 | 100,180 |
| matrix-profile-04 | same | `aif-explore` | `graphify tool_run` | PASS | 274.0s | 22 | 2,691,148 | 1,347,742 | 11,054 | 1,358,796 |
| matrix-profile-05 | `js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo` | `aif-analyze` | `rg baseline` | PASS | 97.3s | 2 | 160,647 | 107,572 | 2,131 | 109,703 |
| matrix-profile-05 | same | `aif-analyze` | `graphify tool_run` | PASS | 235.4s | 15 | 1,957,975 | 1,008,252 | 9,179 | 1,017,431 |
| matrix-profile-05 | same | `aif-explore` | `rg baseline` | PASS | 125.2s | 5 | 590,545 | 323,015 | 3,082 | 326,097 |
| matrix-profile-05 | same | `aif-explore` | `graphify tool_run` | PASS | 342.0s | 21 | 2,453,737 | 1,286,223 | 15,770 | 1,301,993 |

Дельта Graphify против `rg`:

| project | skill | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens |
|---|---|---:|---:|---:|---:|---:|---:|
| matrix-profile-04 | `aif-analyze` | +125.8% | +1500.0% | +1092.2% | +839.1% | +764.5% | +838.2% |
| matrix-profile-04 | `aif-explore` | +175.1% | +2100.0% | +1668.8% | +1265.0% | +665.0% | +1256.4% |
| matrix-profile-05 | `aif-analyze` | +141.9% | +650.0% | +1118.8% | +837.3% | +330.7% | +827.4% |
| matrix-profile-05 | `aif-explore` | +173.2% | +320.0% | +315.5% | +298.2% | +411.7% | +299.3% |

Cross вывод: на проверенных комбинациях `aif-analyze/aif-explore` x `large_framework_app/multirepo` Graphify не дает token/time выгоды. Это сильнее предыдущего targeted run, потому что различие по skill тоже проверено.

## AI Tester Python OpenSpec Cross 2026-05-28

Raw artifact: `.ai-factory/state/ai-tester-matrix-for-memory-tool-metadata/model-gen-all-tools-grouped-clean-20260528-212755/ai-tester-token-matrices.json`.

Полный отчет: [AI Tester Token Matrices: Python OpenSpec All Tools](ai-tester-token-matrices-python-openspec-all-tools.md).

Labels: `python`, `standard`, `framework`, `single_repo`, `openspec_native`, `large_framework_app`. Task: `architecture_or_impact_discovery`.

| Metric | Value |
|---|---:|
| Rows | 20 |
| `rg baseline` rows | 10 |
| Graphify positive usage rows | 0 |
| Graphify negative policy rows | 6 |
| Graphify not-applicable rows | 4 |
| PASS rows | 20 |

Вывод: Graphify не был выбран ни для одного skill на этом профиле. Это policy evidence, а не token/time comparison использования инструмента. Для этого набора labels Graphify остается только `explicit_graph_quality_experiment`; автоматически по `large_framework_app` или `framework` его включать не надо.

## Safety Field Evidence: Project Profiles 2026-05-22

Эти field rows сохраняются как safety/availability evidence. Их старые `Optional` решения не являются текущей policy: paired ai-tester sections выше supersede их для recommendation logic.

| Profile | Files | Cold Index | Warm Query | Graph | Benchmark Query Tokens | Reduction | Качество | Решение |
|---|---:|---:|---:|---|---:|---:|---|---|
| P1 large legacy PHP integrations | 1,891 | 31.8 s | 0.69 s | 4,062 nodes / 7,634 edges | ~25,316 | 10.7x | partial/noisy | Optional только после `rg`, если search result шумный. |
| P2 Go service integrations | 504 | 12.5 s | 0.60 s | 3,067 / 8,227 | ~42,618 | 4.8x | partial/noisy | Optional для broad impact; exact locate через `rg`. |
| P3 Laravel/Vue product | 681 | 47.8 s | 0.93 s | 14,460 / 17,851 | ~1,901 | 507.1x | good | Useful optional repo graph. |
| P4 Multirepo product | 360 | 7.8 s | 0.51 s | 1,102 / 1,656 | ~3,012 | 24.4x | good | Optional для repo-surface mapping. |
| P5 small Go microservice | 57 | 2.25 s | 0.50-1.12 s | 589 / 1,247 | ~8,165 | 4.8x | poor | Не использовать; overhead не оправдан. |

Главный отрицательный пример: на small Go microservice MCP `query_graph` вернул generic `Message` node вместо реального end-to-end flow. Это показывает, что AST-only graph не заменяет source validation.

## Safety Field Evidence: Anonymous Profiles 2026-05-22

| Profile | Shape | Files | Cold Index | Query | Graph | Reduction | Quality | Решение |
|---|---|---:|---:|---:|---|---:|---|---|
| R2026-05-22-P01 | `go_service` | 534 | 15.9 s | 5.4 s | 3,328 / 8,785 | 5.1x | partial | Только после `rg` и ручной validation. |
| R2026-05-22-P02 | `large_framework_app` | 681 | 31.2 s | 3.2 s | 16,056 / 25,592 | 120.9x | good | Optional для broad analysis. |
| R2026-05-22-P03 | `small_microservice` | 67 | 5.4 s | 1.1 s | 419 / 966 | 2.6x | poor | Не рекомендовать; overhead. |
| R2026-05-22-P04 | `large_framework_app` | 615 | 20.8 s | 2.1 s | 13,612 / 21,216 | 42.0x | good | Optional для broad analysis. |
| R2026-05-22-P05 | `large_legacy` | 1,798 | 15.4 s | 4.6 s | 4,185 / 7,634 | 10.7x | partial | Только после `rg` и ручной validation. |
| R2026-05-22-P06 | `small_microservice` | 124 | 14.8 s | 1.9 s | 6,707 / 7,997 | 78.5x | poor | Не рекомендовать; overhead. |
| R2026-05-22-P07 | `small_microservice` | 61 | 3.3 s | 975 ms | 549 / 1,247 | 4.8x | poor | Не рекомендовать; overhead. |
| R2026-05-22-P08 | `large_framework_app` | 221 | 19.7 s | 5.2 s | 1,833 / 2,937 | 125.1x | good | Optional для broad analysis. |
| R2026-05-22-P09 | `small_microservice` | 26 | 20.6 s | 8.5 s | 983 / 2,340 | 7.2x | poor | Не рекомендовать; overhead. |
| R2026-05-22-P10 | `large_framework_app` | 835 | 130.3 s | 6.2 s | 13,326 / 17,929 | 312.7x | good | Optional для broad analysis, но cold index дорогой. |
| R2026-05-22-P11 | `multirepo` | 839 | 77.6 s | 2.4 s | 15,214 / 18,279 | 561.8x | good | Optional для surface mapping. |
| R2026-05-22-P12 | `multirepo` | 394 | 7.9 s | 1.7 s | 1,020 / 1,658 | 25.3x | good | Optional для surface mapping. |
| R2026-05-22-P13 | `multirepo` | 134 | 4.1 s | 1.1 s | 947 / 1,073 | 69.4x | good | Optional для surface mapping. |

## Safety Field Evidence: Real Project Roots 2026-05-23

Команда: `graphify update <temp-copy> --no-cluster`.

| Profile | Shape | Files | Copy | AST Update | Graph | Результат | Решение |
|---|---|---:|---:|---:|---|---|---|
| real-profile-01 | `large_legacy_web_app` | 874 | 6.8 s | 78.8 s | 4,188 / 7,641 | PASS | Optional только после `rg`; broad graph дорогой. |
| real-profile-02 | `go_service` | 583 | 3.0 s | 18.2 s | 3,863 / 9,451 | PASS | Optional только для broad impact discovery. |
| real-profile-03 | `large_framework_app` | 558 | 3.2 s | 51.2 s | 16,071 / 19,382 | PASS | Optional для architecture/impact mapping. |
| real-profile-04 | `multi_app_workspace` | 330 | 2.6 s | 8.6 s | 981 / 1,656 | PASS | Optional для surface mapping. |
| real-profile-05 | `small_microservice` | 59 | 0.4 s | 2.1 s | 549 / 1,247 | PASS | Не рекомендовать; `rg` достаточно. |

## Safety Field Run 2026-05-24

Прогон через `scripts/memory-tool-field-run.mjs` на 55 sanitized temp profiles.

| Проверка | Результат |
|---|---:|
| Profiles | 55 |
| Версия | `graphify 0.8.17` |
| AST update PASS | 54/55 |
| Timeout/failure | 1/55 |
| Slowest successful update | 112,558 ms |
| Failed profile elapsed | 180,687 ms |
| `graphify-out/` cleanup | 55/55 PASS |

## Когда Использовать

Потенциальные labels для будущего quality-only теста:

- `large_framework_app`, `large`, `framework`: broad architecture/impact mapping;
- `multirepo`, `monorepo`: surface mapping между компонентами;
- `large_legacy` и `integration_heavy`: только если `rg` дает много шума и нужен обзор зависимостей.

Сильные стороны по safety/field evidence:

- может уменьшать видимый output на отдельных broad scenarios, но ai-tester пока не подтвердил total-token экономию;
- быстро отвечает warm query после построения graph;
- полезен для предварительного списка impact areas.

## Когда Не Использовать

Плохие labels:

- `mini`, `small_microservice`;
- задачи exact lookup, implementation, fix, verify, commit;
- проекты, где cold index дороже самого `rg` вопроса.

Слабые стороны:

- cold index может быть дорогим: до 130.3 s на anonymous profile и 112.6 s в safe field run;
- AST-only output бывает partial/noisy;
- один timeout на 55 temp profiles;
- graph output требует source validation.

## Итог

Graphify не является token/time saver по текущим ai-tester данным: проиграл `rg` на mini, large framework и multirepo targeted rows. Оставлять только как explicit quality experiment для graph-shaped обзора после `rg`; не выбирать автоматически по labels `large_framework_app` или `multirepo`.
