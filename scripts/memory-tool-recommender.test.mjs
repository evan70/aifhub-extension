// memory-tool-recommender.test.mjs - metadata-driven optional memory/context tool recommendations
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

import {
  buildRecommendationResult,
  isWindowsShellCommandNotFound,
  loadRecommendationMetadata,
  parseRecommendationMetadata,
  resolveMetadataPath,
  runMemoryToolRecommender
} from './memory-tool-recommender.mjs';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const REAL_METADATA = path.join(REPO_ROOT, 'docs', 'memory-tools-research', 'recommendation-metadata.yaml');

let tmpDir;

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(os.tmpdir(), 'memory-tool-recommender-'));
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

async function runCli(args, options = {}) {
  const { stdout, stderr } = await execFileAsync(
    process.execPath,
    [path.join(REPO_ROOT, 'scripts', 'memory-tool-recommender.mjs'), ...args],
    {
      cwd: options.cwd ?? REPO_ROOT,
      env: {
        ...process.env,
        ...(options.env ?? {})
      },
      timeout: 10000
    }
  );

  assert.equal(stderr, '');
  return JSON.parse(stdout);
}

describe('recommendation metadata parsing', () => {
  it('parses required policy fields and tool decisions', async () => {
    const raw = await readFile(REAL_METADATA, 'utf8');
    const metadata = parseRecommendationMetadata(raw, { sourcePath: REAL_METADATA });

    assert.equal(metadata.schema, 'aifhub.memory_tools.recommendation.v1');
    assert.equal(metadata.default_policy.baseline_tool, 'rg');
    assert.equal(metadata.default_policy.never_auto_install, true);
    assert.equal(metadata.default_policy.install_policy, 'explicit_user_opt_in_only');
    assert.equal(metadata.default_policy.require_explicit_paths, true);
    assert.equal(metadata.default_policy.require_purge_path, true);
    assert.ok(metadata.skill_usage_matrix['aif-analyze']);
    assert.equal(metadata.tool_permissions.graphify['aif-analyze'], 'recommend_only');
    assert.equal(metadata.availability_probes.graphify[0], 'graphify --version');
    assert.ok(metadata.forbidden_operations.includes('auto_install'));
    assert.ok(metadata.protected_artifacts.includes('aif-gate-result'));
    assert.ok(metadata.protected_artifacts.includes('coverage.json'));
    assert.equal(metadata.tools.graphify.decision, 'optional');
    assert.equal(metadata.tools['codex-agent-mem'].read_scope, 'explicit_sqlite_db_path');
    assert.equal(metadata.tools['context-mode'].decision, 'manual_helper_only');
    assert.equal(metadata.tools['codex-mem'].decision, 'reject_default');
    assert.equal(metadata.tools['eagle-mem'].decision, 'reject_defer');
    assert.equal(metadata.tools.context7.decision, 'optional');
    assert.equal(metadata.tools.codegraph.decision, 'manual_cli_only');
  });
});

describe('metadata source resolution', () => {
  it('prefers installed script-relative metadata', async () => {
    const installedRoot = path.join(tmpDir, '.ai-factory', 'extensions', 'aifhub-extension');
    await mkdir(path.join(installedRoot, 'scripts'), { recursive: true });
    await mkdir(path.join(installedRoot, 'docs', 'memory-tools-research'), { recursive: true });
    await copyFile(
      REAL_METADATA,
      path.join(installedRoot, 'docs', 'memory-tools-research', 'recommendation-metadata.yaml')
    );

    const resolved = await resolveMetadataPath({
      scriptDir: path.join(installedRoot, 'scripts'),
      cwd: tmpDir
    });

    assert.equal(
      resolved.path,
      path.join(installedRoot, 'docs', 'memory-tools-research', 'recommendation-metadata.yaml')
    );
    assert.equal(resolved.kind, 'installed-script-relative');
  });

  it('uses source-tree metadata only inside the aifhub extension repository', async () => {
    const sourceRoot = path.join(tmpDir, 'source');
    await mkdir(path.join(sourceRoot, 'docs', 'memory-tools-research'), { recursive: true });
    await writeFile(
      path.join(sourceRoot, 'extension.json'),
      JSON.stringify({ name: 'aifhub-extension' }),
      'utf8'
    );
    await copyFile(
      REAL_METADATA,
      path.join(sourceRoot, 'docs', 'memory-tools-research', 'recommendation-metadata.yaml')
    );

    const resolved = await resolveMetadataPath({
      scriptDir: path.join(sourceRoot, 'scripts'),
      cwd: sourceRoot
    });

    assert.equal(
      resolved.path,
      path.join(sourceRoot, 'docs', 'memory-tools-research', 'recommendation-metadata.yaml')
    );
    assert.equal(resolved.kind, 'source-tree');
  });
});

