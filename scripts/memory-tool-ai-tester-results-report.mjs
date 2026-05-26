#!/usr/bin/env node
// memory-tool-ai-tester-results-report.mjs - render real ai-tester token traces by skill/tool matrix
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

export const AI_TESTER_RESULTS_REPORT_SCHEMA = 'aifhub.memory_tools.ai_tester_results_report.v1';

const DEFAULT_RUNS_DIR = path.join(
  os.homedir(),
  'AppData',
  'Local',
  'nvm',
  'v24.8.0',
  'node_modules',
  '@cutcode',
  'ai-tester',
  'runs'
);

export async function runMemoryToolAiTesterResultsReport(args = [], options = {}) {
  const parsed = parseArgs(args);
  if (parsed.help) {
    return emitText(getCliUsage(), 0, options);
  }

  const cwd = path.resolve(options.cwd ?? process.cwd());
  const matrixDir = path.resolve(cwd, parsed.matrixDir);
  const matrixPath = path.join(matrixDir, 'matrix-summary.json');
  const runsDir = path.resolve(cwd, parsed.runsDir ?? DEFAULT_RUNS_DIR);
  const outDir = path.resolve(cwd, parsed.out ?? matrixDir);
  const matrixSummary = JSON.parse(await readFile(matrixPath, 'utf8'));
  const traceIndex = await collectAiTesterTraceIndex({ runsDir });
  const report = buildAiTesterResultsReport({
    matrixSummary,
    traceIndex,
    runsDir,
    generatedAt: new Date().toISOString()
  });

  await mkdir(outDir, { recursive: true });
  const jsonPath = path.join(outDir, parsed.jsonFile ?? 'ai-tester-token-matrices.json');
  const markdownPath = path.join(outDir, parsed.markdownFile ?? 'ai-tester-token-matrices.md');
  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await writeFile(markdownPath, renderAiTesterResultsMarkdown(report), 'utf8');

  if (parsed.copyMarkdown) {
    const copyPath = path.resolve(cwd, parsed.copyMarkdown);
    await mkdir(path.dirname(copyPath), { recursive: true });
    await writeFile(copyPath, renderAiTesterResultsMarkdown(report), 'utf8');
  }

  if (parsed.json) {
    return emit(report, 0, options);
  }

  return emitText(
    [
      `AI tester token matrix written: ${markdownPath}`,
      `JSON written: ${jsonPath}`,
      `Executed rows: ${report.summary.executed_rows}/${report.summary.total_rows}`,
      `Missing rows: ${report.summary.not_run_rows}`
    ].join('\n'),
    0,
    options
  );
}

export async function collectAiTesterTraceIndex({ runsDir = DEFAULT_RUNS_DIR } = {}) {
  const recordsByScenario = new Map();
  let filesRead = 0;
  let filesSkipped = 0;

  let entries = [];
  try {
    entries = await readdir(runsDir, { withFileTypes: true });
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return {
        runs_dir: runsDir,
        files_read: 0,
        files_skipped: 0,
        latest_by_scenario: {}
      };
    }
    throw error;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const scenarioDir = path.join(runsDir, entry.name);
    let files = [];
    try {
      files = (await readdir(scenarioDir)).filter((fileName) => fileName.endsWith('.json'));
    } catch {
      continue;
    }

    for (const fileName of files) {
      const filePath = path.join(scenarioDir, fileName);
      try {
        const record = JSON.parse(await readFile(filePath, 'utf8'));
        const scenarioName = getScenarioName(record, entry.name, fileName);
        if (!scenarioName) {
          filesSkipped += 1;
          continue;
        }
        const normalized = traceRecordToResult(record, filePath);
        const existing = recordsByScenario.get(scenarioName);
        if (!existing || compareTraceFreshness(normalized, existing) > 0) {
          recordsByScenario.set(scenarioName, normalized);
        }
        filesRead += 1;
      } catch {
        filesSkipped += 1;
      }
    }
  }

  return {
    runs_dir: runsDir,
    files_read: filesRead,
    files_skipped: filesSkipped,
    latest_by_scenario: Object.fromEntries(recordsByScenario)
  };
}

