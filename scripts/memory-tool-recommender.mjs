#!/usr/bin/env node
// memory-tool-recommender.mjs - local metadata-driven optional tool recommendations
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);

export const RECOMMENDATION_RESULT_SCHEMA = 'aifhub.memory_tools.recommendation_result.v1';
export const METADATA_RESULT_SCHEMA = 'aifhub.memory_tools.metadata_result.v1';
export const STATUS_RESULT_SCHEMA = 'aifhub.memory_tools.status_result.v1';
export const SELECTION_RESULT_SCHEMA = 'aifhub.memory_tools.selection_result.v1';
export const ERROR_SCHEMA = 'aifhub.memory_tools.error.v1';

const METADATA_RELATIVE_PATH = path.join('docs', 'memory-tools-research', 'recommendation-metadata.yaml');
const PROJECT_CONFIG_RELATIVE_PATH = path.join('.ai-factory', 'config.yaml');
const INSTALLED_EXTENSION_PARTS = ['.ai-factory', 'extensions', 'aifhub-extension'];
const VALID_PROJECT_SHAPES = new Set([
  'large_legacy',
  'multirepo',
  'large_framework_app',
  'go_service',
  'small_microservice'
]);
const DEFAULT_TASK_SIGNAL = 'architecture_or_impact_discovery';
const DEFAULT_COMMAND = 'aif-analyze';
const ALWAYS_REJECTED_TOOLS = new Set(['codex-mem', 'eagle-mem']);
const MANUAL_ONLY_TASKS = new Map([
  ['agent-memory', new Set(['manual_durable_notes'])]
]);
const IGNORE_DIRS = new Set([
  '.git',
  '.hg',
  '.svn',
  '.ai-factory/extensions',
  'node_modules',
  'vendor',
  'dist',
  'build',
  'coverage',
  '.cache',
  '.next',
  '.turbo',
  'target',
  'tmp',
  'temp',
  'graphify-out'
]);

export async function runMemoryToolRecommender(args = [], options = {}) {
  const parsed = parseArgs(args);
  const cwd = path.resolve(options.cwd ?? process.cwd());
  const json = parsed.flags.json !== false;

  try {
    if (parsed.command === 'metadata') {
      const loaded = await tryLoadMetadata(parsed, cwd, options);
      if (!loaded.ok) {
        return emitResult(metadataErrorBody(loaded), 1, { ...options, json });
      }
      return emitResult(metadataSummary(loaded.metadata), 0, { ...options, json });
    }

    if (parsed.command === 'status') {
      const loaded = await tryLoadMetadata(parsed, cwd, options);
      const body = await buildStatusResult({
        metadata: loaded.ok ? loaded.metadata : null,
        metadataError: loaded.ok ? null : loaded,
        checkDocsProvider: Boolean(parsed.flags.checkDocsProvider),
        probeRunner: options.probeRunner
      });
      return emitResult(body, 0, { ...options, json });
    }

    if (parsed.command === 'recommend') {
      const loaded = await tryLoadMetadata(parsed, cwd, options);
      const taskSignals = parsed.flags.task.length > 0 ? parsed.flags.task : [DEFAULT_TASK_SIGNAL];
      const projectShape = parsed.flags.fromProject
        ? await classifyProjectShape(cwd)
        : normalizeProjectShape(parsed.flags.shape);

      if (!loaded.ok) {
        const body = degradedRecommendationResult({
          metadataError: loaded,
          projectShape,
          taskSignals
        });
        return emitResult(body, 0, { ...options, json });
      }

      const body = await buildRecommendationResult({
        metadata: loaded.metadata,
        projectShape,
        taskSignals,
        command: parsed.flags.command,
        checkDocsProvider: Boolean(parsed.flags.checkDocsProvider),
        probeRunner: options.probeRunner
      });
      return emitResult(body, 0, { ...options, json });
    }

    if (parsed.command === 'select') {
      const loaded = await tryLoadMetadata(parsed, cwd, options);
      const taskSignals = parsed.flags.task.length > 0 ? parsed.flags.task : [DEFAULT_TASK_SIGNAL];
      const projectShape = parsed.flags.fromProject
        ? await classifyProjectShape(cwd)
        : normalizeProjectShape(parsed.flags.shape);
      const config = await loadProjectToolConfig({
        cwd,
        metadata: loaded.ok ? loaded.metadata : null
      });

      if (!loaded.ok) {
        const body = degradedSelectionResult({
          metadataError: loaded,
          config,
          projectShape,
          taskSignals,
          command: parsed.flags.command
        });
        return emitResult(body, 0, { ...options, json });
      }

      const body = await buildSelectionResult({
        metadata: loaded.metadata,
        config,
        projectShape,
        taskSignals,
        command: parsed.flags.command,
        checkDocsProvider: Boolean(parsed.flags.checkDocsProvider),
        probeRunner: options.probeRunner
      });
      return emitResult(body, 0, { ...options, json });
    }

    return emitResult({
      schema: ERROR_SCHEMA,
      ok: false,
      error: {
        code: 'unknown-command',
        message: `Unknown command: ${parsed.command}`
      }
    }, 2, { ...options, json });
  } catch (err) {
    return emitResult({
      schema: ERROR_SCHEMA,
      ok: false,
      error: {
        code: 'unexpected-error',
        message: err?.message ?? String(err)
      }
    }, 1, { ...options, json });
  }
}

