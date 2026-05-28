# AI Tester Token Matrices

Источник этой таблицы - реальные `ai-tester` trace JSON из `runs/`. `NOT_RUN` означает, что сценарий есть в матрице, но model run для него еще не выполнен.

| Metric | Value |
|---|---:|
| Total rows | 300 |
| Executed rows | 300 |
| PASS rows | 282 |
| FAIL rows | 18 |
| NOT_RUN rows | 0 |
| Trace files read | 377 |

## Paired Rg Vs CodeGraph

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

| PASS/PASS paired rows used for useful-case counts | 132 | 88.0% |

| Better case count | Count | Percent of PASS/PASS pairs |
|---|---:|---:|
| CodeGraph lower total tokens | 46 | 34.8% |
| CodeGraph lower input+output tokens | 45 | 34.1% |
| CodeGraph faster | 49 | 37.1% |
| CodeGraph fewer tool calls | 49 | 37.1% |

## CodeGraph Useful Cases

| skill | project | labels | useful signal | total tokens delta | input+output delta | duration delta | tool calls delta | rg total tokens | CodeGraph total tokens |
|---|---|---|---|---:|---:|---:|---:|---:|---:|
| aif-docs | matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | total tokens, input+output, duration, tool calls | -82.7% | -80.6% | -31.8% | -76.9% | 1,994,976 | 344,463 |
| aif-implement | matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | total tokens, input+output, duration, tool calls | -74.0% | -71.4% | -29.0% | -52.9% | 1,973,775 | 512,523 |
| aif-commit | matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | total tokens, input+output, duration, tool calls | -73.9% | -73.8% | -59.8% | -77.6% | 2,399,126 | 626,438 |
| aif-fix | matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | total tokens, input+output, duration, tool calls | -73.4% | -73.0% | -46.1% | -77.8% | 3,068,561 | 816,725 |
| aif-rules-check | matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | total tokens, input+output, duration, tool calls | -68.9% | -68.1% | -40.7% | -31.3% | 1,985,857 | 618,554 |
| aif-verify | matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | total tokens, input+output, duration, tool calls | -67.4% | -64.1% | -22.4% | -75.0% | 1,831,625 | 596,435 |
| aif-review | matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | total tokens, input+output, duration, tool calls | -63.2% | -63.5% | -44.3% | -72.7% | 2,469,450 | 908,010 |
| aif-explore | matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | total tokens, input+output, duration, tool calls | -60.6% | -60.8% | -48.5% | -55.8% | 4,256,123 | 1,678,798 |
| aif-commit | matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | total tokens, input+output, duration, tool calls | -60.3% | -57.5% | -45.5% | -53.8% | 2,176,877 | 865,176 |
| aif-docs | matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | total tokens, input+output, tool calls | -58.6% | -58.0% | +22.2% | -53.6% | 1,245,086 | 515,864 |
| aif-review | matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | total tokens, input+output, duration, tool calls | -55.4% | -56.2% | -30.4% | -81.1% | 1,537,534 | 685,168 |
| aif-implement | matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | total tokens, input+output, duration, tool calls | -54.5% | -53.3% | -36.2% | -21.7% | 2,135,713 | 970,969 |
| aif-implement | matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | total tokens, input+output, duration, tool calls | -54.0% | -51.0% | -19.5% | -28.9% | 1,709,816 | 786,967 |
| aif-fix | matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | total tokens, input+output, duration, tool calls | -52.2% | -51.9% | -33.1% | -44.4% | 1,042,717 | 498,136 |
| aif-review | matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | total tokens, input+output, duration, tool calls | -46.2% | -45.4% | -8.1% | -11.5% | 2,033,537 | 1,093,991 |
| aif-docs | matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | total tokens, input+output | -44.6% | -41.3% | +24.2% | +26.7% | 1,902,823 | 1,054,556 |
| aif-verify | matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | total tokens, input+output, duration, tool calls | -43.8% | -42.7% | -6.8% | -7.3% | 1,821,577 | 1,024,537 |
| aif-implement | matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | total tokens, input+output, duration, tool calls | -41.0% | -40.5% | -9.2% | -31.0% | 1,248,823 | 736,209 |
| aif-fix | matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | total tokens, input+output, duration, tool calls | -40.5% | -42.0% | -42.7% | -76.7% | 1,890,629 | 1,124,901 |
| aif-implement | matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | total tokens, input+output, duration, tool calls | -38.2% | -39.5% | -43.2% | -50.0% | 308,450 | 190,597 |
| aif-verify | matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | total tokens, input+output | -36.9% | -32.4% | +11.9% | 0.0% | 1,247,339 | 787,473 |
| aif-rules-check | matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | total tokens, input+output, duration, tool calls | -36.2% | -36.5% | -25.9% | -59.1% | 917,525 | 585,083 |
| aif-fix | matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | total tokens, input+output, tool calls | -35.9% | -36.8% | +23.2% | -14.3% | 1,535,915 | 984,349 |
| aif-implement | matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | total tokens, input+output, duration, tool calls | -34.5% | -34.6% | -17.2% | -39.1% | 1,807,938 | 1,184,428 |
| aif-rules-check | matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | total tokens, input+output, duration, tool calls | -33.1% | -34.3% | -19.5% | -22.7% | 2,457,701 | 1,643,136 |
| aif-implement | matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | total tokens, input+output, duration, tool calls | -32.9% | -30.6% | -6.3% | -10.7% | 1,908,131 | 1,281,234 |
| aif-commit | matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | total tokens, input+output, duration, tool calls | -32.4% | -32.3% | -30.6% | -29.0% | 2,465,199 | 1,667,131 |
| aif-explore | matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | total tokens, input+output, duration, tool calls | -31.1% | -30.7% | -21.9% | -35.2% | 3,639,407 | 2,506,173 |
| aif-fix | matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | total tokens, input+output, duration | -29.5% | -24.5% | -13.6% | +16.7% | 807,461 | 569,132 |
| aif-review | matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | total tokens, input+output, duration, tool calls | -26.1% | -28.3% | -19.2% | -40.0% | 1,336,872 | 988,291 |
| aif-rules-check | matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | total tokens, input+output, duration, tool calls | -25.7% | -27.0% | -77.9% | -37.5% | 2,101,796 | 1,561,953 |
| aif-rules-check | matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | total tokens, input+output, duration, tool calls | -20.3% | -20.0% | -2.3% | -31.6% | 1,078,689 | 859,332 |
| aif-review | matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | total tokens, input+output, duration | -19.0% | -15.7% | -7.7% | +69.2% | 1,619,645 | 1,311,444 |
| aif-review | matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | total tokens, input+output, duration | -18.5% | -17.0% | -24.0% | +14.3% | 1,686,241 | 1,374,702 |
| aif-rules-check | matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | total tokens, input+output, duration, tool calls | -17.6% | -17.1% | -5.5% | -38.5% | 1,316,001 | 1,084,917 |
| aif-implement | matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | total tokens, input+output, tool calls | -17.5% | -15.6% | +2.8% | -33.3% | 893,804 | 737,528 |
| aif-verify | matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | total tokens, input+output, duration, tool calls | -17.0% | -17.9% | -35.6% | -62.5% | 1,027,466 | 852,699 |
| aif-verify | matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | total tokens, input+output, duration, tool calls | -13.1% | -16.7% | -54.6% | -81.1% | 1,346,811 | 1,169,945 |
| aif-review | matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | total tokens, input+output, duration, tool calls | -10.8% | -8.9% | -0.3% | -13.0% | 2,545,443 | 2,271,492 |
| aif-plan | matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | total tokens, input+output, duration | -10.7% | -5.0% | -13.5% | +50.0% | 1,416,618 | 1,265,721 |
| aif-fix | matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | total tokens, input+output, duration, tool calls | -10.0% | -13.4% | -43.5% | -33.3% | 1,205,984 | 1,085,701 |
| aif-verify | matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | total tokens, input+output, duration, tool calls | -9.1% | -11.5% | -1.2% | -20.0% | 536,564 | 487,569 |
| aif-docs | matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | total tokens, input+output, duration, tool calls | -9.0% | -9.4% | -12.2% | -39.4% | 1,970,693 | 1,794,213 |
| aif-docs | matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | total tokens, input+output | -6.6% | -8.2% | +7.9% | +26.9% | 1,922,926 | 1,796,426 |
| aif-explore | matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | total tokens, duration | -1.1% | +1.2% | -16.5% | +10.5% | 1,977,862 | 1,955,516 |
| aif-review | matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | total tokens, input+output, duration, tool calls | -0.5% | -5.9% | -18.2% | -55.2% | 1,040,400 | 1,034,972 |
| aif-plan | matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | tool calls | +1.0% | +4.1% | 0.0% | -20.0% | 1,812,629 | 1,830,744 |
| aif-commit | matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | tool calls | +2.7% | +8.3% | +2.8% | -23.1% | 1,063,908 | 1,092,765 |
| aif-commit | matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | tool calls | +4.1% | +4.1% | +4.5% | -45.2% | 1,728,528 | 1,800,148 |
| aif-commit | matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | duration, tool calls | +5.4% | +4.6% | -25.9% | -16.7% | 993,243 | 1,046,567 |
| aif-rules-check | matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | duration, tool calls | +14.8% | +12.0% | -24.6% | -17.9% | 1,185,971 | 1,362,040 |
| aif-plan | matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | tool calls | +18.3% | +18.8% | +30.1% | -5.9% | 617,531 | 730,446 |
| aif-plan | matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | duration | +25.7% | +25.6% | -13.6% | +70.0% | 712,437 | 895,487 |
| aif-fix | matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | duration, tool calls | +34.7% | +37.8% | -10.5% | -40.0% | 1,523,609 | 2,051,602 |
| aif-review | matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | tool calls | +36.6% | +31.7% | +16.2% | -28.6% | 560,006 | 764,931 |
| aif-plan | matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | duration | +46.5% | +43.0% | -6.6% | +80.0% | 485,633 | 711,271 |
| aif-verify | matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | tool calls | +49.3% | +50.6% | +27.9% | -25.0% | 826,957 | 1,234,845 |
| aif-implement | matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | duration | +50.4% | +48.6% | -8.8% | +40.0% | 1,308,273 | 1,967,899 |
| aif-analyze | matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | duration | +52.2% | +49.0% | -10.8% | +13.3% | 1,079,695 | 1,643,312 |
| aif-plan | matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | duration, tool calls | +57.4% | +46.1% | -8.1% | -13.3% | 965,373 | 1,519,797 |
| aif-commit | matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | duration, tool calls | +102.3% | +90.4% | -2.1% | -6.3% | 758,028 | 1,533,474 |

