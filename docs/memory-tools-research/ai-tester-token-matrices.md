# AI Tester Token Matrices

Источник этой таблицы - реальные `ai-tester` trace JSON из `runs/`. `NOT_RUN` означает, что сценарий есть в матрице, но model run для него еще не выполнен.

| Metric | Value |
|---|---:|
| Total rows | 940 |
| Executed rows | 59 |
| PASS rows | 57 |
| FAIL rows | 2 |
| NOT_RUN rows | 881 |
| Trace files read | 73 |

## Paired Rg Vs CodeGraph

| Metric | rg | CodeGraph | CodeGraph delta |
|---|---:|---:|---:|
| Paired rows | 29 | 29 |  |
| PASS rows | 29 | 27 | -6.9% |
| FAIL rows | 0 | 2 |  |
| Duration seconds | 4,944.8 | 5,764.9 | +16.6% |
| Tool calls | 783 | 978 | +24.9% |
| Total tokens | 39,304,040 | 59,909,103 | +52.4% |
| Input tokens | 20,853,359 | 31,361,089 | +50.4% |
| Output tokens | 192,121 | 218,542 | +13.8% |
| Input+output tokens | 21,045,480 | 31,579,631 | +50.1% |

| Better case count | Count | Percent of pairs |
|---|---:|---:|
| CodeGraph lower total tokens | 12 | 41.4% |
| CodeGraph lower input+output tokens | 11 | 37.9% |
| CodeGraph faster | 11 | 37.9% |
| CodeGraph fewer tool calls | 10 | 34.5% |

## aif-analyze

| Metric | Value |
|---|---:|
| Matrix rows | 94 |
| Executed rows | 24 |
| PASS rows | 23 |
| NOT_RUN rows | 70 |
| rg executed | 12 |
| CodeGraph executed | 12 |

| project | labels | run | status | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens | cache-read tokens |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 96.0s | 10 | 570,610 | 312,672 | 3,730 | 316,402 | 254,208 |
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 235.6s | 35 | 2,061,428 | 1,082,552 | 9,532 | 1,092,084 | 969,344 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 345.7s | 63 | 3,045,877 | 1,619,418 | 12,059 | 1,631,477 | 1,414,400 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 187.4s | 31 | 1,730,318 | 925,293 | 7,841 | 933,134 | 797,184 |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | rg baseline | PASS | 174.5s | 28 | 948,651 | 534,611 | 7,128 | 541,739 | 406,912 |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | codegraph tool_run | PASS | 209.1s | 32 | 2,313,494 | 1,188,599 | 8,095 | 1,196,694 | 1,116,800 |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | PASS | 195.5s | 29 | 1,180,886 | 658,005 | 8,577 | 666,582 | 514,304 |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | PASS | 227.2s | 36 | 2,669,766 | 1,372,622 | 8,568 | 1,381,190 | 1,288,576 |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | PASS | 200.6s | 24 | 1,775,647 | 947,667 | 8,012 | 955,679 | 819,968 |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | PASS | 225.1s | 33 | 3,425,928 | 1,747,817 | 8,479 | 1,756,296 | 1,669,632 |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | PASS | 116.7s | 11 | 644,378 | 369,997 | 4,685 | 374,682 | 269,696 |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | PASS | 288.5s | 43 | 4,687,623 | 2,369,823 | 10,984 | 2,380,807 | 2,306,816 |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | PASS | 240.3s | 27 | 1,576,211 | 910,706 | 10,145 | 920,851 | 655,360 |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | PASS | 373.3s | 60 | 6,194,890 | 3,250,035 | 12,375 | 3,262,410 | 2,932,480 |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 140.4s | 17 | 914,610 | 534,474 | 5,096 | 539,570 | 375,040 |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | FAIL | 205.2s | 19 | 897,079 | 553,204 | 6,723 | 559,927 | 337,152 |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 121.8s | 13 | 747,205 | 382,563 | 4,578 | 387,141 | 360,064 |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 413.0s | 109 | 4,496,637 | 2,319,352 | 16,261 | 2,335,613 | 2,161,024 |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | PASS | 164.9s | 17 | 1,214,008 | 640,948 | 7,044 | 647,992 | 566,016 |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | PASS | 222.1s | 33 | 2,978,390 | 1,533,777 | 8,325 | 1,542,102 | 1,436,288 |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 213.9s | 51 | 2,357,436 | 1,217,038 | 8,366 | 1,225,404 | 1,132,032 |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 256.4s | 36 | 2,507,681 | 1,271,051 | 10,774 | 1,281,825 | 1,225,856 |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | rg baseline | PASS | 239.7s | 49 | 2,279,890 | 1,200,061 | 10,133 | 1,210,194 | 1,069,696 |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | codegraph tool_run | PASS | 233.0s | 37 | 2,715,415 | 1,454,934 | 8,897 | 1,463,831 | 1,251,584 |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-15 | php+js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-15 | php+js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-17 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-17 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-18 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-18 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-19 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-19 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-20 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-20 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-21 | php+js ; standard ; framework ; multirepo ; none ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-21 | php+js ; standard ; framework ; multirepo ; none ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-22 | js+go ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-22 | js+go ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-23 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-23 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-24 | js+go+php ; large ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-24 | js+go+php ; large ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-25 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-25 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-26 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-26 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-27 | js ; large ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-27 | js ; large ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-28 | go+php ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-28 | go+php ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-29 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-29 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-30 | go+js+php ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-30 | go+js+php ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-31 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-31 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-32 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-32 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-33 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-33 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-34 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-34 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-35 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-35 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-36 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-36 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-37 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-37 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-38 | js ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-38 | js ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-39 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-39 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-40 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-40 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-41 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-41 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-42 | js ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-42 | js ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-43 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-43 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-44 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-44 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-45 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-45 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-46 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-46 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-47 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-47 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |

## aif-commit

| Metric | Value |
|---|---:|
| Matrix rows | 94 |
| Executed rows | 2 |
| PASS rows | 2 |
| NOT_RUN rows | 92 |
| rg executed | 1 |
| CodeGraph executed | 1 |

| project | labels | run | status | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens | cache-read tokens |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 167.7s | 29 | 1,319,485 | 699,588 | 6,009 | 705,597 | 613,888 |
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 176.3s | 26 | 1,100,906 | 611,084 | 6,366 | 617,450 | 483,456 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-15 | php+js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-15 | php+js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-17 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-17 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-18 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-18 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-19 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-19 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-20 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-20 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-21 | php+js ; standard ; framework ; multirepo ; none ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-21 | php+js ; standard ; framework ; multirepo ; none ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-22 | js+go ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-22 | js+go ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-23 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-23 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-24 | js+go+php ; large ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-24 | js+go+php ; large ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-25 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-25 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-26 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-26 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-27 | js ; large ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-27 | js ; large ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-28 | go+php ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-28 | go+php ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-29 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-29 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-30 | go+js+php ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-30 | go+js+php ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-31 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-31 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-32 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-32 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-33 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-33 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-34 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-34 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-35 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-35 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-36 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-36 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-37 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-37 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-38 | js ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-38 | js ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-39 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-39 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-40 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-40 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-41 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-41 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-42 | js ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-42 | js ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-43 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-43 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-44 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-44 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-45 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-45 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-46 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-46 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-47 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-47 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |

## aif-done

| Metric | Value |
|---|---:|
| Matrix rows | 94 |
| Executed rows | 2 |
| PASS rows | 2 |
| NOT_RUN rows | 92 |
| rg executed | 1 |
| CodeGraph executed | 1 |

| project | labels | run | status | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens | cache-read tokens |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 122.4s | 13 | 948,209 | 504,751 | 4,802 | 509,553 | 438,656 |
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 165.4s | 22 | 1,338,977 | 750,862 | 6,611 | 757,473 | 581,504 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-15 | php+js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-15 | php+js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-17 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-17 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-18 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-18 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-19 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-19 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-20 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-20 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-21 | php+js ; standard ; framework ; multirepo ; none ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-21 | php+js ; standard ; framework ; multirepo ; none ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-22 | js+go ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-22 | js+go ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-23 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-23 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-24 | js+go+php ; large ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-24 | js+go+php ; large ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-25 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-25 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-26 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-26 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-27 | js ; large ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-27 | js ; large ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-28 | go+php ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-28 | go+php ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-29 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-29 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-30 | go+js+php ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-30 | go+js+php ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-31 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-31 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-32 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-32 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-33 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-33 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-34 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-34 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-35 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-35 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-36 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-36 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-37 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-37 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-38 | js ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-38 | js ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-39 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-39 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-40 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-40 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-41 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-41 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-42 | js ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-42 | js ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-43 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-43 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-44 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-44 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-45 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-45 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-46 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-46 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-47 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-47 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |

## aif-explore

