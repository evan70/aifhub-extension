// memory-tool-ai-tester-matrix.test.mjs - rg baseline paired ai-tester matrix contracts
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  AI_TESTER_MATRIX_SCHEMA,
  buildAiTesterMatrixManifest,
  buildPublicMatrixSummary,
  commandInvocationRegexForYaml,
  compareBenchmarkPair,
  renderAiTesterScenario,
  runMemoryToolAiTesterMatrix,
  selectStratifiedProfiles
} from './memory-tool-ai-tester-matrix.mjs';
import { hasSensitivePathLeak } from './memory-tool-field-run.mjs';
import { loadRecommendationMetadata } from './memory-tool-recommender.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REAL_METADATA = path.join(REPO_ROOT, 'docs', 'memory-tools-research', 'recommendation-metadata.yaml');

let tmpDir;

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(os.tmpdir(), 'memory-tool-ai-tester-matrix-'));
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

async function writeFixtureFile(relativePath, content = 'fixture') {
  const target = path.join(tmpDir, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content, 'utf8');
  return target;
}

describe('ai-tester matrix manifest', () => {
  it('generates an rg baseline before every optional-tool scenario', async () => {
    const metadata = await loadRecommendationMetadata({ metadataPath: REAL_METADATA });
    const profiles = [{
      id: 'matrix-profile-01',
      sourceRoot: path.join(tmpDir, 'fixture-project'),
      project_shape: 'large_framework_app',
      languages: ['js'],
      volume: 'large',
      complexity: 'framework',
      repo_shape: 'single_repo',
      artifact_mode: 'openspec_native'
    }];

    const manifest = buildAiTesterMatrixManifest({
      metadata,
      profiles,
      skills: ['aif-explore'],
      tools: ['codegraph', 'graphify', 'context-mode'],
      taskScenarios: ['architecture_or_impact_discovery']
    });

    assert.equal(manifest.schema, AI_TESTER_MATRIX_SCHEMA);
    assert.ok(manifest.cases.length > 0);

    const optionalCases = manifest.cases.filter((item) => item.tool_id !== 'rg');
    assert.ok(optionalCases.some((item) => item.expectation === 'positive'));
    assert.ok(optionalCases.some((item) => item.expectation === 'not_applicable'));

    for (const toolCase of optionalCases) {
      const baseline = manifest.cases.find((candidate) => (
        candidate.expectation === 'baseline_rg'
        && candidate.skill === toolCase.skill
        && candidate.profile_id === toolCase.profile_id
        && candidate.task_scenario === toolCase.task_scenario
        && candidate.pair_id === toolCase.pair_id
      ));
      assert.ok(baseline, `missing rg baseline for ${toolCase.id}`);
      assert.ok(manifest.cases.indexOf(baseline) < manifest.cases.indexOf(toolCase));
    }
  });

  it('renders ai-tester scenarios with direct ai-tester fields and selector wrapper separation', () => {
    const baselineScenario = renderAiTesterScenario({
      id: 'case-baseline',
      suite: 'baseline',
      expectation: 'baseline_rg',
      skill: 'aif-explore',
      tool_id: 'rg',
      profile_id: 'matrix-profile-01',
      fixture_path: '<sanitized-fixture>',
      task_scenario: 'architecture_or_impact_discovery',
      selector_mode: 'installed'
    });
    const toolScenario = renderAiTesterScenario({
      id: 'case-tool',
      suite: 'positive',
      expectation: 'positive',
      skill: 'aif-explore',
      tool_id: 'codegraph',
      profile_id: 'matrix-profile-01',
      fixture_path: '<sanitized-fixture>',
      task_scenario: 'architecture_or_impact_discovery',
      selector_mode: 'source-fallback'
    });

    assert.match(baselineScenario, /copy_trees:/);
    assert.match(baselineScenario, /system_prompt_file:/);
    assert.match(baselineScenario, /model: "gpt-5"/);
    assert.match(baselineScenario, /permission_mode: bypassPermissions/);
    assert.match(baselineScenario, /This is the rg baseline scenario/);
    assert.doesNotMatch(baselineScenario, /Then run codegraph/);
    assert.match(baselineScenario, /type: no_tool_called/);
    assert.match(baselineScenario, /codegraph\(\?:\\\.cmd\|\\\.ps1\|\\\.exe\)\?/);
    assert.match(baselineScenario, /type: tool_called/);
    assert.match(baselineScenario, /rg\(\?:\\\.cmd\|\\\.ps1\|\\\.exe\)\?/);
    assert.match(baselineScenario, /no_path_escape/);

    assert.match(toolScenario, /development mode/);
    assert.match(toolScenario, /project\/\.ai-factory\/config\.yaml/);
    assert.match(toolScenario, /context_tools:/);
    assert.match(toolScenario, /type: tool_call_sequence/);
    assert.match(toolScenario, /type: tool_called/);
    assert.match(toolScenario, /codegraph\(\?:\\\.cmd\|\\\.ps1\|\\\.exe\)\?/);
    assert.match(toolScenario, /id: codegraph-data-called/);
    assert.match(toolScenario, /\(\?:files\|query\|context\)\\b/);
    assert.match(toolScenario, /pattern: "tool_run"/);
    assert.doesNotMatch(toolScenario, /ai-factory aifhub-memory-tools/);
    assert.doesNotMatch(toolScenario, /memory-tool-recommender\.mjs select/);

    const overheadScenario = renderAiTesterScenario({
      id: 'case-overhead',
      suite: 'overhead',
      expectation: 'overhead',
      skill: 'aif-explore',
      tool_id: 'codegraph',
      profile_id: 'matrix-profile-02',
      fixture_path: '<sanitized-fixture>',
      task_scenario: 'architecture_or_impact_discovery',
      selector_mode: 'source-fallback'
    });

    assert.match(overheadScenario, /forced usefulness measurement/);
    assert.match(overheadScenario, /type: tool_call_sequence/);
    assert.match(overheadScenario, /type: tool_called/);
    assert.match(overheadScenario, /pattern: "tool_run"/);
    assert.match(overheadScenario, /pattern: "overhead"/);
    assert.doesNotMatch(overheadScenario, /Do not run codegraph/);

    const preinitializedScenario = renderAiTesterScenario({
      id: 'case-preinitialized',
      suite: 'overhead',
      expectation: 'overhead',
      skill: 'aif-explore',
      tool_id: 'codegraph',
      preinitialized_tool_ids: ['codegraph'],
      profile_id: 'matrix-profile-03',
      fixture_path: '<sanitized-fixture>',
      task_scenario: 'architecture_or_impact_discovery',
      selector_mode: 'source-fallback'
    });

    assert.match(preinitializedScenario, /setup_commands:/);
    assert.match(preinitializedScenario, /codegraph init \./);
    assert.match(preinitializedScenario, /codegraph index --quiet \./);
    assert.match(preinitializedScenario, /Do not run codegraph init or codegraph index during the model turn/);
    assert.match(preinitializedScenario, /id: codegraph-data-called/);
    assert.match(preinitializedScenario, /\(\?:files\|query\|context\)\\b/);
    assert.match(preinitializedScenario, /--help\\b/);
    assert.match(preinitializedScenario, /id: codegraph-purge-called/);
    assert.match(preinitializedScenario, /id: no-codegraph-init-during-turn/);
    assert.match(preinitializedScenario, /id: no-codegraph-index-during-turn/);
  });

  it('matches tool invocations without treating rg search terms as tool calls', () => {
    const codegraphCommand = new RegExp(commandInvocationRegexForYaml('codegraph'));

    assert.equal(codegraphCommand.test('cmd.exe /c "codegraph context --path project architecture"'), true);
    assert.equal(codegraphCommand.test('cmd.exe /c \'codegraph query --path project symbol\''), true);
    assert.equal(codegraphCommand.test('cmd.exe /c \'rg -n "codegraph|context-mode" project\''), false);
    assert.equal(codegraphCommand.test('rg -n "codegraph|context-mode" project'), false);
  });

  it('copies fixtures through sanitized temp paths and keeps public output anonymous', async () => {
    const sourceRoot = path.join(tmpDir, 'secret-product');
    await writeFixtureFile(path.join('secret-product', 'package.json'), '{"name":"secret-product"}');
    await writeFixtureFile(path.join('secret-product', 'src', 'index.js'), 'console.log("ok");');
    await writeFixtureFile(path.join('secret-product', '.env'), 'TOKEN=private');
    await writeFixtureFile(path.join('secret-product', '.git', 'config'), 'private git config');
    await writeFixtureFile(path.join('secret-product', '.ai-factory', 'state', 'private.json'), '{"path":"private"}');
    await writeFixtureFile(path.join('secret-product', 'node_modules', 'pkg', 'index.js'), 'dependency');

    const result = await runMemoryToolAiTesterMatrix([
      '--roots',
      sourceRoot,
      '--out',
      path.join(tmpDir, 'matrix-output'),
      '--max-profiles',
      '1',
      '--dry-run',
      '--json'
    ], {
      cwd: REPO_ROOT,
      stdout: [],
      exit: false
    });

    assert.equal(result.exitCode, 0);
    assert.equal(result.body.schema, AI_TESTER_MATRIX_SCHEMA);
    assert.equal(result.body.profiles[0].id, 'matrix-profile-01');
    assert.equal(JSON.stringify(result.body).includes('secret-product'), false);
    assert.equal(JSON.stringify(result.body).includes('.env'), false);
    assert.equal(hasSensitivePathLeak(result.body, [tmpDir]), false);

    const writeResult = await runMemoryToolAiTesterMatrix([
      '--roots',
      sourceRoot,
      '--out',
      path.join(tmpDir, 'matrix-output-write'),
      '--model',
      'gpt-test',
      '--max-profiles',
      '1',
      '--json'
    ], {
      cwd: REPO_ROOT,
      stdout: [],
      exit: false
    });
    const scenarioPath = path.join(tmpDir, 'matrix-output-write', 'scenarios', 'matrix-profile-01__aif-analyze__codegraph__architecture_or_impact_discovery.yaml');
    assert.equal(writeResult.exitCode, 0);
    assert.equal(await exists(path.join(tmpDir, 'matrix-output-write', 'fixtures', 'matrix-profile-01', 'src', 'index.js')), true);
    assert.equal(await exists(path.join(tmpDir, 'matrix-output-write', 'fixtures', 'matrix-profile-01', '.env')), false);
    assert.equal(await exists(path.join(tmpDir, 'matrix-output-write', 'fixtures', 'matrix-profile-01', '.git')), false);
    assert.equal(await exists(path.join(tmpDir, 'matrix-output-write', 'fixtures', 'matrix-profile-01', '.ai-factory')), false);
    assert.equal(await exists(path.join(tmpDir, 'matrix-output-write', 'fixtures', 'matrix-profile-01', 'node_modules')), false);
    const scenarioText = await readFile(scenarioPath, 'utf8');
    assert.match(scenarioText, /copy_trees:/);
    assert.match(scenarioText, /model: "gpt-test"/);
  });

  it('builds public summaries with dimension counts but without private fixture paths', async () => {
    const summary = buildPublicMatrixSummary({
      manifest: {
        schema: AI_TESTER_MATRIX_SCHEMA,
        profiles: [{
          id: 'matrix-profile-01',
          project_shape: 'go_service',
          languages: ['go'],
          volume: 'mini',
          complexity: 'mini',
          repo_shape: 'single_repo',
          artifact_mode: 'none'
        }],
        cases: [
          { id: 'baseline', expectation: 'baseline_rg', tool_id: 'rg', optional_tool_id: 'codegraph', suite: 'baseline', preinitialized_tool_ids: ['codegraph'] },
          { id: 'tool', expectation: 'overhead', tool_id: 'codegraph', optional_tool_id: 'codegraph', suite: 'overhead', preinitialized_tool_ids: ['codegraph'] }
        ],
        preinitialized_tools: ['codegraph']
      },
      rootInputs: [tmpDir],
      excludedRootCount: 1,
      outDir: path.join(tmpDir, 'out')
    });

    assert.deepEqual(summary.profile_counts_by_dimension.languages.go, 1);
    assert.equal(summary.excluded_root_count, 1);
    assert.equal(summary.profiles[0].project_label, 'go | mini | mini | single_repo | none | go_service');
    assert.deepEqual(summary.profiles[0].tags, ['go', 'mini', 'mini', 'single_repo', 'none', 'go_service']);
    assert.deepEqual(summary.preinitialized_tools, ['codegraph']);
    assert.deepEqual(summary.skill_tool_matrices, [{
      skill: 'unknown_skill',
      optional_tool_id: 'codegraph',
      profile_count: 1,
      rg_baseline_cases: 1,
      tool_run_cases: 1,
      total_cases: 2
    }]);
    assert.deepEqual(summary.cases[0].preinitialized_tool_ids, ['codegraph']);
    assert.deepEqual(summary.case_counts_by_expectation.baseline_rg, 1);
    assert.deepEqual(summary.case_counts_by_expectation.overhead, 1);
    assert.equal(JSON.stringify(summary).includes(tmpDir), false);
  });

  it('keeps stratified profile selection across project dimensions before truncating', () => {
    const selected = selectStratifiedProfiles([
      { id: 'p1', project_shape: 'large_framework_app', languages: ['js'], volume: 'large', complexity: 'framework', repo_shape: 'single_repo' },
      { id: 'p2', project_shape: 'large_framework_app', languages: ['php'], volume: 'large', complexity: 'framework', repo_shape: 'single_repo' },
      { id: 'p3', project_shape: 'go_service', languages: ['go'], volume: 'mini', complexity: 'mini', repo_shape: 'single_repo' },
      { id: 'p4', project_shape: 'multirepo', languages: ['multi'], volume: 'large', complexity: 'integration_heavy', repo_shape: 'multirepo' }
    ], 3);

    assert.deepEqual(selected.map((profile) => profile.id), ['p1', 'p3', 'p4']);
  });
});