export async function loadRecommendationMetadata(options = {}) {
  const resolved = options.metadataPath
    ? await resolveMetadataPath({ metadataPath: options.metadataPath, cwd: options.cwd })
    : await resolveMetadataPath(options);

  if (!resolved.ok) {
    throw new Error(resolved.error?.message ?? 'Recommendation metadata unavailable.');
  }

  const raw = await readFile(resolved.path, 'utf8');
  return parseRecommendationMetadata(raw, {
    sourcePath: resolved.path,
    sourceKind: resolved.kind
  });
}

export function parseRecommendationMetadata(raw, options = {}) {
  const parsed = parseSimpleYaml(raw);
  parsed.source_path = options.sourcePath ? toPosix(path.normalize(options.sourcePath)) : null;
  parsed.source_kind = options.sourceKind ?? null;

  const required = [
    ['schema', parsed.schema],
    ['default_policy.baseline_tool', parsed.default_policy?.baseline_tool],
    ['tools', parsed.tools]
  ];

  for (const [label, value] of required) {
    if (value === undefined || value === null || value === '') {
      throw new Error(`Invalid recommendation metadata: missing ${label}`);
    }
  }

  return parsed;
}

export async function resolveMetadataPath(options = {}) {
  const cwd = path.resolve(options.cwd ?? process.cwd());

  if (options.metadataPath) {
    const explicitPath = path.resolve(cwd, options.metadataPath);
    return (await pathExists(explicitPath))
      ? { ok: true, path: explicitPath, kind: 'explicit' }
      : metadataMissing([explicitPath], 'Explicit metadata path does not exist.');
  }

  const scriptDir = path.resolve(
    options.scriptDir
      ?? path.dirname(fileURLToPath(import.meta.url))
  );
  const candidates = [];

  const scriptRelativeRoot = path.resolve(scriptDir, '..');
  const scriptRelativeMetadata = path.join(scriptRelativeRoot, METADATA_RELATIVE_PATH);
  candidates.push(scriptRelativeMetadata);
  if (isInstalledExtensionPath(scriptRelativeRoot) && await pathExists(scriptRelativeMetadata)) {
    return { ok: true, path: scriptRelativeMetadata, kind: 'installed-script-relative' };
  }

  const installedProjectMetadata = path.join(cwd, ...INSTALLED_EXTENSION_PARTS, METADATA_RELATIVE_PATH);
  candidates.push(installedProjectMetadata);
  if (await pathExists(installedProjectMetadata)) {
    return { ok: true, path: installedProjectMetadata, kind: 'installed-project' };
  }

  const sourceTreeMetadata = path.join(cwd, METADATA_RELATIVE_PATH);
  candidates.push(sourceTreeMetadata);
  if (await isAifhubExtensionSource(cwd) && await pathExists(sourceTreeMetadata)) {
    return { ok: true, path: sourceTreeMetadata, kind: 'source-tree' };
  }

  return metadataMissing(candidates, 'Local recommendation metadata was not found.');
}

export async function loadProjectToolConfig(options = {}) {
  const cwd = path.resolve(options.cwd ?? process.cwd());
  const configPath = path.join(cwd, PROJECT_CONFIG_RELATIVE_PATH);

  if (!await pathExists(configPath)) {
    return {
      source_kind: 'missing',
      source_path: configPath,
      enabled_tools: [],
      warnings: [{
        code: 'config-missing',
        message: 'Project config .ai-factory/config.yaml was not found.'
      }]
    };
  }

  try {
    const raw = await readFile(configPath, 'utf8');
    const parsed = parseSimpleYaml(raw);
    return normalizeProjectToolConfig(parsed, {
      sourcePath: configPath,
      metadata: options.metadata
    });
  } catch (err) {
    return {
      source_kind: 'invalid',
      source_path: configPath,
      enabled_tools: [],
      warnings: [{
        code: 'config-unreadable',
        message: `Project config could not be read: ${err?.message ?? String(err)}`
      }]
    };
  }
}

