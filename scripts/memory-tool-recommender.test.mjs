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
    assert.equal(metadata.tools.graphify.decision, 'optional');
    assert.equal(metadata.tools['codex-agent-mem'].read_scope, 'explicit_sqlite_db_path');
    assert.equal(metadata.tools['context-mode'].decision, 'manual_helper_only');
    assert.equal(metadata.tools['codex-mem'].decision, 'reject_default');
    assert.equal(metadata.tools['eagle-mem'].decision, 'reject_defer');
    assert.equal(metadata.tools.context7.decision, 'optional');
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
    assert.match(graphify.next_step, /Use rg first/i);
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
    assert.equal(result.recommendations.some((item) => item.tool_id === 'context-mode'), false);
    assert.ok(result.do_not_recommend.some((item) => item.tool_id === 'codex-mem'));
    assert.ok(result.do_not_recommend.some((item) => item.tool_id === 'eagle-mem'));
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
});
