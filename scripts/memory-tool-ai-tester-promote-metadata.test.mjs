// memory-tool-ai-tester-promote-metadata.test.mjs - proven-label promotion contracts
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  AI_TESTER_METADATA_PROMOTION_SCHEMA,
  applyProvenLabelEvidenceBlock,
  buildMetadataPromotionProposal,
  hasPromotionLeak,
  runMemoryToolAiTesterPromoteMetadata
} from './memory-tool-ai-tester-promote-metadata.mjs';

let tmpDir;

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(os.tmpdir(), 'memory-tool-ai-tester-promote-'));
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

describe('ai-tester metadata promotion', () => {
  it('promotes accepted-evidence pass/pass useful pairs into exact-label entries', () => {
    const proposal = buildMetadataPromotionProposal({
      report: makeReport([
        makeDecision({ skill: 'aif-explore', decision: 'conditional' }),
        makeDecision({ skill: 'aif-review', decision: 'conditional' }),
        makeDecision({ scenario_id: 'resume-previous-work', run_class: 'focused', tool_id: 'codex-agent-mem' })
      ]),
      scenarioCatalog: makeScenarioCatalog(),
      reportPath: '.ai-factory/state/run/ai-tester-token-matrices.json',
      runId: 'graphify-project-8d97432e6d7a-architecture-explore-plan-20260611t1821z',
      generatedAt: '2026-06-11T00:00:00.000Z'
    });

    assert.equal(proposal.schema, AI_TESTER_METADATA_PROMOTION_SCHEMA);
    assert.equal(proposal.entries.length, 1);
    assert.equal(proposal.entries[0].tool_id, 'graphify');
    assert.equal(proposal.entries[0].scenario_id, 'architecture-impact-discovery');
    assert.deepEqual(proposal.entries[0].skills, ['aif-explore', 'aif-review']);
    assert.deepEqual(proposal.entries[0].required_labels, ['framework', 'js', 'large_framework_app', 'openspec_native', 'single_repo', 'standard']);
    assert.match(proposal.entries[0].id, /graphify-project-[a-f0-9]{8}$/);
    assert.equal(proposal.entries[0].pairs.pass_pass, 2);
    assert.equal(proposal.entries[0].pairs.useful, 2);
    assert.equal(proposal.entries[0].decision, 'conditional');
    assert.ok(proposal.skipped.some((item) => item.reason === 'not_eligible_for_metadata'));
    assert.equal(hasPromotionLeak(proposal), false);
  });

  it('does not promote sample sizes below the scenario minimum', () => {
    const proposal = buildMetadataPromotionProposal({
      report: makeReport([makeDecision({ skill: 'aif-explore' })]),
      scenarioCatalog: makeScenarioCatalog(),
      reportPath: '.ai-factory/state/run/ai-tester-token-matrices.json'
    });

    assert.equal(proposal.entries.length, 0);
    assert.ok(proposal.skipped.some((item) => item.reason === 'not_enough_pass_pairs'));
  });

  it('promotes recommend, avoid, and forbid decisions with the required sample size', () => {
    const recommended = buildMetadataPromotionProposal({
      report: makeReport([
        makeDecision({ skill: 'aif-explore', decision: 'recommend' }),
        makeDecision({ skill: 'aif-review', decision: 'recommend' })
      ]),
      scenarioCatalog: makeScenarioCatalog(),
      reportPath: 'report.json'
    });
    const avoided = buildMetadataPromotionProposal({
      report: makeReport([
        makeDecision({ skill: 'aif-explore', useful: false, decision: 'avoid' }),
        makeDecision({ skill: 'aif-review', useful: false, decision: 'avoid' })
      ]),
      scenarioCatalog: makeScenarioCatalog(),
      reportPath: 'report.json'
    });
    const forbidden = buildMetadataPromotionProposal({
      report: makeReport([
        makeDecision({ skill: 'aif-explore', pass_pair: false, useful: false, candidate_status: 'FAIL', decision: 'forbid' }),
        makeDecision({ skill: 'aif-review', pass_pair: false, useful: false, candidate_status: 'FAIL', decision: 'forbid' })
      ]),
      scenarioCatalog: makeScenarioCatalog(),
      reportPath: 'report.json'
    });

    assert.equal(recommended.entries[0].decision, 'recommend');
    assert.equal(avoided.entries[0].decision, 'avoid');
    assert.equal(forbidden.entries[0].decision, 'forbid');
    assert.equal(forbidden.entries[0].pairs.pass_pass, 0);
    assert.equal(forbidden.entries[0].pairs.total, 2);
  });

  it('does not treat incomplete negative or not-applicable rows as positive evidence', () => {
    const proposal = buildMetadataPromotionProposal({
      report: makeReport([
        makeDecision({ skill: 'aif-explore', pass_pair: false, useful: false, decision: 'avoid' }),
        makeDecision({ skill: 'aif-review', pass_pair: false, useful: false, decision: 'avoid' })
      ]),
      scenarioCatalog: makeScenarioCatalog(),
      reportPath: 'report.json'
    });

    assert.equal(proposal.entries.length, 0);
    assert.equal(proposal.skipped.filter((item) => item.reason === 'pair_not_pass_pass').length, 2);
  });

  it('applies YAML entries before evidence_runs and avoids duplicate ids', () => {
    const proposal = buildMetadataPromotionProposal({
      report: makeReport([
        makeDecision({ skill: 'aif-explore' }),
        makeDecision({ skill: 'aif-review' })
      ]),
      scenarioCatalog: makeScenarioCatalog(),
      reportPath: 'docs/memory-tools-research/report.json',
      runId: 'synthetic-run'
    });
    const metadataRaw = [
      'schema: aifhub.memory_tools.recommendation.v1',
      'tools: {}',
      'evidence_runs:',
      '  - id: existing',
      ''
    ].join('\n');

    const applied = applyProvenLabelEvidenceBlock(metadataRaw, proposal.entries);
    const appliedAgain = applyProvenLabelEvidenceBlock(applied, proposal.entries);

    assert.match(applied, /proven_label_evidence:/);
    assert.match(applied, /scenario_id: architecture-impact-discovery/);
    assert.match(applied, /average_deltas:/);
    assert.match(applied, /total_tokens_percent: -30/);
    assert.ok(applied.indexOf('proven_label_evidence:') < applied.indexOf('evidence_runs:'));
    assert.equal((appliedAgain.match(/scenario_id: architecture-impact-discovery/g) ?? []).length, 1);
  });

  it('writes proposal files from the CLI wrapper without applying metadata by default', async () => {
    const reportPath = path.join(tmpDir, 'ai-tester-token-matrices.json');
    const catalogPath = path.join(tmpDir, 'ai-tester-scenarios.yaml');
    const metadataPath = path.join(tmpDir, 'recommendation-metadata.yaml');
    const outDir = path.join(tmpDir, 'out');
    await writeFile(reportPath, `${JSON.stringify(makeReport([
      makeDecision({ skill: 'aif-explore' }),
      makeDecision({ skill: 'aif-review' })
    ]), null, 2)}\n`, 'utf8');
    await writeFile(catalogPath, makeCatalogYaml(), 'utf8');
    await writeFile(metadataPath, makeMetadataYaml(), 'utf8');
    await mkdir(outDir, { recursive: true });

    const result = await runMemoryToolAiTesterPromoteMetadata([
      '--report',
      reportPath,
      '--scenario-catalog',
      catalogPath,
      '--metadata',
      metadataPath,
      '--out',
      outDir,
      '--json'
    ], {
      cwd: tmpDir,
      stdout: [],
      exit: false
    });

    assert.equal(result.exitCode, 0);
    assert.equal(result.body.summary.promoted_entries, 1);
    assert.equal(await readFile(metadataPath, 'utf8'), makeMetadataYaml());
    assert.match(await readFile(path.join(outDir, 'metadata-promotion-proposal.md'), 'utf8'), /graphify/);
  });

  it('supports dry-run mode without writing proposal files', async () => {
    const reportPath = path.join(tmpDir, 'ai-tester-token-matrices.json');
    const catalogPath = path.join(tmpDir, 'ai-tester-scenarios.yaml');
    const metadataPath = path.join(tmpDir, 'recommendation-metadata.yaml');
    const outDir = path.join(tmpDir, 'dry-run-out');
    await writeFile(reportPath, `${JSON.stringify(makeReport([
      makeDecision({ skill: 'aif-explore' }),
      makeDecision({ skill: 'aif-review' })
    ]), null, 2)}\n`, 'utf8');
    await writeFile(catalogPath, makeCatalogYaml(), 'utf8');
    await writeFile(metadataPath, makeMetadataYaml(), 'utf8');

    const result = await runMemoryToolAiTesterPromoteMetadata([
      '--report',
      reportPath,
      '--scenario-catalog',
      catalogPath,
      '--metadata',
      metadataPath,
      '--out',
      outDir,
      '--dry-run',
      '--json'
    ], {
      cwd: tmpDir,
      stdout: [],
      exit: false
    });

    assert.equal(result.exitCode, 0);
    assert.equal(result.body.output.proposal_json, null);
    await assert.rejects(() => readFile(path.join(outDir, 'metadata-promotion-proposal.json'), 'utf8'), /ENOENT/);
  });

  it('rejects dry-run plus apply because metadata mutation must be explicit and singular', async () => {
    await assert.rejects(
      () => runMemoryToolAiTesterPromoteMetadata(['--dry-run', '--apply'], { cwd: tmpDir, stdout: [], exit: false }),
      /--dry-run and --apply/
    );
  });

  it('rejects promotion proposals that would leak absolute paths or secret-like values', () => {
    assert.equal(hasPromotionLeak({ source_report: 'C:\\Users\\Ichi\\private\\trace.json' }), true);
    assert.equal(hasPromotionLeak({ source_report: '/tmp/private/trace.json' }), true);
    assert.equal(hasPromotionLeak({ token: 'sk_test_abcdefghijklmnopqrstuvwxyz' }), true);
  });
});

