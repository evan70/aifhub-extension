[Предыдущая страница](context-providers.md) | [К документации](README.md) | [Следующая страница](context-loading-policy.md)

# Рекомендации По Memory Tools

AIFHub использует локальную metadata рекомендаций, чтобы во время анализа предлагать optional memory и context tools. Metadata живет в установленном extension, а не на GitHub:

```text
.ai-factory/extensions/aifhub-extension/docs/memory-tools-research/recommendation-metadata.yaml
```

При разработке самого extension можно использовать source-tree копию:

```text
docs/memory-tools-research/recommendation-metadata.yaml
```

## Команды

Установленные проекты должны использовать wrapper command:

```bash
ai-factory aifhub-memory-tools recommend --from-project --json
ai-factory aifhub-memory-tools recommend --shape large_framework_app --task architecture_or_impact_discovery --json
ai-factory aifhub-memory-tools select --from-project --command aif-explore --json
ai-factory aifhub-memory-tools select --from-project --command aif-plan --json
ai-factory aifhub-memory-tools status --json
ai-factory aifhub-memory-tools metadata --json
```

Wrapper находит scripts из установленного extension и оставляет рабочей директорией пользовательский проект.

Для разработки extension matrix scenarios могут использовать source-tree development-only fallback, описанный в research note, но installed-project документация и `ai-tester` scenarios должны предпочитать wrapper `ai-factory aifhub-memory-tools ...`.

## Правила

Recommender только советует:

- `rg` остается baseline для точного поиска файлов и symbols.
- Инструменты включаются только через explicit opt-in.
- Отсутствующие tools означают degraded context, а не failure команды.
- Provider output является только supporting context, никогда canonical OpenSpec evidence.
- AIFHub не должен auto-install tools, запускать setup, индексировать source, sync memory, register MCP servers, install hooks, start daemons или записывать provider output.
- Если metadata содержит поля, рекомендации включают allowed command scopes, forbidden command scopes, command-specific permission, privacy caveat, read scope, purge path, availability и explicit opt-in install policy.
- Context/compression tools не должны rewrite validation artifacts и не должны compress protected artifacts in place.
- `/aif-analyze` записывает только user-accepted tool ids в `utilities.context_tools.enabled`.
- Follow-on skills вызывают `select` для своей команды и используют только `selected_tools`; изменение списка tools должно требовать metadata/config changes, а не prompt rewrites.
- Recommender учитывает language, volume, complexity, repo shape, artifact mode и legacy `project_shape`. Если rich dimensions недоступны, сохраняется fallback на `project_shape`.
- Любой optional tool сравнивается с `rg`: сначала baseline search на том же task/profile, затем tool run только если selector и permissions разрешают его.

Protected validation artifacts:

- `aif-gate-result`
- `coverage.json`
- `done-readiness.json`
- `openspec/specs/**`
- generated-rules traces
- exact evidence snippets

## Решения По Tools

Разрешенные рекомендации:

- `rg`: baseline search.
- Graphify: optional repo graph для large framework, legacy и multirepo impact discovery после baseline `rg`.
- `codex-agent-mem`: optional read-only continuity memory с explicit SQLite DB path; это Python source package из GitHub repo, не npm package.
- `context-mode`: manual temporary index для explicit generated output или large command output.
- Context7: optional docs provider для version-sensitive library/API questions.
- `agent-memory`: manual notes только когда пользователь явно просит durable notes.
- CodeGraph: `manual_cli_only` / `suggest_manual_cli_for_repo_graph_when_enabled_or_explicit`; CLI scoped read и purge прошли explicit real-root testing. `/aif-analyze` может рекомендовать его для broad repo graph questions, а `/aif-explore` может использовать его только когда command-specific `select` output возвращает его в `selected_tools`. Уже готовый индекс можно переиспользовать только после `rg` и только если `files/query/context` дает полезную непустую выборку.

Не рекомендовать по умолчанию:

- `codex-mem`: default scope может ingest broad Codex history.
- `eagle-mem`: scoped read и purge behavior не доказаны.

AIFHub по-прежнему не принимает CodeGraph `install`, MCP serving, hooks/background services или agent configuration mutation.

## Dimension-Aware Selection

Metadata хранит project dimensions:

```yaml
project_dimensions:
  languages: [php, go, js, rust, multi]
  volume: [mini, standard, large]
  complexity: [mini, framework, legacy, integration_heavy]
  repo_shape: [single_repo, monorepo, multirepo]
  artifact_mode: [openspec_native, legacy_ai_factory_only, none]
```

Практический смысл:

- mini или exact lookup: оставить `rg`, избегать on-demand CodeGraph/Graphify/context-mode setup; уже готовый CodeGraph index не является default-рекомендацией.
- large framework или multirepo broad discovery: предлагать CodeGraph/Graphify условно, после `rg` baseline.
- legacy integration-heavy: рекомендовать только conditional tools с явным объяснением noise/time tradeoff.
- Go service: mini Go остается на `rg`; standard/large Go может получить conditional repo graph только для broad impact mapping.
- docs/version tasks: Context7 только для version-sensitive library/API вопросов.
- continuity tasks: `codex-agent-mem` только для resume/open-work с explicit DB path.

Decision mapping из matrix:

| Decision | Что значит для рекомендации |
|---|---|
| `recommend` | Tool измеримо лучше `rg` для matching dimensions и проходит safety/purge. |
| `conditional` | Tool полезен только для конкретного task/profile, например multirepo mapping или docs lookup. |
| `avoid` | Tool не дает пользы относительно `rg` или добавляет overhead на этом profile. |
| `forbid` | Tool провалил safety, scope или purge и не должен использоваться. |