export async function buildRecommendationResult(options = {}) {
  const metadata = options.metadata;
  const projectShape = normalizeProjectShape(options.projectShape);
  const taskSignals = normalizeTaskSignals(options.taskSignals);
  const command = normalizeCommand(options.command);
  const baseline = [metadata?.default_policy?.baseline_tool ?? 'rg'];
  const warnings = [];
  const candidates = collectCandidateTools(metadata, projectShape, taskSignals);
  const recommendations = [];

  for (const toolId of candidates) {
    const tool = metadata.tools?.[toolId];
    if (!tool || isRejectedTool(toolId, tool)) continue;
    if (!isAllowedForRequest(toolId, tool, projectShape, taskSignals, metadata)) continue;
    const permission = permissionForTool(metadata, toolId, command);
    if (commandBoundaryReason(tool, command, permission)) continue;

    const probe = await runProbeForTool(toolId, {
      checkDocsProvider: Boolean(options.checkDocsProvider),
      probeRunner: options.probeRunner
    });
    recommendations.push(buildRecommendation(toolId, tool, {
      projectShape,
      taskSignals,
      command,
      permission,
      availability: probe.availability,
      command: probe.command
    }));
  }

  return {
    schema: RECOMMENDATION_RESULT_SCHEMA,
    metadata_available: true,
    metadata_source: metadata.source_path ?? null,
    project_shape: projectShape,
    task_signals: taskSignals,
    baseline,
    recommendations: dedupeRecommendations(recommendations),
    do_not_recommend: buildDoNotRecommend(metadata, projectShape, taskSignals),
    protected_artifacts: asArray(metadata.protected_artifacts),
    forbidden_operations: asArray(metadata.forbidden_operations),
    warnings
  };
}

export async function buildSelectionResult(options = {}) {
  const metadata = options.metadata;
  const projectShape = normalizeProjectShape(options.projectShape);
  const taskSignals = normalizeTaskSignals(options.taskSignals);
  const command = normalizeCommand(options.command);
  const config = options.config ?? {
    source_kind: 'missing',
    source_path: null,
    enabled_tools: [],
    warnings: []
  };
  const baseline = [metadata?.default_policy?.baseline_tool ?? 'rg'];
  const selectedTools = [];
  const notSelectedTools = [];

  for (const toolId of asArray(config.enabled_tools)) {
    const tool = metadata.tools?.[toolId];
    if (!tool) {
      notSelectedTools.push({
        tool_id: toolId,
        reason: 'unknown tool id in project config'
      });
      continue;
    }

    const permission = permissionForTool(metadata, toolId, command);
    const boundaryReason = commandBoundaryReason(tool, command, permission);
    if (boundaryReason) {
      notSelectedTools.push({
        tool_id: toolId,
        reason: boundaryReason,
        permission
      });
      continue;
    }

    if (isRejectedTool(toolId, tool)) {
      notSelectedTools.push({
        tool_id: toolId,
        reason: tool.avoid_reason ?? `${tool.display_name ?? toolId} is rejected by local metadata.`,
        permission
      });
      continue;
    }

    if (!isAllowedForRequest(toolId, tool, projectShape, taskSignals, metadata)) {
      notSelectedTools.push({
        tool_id: toolId,
        reason: `${tool.display_name ?? toolId} is not applicable for ${projectShape} + ${taskSignals.join(', ')}.`,
        permission
      });
      continue;
    }

    const probe = await runProbeForTool(toolId, {
      checkDocsProvider: Boolean(options.checkDocsProvider),
      probeRunner: options.probeRunner
    });
    selectedTools.push({
      ...buildRecommendation(toolId, tool, {
        projectShape,
        taskSignals,
        command,
        permission,
        availability: probe.availability,
        command: probe.command
      }),
      configured: true,
      execution: executionForTool(tool, command)
    });
  }

  return {
    schema: SELECTION_RESULT_SCHEMA,
    metadata_available: true,
    metadata_source: metadata.source_path ?? null,
    config: {
      source_kind: config.source_kind,
      source_path: config.source_path ? toPosix(path.normalize(config.source_path)) : null,
      enabled_tools: asArray(config.enabled_tools)
    },
    command,
    project_shape: projectShape,
    task_signals: taskSignals,
    baseline,
    selected_tools: dedupeRecommendations(selectedTools),
    not_selected_tools: notSelectedTools,
    protected_artifacts: asArray(metadata.protected_artifacts),
    forbidden_operations: asArray(metadata.forbidden_operations),
    warnings: asArray(config.warnings)
  };
}

async function buildStatusResult(options = {}) {
  const metadata = options.metadata;
  const tools = metadata?.tools ? Object.keys(metadata.tools) : [];
  const probes = {};

  for (const toolId of ['rg', 'uv', ...tools]) {
    probes[toolId] = await runProbeForTool(toolId, {
      checkDocsProvider: Boolean(options.checkDocsProvider),
      probeRunner: options.probeRunner
    });
  }

  return {
    schema: STATUS_RESULT_SCHEMA,
    metadata_available: Boolean(metadata),
    metadata_source: metadata?.source_path ?? null,
    probes,
    warnings: options.metadataError
      ? [metadataWarning(options.metadataError)]
      : []
  };
}

