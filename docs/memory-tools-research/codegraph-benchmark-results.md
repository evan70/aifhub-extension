# CodeGraph Benchmark Results

Эта страница хранит видимые paired results для CodeGraph: сначала `rg baseline`, затем тот же task через `codegraph tool_run`. Набор покрывает 47 anonymous project profiles.

Task: `architecture_or_impact_discovery`.

## AI Tester Skill Matrices

Матрица сгенерирована как `skill -> 47 проектов с rg -> 47 проектов с CodeGraph`. Полный набор сценариев лежит в `.ai-factory/state/ai-tester-matrix-for-memory-tool-metadata/all-projects-codegraph-all-skills-architecture-full47`.

| Skill | Profiles | rg baseline cases | CodeGraph tool_run cases | Total cases |
|---|---:|---:|---:|---:|
| `aif-analyze` | 47 | 47 | 47 | 94 |
| `aif-commit` | 47 | 47 | 47 | 94 |
| `aif-done` | 47 | 47 | 47 | 94 |
| `aif-explore` | 47 | 47 | 47 | 94 |
| `aif-fix` | 47 | 47 | 47 | 94 |
| `aif-implement` | 47 | 47 | 47 | 94 |
| `aif-plan` | 47 | 47 | 47 | 94 |
| `aif-review` | 47 | 47 | 47 | 94 |
| `aif-rules-check` | 47 | 47 | 47 | 94 |
| `aif-verify` | 47 | 47 | 47 | 94 |

All-skills total: 47 profiles, 470 rg cases, 470 CodeGraph cases, 940 scenarios.

Фактическая model-token матрица по skill строится из реальных `ai-tester` traces в [AI Tester Token Matrices](ai-tester-token-matrices.md). Этот отчёт регенерируется после каждого `ai-tester` scenario; строки без trace явно помечаются `NOT_RUN`.

## AI Tester Token Traces

Эти строки взяты из реальных `ai-tester` traces. `Total tokens` = input + output + cache creation + cache read. `Input+output tokens` = строка tokens из scenario summary без cache.

### Cold / On-Demand Tool Runs

| Project profile | Tags | Run | Status | Duration | Tool calls | Total tokens | Input+output tokens | Decision |
|---|---|---|---|---:|---:|---:|---:|---|
| current extension | `standard`, `framework`, `single_repo`, `openspec_native`, `js`, `md/mjs` | `rg baseline` | PASS | 78.4s | 7 | 407,581 | 263,197 | baseline |
| current extension | `standard`, `framework`, `single_repo`, `openspec_native`, `js`, `md/mjs` | `codegraph tool_run` | PASS | 97.0s | 14 | 1,225,402 | 645,178 | avoid default; ~3.0x total tokens |
| mini js/md | `mini`, `framework`, `single_repo`, `none`, `js`, `md` | `rg baseline` | PASS | 114.4s | 25 | 846,092 | 472,460 | baseline |
| mini js/md | `mini`, `framework`, `single_repo`, `none`, `js`, `md` | `codegraph tool_run` | PASS | 223.3s | 43 | 1,957,735 | 1,033,191 | avoid mini; ~2.3x total tokens |

### Preinitialized / Warm Index Tool Runs

Перед этими `ai-tester` сценариями фикстура выполняет `setup_commands`: `codegraph init .` и `codegraph index --quiet .`. Во время model turn запрещены повторные `codegraph init` и `codegraph index`; tool-run должен читать уже готовый индекс через `codegraph files`, `codegraph query` или `codegraph context`, затем выполнить `codegraph uninit --force .`.

| Project profile | Tags | Run | Status | Duration | Tool calls | Total tokens | Input+output tokens | Decision |
|---|---|---|---|---:|---:|---:|---:|---|
| current extension | `standard`, `framework`, `single_repo`, `openspec_native`, `js`, `md/mjs` | `rg baseline` | PASS | 58.8s | 9 | 439,844 | 270,500 | baseline with setup parity |
| current extension | `standard`, `framework`, `single_repo`, `openspec_native`, `js`, `md/mjs` | `codegraph tool_run` | PASS | 94.6s | 20 | 892,047 | 506,639 | avoid default; still ~2.0x total tokens |
| mini js/md | `mini`, `framework`, `single_repo`, `none`, `js`, `md` | `rg baseline` | PASS | 108.8s | 32 | 905,731 | 486,019 | baseline with setup parity |
| mini js/md | `mini`, `framework`, `single_repo`, `none`, `js`, `md` | `codegraph tool_run` | PASS | 92.8s | 24 | 863,813 | 479,045 | conditional existing-index only; -4.6% total tokens, weak extra signal |