## Безопасные Status Probes

`ai-factory aifhub-memory-tools status --json` может запускать только локальные non-mutating probes:

- `rg --version`
- `uv --version`
- `graphify --version` или `graphify --help`
- `codex-agent-mem-policy --help` или `codex-agent-mem-smoke --help`
- `context-mode doctor`
- `ctx7 --version` или `npx --no-install ctx7 --help` только когда передан `--check-docs-provider`
- `codegraph --version`, `codegraph --help` или `codegraph status` только как availability probes

Эти probes не должны install packages, run setup, register MCP servers, write hooks или start background processes. `codegraph init/index/query/uninit` разрешен только когда `select --command aif-explore --json` возвращает CodeGraph в `selected_tools` с `manual_purged_cli_execution`, explicit project path и purge через `codegraph uninit --force <project>`.

## Выбор Через Config

`/aif-analyze` должен классифицировать текущий проект, запустить `recommend`, спросить пользователя, какие рекомендации включить, и сохранить accepted tool ids в config:

```yaml
utilities:
  context_tools:
    enabled:
      - codegraph
      - graphify
```

Compatibility flags вроде `utilities.graphify.enabled: true` и `utilities.codegraph.enabled: true` все еще читаются командой `select`, но стабильный provider list - это `utilities.context_tools.enabled`.

Во время выполнения skill используйте command-specific selection:

```bash
ai-factory aifhub-memory-tools select --from-project --command aif-explore --json
ai-factory aifhub-memory-tools select --from-project --command aif-plan --json
```

Selection output включает `selected_tools`, `not_selected_tools`, `permission`, `execution`, `forbidden_operations` и `protected_artifacts`. Metadata output включает такое же per-tool execution guidance, чтобы `/aif-analyze` мог показать доступные параметры без hard-code конкретного provider. Skill не должен использовать configured tools, которых нет в `selected_tools`.

## Evidence На Реальных Проектах

Follow-up smoke от 2026-05-23 использовал пять real local project roots, записанных только как anonymous profiles. `rg` был единственным default tool, который напрямую читал source. Graphify запускался AST-only на temporary copies; memory/context tools использовали isolated temp DB/data dirs и anonymous marker notes.

Позже CodeGraph был установлен по явному запросу пользователя и проверен на 29 real local project roots через `init`, `index --quiet`, `status`, JSON `query` и `uninit --force`. Lifecycle прошел на всех 29 roots без protected agent/config mutations и без оставшихся `.codegraph/` directories.

Повторный forced benchmark от 2026-05-26 прошел 47 sanitized anonymous profiles. Lifecycle/purge снова прошел 47/47, но useful generic `architecture_or_impact_discovery` context был ограничен: 23 mini profiles ушли в overhead, 18 profiles вернули header-only/no useful context, и только 6 profiles остались conditional useful. Дополнительный `ai-tester` warm-index режим предварительно выполнял `codegraph init/index` через `setup_commands`; на текущем standard extension profile warm CodeGraph все равно был ~2.0x total tokens против `rg`, а на одном mini js/md profile сэкономил 4.6% total tokens, но дал слабый дополнительный сигнал. Видимые строки тестов с `ai-tester` token traces, full 94-row CLI matrix и all-skills scenario matrix находятся в [CodeGraph Benchmark Results](memory-tools-research/codegraph-benchmark-results.md); таблицы по skill с реальными input/output/cache token traces находятся в [AI Tester Token Matrices](memory-tools-research/ai-tester-token-matrices.md). Принятая рекомендация - manual CLI-only с quality gate; `install`/MCP/agent-config behavior все еще не принят для AIFHub automation.

Повторный safe field run от 2026-05-24 использовал 55 anonymous profiles из local projects root, но запускал инструменты только на sanitized temp copies или temp isolated dirs. Итог: `rg`, read-only `git/gh`, CodeGraph, Context7 и `context-mode` прошли; Graphify AST-only прошел на 54/55 профилей с одним timeout; `codex-agent-mem` подтвержден как GitHub/Python source package без source indexing. Context7 теперь имеет отдельный research note: [memory-tools-research/context7.md](memory-tools-research/context7.md).

Изолированный source-install test от 2026-05-25 подтвердил, что `MarceloCaporale/codex-agent-mem` работает как Python/MCP package: editable install прошел, upstream `pytest` дал 121 passed, `ruff` прошел, CLI smoke с explicit SQLite DB прошел, а `--read-only --profile minimal` MCP exposed только 7 non-mutating tools. Caveat: `--profile full --read-only` still lists mutating tool names, though mutating calls return `isError` and do not write; поэтому default recommendation остается `minimal + read-only`.

## Вывод Анализа

`/aif-analyze` должен кратко суммировать рекомендации так:

```text
Optional local tools:

Baseline:
- rg: use for exact file/symbol lookup.

Recommended:
- Graphify: useful for broad architecture/impact discovery in this large framework project.
  Status: installed/not installed/unknown
  Read scope: explicit project path
  Очистка: delete graphify-out/
  Note: supporting context only, not OpenSpec evidence.

Not recommended:
- codex-mem: broad Codex history scope can cross project boundaries.
- eagle-mem: scoped read and purge not proven.
```

Если metadata недоступна, `/aif-analyze` должен сообщить degraded note и продолжить с `rg` как baseline.