function metadataSummary(metadata) {
  const tools = {};
  for (const [toolId, tool] of Object.entries(metadata.tools ?? {})) {
    tools[toolId] = {
      display_name: tool.display_name ?? toolId,
      decision: tool.decision ?? null,
      recommendation_action: tool.recommendation_action ?? null,
      install_policy: tool.install_policy ?? metadata.default_policy?.install_policy ?? null,
      read_scope: tool.read_scope ?? null,
      purge_path: tool.purge_path ?? null,
      allowed_in: asArray(tool.allowed_in),
      forbidden_in: asArray(tool.forbidden_in),
      privacy_caveat: tool.privacy_caveat ?? null,
      permissions: metadata.tool_permissions?.[toolId] ?? null,
      execution: tool.execution ?? null
    };
  }

  return {
    schema: METADATA_RESULT_SCHEMA,
    metadata_schema: metadata.schema,
    metadata_available: true,
    metadata_source: metadata.source_path ?? null,
    default_policy: metadata.default_policy ?? {},
    skill_usage_matrix: metadata.skill_usage_matrix ?? {},
    tool_permissions: metadata.tool_permissions ?? {},
    availability_probes: metadata.availability_probes ?? {},
    forbidden_operations: asArray(metadata.forbidden_operations),
    protected_artifacts: asArray(metadata.protected_artifacts),
    project_shape_signals: Object.keys(metadata.project_shape_signals ?? {}),
    task_signals: Object.keys(metadata.task_signals ?? {}),
    tools
  };
}

function degradedRecommendationResult(options = {}) {
  return {
    schema: RECOMMENDATION_RESULT_SCHEMA,
    metadata_available: false,
    metadata_source: options.metadataError?.path ?? null,
    project_shape: normalizeProjectShape(options.projectShape),
    task_signals: normalizeTaskSignals(options.taskSignals),
    baseline: ['rg'],
    recommendations: [],
    do_not_recommend: [],
    warnings: [metadataWarning(options.metadataError)]
  };
}

function degradedSelectionResult(options = {}) {
  return {
    schema: SELECTION_RESULT_SCHEMA,
    metadata_available: false,
    metadata_source: options.metadataError?.path ?? null,
    config: {
      source_kind: options.config?.source_kind ?? 'missing',
      source_path: options.config?.source_path ? toPosix(path.normalize(options.config.source_path)) : null,
      enabled_tools: asArray(options.config?.enabled_tools)
    },
    command: normalizeCommand(options.command),
    project_shape: normalizeProjectShape(options.projectShape),
    task_signals: normalizeTaskSignals(options.taskSignals),
    baseline: ['rg'],
    selected_tools: [],
    not_selected_tools: [],
    protected_artifacts: [],
    forbidden_operations: [],
    warnings: [
      metadataWarning(options.metadataError),
      ...asArray(options.config?.warnings)
    ]
  };
}

function metadataErrorBody(error) {
  return {
    schema: ERROR_SCHEMA,
    ok: false,
    metadata_available: false,
    metadata_source: error?.path ?? null,
    error: {
      code: error?.code ?? 'metadata-unavailable',
      message: error?.error?.message ?? error?.message ?? 'Recommendation metadata unavailable.'
    }
  };
}

function metadataWarning(error) {
  return {
    code: error?.code ?? 'metadata-unavailable',
    message: `Recommendation metadata unavailable: ${error?.error?.message ?? error?.message ?? 'local metadata not found'}`
  };
}

function collectCandidateTools(metadata, projectShape, taskSignals) {
  const candidates = new Set();
  const shape = metadata.project_shape_signals?.[projectShape] ?? {};

  for (const toolId of asArray(shape.suggest_tools)) candidates.add(toolId);
  for (const toolId of asArray(shape.conditional_tools)) {
    if (toolMatchesTask(metadata.tools?.[toolId], taskSignals)) {
      candidates.add(toolId);
    }
  }

  for (const signal of taskSignals) {
    const task = metadata.task_signals?.[signal] ?? {};
    for (const toolId of asArray(task.recommend)) candidates.add(toolId);
    for (const toolId of asArray(task.conditional)) candidates.add(toolId);
  }

  candidates.delete(metadata.default_policy?.baseline_tool ?? 'rg');
  return [...candidates];
}

function toolMatchesTask(tool, taskSignals) {
  if (!tool) return false;
  const recommendedTasks = [
    ...asArray(tool.recommended_for?.tasks),
    ...asArray(tool.conditional_for?.tasks)
  ];
  return taskSignals.some((signal) => recommendedTasks.includes(signal));
}

