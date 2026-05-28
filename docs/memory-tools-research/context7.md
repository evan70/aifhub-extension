# Context7

Репозиторий: [upstash/context7](https://github.com/upstash/context7)

Проверенный package: `ctx7 0.4.4`.

Результаты тестов и выводы по labels: [context7-benchmark-results.md](context7-benchmark-results.md).

## Что Это

Context7 - external documentation provider для version-sensitive library/API lookup. Он не читает project source tree и не является memory provider.

Полезная роль:

- проверить актуальные docs по framework/library/API;
- снизить риск ошибки при migration/deprecation вопросах;
- дать supporting context для `aif-analyze`, `aif-explore`, `aif-plan`, `aif-review`, `aif-rules-check`.

Не подходит для:

- source-code retrieval;
- architecture/impact graph;
- canonical OpenSpec evidence;
- validation, implementation, fix или done gates.

## Политика AIFHub

Context7 остается `optional` и `explicit_user_opt_in_only`.

Рекомендовать не по project labels, а по task signal:

- `version_sensitive_library_docs`;
- `framework_migration_or_deprecation_check`;
- review/rules guidance, где актуальная внешняя документация materially снижает риск.

Не рекомендовать, если задача решается только repository evidence или `rg`.

## CLI И MCP

Проверенный безопасный режим:

```text
ctx7 --help
ctx7 <explicit-library-or-docs-query>
```

Запрещено из AIFHub commands:

- `ctx7 setup`;
- automatic MCP registration;
- agent config mutation;
- сохранение raw provider transcripts, API keys или diagnostics.

## Границы И Privacy

Read scope - explicit library/docs query. Durable storage допускается только как короткая reviewed note с датой, library id и выводом под `.ai-factory/references/context7/` или `.ai-factory/state/<change-id>/context7/`.

Context7 output всегда supporting context. Repository files, tests и OpenSpec artifacts остаются authoritative.

## Мета Для Анализа

```yaml
tool_id: context7
decision: optional
recommendation_action: suggest_for_version_sensitive_docs
role: optional_docs_provider
install_policy: explicit_user_opt_in_only
read_scope: explicit_library_or_docs_query
purge_path: delete_reviewed_context7_notes
recommend_when:
  tasks:
    - version_sensitive_library_docs
    - framework_migration_or_deprecation_check
do_not_recommend_when:
  tasks:
    - canonical_openspec_evidence
    - validation_gate
    - automatic_mcp_registration
analysis_hint: "Предлагать только для актуальных library/API docs; не использовать как source evidence."
```
