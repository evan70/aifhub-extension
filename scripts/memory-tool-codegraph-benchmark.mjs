#!/usr/bin/env node
// memory-tool-codegraph-benchmark.mjs - resumable rg vs CodeGraph benchmark on sanitized matrix fixtures
import { execFile } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { discoverMatrixProfiles } from './memory-tool-ai-tester-matrix.mjs';

const execFileAsync = promisify(execFile);
const DEFAULT_TASK = 'architecture_or_impact_discovery';
const DEFAULT_PATTERN = '(class|function|interface|type|struct|func|Route|router|controller|service|handler|module|OpenSpec|workflow|TODO)';

export async function runCodeGraphBenchmark(args = [], options = {}) {
  const parsed = parseArgs(args);
  if (parsed.help) return emitText(getUsage(), 0, options);

  const cwd = path.resolve(options.cwd ?? process.cwd());
  const matrixDir = path.resolve(cwd, parsed.matrixDir);
  const outDir = path.resolve(cwd, parsed.out ?? path.join(matrixDir, '..', 'codegraph-benchmark'));
  await mkdir(outDir, { recursive: true });

  const matrix = JSON.parse(await readFile(path.join(matrixDir, 'matrix-summary.json'), 'utf8'));
  const discovered = await discoverMatrixProfiles(parsed.roots, {
    excludeRoots: parsed.excludeRoots
  });
  const sourceById = new Map(discovered.map((profile) => [profile.id, profile]));
  const resultsPath = path.join(outDir, 'results.jsonl');
  const seen = parsed.resume ? await readCompletedProfileIds(resultsPath) : new Set();
  const selectedProfiles = matrix.profiles.filter((profile) => {
    if (parsed.profileIds.length > 0 && !parsed.profileIds.includes(profile.id)) return false;
    if (seen.has(profile.id)) return false;
    return true;
  });

  const existingRows = parsed.resume ? await readJsonl(resultsPath) : [];
  if (!parsed.resume) await writeFile(resultsPath, '', 'utf8');

  const rows = [...existingRows];
  for (const profile of selectedProfiles) {
    const row = await benchmarkProfile({
      profile,
      source: sourceById.get(profile.id),
      fixture: path.join(matrixDir, 'fixtures', profile.id),
      task: parsed.task,
      pattern: parsed.pattern,
      timeoutMs: parsed.timeoutMs,
      maxBufferBytes: parsed.maxBufferBytes
    });
    rows.push(row);
    await appendJsonl(resultsPath, row);
    await writeSummaries({ outDir, matrix, rows, includeSourcePaths: parsed.includeSourcePaths });
    options.stdout?.push?.(`${row.profile_id} ${row.comparison.decision} rgTok=${row.comparison.rg_search_tokens} cgTok=${row.comparison.codegraph_context_tokens} cgMs=${row.comparison.codegraph_total_latency_ms}\n`);
  }

  const summary = await writeSummaries({ outDir, matrix, rows, includeSourcePaths: parsed.includeSourcePaths });
  return emit(summary, 0, options);
}