function isAllowedForRequest(toolId, tool, projectShape, taskSignals, metadata) {
  if (ALWAYS_REJECTED_TOOLS.has(toolId)) return false;

  const manualTaskSet = MANUAL_ONLY_TASKS.get(toolId);
  if (manualTaskSet && !taskSignals.some((signal) => manualTaskSet.has(signal))) {
    return false;
  }

  const shape = metadata.project_shape_signals?.[projectShape] ?? {};
  if (asArray(shape.avoid_tools).includes(toolId)) return false;

  for (const signal of taskSignals) {
    const task = metadata.task_signals?.[signal] ?? {};
    if (asArray(task.avoid).includes(toolId)) return false;
    if (asArray(task.avoid_by_default).includes(toolId)) return false;
  }

  if (asArray(tool.do_not_recommend_for?.project_shapes).includes(projectShape)) return false;
  if (taskSignals.some((signal) => asArray(tool.do_not_recommend_for?.tasks).includes(signal))) return false;

  return !isRejectedTool(toolId, tool);
}

function isRejectedTool(toolId, tool) {
  return ALWAYS_REJECTED_TOOLS.has(toolId)
    || tool.decision === 'reject_default'
    || tool.decision === 'reject_defer'
    || /^do_not_/.test(String(tool.recommendation_action ?? ''));
}

function commandBoundaryReason(tool, command, permission) {
  if (permission === 'forbidden') {
    return `${tool.display_name ?? 'Tool'} is forbidden for ${command}.`;
  }
  if (asArray(tool.forbidden_in).includes(command)) {
    return `${tool.display_name ?? 'Tool'} is forbidden for ${command}.`;
  }
  const allowedIn = asArray(tool.allowed_in).filter((scope) => String(scope).startsWith('aif-'));
  if (allowedIn.length > 0 && !allowedIn.includes(command)) {
    return `${tool.display_name ?? 'Tool'} is not allowed for ${command}.`;
  }
  return null;
}

function buildRecommendation(toolId, tool, context) {
  const installPolicy = tool.install_policy ?? 'explicit_user_opt_in_only';
  return {
    tool_id: toolId,
    display_name: tool.display_name ?? toolId,
    status: tool.decision ?? 'optional',
    availability: context.availability ?? 'unknown',
    reason: `${context.projectShape} + ${context.taskSignals.join(', ')}`,
    install_policy: installPolicy,
    read_scope: tool.read_scope ?? 'unknown',
    purge_path: tool.purge_path ?? 'unknown',
    allowed_in: asArray(tool.allowed_in),
    forbidden_in: asArray(tool.forbidden_in),
    permission: context.permission ?? null,
    privacy_caveat: tool.privacy_caveat ?? null,
    next_step: nextStepForTool(toolId, tool)
  };
}

function executionForTool(tool, command) {
  const execution = tool?.execution;
  if (!execution || typeof execution !== 'object') return null;
  return execution[command] ?? execution.default ?? null;
}

function nextStepForTool(toolId, tool) {
  if (toolId === 'graphify') {
    return 'Use rg first; optionally run graphify manually if broad search is noisy.';
  }
  if (toolId === 'codex-agent-mem') {
    return 'Use only for continuity with read-only/minimal mode and an explicit DB path.';
  }
  if (toolId === 'context-mode') {
    return 'Use only as a manual temporary index for explicit generated output, then purge it.';
  }
  if (toolId === 'context7') {
    return 'Use only as optional user-owned docs lookup for version-sensitive library/API questions.';
  }
  if (toolId === 'codegraph') {
    return 'Use rg first; for broad repo graph questions only, run codegraph init <project>, codegraph index --quiet <project>, codegraph query --path <project> ... --json, then codegraph uninit --force <project>. Do not run codegraph install, sync, serve, serve --mcp, or mutate agent config.';
  }
  if (toolId === 'agent-memory') {
    return 'Use only as a manual markdown notebook when the user explicitly asks for durable notes.';
  }
  return tool.suggestion_text ?? 'Use only as explicit opt-in supporting context.';
}

function buildDoNotRecommend(metadata, projectShape, taskSignals) {
  const entries = new Map();

  for (const [toolId, tool] of Object.entries(metadata.tools ?? {})) {
    if (isRejectedTool(toolId, tool)) {
      entries.set(toolId, {
        tool_id: toolId,
        reason: tool.avoid_reason ?? `${tool.display_name ?? toolId} is not recommended by local metadata.`
      });
    }
  }

  const shape = metadata.project_shape_signals?.[projectShape] ?? {};
  for (const toolId of asArray(shape.avoid_tools)) {
    const tool = metadata.tools?.[toolId] ?? {};
    entries.set(toolId, {
      tool_id: toolId,
      reason: tool.avoid_reason ?? `${tool.display_name ?? toolId} is avoided for ${projectShape}.`
    });
  }

  for (const signal of taskSignals) {
    const task = metadata.task_signals?.[signal] ?? {};
    for (const toolId of [...asArray(task.avoid), ...asArray(task.avoid_by_default)]) {
      const tool = metadata.tools?.[toolId] ?? {};
      entries.set(toolId, {
        tool_id: toolId,
        reason: tool.avoid_reason ?? `${tool.display_name ?? toolId} is avoided for ${signal}.`
      });
    }
  }

  return [...entries.values()];
}

