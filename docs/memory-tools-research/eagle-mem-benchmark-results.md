# Результаты Тестов eagle-mem

Этот файл содержит evidence по `eagle-mem`. Описание инструмента и политика использования находятся в [eagle-mem.md](eagle-mem.md).

Статус benchmark: paired positive `ai-tester` run не выполняется, потому что инструмент запрещен по lifecycle/scope policy. Для него допустимы только ai-tester negative/forbidden selector scenarios; таблицы ниже являются safety evidence.

## Методика

Full install, hooks, background lanes, source scan и DB setup намеренно не запускались. Проверялись только safe probes, потому что tool surface включает agent lifecycle ownership.

Сравнение с `rg` для source retrieval не выполнялось: scoped read root и purge path не доказаны, значит tool не допускается к paired retrieval benchmark.

## Initial Trial

| Проверка | Результат |
|---|---|
| npm install | PASS |
| Windows wrapper | FAIL/PARTIAL |
| Git Bash CLI help | PASS |
| doctor | Reports not installed |
| MCP | Not proven |
| Scoped read root | Not proven |
| Очистка/delete index | Not proven |

## Anonymous Profiles 2026-05-22

Проверка выполнялась только как `help` + `doctor` под isolated `HOME`/`USERPROFILE` через Git Bash.

| Shape | Profiles | Help Range | Doctor Range | Install State | Runtime Bytes | Очистка | Решение |
|---|---:|---:|---:|---|---:|---|---|
| `go_service` | 1 | 282 ms | 3.1 s | not installed | 0 B | PASS | Reject/defer. |
| `large_framework_app` | 4 | 270-439 ms | 2.8-2.9 s | not installed | 0 B | PASS | Reject/defer. |
| `large_legacy` | 1 | 293 ms | 2.8 s | not installed | 0 B | PASS | Reject/defer. |
| `small_microservice` | 4 | 261-278 ms | 2.8-3.0 s | not installed | 0 B | PASS | Reject/defer. |
| `multirepo` | 3 | 273-345 ms | 2.9 s | not installed | 0 B | PASS | Reject/defer. |

Вывод: safe probe не дал evidence scoped retrieval. Project shape не влияет на запрет.

## Real Project Roots 2026-05-23

| Probe | Isolation | Результат | Заметки |
|---|---|---|---|
| Windows `.cmd --help` | default shell bridge | FAIL | Wrapper вызвал WSL bash с Windows path, который WSL не смог resolve. |
| Direct WSL `help` | isolated `HOME`, isolated `EAGLE_MEM_DIR`, hooks/auto-update disabled | PASS | Command list был readable; install не выполнялся. |
| Direct WSL `doctor` | isolated `HOME`, isolated `EAGLE_MEM_DIR`, hooks/auto-update disabled | PARTIAL/PASS exit | Reported `Overall: Not installed`, SQLite missing, hooks not found, manifest missing. |

## Когда Использовать

Для AIFHub optional memory/retrieval provider: не использовать.

Возможная будущая переоценка только если появятся все evidence:

- explicit scoped read root;
- non-mutating read-only mode;
- verified purge path;
- no hooks/background ownership in recommended mode;
- stable Windows CLI/MCP behavior.

## Когда Не Использовать

Плохие labels/signals:

- все текущие AIFHub project labels;
- private/local projects;
- user expects bounded provider;
- command flow cannot tolerate hooks/background lanes;
- Windows shell environment.

Слабые стороны:

- lifecycle surface слишком широкий;
- purge/read scope не доказаны;
- no usable MCP provider verified;
- tool reports not installed without full setup;
- Windows wrapper unreliable.

## Итог

`eagle-mem` может быть отдельным agent runtime product, но не подходит как optional AIFHub memory provider. Решение остается `reject_defer`.