async function benchmarkProfile({ profile, source, fixture, task, pattern, timeoutMs, maxBufferBytes }) {
  const codegraphDir = path.join(fixture, '.codegraph');
  if (await pathExists(codegraphDir)) await rm(codegraphDir, { recursive: true, force: true });

  const rgFiles = await runCommand('rg', ['--files'], { cwd: fixture, timeoutMs, maxBufferBytes });
  const rgSearch = await runCommand('rg', [
    '-l',
    '--max-filesize',
    '512K',
    '--glob',
    '!*.lock',
    '--glob',
    '!*.min.js',
    pattern,
    '.'
  ], { cwd: fixture, timeoutMs, maxBufferBytes });
  const fileCount = rgFiles.ok ? rgFiles.stdout.split(/\r?\n/).filter(Boolean).length : null;

  const init = await runCommand('codegraph', ['init', fixture], { timeoutMs, maxBufferBytes });
  const index = init.ok
    ? await runCommand('codegraph', ['index', '--quiet', fixture], { timeoutMs: timeoutMs * 2, maxBufferBytes })
    : failedStep('init failed');
  const status = index.ok
    ? await runCommand('codegraph', ['status', fixture], { timeoutMs, maxBufferBytes })
    : failedStep('index failed');
  const context = index.ok
    ? await runCommand('codegraph', [
      'context',
      '--path',
      fixture,
      '--format',
      'markdown',
      '--max-nodes',
      '50',
      '--max-code',
      '10',
      task
    ], { timeoutMs, maxBufferBytes })
    : failedStep('index failed');
  const transientDbBytes = await pathExists(codegraphDir) ? await dirSizeBytes(codegraphDir) : 0;
  const purge = await runCommand('codegraph', ['uninit', '--force', fixture], { timeoutMs, maxBufferBytes });
  const leftover = await pathExists(codegraphDir);

  const rg = {
    files: summarizeRun(rgFiles),
    search: summarizeRun(rgSearch),
    file_count: fileCount
  };
  const codegraph = {
    init: summarizeRun(init),
    index: summarizeRun(index),
    status: summarizeRun(status),
    context: summarizeRun(context),
    transient_db_bytes: transientDbBytes,
    purge: summarizeRun(purge),
    purge_passed: purge.ok && !leftover,
    lifecycle_passed: init.ok && index.ok && status.ok && context.ok && purge.ok && !leftover
  };
  const comparison = buildComparison(profile, rg, codegraph);

  return {
    profile_id: profile.id,
    project_name: source ? path.basename(source.sourceRoot) : null,
    source_root: source ? toPosix(source.sourceRoot) : null,
    dimensions: {
      project_shape: profile.project_shape,
      languages: profile.languages,
      volume: profile.volume,
      complexity: profile.complexity,
      repo_shape: profile.repo_shape,
      artifact_mode: profile.artifact_mode
    },
    project_label: profile.project_label ?? buildProjectLabel(profile),
    tags: Array.isArray(profile.tags) && profile.tags.length > 0 ? profile.tags : buildProjectTags(profile),
    rg,
    codegraph,
    comparison
  };
}

function buildComparison(profile, rg, codegraph) {
  const rgTokens = rg.search.output_token_estimate;
  const cgTokens = codegraph.context.output_token_estimate;
  const cgLatency = codegraph.init.elapsed_ms + codegraph.index.elapsed_ms + codegraph.context.elapsed_ms + codegraph.purge.elapsed_ms;
  const rgLatency = rg.files.elapsed_ms + rg.search.elapsed_ms;
  const ratio = rgTokens > 0 ? Number((cgTokens / rgTokens).toFixed(3)) : null;
  return {
    rg_search_tokens: rgTokens,
    codegraph_context_tokens: cgTokens,
    codegraph_context_vs_rg_ratio: ratio,
    codegraph_total_latency_ms: cgLatency,
    rg_total_latency_ms: rgLatency,
    decision: decide(profile, rg, codegraph, { ratio: ratio ?? Infinity, cgLatency })
  };
}

function decide(profile, rg, codegraph, metrics) {
  if (!codegraph.lifecycle_passed || !codegraph.purge_passed) return 'forbid_or_degraded';
  if (profile.volume === 'mini') return 'avoid_mini_overhead';
  if (codegraph.context.output_token_estimate <= 64) return 'avoid_no_useful_context';
  if (profile.repo_shape === 'multirepo' || profile.repo_shape === 'monorepo' || profile.volume === 'large') {
    if (metrics.cgLatency > 180000) return 'conditional_broad_graph_slow';
    return 'conditional_broad_graph';
  }
  if (profile.project_shape === 'large_framework_app' && rg.search.output_token_estimate > 1500 && metrics.ratio <= 1.25) {
    return 'conditional_noisy_rg';
  }
  if (profile.project_shape === 'go_service' && profile.volume !== 'mini') return 'conditional_go_service_broad_only';
  if (metrics.ratio > 1.25) return 'avoid_token_overhead_single_repo';
  return 'avoid_rg_sufficient';
}

