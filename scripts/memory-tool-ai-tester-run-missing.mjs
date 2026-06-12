#!/usr/bin/env node
// memory-tool-ai-tester-run-missing.mjs - resumable executor for missing ai-tester matrix rows
import { spawn } from 'node:child_process';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import {
  buildAiTesterResultsReport,
  collectAiTesterTraceIndex,
  renderAiTesterResultsMarkdown
} from './memory-tool-ai-tester-results-report.mjs';

const DEFAULT_REPORT_COPY = path.join('docs', 'memory-tools-research', 'ai-tester-token-matrices.md');
const DEFAULT_TIMEOUT_MS = 900000;

export async function runMemoryToolAiTesterMissing(args = [], options = {}) {
  const parsed = parseArgs(args);
  if (parsed.help) return emitText(getCliUsage(), 0, options);

  const cwd = path.resolve(options.cwd ?? process.cwd());
  const matrixDir = path.resolve(cwd, parsed.matrixDir);
  const matrixSummary = await readMatrixSummary(matrixDir);
  const traceIndex = await collectTraceIndex(parsed.runsDir);
  const scenarioDir = path.join(matrixDir, 'scenarios');
  const plan = buildMissingRunPlan({
    matrixSummary,
    traceIndex,
    scenarioDir,
    skills: parsed.skills,
    profiles: parsed.profiles,
    limit: parsed.maxRuns
  });

  if (parsed.dryRun) {
    return emit({
      total_missing_after_filters: plan.total_missing_after_filters,
      selected_count: plan.items.length,
      items: plan.items.map((item) => ({
        id: item.case.id,
        skill: item.case.skill,
        profile_id: item.case.profile_id,
        tool_id: item.case.tool_id,
        scenario_file: item.scenarioPath
      }))
    }, 0, options);
  }

  const logDir = path.resolve(cwd, parsed.logDir ?? path.join(matrixDir, 'run-missing-logs'));
  await mkdir(logDir, { recursive: true });
  const runtimeEnv = await buildRuntimeEnv({ matrixDir });

  const startedAt = Date.now();
  const deadlineAt = parsed.deadlineMs ? startedAt + parsed.deadlineMs : null;
  const results = [];
  for (const item of plan.items) {
    if (deadlineAt && Date.now() >= deadlineAt) break;
    const result = await runScenario({
      cwd,
      scenarioPath: item.scenarioPath,
      timeoutMs: parsed.timeoutMs,
      env: runtimeEnv,
      runCommand: options.runCommand
    });
    const logPath = path.join(logDir, `${safeFileName(item.case.id)}.log`);
    await writeFile(logPath, renderRunLog({ item, result }), 'utf8');
    results.push({
      id: item.case.id,
      skill: item.case.skill,
      profile_id: item.case.profile_id,
      tool_id: item.case.tool_id,
      exit_code: result.exitCode,
      timed_out: result.timedOut,
      duration_ms: result.durationMs,
      log_path: logPath
    });
    await refreshTokenReport({
      matrixSummary,
      matrixDir,
      runsDir: parsed.runsDir,
      copyMarkdown: parsed.reportCopy === false ? null : path.resolve(cwd, parsed.reportCopy ?? DEFAULT_REPORT_COPY)
    });
    if (result.exitCode !== 0 && parsed.stopOnFail) break;
  }

  const finalTraceIndex = await collectTraceIndex(parsed.runsDir);
  const finalReport = buildAiTesterResultsReport({
    matrixSummary,
    traceIndex: finalTraceIndex,
    runsDir: parsed.runsDir ?? finalTraceIndex.runs_dir
  });
  const body = {
    attempted: results.length,
    succeeded: results.filter((item) => item.exit_code === 0).length,
    failed: results.filter((item) => item.exit_code !== 0).length,
    executed_rows: finalReport.summary.executed_rows,
    not_run_rows: finalReport.summary.not_run_rows,
    results
  };

  return parsed.json ? emit(body, 0, options) : emitText(renderSummary(body), 0, options);
}

export function buildMissingRunPlan({
  matrixSummary,
  traceIndex,
  scenarioDir,
  skills = [],
  profiles = [],
  limit = null
} = {}) {
  const latestByScenario = traceIndex?.latest_by_scenario ?? {};
  const skillSet = new Set(skills);
  const profileSet = new Set(profiles);
  const missing = [];
  for (const matrixCase of asArray(matrixSummary?.cases)) {
    if (skillSet.size > 0 && !skillSet.has(matrixCase.skill)) continue;
    if (profileSet.size > 0 && !profileSet.has(matrixCase.profile_id)) continue;
    if (latestByScenario[matrixCase.id]) continue;
    missing.push({
      case: matrixCase,
      scenarioPath: scenarioPathForCase({ scenarioDir, matrixCase })
    });
  }
  return {
    total_missing_after_filters: missing.length,
    items: Number.isFinite(limit) && limit >= 0 ? missing.slice(0, limit) : missing
  };
}