function makeReport(pairDecisions) {
  return {
    paired_comparison: {
      pair_decisions: pairDecisions
    }
  };
}

function makeDecision(overrides = {}) {
  return {
    pair_id: 'pair-1',
    tool_id: 'graphify',
    skill: 'aif-explore',
    project: 'matrix-profile-01',
    task_scenario: 'architecture_or_impact_discovery',
    scenario_id: 'architecture-impact-discovery',
    labels: ['js', 'standard', 'framework', 'single_repo', 'openspec_native', 'large_framework_app'],
    run_class: 'accepted_evidence',
    promotion_policy: {
      eligible_for_metadata: true,
      min_pass_pairs: 2,
      require_exact_labels: true,
      accepted_run_class: 'accepted_evidence',
      allowed_decisions: ['recommend', 'conditional', 'avoid', 'forbid']
    },
    rg_status: 'PASS',
    candidate_status: 'PASS',
    pass_pair: true,
    useful: true,
    deltas: {
      total_tokens_percent: -30,
      input_output_tokens_percent: -28,
      duration_percent: -10,
      tool_calls_percent: -20
    },
    decision: 'conditional',
    ...overrides
  };
}

function makeScenarioCatalog() {
  return {
    scenarios: [
      {
        id: 'architecture-impact-discovery',
        promotion_policy: {
          eligible_for_metadata: true,
          min_pass_pairs: 2,
          require_exact_labels: true,
          accepted_run_class: 'accepted_evidence',
          allowed_decisions: ['recommend', 'conditional', 'avoid', 'forbid']
        }
      },
      {
        id: 'resume-previous-work',
        promotion_policy: {
          eligible_for_metadata: false
        }
      }
    ]
  };
}