## CodeGraph Signals By Skill

| skill | pairs | lower total tokens | lower input+output | faster | fewer tool calls | avg total delta | avg input+output delta | decision |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| aif-implement | 12 | 8 (66.7%) | 8 (66.7%) | 8 (66.7%) | 8 (66.7%) | +34.9% | +36.0% | sample more |
| aif-review | 15 | 8 (53.3%) | 8 (53.3%) | 8 (53.3%) | 7 (46.7%) | +121.0% | +121.0% | avoid by default |
| aif-rules-check | 12 | 6 (50.0%) | 6 (50.0%) | 7 (58.3%) | 7 (58.3%) | +6.5% | +4.8% | sample more |
| aif-verify | 13 | 6 (46.2%) | 6 (46.2%) | 5 (38.5%) | 6 (46.2%) | +152.9% | +151.9% | avoid by default |
| aif-fix | 14 | 6 (42.9%) | 6 (42.9%) | 6 (42.9%) | 6 (42.9%) | +206.4% | +183.8% | avoid by default |
| aif-docs | 12 | 5 (41.7%) | 5 (41.7%) | 2 (16.7%) | 3 (25.0%) | +299.1% | +290.5% | avoid by default |
| aif-commit | 12 | 3 (25.0%) | 3 (25.0%) | 5 (41.7%) | 7 (58.3%) | +169.7% | +126.4% | avoid by default |
| aif-explore | 13 | 3 (23.1%) | 2 (15.4%) | 3 (23.1%) | 2 (15.4%) | +190.5% | +178.8% | avoid by default |
| aif-plan | 14 | 1 (7.1%) | 1 (7.1%) | 4 (28.6%) | 3 (21.4%) | +158.4% | +154.8% | avoid by default |
| aif-analyze | 15 | 0 (0.0%) | 0 (0.0%) | 1 (6.7%) | 0 (0.0%) | +291.8% | +256.1% | avoid by default |

## CodeGraph Signals By Label

