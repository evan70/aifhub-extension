# Проект: AIFHub Extension

## Обзор

Расширение для ai-factory 2.x CLI, предоставляющее spec-driven workflow для AI-агентов. Включает навыки анализа проекта, создания структурированных планов, верификации и управления артефактами.

## Тип продукта

Extension (расширение для CLI)

## Текущий стек

### Язык
- Markdown (файлы навыков SKILL.md)
- YAML (конфигурация, статус планов)

### Платформа
- ai-factory 2.x CLI

### Формат распространения
- Git-репозиторий
- Версионирование через `extension.json`

## Основные модули

| Модуль | Путь | Назначение |
|--------|------|------------|
| aif-analyze | `skills/aif-analyze/` | Анализ проекта, создание `.ai-factory/DESCRIPTION.md` и `config.yaml` |
| aif-new | `skills/aif-new/` | Создание папки плана с артефактами (task, context, rules, verify, status) |
| aif-roadmap-plus | `skills/aif-roadmap-plus/` | Создание `.ai-factory/ROADMAP.md` с оценкой зрелости по 11 срезам |

## Структура AI-контекста

```
.ai-factory/
  config.yaml        # Настройки локализации и workflow
  DESCRIPTION.md     # Спецификация проекта
  ARCHITECTURE.md    # Архитектурные решения
  ROADMAP.md         # Roadmap проекта
  plans/             # Активные планы
    <plan-id>/
      task.md
      context.md
      rules.md
      verify.md
      status.yaml
  specs/             # Финализированные спецификации
```

## Workflow

```
aif-analyze → aif-explore → aif-new → aif-implement → aif-verify+ → aif-fix → aif-done
```

## Ключевые интеграции

- **ai-factory 2.x**: Платформа-хост, загружает навыки из `extension.json`
- **GitHub Actions**: Автоматическое создание git-тегов при изменении версии в `extension.json`

## Security-Sensitive Areas

- **Отсутствуют**: Проект содержит только Markdown-файлы инструкций для AI-агентов, без исполняемого кода

## Операционные заметки

- Установка: `ai-factory extension add https://github.com/ichinya/aifhub-extension.git`
- Релизы: теги создаются автоматически при push в main с изменённым `extension.json`
- Текущая версия: 0.2.0

## Конфигурация

Настройки проекта хранятся в `.ai-factory/config.yaml`:

| Поле | Описание | По умолчанию |
|------|----------|--------------|
| `language_mode` | Язык коммуникации | `russian` |
| `artifact_language` | Язык генерируемых артефактов | `russian` |
| `technical_terms_language` | Язык технических терминов | `english` |
| `plans_dir` | Директория для активных планов | `.ai-factory/plans` |
| `specs_dir` | Директория для финализированных спеков | `.ai-factory/specs` |
| `workflow.plan_id_format` | Формат ID плана | `slug` |