describe('recommendation results', () => {
  it('recommends Graphify for large framework architecture discovery', async () => {
    const metadata = await loadRecommendationMetadata({ metadataPath: REAL_METADATA });
    const result = await buildRecommendationResult({
      metadata,
      projectShape: 'large_framework_app',
      taskSignals: ['architecture_or_impact_discovery'],
      probeRunner: async () => ({ availability: 'unknown' })
    });

    const graphify = result.recommendations.find((item) => item.tool_id === 'graphify');
    assert.equal(result.schema, 'aifhub.memory_tools.recommendation_result.v1');
    assert.deepEqual(result.baseline, ['rg']);
    assert.ok(graphify);
    assert.equal(result.recommendations.some((item) => item.tool_id === 'context-mode'), false);
    assert.equal(graphify.display_name, 'Graphify');
    assert.equal(graphify.status, 'optional');
    assert.equal(graphify.install_policy, 'explicit_user_opt_in_only');
    assert.equal(graphify.read_scope, 'explicit_project_path');
    assert.deepEqual(graphify.allowed_in, ['aif-analyze', 'aif-explore', 'aif-plan', 'aif-review']);
    assert.ok(graphify.forbidden_in.includes('aif-implement'));
    assert.equal(graphify.permission, 'recommend_only');
    assert.match(graphify.privacy_caveat, /explicit project path/i);
    assert.match(graphify.next_step, /Use rg first/i);
  });

  it('surfaces protected artifacts and matrix policy in metadata JSON', async () => {
    const metadata = await loadRecommendationMetadata({ metadataPath: REAL_METADATA });
    const result = await runMemoryToolRecommender([
      'metadata',
      '--metadata',
      REAL_METADATA,
      '--json'
    ], {
      cwd: REPO_ROOT,
      stdout: [],
      stderr: [],
      exit: false
    });

    assert.equal(result.exitCode, 0);
    assert.equal(result.body.schema, 'aifhub.memory_tools.metadata_result.v1');
    assert.deepEqual(result.body.skill_usage_matrix['aif-analyze'].allowed, [
      'rg',
      'graphify',
      'context7',
      'codex-agent-mem',
      'context-mode',
      'codegraph'
    ]);
    assert.equal(result.body.tool_permissions.graphify['aif-implement'], 'forbidden');
    assert.equal(result.body.tool_permissions.codegraph['aif-analyze'], 'recommend_only');
    assert.equal(result.body.tool_permissions.codegraph['aif-explore'], 'manual_purged_cli_execution');
    assert.match(JSON.stringify(result.body.tools.codegraph.execution), /codegraph init <project>/);
    assert.match(JSON.stringify(result.body.tools.graphify.execution), /read_existing_reviewed_output/);
    assert.ok(result.body.forbidden_operations.includes('auto_register_mcp'));
    assert.ok(result.body.protected_artifacts.includes('done-readiness.json'));
    assert.ok(result.body.protected_artifacts.includes('openspec/specs/**'));
    assert.equal(metadata.tools.codegraph.recommendation_action, 'suggest_manual_cli_for_repo_graph_when_enabled_or_explicit');
  });

  it('allows CodeGraph only as scoped manual CLI for analyze recommendations and enabled explore use', async () => {
    const metadata = await loadRecommendationMetadata({ metadataPath: REAL_METADATA });
    const codegraph = metadata.tools.codegraph;

    assert.equal(codegraph.display_name, 'CodeGraph');
    assert.equal(codegraph.decision, 'manual_cli_only');
    assert.equal(codegraph.recommendation_action, 'suggest_manual_cli_for_repo_graph_when_enabled_or_explicit');
    assert.equal(codegraph.install_policy, 'explicit_user_opt_in_only');
    assert.equal(codegraph.stable_cli, 'verified_for_version_help_status_init_index_query_uninit');
    assert.equal(codegraph.read_scope, 'explicit_project_path_verified_for_cli_init_index_status_query');
    assert.equal(codegraph.purge_path, 'codegraph uninit --force <project> verified');
    assert.deepEqual(codegraph.allowed_in, ['aif-analyze', 'aif-explore']);
    assert.ok(!codegraph.forbidden_in.includes('aif-analyze'));
    assert.ok(!codegraph.forbidden_in.includes('aif-explore'));
    assert.ok(codegraph.forbidden_in.includes('aif-implement'));
    assert.equal(metadata.tool_permissions.codegraph['aif-analyze'], 'recommend_only');
    assert.equal(metadata.tool_permissions.codegraph['aif-explore'], 'manual_purged_cli_execution');
    assert.equal(metadata.tool_permissions.codegraph.default, 'forbidden');
    assert.deepEqual(metadata.availability_probes.codegraph, [
      'codegraph --version',
      'codegraph --help',
      'codegraph status'
    ]);
    assert.match(codegraph.privacy_caveat, /\.codegraph/i);
    assert.match(codegraph.privacy_caveat, /purged/i);
  });

  it('records CodeGraph real-root lifecycle evidence for manual CLI use', async () => {
    const metadata = await loadRecommendationMetadata({ metadataPath: REAL_METADATA });
    const run = metadata.evidence_runs.find((item) => item.id === 'local-real-project-codegraph-safety-2026-05-23');

    assert.ok(run);
    assert.equal(run.install.user_requested, true);
    assert.equal(run.install.version, '0.9.3');
    assert.ok(run.not_run.includes('codegraph install'));
    assert.ok(run.not_run.includes('codegraph serve --mcp'));
    assert.equal(run.outcomes.codegraph.roots_tested, 29);
    assert.equal(run.outcomes.codegraph.lifecycle_passed, 29);
    assert.equal(run.outcomes.codegraph.command_failures, 0);
    assert.equal(run.outcomes.codegraph.query_failures, 0);
    assert.equal(run.outcomes.codegraph.protected_config_mutations, 0);
    assert.equal(run.outcomes.codegraph.leftover_codegraph_dirs, 0);
    assert.deepEqual(metadata.tools.codegraph.allowed_in, ['aif-analyze', 'aif-explore']);
  });

  it('declares explicit allowed scopes for rejected providers', async () => {
    const metadata = await loadRecommendationMetadata({ metadataPath: REAL_METADATA });

    for (const toolId of ['codex-mem', 'eagle-mem']) {
      assert.deepEqual(
        metadata.tools[toolId].allowed_in,
        [],
        `${toolId} should declare allowed_in: [] instead of relying on an absent field`
      );
      assert.ok(metadata.tools[toolId].forbidden_in.length > 0);
      assert.equal(metadata.tools[toolId].install_policy, 'do_not_auto_install');
      assert.match(metadata.tools[toolId].privacy_caveat, /\S/);
    }
  });

  it('recommends codex-agent-mem only for continuity tasks', async () => {
    const metadata = await loadRecommendationMetadata({ metadataPath: REAL_METADATA });
    const result = await buildRecommendationResult({
      metadata,
      projectShape: 'go_service',
      taskSignals: ['resume_previous_work'],
      probeRunner: async () => ({ availability: 'not_installed' })
    });

    const continuity = result.recommendations.find((item) => item.tool_id === 'codex-agent-mem');
    assert.ok(continuity);
    assert.equal(continuity.status, 'optional');
    assert.equal(continuity.availability, 'not_installed');
    assert.equal(continuity.read_scope, 'explicit_sqlite_db_path');
    assert.match(continuity.next_step, /explicit DB path/i);
  });

  it('recommends context-mode only for large temporary output compression', async () => {
    const metadata = await loadRecommendationMetadata({ metadataPath: REAL_METADATA });
    const result = await buildRecommendationResult({
      metadata,
      projectShape: 'large_framework_app',
      taskSignals: ['large_command_output_compression'],
      probeRunner: async () => ({ availability: 'unknown' })
    });

    const contextMode = result.recommendations.find((item) => item.tool_id === 'context-mode');
    assert.ok(contextMode);
    assert.equal(contextMode.status, 'manual_helper_only');
    assert.equal(contextMode.read_scope, 'explicit_indexed_content');
    assert.match(contextMode.next_step, /manual temporary/i);
  });

  it('keeps small microservices on rg baseline and avoids repo graph helpers', async () => {
    const metadata = await loadRecommendationMetadata({ metadataPath: REAL_METADATA });
    const result = await buildRecommendationResult({
      metadata,
      projectShape: 'small_microservice',
      taskSignals: ['exact_file_or_symbol_lookup'],
      probeRunner: async () => ({ availability: 'installed' })
    });

    assert.deepEqual(result.baseline, ['rg']);
    assert.equal(result.recommendations.some((item) => item.tool_id === 'graphify'), false);
    assert.equal(result.recommendations.some((item) => item.tool_id === 'codegraph'), false);
    assert.equal(result.recommendations.some((item) => item.tool_id === 'context-mode'), false);
    assert.ok(result.do_not_recommend.some((item) => item.tool_id === 'codex-mem'));
    assert.ok(result.do_not_recommend.some((item) => item.tool_id === 'eagle-mem'));
  });

  it('recommends CodeGraph for broad repo graph questions with command-specific permissions', async () => {
    const metadata = await loadRecommendationMetadata({ metadataPath: REAL_METADATA });
    const analyzeResult = await buildRecommendationResult({
      metadata,
      projectShape: 'large_framework_app',
      taskSignals: ['architecture_or_impact_discovery'],
      command: 'aif-analyze',
      probeRunner: async (toolId) => ({
        availability: 'installed',
        command: toolId === 'codegraph' ? 'codegraph --version' : `${toolId} --version`
      })
    });
    const exploreResult = await buildRecommendationResult({
      metadata,
      projectShape: 'multirepo',
      taskSignals: ['multirepo_surface_mapping'],
      command: 'aif-explore',
      probeRunner: async () => ({ availability: 'installed', command: 'codegraph --version' })
    });

    const analyzeCodegraph = analyzeResult.recommendations.find((item) => item.tool_id === 'codegraph');
    const exploreCodegraph = exploreResult.recommendations.find((item) => item.tool_id === 'codegraph');

    assert.ok(analyzeCodegraph);
    assert.equal(analyzeCodegraph.status, 'manual_cli_only');
    assert.equal(analyzeCodegraph.permission, 'recommend_only');
    assert.equal(analyzeCodegraph.install_policy, 'explicit_user_opt_in_only');
    assert.equal(analyzeCodegraph.availability, 'installed');
    assert.match(analyzeCodegraph.next_step, /codegraph init <project>/i);
    assert.match(analyzeCodegraph.next_step, /codegraph uninit --force <project>/i);
    assert.ok(!analyzeResult.do_not_recommend.some((item) => item.tool_id === 'codegraph'));
    assert.ok(exploreCodegraph);
    assert.equal(exploreCodegraph.permission, 'manual_purged_cli_execution');
  });

  it('does not recommend tools forbidden for the current command', async () => {
    const metadata = await loadRecommendationMetadata({ metadataPath: REAL_METADATA });
    const planResult = await buildRecommendationResult({
      metadata,
      projectShape: 'large_framework_app',
      taskSignals: ['architecture_or_impact_discovery'],
      command: 'aif-plan',
      probeRunner: async () => ({ availability: 'installed', command: 'tool --version' })
    });
    const reviewResult = await buildRecommendationResult({
      metadata,
      projectShape: 'large_framework_app',
      taskSignals: ['architecture_or_impact_discovery'],
      command: 'aif-review',
      probeRunner: async () => ({ availability: 'installed', command: 'tool --version' })
    });
    const compressionForPlan = await buildRecommendationResult({
      metadata,
      projectShape: 'large_framework_app',
      taskSignals: ['large_command_output_compression'],
      command: 'aif-plan',
      probeRunner: async () => ({ availability: 'installed', command: 'tool --version' })
    });

    assert.ok(planResult.recommendations.some((item) => item.tool_id === 'graphify'));
    assert.equal(planResult.recommendations.some((item) => item.tool_id === 'codegraph'), false);
    assert.equal(reviewResult.recommendations.some((item) => item.tool_id === 'codegraph'), false);
    assert.equal(compressionForPlan.recommendations.some((item) => item.tool_id === 'context-mode'), false);
    for (const result of [planResult, reviewResult, compressionForPlan]) {
      assert.equal(result.recommendations.some((item) => item.permission === 'forbidden'), false);
    }
  });

  it('selects enabled tools from project config per command without prompt-specific tool lists', async () => {
    await mkdir(path.join(tmpDir, '.ai-factory'), { recursive: true });
    await writeFile(
      path.join(tmpDir, '.ai-factory', 'config.yaml'),
      [
        'utilities:',
        '  context_tools:',
        '    enabled:',
        '      - codegraph',
        '      - graphify',
        ''
      ].join('\n'),
      'utf8'
    );

    const explore = await runMemoryToolRecommender([
      'select',
      '--shape',
      'large_framework_app',
      '--task',
      'architecture_or_impact_discovery',
      '--command',
      'aif-explore',
      '--metadata',
      REAL_METADATA,
      '--json'
    ], {
      cwd: tmpDir,
      stdout: [],
      stderr: [],
      exit: false,
      probeRunner: async () => ({ availability: 'installed', command: 'tool --version' })
    });
    const plan = await runMemoryToolRecommender([
      'select',
      '--shape',
      'large_framework_app',
      '--task',
      'architecture_or_impact_discovery',
      '--command',
      'aif-plan',
      '--metadata',
      REAL_METADATA,
      '--json'
    ], {
      cwd: tmpDir,
      stdout: [],
      stderr: [],
      exit: false,
      probeRunner: async () => ({ availability: 'installed', command: 'tool --version' })
    });

    assert.equal(explore.exitCode, 0);
    assert.equal(explore.body.schema, 'aifhub.memory_tools.selection_result.v1');
    assert.deepEqual(explore.body.config.enabled_tools, ['codegraph', 'graphify']);
    const exploreCodegraph = explore.body.selected_tools.find((item) => item.tool_id === 'codegraph');
    const exploreGraphify = explore.body.selected_tools.find((item) => item.tool_id === 'graphify');
    assert.ok(exploreCodegraph);
    assert.ok(exploreGraphify);
    assert.equal(exploreCodegraph.permission, 'manual_purged_cli_execution');
    assert.equal(exploreGraphify.permission, 'read_existing_reviewed_output');
    assert.match(JSON.stringify(exploreCodegraph.execution), /codegraph init <project>/);
    assert.match(JSON.stringify(exploreCodegraph.execution), /codegraph uninit --force <project>/);

    assert.equal(plan.exitCode, 0);
    assert.equal(plan.body.schema, 'aifhub.memory_tools.selection_result.v1');
    assert.ok(plan.body.selected_tools.some((item) => item.tool_id === 'graphify'));
    assert.equal(plan.body.selected_tools.some((item) => item.tool_id === 'codegraph'), false);
    const skippedCodegraph = plan.body.not_selected_tools.find((item) => item.tool_id === 'codegraph');
    assert.ok(skippedCodegraph);
    assert.match(skippedCodegraph.reason, /forbidden/i);
  });

  it('selects enabled tools from inline YAML config lists', async () => {
    await mkdir(path.join(tmpDir, '.ai-factory'), { recursive: true });
    await writeFile(
      path.join(tmpDir, '.ai-factory', 'config.yaml'),
      [
        'utilities:',
        '  context_tools:',
        '    enabled: [codegraph, graphify]',
        ''
      ].join('\n'),
      'utf8'
    );

    const result = await runMemoryToolRecommender([
      'select',
      '--shape',
      'large_framework_app',
      '--task',
      'architecture_or_impact_discovery',
      '--command',
      'aif-explore',
      '--metadata',
      REAL_METADATA,
      '--json'
    ], {
      cwd: tmpDir,
      stdout: [],
      stderr: [],
      exit: false,
      probeRunner: async () => ({ availability: 'installed', command: 'tool --version' })
    });

    assert.equal(result.exitCode, 0);
    assert.deepEqual(result.body.config.enabled_tools, ['codegraph', 'graphify']);
    assert.ok(result.body.selected_tools.some((item) => item.tool_id === 'codegraph'));
    assert.ok(result.body.selected_tools.some((item) => item.tool_id === 'graphify'));
  });

  it('selects legacy utility-enabled tools as compatibility config', async () => {
    await mkdir(path.join(tmpDir, '.ai-factory'), { recursive: true });
    await writeFile(
      path.join(tmpDir, '.ai-factory', 'config.yaml'),
      [
        'utilities:',
        '  codegraph:',
        '    enabled: true',
        ''
      ].join('\n'),
      'utf8'
    );

    const result = await runMemoryToolRecommender([
      'select',
      '--shape',
      'large_framework_app',
      '--task',
      'architecture_or_impact_discovery',
      '--command',
      'aif-explore',
      '--metadata',
      REAL_METADATA,
      '--json'
    ], {
      cwd: tmpDir,
      stdout: [],
      stderr: [],
      exit: false,
      probeRunner: async () => ({ availability: 'installed', command: 'tool --version' })
    });

    assert.equal(result.exitCode, 0);
    assert.deepEqual(result.body.config.enabled_tools, ['codegraph']);
    assert.equal(result.body.config.source_kind, 'project-config');
    assert.ok(result.body.selected_tools.some((item) => item.tool_id === 'codegraph'));
  });

  it('only recommends agent-memory for explicit manual durable notes tasks', async () => {
    const metadata = await loadRecommendationMetadata({ metadataPath: REAL_METADATA });
    const withoutManualNotes = await buildRecommendationResult({
      metadata,
      projectShape: 'large_framework_app',
      taskSignals: ['architecture_or_impact_discovery'],
      probeRunner: async () => ({ availability: 'unknown' })
    });
    const withManualNotes = await buildRecommendationResult({
      metadata,
      projectShape: 'large_framework_app',
      taskSignals: ['manual_durable_notes'],
      probeRunner: async () => ({ availability: 'unknown' })
    });

    assert.equal(withoutManualNotes.recommendations.some((item) => item.tool_id === 'agent-memory'), false);
    assert.equal(withManualNotes.recommendations.some((item) => item.tool_id === 'agent-memory'), true);
  });
});