| label | pairs | lower total tokens | lower input+output | faster | fewer tool calls | avg total delta | avg input+output delta | decision |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| framework | 113 | 36 (31.9%) | 35 (31.0%) | 41 (36.3%) | 41 (36.3%) | +184.3% | +169.5% | avoid by default |
| single_repo | 97 | 35 (36.1%) | 34 (35.1%) | 38 (39.2%) | 37 (38.1%) | +132.3% | +124.3% | avoid by default |
| js | 87 | 30 (34.5%) | 29 (33.3%) | 33 (37.9%) | 32 (36.8%) | +179.5% | +165.9% | avoid by default |
| none | 72 | 28 (38.9%) | 28 (38.9%) | 28 (38.9%) | 31 (43.1%) | +88.8% | +83.7% | avoid by default |
| mini | 64 | 27 (42.2%) | 27 (42.2%) | 27 (42.2%) | 29 (45.3%) | +119.3% | +110.0% | avoid by default |
| small_microservice | 64 | 27 (42.2%) | 27 (42.2%) | 27 (42.2%) | 29 (45.3%) | +119.3% | +110.0% | avoid by default |
| standard | 68 | 19 (27.9%) | 18 (26.5%) | 22 (32.4%) | 20 (29.4%) | +209.5% | +193.4% | avoid by default |
| legacy_ai_factory_only | 36 | 13 (36.1%) | 12 (33.3%) | 15 (41.7%) | 13 (36.1%) | +234.1% | +210.8% | avoid by default |
| multirepo | 35 | 11 (31.4%) | 11 (31.4%) | 11 (31.4%) | 12 (34.3%) | +258.6% | +232.4% | avoid by default |
| no-primary-language | 19 | 10 (52.6%) | 10 (52.6%) | 8 (42.1%) | 8 (42.1%) | +55.7% | +54.5% | avoid by default |
| php | 34 | 8 (23.5%) | 8 (23.5%) | 9 (26.5%) | 10 (29.4%) | +210.0% | +185.4% | avoid by default |
| large_framework_app | 33 | 8 (24.2%) | 7 (21.2%) | 11 (33.3%) | 8 (24.2%) | +157.5% | +151.9% | avoid by default |
| monorepo | 19 | 7 (36.8%) | 7 (36.8%) | 6 (31.6%) | 8 (42.1%) | +330.2% | +302.9% | avoid by default |
| rust | 17 | 5 (29.4%) | 5 (29.4%) | 6 (35.3%) | 6 (35.3%) | +240.9% | +214.9% | avoid by default |
| openspec_native | 24 | 5 (20.8%) | 5 (20.8%) | 6 (25.0%) | 5 (20.8%) | +294.4% | +274.0% | avoid by default |
| go | 9 | 4 (44.4%) | 3 (33.3%) | 5 (55.6%) | 3 (33.3%) | +19.3% | +17.9% | sample more |

## aif-analyze

| Metric | Value |
|---|---:|
| Matrix rows | 30 |
| Executed rows | 30 |
| PASS rows | 30 |
| NOT_RUN rows | 0 |
| rg executed | 15 |
| CodeGraph executed | 15 |

| project | labels | run | status | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens | cache-read tokens |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 48.2s | 3 | 347,796 | 196,501 | 2,303 | 198,804 | 148,992 |
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 131.9s | 17 | 1,582,225 | 821,337 | 6,328 | 827,665 | 754,560 |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | PASS | 83.0s | 8 | 873,697 | 447,992 | 6,761 | 454,753 | 418,944 |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | PASS | 112.2s | 23 | 1,608,491 | 814,826 | 8,257 | 823,083 | 785,408 |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | PASS | 120.4s | 27 | 1,436,973 | 772,542 | 7,279 | 779,821 | 657,152 |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | PASS | 181.0s | 31 | 2,687,562 | 1,394,532 | 10,982 | 1,405,514 | 1,282,048 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 133.8s | 32 | 1,212,091 | 619,562 | 10,129 | 629,691 | 582,400 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 183.8s | 38 | 2,487,714 | 1,254,609 | 15,441 | 1,270,050 | 1,217,664 |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | PASS | 124.3s | 12 | 1,339,173 | 698,227 | 6,962 | 705,189 | 633,984 |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | PASS | 205.6s | 40 | 4,391,009 | 2,214,266 | 14,055 | 2,228,321 | 2,162,688 |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | rg baseline | PASS | 75.9s | 1 | 146,891 | 95,247 | 1,724 | 96,971 | 49,920 |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | codegraph tool_run | PASS | 151.1s | 16 | 2,291,911 | 1,156,173 | 8,954 | 1,165,127 | 1,126,784 |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | rg baseline | PASS | 101.2s | 7 | 519,219 | 263,335 | 6,668 | 270,003 | 249,216 |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | codegraph tool_run | PASS | 230.7s | 48 | 3,394,819 | 1,707,168 | 18,659 | 1,725,827 | 1,668,992 |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 71.4s | 23 | 736,637 | 398,802 | 6,443 | 405,245 | 331,392 |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 102.5s | 24 | 1,686,208 | 860,635 | 7,653 | 868,288 | 817,920 |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | PASS | 105.5s | 15 | 1,079,695 | 556,491 | 9,156 | 565,647 | 514,048 |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | PASS | 94.1s | 17 | 1,643,312 | 834,693 | 7,851 | 842,544 | 800,768 |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 101.0s | 24 | 738,094 | 370,656 | 7,886 | 378,542 | 359,552 |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 122.2s | 37 | 1,924,924 | 988,853 | 9,991 | 998,844 | 926,080 |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 76.0s | 15 | 507,070 | 255,900 | 4,514 | 260,414 | 246,656 |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 119.0s | 39 | 1,827,848 | 917,234 | 10,006 | 927,240 | 900,608 |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | PASS | 107.9s | 26 | 796,461 | 400,838 | 8,423 | 409,261 | 387,200 |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | PASS | 175.1s | 36 | 3,718,838 | 1,874,539 | 11,211 | 1,885,750 | 1,833,088 |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | PASS | 127.6s | 19 | 2,228,569 | 1,142,696 | 10,033 | 1,152,729 | 1,075,840 |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | PASS | 145.8s | 31 | 3,073,122 | 1,550,717 | 12,389 | 1,563,106 | 1,510,016 |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 148.6s | 46 | 1,958,321 | 989,894 | 13,291 | 1,003,185 | 955,136 |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 195.9s | 64 | 3,025,456 | 1,524,962 | 17,486 | 1,542,448 | 1,483,008 |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | rg baseline | PASS | 62.0s | 3 | 376,684 | 215,761 | 3,739 | 219,500 | 157,184 |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | PASS | 136.9s | 32 | 2,040,745 | 1,028,417 | 7,912 | 1,036,329 | 1,004,416 |

## aif-commit

| Metric | Value |
|---|---:|
| Matrix rows | 30 |
| Executed rows | 30 |
| PASS rows | 27 |
| NOT_RUN rows | 0 |
| rg executed | 15 |
| CodeGraph executed | 15 |