describe('benchmark comparison decisions', () => {
  it('recommends a useful tool only when it beats rg on paired metrics', () => {
    const comparison = compareBenchmarkPair({
      baseline: {
        pair_id: 'pair-1',
        tool_id: 'rg',
        wall_clock_ms: 5000,
        token_estimate: 8000,
        output_noise_score: 0.7,
        accuracy_score: 0.4,
        safety_status: 'pass',
        purge_status: 'not_applicable'
      },
      tool: {
        pair_id: 'pair-1',
        tool_id: 'codegraph',
        wall_clock_ms: 2500,
        token_estimate: 3000,
        output_noise_score: 0.2,
        accuracy_score: 0.8,
        safety_status: 'pass',
        purge_status: 'pass'
      }
    });

    assert.equal(comparison.decision, 'recommend');
    assert.equal(comparison.wall_clock_ms_delta, -2500);
    assert.equal(comparison.token_estimate_delta, -5000);
    assert.ok(comparison.usefulness_vs_rg > 0);
  });

  it('avoids optional tools that add no measured value over rg', () => {
    const comparison = compareBenchmarkPair({
      baseline: {
        pair_id: 'pair-1',
        tool_id: 'rg',
        wall_clock_ms: 1000,
        token_estimate: 1200,
        output_noise_score: 0.2,
        accuracy_score: 0.9,
        safety_status: 'pass',
        purge_status: 'not_applicable'
      },
      tool: {
        pair_id: 'pair-1',
        tool_id: 'graphify',
        wall_clock_ms: 10000,
        token_estimate: 3000,
        output_noise_score: 0.5,
        accuracy_score: 0.7,
        safety_status: 'pass',
        purge_status: 'pass'
      }
    });

    assert.equal(comparison.decision, 'avoid');
    assert.ok(comparison.usefulness_vs_rg < 0);
  });

  it('forbids tools that fail safety or purge checks', () => {
    const comparison = compareBenchmarkPair({
      baseline: {
        pair_id: 'pair-1',
        tool_id: 'rg',
        wall_clock_ms: 1000,
        token_estimate: 1200,
        output_noise_score: 0.5,
        accuracy_score: 0.5,
        safety_status: 'pass',
        purge_status: 'not_applicable'
      },
      tool: {
        pair_id: 'pair-1',
        tool_id: 'context-mode',
        wall_clock_ms: 800,
        token_estimate: 700,
        output_noise_score: 0.1,
        accuracy_score: 0.9,
        safety_status: 'fail',
        purge_status: 'fail'
      }
    });

    assert.equal(comparison.decision, 'forbid');
    assert.equal(comparison.safety_status, 'fail');
    assert.equal(comparison.purge_status, 'fail');
  });
});

