# Результаты Тестов CodeGraph

Этот файл хранит результаты тестов CodeGraph против `rg`. Описание самого инструмента и безопасного lifecycle находится в [codegraph.md](codegraph.md).

Задача для матриц: `architecture_or_impact_discovery`.

## Методика

Каждый тест строился как paired comparison:

1. `rg baseline` на том же anonymous project profile, skill и task.
2. `codegraph tool_run` на том же profile, skill и task.
3. Сравнение по `duration`, `tool calls`, `total tokens`, `input tokens`, `output tokens`, `input+output tokens`.

Для индексируемого режима использовался warm setup:

```bash
codegraph init .
codegraph index --quiet .
```

Во время model turn запрещалось повторно запускать `codegraph init` или `codegraph index`. Tool-run должен был читать уже готовый индекс через `codegraph files`, `codegraph query` или `codegraph context`, а затем выполнить `codegraph uninit --force .`.

Контракт приватности:

- только anonymous profile ids;
- без реальных project names;
- без source snippets;
- без local paths в durable docs;
- runtime traces остаются в `.ai-factory/state/...`, а в docs попадают только агрегаты.

## Наборы Тестов

| Набор | Что проверялось | Результат |
|---|---|---:|
| Local CLI probes | `--version`, `--help`, `status`, `init`, `index`, `query`, `files`, `uninit` | PASS |
| Real project roots | 29 local roots, explicit lifecycle | 29/29 PASS |
| Safe temp-copy field run | 55 sanitized anonymous profiles | 55/55 lifecycle PASS |
| Cold/warm ai-tester samples | текущий extension profile и mini js/md profile | 4 paired rows |
| Forced 47-profile CLI matrix | `rg --files` + `rg -l` vs `codegraph context` | 94 rows |
| Final ai-tester screening matrix | 15 profiles x 10 skills x 2 runs | 300/300 rows |

## Безопасность И Lifecycle

Scoped CLI behavior подтвержден:

| Проверка | Результат |
|---|---:|
| Real roots tested | 29 |
| Real-root lifecycle PASS | 29 |
| Temp-copy profiles tested | 55 |
| Temp-copy lifecycle PASS | 55 |
| Protected agent/config mutations | 0 |
| Leftover `.codegraph/` after purge | 0 |
| Slowest temp-copy lifecycle | 75,820 ms |
| Installed CLI | `0.9.3` |
| npm latest на 2026-05-24 | `0.9.4` |

Safety вывод: scoped lifecycle можно считать рабочим для explicit manual experiment. Это не означает, что инструмент полезен по умолчанию: usefulness проверяется отдельно против `rg`.

## Cold И Warm Samples

| Project profile | Labels | Run | Status | Duration | Tool calls | Total tokens | Input+output tokens | Decision |
|---|---|---|---|---:|---:|---:|---:|---|
| current extension | `js`, `md/mjs`, `standard`, `framework`, `single_repo`, `openspec_native` | `rg baseline` | PASS | 78.4s | 7 | 407,581 | 263,197 | baseline |
| current extension | `js`, `md/mjs`, `standard`, `framework`, `single_repo`, `openspec_native` | `codegraph tool_run` | PASS | 97.0s | 14 | 1,225,402 | 645,178 | avoid; ~3.0x total tokens |
| current extension warm | `js`, `md/mjs`, `standard`, `framework`, `single_repo`, `openspec_native` | `rg baseline` | PASS | 58.8s | 9 | 439,844 | 270,500 | baseline |
| current extension warm | `js`, `md/mjs`, `standard`, `framework`, `single_repo`, `openspec_native` | `codegraph tool_run` | PASS | 94.6s | 20 | 892,047 | 506,639 | avoid; still ~2.0x total tokens |
| mini js/md warm | `js`, `mini`, `framework`, `single_repo`, `none` | `rg baseline` | PASS | 108.8s | 32 | 905,731 | 486,019 | baseline |
| mini js/md warm | `js`, `mini`, `framework`, `single_repo`, `none` | `codegraph tool_run` | PASS | 92.8s | 24 | 863,813 | 479,045 | weak conditional; -4.6% total tokens |

Вывод по samples: on-demand indexing проигрывает. Warm index может иногда дать экономию, но слабый win не достаточен для default recommendation.

## Forced 47-Profile CLI Matrix

Этот прогон не является model-token trace. Он нужен для coverage по всем 47 anonymous profiles: `rg --files` + `rg -l` сравнивался с `codegraph init/index/context/uninit` на sanitized fixtures.

| Metric | Value |
|---|---:|
| Profiles | 47 |
| Test rows | 94 |
| `rg baseline` tests | 47 |
| CodeGraph tool-run tests | 47 |
| CodeGraph lifecycle PASS | 47 |
| Purge PASS | 47 |
| `avoid_mini_overhead` | 23 |
| `avoid_no_useful_context` | 18 |
| `conditional_noisy_rg` | 4 |
| `conditional_broad_graph` | 2 |