async function runProbeForTool(toolId, options = {}) {
  if (options.probeRunner) {
    const probe = await options.probeRunner(toolId, options);
    return normalizeProbeResult(probe);
  }

  if (toolId === 'rg') return probeAny([['rg', ['--version']]]);
  if (toolId === 'uv') return probeAny([['uv', ['--version']]]);
  if (toolId === 'graphify') return probeAny([['graphify', ['--version']], ['graphify', ['--help']]]);
  if (toolId === 'codex-agent-mem') {
    return probeAny([
      ['codex-agent-mem-policy', ['--help']],
      ['codex-agent-mem-smoke', ['--help']]
    ]);
  }
  if (toolId === 'context-mode') return probeAny([['context-mode', ['doctor']]]);
  if (toolId === 'context7') {
    if (!options.checkDocsProvider) {
      return {
        availability: 'unknown',
        command: null,
        note: 'Context7 probe skipped; pass --check-docs-provider to check local docs provider availability.'
      };
    }
    return probeAny([['ctx7', ['--version']], ['npx', ['--no-install', 'ctx7', '--help']]]);
  }
  if (toolId === 'codegraph') {
    return probeAny([
      ['codegraph', ['--version']],
      ['codegraph', ['--help']],
      ['codegraph', ['status']]
    ]);
  }

  return {
    availability: 'unknown',
    command: null
  };
}

async function probeAny(commands) {
  let last = null;

  for (const [command, args] of commands) {
    const probe = await probeCommand(command, args);
    if (probe.availability === 'installed') return probe;
    last = probe;
  }

  return last ?? { availability: 'unknown', command: null };
}

async function probeCommand(command, args) {
  const commandLabel = [command, ...args].join(' ');
  try {
    await execFileAsync(command, args, {
      windowsHide: true,
      timeout: 5000,
      maxBuffer: 64 * 1024
    });
    return {
      availability: 'installed',
      command: commandLabel
    };
  } catch (err) {
    if (process.platform === 'win32' && (err?.code === 'ENOENT' || err?.code === 'EINVAL')) {
      return probeWindowsShellCommand(command, args, commandLabel, err.code);
    }
    return {
      availability: err?.code === 'ENOENT' ? 'not_installed' : 'unknown',
      command: commandLabel,
      reason: err?.code === 'ENOENT' ? 'command-not-found' : 'probe-failed'
    };
  }
}

async function probeWindowsShellCommand(command, args, commandLabel, originalCode = null) {
  const shell = process.env.ComSpec || 'cmd.exe';
  const commandLine = [command, ...args].map(quoteWindowsShellArg).join(' ');
  try {
    await execFileAsync(shell, ['/d', '/s', '/c', commandLine], {
      windowsHide: true,
      timeout: 5000,
      maxBuffer: 64 * 1024
    });
    return {
      availability: 'installed',
      command: commandLabel
    };
  } catch (err) {
    const output = `${err?.stdout ?? ''}\n${err?.stderr ?? ''}`;
    const notFound = /not recognized|cannot find|not found/i.test(output);
    const directSpawnCouldNotResolve = originalCode === 'ENOENT' || originalCode === 'EINVAL';
    return {
      availability: notFound || directSpawnCouldNotResolve ? 'not_installed' : 'unknown',
      command: commandLabel,
      reason: notFound || directSpawnCouldNotResolve ? 'command-not-found' : 'probe-failed'
    };
  }
}

function quoteWindowsShellArg(value) {
  const text = String(value);
  if (/^[A-Za-z0-9._:=+/@%-]+$/.test(text)) return text;
  return `"${text.replaceAll('"', '\\"')}"`;
}

function normalizeProbeResult(probe) {
  if (!probe || typeof probe !== 'object') {
    return { availability: 'unknown', command: null };
  }
  const availability = ['installed', 'not_installed', 'unknown'].includes(probe.availability)
    ? probe.availability
    : 'unknown';
  return {
    ...probe,
    availability,
    command: probe.command ?? null
  };
}

async function classifyProjectShape(cwd) {
  const stats = await scanProject(cwd);
  if (stats.manifestCount >= 3 || stats.workspaceMarkers > 0) return 'multirepo';
  if (stats.hasGoMod) return stats.fileCount <= 100 ? 'small_microservice' : 'go_service';
  if (stats.fileCount <= 100) return 'small_microservice';
  if (stats.fileCount >= 1500) return 'large_legacy';
  if (stats.hasFrameworkMarker || stats.fileCount >= 250) return 'large_framework_app';
  return 'large_framework_app';
}