function makeCatalogYaml() {
  return [
    'schema: aifhub.memory_tools.ai_tester_scenario_catalog.v1',
    'scenarios:',
    '  - id: architecture-impact-discovery',
    '    task_signal: architecture_or_impact_discovery',
    '    run_class: accepted_evidence',
    '    skills: [aif-explore, aif-review]',
    '    tools: [graphify]',
    '    fixture_requirements:',
    '      labels_any:',
    '        - [js, standard, framework, single_repo, openspec_native, large_framework_app]',
    '    paired_runs:',
    '      baseline: rg',
    '      candidate_mode: direct_tool_run_after_rg',
    '    promotion_policy:',
    '      eligible_for_metadata: true',
    '      min_pass_pairs: 2',
    '      require_exact_labels: true',
    '      accepted_run_class: accepted_evidence',
    '      allowed_decisions: [recommend, conditional, avoid, forbid]',
    ''
  ].join('\n');
}

function makeMetadataYaml() {
  return [
    'schema: aifhub.memory_tools.recommendation.v1',
    'default_policy:',
    '  baseline_tool: rg',
    'tools:',
    '  graphify:',
    '    decision: manual_quality_experiment_only',
    'skill_usage_matrix:',
    '  aif-explore:',
    '    allowed: [rg, graphify]',
    '  aif-review:',
    '    allowed: [rg, graphify]',
    'task_signals:',
    '  architecture_or_impact_discovery:',
    '    conditional: [graphify]',
    ''
  ].join('\n');
}