describe('CLI behavior', () => {
  it('prints recommendation JSON for explicit shape and task signals', async () => {
    const result = await runCli([
      'recommend',
      '--shape',
      'large_framework_app',
      '--task',
      'architecture_or_impact_discovery',
      '--metadata',
      REAL_METADATA,
      '--json'
    ]);

    assert.equal(result.schema, 'aifhub.memory_tools.recommendation_result.v1');
    assert.equal(result.project_shape, 'large_framework_app');
    assert.deepEqual(result.task_signals, ['architecture_or_impact_discovery']);
    assert.ok(result.recommendations.some((item) => item.tool_id === 'graphify'));
  });

  it('accepts command context so skills receive their own tool permissions', async () => {
    const result = await runCli([
      'recommend',
      '--shape',
      'large_framework_app',
      '--task',
      'architecture_or_impact_discovery',
      '--command',
      'aif-explore',
      '--metadata',
      REAL_METADATA,
      '--json'
    ]);

    const codegraph = result.recommendations.find((item) => item.tool_id === 'codegraph');
    assert.ok(codegraph);
    assert.equal(codegraph.permission, 'manual_purged_cli_execution');
  });

  it('degrades recommend output when metadata is unavailable', async () => {
    const result = await runMemoryToolRecommender([
      'recommend',
      '--shape',
      'large_framework_app',
      '--metadata',
      path.join(tmpDir, 'missing.yaml'),
      '--json'
    ], {
      cwd: tmpDir,
      stdout: [],
      stderr: [],
      exit: false
    });

    assert.equal(result.exitCode, 0);
    assert.equal(result.body.schema, 'aifhub.memory_tools.recommendation_result.v1');
    assert.equal(result.body.metadata_available, false);
    assert.deepEqual(result.body.baseline, ['rg']);
    assert.deepEqual(result.body.recommendations, []);
    assert.ok(result.body.warnings.some((warning) => /metadata unavailable/i.test(warning.message)));
  });

  it('reports safe probe failures as unknown or not_installed without failing recommendations', async () => {
    const metadata = await loadRecommendationMetadata({ metadataPath: REAL_METADATA });
    const result = await buildRecommendationResult({
      metadata,
      projectShape: 'large_framework_app',
      taskSignals: ['architecture_or_impact_discovery'],
      probeRunner: async () => ({ availability: 'not_installed', command: 'graphify --version' })
    });

    const graphify = result.recommendations.find((item) => item.tool_id === 'graphify');
    assert.equal(graphify.availability, 'not_installed');
  });

  it('classifies Windows shell fallback failures only from explicit not-found output', () => {
    assert.equal(
      isWindowsShellCommandNotFound("'codegraph' is not recognized as an internal or external command."),
      true
    );
    assert.equal(
      isWindowsShellCommandNotFound('Error: project index is missing. Run codegraph init first.'),
      false
    );
    assert.equal(
      isWindowsShellCommandNotFound('The CLI returned exit code 1 because workspace state is invalid.'),
      false
    );
  });

  it('detects Windows npm command shims during status probes', { skip: process.platform !== 'win32' }, async () => {
    await writeFile(
      path.join(tmpDir, 'codegraph.cmd'),
      '@echo off\r\necho 0.9.3\r\nexit /b 0\r\n',
      'utf8'
    );

    const previousPath = process.env.PATH;
    process.env.PATH = `${tmpDir}${path.delimiter}${previousPath}`;
    try {
      const result = await runMemoryToolRecommender([
        'status',
        '--metadata',
        REAL_METADATA,
        '--json'
      ], {
        cwd: REPO_ROOT,
        stdout: [],
        stderr: [],
        exit: false
      });

      assert.equal(result.exitCode, 0);
      assert.equal(result.body.probes.codegraph.availability, 'installed');
      assert.equal(result.body.probes.codegraph.command, 'codegraph --version');
    } finally {
      process.env.PATH = previousPath;
    }
  });
});