| project | labels | run | status | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens | cache-read tokens |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 91.7s | 9 | 1,024,943 | 513,240 | 6,103 | 519,343 | 505,600 |
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 122.1s | 24 | 2,232,053 | 1,150,678 | 7,839 | 1,158,517 | 1,073,536 |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | PASS | 153.3s | 26 | 2,176,877 | 1,092,095 | 11,886 | 1,103,981 | 1,072,896 |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | PASS | 83.5s | 12 | 865,176 | 463,697 | 5,703 | 469,400 | 395,776 |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | PASS | 97.3s | 13 | 1,063,908 | 541,176 | 4,844 | 546,020 | 517,888 |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | PASS | 100.0s | 10 | 1,092,765 | 584,964 | 6,169 | 591,133 | 501,632 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 125.9s | 29 | 1,290,519 | 645,953 | 9,174 | 655,127 | 635,392 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 137.1s | 31 | 2,146,922 | 1,080,365 | 10,813 | 1,091,178 | 1,055,744 |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | PASS | 147.7s | 15 | 1,398,527 | 725,796 | 12,123 | 737,919 | 660,608 |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | FAIL | 51.1s | 2 | 0 | 0 | 0 | 0 | 0 |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | rg baseline | PASS | 73.7s | 5 | 588,311 | 299,558 | 4,721 | 304,279 | 284,032 |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | codegraph tool_run | PASS | 126.3s | 25 | 1,309,517 | 686,196 | 9,177 | 695,373 | 614,144 |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | rg baseline | PASS | 38.2s | 1 | 148,807 | 96,133 | 1,730 | 97,863 | 50,944 |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | codegraph tool_run | PASS | 104.0s | 18 | 1,782,434 | 892,667 | 7,207 | 899,874 | 882,560 |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 147.5s | 31 | 2,465,199 | 1,238,109 | 11,218 | 1,249,327 | 1,215,872 |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 102.3s | 22 | 1,667,131 | 837,841 | 8,426 | 846,267 | 820,864 |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | FAIL | 76.1s | 8 | 1,053,959 | 558,348 | 5,243 | 563,591 | 490,368 |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | PASS | 165.8s | 45 | 3,694,946 | 1,859,085 | 14,805 | 1,873,890 | 1,821,056 |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 80.6s | 12 | 993,243 | 519,380 | 6,151 | 525,531 | 467,712 |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 59.7s | 10 | 1,046,567 | 546,163 | 3,636 | 549,799 | 496,768 |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 109.9s | 42 | 1,728,528 | 866,971 | 10,101 | 877,072 | 851,456 |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 114.8s | 23 | 1,800,148 | 903,619 | 9,361 | 912,980 | 887,168 |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | PASS | 106.6s | 16 | 758,028 | 404,328 | 8,484 | 412,812 | 345,216 |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | PASS | 104.4s | 15 | 1,533,474 | 780,632 | 5,322 | 785,954 | 747,520 |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | PASS | 56.3s | 3 | 473,914 | 247,510 | 3,684 | 251,194 | 222,720 |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | FAIL | 165.5s | 30 | 1,809,390 | 916,551 | 10,791 | 927,342 | 882,048 |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 182.7s | 58 | 2,399,126 | 1,219,425 | 15,029 | 1,234,454 | 1,164,672 |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 73.4s | 13 | 626,438 | 318,671 | 4,919 | 323,590 | 302,848 |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | rg baseline | PASS | 55.1s | 2 | 203,914 | 150,671 | 1,915 | 152,586 | 51,328 |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | PASS | 107.2s | 14 | 1,599,142 | 809,812 | 6,610 | 816,422 | 782,720 |

## aif-docs

| Metric | Value |
|---|---:|
| Matrix rows | 30 |
| Executed rows | 30 |
| PASS rows | 27 |
| NOT_RUN rows | 0 |
| rg executed | 15 |
| CodeGraph executed | 15 |

| project | labels | run | status | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens | cache-read tokens |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 42.7s | 5 | 388,028 | 194,191 | 2,349 | 196,540 | 191,488 |
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 124.0s | 16 | 1,499,569 | 774,362 | 7,767 | 782,129 | 717,440 |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | PASS | 133.9s | 39 | 1,730,464 | 913,876 | 10,316 | 924,192 | 806,272 |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | FAIL | 124.1s | 21 | 2,917,710 | 1,469,931 | 8,803 | 1,478,734 | 1,438,976 |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | PASS | 84.6s | 2 | 319,682 | 164,125 | 3,365 | 167,490 | 152,192 |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | PASS | 360.4s | 52 | 9,151,765 | 4,602,562 | 22,227 | 4,624,789 | 4,526,976 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 92.6s | 16 | 695,617 | 376,923 | 7,270 | 384,193 | 311,424 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | FAIL | 147.6s | 22 | 2,133,929 | 1,096,152 | 10,193 | 1,106,345 | 1,027,584 |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | PASS | 102.7s | 13 | 1,994,976 | 1,013,489 | 6,895 | 1,020,384 | 974,592 |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | PASS | 70.0s | 3 | 344,463 | 194,159 | 3,872 | 198,031 | 146,432 |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | rg baseline | PASS | 93.9s | 6 | 754,477 | 388,205 | 5,056 | 393,261 | 361,216 |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | codegraph tool_run | PASS | 130.5s | 14 | 1,844,294 | 933,499 | 9,035 | 942,534 | 901,760 |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | rg baseline | PASS | 100.4s | 20 | 747,014 | 372,429 | 9,401 | 381,830 | 365,184 |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | codegraph tool_run | PASS | 180.8s | 38 | 2,718,106 | 1,371,782 | 15,508 | 1,387,290 | 1,330,816 |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 116.2s | 15 | 1,902,823 | 957,561 | 9,326 | 966,887 | 935,936 |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 144.3s | 19 | 1,054,556 | 553,989 | 13,271 | 567,260 | 487,296 |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | PASS | 96.2s | 10 | 1,330,048 | 693,795 | 7,901 | 701,696 | 628,352 |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | PASS | 176.2s | 21 | 2,863,513 | 1,442,226 | 15,847 | 1,458,073 | 1,405,440 |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 69.1s | 18 | 735,102 | 370,005 | 5,033 | 375,038 | 360,064 |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 136.8s | 25 | 2,172,154 | 1,090,833 | 8,169 | 1,099,002 | 1,073,152 |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 80.9s | 28 | 1,245,086 | 624,430 | 7,280 | 631,710 | 613,376 |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 98.9s | 13 | 515,864 | 258,495 | 7,129 | 265,624 | 250,240 |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | PASS | 77.1s | 6 | 535,510 | 274,670 | 3,944 | 278,614 | 256,896 |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | PASS | 95.5s | 8 | 653,103 | 329,878 | 5,017 | 334,895 | 318,208 |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | PASS | 111.1s | 26 | 1,922,926 | 991,207 | 8,071 | 999,278 | 923,648 |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | PASS | 119.9s | 33 | 1,796,426 | 907,675 | 9,903 | 917,578 | 878,848 |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 116.2s | 33 | 1,970,693 | 1,015,621 | 9,024 | 1,024,645 | 946,048 |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 102.0s | 20 | 1,794,213 | 921,096 | 7,069 | 928,165 | 866,048 |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | rg baseline | PASS | 209.6s | 75 | 2,931,929 | 1,543,695 | 15,818 | 1,559,513 | 1,372,416 |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | FAIL | 93.8s | 11 | 837,224 | 425,317 | 6,915 | 432,232 | 404,992 |