describe('memory tool matrix documentation contracts', () => {
  it('documents paired rg baseline runs, project-format tables, and safety wording', async () => {
    const matrixDoc = await readFile(path.join(REPO_ROOT, 'docs', 'memory-tools-research', 'ai-tester-matrix.md'), 'utf8');
    const researchReadme = await readFile(path.join(REPO_ROOT, 'docs', 'memory-tools-research', 'README.md'), 'utf8');
    const recommendations = await readFile(path.join(REPO_ROOT, 'docs', 'memory-tool-recommendations.md'), 'utf8');

    assert.match(matrixDoc, /baseline_rg/);
    assert.match(matrixDoc, /tool_run/);
    assert.match(matrixDoc, /ai-factory aifhub-memory-tools/);
    assert.match(matrixDoc, /development-only fallback/);
    assert.match(researchReadme, /Мини Проект/);
    assert.match(researchReadme, /Laravel\/Framework/);
    assert.match(researchReadme, /Multirepo/);
    assert.match(researchReadme, /Legacy Integration-Heavy/);
    assert.match(researchReadme, /Go Service/);
    assert.match(researchReadme, /\| Tool \| aif-analyze \| aif-explore \|/);
    assert.match(recommendations, /language, volume, complexity, repo shape/);
    assert.match(recommendations, /Provider output является только supporting context/);
    assert.doesNotMatch(recommendations, /should auto-install/i);
    assert.doesNotMatch(recommendations, /auto-install by default/i);
    assert.doesNotMatch(recommendations, /run automatic MCP registration/i);
  });
});

async function exists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}
