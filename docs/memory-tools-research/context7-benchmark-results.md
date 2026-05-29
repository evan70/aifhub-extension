# Результаты Тестов Context7

Этот файл содержит evidence по Context7. Описание инструмента и политика использования находятся в [context7.md](context7.md).

Важно: recommendation benchmark считается только по paired `ai-tester` runs `rg baseline` vs `context7 tool_run`. Field runs ниже являются safety/availability evidence и не заменяют ai-tester.

## Методика

Context7 нельзя честно сравнивать с `rg` как source retrieval: он не должен читать project source. Проверка была focused на availability, explicit docs lookup и отсутствие project-source indexing.

## AI Tester Pilot 2026-05-28

Raw artifact: `.ai-factory/state/ai-tester-matrix-for-memory-tool-metadata/screening-context7-ai-tester-pilot-v2/ai-tester-token-matrices.json`.

Пилотный paired run: `screening-context7-ai-tester-pilot-v2`, `aif-rules-check`, task `version_sensitive_library_docs`, profile labels `no-primary-language ; mini ; mini ; single_repo ; none ; small_microservice`. Context7 был подготовлен через `fixtures.setup_commands` как project-local `ctx7`; model turn обязан был сначала вызвать `rg`, затем `ctx7`.

| run | status | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens |
|---|---|---:|---:|---:|---:|---:|---:|
| `rg baseline` | PASS | 42.2s | 1 | 152,380 | 98,728 | 1,684 | 100,412 |
| `context7 tool_run` | PASS | 219.3s | 26 | 3,053,547 | 1,553,938 | 12,505 | 1,566,443 |

Дельта Context7 против `rg`:

| metric | delta |
|---|---:|
| duration | +419.7% |
| tool calls | +2500.0% |
| total tokens | +1903.9% |
| input tokens | +1475.0% |
| output tokens | +642.6% |
| input+output tokens | +1459.0% |

Вывод по ai-tester pilot: для `mini/no-primary-language` без явной dependency Context7 не дает пользы. Он остается кандидатом только для задач, где в labels или prompt есть конкретная library/API/version.

## AI Tester Targeted Run 2026-05-28

Raw artifact: `.ai-factory/state/ai-tester-matrix-for-memory-tool-metadata/targeted-context7-ai-tester/ai-tester-token-matrices.json`.

Targeted paired run: `targeted-context7-ai-tester`, skill `aif-rules-check`, task `version_sensitive_library_docs`, Context7 prepared как project-local `ctx7`.

| project | labels | run | status | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens |
|---|---|---|---|---:|---:|---:|---:|---:|---:|
| matrix-profile-04 | `js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app` | `rg baseline` | PASS | 117.5s | 4 | 459,478 | 252,581 | 2,737 | 255,318 |
| matrix-profile-04 | same | `context7 tool_run` | PASS | 334.3s | 31 | 3,960,109 | 2,083,696 | 15,293 | 2,098,989 |
| matrix-profile-07 | `js+php ; standard ; framework ; multirepo ; openspec_native ; multirepo` | `rg baseline` | PASS | 79.0s | 2 | 291,893 | 175,269 | 1,808 | 177,077 |
| matrix-profile-07 | same | `context7 tool_run` | PASS | 255.1s | 23 | 3,267,616 | 1,675,123 | 16,045 | 1,691,168 |

Дельта Context7 против `rg`:

| project | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens |
|---|---:|---:|---:|---:|---:|---:|
| matrix-profile-04 | +184.5% | +675.0% | +761.9% | +725.0% | +458.8% | +722.1% |
| matrix-profile-07 | +222.9% | +1050.0% | +1019.5% | +855.7% | +787.4% | +855.0% |

Вывод targeted run: наличие JS/PHP/Go labels само по себе не делает Context7 выгодным. Нужен explicit library/API/version question. Без этого Context7 превращается в дорогой внешний lookup поверх того, что `rg` уже дает дешевле.

## AI Tester Cross Screening 2026-05-28

Raw artifact: `.ai-factory/state/ai-tester-matrix-for-memory-tool-metadata/cross-context7-ai-tester/ai-tester-token-matrices.json`.

Reduced cross run: 2 representative skills x 2 project labels x `rg/tool_run`. Это проверяет, меняется ли поведение Context7 между planning и rules-check skills на разных project labels.

