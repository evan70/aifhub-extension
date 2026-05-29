# eagle-mem

Репозиторий: [eagleisbatman/eagle-mem](https://github.com/eagleisbatman/eagle-mem)

Проверенный package: `eagle-mem 4.9.10`.

Результаты тестов и выводы по labels: [eagle-mem-benchmark-results.md](eagle-mem-benchmark-results.md).

## Что Это

`eagle-mem` - широкий local runtime layer для agent memory, guardrails, hooks, worker lanes и background automation.

Он шире требования AIFHub memory/retrieval provider: инструмент пытается владеть частью agent lifecycle, а не просто дать scoped optional retrieval.

## Политика AIFHub

Решение: `reject_defer`.

Не предлагать и не устанавливать:

- scoped read root не доказан;
- purge path не доказан;
- usable MCP provider не доказан;
- lifecycle surface включает hooks/background lanes/user-home runtime;
- Windows wrapper работает нестабильно.

Project labels не меняют решение. Даже для больших legacy/multirepo проектов surface слишком широкий.

## CLI И MCP

Наблюдения:

- npm install прошел;
- Windows bin wrapper не запускался cleanly;
- direct Git Bash/WSL `help` работал;
- `version` printed `vunknown`;
- `doctor` reported tool was not installed;
- runtime target и expected DB path были под user's home directory;
- usable MCP provider не verified.

Full install намеренно не запускался, потому что он может touch hooks, runtime setup, DB migrations, background automation и agent configuration.

## Границы И Privacy

Основной риск - lifecycle ownership: automatic hooks, project scanning, source indexing, session summaries, guardrails и shared memory усложняют bounded read scope и clean disablement.

AIFHub не должен запускать install/setup/provisioning flow для этого инструмента.

## Очистка

Not proven. Так как full install был intentionally skipped, purge behavior не validated.

## Мета Для Анализа

```yaml
tool_id: eagle-mem
decision: reject_defer
recommendation_action: do_not_suggest_install
role: none
install_policy: do_not_auto_install
read_scope: not_proven
purge_path: not_proven
avoid_when:
  - scoped_read_root_required
  - clean_disablement_required
  - optional_aifhub_provider_required
analysis_hint: "Не предлагать: lifecycle surface слишком широкий, MCP/scope/purge не доказаны."
```