Главный вывод: safe lifecycle не равен useful retrieval. На generic architecture prompt CodeGraph часто возвращал header-only/no useful context, поэтому low output size сам по себе не считается победой.

## Финальная AI Tester Screening Matrix

Финальный reduced screening run: `screening-codegraph-preinit-nosipout-gpt54mini`.

Полная таблица по skill и rows находится в [ai-tester-token-matrices-screening-codegraph.md](ai-tester-token-matrices-screening-codegraph.md). Raw artifact: `.ai-factory/state/ai-tester-matrix-for-memory-tool-metadata/screening-codegraph-preinit-nosipout-gpt54mini/ai-tester-token-matrices.json`.

| Metric | rg | CodeGraph | CodeGraph delta |
|---|---:|---:|---:|
| Paired rows | 150 | 150 |  |
| PASS rows | 148 | 134 | -9.5% |
| FAIL rows | 2 | 16 | +700.0% |
| Duration seconds | 15,371.5 | 18,604.2 | +21.0% |
| Tool calls | 2,614 | 3,387 | +29.6% |
| Total tokens | 173,842,193 | 270,628,842 | +55.7% |
| Input tokens | 89,049,532 | 137,759,204 | +54.7% |
| Output tokens | 1,065,429 | 1,329,030 | +24.7% |
| Input+output tokens | 90,114,961 | 139,088,234 | +54.3% |

Useful-case counts считаются только по 132 PASS/PASS pairs:

| Better case | Count | Percent |
|---|---:|---:|
| CodeGraph lower total tokens | 46 | 34.8% |
| CodeGraph lower input+output tokens | 45 | 34.1% |
| CodeGraph faster | 49 | 37.1% |
| CodeGraph fewer tool calls | 49 | 37.1% |

Общий вывод: CodeGraph не является default token/time saver. Есть полезные rows, но они узкие и завязаны на `skill + labels`.

## Сигналы По Skill

| Skill | Pairs | Lower total tokens | Faster | Avg total delta | Decision |
|---|---:|---:|---:|---:|---|
| `aif-implement` | 12 | 8 (66.7%) | 8 (66.7%) | +34.9% | sample more |
| `aif-rules-check` | 12 | 6 (50.0%) | 7 (58.3%) | +6.5% | sample more |
| `aif-review` | 15 | 8 (53.3%) | 8 (53.3%) | +121.0% | avoid by default |
| `aif-verify` | 13 | 6 (46.2%) | 5 (38.5%) | +152.9% | avoid by default |
| `aif-fix` | 14 | 6 (42.9%) | 6 (42.9%) | +206.4% | avoid by default |
| `aif-docs` | 12 | 5 (41.7%) | 2 (16.7%) | +299.1% | avoid by default |
| `aif-commit` | 12 | 3 (25.0%) | 5 (41.7%) | +169.7% | avoid by default |
| `aif-explore` | 13 | 3 (23.1%) | 3 (23.1%) | +190.5% | avoid by default |
| `aif-plan` | 14 | 1 (7.1%) | 4 (28.6%) | +158.4% | avoid by default |
| `aif-analyze` | 15 | 0 (0.0%) | 1 (6.7%) | +291.8% | avoid by default |

Ни один skill не стал `recommend`. Даже `aif-implement` и `aif-rules-check` имеют positive rows, но среднее потребление токенов всё равно хуже `rg`.

## Сигналы По Label

| Label | Pairs | Lower total tokens | Avg total delta | Decision |
|---|---:|---:|---:|---|
| `go` | 9 | 4 (44.4%) | +19.3% | sample more, not recommend |
| `no-primary-language` | 19 | 10 (52.6%) | +55.7% | avoid by default |
| `mini` | 64 | 27 (42.2%) | +119.3% | avoid by default |
| `small_microservice` | 64 | 27 (42.2%) | +119.3% | avoid by default |
| `single_repo` | 97 | 35 (36.1%) | +132.3% | avoid by default |
| `large_framework_app` | 33 | 8 (24.2%) | +157.5% | avoid by default |
| `js` | 87 | 30 (34.5%) | +179.5% | avoid by default |
| `framework` | 113 | 36 (31.9%) | +184.3% | avoid by default |
| `standard` | 68 | 19 (27.9%) | +209.5% | avoid by default |
| `php` | 34 | 8 (23.5%) | +210.0% | avoid by default |
| `legacy_ai_factory_only` | 36 | 13 (36.1%) | +234.1% | avoid by default |
| `rust` | 17 | 5 (29.4%) | +240.9% | avoid by default |
| `multirepo` | 35 | 11 (31.4%) | +258.6% | avoid by default |
| `openspec_native` | 24 | 5 (20.8%) | +294.4% | avoid by default |
| `monorepo` | 19 | 7 (36.8%) | +330.2% | avoid by default |

Label-only selection запрещена: все broad labels в среднем проигрывают `rg`.

## Где Лучше Использовать