## aif-explore

| Metric | Value |
|---|---:|
| Matrix rows | 30 |
| Executed rows | 30 |
| PASS rows | 28 |
| NOT_RUN rows | 0 |
| rg executed | 15 |
| CodeGraph executed | 15 |

| project | labels | run | status | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens | cache-read tokens |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 74.8s | 10 | 1,123,130 | 587,248 | 4,298 | 591,546 | 531,584 |
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 130.4s | 24 | 2,877,219 | 1,469,916 | 8,263 | 1,478,179 | 1,399,040 |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | PASS | 165.2s | 19 | 1,977,862 | 997,126 | 11,136 | 1,008,262 | 969,600 |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | PASS | 138.0s | 21 | 1,955,516 | 1,011,136 | 8,956 | 1,020,092 | 935,424 |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | PASS | 250.4s | 43 | 4,256,123 | 2,163,975 | 14,452 | 2,178,427 | 2,077,696 |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | PASS | 128.9s | 19 | 1,678,798 | 846,172 | 7,538 | 853,710 | 825,088 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 175.7s | 57 | 1,704,356 | 882,567 | 16,285 | 898,852 | 805,504 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 220.9s | 77 | 4,086,966 | 2,084,343 | 18,751 | 2,103,094 | 1,983,872 |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | PASS | 91.3s | 20 | 1,189,980 | 610,882 | 7,194 | 618,076 | 571,904 |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | PASS | 169.1s | 26 | 2,558,355 | 1,291,707 | 10,584 | 1,302,291 | 1,256,064 |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | rg baseline | PASS | 113.5s | 12 | 856,376 | 441,513 | 7,183 | 448,696 | 407,680 |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | codegraph tool_run | PASS | 217.6s | 48 | 4,278,003 | 2,154,706 | 14,241 | 2,168,947 | 2,109,056 |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | rg baseline | PASS | 109.9s | 18 | 2,275,298 | 1,144,577 | 8,289 | 1,152,866 | 1,122,432 |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | codegraph tool_run | FAIL | 153.0s | 38 | 1,969,111 | 1,015,856 | 13,735 | 1,029,591 | 939,520 |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 54.8s | 5 | 582,673 | 291,748 | 2,413 | 294,161 | 288,512 |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 123.7s | 30 | 1,486,451 | 747,297 | 11,218 | 758,515 | 727,936 |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | PASS | 53.3s | 4 | 457,528 | 238,772 | 3,204 | 241,976 | 215,552 |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | FAIL | 93.2s | 13 | 1,370,015 | 702,360 | 8,327 | 710,687 | 659,328 |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 45.6s | 2 | 244,332 | 144,001 | 2,923 | 146,924 | 97,408 |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 148.0s | 33 | 1,856,118 | 931,542 | 9,248 | 940,790 | 915,328 |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 182.4s | 71 | 3,639,407 | 1,820,894 | 14,737 | 1,835,631 | 1,803,776 |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 142.5s | 46 | 2,506,173 | 1,259,450 | 12,931 | 1,272,381 | 1,233,792 |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | PASS | 77.9s | 8 | 896,097 | 451,479 | 3,914 | 455,393 | 440,704 |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | PASS | 141.3s | 28 | 2,234,631 | 1,124,249 | 10,350 | 1,134,599 | 1,100,032 |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | PASS | 97.9s | 12 | 1,460,995 | 739,571 | 7,824 | 747,395 | 713,600 |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | PASS | 297.3s | 105 | 7,967,535 | 3,997,534 | 23,505 | 4,021,039 | 3,946,496 |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 109.3s | 20 | 1,309,833 | 667,547 | 6,638 | 674,185 | 635,648 |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 226.0s | 56 | 4,215,097 | 2,229,717 | 19,428 | 2,249,145 | 1,965,952 |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | rg baseline | PASS | 96.2s | 9 | 979,220 | 516,306 | 4,930 | 521,236 | 457,984 |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | PASS | 141.5s | 18 | 2,226,491 | 1,121,645 | 11,342 | 1,132,987 | 1,093,504 |

## aif-fix

| Metric | Value |
|---|---:|
| Matrix rows | 30 |
| Executed rows | 30 |
| PASS rows | 29 |
| NOT_RUN rows | 0 |
| rg executed | 15 |
| CodeGraph executed | 15 |

| project | labels | run | status | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens | cache-read tokens |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 150.6s | 18 | 1,205,984 | 632,914 | 9,870 | 642,784 | 563,200 |
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 85.1s | 12 | 1,085,701 | 550,826 | 5,595 | 556,421 | 529,280 |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | PASS | 86.8s | 9 | 604,716 | 318,814 | 5,966 | 324,780 | 279,936 |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | PASS | 103.5s | 14 | 1,063,111 | 537,705 | 7,390 | 545,095 | 518,016 |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | PASS | 167.4s | 25 | 1,523,609 | 765,877 | 12,260 | 778,137 | 745,472 |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | PASS | 149.8s | 15 | 2,051,602 | 1,062,101 | 10,429 | 1,072,530 | 979,072 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 54.7s | 2 | 247,819 | 144,887 | 3,988 | 148,875 | 98,944 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 157.9s | 42 | 2,112,112 | 1,060,390 | 13,130 | 1,073,520 | 1,038,592 |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | PASS | 77.7s | 4 | 602,172 | 306,828 | 6,192 | 313,020 | 289,152 |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | PASS | 99.9s | 9 | 1,207,251 | 639,624 | 6,091 | 645,715 | 561,536 |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | rg baseline | PASS | 102.4s | 14 | 1,535,915 | 802,627 | 6,632 | 809,259 | 726,656 |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | codegraph tool_run | PASS | 126.2s | 12 | 984,349 | 503,847 | 7,414 | 511,261 | 473,088 |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | rg baseline | PASS | 149.1s | 43 | 1,890,629 | 968,514 | 11,267 | 979,781 | 910,848 |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | codegraph tool_run | PASS | 85.4s | 10 | 1,124,901 | 563,704 | 5,037 | 568,741 | 556,160 |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 68.5s | 6 | 807,461 | 411,051 | 5,626 | 416,677 | 390,784 |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 59.2s | 7 | 569,132 | 309,545 | 4,867 | 314,412 | 254,720 |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | PASS | 82.8s | 8 | 631,582 | 329,249 | 7,037 | 336,286 | 295,296 |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | PASS | 303.2s | 55 | 7,735,807 | 3,911,171 | 20,988 | 3,932,159 | 3,803,648 |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 73.1s | 27 | 1,042,717 | 524,030 | 5,919 | 529,949 | 512,768 |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 48.9s | 15 | 498,136 | 251,427 | 3,637 | 255,064 | 243,072 |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 62.6s | 12 | 566,723 | 307,098 | 4,905 | 312,003 | 254,720 |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 124.7s | 32 | 2,777,269 | 1,400,281 | 7,900 | 1,408,181 | 1,369,088 |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | PASS | 81.6s | 11 | 1,108,936 | 558,192 | 3,672 | 561,864 | 547,072 |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | FAIL | 118.1s | 15 | 1,495,313 | 779,560 | 7,145 | 786,705 | 708,608 |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | PASS | 129.6s | 27 | 3,068,561 | 1,544,056 | 9,241 | 1,553,297 | 1,515,264 |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | PASS | 69.9s | 6 | 816,725 | 413,316 | 5,457 | 418,773 | 397,952 |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 100.7s | 18 | 1,133,308 | 626,700 | 7,408 | 634,108 | 499,200 |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 148.9s | 30 | 1,681,781 | 889,718 | 8,959 | 898,677 | 783,104 |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | rg baseline | PASS | 86.8s | 3 | 372,167 | 211,468 | 5,051 | 216,519 | 155,648 |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | PASS | 217.3s | 29 | 2,619,951 | 1,326,581 | 16,058 | 1,342,639 | 1,277,312 |

