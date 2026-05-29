# codex-mem

Пакет: `codex-mem 0.1.1`.

Package metadata не содержит repository URL. Ближайший публичный repository, проверенный во время research: [Just-Boring-Cat/codex-mem](https://github.com/Just-Boring-Cat/codex-mem). Installed npm package сам не доказывает связь с этим repository.

Результаты тестов и выводы по labels: [codex-mem-benchmark-results.md](codex-mem-benchmark-results.md).

## Что Это

`codex-mem` ingests local Codex session/history logs в SQLite + FTS5 и exposes retrieval через CLI и MCP. Он сфокусирован на Codex session/history memory, а не на project artifact retrieval.

CLI concepts:

- `save`;
- `search`;
- `stats`;
- `sync`;
- `mcp-server`;
- context/project/session helpers.

MCP exposed tools вроде `search`, `timeline`, `get_observations`, `save_memory`, `stats`, `list_projects`, `recent_sessions`, `build_context`.

## Политика AIFHub

`codex-mem` имеет решение `reject_default`.

Причина: default scope может ingest broad Codex history across projects, если isolation настроена неверно. Это слишком fragile для default recommendation.

Не предлагать для:

- любого skill по умолчанию;
- project analysis;
- source-code retrieval;
- user-safe memory provider;
- multirepo/large projects, где cross-project ambiguity особенно опасна.

Максимум допустимой роли: user-local experiment со строгими isolation warnings.

## Safe Isolation Если Пользователь Экспериментирует Сам

Все paths должны быть explicit:

```text
CODEX_HOME=<empty-temp-codex-home>
CODEX_MEM_DATA_DIR=<temp-data-dir>
CODEX_MEM_DB_PATH=<temp-sqlite-db>
```

`sync`, worker, global history scan, MCP registration и default home не должны запускаться из AIFHub.

## Границы И Privacy

Default read scope включает Codex session/history logs под user's Codex home. Там могут быть prompts, tool outputs, paths, snippets и cross-project context.

Для AIFHub это blocker: безопасность зависит от идеальной изоляции env vars.

## Очистка

Очистка возможна удалением configured SQLite DB и sidecars:

- `codex-mem.db`;
- `codex-mem.db-wal`;
- `codex-mem.db-shm`.

Dedicated CLI purge command в installed package не был найден.

## Мета Для Анализа

```yaml
tool_id: codex-mem
decision: reject_default
recommendation_action: do_not_suggest_install_by_default
role: none
install_policy: do_not_auto_install
read_scope: broad_codex_history_unless_fully_isolated
purge_path: delete_configured_sqlite_db_and_sidecars
avoid_when:
  - default_or_global_codex_home
  - cross_project_history_can_be_indexed
  - user_needs_safe_default_memory_provider
analysis_hint: "Не предлагать как default utility: scope слишком широкий и легко ошибиться с isolation."
```