| Metric | Value |
|---|---:|
| Matrix rows | 94 |
| Executed rows | 8 |
| PASS rows | 8 |
| NOT_RUN rows | 86 |
| rg executed | 4 |
| CodeGraph executed | 4 |

| project | labels | run | status | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens | cache-read tokens |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 78.4s | 7 | 407,581 | 261,508 | 1,689 | 263,197 | 144,384 |
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 97.0s | 14 | 1,225,402 | 642,694 | 2,484 | 645,178 | 580,224 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 237.5s | 41 | 1,992,873 | 1,016,358 | 9,219 | 1,025,577 | 967,296 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 290.3s | 71 | 3,086,778 | 1,583,135 | 11,035 | 1,594,170 | 1,492,608 |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | PASS | 58.7s | 9 | 439,844 | 268,747 | 1,753 | 270,500 | 169,344 |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | PASS | 94.4s | 20 | 892,047 | 503,185 | 3,454 | 506,639 | 385,408 |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-15 | php+js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-15 | php+js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-17 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-17 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-18 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-18 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-19 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-19 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-20 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | PASS | 108.7s | 32 | 905,731 | 481,942 | 4,077 | 486,019 | 419,712 |
| matrix-profile-20 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | PASS | 92.7s | 24 | 863,813 | 475,626 | 3,419 | 479,045 | 384,768 |
| matrix-profile-21 | php+js ; standard ; framework ; multirepo ; none ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-21 | php+js ; standard ; framework ; multirepo ; none ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-22 | js+go ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-22 | js+go ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-23 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-23 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-24 | js+go+php ; large ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-24 | js+go+php ; large ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-25 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-25 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-26 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-26 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-27 | js ; large ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-27 | js ; large ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-28 | go+php ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-28 | go+php ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-29 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-29 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-30 | go+js+php ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-30 | go+js+php ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-31 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-31 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-32 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-32 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-33 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-33 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-34 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-34 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-35 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-35 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-36 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-36 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-37 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-37 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-38 | js ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-38 | js ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-39 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-39 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-40 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-40 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-41 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-41 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-42 | js ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-42 | js ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-43 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-43 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-44 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-44 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-45 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-45 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-46 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-46 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-47 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-47 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |

## aif-fix

| Metric | Value |
|---|---:|
| Matrix rows | 94 |
| Executed rows | 4 |
| PASS rows | 3 |
| NOT_RUN rows | 90 |
| rg executed | 2 |
| CodeGraph executed | 2 |

| project | labels | run | status | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens | cache-read tokens |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 144.2s | 20 | 1,306,244 | 679,845 | 4,447 | 684,292 | 621,952 |
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | FAIL | 262.7s | 38 | 3,147,347 | 1,589,205 | 9,598 | 1,598,803 | 1,548,544 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 183.1s | 35 | 1,543,960 | 813,685 | 6,947 | 820,632 | 723,328 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 169.4s | 33 | 1,404,672 | 721,754 | 6,566 | 728,320 | 676,352 |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-15 | php+js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-15 | php+js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-17 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-17 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-18 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-18 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-19 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-19 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-20 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-20 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-21 | php+js ; standard ; framework ; multirepo ; none ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-21 | php+js ; standard ; framework ; multirepo ; none ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-22 | js+go ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-22 | js+go ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-23 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-23 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-24 | js+go+php ; large ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-24 | js+go+php ; large ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-25 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-25 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-26 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-26 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-27 | js ; large ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-27 | js ; large ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-28 | go+php ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-28 | go+php ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-29 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-29 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-30 | go+js+php ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-30 | go+js+php ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-31 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-31 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-32 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-32 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-33 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-33 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-34 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-34 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-35 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-35 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-36 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-36 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-37 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-37 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-38 | js ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-38 | js ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-39 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-39 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-40 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-40 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-41 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-41 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-42 | js ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-42 | js ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-43 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-43 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-44 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-44 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-45 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-45 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-46 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-46 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-47 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-47 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |

## aif-implement

| Metric | Value |
|---|---:|
| Matrix rows | 94 |
| Executed rows | 4 |
| PASS rows | 4 |
| NOT_RUN rows | 90 |
| rg executed | 2 |
| CodeGraph executed | 2 |