## aif-implement

| Metric | Value |
|---|---:|
| Matrix rows | 30 |
| Executed rows | 30 |
| PASS rows | 27 |
| NOT_RUN rows | 0 |
| rg executed | 15 |
| CodeGraph executed | 15 |

| project | labels | run | status | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens | cache-read tokens |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 73.0s | 3 | 392,607 | 195,169 | 4,926 | 200,095 | 192,512 |
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 76.5s | 9 | 546,695 | 296,351 | 4,328 | 300,679 | 246,016 |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | PASS | 67.2s | 2 | 308,450 | 154,613 | 5,229 | 159,842 | 148,608 |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | PASS | 38.2s | 1 | 190,597 | 95,182 | 1,463 | 96,645 | 93,952 |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | PASS | 143.0s | 17 | 1,973,775 | 1,018,112 | 8,719 | 1,026,831 | 946,944 |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | PASS | 101.5s | 8 | 512,523 | 287,872 | 5,643 | 293,515 | 219,008 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 167.5s | 45 | 1,954,379 | 1,002,698 | 13,697 | 1,016,395 | 937,984 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | FAIL | 88.0s | 11 | 1,165,554 | 605,279 | 5,779 | 611,058 | 554,496 |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | PASS | 153.8s | 23 | 2,135,713 | 1,075,745 | 12,160 | 1,087,905 | 1,047,808 |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | PASS | 98.2s | 18 | 970,969 | 501,579 | 6,926 | 508,505 | 462,464 |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | rg baseline | PASS | 130.8s | 23 | 1,807,938 | 925,580 | 8,886 | 934,466 | 873,472 |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | codegraph tool_run | PASS | 108.3s | 14 | 1,184,428 | 603,211 | 8,033 | 611,244 | 573,184 |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | rg baseline | PASS | 114.4s | 28 | 1,908,131 | 956,803 | 7,840 | 964,643 | 943,488 |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | codegraph tool_run | PASS | 107.2s | 25 | 1,281,234 | 660,672 | 8,978 | 669,650 | 611,584 |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 78.9s | 18 | 893,804 | 476,578 | 6,218 | 482,796 | 411,008 |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 81.1s | 12 | 737,528 | 400,212 | 7,460 | 407,672 | 329,856 |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | PASS | 91.2s | 10 | 880,666 | 441,762 | 9,336 | 451,098 | 429,568 |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | PASS | 258.9s | 35 | 4,595,291 | 2,315,290 | 25,665 | 2,340,955 | 2,254,336 |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 100.6s | 38 | 1,709,816 | 859,178 | 8,398 | 867,576 | 842,240 |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 81.0s | 27 | 786,967 | 418,612 | 6,883 | 425,495 | 361,472 |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 72.8s | 29 | 1,248,823 | 627,920 | 5,479 | 633,399 | 615,424 |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 66.1s | 20 | 736,209 | 371,208 | 5,449 | 376,657 | 359,552 |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | PASS | 90.5s | 9 | 648,036 | 327,782 | 5,630 | 333,412 | 314,624 |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | PASS | 140.1s | 22 | 2,294,640 | 1,157,992 | 9,096 | 1,167,088 | 1,127,552 |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | PASS | 139.2s | 15 | 1,308,273 | 662,178 | 13,519 | 675,697 | 632,576 |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | PASS | 127.0s | 21 | 1,967,899 | 995,227 | 8,832 | 1,004,059 | 963,840 |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 128.6s | 27 | 1,024,860 | 513,595 | 11,169 | 524,764 | 500,096 |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | FAIL | 170.7s | 62 | 3,448,830 | 1,762,008 | 12,582 | 1,774,590 | 1,674,240 |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | rg baseline | PASS | 89.7s | 11 | 1,198,523 | 600,633 | 3,970 | 604,603 | 593,920 |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | FAIL | 98.2s | 11 | 780,354 | 399,846 | 6,108 | 405,954 | 374,400 |

## aif-plan

| Metric | Value |
|---|---:|
| Matrix rows | 30 |
| Executed rows | 30 |
| PASS rows | 29 |
| NOT_RUN rows | 0 |
| rg executed | 15 |
| CodeGraph executed | 15 |

