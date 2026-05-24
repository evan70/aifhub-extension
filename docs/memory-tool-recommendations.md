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
- `codex-agent-mem`: optional read-only continuity memory с explicit SQLite DB path.
- `context-mode`: manual temporary index для explicit generated output или large command output.
- Context7: optional docs provider для version-sensitive library/API questions.
- `agent-memory`: manual notes только когда пользователь явно просит durable notes.
- CodeGraph: `manual_cli_only` / `suggest_manual_cli_for_repo_graph_when_enabled_or_explicit`; CLI scoped read и purge прошли explicit real-root testing. `/aif-analyze` может рекомендовать его для broad repo graph questions, а `/aif-explore` может использовать его только когда command-specific `select` output возвращает его в `selected_tools`.

Не рекомендовать по умолчанию:

- `codex-mem`: default scope может ingest broad Codex history.
- `eagle-mem`: scoped read и purge behavior не доказаны.

AIFHub по-прежнему не принимает CodeGraph `install`, MCP serving, hooks/background services или agent configuration mutation.

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

Позже CodeGraph был установлен по явному запросу пользователя и проверен на 29 real local project roots через `init`, `index --quiet`, `status`, JSON `query` и `uninit --force`. Lifecycle прошел на всех 29 roots без protected agent/config mutations и без оставшихся `.codegraph/` directories. Принятая рекомендация - manual CLI-only; `install`/MCP/agent-config behavior все еще не принят для AIFHub automation.

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