| project | labels | skill | run | status | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens |
|---|---|---|---|---|---:|---:|---:|---:|---:|---:|
| matrix-profile-04 | `js+go ; standard ; framework ; single_repo ; legacy_ai_factory_only ; large_framework_app` | `aif-plan` | `rg baseline` | PASS | 82.5s | 5 | 602,264 | 300,986 | 3,038 | 304,024 |
| matrix-profile-04 | same | `aif-plan` | `context7 tool_run` | PASS | 278.2s | 53 | 4,535,566 | 2,311,245 | 16,321 | 2,327,566 |
| matrix-profile-04 | same | `aif-rules-check` | `rg baseline` | PASS | 55.0s | 2 | 254,858 | 151,376 | 1,466 | 152,842 |
| matrix-profile-04 | same | `aif-rules-check` | `context7 tool_run` | PASS | 236.0s | 30 | 3,746,283 | 1,915,133 | 14,446 | 1,929,579 |
| matrix-profile-05 | `js ; standard ; framework ; monorepo ; legacy_ai_factory_only ; multirepo` | `aif-plan` | `rg baseline` | PASS | 59.8s | 5 | 555,726 | 300,910 | 2,144 | 303,054 |
| matrix-profile-05 | same | `aif-plan` | `context7 tool_run` | PASS | 226.8s | 24 | 2,796,332 | 1,433,630 | 12,814 | 1,446,444 |
| matrix-profile-05 | same | `aif-rules-check` | `rg baseline` | PASS | 64.8s | 1 | 153,045 | 98,795 | 2,282 | 101,077 |
| matrix-profile-05 | same | `aif-rules-check` | `context7 tool_run` | PASS | 267.9s | 27 | 2,985,666 | 1,540,716 | 15,574 | 1,556,290 |

Дельта Context7 против `rg`:

| project | skill | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens |
|---|---|---:|---:|---:|---:|---:|---:|
| matrix-profile-04 | `aif-plan` | +237.2% | +960.0% | +653.1% | +667.9% | +437.2% | +665.6% |
| matrix-profile-04 | `aif-rules-check` | +329.1% | +1400.0% | +1369.9% | +1165.1% | +885.4% | +1162.5% |
| matrix-profile-05 | `aif-plan` | +279.3% | +380.0% | +403.2% | +376.4% | +497.7% | +377.3% |
| matrix-profile-05 | `aif-rules-check` | +313.4% | +2600.0% | +1850.8% | +1459.5% | +582.5% | +1439.7% |

Cross вывод: даже для skills, где Context7 концептуально применим (`aif-plan`, `aif-rules-check`), project labels не дают token/time выгоду. Рекомендация остается task-quality only: использовать только когда вопрос явно зависит от внешних library/API/version docs.

## AI Tester Python OpenSpec Cross 2026-05-28

Raw artifact: `.ai-factory/state/ai-tester-matrix-for-memory-tool-metadata/model-gen-all-tools-grouped-clean-20260528-212755/ai-tester-token-matrices.json`.

Полный отчет: [AI Tester Token Matrices: Python OpenSpec All Tools](ai-tester-token-matrices-python-openspec-all-tools.md).

Labels: `python`, `standard`, `framework`, `single_repo`, `openspec_native`, `large_framework_app`. Task: `architecture_or_impact_discovery`.

| Metric | Value |
|---|---:|
| Rows | 20 |
| `rg baseline` rows | 10 |
| Context7 positive usage rows | 0 |
| Context7 negative policy rows | 5 |
| Context7 not-applicable rows | 5 |
| PASS rows | 20 |

Вывод: Context7 корректно не выбирается по Python/framework/OpenSpec labels без explicit library/API/version вопроса. Эти строки подтверждают selector policy; они не являются evidence, что Context7 ускоряет source discovery.

## Safety Field Run 2026-05-24

Прогон выполнялся через `scripts/memory-tool-field-run.mjs` на 55 sanitized temp profiles. `ctx7` устанавливался только во временный npm prefix внутри temp run dir.

| Проверка | Результат |
|---|---:|
| Profiles в run | 55 |
| Temp install package | `ctx7 0.4.4` |
| `ctx7 --help` | PASS |
| Explicit docs lookup | PASS |
| Lookup dependency | `chalk` |
| Lookup output size | 1,924 chars |
| Source indexing | no |
| `ctx7 setup` | not run |
| MCP registration | not run |
| Agent config mutation | not run |

## Когда Использовать

Лучшие signals:

- task: `version_sensitive_library_docs`;
- task: `framework_migration_or_deprecation_check`;
- stack содержит dependency/framework, где версия важна;
- skill: `aif-analyze`, `aif-explore`, `aif-plan`, `aif-review`, `aif-rules-check`.

Project labels почти не важны: Context7 полезен одинаково для `php`, `go`, `js`, `rust`, `multi`, если вопрос зависит от внешней документации.

Сильные стороны:

- не читает project source;
- быстро дает docs context по explicit query;
- снижает риск устаревших рекомендаций по библиотекам.

## Когда Не Использовать

Плохие signals:

- exact file/symbol lookup;
- project architecture/impact discovery;
- implementation/fix/verify/done gates;
- задача не зависит от внешней версии API.

Слабые стороны:

- не дает информации о локальном коде;
- не заменяет `rg`, tests, OpenSpec или source snippets;
- setup/MCP registration остаются user-owned и не проверялись как AIFHub-owned lifecycle.

## Итог

Context7 полезен только для explicit version-sensitive external docs, где качество ответа важнее token/time overhead. Текущие ai-tester runs показывают overhead на mini, large framework и multirepo labels без конкретной library/API/version.