| project | labels | run | status | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens | cache-read tokens |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 135.2s | 16 | 1,416,618 | 731,105 | 8,393 | 739,498 | 677,120 |
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 116.9s | 24 | 1,265,721 | 695,250 | 7,143 | 702,393 | 563,328 |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | PASS | 103.9s | 15 | 965,373 | 523,583 | 8,126 | 531,709 | 433,664 |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | PASS | 95.5s | 13 | 1,519,797 | 770,399 | 6,486 | 776,885 | 742,912 |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | PASS | 59.7s | 4 | 440,043 | 242,924 | 1,663 | 244,587 | 195,456 |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | PASS | 122.5s | 14 | 1,802,348 | 914,763 | 7,329 | 922,092 | 880,256 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 152.0s | 35 | 1,812,629 | 912,505 | 11,164 | 923,669 | 888,960 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 152.0s | 28 | 1,830,744 | 950,304 | 10,936 | 961,240 | 869,504 |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | PASS | 76.9s | 5 | 485,633 | 251,587 | 5,694 | 257,281 | 228,352 |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | PASS | 71.8s | 9 | 711,271 | 363,472 | 4,503 | 367,975 | 343,296 |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | rg baseline | PASS | 99.4s | 13 | 712,109 | 397,872 | 7,293 | 405,165 | 306,944 |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | codegraph tool_run | PASS | 127.0s | 18 | 1,118,481 | 565,025 | 7,792 | 572,817 | 545,664 |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | rg baseline | PASS | 53.4s | 3 | 401,321 | 205,723 | 3,086 | 208,809 | 192,512 |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | codegraph tool_run | PASS | 95.1s | 10 | 1,145,691 | 573,008 | 7,307 | 580,315 | 565,376 |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 75.8s | 6 | 822,560 | 416,739 | 6,845 | 423,584 | 398,976 |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | FAIL | 102.5s | 17 | 1,530,055 | 791,497 | 7,678 | 799,175 | 730,880 |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | PASS | 58.8s | 3 | 442,013 | 226,738 | 4,331 | 231,069 | 210,944 |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | PASS | 134.2s | 18 | 2,647,378 | 1,364,725 | 11,229 | 1,375,954 | 1,271,424 |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 86.0s | 10 | 712,437 | 356,409 | 6,204 | 362,613 | 349,824 |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 74.3s | 17 | 895,487 | 449,532 | 5,763 | 455,295 | 440,192 |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 63.5s | 17 | 617,531 | 309,798 | 4,885 | 314,683 | 302,848 |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 82.6s | 16 | 730,446 | 366,711 | 7,255 | 373,966 | 356,480 |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | PASS | 80.4s | 5 | 590,162 | 319,858 | 5,344 | 325,202 | 264,960 |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | PASS | 102.9s | 13 | 1,178,015 | 616,309 | 5,162 | 621,471 | 556,544 |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | PASS | 110.5s | 7 | 899,379 | 476,519 | 5,580 | 482,099 | 417,280 |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | PASS | 162.8s | 12 | 1,633,675 | 830,827 | 8,352 | 839,179 | 794,496 |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 55.4s | 3 | 394,104 | 196,922 | 3,646 | 200,568 | 193,536 |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 121.9s | 56 | 2,372,020 | 1,229,673 | 11,339 | 1,241,012 | 1,131,008 |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | rg baseline | PASS | 41.9s | 1 | 196,775 | 101,552 | 1,271 | 102,823 | 93,952 |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | PASS | 109.6s | 14 | 875,338 | 463,806 | 8,588 | 472,394 | 402,944 |

## aif-review

| Metric | Value |
|---|---:|
| Matrix rows | 30 |
| Executed rows | 30 |
| PASS rows | 30 |
| NOT_RUN rows | 0 |
| rg executed | 15 |
| CodeGraph executed | 15 |

| project | labels | run | status | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens | cache-read tokens |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 100.5s | 29 | 1,040,400 | 549,857 | 7,983 | 557,840 | 482,560 |
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 82.2s | 13 | 1,034,972 | 518,620 | 6,144 | 524,764 | 510,208 |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | PASS | 123.2s | 13 | 1,619,645 | 814,234 | 8,483 | 822,717 | 796,928 |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | PASS | 113.7s | 22 | 1,311,444 | 683,823 | 9,509 | 693,332 | 618,112 |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | PASS | 169.3s | 37 | 1,537,534 | 798,553 | 12,837 | 811,390 | 726,144 |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | PASS | 117.9s | 7 | 685,168 | 351,956 | 3,740 | 355,696 | 329,472 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 48.6s | 3 | 309,668 | 159,231 | 2,341 | 161,572 | 148,096 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 68.7s | 16 | 805,321 | 412,028 | 5,581 | 417,609 | 387,712 |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | PASS | 84.1s | 7 | 981,020 | 496,495 | 6,317 | 502,812 | 478,208 |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | PASS | 97.5s | 13 | 1,479,363 | 769,002 | 6,105 | 775,107 | 704,256 |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | rg baseline | PASS | 59.4s | 1 | 190,964 | 95,366 | 1,134 | 96,500 | 94,464 |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | codegraph tool_run | PASS | 144.0s | 19 | 2,373,116 | 1,195,883 | 8,337 | 1,204,220 | 1,168,896 |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | rg baseline | PASS | 118.4s | 28 | 1,686,241 | 876,113 | 9,232 | 885,345 | 800,896 |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | codegraph tool_run | PASS | 90.0s | 32 | 1,374,702 | 727,518 | 7,056 | 734,574 | 640,128 |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 124.2s | 26 | 2,033,537 | 1,024,006 | 10,491 | 1,034,497 | 999,040 |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 114.1s | 23 | 1,093,991 | 557,917 | 7,434 | 565,351 | 528,640 |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | PASS | 106.3s | 22 | 1,635,626 | 842,545 | 7,673 | 850,218 | 785,408 |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | PASS | 208.3s | 42 | 3,594,769 | 1,811,057 | 18,080 | 1,829,137 | 1,765,632 |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 103.7s | 25 | 1,336,872 | 693,690 | 7,918 | 701,608 | 635,264 |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 83.8s | 15 | 988,291 | 496,499 | 6,544 | 503,043 | 485,248 |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 36.9s | 1 | 192,796 | 95,961 | 1,859 | 97,820 | 94,976 |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 85.5s | 19 | 846,633 | 426,457 | 6,992 | 433,449 | 413,184 |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | PASS | 81.7s | 14 | 560,006 | 295,229 | 4,809 | 300,038 | 259,968 |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | PASS | 94.9s | 10 | 764,931 | 390,526 | 4,613 | 395,139 | 369,792 |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | PASS | 117.4s | 23 | 2,545,443 | 1,277,603 | 8,576 | 1,286,179 | 1,259,264 |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | PASS | 117.1s | 20 | 2,271,492 | 1,165,217 | 7,011 | 1,172,228 | 1,099,264 |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 149.3s | 33 | 2,469,450 | 1,248,531 | 12,343 | 1,260,874 | 1,208,576 |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 83.2s | 9 | 908,010 | 455,356 | 4,782 | 460,138 | 447,872 |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | rg baseline | PASS | 88.9s | 4 | 528,159 | 266,128 | 4,111 | 270,239 | 257,920 |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | PASS | 139.2s | 29 | 1,613,548 | 813,850 | 10,450 | 824,300 | 789,248 |

## aif-rules-check

| Metric | Value |
|---|---:|
| Matrix rows | 30 |
| Executed rows | 30 |
| PASS rows | 27 |
| NOT_RUN rows | 0 |
| rg executed | 15 |
| CodeGraph executed | 15 |