Stored trace summaries:

- current extension: `.ai-factory/state/ai-tester-matrix-for-memory-tool-metadata/current-folder-ai-tester-live-result/usage-summary.json`
- mini js/md: `.ai-factory/state/ai-tester-matrix-for-memory-tool-metadata/mini-js-md-ai-tester-live-result/usage-summary.json`
- current extension preinitialized: `.ai-factory/state/ai-tester-matrix-for-memory-tool-metadata/current-folder-ai-tester-preinit-result/usage-summary.json`
- mini js/md preinitialized: `.ai-factory/state/ai-tester-matrix-for-memory-tool-metadata/mini-js-md-ai-tester-preinit-result/usage-summary.json`

## Full 47 Project CLI Matrix

Этот прогон не является model-token trace. Он нужен для coverage по всем 47 profiles: `rg --files` + `rg -l` сравнивается с `codegraph init/index/context/uninit` на sanitized fixtures.

| Metric | Value |
|---|---:|
| Profiles | 47 |
| Test rows | 94 |
| rg baseline tests | 47 |
| CodeGraph tool_run tests | 47 |
| CodeGraph lifecycle PASS | 47 |
| Purge PASS | 47 |
| avoid_mini_overhead | 23 |
| conditional_noisy_rg | 4 |
| conditional_broad_graph | 2 |
| avoid_no_useful_context | 18 |

### 94 Test Rows

