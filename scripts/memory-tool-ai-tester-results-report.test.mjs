// memory-tool-ai-tester-results-report.test.mjs - token matrix report contracts
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  AI_TESTER_RESULTS_REPORT_SCHEMA,
  buildAiTesterResultsReport,
  collectAiTesterTraceIndex,
  renderAiTesterResultsMarkdown,
  runMemoryToolAiTesterResultsReport
} from './memory-tool-ai-tester-results-report.mjs';

let tmpDir;

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(os.tmpdir(), 'memory-tool-ai-tester-results-'));
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

describe('ai-tester results report', () => {
  it('maps latest trace token usage onto matrix rows and leaves missing runs explicit', async () => {
    const matrixSummary = makeMatrixSummary();
    const runsDir = path.join(tmpDir, 'runs');
    await writeTrace(runsDir, 'matrix-profile-01__aif-explore__codegraph__architecture_or_impact_discovery__baseline_rg', {
      finishedAt: '2026-05-26T01:00:00.000Z',
      durationMs: 1000,
      inputTokens: 100,
      outputTokens: 10,
      cacheReadTokens: 50,
      toolCalls: 2
    });
    await writeTrace(runsDir, 'matrix-profile-01__aif-explore__codegraph__architecture_or_impact_discovery__baseline_rg', {
      finishedAt: '2026-05-26T02:00:00.000Z',
      durationMs: 1200,
      inputTokens: 200,
      outputTokens: 20,
      cacheReadTokens: 80,
      toolCalls: 3
    });

    const traceIndex = await collectAiTesterTraceIndex({ runsDir });
    const report = buildAiTesterResultsReport({
      matrixSummary,
      traceIndex,
      runsDir,
      generatedAt: '2026-05-26T03:00:00.000Z'
    });

    assert.equal(report.schema, AI_TESTER_RESULTS_REPORT_SCHEMA);
    assert.equal(report.summary.total_rows, 2);
    assert.equal(report.summary.executed_rows, 1);
    assert.equal(report.summary.not_run_rows, 1);
    assert.equal(report.rows[0].status, 'PASS');
    assert.equal(report.rows[0].duration, '1.2s');
    assert.equal(report.rows[0].tool_calls, 3);
    assert.equal(report.rows[0].total_tokens, 300);
    assert.equal(report.rows[0].input_tokens, 200);
    assert.equal(report.rows[0].output_tokens, 20);
    assert.equal(report.rows[0].input_output_tokens, 220);
    assert.equal(report.rows[0].cache_read_tokens, 80);
    assert.equal(report.rows[1].status, 'NOT_RUN');
    assert.equal(report.skills[0].skill, 'aif-explore');
    assert.equal(report.skills[0].rg_executed_rows, 1);
    assert.equal(report.skills[0].codegraph_executed_rows, 0);
    assert.equal(report.paired_comparison.pair_count, 0);
  });

  it('renders one table per skill with the token columns users need', () => {
    const matrixSummary = makeMatrixSummary();
    const report = buildAiTesterResultsReport({
      matrixSummary,
      traceIndex: {
        latest_by_scenario: {
          [matrixSummary.cases[0].id]: {
            status: 'PASS',
            duration_seconds: 10,
            duration_ms: 10000,
            tool_calls: 2,
            total_tokens: 100,
            input_tokens: 80,
            output_tokens: 10,
            cache_creation_tokens: 0,
            cache_read_tokens: 10,
            file_path: 'rg.json',
            finished_at: '2026-05-26T01:00:00.000Z'
          },
          [matrixSummary.cases[1].id]: {
            status: 'PASS',
            duration_seconds: 12,
            duration_ms: 12000,
            tool_calls: 3,
            total_tokens: 150,
            input_tokens: 120,
            output_tokens: 15,
            cache_creation_tokens: 0,
            cache_read_tokens: 15,
            file_path: 'codegraph.json',
            finished_at: '2026-05-26T01:01:00.000Z'
          }
        }
      },
      generatedAt: '2026-05-26T03:00:00.000Z'
    });

    const markdown = renderAiTesterResultsMarkdown(report);

    assert.match(markdown, /^# AI Tester Token Matrices/);
    assert.equal(report.paired_comparison.pair_count, 1);
    assert.equal(report.paired_comparison.deltas.total_tokens_percent, 50);
    assert.equal(report.paired_comparison.better_counts.codegraph_lower_total_tokens_percent, 0);
    assert.match(markdown, /## Paired Rg Vs CodeGraph/);
    assert.match(markdown, /\| Total tokens \| 100 \| 150 \| \+50\.0% \|/);
    assert.match(markdown, /\| CodeGraph lower total tokens \| 0 \| 0\.0% \|/);
    assert.match(markdown, /## aif-explore/);
    assert.match(markdown, /\| project \| labels \| run \| status \| duration \| tool calls \| total tokens \| input tokens \| output tokens \| input\+output tokens \| cache-read tokens \|/);
    assert.match(markdown, /matrix-profile-01/);
  });

  it('identifies CodeGraph useful cases from PASS/PASS pairs only', () => {
    const matrixSummary = makeTwoPairMatrixSummary();
    const report = buildAiTesterResultsReport({
      matrixSummary,
      traceIndex: {
        latest_by_scenario: {
          [matrixSummary.cases[0].id]: makeTraceResult({ totalTokens: 1000, inputTokens: 800, outputTokens: 100, cacheReadTokens: 100, durationSeconds: 20, toolCalls: 10 }),
          [matrixSummary.cases[1].id]: makeTraceResult({ totalTokens: 500, inputTokens: 350, outputTokens: 50, cacheReadTokens: 100, durationSeconds: 10, toolCalls: 5 }),
          [matrixSummary.cases[2].id]: makeTraceResult({ totalTokens: 1000, inputTokens: 800, outputTokens: 100, cacheReadTokens: 100, durationSeconds: 20, toolCalls: 10 }),
          [matrixSummary.cases[3].id]: makeTraceResult({ status: 'FAIL', totalTokens: 500, inputTokens: 350, outputTokens: 50, cacheReadTokens: 100, durationSeconds: 10, toolCalls: 5 })
        }
      },
      generatedAt: '2026-05-26T03:00:00.000Z'
    });

    const markdown = renderAiTesterResultsMarkdown(report);

    assert.equal(report.paired_comparison.pair_count, 2);
    assert.equal(report.paired_comparison.pass_pair_count, 1);
    assert.equal(report.paired_comparison.better_counts.codegraph_lower_total_tokens, 1);
    assert.equal(report.paired_comparison.better_counts.codegraph_lower_total_tokens_percent, 100);
    assert.equal(report.paired_comparison.useful_cases.length, 1);
    assert.equal(report.paired_comparison.useful_cases[0].project, 'matrix-profile-01');
    assert.equal(report.paired_comparison.label_signals.find((item) => item.name === 'mini').pairs, 1);
    assert.match(markdown, /\| PASS\/PASS paired rows used for useful-case counts \| 1 \| 50\.0% \|/);
    assert.match(markdown, /## CodeGraph Useful Cases/);
    assert.match(markdown, /\| aif-explore \| matrix-profile-01 \| js ; mini ; framework ; single_repo ; none ; small_microservice \| total tokens, input\+output, duration, tool calls \| -50\.0% \| -55\.6% \| -50\.0% \| -50\.0% \| 1,000 \| 500 \|/);
  });

  it('writes JSON and Markdown outputs from the CLI wrapper', async () => {
    const matrixDir = path.join(tmpDir, 'matrix');
    const runsDir = path.join(tmpDir, 'runs');
    const outDir = path.join(tmpDir, 'out');
    await mkdir(matrixDir, { recursive: true });
    await writeFile(path.join(matrixDir, 'matrix-summary.json'), `${JSON.stringify(makeMatrixSummary(), null, 2)}\n`, 'utf8');

    const result = await runMemoryToolAiTesterResultsReport([
      '--matrix-dir',
      matrixDir,
      '--runs-dir',
      runsDir,
      '--out',
      outDir
    ], {
      cwd: tmpDir,
      stdout: [],
      exit: false
    });

    assert.equal(result.exitCode, 0);
    assert.match(result.body, /AI tester token matrix written/);
    assert.match(await readFile(path.join(outDir, 'ai-tester-token-matrices.md'), 'utf8'), /## aif-explore/);
    const json = JSON.parse(await readFile(path.join(outDir, 'ai-tester-token-matrices.json'), 'utf8'));
    assert.equal(json.summary.total_rows, 2);
  });

  it('prints JSON to process stdout when --json runs without a test stdout mock', async () => {
    const matrixDir = path.join(tmpDir, 'matrix');
    const runsDir = path.join(tmpDir, 'runs');
    await mkdir(matrixDir, { recursive: true });
    await writeFile(path.join(matrixDir, 'matrix-summary.json'), `${JSON.stringify(makeMatrixSummary(), null, 2)}\n`, 'utf8');

    let captured = '';
    const originalWrite = process.stdout.write;
    process.stdout.write = function patchedWrite(chunk, encoding, callback) {
      captured += String(chunk);
      if (typeof encoding === 'function') encoding();
      if (typeof callback === 'function') callback();
      return true;
    };
    try {
      const result = await runMemoryToolAiTesterResultsReport([
        '--matrix-dir',
        matrixDir,
        '--runs-dir',
        runsDir,
        '--json'
      ], {
        cwd: tmpDir,
        exit: false
      });

      assert.equal(result.exitCode, 0);
    } finally {
      process.stdout.write = originalWrite;
    }

    const printed = JSON.parse(captured);
    assert.equal(printed.schema, AI_TESTER_RESULTS_REPORT_SCHEMA);
    assert.equal(printed.summary.total_rows, 2);
  });
});

function makeMatrixSummary() {
  return {
    schema: 'aifhub.memory_tools.ai_tester_matrix.v1',
    generated_at: '2026-05-26T00:00:00.000Z',
    profiles: [{
      id: 'matrix-profile-01',
      project_label: 'js | mini | framework | single_repo | none | small_microservice',
      tags: ['js', 'mini', 'framework', 'single_repo', 'none', 'small_microservice']
    }],
    cases: [
      {
        id: 'matrix-profile-01__aif-explore__codegraph__architecture_or_impact_discovery__baseline_rg',
        skill: 'aif-explore',
        tool_id: 'rg',
        optional_tool_id: 'codegraph',
        profile_id: 'matrix-profile-01'
      },
      {
        id: 'matrix-profile-01__aif-explore__codegraph__architecture_or_impact_discovery__tool_run',
        skill: 'aif-explore',
        tool_id: 'codegraph',
        optional_tool_id: 'codegraph',
        profile_id: 'matrix-profile-01'
      }
    ]
  };
}

function makeTwoPairMatrixSummary() {
  return {
    schema: 'aifhub.memory_tools.ai_tester_matrix.v1',
    generated_at: '2026-05-26T00:00:00.000Z',
    profiles: [
      {
        id: 'matrix-profile-01',
        project_label: 'js | mini | framework | single_repo | none | small_microservice',
        tags: ['js', 'mini', 'framework', 'single_repo', 'none', 'small_microservice']
      },
      {
        id: 'matrix-profile-02',
        project_label: 'js | standard | framework | single_repo | none | large_framework_app',
        tags: ['js', 'standard', 'framework', 'single_repo', 'none', 'large_framework_app']
      }
    ],
    cases: [
      {
        id: 'matrix-profile-01__aif-explore__codegraph__architecture_or_impact_discovery__baseline_rg',
        skill: 'aif-explore',
        tool_id: 'rg',
        optional_tool_id: 'codegraph',
        profile_id: 'matrix-profile-01'
      },
      {
        id: 'matrix-profile-01__aif-explore__codegraph__architecture_or_impact_discovery__tool_run',
        skill: 'aif-explore',
        tool_id: 'codegraph',
        optional_tool_id: 'codegraph',
        profile_id: 'matrix-profile-01'
      },
      {
        id: 'matrix-profile-02__aif-explore__codegraph__architecture_or_impact_discovery__baseline_rg',
        skill: 'aif-explore',
        tool_id: 'rg',
        optional_tool_id: 'codegraph',
        profile_id: 'matrix-profile-02'
      },
      {
        id: 'matrix-profile-02__aif-explore__codegraph__architecture_or_impact_discovery__tool_run',
        skill: 'aif-explore',
        tool_id: 'codegraph',
        optional_tool_id: 'codegraph',
        profile_id: 'matrix-profile-02'
      }
    ]
  };
}

function makeTraceResult({
  status = 'PASS',
  totalTokens = 0,
  inputTokens = 0,
  outputTokens = 0,
  cacheReadTokens = 0,
  cacheCreationTokens = 0,
  durationSeconds = 1,
  toolCalls = 1
} = {}) {
  return {
    status,
    duration_seconds: durationSeconds,
    duration_ms: durationSeconds * 1000,
    tool_calls: toolCalls,
    total_tokens: totalTokens,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cache_creation_tokens: cacheCreationTokens,
    cache_read_tokens: cacheReadTokens,
    file_path: `${status}.json`,
    finished_at: '2026-05-26T01:00:00.000Z'
  };
}

async function writeTrace(runsDir, scenarioName, overrides = {}) {
  const scenarioDir = path.join(runsDir, `inline_${scenarioName}`);
  await mkdir(scenarioDir, { recursive: true });
  const filePath = path.join(scenarioDir, `inline_${scenarioName}__${overrides.finishedAt.replaceAll(':', '-')}.json`);
  const toolCalls = Array.from({ length: overrides.toolCalls ?? 0 }, (_, index) => ({ id: `call-${index}` }));
  await writeFile(filePath, `${JSON.stringify({
    runId: filePath,
    skill: { name: 'inline' },
    scenario: { name: scenarioName },
    runner: {
      finishedAt: overrides.finishedAt,
      durationMs: overrides.durationMs,
      turnsUsed: 1
    },
    turns: [{ toolCalls }],
    toolCallSummary: { total: overrides.toolCalls ?? 0 },
    scoring: { overallPass: true },
    cost: {
      inputTokens: overrides.inputTokens ?? 0,
      outputTokens: overrides.outputTokens ?? 0,
      cacheCreationTokens: overrides.cacheCreationTokens ?? 0,
      cacheReadTokens: overrides.cacheReadTokens ?? 0
    },
    errors: []
  }, null, 2)}\n`, 'utf8');
}