| project | labels | run | status | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens | cache-read tokens |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 141.3s | 22 | 2,457,701 | 1,253,319 | 8,734 | 1,262,053 | 1,195,648 |
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 113.7s | 17 | 1,643,136 | 821,704 | 7,352 | 829,056 | 814,080 |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | PASS | 70.2s | 4 | 510,907 | 256,516 | 4,663 | 261,179 | 249,728 |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | PASS | 91.0s | 7 | 771,411 | 391,967 | 6,580 | 398,547 | 372,864 |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | PASS | 104.0s | 5 | 574,943 | 294,651 | 6,500 | 301,151 | 273,792 |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | PASS | 121.9s | 11 | 905,237 | 452,465 | 5,412 | 457,877 | 447,360 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 97.3s | 19 | 1,078,689 | 544,442 | 8,039 | 552,481 | 526,208 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 95.1s | 13 | 859,332 | 434,948 | 7,104 | 442,052 | 417,280 |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | FAIL | 72.9s | 13 | 0 | 0 | 0 | 0 | 0 |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | PASS | 117.8s | 16 | 1,041,754 | 557,180 | 6,878 | 564,058 | 477,696 |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | rg baseline | PASS | 175.3s | 38 | 2,362,557 | 1,204,268 | 11,665 | 1,215,933 | 1,146,624 |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | codegraph tool_run | FAIL | 92.5s | 5 | 699,640 | 357,022 | 4,442 | 361,464 | 338,176 |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | rg baseline | PASS | 132.0s | 28 | 1,185,971 | 611,395 | 11,632 | 623,027 | 562,944 |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | codegraph tool_run | PASS | 99.5s | 23 | 1,362,040 | 690,241 | 7,735 | 697,976 | 664,064 |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 113.4s | 16 | 1,985,857 | 996,984 | 8,009 | 1,004,993 | 980,864 |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 67.3s | 11 | 618,554 | 314,522 | 5,792 | 320,314 | 298,240 |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | PASS | 80.2s | 10 | 1,213,830 | 616,786 | 5,428 | 622,214 | 591,616 |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | FAIL | 143.0s | 29 | 2,255,877 | 1,154,061 | 13,432 | 1,167,493 | 1,088,384 |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 73.7s | 22 | 917,525 | 460,367 | 6,214 | 466,581 | 450,944 |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 54.6s | 9 | 585,083 | 292,867 | 3,192 | 296,059 | 289,024 |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 427.7s | 32 | 2,101,796 | 1,074,223 | 10,229 | 1,084,452 | 1,017,344 |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 94.6s | 20 | 1,561,953 | 784,126 | 7,139 | 791,265 | 770,688 |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | PASS | 74.2s | 4 | 446,352 | 244,646 | 3,690 | 248,336 | 198,016 |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | PASS | 107.9s | 17 | 909,130 | 457,806 | 7,932 | 465,738 | 443,392 |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | PASS | 115.9s | 16 | 1,887,373 | 953,089 | 7,692 | 960,781 | 926,592 |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | PASS | 139.7s | 34 | 2,229,242 | 1,136,213 | 11,813 | 1,148,026 | 1,081,216 |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 71.4s | 7 | 712,609 | 357,607 | 5,690 | 363,297 | 349,312 |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 95.7s | 17 | 961,246 | 491,636 | 6,378 | 498,014 | 463,232 |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | rg baseline | PASS | 105.0s | 26 | 1,316,001 | 666,262 | 7,435 | 673,697 | 642,304 |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | PASS | 99.2s | 16 | 1,084,917 | 551,177 | 7,020 | 558,197 | 526,720 |

## aif-verify

| Metric | Value |
|---|---:|
| Matrix rows | 30 |
| Executed rows | 30 |
| PASS rows | 28 |
| NOT_RUN rows | 0 |
| rg executed | 15 |
| CodeGraph executed | 15 |

| project | labels | run | status | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens | cache-read tokens |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 82.2s | 20 | 826,957 | 413,772 | 6,657 | 420,429 | 406,528 |
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 105.1s | 15 | 1,234,845 | 627,412 | 5,833 | 633,245 | 601,600 |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | PASS | 77.6s | 10 | 1,092,793 | 548,611 | 3,894 | 552,505 | 540,288 |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | PASS | 116.5s | 11 | 1,350,234 | 682,531 | 9,271 | 691,802 | 658,432 |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | PASS | 97.0s | 11 | 1,247,339 | 630,676 | 4,311 | 634,987 | 612,352 |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | PASS | 108.5s | 11 | 787,473 | 423,623 | 5,834 | 429,457 | 358,016 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 152.0s | 53 | 1,346,811 | 698,934 | 12,997 | 711,931 | 634,880 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 69.0s | 10 | 1,169,945 | 587,941 | 4,852 | 592,793 | 577,152 |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | PASS | 71.6s | 8 | 904,578 | 454,431 | 3,299 | 457,730 | 446,848 |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | PASS | 111.4s | 15 | 1,365,184 | 707,668 | 5,612 | 713,280 | 651,904 |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | rg baseline | PASS | 80.6s | 5 | 536,564 | 273,953 | 5,203 | 279,156 | 257,408 |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | codegraph tool_run | PASS | 79.6s | 4 | 487,569 | 244,119 | 2,938 | 247,057 | 240,512 |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | rg baseline | PASS | 40.8s | 2 | 293,641 | 147,159 | 1,970 | 149,129 | 144,512 |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | codegraph tool_run | PASS | 169.4s | 23 | 2,876,889 | 1,452,935 | 11,090 | 1,464,025 | 1,412,864 |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 57.4s | 8 | 571,968 | 295,684 | 4,028 | 299,712 | 272,256 |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 81.9s | 12 | 940,985 | 478,745 | 6,688 | 485,433 | 455,552 |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | PASS | 53.4s | 6 | 705,280 | 359,957 | 3,179 | 363,136 | 342,144 |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | PASS | 275.2s | 54 | 7,979,753 | 4,002,429 | 21,612 | 4,024,041 | 3,955,712 |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 63.4s | 5 | 599,680 | 298,987 | 4,501 | 303,488 | 296,192 |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 99.8s | 24 | 1,053,803 | 528,069 | 8,358 | 536,427 | 517,376 |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 134.2s | 32 | 1,962,608 | 1,004,694 | 10,458 | 1,015,152 | 947,456 |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | FAIL | 84.6s | 21 | 1,458,106 | 732,562 | 6,952 | 739,514 | 718,592 |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | PASS | 131.3s | 24 | 1,027,466 | 519,457 | 9,449 | 528,906 | 498,560 |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | PASS | 84.6s | 9 | 852,699 | 429,558 | 4,837 | 434,395 | 418,304 |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | PASS | 82.1s | 8 | 786,295 | 398,065 | 6,150 | 404,215 | 382,080 |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | FAIL | 134.1s | 35 | 2,383,101 | 1,199,736 | 10,757 | 1,210,493 | 1,172,608 |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 119.2s | 41 | 1,821,577 | 912,490 | 9,119 | 921,609 | 899,968 |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 111.1s | 38 | 1,024,537 | 518,452 | 10,085 | 528,537 | 496,000 |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | rg baseline | PASS | 139.1s | 32 | 1,831,625 | 928,515 | 10,566 | 939,081 | 892,544 |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | PASS | 108.0s | 8 | 596,435 | 330,654 | 6,453 | 337,107 | 259,328 |