| Profile | Label | Run | Status | Duration ms | Output tokens | Decision |
|---|---|---|---|---:|---:|---|
| `matrix-profile-01` | no-primary-language; mini; mini; single_repo; none; small_microservice | rg baseline | PASS | 150 | 17 | `baseline` |
| `matrix-profile-01` | no-primary-language; mini; mini; single_repo; none; small_microservice | codegraph tool_run | PASS | 1886 | 16 | `avoid_mini_overhead` |
| `matrix-profile-02` | rust; mini; framework; single_repo; none; small_microservice | rg baseline | PASS | 77 | 94 | `baseline` |
| `matrix-profile-02` | rust; mini; framework; single_repo; none; small_microservice | codegraph tool_run | PASS | 2677 | 16 | `avoid_mini_overhead` |
| `matrix-profile-03` | rust; mini; framework; single_repo; legacy_ai_factory_only; small_microservice | rg baseline | PASS | 77 | 88 | `baseline` |
| `matrix-profile-03` | rust; mini; framework; single_repo; legacy_ai_factory_only; small_microservice | codegraph tool_run | PASS | 3247 | 2652 | `avoid_mini_overhead` |
| `matrix-profile-04` | js+go; standard; framework; single_repo; legacy_ai_factory_only; large_framework_app | rg baseline | PASS | 113 | 2418 | `baseline` |
| `matrix-profile-04` | js+go; standard; framework; single_repo; legacy_ai_factory_only; large_framework_app | codegraph tool_run | PASS | 2804 | 774 | `conditional_noisy_rg` |
| `matrix-profile-05` | js; standard; framework; monorepo; legacy_ai_factory_only; multirepo | rg baseline | PASS | 122 | 6237 | `baseline` |
| `matrix-profile-05` | js; standard; framework; monorepo; legacy_ai_factory_only; multirepo | codegraph tool_run | PASS | 9339 | 1018 | `conditional_broad_graph` |
| `matrix-profile-06` | js; standard; framework; single_repo; openspec_native; large_framework_app | rg baseline | PASS | 88 | 1735 | `baseline` |
| `matrix-profile-06` | js; standard; framework; single_repo; openspec_native; large_framework_app | codegraph tool_run | PASS | 3272 | 295 | `conditional_noisy_rg` |
| `matrix-profile-07` | js+php; standard; framework; multirepo; openspec_native; multirepo | rg baseline | PASS | 122 | 3916 | `baseline` |
| `matrix-profile-07` | js+php; standard; framework; multirepo; openspec_native; multirepo | codegraph tool_run | PASS | 4093 | 140 | `conditional_broad_graph` |
| `matrix-profile-08` | js; mini; framework; single_repo; none; small_microservice | rg baseline | PASS | 63 | 37 | `baseline` |
| `matrix-profile-08` | js; mini; framework; single_repo; none; small_microservice | codegraph tool_run | PASS | 1719 | 16 | `avoid_mini_overhead` |
| `matrix-profile-09` | js; mini; framework; single_repo; none; small_microservice | rg baseline | PASS | 67 | 34 | `baseline` |
| `matrix-profile-09` | js; mini; framework; single_repo; none; small_microservice | codegraph tool_run | PASS | 1855 | 16 | `avoid_mini_overhead` |
| `matrix-profile-10` | js; standard; framework; single_repo; none; large_framework_app | rg baseline | PASS | 131 | 2961 | `baseline` |
| `matrix-profile-10` | js; standard; framework; single_repo; none; large_framework_app | codegraph tool_run | PASS | 2043 | 16 | `avoid_no_useful_context` |
| `matrix-profile-11` | js; mini; framework; single_repo; none; small_microservice | rg baseline | PASS | 76 | 14 | `baseline` |
| `matrix-profile-11` | js; mini; framework; single_repo; none; small_microservice | codegraph tool_run | PASS | 1957 | 16 | `avoid_mini_overhead` |
| `matrix-profile-12` | php+js; standard; framework; monorepo; openspec_native; multirepo | rg baseline | PASS | 130 | 7405 | `baseline` |
| `matrix-profile-12` | php+js; standard; framework; monorepo; openspec_native; multirepo | codegraph tool_run | PASS | 6076 | 16 | `avoid_no_useful_context` |
| `matrix-profile-13` | php; standard; framework; single_repo; none; large_framework_app | rg baseline | PASS | 138 | 4872 | `baseline` |
| `matrix-profile-13` | php; standard; framework; single_repo; none; large_framework_app | codegraph tool_run | PASS | 17234 | 207 | `conditional_noisy_rg` |
| `matrix-profile-14` | php+js; standard; framework; multirepo; legacy_ai_factory_only; multirepo | rg baseline | PASS | 131 | 2646 | `baseline` |
| `matrix-profile-14` | php+js; standard; framework; multirepo; legacy_ai_factory_only; multirepo | codegraph tool_run | PASS | 3854 | 16 | `avoid_no_useful_context` |
| `matrix-profile-15` | php+js; standard; framework; single_repo; none; large_framework_app | rg baseline | PASS | 85 | 1055 | `baseline` |
| `matrix-profile-15` | php+js; standard; framework; single_repo; none; large_framework_app | codegraph tool_run | PASS | 4894 | 16 | `avoid_no_useful_context` |
| `matrix-profile-16` | no-primary-language; mini; mini; single_repo; none; small_microservice | rg baseline | PASS | 79 | 117 | `baseline` |
| `matrix-profile-16` | no-primary-language; mini; mini; single_repo; none; small_microservice | codegraph tool_run | PASS | 1898 | 16 | `avoid_mini_overhead` |
| `matrix-profile-17` | no-primary-language; mini; mini; single_repo; none; small_microservice | rg baseline | PASS | 77 | 4 | `baseline` |
| `matrix-profile-17` | no-primary-language; mini; mini; single_repo; none; small_microservice | codegraph tool_run | PASS | 1883 | 16 | `avoid_mini_overhead` |
| `matrix-profile-18` | js; standard; framework; single_repo; none; large_framework_app | rg baseline | PASS | 88 | 1155 | `baseline` |
| `matrix-profile-18` | js; standard; framework; single_repo; none; large_framework_app | codegraph tool_run | PASS | 2863 | 16 | `avoid_no_useful_context` |
| `matrix-profile-19` | go; standard; framework; single_repo; legacy_ai_factory_only; go_service | rg baseline | PASS | 110 | 6491 | `baseline` |
| `matrix-profile-19` | go; standard; framework; single_repo; legacy_ai_factory_only; go_service | codegraph tool_run | PASS | 13472 | 16 | `avoid_no_useful_context` |
| `matrix-profile-20` | go+js; standard; framework; single_repo; legacy_ai_factory_only; large_framework_app | rg baseline | PASS | 126 | 5987 | `baseline` |
| `matrix-profile-20` | go+js; standard; framework; single_repo; legacy_ai_factory_only; large_framework_app | codegraph tool_run | PASS | 14411 | 16 | `avoid_no_useful_context` |
| `matrix-profile-21` | php+js; standard; framework; multirepo; none; multirepo | rg baseline | PASS | 1170 | 3370 | `baseline` |
| `matrix-profile-21` | php+js; standard; framework; multirepo; none; multirepo | codegraph tool_run | PASS | 8997 | 16 | `avoid_no_useful_context` |
| `matrix-profile-22` | js+go; standard; framework; single_repo; openspec_native; large_framework_app | rg baseline | PASS | 119 | 211 | `baseline` |
| `matrix-profile-22` | js+go; standard; framework; single_repo; openspec_native; large_framework_app | codegraph tool_run | PASS | 2705 | 16 | `avoid_no_useful_context` |
| `matrix-profile-23` | js+go; standard; framework; single_repo; legacy_ai_factory_only; large_framework_app | rg baseline | PASS | 2511 | 5373 | `baseline` |
| `matrix-profile-23` | js+go; standard; framework; single_repo; legacy_ai_factory_only; large_framework_app | codegraph tool_run | PASS | 13099 | 16 | `avoid_no_useful_context` |
| `matrix-profile-24` | js+go+php; large; framework; multirepo; openspec_native; multirepo | rg baseline | PASS | 7676 | 8146 | `baseline` |
| `matrix-profile-24` | js+go+php; large; framework; multirepo; openspec_native; multirepo | codegraph tool_run | PASS | 17108 | 16 | `avoid_no_useful_context` |
| `matrix-profile-25` | js+go; standard; framework; single_repo; legacy_ai_factory_only; large_framework_app | rg baseline | PASS | 611 | 972 | `baseline` |
| `matrix-profile-25` | js+go; standard; framework; single_repo; legacy_ai_factory_only; large_framework_app | codegraph tool_run | PASS | 4029 | 16 | `avoid_no_useful_context` |
| `matrix-profile-26` | js+go; standard; framework; single_repo; legacy_ai_factory_only; large_framework_app | rg baseline | PASS | 437 | 972 | `baseline` |
| `matrix-profile-26` | js+go; standard; framework; single_repo; legacy_ai_factory_only; large_framework_app | codegraph tool_run | PASS | 4401 | 16 | `avoid_no_useful_context` |
| `matrix-profile-27` | js; large; framework; multirepo; openspec_native; multirepo | rg baseline | PASS | 441 | 758 | `baseline` |
| `matrix-profile-27` | js; large; framework; multirepo; openspec_native; multirepo | codegraph tool_run | PASS | 3420 | 16 | `avoid_no_useful_context` |
| `matrix-profile-28` | go+php; mini; framework; single_repo; none; small_microservice | rg baseline | PASS | 459 | 251 | `baseline` |
| `matrix-profile-28` | go+php; mini; framework; single_repo; none; small_microservice | codegraph tool_run | PASS | 1934 | 16 | `avoid_mini_overhead` |
| `matrix-profile-29` | go; standard; framework; single_repo; legacy_ai_factory_only; go_service | rg baseline | PASS | 605 | 505 | `baseline` |
| `matrix-profile-29` | go; standard; framework; single_repo; legacy_ai_factory_only; go_service | codegraph tool_run | PASS | 2714 | 16 | `avoid_no_useful_context` |
| `matrix-profile-30` | go+js+php; standard; framework; single_repo; legacy_ai_factory_only; large_framework_app | rg baseline | PASS | 1331 | 2288 | `baseline` |
| `matrix-profile-30` | go+js+php; standard; framework; single_repo; legacy_ai_factory_only; large_framework_app | codegraph tool_run | PASS | 5500 | 1073 | `conditional_noisy_rg` |
| `matrix-profile-31` | go+js; standard; framework; single_repo; legacy_ai_factory_only; large_framework_app | rg baseline | PASS | 1148 | 2588 | `baseline` |
| `matrix-profile-31` | go+js; standard; framework; single_repo; legacy_ai_factory_only; large_framework_app | codegraph tool_run | PASS | 4674 | 16 | `avoid_no_useful_context` |
| `matrix-profile-32` | js+go; standard; framework; single_repo; legacy_ai_factory_only; large_framework_app | rg baseline | PASS | 134 | 33 | `baseline` |
| `matrix-profile-32` | js+go; standard; framework; single_repo; legacy_ai_factory_only; large_framework_app | codegraph tool_run | PASS | 2375 | 16 | `avoid_no_useful_context` |
| `matrix-profile-33` | js; mini; framework; single_repo; none; small_microservice | rg baseline | PASS | 327 | 96 | `baseline` |
| `matrix-profile-33` | js; mini; framework; single_repo; none; small_microservice | codegraph tool_run | PASS | 1997 | 16 | `avoid_mini_overhead` |
| `matrix-profile-34` | js; standard; framework; monorepo; legacy_ai_factory_only; multirepo | rg baseline | PASS | 617 | 730 | `baseline` |
| `matrix-profile-34` | js; standard; framework; monorepo; legacy_ai_factory_only; multirepo | codegraph tool_run | PASS | 2316 | 16 | `avoid_no_useful_context` |
| `matrix-profile-35` | js; mini; framework; single_repo; none; small_microservice | rg baseline | PASS | 133 | 29 | `baseline` |
| `matrix-profile-35` | js; mini; framework; single_repo; none; small_microservice | codegraph tool_run | PASS | 2232 | 16 | `avoid_mini_overhead` |
| `matrix-profile-36` | js; mini; framework; single_repo; none; small_microservice | rg baseline | PASS | 111 | 11 | `baseline` |
| `matrix-profile-36` | js; mini; framework; single_repo; none; small_microservice | codegraph tool_run | PASS | 1956 | 16 | `avoid_mini_overhead` |
| `matrix-profile-37` | js; mini; framework; single_repo; none; small_microservice | rg baseline | PASS | 97 | 14 | `baseline` |
| `matrix-profile-37` | js; mini; framework; single_repo; none; small_microservice | codegraph tool_run | PASS | 1942 | 16 | `avoid_mini_overhead` |
| `matrix-profile-38` | js; mini; mini; single_repo; none; small_microservice | rg baseline | PASS | 106 | 32 | `baseline` |
| `matrix-profile-38` | js; mini; mini; single_repo; none; small_microservice | codegraph tool_run | PASS | 1997 | 16 | `avoid_mini_overhead` |
| `matrix-profile-39` | js; mini; framework; single_repo; none; small_microservice | rg baseline | PASS | 107 | 28 | `baseline` |
| `matrix-profile-39` | js; mini; framework; single_repo; none; small_microservice | codegraph tool_run | PASS | 1866 | 16 | `avoid_mini_overhead` |
| `matrix-profile-40` | js; mini; framework; single_repo; none; small_microservice | rg baseline | PASS | 139 | 13 | `baseline` |
| `matrix-profile-40` | js; mini; framework; single_repo; none; small_microservice | codegraph tool_run | PASS | 1913 | 16 | `avoid_mini_overhead` |
| `matrix-profile-41` | js; mini; framework; single_repo; none; small_microservice | rg baseline | PASS | 85 | 8 | `baseline` |
| `matrix-profile-41` | js; mini; framework; single_repo; none; small_microservice | codegraph tool_run | PASS | 1809 | 16 | `avoid_mini_overhead` |
| `matrix-profile-42` | js; mini; mini; single_repo; none; small_microservice | rg baseline | PASS | 114 | 11 | `baseline` |
| `matrix-profile-42` | js; mini; mini; single_repo; none; small_microservice | codegraph tool_run | PASS | 1746 | 16 | `avoid_mini_overhead` |
| `matrix-profile-43` | js; mini; framework; single_repo; none; small_microservice | rg baseline | PASS | 89 | 16 | `baseline` |
| `matrix-profile-43` | js; mini; framework; single_repo; none; small_microservice | codegraph tool_run | PASS | 1764 | 16 | `avoid_mini_overhead` |
| `matrix-profile-44` | js; mini; framework; single_repo; none; small_microservice | rg baseline | PASS | 111 | 17 | `baseline` |
| `matrix-profile-44` | js; mini; framework; single_repo; none; small_microservice | codegraph tool_run | PASS | 1754 | 16 | `avoid_mini_overhead` |
| `matrix-profile-45` | js; mini; framework; single_repo; none; small_microservice | rg baseline | PASS | 86 | 14 | `baseline` |
| `matrix-profile-45` | js; mini; framework; single_repo; none; small_microservice | codegraph tool_run | PASS | 1912 | 16 | `avoid_mini_overhead` |
| `matrix-profile-46` | js; mini; framework; single_repo; none; small_microservice | rg baseline | PASS | 71 | 8 | `baseline` |
| `matrix-profile-46` | js; mini; framework; single_repo; none; small_microservice | codegraph tool_run | PASS | 1778 | 16 | `avoid_mini_overhead` |
| `matrix-profile-47` | js; mini; framework; single_repo; none; small_microservice | rg baseline | PASS | 199 | 19 | `baseline` |
| `matrix-profile-47` | js; mini; framework; single_repo; none; small_microservice | codegraph tool_run | PASS | 1977 | 16 | `avoid_mini_overhead` |

Conclusion: CodeGraph remains `manual_cli_only`. It is forbidden as a default tool for mini projects and generic architecture prompts that require on-demand indexing. If a CodeGraph index already exists, it can be conditionally reused after `rg` for broad graph discovery, but only when `files/query/context` returns non-empty useful output and the run ends with `codegraph uninit --force <project>` for temporary fixtures. Full 47-project CLI evidence keeps the same policy direction: 23 mini profiles are avoid, 18 profiles returned no useful context, and only 6 profiles are conditional.