async function scanProject(rootDir) {
  const result = {
    fileCount: 0,
    manifestCount: 0,
    workspaceMarkers: 0,
    hasGoMod: false,
    hasFrameworkMarker: false
  };

  async function walk(currentDir, relativeDir = '') {
    let entries;
    try {
      entries = await readdir(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const rel = relativeDir ? path.join(relativeDir, entry.name) : entry.name;
      const normalized = toPosix(rel);
      if (entry.isDirectory()) {
        if (shouldIgnoreDir(normalized)) continue;
        await walk(path.join(currentDir, entry.name), rel);
        continue;
      }
      if (!entry.isFile()) continue;

      result.fileCount += 1;
      if (isManifestName(entry.name)) result.manifestCount += 1;
      if (entry.name === 'go.mod') result.hasGoMod = true;
      if (isWorkspaceMarker(entry.name)) result.workspaceMarkers += 1;
      if (isFrameworkMarker(normalized)) result.hasFrameworkMarker = true;
    }
  }

  await walk(rootDir);
  return result;
}

function shouldIgnoreDir(relativeDir) {
  if (IGNORE_DIRS.has(relativeDir)) return true;
  const parts = relativeDir.split('/');
  return parts.some((part) => IGNORE_DIRS.has(part));
}

function isManifestName(name) {
  return [
    'package.json',
    'go.mod',
    'pyproject.toml',
    'requirements.txt',
    'Cargo.toml',
    'pom.xml',
    'build.gradle',
    'composer.json'
  ].includes(name);
}

function isWorkspaceMarker(name) {
  return [
    'pnpm-workspace.yaml',
    'lerna.json',
    'rush.json',
    'nx.json',
    'turbo.json'
  ].includes(name);
}

function isFrameworkMarker(relativePath) {
  return /(^|\/)(src|app|pages|routes|controllers|components)\//.test(relativePath)
    || /(^|\/)(next|vite|nuxt|angular|svelte|astro)\.config\./.test(relativePath);
}

async function tryLoadMetadata(parsed, cwd, options = {}) {
  try {
    const resolved = await resolveMetadataPath({
      metadataPath: parsed.flags.metadata,
      scriptDir: options.scriptDir,
      cwd
    });
    if (!resolved.ok) return resolved;

    const raw = await readFile(resolved.path, 'utf8');
    return {
      ok: true,
      metadata: parseRecommendationMetadata(raw, {
        sourcePath: resolved.path,
        sourceKind: resolved.kind
      })
    };
  } catch (err) {
    return {
      ok: false,
      code: 'metadata-unavailable',
      error: {
        message: err?.message ?? String(err)
      }
    };
  }
}

function parseArgs(args) {
  const command = args[0] && !args[0].startsWith('-') ? args[0] : 'recommend';
  const rest = command === args[0] ? args.slice(1) : args;
  const flags = {
    json: false,
    fromProject: false,
    checkDocsProvider: false,
    shape: null,
    task: [],
    command: null,
    metadata: null
  };

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (token === '--json') {
      flags.json = true;
    } else if (token === '--from-project') {
      flags.fromProject = true;
    } else if (token === '--check-docs-provider') {
      flags.checkDocsProvider = true;
    } else if (token === '--shape') {
      flags.shape = rest[++index];
    } else if (token === '--task') {
      flags.task.push(rest[++index]);
    } else if (token === '--command') {
      flags.command = rest[++index];
    } else if (token === '--metadata') {
      flags.metadata = rest[++index];
    }
  }

  return {
    command,
    flags
  };
}

function normalizeProjectToolConfig(parsed, options = {}) {
  const metadataTools = Object.keys(options.metadata?.tools ?? {});
  const utilities = isPlainObject(parsed.utilities) ? parsed.utilities : {};
  const contextTools = firstPlainObject(
    utilities.context_tools,
    utilities.optional_context_tools,
    utilities.memory_tools
  );
  const enabled = [];

  for (const toolId of asArray(contextTools.enabled)) {
    addNormalizedToolId(enabled, toolId);
  }

  for (const toolId of metadataTools) {
    const utility = utilities[toolId];
    if (utility === true || (isPlainObject(utility) && utility.enabled === true)) {
      addNormalizedToolId(enabled, toolId);
    }
  }

  return {
    source_kind: 'project-config',
    source_path: options.sourcePath ?? null,
    enabled_tools: enabled,
    warnings: []
  };
}

function firstPlainObject(...values) {
  return values.find((value) => isPlainObject(value)) ?? {};
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function addNormalizedToolId(target, value) {
  const text = String(value ?? '').trim();
  if (!text || target.includes(text)) return;
  target.push(text);
}

function normalizeProjectShape(shape) {
  const normalized = String(shape ?? 'large_framework_app').trim();
  return VALID_PROJECT_SHAPES.has(normalized) ? normalized : 'large_framework_app';
}

function normalizeTaskSignals(signals) {
  const normalized = asArray(signals).map((signal) => String(signal).trim()).filter(Boolean);
  return normalized.length > 0 ? [...new Set(normalized)] : [DEFAULT_TASK_SIGNAL];
}

function normalizeCommand(command) {
  const normalized = String(command ?? DEFAULT_COMMAND).trim();
  return normalized || DEFAULT_COMMAND;
}

function permissionForTool(metadata, toolId, command) {
  const permissions = metadata?.tool_permissions?.[toolId];
  if (!permissions || typeof permissions !== 'object') return null;
  return permissions[command] ?? permissions.default ?? null;
}

function dedupeRecommendations(recommendations) {
  const seen = new Set();
  return recommendations.filter((item) => {
    if (seen.has(item.tool_id)) return false;
    seen.add(item.tool_id);
    return true;
  });
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === '') return [];
  return [value];
}