async function runCommand(command, args, options = {}) {
  const started = performance.now();
  const invocation = resolveInvocation(command, args);
  try {
    const result = await execFileAsync(invocation.command, invocation.args, {
      cwd: options.cwd,
      timeout: options.timeoutMs,
      maxBuffer: options.maxBufferBytes,
      windowsHide: true
    });
    return {
      ok: true,
      elapsed_ms: elapsedMs(started),
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? '',
      exit_code: 0
    };
  } catch (error) {
    return {
      ok: false,
      elapsed_ms: elapsedMs(started),
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? error.message,
      exit_code: Number.isInteger(error.code) ? error.code : 1,
      timed_out: Boolean(error.killed) || error.code === 'ETIMEDOUT' || /timed out|ETIMEDOUT|SIGTERM/i.test(String(error.message)),
      error: firstLine(error.message)
    };
  }
}

function resolveInvocation(command, args) {
  if (process.platform === 'win32' && command === 'codegraph') {
    return {
      command: process.env.ComSpec ?? 'cmd.exe',
      args: ['/d', '/s', '/c', `${command} ${quoteCmdArgs(args)}`]
    };
  }
  return { command, args };
}

function quoteCmdArgs(args) {
  return args.map(quoteCmdArg).join(' ');
}

function quoteCmdArg(arg) {
  const value = String(arg);
  if (value !== '' && !/\s/.test(value)) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

function failedStep(reason) {
  return {
    ok: false,
    elapsed_ms: 0,
    stdout: '',
    stderr: reason,
    exit_code: 1,
    error: reason
  };
}

function summarizeRun(result) {
  const text = `${result.stdout ?? ''}${result.stderr ? `\n${result.stderr}` : ''}`;
  const first = firstLine(text) || firstLine(result.error);
  return {
    ok: result.ok,
    elapsed_ms: result.elapsed_ms,
    exit_code: result.exit_code,
    timed_out: Boolean(result.timed_out),
    output_bytes: Buffer.byteLength(text, 'utf8'),
    output_token_estimate: estimateTokens(text),
    first_line: first
  };
}

async function writeSummaries({ outDir, matrix, rows, includeSourcePaths = false }) {
  const aggregate = buildAggregate(rows);
  const publicRows = rows.map((row) => ({
    profile_id: row.profile_id,
    ...(includeSourcePaths ? { project_name: row.project_name, source_root: row.source_root } : {}),
    project_label: row.project_label,
    tags: row.tags,
    dimensions: row.dimensions,
    file_count: row.rg.file_count,
    rg_search_tokens: row.comparison.rg_search_tokens,
    codegraph_context_tokens: row.comparison.codegraph_context_tokens,
    ratio: row.comparison.codegraph_context_vs_rg_ratio,
    rg_ms: row.comparison.rg_total_latency_ms,
    codegraph_ms: row.comparison.codegraph_total_latency_ms,
    lifecycle_passed: row.codegraph.lifecycle_passed,
    purge_passed: row.codegraph.purge_passed,
    decision: row.comparison.decision
  }));
  const publicTests = rows.flatMap((row) => buildPublicTestRows(row, includeSourcePaths));
  const summary = {
    schema: 'aifhub.memory_tools.codegraph_forced_benchmark.v1',
    generated_at: new Date().toISOString(),
    matrix_profile_count: matrix.profiles.length,
    completed_profiles: rows.length,
    completed_test_count: publicTests.length,
    benchmark: 'rg --files + rg architecture-pattern search vs codegraph init/index/context/uninit on sanitized copies',
    aggregate,
    tests_by_tool: countBy(publicTests, (row) => row.tool_id),
    tests: publicTests,
    results: publicRows
  };
  await writeFile(path.join(outDir, 'public-summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  return summary;
}

function buildPublicTestRows(row, includeSourcePaths = false) {
  const base = {
    profile_id: row.profile_id,
    ...(includeSourcePaths ? { project_name: row.project_name, source_root: row.source_root } : {}),
    project_label: row.project_label,
    tags: row.tags,
    dimensions: row.dimensions,
    file_count: row.rg.file_count
  };
  return [
    {
      ...base,
      test_id: `${row.profile_id}__rg_baseline`,
      run: 'rg baseline',
      tool_id: 'rg',
      status: row.rg.files.ok && row.rg.search.ok ? 'PASS' : 'FAIL',
      duration_ms: row.comparison.rg_total_latency_ms,
      output_tokens: row.comparison.rg_search_tokens,
      command_count: 2,
      decision: 'baseline'
    },
    {
      ...base,
      test_id: `${row.profile_id}__codegraph_tool_run`,
      run: 'codegraph tool_run',
      tool_id: 'codegraph',
      status: row.codegraph.lifecycle_passed && row.codegraph.purge_passed ? 'PASS' : 'FAIL',
      duration_ms: row.comparison.codegraph_total_latency_ms,
      output_tokens: row.comparison.codegraph_context_tokens,
      command_count: 5,
      decision: row.comparison.decision
    }
  ];
}

function buildAggregate(rows) {
  const aggregate = {
    total_profiles: rows.length,
    lifecycle_passed: rows.filter((row) => row.codegraph.lifecycle_passed).length,
    purge_passed: rows.filter((row) => row.codegraph.purge_passed).length,
    decisions: countBy(rows, (row) => row.comparison.decision),
    by_shape: groupMetrics(rows, (row) => row.dimensions.project_shape),
    by_volume: groupMetrics(rows, (row) => row.dimensions.volume),
    by_repo_shape: groupMetrics(rows, (row) => row.dimensions.repo_shape)
  };
  return aggregate;
}

function groupMetrics(rows, keyFn) {
  const groups = {};
  for (const row of rows) {
    const key = keyFn(row) ?? 'unknown';
    groups[key] ??= {
      count: 0,
      avg_ratio: 0,
      avg_cg_latency_ms: 0,
      decisions: {}
    };
    const group = groups[key];
    group.count += 1;
    group.avg_ratio += row.comparison.codegraph_context_vs_rg_ratio ?? 0;
    group.avg_cg_latency_ms += row.comparison.codegraph_total_latency_ms;
    group.decisions[row.comparison.decision] = (group.decisions[row.comparison.decision] ?? 0) + 1;
  }
  for (const group of Object.values(groups)) {
    group.avg_ratio = group.count > 0 ? Number((group.avg_ratio / group.count).toFixed(3)) : 0;
    group.avg_cg_latency_ms = group.count > 0 ? Math.round(group.avg_cg_latency_ms / group.count) : 0;
  }
  return groups;
}

function countBy(rows, keyFn) {
  return rows.reduce((acc, row) => {
    const key = keyFn(row) ?? 'unknown';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

async function appendJsonl(filePath, row) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const current = await readFile(filePath, 'utf8').catch(() => '');
  await writeFile(filePath, `${current}${JSON.stringify(row)}\n`, 'utf8');
}

async function readCompletedProfileIds(filePath) {
  const rows = await readJsonl(filePath);
  return new Set(rows.map((row) => row.profile_id).filter(Boolean));
}

async function readJsonl(filePath) {
  if (!await pathExists(filePath)) return [];
  const rows = [];
  const rl = createInterface({
    input: createReadStream(filePath),
    crlfDelay: Infinity
  });
  for await (const line of rl) {
    if (!line.trim()) continue;
    rows.push(JSON.parse(line));
  }
  return rows;
}

async function dirSizeBytes(dir) {
  let total = 0;
  async function walk(current) {
    const entries = await readdir(current, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile()) {
        const stats = await stat(full).catch(() => null);
        if (stats) total += stats.size;
      }
    }
  }
  await walk(dir);
  return total;
}

function parseArgs(args) {
  const parsed = {
    roots: ['C:/projects'],
    excludeRoots: [],
    matrixDir: '.ai-factory/state/ai-tester-matrix-for-memory-tool-metadata/all-projects-codegraph-explore-architecture',
    out: null,
    profileIds: [],
    resume: false,
    includeSourcePaths: false,
    task: DEFAULT_TASK,
    pattern: DEFAULT_PATTERN,
    timeoutMs: 60000,
    maxBufferBytes: 1024 * 1024,
    help: false
  };
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (token === '--help' || token === '-h') parsed.help = true;
    else if (token === '--roots') parsed.roots.push(args[++index]);
    else if (token === '--exclude-root') parsed.excludeRoots.push(args[++index]);
    else if (token === '--matrix-dir') parsed.matrixDir = args[++index];
    else if (token === '--out') parsed.out = args[++index];
    else if (token === '--profile') parsed.profileIds.push(args[++index]);
    else if (token === '--resume') parsed.resume = true;
    else if (token === '--include-source-paths') parsed.includeSourcePaths = true;
    else if (token === '--task') parsed.task = args[++index];
    else if (token === '--pattern') parsed.pattern = args[++index];
    else if (token === '--timeout-ms') parsed.timeoutMs = Number(args[++index]);
    else if (token === '--max-buffer-bytes') parsed.maxBufferBytes = Number(args[++index]);
    else throw new Error(`Unknown argument: ${token}`);
  }
  parsed.roots = [...new Set(parsed.roots.map((root) => path.resolve(root)))];
  return parsed;
}

function getUsage() {
  return [
    'Usage: node scripts/memory-tool-codegraph-benchmark.mjs --matrix-dir <dir> --out <dir> --resume',
    '',
    'Runs a resumable rg vs CodeGraph benchmark on sanitized fixtures from memory-tool-ai-tester-matrix.',
    'Use --exclude-root <dir> to keep a project subtree out of source-root lookup and regenerated matrices.'
  ].join(os.EOL);
}

function emit(body, exitCode, options) {
  if (options.exit === false) return { exitCode, body };
  console.log(JSON.stringify(body, null, 2));
  return { exitCode, body };
}

function emitText(body, exitCode, options) {
  if (options.exit === false) return { exitCode, body };
  console.log(body);
  return { exitCode, body };
}

function estimateTokens(text) {
  return Math.ceil(Buffer.byteLength(String(text ?? ''), 'utf8') / 4);
}

function elapsedMs(started) {
  return Math.round(performance.now() - started);
}

function firstLine(text) {
  return String(text ?? '').split(/\r?\n/).find(Boolean)?.slice(0, 180) ?? '';
}

function toPosix(value) {
  return String(value).replace(/\\/g, '/');
}

function buildProjectLabel(profile = {}) {
  const languages = Array.isArray(profile.languages) ? profile.languages : [];
  const languageLabel = languages.length > 0 ? languages.join('+') : 'no-primary-language';
  return [
    languageLabel,
    profile.volume ?? 'standard',
    profile.complexity ?? 'framework',
    profile.repo_shape ?? 'single_repo',
    profile.artifact_mode ?? 'none',
    profile.project_shape ?? 'large_framework_app'
  ].join(' | ');
}

function buildProjectTags(profile = {}) {
  const languages = Array.isArray(profile.languages) ? profile.languages : [];
  return [
    ...(languages.length > 0 ? languages : ['no-primary-language']),
    profile.volume ?? 'standard',
    profile.complexity ?? 'framework',
    profile.repo_shape ?? 'single_repo',
    profile.artifact_mode ?? 'none',
    profile.project_shape ?? 'large_framework_app'
  ];
}

async function pathExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

function isDirectRun() {
  return process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (isDirectRun()) {
  const result = await runCodeGraphBenchmark(process.argv.slice(2));
  process.exit(result.exitCode);
}