export function buildAiTesterResultsReport({
  matrixSummary,
  traceIndex,
  runsDir = null,
  generatedAt = new Date().toISOString()
} = {}) {
  const profiles = new Map(asArray(matrixSummary?.profiles).map((profile) => [profile.id, profile]));
  const latestByScenario = traceIndex?.latest_by_scenario ?? {};
  const rows = asArray(matrixSummary?.cases).map((matrixCase) => {
    const profile = profiles.get(matrixCase.profile_id) ?? {};
    const trace = latestByScenario[matrixCase.id] ?? null;
    const base = {
      skill: matrixCase.skill,
      project: matrixCase.profile_id,
      label: profile.project_label ?? '',
      tags: asArray(profile.tags),
      run: formatRunName(matrixCase),
      tool_id: matrixCase.tool_id,
      optional_tool_id: matrixCase.optional_tool_id ?? null,
      status: 'NOT_RUN',
      duration_seconds: null,
      duration: '',
      tool_calls: null,
      total_tokens: null,
      input_tokens: null,
      output_tokens: null,
      input_output_tokens: null,
      cache_creation_tokens: null,
      cache_read_tokens: null,
      trace_file: null,
      finished_at: null
    };
    if (!trace) return base;
    return {
      ...base,
      status: trace.status,
      duration_seconds: trace.duration_seconds,
      duration: formatDuration(trace.duration_ms),
      tool_calls: trace.tool_calls,
      total_tokens: trace.total_tokens,
      input_tokens: trace.input_tokens,
      output_tokens: trace.output_tokens,
      input_output_tokens: trace.input_tokens + trace.output_tokens,
      cache_creation_tokens: trace.cache_creation_tokens,
      cache_read_tokens: trace.cache_read_tokens,
      trace_file: trace.file_path,
      finished_at: trace.finished_at
    };
  });

  return {
    schema: AI_TESTER_RESULTS_REPORT_SCHEMA,
    generated_at: generatedAt,
    matrix_schema: matrixSummary?.schema ?? null,
    matrix_generated_at: matrixSummary?.generated_at ?? null,
    runs_dir: runsDir ?? traceIndex?.runs_dir ?? null,
    trace_files_read: traceIndex?.files_read ?? 0,
    trace_files_skipped: traceIndex?.files_skipped ?? 0,
    summary: summarizeRows(rows),
    paired_comparison: buildPairedComparison(rows),
    skills: buildSkillSummaries(rows),
    rows
  };
}

