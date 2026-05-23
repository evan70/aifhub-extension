# eagle-mem

Repository: [eagleisbatman/eagle-mem](https://github.com/eagleisbatman/eagle-mem)

Tested package: `eagle-mem 4.9.10`.

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

## Что Это

`eagle-mem` - широкий local runtime layer для agent memory, guardrails, hooks, worker lanes и background automation.

Он намного шире требования issue #85. Требование - optional local retrieval/memory helper, который можно безопасно scope и disable. `eagle-mem` пытается владеть большей частью agent lifecycle.

## CLI И MCP

npm package установился, но Windows bin wrapper не запускался cleanly. Запуск через Git Bash сработал достаточно, чтобы inspect commands.

Observed:

- `help` работал.
- `version` printed `vunknown`.
- `doctor` reported tool was not installed.
- Runtime target был под user's home directory.
- Expected database path был под user's home directory.
- SQLite и hooks отсутствовали.

Usable MCP provider не проверен.

## Результаты Тестов

Trial намеренно не выполнял full install, потому что installation touch hooks и global/user agent configuration.

| Check | Result |
|---|---|
| npm install | PASS |
| Windows wrapper | FAIL/PARTIAL |
| Git Bash CLI help | PASS |
| doctor | Reports not installed |
| MCP | Not proven |
| Scoped read root | Not proven |
| Purge/delete index | Not proven |

## Результаты По Project Profiles (2026-05-22)

`eagle-mem` не запускался против source fixtures P1-P5. Full install был intentionally skipped, потому что surface инструмента включает hooks, runtime setup, background lanes и user-home storage.

| Profile | Project Fixture Run | Scenario Tested | Result | Решение для профиля |
|---|---|---|---|---|
| P1 - Большой legacy PHP проект с интеграциями | Not run | Install/doctor only | Слишком широкий, чтобы безопасно тестировать как optional scoped retrieval. | Reject/defer. |
| P2 - Go-сервис с интеграциями | Not run | Install/doctor only | Нет scoped read или purge evidence. | Reject/defer. |
| P3 - Laravel/Vue продукт | Not run | Install/doctor only | Нет scoped read или purge evidence. | Reject/defer. |
| P4 - Multirepo продукт | Not run | Install/doctor only | Multirepo scope isolation не доказан. | Reject/defer. |
| P5 - Малый Go микросервис | Not run | Install/doctor only | Overhead и lifecycle ownership не оправданы. | Reject/defer. |

## Локальный Прогон На Anonymous Profiles (2026-05-22)

Проверка выполнялась только как `help` + `doctor` под isolated `HOME`/`USERPROFILE` через Git Bash. Full install, hooks, background lanes, source scan и DB setup намеренно не запускались.

| Profile | Shape | Help | Doctor | Install State | Runtime Bytes | Purge | Decision |
|---|---|---:|---:|---|---:|---|---|
| R2026-05-22-P01 | `go_service` | 282 ms | 3.1 s | not installed | 0 B | PASS | Reject/defer; install/hooks not tested. |
| R2026-05-22-P02 | `large_framework_app` | 439 ms | 2.8 s | not installed | 0 B | PASS | Reject/defer; install/hooks not tested. |
| R2026-05-22-P03 | `small_microservice` | 266 ms | 2.8 s | not installed | 0 B | PASS | Reject/defer; install/hooks not tested. |
| R2026-05-22-P04 | `large_framework_app` | 324 ms | 2.8 s | not installed | 0 B | PASS | Reject/defer; install/hooks not tested. |
| R2026-05-22-P05 | `large_legacy` | 293 ms | 2.8 s | not installed | 0 B | PASS | Reject/defer; install/hooks not tested. |
| R2026-05-22-P06 | `small_microservice` | 278 ms | 2.8 s | not installed | 0 B | PASS | Reject/defer; install/hooks not tested. |
| R2026-05-22-P07 | `small_microservice` | 264 ms | 3.0 s | not installed | 0 B | PASS | Reject/defer; install/hooks not tested. |
| R2026-05-22-P08 | `large_framework_app` | 286 ms | 2.9 s | not installed | 0 B | PASS | Reject/defer; install/hooks not tested. |
| R2026-05-22-P09 | `small_microservice` | 261 ms | 2.8 s | not installed | 0 B | PASS | Reject/defer; install/hooks not tested. |
| R2026-05-22-P10 | `large_framework_app` | 270 ms | 2.8 s | not installed | 0 B | PASS | Reject/defer; install/hooks not tested. |
| R2026-05-22-P11 | `multirepo` | 273 ms | 2.9 s | not installed | 0 B | PASS | Reject/defer; install/hooks not tested. |
| R2026-05-22-P12 | `multirepo` | 345 ms | 2.9 s | not installed | 0 B | PASS | Reject/defer; install/hooks not tested. |
| R2026-05-22-P13 | `multirepo` | 276 ms | 2.9 s | not installed | 0 B | PASS | Reject/defer; install/hooks not tested. |

Вывод по этому прогону: isolated `doctor` подтверждает, что без install tool не имеет scoped retrieval evidence. Windows `.cmd` wrapper через default WSL bash падал; явный Git Bash работал. Рекомендация остаётся reject/defer.

## Scope И Privacy

Дизайн tool включает automatic hooks, project scanning, source indexing, session summaries, guardrails и shared agent memory. Этот surface слишком широкий для optional provider model в AIFHub.

Для AIFHub основной риск не в конкретной leak, наблюдавшейся в trial. Риск в lifecycle ownership: global hooks и background automation усложняют гарантии bounded read scope и clean disablement.

## Purge

Not proven. Так как full install был intentionally skipped, purge behavior не validated.

## Вывод

Reject/defer для issue #85. Он может быть полезен как отдельный agent runtime product, но не должен интегрироваться как optional AIFHub memory provider.

Рекомендуемая роль в AIFHub: none.