CodeGraph можно рекомендовать только если одновременно выполняются условия:

- есть exact match по labels ниже;
- skill входит в указанную строку;
- сначала уже был `rg baseline`;
- вопрос не exact file/symbol lookup;
- CodeGraph вернул non-empty useful `files/query/context`;
- есть explicit project path и purge.

| Labels | Skills | Лучший observed signal | Решение |
|---|---|---|---|
| `js+php`, `standard`, `framework`, `multirepo`, `openspec_native` | `aif-docs`, `aif-implement` | `aif-docs`: -82.7% total, -80.6% input+output; `aif-implement`: -54.5% total | Использовать только exact case; docs skill overall все равно avoid |
| `js`, `standard`, `framework`, `monorepo`, `legacy_ai_factory_only`, `multirepo` | `aif-implement`, `aif-explore`, `aif-review`, `aif-verify`, `aif-commit` | `aif-implement`: -74.0%; `aif-explore`: -60.6%; `aif-review`: -55.4% total | Лучший current explore/implement case |
| `js`, `mini`, `framework`, `single_repo`, `none`, `small_microservice` | `aif-commit`, `aif-review`, `aif-verify`, `aif-implement`, `aif-fix`, `aif-rules-check`, `aif-explore`, `aif-docs` | `aif-commit`: -73.9%; `aif-review`: -63.2%; `aif-implement`: -54.0%/-41.0% total | Исключение из mini avoidance; не применять для exact lookup |
| `no-primary-language`, `mini`, `single_repo`, `none`, `small_microservice` | `aif-rules-check`, `aif-review`, `aif-docs`, `aif-commit`, `aif-fix`, `aif-implement` | `aif-rules-check`: -68.9%; `aif-review`: -46.2%; `aif-docs`: -44.6% total | Только exact labels; no-primary-language alone недостаточно |
| `php+js`, `standard`, `framework`, `multirepo`, `legacy_ai_factory_only` | `aif-verify`, `aif-rules-check` | `aif-verify`: -67.4%; `aif-rules-check`: -17.6% total | Gate-only case |
| `js+go`, `standard`, `framework`, `single_repo`, `legacy_ai_factory_only`, `large_framework_app` | `aif-commit`, `aif-implement`, `aif-review` | `aif-commit`: -60.3%; `aif-implement`: -38.2% total | Не считать Go recommendation |
| `rust`, `mini`, `framework`, `single_repo`, `legacy_ai_factory_only`, `small_microservice` | `aif-fix`, `aif-implement`, `aif-review` | `aif-fix`: -40.5%; `aif-implement`: -32.9% total | Exact legacy Rust mini case |
| `rust`, `mini`, `framework`, `single_repo`, `none`, `small_microservice` | `aif-rules-check`, `aif-verify` | `aif-rules-check`: -20.3%; `aif-verify`: -13.1% total | Weak targeted gate case |
| `php`, `standard`, `framework`, `single_repo`, `none`, `large_framework_app` | `aif-verify` | -17.0% total, -35.6% duration | Weak verify-only case |

## Где Точно Не Стоит

| Labels / Ситуация | Почему не стоит |
|---|---|
| Любой `language_only`: `php`, `go`, `js`, `rust`, `multi` | Ни один язык сам по себе не дает stable win; даже `go` только `sample more` и все равно +19.3% total tokens |
| `framework` без exact skill+labels | 113 pairs, средний total tokens +184.3% |
| `multirepo` без exact skill+labels | 35 pairs, средний total tokens +258.6% |
| `large_framework_app` без exact skill+labels | 33 pairs, средний total tokens +157.5% |
| `openspec_native` без exact skill+labels | 24 pairs, средний total tokens +294.4% |
| `monorepo` без exact skill+labels | 19 pairs, средний total tokens +330.2% |
| `mini` или `small_microservice` для exact lookup | `rg` проще и дешевле; CodeGraph allowed только для записанных exception cases |
| `aif-analyze` | 0/15 lower total-token rows, средний total tokens +291.8% |
| `aif-plan` | 1/14 lower total-token rows, средний total tokens +158.4% |
| `aif-docs`, `aif-review`, `aif-fix`, `aif-verify`, `aif-commit`, `aif-explore` по skill-only | У каждого есть отдельные wins, но среднее хуже `rg`; нужен exact labels match |
| Header-only или пустой CodeGraph output | Low token count не считается полезностью |
| On-demand setup без user opt-in | `init/index` cost часто съедает всю потенциальную экономию |

## Итоговая Политика

CodeGraph остается `manual_cli_only` и `avoid_by_default`.

Рекомендовать:

- только после `rg`;
- только при exact `skill + labels` match;
- только когда нужен graph/symbol context;
- только с explicit project path;
- только с purge через `codegraph uninit --force <project>`.

Не рекомендовать:

- по языку;
- по skill;
- по broad project label;
- для exact file/symbol lookup;
- для validation gates как canonical evidence;
- если CodeGraph output пустой или header-only.