export function renderAiTesterResultsMarkdown(report) {
  const lines = [
    '# AI Tester Token Matrices',
    '',
    'Источник этой таблицы - реальные `ai-tester` trace JSON из `runs/`. `NOT_RUN` означает, что сценарий есть в матрице, но model run для него еще не выполнен.',
    '',
    '| Metric | Value |',
    '|---|---:|',
    `| Total rows | ${formatNumber(report.summary.total_rows)} |`,
    `| Executed rows | ${formatNumber(report.summary.executed_rows)} |`,
    `| PASS rows | ${formatNumber(report.summary.pass_rows)} |`,
    `| FAIL rows | ${formatNumber(report.summary.fail_rows)} |`,
    `| NOT_RUN rows | ${formatNumber(report.summary.not_run_rows)} |`,
    `| Trace files read | ${formatNumber(report.trace_files_read)} |`,
    ''
  ];

  if (report.paired_comparison?.pair_count > 0) {
    const comparison = report.paired_comparison;
    lines.push('## Paired Rg Vs CodeGraph', '');
    lines.push('| Metric | rg | CodeGraph | CodeGraph delta |');
    lines.push('|---|---:|---:|---:|');
    lines.push(`| Paired rows | ${formatNumber(comparison.pair_count)} | ${formatNumber(comparison.pair_count)} |  |`);
    lines.push(`| PASS rows | ${formatNumber(comparison.rg.pass_rows)} | ${formatNumber(comparison.codegraph.pass_rows)} | ${formatPercentDelta(comparison.deltas.pass_rows_percent)} |`);
    lines.push(`| FAIL rows | ${formatNumber(comparison.rg.fail_rows)} | ${formatNumber(comparison.codegraph.fail_rows)} | ${formatPercentDelta(comparison.deltas.fail_rows_percent)} |`);
    lines.push(`| Duration seconds | ${formatNumberRounded(comparison.rg.duration_seconds)} | ${formatNumberRounded(comparison.codegraph.duration_seconds)} | ${formatPercentDelta(comparison.deltas.duration_percent)} |`);
    lines.push(`| Tool calls | ${formatNumber(comparison.rg.tool_calls)} | ${formatNumber(comparison.codegraph.tool_calls)} | ${formatPercentDelta(comparison.deltas.tool_calls_percent)} |`);
    lines.push(`| Total tokens | ${formatNumber(comparison.rg.total_tokens)} | ${formatNumber(comparison.codegraph.total_tokens)} | ${formatPercentDelta(comparison.deltas.total_tokens_percent)} |`);
    lines.push(`| Input tokens | ${formatNumber(comparison.rg.input_tokens)} | ${formatNumber(comparison.codegraph.input_tokens)} | ${formatPercentDelta(comparison.deltas.input_tokens_percent)} |`);
    lines.push(`| Output tokens | ${formatNumber(comparison.rg.output_tokens)} | ${formatNumber(comparison.codegraph.output_tokens)} | ${formatPercentDelta(comparison.deltas.output_tokens_percent)} |`);
    lines.push(`| Input+output tokens | ${formatNumber(comparison.rg.input_output_tokens)} | ${formatNumber(comparison.codegraph.input_output_tokens)} | ${formatPercentDelta(comparison.deltas.input_output_tokens_percent)} |`);
    lines.push('');
    lines.push('| Better case count | Count | Percent of pairs |');
    lines.push('|---|---:|---:|');
    lines.push(`| CodeGraph lower total tokens | ${formatNumber(comparison.better_counts.codegraph_lower_total_tokens)} | ${formatPercent(comparison.better_counts.codegraph_lower_total_tokens_percent)} |`);
    lines.push(`| CodeGraph lower input+output tokens | ${formatNumber(comparison.better_counts.codegraph_lower_input_output_tokens)} | ${formatPercent(comparison.better_counts.codegraph_lower_input_output_tokens_percent)} |`);
    lines.push(`| CodeGraph faster | ${formatNumber(comparison.better_counts.codegraph_faster)} | ${formatPercent(comparison.better_counts.codegraph_faster_percent)} |`);
    lines.push(`| CodeGraph fewer tool calls | ${formatNumber(comparison.better_counts.codegraph_fewer_tool_calls)} | ${formatPercent(comparison.better_counts.codegraph_fewer_tool_calls_percent)} |`);
    lines.push('');
  }

  for (const skill of report.skills) {
    lines.push(`## ${skill.skill}`, '');
    lines.push('| Metric | Value |');
    lines.push('|---|---:|');
    lines.push(`| Matrix rows | ${formatNumber(skill.total_rows)} |`);
    lines.push(`| Executed rows | ${formatNumber(skill.executed_rows)} |`);
    lines.push(`| PASS rows | ${formatNumber(skill.pass_rows)} |`);
    lines.push(`| NOT_RUN rows | ${formatNumber(skill.not_run_rows)} |`);
    lines.push(`| rg executed | ${formatNumber(skill.rg_executed_rows)} |`);
    lines.push(`| CodeGraph executed | ${formatNumber(skill.codegraph_executed_rows)} |`);
    lines.push('');
    lines.push('| project | labels | run | status | duration | tool calls | total tokens | input tokens | output tokens | input+output tokens | cache-read tokens |');
    lines.push('|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|');
    for (const row of report.rows.filter((item) => item.skill === skill.skill)) {
      lines.push([
        md(row.project),
        md(row.label),
        md(row.run),
        md(row.status),
        md(row.duration),
        mdNum(row.tool_calls),
        mdNum(row.total_tokens),
        mdNum(row.input_tokens),
        mdNum(row.output_tokens),
        mdNum(row.input_output_tokens),
        mdNum(row.cache_read_tokens)
      ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

function buildPairedComparison(rows) {
  const byPair = new Map();
  for (const row of rows.filter((item) => item.status !== 'NOT_RUN')) {
    const key = `${row.skill}::${row.project}::${row.optional_tool_id ?? 'unknown'}`;
    if (!byPair.has(key)) byPair.set(key, {});
    const pair = byPair.get(key);
    if (row.tool_id === 'rg') pair.rg = row;
    if (row.tool_id === 'codegraph') pair.codegraph = row;
  }

  const pairs = [...byPair.values()].filter((pair) => pair.rg && pair.codegraph);
  const rg = summarizeMetricRows(pairs.map((pair) => pair.rg));
  const codegraph = summarizeMetricRows(pairs.map((pair) => pair.codegraph));
  const betterCounts = {
    codegraph_lower_total_tokens: pairs.filter((pair) => pair.codegraph.total_tokens < pair.rg.total_tokens).length,
    codegraph_lower_input_output_tokens: pairs.filter((pair) => pair.codegraph.input_output_tokens < pair.rg.input_output_tokens).length,
    codegraph_faster: pairs.filter((pair) => pair.codegraph.duration_seconds < pair.rg.duration_seconds).length,
    codegraph_fewer_tool_calls: pairs.filter((pair) => pair.codegraph.tool_calls < pair.rg.tool_calls).length
  };

  return {
    pair_count: pairs.length,
    rg,
    codegraph,
    ratios: {
      duration: ratio(codegraph.duration_seconds, rg.duration_seconds),
      tool_calls: ratio(codegraph.tool_calls, rg.tool_calls),
      total_tokens: ratio(codegraph.total_tokens, rg.total_tokens),
      input_tokens: ratio(codegraph.input_tokens, rg.input_tokens),
      output_tokens: ratio(codegraph.output_tokens, rg.output_tokens),
      input_output_tokens: ratio(codegraph.input_output_tokens, rg.input_output_tokens)
    },
    deltas: {
      duration_percent: percentDelta(codegraph.duration_seconds, rg.duration_seconds),
      tool_calls_percent: percentDelta(codegraph.tool_calls, rg.tool_calls),
      total_tokens_percent: percentDelta(codegraph.total_tokens, rg.total_tokens),
      input_tokens_percent: percentDelta(codegraph.input_tokens, rg.input_tokens),
      output_tokens_percent: percentDelta(codegraph.output_tokens, rg.output_tokens),
      input_output_tokens_percent: percentDelta(codegraph.input_output_tokens, rg.input_output_tokens),
      pass_rows_percent: percentDelta(codegraph.pass_rows, rg.pass_rows),
      fail_rows_percent: percentDelta(codegraph.fail_rows, rg.fail_rows)
    },
    better_counts: {
      ...betterCounts,
      codegraph_lower_total_tokens_percent: percentOf(betterCounts.codegraph_lower_total_tokens, pairs.length),
      codegraph_lower_input_output_tokens_percent: percentOf(betterCounts.codegraph_lower_input_output_tokens, pairs.length),
      codegraph_faster_percent: percentOf(betterCounts.codegraph_faster, pairs.length),
      codegraph_fewer_tool_calls_percent: percentOf(betterCounts.codegraph_fewer_tool_calls, pairs.length)
    }
  };
}

function summarizeMetricRows(rows) {
  return rows.reduce((summary, row) => ({
    rows: summary.rows + 1,
    pass_rows: summary.pass_rows + (row.status === 'PASS' ? 1 : 0),
    fail_rows: summary.fail_rows + (row.status === 'FAIL' ? 1 : 0),
    duration_seconds: summary.duration_seconds + numeric(row.duration_seconds),
    tool_calls: summary.tool_calls + numeric(row.tool_calls),
    total_tokens: summary.total_tokens + numeric(row.total_tokens),
    input_tokens: summary.input_tokens + numeric(row.input_tokens),
    output_tokens: summary.output_tokens + numeric(row.output_tokens),
    input_output_tokens: summary.input_output_tokens + numeric(row.input_output_tokens),
    cache_read_tokens: summary.cache_read_tokens + numeric(row.cache_read_tokens)
  }), {
    rows: 0,
    pass_rows: 0,
    fail_rows: 0,
    duration_seconds: 0,
    tool_calls: 0,
    total_tokens: 0,
    input_tokens: 0,
    output_tokens: 0,
    input_output_tokens: 0,
    cache_read_tokens: 0
  });
}

function ratio(value, baseline) {
  if (!Number.isFinite(value) || !Number.isFinite(baseline) || baseline === 0) return null;
  return value / baseline;
}

function percentDelta(value, baseline) {
  if (!Number.isFinite(value) || !Number.isFinite(baseline) || baseline === 0) return null;
  return ((value - baseline) / baseline) * 100;
}

function percentOf(value, total) {
  if (!Number.isFinite(value) || !Number.isFinite(total) || total === 0) return null;
  return (value / total) * 100;
}

export function traceRecordToResult(record, filePath) {
  const cost = record.cost ?? {};
  const inputTokens = numeric(cost.inputTokens);
  const outputTokens = numeric(cost.outputTokens);
  const cacheCreationTokens = numeric(cost.cacheCreationTokens);
  const cacheReadTokens = numeric(cost.cacheReadTokens);
  const totalTokens = inputTokens + outputTokens + cacheCreationTokens + cacheReadTokens;
  const durationMs = numeric(record.runner?.durationMs);
  return {
    file_path: filePath,
    finished_at: record.runner?.finishedAt ?? null,
    status: record.scoring?.overallPass === true ? 'PASS' : 'FAIL',
    duration_ms: durationMs,
    duration_seconds: Math.round((durationMs / 1000) * 10) / 10,
    turns_used: numeric(record.runner?.turnsUsed),
    tool_calls: numeric(record.toolCallSummary?.total, countToolCalls(record)),
    total_tokens: totalTokens,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cache_creation_tokens: cacheCreationTokens,
    cache_read_tokens: cacheReadTokens
  };
}

function buildSkillSummaries(rows) {
  const bySkill = new Map();
  for (const row of rows) {
    const skill = row.skill ?? 'unknown';
    if (!bySkill.has(skill)) bySkill.set(skill, []);
    bySkill.get(skill).push(row);
  }
  return [...bySkill.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([skill, skillRows]) => ({
      skill,
      ...summarizeRows(skillRows),
      rg_executed_rows: skillRows.filter((row) => row.tool_id === 'rg' && row.status !== 'NOT_RUN').length,
      codegraph_executed_rows: skillRows.filter((row) => row.tool_id === 'codegraph' && row.status !== 'NOT_RUN').length
    }));
}

function summarizeRows(rows) {
  return {
    total_rows: rows.length,
    executed_rows: rows.filter((row) => row.status !== 'NOT_RUN').length,
    pass_rows: rows.filter((row) => row.status === 'PASS').length,
    fail_rows: rows.filter((row) => row.status === 'FAIL').length,
    not_run_rows: rows.filter((row) => row.status === 'NOT_RUN').length
  };
}

function getScenarioName(record, directoryName, fileName) {
  if (record.scenario?.name) return record.scenario.name;
  if (directoryName.startsWith('inline_')) return directoryName.slice('inline_'.length);
  const timestampPart = fileName.match(/__(\d{4}-\d{2}-\d{2}T)/);
  if (timestampPart) return fileName.slice(0, timestampPart.index).replace(/^inline_/, '');
  return null;
}

function compareTraceFreshness(left, right) {
  const leftTime = Date.parse(left.finished_at ?? '');
  const rightTime = Date.parse(right.finished_at ?? '');
  if (!Number.isNaN(leftTime) && !Number.isNaN(rightTime) && leftTime !== rightTime) {
    return leftTime - rightTime;
  }
  return String(left.file_path).localeCompare(String(right.file_path));
}

function formatRunName(matrixCase) {
  if (matrixCase.tool_id === 'rg') return 'rg baseline';
  return `${matrixCase.tool_id} tool_run`;
}

function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return '';
  return `${(ms / 1000).toFixed(1)}s`;
}

function countToolCalls(record) {
  return asArray(record.turns).reduce((sum, turn) => sum + asArray(turn.toolCalls).length, 0);
}

function md(value) {
  if (value === null || value === undefined || value === '') return '';
  return String(value).replaceAll('|', ';');
}

function mdNum(value) {
  if (!Number.isFinite(value)) return '';
  return formatNumber(value);
}

function formatNumber(value) {
  return Number(value).toLocaleString('en-US');
}

function formatNumberRounded(value) {
  if (!Number.isFinite(value)) return '';
  return Number(value).toLocaleString('en-US', { maximumFractionDigits: 1 });
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return '';
  return `${Number(value).toFixed(1)}%`;
}

function formatPercentDelta(value) {
  if (!Number.isFinite(value)) return '';
  const sign = value > 0 ? '+' : '';
  return `${sign}${Number(value).toFixed(1)}%`;
}

function numeric(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function parseArgs(args) {
  const parsed = {
    matrixDir: null,
    runsDir: null,
    out: null,
    jsonFile: null,
    markdownFile: null,
    copyMarkdown: null,
    json: false,
    help: false
  };
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (token === '--help' || token === '-h') parsed.help = true;
    else if (token === '--matrix-dir') parsed.matrixDir = args[++index];
    else if (token === '--runs-dir') parsed.runsDir = args[++index];
    else if (token === '--out') parsed.out = args[++index];
    else if (token === '--json-file') parsed.jsonFile = args[++index];
    else if (token === '--markdown-file') parsed.markdownFile = args[++index];
    else if (token === '--copy-markdown') parsed.copyMarkdown = args[++index];
    else if (token === '--json') parsed.json = true;
    else throw new Error(`Unknown argument: ${token}`);
  }
  if (!parsed.help && !parsed.matrixDir) {
    throw new Error('Missing required --matrix-dir <dir>.');
  }
  return parsed;
}

function getCliUsage() {
  return [
    'Usage: node scripts/memory-tool-ai-tester-results-report.mjs --matrix-dir <dir> [options]',
    '',
    'Options:',
    '  --runs-dir <dir>           ai-tester runs directory.',
    '  --out <dir>                Output directory for JSON and Markdown. Defaults to matrix dir.',
    '  --json-file <name>         JSON file name. Default: ai-tester-token-matrices.json.',
    '  --markdown-file <name>     Markdown file name. Default: ai-tester-token-matrices.md.',
    '  --copy-markdown <path>     Also write the Markdown report to this path.',
    '  --json                     Print report JSON to stdout.',
    '  -h, --help                 Show help.'
  ].join('\n');
}

function emit(body, exitCode, options = {}) {
  options.stdout?.push?.(`${JSON.stringify(body, null, 2)}\n`);
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
  runMemoryToolAiTesterResultsReport(process.argv.slice(2)).catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
