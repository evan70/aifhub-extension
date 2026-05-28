# context-mode

Репозиторий: [mksglu/context-mode](https://github.com/mksglu/context-mode)

Проверенный package: `context-mode 1.0.151`.

Результаты тестов и выводы по labels: [context-mode-benchmark-results.md](context-mode-benchmark-results.md).

## Что Это

`context-mode` - temporary context-window optimization и retrieval tool. Он может индексировать explicit content, искать по нему и purge knowledge base.

Для AIFHub это не persistent memory provider. Его полезная роль - временно сжать и переиспользовать большой generated output, например summary нескольких команд.

Полезен для:

- `large_command_output_compression`;
- temporary one-session retrieval;
- поиска по explicit indexed generated output.

Не подходит для:

- source-code indexing;
- persistent project memory;
- small project lookup;
- protected validation artifacts;
- implementation/verify gates.

## Политика AIFHub

`context-mode` остается `manual_helper_only`.

Рекомендовать только если анализ упирается в большой generated output. Project labels важны косвенно: на large/legacy/multirepo проектах output может быть больше, но сам tool полезен только при task signal.

Не рекомендовать для `small_microservice`, exact lookup и любых задач, где `rg` напрямую дает нужные файлы.

## CLI И MCP

Проверенный безопасный flow:

```text
context-mode doctor
ctx_index <explicit-generated-text>
ctx_search <query>
ctx_purge scope=project
```

MCP exposes широкий surface: `ctx_execute`, `ctx_index`, `ctx_search`, `ctx_fetch_and_index`, `ctx_batch_execute`, `ctx_stats`, `ctx_doctor`, `ctx_upgrade`, `ctx_purge`, `ctx_insight`.

Из AIFHub не использовать command execution tools как default provider. Индексировать только explicit generated content, не source tree.

## Границы И Privacy

Все, что explicit indexed, становится retrievable. Поэтому нельзя индексировать raw secrets, private snippets, local paths или protected validation artifacts.

Не устанавливать hooks и не register MCP automatically.

## Очистка

Использовать `ctx_purge`:

- `scope: "session"` с session id;
- `scope: "project"` для whole project knowledge base.

## Мета Для Анализа

```yaml
tool_id: context-mode
decision: manual_helper_only
recommendation_action: suggest_only_for_large_temporary_outputs
role: temporary_output_index
install_policy: explicit_user_opt_in_only
read_scope: explicit_indexed_content
purge_path: ctx_purge_session_or_project
recommend_when:
  tasks:
    - large_command_output_compression
    - temporary_one_session_retrieval
do_not_recommend_when:
  project_shapes:
    - small_microservice
  tasks:
    - persistent_project_memory
    - source_code_indexing
analysis_hint: "Предлагать только для большого generated output; не использовать как source-code memory."
```