| project | labels | run | status | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens | cache-read tokens |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 151.4s | 23 | 1,111,634 | 562,939 | 5,719 | 568,658 | 542,976 |
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 149.3s | 24 | 1,092,639 | 551,955 | 5,388 | 557,343 | 535,296 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 202.3s | 44 | 2,374,919 | 1,209,249 | 8,294 | 1,217,543 | 1,157,376 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 201.3s | 34 | 2,316,820 | 1,180,903 | 7,341 | 1,188,244 | 1,128,576 |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-15 | php+js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-15 | php+js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-17 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-17 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-18 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-18 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-19 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-19 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-20 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-20 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-21 | php+js ; standard ; framework ; multirepo ; none ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-21 | php+js ; standard ; framework ; multirepo ; none ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-22 | js+go ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-22 | js+go ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-23 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-23 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-24 | js+go+php ; large ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-24 | js+go+php ; large ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-25 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-25 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-26 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-26 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-27 | js ; large ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-27 | js ; large ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-28 | go+php ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-28 | go+php ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-29 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-29 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-30 | go+js+php ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-30 | go+js+php ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-31 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-31 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-32 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-32 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-33 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-33 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-34 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-34 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-35 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-35 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-36 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-36 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-37 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-37 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-38 | js ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-38 | js ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-39 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-39 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-40 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-40 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-41 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-41 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-42 | js ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-42 | js ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-43 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-43 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-44 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-44 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-45 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-45 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-46 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-46 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-47 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-47 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |

## aif-plan

| Metric | Value |
|---|---:|
| Matrix rows | 94 |
| Executed rows | 4 |
| PASS rows | 4 |
| NOT_RUN rows | 90 |
| rg executed | 2 |
| CodeGraph executed | 2 |

| project | labels | run | status | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens | cache-read tokens |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 117.6s | 10 | 778,177 | 415,255 | 4,010 | 419,265 | 358,912 |
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 128.1s | 14 | 808,897 | 440,050 | 4,687 | 444,737 | 364,160 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 232.3s | 40 | 2,462,399 | 1,273,382 | 9,497 | 1,282,879 | 1,179,520 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 138.7s | 26 | 918,974 | 500,420 | 5,882 | 506,302 | 412,672 |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-15 | php+js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-15 | php+js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-17 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-17 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-18 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-18 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-19 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-19 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-20 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-20 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-21 | php+js ; standard ; framework ; multirepo ; none ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-21 | php+js ; standard ; framework ; multirepo ; none ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-22 | js+go ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-22 | js+go ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-23 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-23 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-24 | js+go+php ; large ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-24 | js+go+php ; large ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-25 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-25 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-26 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-26 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-27 | js ; large ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-27 | js ; large ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-28 | go+php ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-28 | go+php ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-29 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-29 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-30 | go+js+php ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-30 | go+js+php ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-31 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-31 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-32 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-32 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-33 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-33 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-34 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-34 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-35 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-35 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-36 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-36 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-37 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-37 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-38 | js ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-38 | js ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-39 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-39 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-40 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-40 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-41 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-41 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-42 | js ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-42 | js ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-43 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-43 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-44 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-44 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-45 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-45 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-46 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-46 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-47 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-47 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |

## aif-review

| Metric | Value |
|---|---:|
| Matrix rows | 94 |
| Executed rows | 4 |
| PASS rows | 4 |
| NOT_RUN rows | 90 |
| rg executed | 2 |
| CodeGraph executed | 2 |

| project | labels | run | status | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens | cache-read tokens |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 190.0s | 34 | 1,555,837 | 807,297 | 7,420 | 814,717 | 741,120 |
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 155.8s | 24 | 1,436,004 | 750,248 | 5,948 | 756,196 | 679,808 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 176.2s | 35 | 1,501,995 | 759,895 | 6,996 | 766,891 | 735,104 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 164.6s | 35 | 1,113,712 | 591,571 | 6,813 | 598,384 | 515,328 |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-15 | php+js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-15 | php+js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-17 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-17 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-18 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-18 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-19 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-19 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-20 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-20 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-21 | php+js ; standard ; framework ; multirepo ; none ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-21 | php+js ; standard ; framework ; multirepo ; none ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-22 | js+go ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-22 | js+go ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-23 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-23 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-24 | js+go+php ; large ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-24 | js+go+php ; large ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-25 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-25 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-26 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-26 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-27 | js ; large ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-27 | js ; large ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-28 | go+php ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-28 | go+php ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-29 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-29 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-30 | go+js+php ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-30 | go+js+php ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-31 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-31 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-32 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-32 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-33 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-33 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-34 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-34 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-35 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-35 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-36 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-36 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-37 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-37 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-38 | js ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-38 | js ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-39 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-39 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-40 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-40 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-41 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-41 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-42 | js ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-42 | js ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-43 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-43 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-44 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-44 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-45 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-45 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-46 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-46 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-47 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-47 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |

## aif-rules-check

| Metric | Value |
|---|---:|
| Matrix rows | 94 |
| Executed rows | 4 |
| PASS rows | 4 |
| NOT_RUN rows | 90 |
| rg executed | 2 |
| CodeGraph executed | 2 |

| project | labels | run | status | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens | cache-read tokens |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 164.4s | 22 | 1,079,931 | 571,128 | 6,787 | 577,915 | 502,016 |
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 78.8s | 10 | 415,046 | 219,613 | 2,921 | 222,534 | 192,512 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 185.1s | 24 | 1,119,910 | 593,024 | 7,974 | 600,998 | 518,912 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 141.3s | 27 | 829,500 | 502,310 | 5,654 | 507,964 | 321,536 |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-15 | php+js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-15 | php+js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-17 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-17 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-18 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-18 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-19 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-19 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-20 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-20 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-21 | php+js ; standard ; framework ; multirepo ; none ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-21 | php+js ; standard ; framework ; multirepo ; none ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-22 | js+go ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-22 | js+go ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-23 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-23 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-24 | js+go+php ; large ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-24 | js+go+php ; large ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-25 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-25 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-26 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-26 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-27 | js ; large ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-27 | js ; large ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-28 | go+php ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-28 | go+php ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-29 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-29 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-30 | go+js+php ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-30 | go+js+php ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-31 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-31 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-32 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-32 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-33 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-33 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-34 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-34 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-35 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-35 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-36 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-36 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-37 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-37 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-38 | js ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-38 | js ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-39 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-39 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-40 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-40 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-41 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-41 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-42 | js ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-42 | js ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-43 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-43 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-44 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-44 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-45 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-45 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-46 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-46 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-47 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-47 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |

## aif-verify

| Metric | Value |
|---|---:|
| Matrix rows | 94 |
| Executed rows | 3 |
| PASS rows | 3 |
| NOT_RUN rows | 91 |
| rg executed | 2 |
| CodeGraph executed | 1 |

| project | labels | run | status | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens | cache-read tokens |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | PASS | 174.8s | 26 | 1,199,902 | 606,606 | 6,928 | 613,534 | 586,368 |
| matrix-profile-01 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | PASS | 182.9s | 32 | 1,238,920 | 677,415 | 7,521 | 684,936 | 553,984 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | PASS | 114.0s | 18 | 663,374 | 365,849 | 4,405 | 370,254 | 293,120 |
| matrix-profile-02 | rust ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-03 | rust ; mini ; framework ; single_repo ; legacy_ai_factory_only ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-04 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-05 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-06 | js ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-07 | js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-08 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-09 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-10 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-11 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-12 | php+js ; standard ; framework ; monorepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-13 | php ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-14 | php+js ; standard ; framework ; multirepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-15 | php+js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-15 | php+js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-16 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-17 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-17 | no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-18 | js ; standard ; framework ; single_repo ; none ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-18 | js ; standard ; framework ; single_repo ; none ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-19 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-19 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-20 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-20 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-21 | php+js ; standard ; framework ; multirepo ; none ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-21 | php+js ; standard ; framework ; multirepo ; none ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-22 | js+go ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-22 | js+go ; standard ; framework ; single_repo ; openspec_native ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-23 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-23 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-24 | js+go+php ; large ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-24 | js+go+php ; large ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-25 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-25 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-26 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-26 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-27 | js ; large ; framework ; multirepo ; openspec_native ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-27 | js ; large ; framework ; multirepo ; openspec_native ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-28 | go+php ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-28 | go+php ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-29 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-29 | go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; go_service | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-30 | go+js+php ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-30 | go+js+php ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-31 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-31 | go+js ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-32 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-32 | js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-33 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-33 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-34 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-34 | js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-35 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-35 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-36 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-36 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-37 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-37 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-38 | js ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-38 | js ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-39 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-39 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-40 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-40 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-41 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-41 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-42 | js ; mini ; mini ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-42 | js ; mini ; mini ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-43 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-43 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-44 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-44 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-45 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-45 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-46 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-46 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-47 | js ; mini ; framework ; single_repo ; none ; small_microservice | rg baseline | NOT_RUN |  |  |  |  |  |  |  |
| matrix-profile-47 | js ; mini ; framework ; single_repo ; none ; small_microservice | codegraph tool_run | NOT_RUN |  |  |  |  |  |  |  |

