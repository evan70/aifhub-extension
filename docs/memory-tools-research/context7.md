# Context7

Репозиторий: [upstash/context7](https://github.com/upstash/context7)

Проверенный package: `ctx7 0.4.4`.

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
analysis_hint: "Предлагать только для вопросов, где актуальная library/API документация materially снижает риск ошибки; не использовать как источник canonical evidence."
```

## Что Это

Context7 - external documentation provider для library/API lookup. Он не является memory provider и не должен читать source tree. Его полезная роль для AIFHub - проверить version-sensitive docs перед рекомендацией, review finding или rules guidance.

## Локальный Прогон На Anonymous Profiles (2026-05-24)

Прогон выполнялся harness `scripts/memory-tool-field-run.mjs` на sanitized temp copies 55 anonymous profiles из локального projects root. `ctx7` устанавливался только во временный npm prefix внутри temp run dir. `ctx7 setup`, MCP registration, agent config mutation и credential flows не запускались.

| Проверка | Результат |
|---|---:|
| Profiles в run | 55 |
| Temp install package | `ctx7 0.4.4` |
| `ctx7 --help` | PASS |
| Explicit docs lookup | PASS |
| Lookup dependency | `chalk` |
| Lookup output size | 1,924 chars |
| Source indexing | no |
| Setup/MCP registration | no |

Вывод: Context7 CLI пригоден как optional docs lookup в temp-only режиме. Он не должен становиться default dependency и не должен выполнять `setup` из AIFHub commands. Durable storage допускается только как короткая reviewed note под `.ai-factory/references/context7/` или `.ai-factory/state/<change-id>/context7/`, без raw transcripts, API keys или provider diagnostics.

## Границы И Privacy

Разрешено:

- explicit library/docs lookup по имени dependency или library id;
- краткие reviewed notes с датой, library id и выводом;
- degraded fallback, если CLI/MCP недоступны.

Не делать:

- auto-install package в real project;
- запускать `ctx7 setup`;
- register MCP server автоматически;
- сохранять raw provider output, credentials, API keys или setup diagnostics;
- использовать Context7 output как canonical OpenSpec evidence, QA gate, verification evidence или replacement for repository evidence.

## Вывод

Оставить Context7 как optional docs provider для version-sensitive library/API вопросов. Он полезен быстрее, чем ручной web lookup, но должен оставаться supporting context only и user-owned setup boundary.
