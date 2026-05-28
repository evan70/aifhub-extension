# codex-agent-mem

Репозиторий: [MarceloCaporale/codex-agent-mem](https://github.com/MarceloCaporale/codex-agent-mem)

Проверенный package: Python source package `codex-agent-mem 1.0.2` из GitHub repository.

Результаты тестов и выводы по labels: [codex-agent-mem-benchmark-results.md](codex-agent-mem-benchmark-results.md).

## Что Это

`codex-agent-mem` - local-first SQLite-backed MCP memory layer для continuity между agent sessions. Это не code index и не replacement for source search.

Полезная роль:

- resume context после session boundary;
- open work и completion checks;
- compact handoff/context packs;
- чтение project/session-scoped memory из explicit DB.

Не подходит для:

- initial code discovery;
- exact file/symbol lookup;
- architecture graphing;
- implementation/verify evidence.

## Политика AIFHub

`codex-agent-mem` остается `optional` и `explicit_user_opt_in_only`.

Рекомендовать только когда есть task signal:

- `resume_previous_work`;
- `open_work_or_completion_check`;
- `compact_handoff_context`;
- prior memory DB exists;
- пользователь явно хочет continuity между сессиями.

Project labels вторичны. `multirepo`, `large_legacy` и `go_service` могут выиграть от continuity, но только если есть накопленная memory DB. Для code lookup baseline остается `rg`.

## Safe MCP Mode

Рекомендуемый safe mode:

```text
codex-agent-mem-mcp --read-only --profile minimal --response-mode compact --db-path <explicit-db>
```

В этом режиме MCP exposes только non-mutating read-only tools:

- `mem_session_list`;
- `mem_scope_resolve`;
- `mem_bootstrap_context`;
- `mem_open_work`;
- `mem_completion_check`;
- `mem_context_pack`;
- `mem_health_runtime`.

Не использовать `--profile full` как default low-impact mode: mutating calls блокируются read-only режимом, но mutating tool names остаются visible в `tools/list`.

## Границы И Privacy

Read scope - только configured SQLite DB path. Tool не должен читать source tree и не должен регистрироваться глобально из AIFHub commands.

Запрещено по умолчанию:

- auto-install;
- bootstrap с mutation global Codex config;
- MCP registration;
- hooks/background daemon setup;
- использование memory output как canonical OpenSpec evidence.

## Очистка

Purge path - удалить configured SQLite DB и sidecars:

- `<db>.db`;
- `<db>.db-wal`;
- `<db>.db-shm`.

## Мета Для Анализа

```yaml
tool_id: codex-agent-mem
decision: optional
recommendation_action: suggest_when_continuity_needed
role: read_only_continuity_memory
install_policy: explicit_user_opt_in_only
read_scope: explicit_sqlite_db_path
purge_path: delete_configured_sqlite_db_and_sidecars
recommend_when:
  tasks:
    - resume_previous_work
    - open_work_or_completion_check
    - compact_handoff_context
  conditions:
    - prior_memory_db_exists
    - user_wants_cross_session_continuity
do_not_recommend_when:
  tasks:
    - initial_code_discovery
    - exact_file_or_symbol_lookup
    - architecture_graphing
analysis_hint: "Предлагать только для continuity; для поиска по коду использовать rg или graph tools."
```