async function isAifhubExtensionSource(rootDir) {
  try {
    const raw = await readFile(path.join(rootDir, 'extension.json'), 'utf8');
    return JSON.parse(raw).name === 'aifhub-extension';
  } catch {
    return false;
  }
}

function isInstalledExtensionPath(rootDir) {
  const normalized = toPosix(path.normalize(rootDir));
  return normalized.endsWith(INSTALLED_EXTENSION_PARTS.join('/'));
}

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function metadataMissing(candidates, message) {
  return {
    ok: false,
    code: 'metadata-unavailable',
    path: null,
    searched: candidates.map((candidate) => toPosix(path.normalize(candidate))),
    error: {
      message
    }
  };
}

function parseSimpleYaml(raw) {
  const root = {};
  const stack = [{ indent: -1, value: root, parent: null, key: null }];

  for (const rawLine of String(raw ?? '').split(/\r?\n/)) {
    const uncommented = stripInlineComment(rawLine);
    if (!uncommented.trim()) continue;

    const indent = uncommented.match(/^\s*/)[0].length;
    const content = uncommented.trim();

    while (stack.length > 1 && indent <= stack.at(-1).indent) {
      stack.pop();
    }

    let frame = stack.at(-1);

    if (content.startsWith('- ')) {
      frame = ensureArrayFrame(frame, stack);
      const itemRaw = content.slice(2).trim();
      const keyValue = itemRaw.match(/^([A-Za-z0-9_-]+):(?:\s*(.*?))?\s*$/);

      if (keyValue) {
        const item = {};
        frame.value.push(item);
        const key = keyValue[1];
        const rawValue = keyValue[2] ?? '';
        if (rawValue.length > 0) {
          item[key] = parseScalar(rawValue);
          stack.push({ indent, value: item, parent: frame.value, key: frame.value.length - 1 });
        } else {
          item[key] = {};
          stack.push({ indent, value: item, parent: frame.value, key: frame.value.length - 1 });
          stack.push({ indent: indent + 1, value: item[key], parent: item, key });
        }
      } else {
        frame.value.push(parseScalar(itemRaw));
      }
      continue;
    }

    const match = content.match(/^([A-Za-z0-9_-]+):(?:\s*(.*?))?\s*$/);
    if (!match) continue;

    const key = match[1];
    const rawValue = match[2] ?? '';
    const parent = frame.value;

    if (rawValue.length === 0) {
      parent[key] = {};
      stack.push({ indent, value: parent[key], parent, key });
    } else {
      parent[key] = parseScalar(rawValue);
    }
  }

  return root;
}

function ensureArrayFrame(frame, stack) {
  if (Array.isArray(frame.value)) return frame;
  if (frame.parent && frame.key !== null) {
    const array = [];
    frame.parent[frame.key] = array;
    frame.value = array;
    stack[stack.length - 1] = frame;
    return frame;
  }
  throw new Error('Invalid YAML list placement.');
}

function parseScalar(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return '';

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
    || (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  const lower = trimmed.toLowerCase();
  if (trimmed === '[]') return [];
  if (lower === 'true') return true;
  if (lower === 'false') return false;
  if (lower === 'null') return null;
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);

  return trimmed;
}

function stripInlineComment(value) {
  let quote = null;
  const raw = String(value ?? '');

  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    if ((char === '"' || char === "'") && (index === 0 || raw[index - 1] !== '\\')) {
      quote = quote === char ? null : quote ?? char;
      continue;
    }
    if (char === '#' && quote === null && (index === 0 || /\s/.test(raw[index - 1]))) {
      return raw.slice(0, index);
    }
  }

  return raw;
}

function emitResult(body, exitCode, options = {}) {
  const output = options.json === false
    ? String(body?.error?.message ?? body?.schema ?? '')
    : `${JSON.stringify(body, null, 2)}\n`;

  if (Array.isArray(options.stdout)) {
    options.stdout.push(output);
  } else if (options.stdout && typeof options.stdout.write === 'function') {
    options.stdout.write(output);
  } else {
    process.stdout.write(output);
  }

  if (options.exit !== false) {
    process.exitCode = exitCode;
  }

  return {
    exitCode,
    body
  };
}

function toPosix(value) {
  return String(value).replaceAll(path.sep, '/');
}

function isDirectRun() {
  return process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (isDirectRun()) {
  const result = await runMemoryToolRecommender(process.argv.slice(2));
  process.exit(result.exitCode);
}