export function scenarioPathForCase({ scenarioDir, matrixCase }) {
  const optionalToolId = matrixCase.optional_tool_id ?? matrixCase.tool_id;
  const suffix = matrixCase.tool_id === 'rg' ? '__baseline_rg' : '';
  const scenarioSegment = matrixCase.scenario_id ? `__${matrixCase.scenario_id}` : '';
  return path.join(
    scenarioDir,
    `${matrixCase.profile_id}__${matrixCase.skill}__${optionalToolId}__${matrixCase.task_scenario}${scenarioSegment}${suffix}.yaml`
  );
}

async function readMatrixSummary(matrixDir) {
  return JSON.parse(await readFile(path.join(matrixDir, 'matrix-summary.json'), 'utf8'));
}

async function refreshTokenReport({ matrixSummary, matrixDir, runsDir = null, copyMarkdown = null }) {
  const traceIndex = await collectTraceIndex(runsDir);
  const report = buildAiTesterResultsReport({
    matrixSummary,
    traceIndex,
    runsDir: runsDir ?? traceIndex.runs_dir
  });
  await writeFile(path.join(matrixDir, 'ai-tester-token-matrices.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  const markdown = renderAiTesterResultsMarkdown(report);
  await writeFile(path.join(matrixDir, 'ai-tester-token-matrices.md'), markdown, 'utf8');
  if (copyMarkdown) {
    await mkdir(path.dirname(copyMarkdown), { recursive: true });
    await writeFile(copyMarkdown, markdown, 'utf8');
  }
}

function collectTraceIndex(runsDir) {
  return runsDir ? collectAiTesterTraceIndex({ runsDir }) : collectAiTesterTraceIndex();
}

async function runScenario({ cwd, scenarioPath, timeoutMs = DEFAULT_TIMEOUT_MS, env = process.env, runCommand = null }) {
  if (runCommand) return runCommand({ cwd, scenarioPath, timeoutMs, env });
  const startedAt = Date.now();
  return new Promise((resolve) => {
    const { command, args } = buildAiTesterCommand(scenarioPath);
    const child = spawn(command, args, {
      cwd,
      env,
      windowsHide: true
    });
    let stdout = '';
    let stderr = '';
    let settled = false;
    const timer = setTimeout(() => {
      settled = true;
      child.kill();
      resolve({
        exitCode: 124,
        timedOut: true,
        durationMs: Date.now() - startedAt,
        stdout,
        stderr
      });
    }, timeoutMs);
    child.stdout?.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr?.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('close', (code) => {
      if (settled) return;
      clearTimeout(timer);
      resolve({
        exitCode: code ?? 1,
        timedOut: false,
        durationMs: Date.now() - startedAt,
        stdout,
        stderr
      });
    });
    child.on('error', (error) => {
      if (settled) return;
      clearTimeout(timer);
      resolve({
        exitCode: 1,
        timedOut: false,
        durationMs: Date.now() - startedAt,
        stdout,
        stderr: `${stderr}${error instanceof Error ? error.stack : String(error)}\n`
      });
    });
  });
}

export async function buildRuntimeEnv({ matrixDir }) {
  const env = { ...process.env };
  if (process.platform !== 'win32') return env;
  const shimDir = path.join(matrixDir, '.runner-bin');
  await mkdir(shimDir, { recursive: true });
  await writeFile(
    path.join(shimDir, 'which.cmd'),
    '@echo off\r\nwhere.exe %*\r\n',
    'utf8'
  );
  const whereExe = path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'where.exe');
  await copyFile(whereExe, path.join(shimDir, 'which.exe')).catch(() => {});
  const currentPath = env.Path ?? env.PATH ?? '';
  env.Path = `${shimDir}${path.delimiter}${currentPath}`;
  env.PATH = env.Path;
  return env;
}

function buildAiTesterCommand(scenarioPath) {
  if (process.platform !== 'win32') {
    return {
      command: 'ai-tester',
      args: ['run', '--file', scenarioPath, '--quiet']
    };
  }
  return {
    command: 'powershell.exe',
    args: [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      `ai-tester run --file ${quotePowerShellArg(scenarioPath)} --quiet`
    ]
  };
}

function quotePowerShellArg(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function renderRunLog({ item, result }) {
  return [
    `scenario: ${item.case.id}`,
    `skill: ${item.case.skill}`,
    `profile_id: ${item.case.profile_id}`,
    `tool_id: ${item.case.tool_id}`,
    `scenario_file: ${item.scenarioPath}`,
    `exit_code: ${result.exitCode}`,
    `timed_out: ${result.timedOut}`,
    `duration_ms: ${result.durationMs}`,
    '',
    '--- stdout ---',
    result.stdout ?? '',
    '',
    '--- stderr ---',
    result.stderr ?? ''
  ].join('\n');
}

function renderSummary(body) {
  return [
    `Attempted: ${body.attempted}`,
    `Succeeded: ${body.succeeded}`,
    `Failed: ${body.failed}`,
    `Executed rows now: ${body.executed_rows}`,
    `NOT_RUN rows now: ${body.not_run_rows}`
  ].join('\n');
}

function safeFileName(value) {
  return String(value).replace(/[^A-Za-z0-9_.-]+/g, '_');
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function parseArgs(args) {
  const parsed = {
    matrixDir: null,
    runsDir: null,
    skills: [],
    profiles: [],
    maxRuns: null,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    deadlineMs: null,
    logDir: null,
    reportCopy: null,
    stopOnFail: false,
    dryRun: false,
    json: false,
    help: false
  };
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (token === '--help' || token === '-h') parsed.help = true;
    else if (token === '--matrix-dir') parsed.matrixDir = args[++index];
    else if (token === '--runs-dir') parsed.runsDir = args[++index];
    else if (token === '--skill') parsed.skills.push(args[++index]);
    else if (token === '--profile') parsed.profiles.push(args[++index]);
    else if (token === '--max-runs') parsed.maxRuns = Number(args[++index]);
    else if (token === '--timeout-ms') parsed.timeoutMs = Number(args[++index]);
    else if (token === '--deadline-minutes') parsed.deadlineMs = Number(args[++index]) * 60000;
    else if (token === '--log-dir') parsed.logDir = args[++index];
    else if (token === '--report-copy') parsed.reportCopy = args[++index];
    else if (token === '--no-report-copy') parsed.reportCopy = false;
    else if (token === '--stop-on-fail') parsed.stopOnFail = true;
    else if (token === '--dry-run') parsed.dryRun = true;
    else if (token === '--json') parsed.json = true;
    else throw new Error(`Unknown argument: ${token}`);
  }
  if (!parsed.help && !parsed.matrixDir) throw new Error('Missing required --matrix-dir <dir>.');
  return parsed;
}

function getCliUsage() {
  return [
    'Usage: node scripts/memory-tool-ai-tester-run-missing.mjs --matrix-dir <dir> [options]',
    '',
    'Options:',
    '  --runs-dir <dir>          ai-tester runs directory.',
    '  --skill <name>            Limit to a skill. Repeatable.',
    '  --profile <id>            Limit to a matrix profile. Repeatable.',
    '  --max-runs <n>            Run at most n missing scenarios.',
    '  --deadline-minutes <n>    Stop starting new scenarios after n minutes.',
    '  --timeout-ms <n>          Per-scenario timeout. Default: 900000.',
    '  --log-dir <dir>           Store per-scenario ai-tester logs.',
    '  --report-copy <path>      Copy generated Markdown report to path.',
    '  --no-report-copy          Do not copy report to docs.',
    '  --stop-on-fail            Stop after first non-zero ai-tester exit.',
    '  --dry-run                 Print selected missing scenarios without running.',
    '  --json                    Print JSON summary.',
    '  -h, --help                Show help.'
  ].join('\n');
}

function emit(body, exitCode, options = {}) {
  options.stdout?.push?.(`${JSON.stringify(body, null, 2)}\n`);
  if (!options.stdout) console.log(JSON.stringify(body, null, 2));
  if (options.exit !== false && exitCode !== 0) process.exit(exitCode);
  return { exitCode, body };
}

function emitText(text, exitCode, options = {}) {
  options.stdout?.push?.(`${text}\n`);
  if (!options.stdout) console.log(text);
  if (options.exit !== false && exitCode !== 0) process.exit(exitCode);
  return { exitCode, body: text };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMemoryToolAiTesterMissing(process.argv.slice(2)).catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
