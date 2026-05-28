# AI Tester Matrix Для Memory Tools

Эта страница описывает воспроизводимый прогон optional memory/context tools через `ai-tester`. Матрица всегда сравнивает инструмент с тем же сценарием через `rg`: сначала `baseline_rg`, затем `tool_run`, затем нормализованное сравнение.

Связанные артефакты:

- [recommendation-metadata.yaml](recommendation-metadata.yaml) - machine-readable dimensions, suites, decision actions и aggregate evidence id.
- [README.md](README.md) - итоговые таблицы по форматам проектов.

## Запуск

Installed-project сценарии должны использовать wrapper:

```bash
ai-factory aifhub-memory-tools select --from-project --command aif-explore --json
```

Для разработки extension допустим development-only fallback, если установленный wrapper еще не содержит новый script:

```bash
node scripts/memory-tool-recommender.mjs select --from-project --command aif-explore --json
```

Генератор матрицы:

```bash
node scripts/memory-tool-ai-tester-matrix.mjs --roots <projects-root> --out <temp-run-dir> --max-profiles 5 --json
node scripts/memory-tool-ai-tester-matrix.mjs --roots <projects-root> --out <temp-run-dir> --dry-run --json
node scripts/memory-tool-ai-tester-matrix.mjs --roots <projects-root> --tool codegraph --matrix-size screening --preinitialize-tool codegraph --scenario-prefix screening-codegraph --json
node scripts/memory-tool-ai-tester-matrix.mjs --roots <projects-root> --tool codegraph --matrix-size profile-sweep --json
node scripts/memory-tool-ai-tester-matrix.mjs --roots <projects-root> --tool codegraph --matrix-size skill-sweep --json
node scripts/memory-tool-ai-tester-matrix.mjs --roots <projects-root> --tool codegraph --skill aif-explore --task architecture_or_impact_discovery --json
node scripts/memory-tool-ai-tester-matrix.mjs --roots <projects-root> --tool codegraph --task architecture_or_impact_discovery --json
node scripts/memory-tool-ai-tester-matrix.mjs --roots <projects-root> --tool codegraph --skill aif-explore --task architecture_or_impact_discovery --preinitialize-tool codegraph --json
```

`--roots` может указывать на один проект или каталог с проектами. Durable docs не должны содержать этот путь; public output хранит только anonymous profile ids.

Используйте `--scenario-prefix <id>` для каждого нового большого прогона. `ai-tester` хранит traces глобально по scenario id; prefix предотвращает случайное переиспользование старых traces с такими же `matrix-profile-01` ids.

По умолчанию генератор использует `--matrix-size screening`, а не exhaustive matrix. Цель первого прогона - найти условия, где tool может быть выгоден по tokens/time/result, а не оплатить все комбинации заранее.

| Preset | Profiles | Skills | Task set | Scenarios per tool | Когда запускать |
|---|---:|---:|---|---:|---|
| `screening` | 15 stratified | 10 grouped representatives | `primary` | 300 | Первый проход: найти signal по skill group и project labels. |
| `profile-sweep` | all discovered | 4 high-signal representatives | `primary` | `profiles * 8` | Подтвердить project/profile условия после screening. |
| `skill-sweep` | 8 stratified | 29 AI Factory skills | `primary` | 464 | Проверить все skills на малой выборке проектов. |
| `full` | all discovered | metadata skills by default | `primary` | depends | Audit mode; для 29 skills x 47 profiles используйте `--matrix-size full --skill-set all`, это 2726 scenarios per tool/task. |

Для полного локального набора старый exhaustive вариант был слишком дорогим: 29 skills * 47 profiles * 2 runs = 2726 scenarios для одного tool/task. После исключения ненужных roots число проектов может быть меньше, но правило сохраняется: сначала `screening`, затем targeted confirmation.

Skill groups покрывают все AI Factory skills через representatives:

| Group | Representatives | Members |
|---|---|---|
| `bootstrap_analysis` | `aif-analyze` | `aif`, `aif-init`, `aif-analyze`, `aif-mode` |
| `research_architecture` | `aif-explore` | `aif-explore`, `aif-architecture`, `aif-grounded` |
| `planning_refinement` | `aif-plan` | `aif-plan`, `aif-improve`, `aif-roadmap`, `aif-loop` |
| `implementation_fix` | `aif-implement`, `aif-fix` | `aif-implement`, `aif-fix` |
| `review_quality_gates` | `aif-review`, `aif-rules-check`, `aif-verify` | `aif-review`, `aif-qa`, `aif-rules-check`, `aif-security-checklist`, `aif-verify`, `aif-done` |
| `generation_output` | `aif-docs` | `aif-build-automation`, `aif-ci`, `aif-dockerize`, `aif-docs`, `aif-reference`, `aif-rules`, `aif-skill-generator` |
| `commit_finalization` | `aif-commit` | `aif-commit` |
| `guidance_only` | none by default | `aif-best-practices`, `aif-evolve` |

Windows note: runner должен уметь выполнять `fixtures.setup_commands` через Windows shell. В локальном прогоне `ai-tester 0.5.0` был patched to use `cmd.exe` for setup commands instead of hard-coded `/bin/sh`.

## Контракт Сценария

Каждый optional tool case имеет пару:

| Run | Назначение | Обязательное поведение |
|---|---|---|
| `baseline_rg` | Проверить тот же task через literal/direct repo search. | `rg` вызывается первым, optional tools не вызываются. |
| `tool_run` | Проверить optional tool на том же fixture/task. | Сначала `rg`, затем direct tool invocation; selector behavior проверяется отдельно recommender tests. Для CodeGraph обязательна data-команда `files`, `query` или `context`, простой `--help` не считается полезным использованием. |
| `comparison` | Принять recommendation decision. | Считаются speed, token, noise, accuracy, usefulness, safety и purge deltas. |

Для инструментов с индексом генератор поддерживает warm/preinitialized режим. `--preinitialize-tool codegraph` добавляет в `fixtures.setup_commands` команды `codegraph init .` и `codegraph index --quiet .` до model turn. В самом model turn сценарий запрещает `codegraph init/index`, требует чтение данных из существующего индекса через `codegraph files`, `codegraph query` или `codegraph context`, и требует purge через `codegraph uninit --force .`.

Сценарии используют native `ai-tester` поля: `system_prompt_file`, `copy_trees`, `skill`, `user_prompt` или `user_prompts`, `runner.setting_sources` для CLI-parity suites, и assertions `tool_called`, `tool_call_sequence`, `no_tool_called`, `output_contains`, `turn_count_at_most`, `no_path_escape`.

## Expectations

| Expectation | Значение |
|---|---|
| `baseline_rg` | Baseline на том же profile/task/skill перед optional tool. |
| `positive` | Tool выбран selector-ом, разрешен metadata и должен дать measured value. |
| `negative` | Tool включен в config или matrix, но запрещен для skill/command и не должен вызываться. |
| `overhead` | Tool intentionally запускается, но проигрывает `rg` для mini/exact lookup или шумного нецелевого scenario. |
| `not_applicable` | Tool не относится к task signal, например docs provider для code lookup. |

## Decision Mapping

| Decision | Когда применять | Metadata action |
|---|---|---|
| `recommend` | Tool стабильно лучше `rg` по quality/speed/token/noise и проходит safety/purge. | Рекомендовать только для matching dimensions. |
| `conditional` | Tool полезен только для broad discovery, docs lookup, continuity или compression. | Оставить conditional recommendation с task/profile filter. |
| `avoid` | Tool медленнее, дороже, шумнее или хуже `rg` для profile/task. | Добавить в `avoid_tools` или `do_not_recommend_for`. |
| `forbid` | Tool нарушает safety, scope или purge. | Запретить для соответствующих skills/profiles. |

Provider output остается supporting benchmark evidence only. Raw transcripts, snippets, local paths, temp paths, credentials и private profile names не сохраняются в docs, metadata, OpenSpec specs, generated rules или QA evidence.

Сами строки CodeGraph тестов вынесены в [CodeGraph Benchmark Results](codegraph-benchmark-results.md).
