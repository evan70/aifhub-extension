// handoff-gate-summary.test.mjs - tests for Handoff orchestration gate summary
import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  buildHandoffGateSummary,
  parseHandoffGateSummaryArgs,
  runHandoffGateSummaryCommand,
  summarizeHandoffGateSummary
} from './handoff-gate-summary.mjs';
import {
  createGateResult,
  renderGateResultBlock
} from './aif-gate-result.mjs';

const tempRoots = [];

async function createTempRoot() {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'aifhub-handoff-gates-'));
  tempRoots.push(rootDir);
  return rootDir;
}

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function writeFixture(rootDir, relativePath, content) {
  const targetPath = path.join(rootDir, ...relativePath.split('/'));
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, content, 'utf8');
  return targetPath;
}

async function createOpenSpecChange(rootDir, changeId = 'add-oauth-login') {
  await writeFixture(rootDir, `openspec/changes/${changeId}/proposal.md`, '# Proposal\n');
  await writeFixture(rootDir, `openspec/changes/${changeId}/design.md`, '# Design\n');
  await writeFixture(rootDir, `openspec/changes/${changeId}/tasks.md`, '# Tasks\n');
}

async function writeGate(rootDir, changeId, fileName, gate, status) {
  await writeFixture(rootDir, `.ai-factory/qa/${changeId}/${fileName}`, [
    `# ${gate}`,
    '',
    renderGateResultBlock(createGateResult({
      gate,
      status,
      blockers: status === 'fail'
        ? [{ id: `${gate}-failed`, severity: 'error', summary: `${gate} failed.` }]
          .map((blocker) => gate === 'rules'
            ? {
                ...blocker,
                source: {
                  path: 'openspec/changes/add-oauth-login/specs/auth/spec.md',
                  requirement: 'Generated rule traceability'
                }
              }
            : blocker)
        : [],
      suggestedNext: status === 'fail'
        ? { command: '/aif-fix', reason: `${gate} failed.` }
        : null
    })),
    ''
  ].join('\n'));
}

async function writeCoverage(rootDir, changeId, status = 'warn') {
  await writeFixture(rootDir, `.ai-factory/qa/${changeId}/coverage.json`, JSON.stringify({
    schema_version: 1,
    change_id: changeId,
    status,
    blocking: status === 'fail',
    requirements: [],
    summary: { covered: 0, partial: 0, missing: 0, not_applicable: 0 },
    diagnostics: []
  }, null, 2));
}

function generatedRulesPass() {
  return {
    ok: true,
    changeId: 'add-oauth-login',
    generatedRules: [
      { kind: 'merged', path: '.ai-factory/rules/generated/openspec-merged-add-oauth-login.md', exists: true, stale: false },
      { kind: 'change', path: '.ai-factory/rules/generated/openspec-change-add-oauth-login.md', exists: true, stale: false },
      { kind: 'base', path: '.ai-factory/rules/generated/openspec-base.md', exists: true, stale: false }
    ],
    warnings: [],
    errors: []
  };
}

function generatedRulesStale(warningCode = 'stale-generated-rules') {
  return {
    ...generatedRulesPass(),
    warnings: [{
      code: warningCode,
      message: 'Generated rules are stale.',
      path: '.ai-factory/rules/generated/openspec-merged-add-oauth-login.md'
    }]
  };
}

async function createPassingReviewEvidence(rootDir, changeId = 'add-oauth-login') {
  await createOpenSpecChange(rootDir, changeId);
  await writeGate(rootDir, changeId, 'rules.md', 'rules', 'pass');
  await writeGate(rootDir, changeId, 'aif-review.md', 'review', 'warn');
  await writeGate(rootDir, changeId, 'aif-security-checklist.md', 'security', 'pass');
  await writeGate(rootDir, changeId, 'verify.md', 'verify', 'pass');
  await writeCoverage(rootDir, changeId, 'warn');
}

async function captureStdout(fn) {
  const originalWrite = process.stdout.write;
  const chunks = [];
  process.stdout.write = (chunk, ...args) => {
    chunks.push(String(chunk));
    const callback = args.find((arg) => typeof arg === 'function');
    if (callback) {
      callback();
    }
    return true;
  };

  try {
    return {
      result: await fn(),
      stdout: chunks.join('')
    };
  } finally {
    process.stdout.write = originalWrite;
  }
}

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((rootDir) => rm(rootDir, {
    recursive: true,
    force: true
  })));
});

describe('Handoff gate summary', () => {
  it('builds the sample review summary shape from one orchestration result', async () => {
    const rootDir = await createTempRoot();
    await createPassingReviewEvidence(rootDir);

    const summary = await buildHandoffGateSummary({
      rootDir,
      changeId: 'add-oauth-login',
      stage: 'review',
      collectGeneratedRules: async () => generatedRulesPass()
    });

    assert.equal(summary.schema_version, 1);
    assert.equal(summary.change_id, 'add-oauth-login');
    assert.equal(summary.stage, 'review');
    assert.deepEqual(summary.gates, {
      rules: 'pass',
      review: 'warn',
      security: 'pass',
      verify: 'pass',
      coverage: 'warn'
    });
    assert.equal(summary.generatedRules, 'pass');
    assert.equal(summary.blocking, false);
    assert.equal(summary.next_stage, 'done');
    assert.equal(summary.suggested_next, '/aif-done add-oauth-login');
    assert.match(summarizeHandoffGateSummary(summary), /Suggested next: \/aif-done add-oauth-login/);
  });

  it('routes rules failures to implementation when generated rules are current', async () => {
    const rootDir = await createTempRoot();
    await createPassingReviewEvidence(rootDir);
    await writeGate(rootDir, 'add-oauth-login', 'rules.md', 'rules', 'fail');

    const summary = await buildHandoffGateSummary({
      rootDir,
      changeId: 'add-oauth-login',
      collectGeneratedRules: async () => generatedRulesPass()
    });

    assert.equal(summary.gates.rules, 'fail');
    assert.equal(summary.blocking, true);
    assert.equal(summary.next_stage, 'implementing');
    assert.equal(summary.suggested_next, '/aif-fix add-oauth-login');
  });

  it('gives stale generated rules routing priority while preserving gate failures', async () => {
    const rootDir = await createTempRoot();
    await createPassingReviewEvidence(rootDir);
    await writeGate(rootDir, 'add-oauth-login', 'rules.md', 'rules', 'fail');

    const summary = await buildHandoffGateSummary({
      rootDir,
      changeId: 'add-oauth-login',
      collectGeneratedRules: async () => generatedRulesStale()
    });

    assert.equal(summary.generatedRules, 'stale');
    assert.equal(summary.gates.rules, 'fail');
    assert.equal(summary.blocking, true);
    assert.equal(summary.next_stage, 'review');
    assert.equal(summary.suggested_next, '/aif-mode sync --change add-oauth-login');
  });

  it('classifies missing generated-rule traces as stale', async () => {
    const rootDir = await createTempRoot();
    await createPassingReviewEvidence(rootDir);

    const summary = await buildHandoffGateSummary({
      rootDir,
      changeId: 'add-oauth-login',
      collectGeneratedRules: async () => generatedRulesStale('missing-generated-rules-trace')
    });

    assert.equal(summary.generatedRules, 'stale');
    assert.equal(summary.suggested_next, '/aif-mode sync --change add-oauth-login');
  });

  it('keeps missing non-required planning gate evidence as warnings without blocking', async () => {
    const rootDir = await createTempRoot();
    await createOpenSpecChange(rootDir);
    await writeGate(rootDir, 'add-oauth-login', 'verify.md', 'verify', 'pass');
    await writeCoverage(rootDir, 'add-oauth-login', 'pass');

    const summary = await buildHandoffGateSummary({
      rootDir,
      changeId: 'add-oauth-login',
      stage: 'planning',
      collectGeneratedRules: async () => generatedRulesPass()
    });

    assert.equal(summary.gates.rules, 'warn');
    assert.equal(summary.gates.review, 'warn');
    assert.equal(summary.gates.security, 'warn');
    assert.equal(summary.blocking, false);
    assert.equal(summary.diagnostics.some((diagnostic) => diagnostic.code === 'rules-evidence-missing'), true);
  });

  it('blocks review routing when required review evidence is missing', async () => {
    const rootDir = await createTempRoot();
    await createOpenSpecChange(rootDir);
    await writeGate(rootDir, 'add-oauth-login', 'rules.md', 'rules', 'pass');
    await writeGate(rootDir, 'add-oauth-login', 'aif-security-checklist.md', 'security', 'pass');
    await writeGate(rootDir, 'add-oauth-login', 'verify.md', 'verify', 'pass');
    await writeCoverage(rootDir, 'add-oauth-login', 'pass');

    const summary = await buildHandoffGateSummary({
      rootDir,
      changeId: 'add-oauth-login',
      stage: 'review',
      collectGeneratedRules: async () => generatedRulesPass()
    });

    assert.equal(summary.gates.review, 'warn');
    assert.equal(summary.blocking, true);
    assert.equal(summary.next_stage, 'review');
    assert.equal(summary.suggested_next, '/aif-review add-oauth-login');
  });

  it('blocks review routing when required security or rules evidence is missing', async () => {
    const securityRoot = await createTempRoot();
    await createOpenSpecChange(securityRoot);
    await writeGate(securityRoot, 'add-oauth-login', 'rules.md', 'rules', 'pass');
    await writeGate(securityRoot, 'add-oauth-login', 'aif-review.md', 'review', 'pass');
    await writeGate(securityRoot, 'add-oauth-login', 'verify.md', 'verify', 'pass');
    await writeCoverage(securityRoot, 'add-oauth-login', 'pass');

    const missingSecurity = await buildHandoffGateSummary({
      rootDir: securityRoot,
      changeId: 'add-oauth-login',
      stage: 'review',
      collectGeneratedRules: async () => generatedRulesPass()
    });
    assert.equal(missingSecurity.blocking, true);
    assert.equal(missingSecurity.next_stage, 'review');
    assert.equal(missingSecurity.suggested_next, '/aif-security-checklist add-oauth-login');

    const rulesRoot = await createTempRoot();
    await createOpenSpecChange(rulesRoot);
    await writeGate(rulesRoot, 'add-oauth-login', 'aif-review.md', 'review', 'pass');
    await writeGate(rulesRoot, 'add-oauth-login', 'aif-security-checklist.md', 'security', 'pass');
    await writeGate(rulesRoot, 'add-oauth-login', 'verify.md', 'verify', 'pass');
    await writeCoverage(rulesRoot, 'add-oauth-login', 'pass');

    const missingRules = await buildHandoffGateSummary({
      rootDir: rulesRoot,
      changeId: 'add-oauth-login',
      stage: 'review',
      collectGeneratedRules: async () => generatedRulesPass()
    });
    assert.equal(missingRules.blocking, true);
    assert.equal(missingRules.next_stage, 'review');
    assert.equal(missingRules.suggested_next, '/aif-rules-check');
  });

  it('blocks done routing when required final evidence is missing', async () => {
    const rootDir = await createTempRoot();
    await createOpenSpecChange(rootDir);
    await writeGate(rootDir, 'add-oauth-login', 'rules.md', 'rules', 'pass');

    const summary = await buildHandoffGateSummary({
      rootDir,
      changeId: 'add-oauth-login',
      stage: 'done',
      collectGeneratedRules: async () => generatedRulesPass()
    });

    assert.equal(summary.blocking, true);
    assert.equal(summary.next_stage, 'done');
    assert.equal(summary.suggested_next, '/aif-verify add-oauth-login');
  });

  it('keeps parsed review warnings non-blocking when required evidence is present', async () => {
    const rootDir = await createTempRoot();
    await createPassingReviewEvidence(rootDir);

    const summary = await buildHandoffGateSummary({
      rootDir,
      changeId: 'add-oauth-login',
      stage: 'review',
      collectGeneratedRules: async () => generatedRulesPass()
    });

    assert.equal(summary.gates.review, 'warn');
    assert.equal(summary.blocking, false);
    assert.equal(summary.next_stage, 'done');
  });

  it('blocks required invalid gate evidence at the current stage', async () => {
    const rootDir = await createTempRoot();
    await createPassingReviewEvidence(rootDir);
    await writeFixture(rootDir, '.ai-factory/qa/add-oauth-login/aif-review.md', [
      '# Review',
      '',
      '```aif-gate-result',
      '{"schema_version":1,"gate":"review"',
      '```'
    ].join('\n'));

    const summary = await buildHandoffGateSummary({
      rootDir,
      changeId: 'add-oauth-login',
      stage: 'review',
      collectGeneratedRules: async () => generatedRulesPass()
    });

    assert.equal(summary.gates.review, 'warn');
    assert.equal(summary.blocking, true);
    assert.equal(summary.next_stage, 'review');
    assert.equal(summary.suggested_next, '/aif-review add-oauth-login');
  });

  it('blocks stale required coverage while keeping parsed coverage warnings non-blocking', async () => {
    const staleRoot = await createTempRoot();
    await createPassingReviewEvidence(staleRoot);

    const staleCoverage = await buildHandoffGateSummary({
      rootDir: staleRoot,
      changeId: 'add-oauth-login',
      stage: 'done',
      collectGeneratedRules: async () => generatedRulesPass(),
      readOpenSpecCoverageMatrix: async () => ({
        exists: true,
        ok: true,
        stale: true,
        relativePath: '.ai-factory/qa/add-oauth-login/coverage.json',
        coverage: { status: 'pass' },
        diagnostics: [{ code: 'coverage-source-stale', message: 'Coverage source changed.' }]
      })
    });
    assert.equal(staleCoverage.gates.coverage, 'warn');
    assert.equal(staleCoverage.blocking, true);
    assert.equal(staleCoverage.next_stage, 'done');
    assert.equal(staleCoverage.suggested_next, '/aif-verify add-oauth-login');

    const warnRoot = await createTempRoot();
    await createPassingReviewEvidence(warnRoot);
    const parsedWarn = await buildHandoffGateSummary({
      rootDir: warnRoot,
      changeId: 'add-oauth-login',
      stage: 'review',
      collectGeneratedRules: async () => generatedRulesPass()
    });
    assert.equal(parsedWarn.gates.coverage, 'warn');
    assert.equal(parsedWarn.blocking, false);
  });

  it('continues scanning fallback gate evidence after narrative markdown without a gate result', async () => {
    const rootDir = await createTempRoot();
    await createOpenSpecChange(rootDir);
    await writeGate(rootDir, 'add-oauth-login', 'rules.md', 'rules', 'pass');
    await writeFixture(rootDir, '.ai-factory/qa/add-oauth-login/review.md', '# Review\n\nNarrative review notes.\n');
    await writeGate(rootDir, 'add-oauth-login', 'gates/review.md', 'review', 'fail');
    await writeGate(rootDir, 'add-oauth-login', 'aif-security-checklist.md', 'security', 'pass');
    await writeGate(rootDir, 'add-oauth-login', 'verify.md', 'verify', 'pass');
    await writeCoverage(rootDir, 'add-oauth-login', 'pass');

    const summary = await buildHandoffGateSummary({
      rootDir,
      changeId: 'add-oauth-login',
      collectGeneratedRules: async () => generatedRulesPass()
    });

    assert.equal(summary.gates.review, 'fail');
    assert.equal(summary.blocking, true);
    assert.equal(summary.next_stage, 'implementing');
    assert.equal(summary.suggested_next, '/aif-fix add-oauth-login');
    assert.equal(summary.evidence.review, '.ai-factory/qa/add-oauth-login/gates/review.md');
    assert.equal(summary.diagnostics.some((diagnostic) => diagnostic.code === 'review-gate-result-missing'), true);
  });

  it('does not fall back when the latest gate result block is invalid', async () => {
    const rootDir = await createTempRoot();
    await createPassingReviewEvidence(rootDir);
    const pass = createGateResult({
      gate: 'rules',
      status: 'pass',
      blockers: [],
      affectedFiles: [],
      suggestedNext: null
    });
    await writeFixture(rootDir, '.ai-factory/qa/add-oauth-login/rules.md', [
      renderGateResultBlock(pass),
      '',
      '```aif-gate-result',
      '{"schema_version":1,"gate":"rules"',
      '```'
    ].join('\n'));

    const summary = await buildHandoffGateSummary({
      rootDir,
      changeId: 'add-oauth-login',
      collectGeneratedRules: async () => generatedRulesPass()
    });

    assert.equal(summary.gates.rules, 'warn');
    assert.equal(summary.blocking, true);
    assert.equal(summary.next_stage, 'review');
    assert.equal(summary.suggested_next, '/aif-rules-check');
    assert.equal(summary.diagnostics.some((diagnostic) => diagnostic.code === 'rules-gate-result-invalid'), true);
  });

  it('does not create runtime or QA directories while summarizing absent evidence', async () => {
    const rootDir = await createTempRoot();
    await createOpenSpecChange(rootDir);
    const qaPath = path.join(rootDir, '.ai-factory', 'qa', 'add-oauth-login');

    assert.equal(await pathExists(qaPath), false);
    const summary = await buildHandoffGateSummary({
      rootDir,
      changeId: 'add-oauth-login',
      collectGeneratedRules: async () => generatedRulesPass()
    });

    assert.equal(summary.gates.verify, 'warn');
    assert.equal(await pathExists(qaPath), false);
  });

  it('parses CLI args and returns deterministic JSON exit codes', async () => {
    assert.deepEqual(parseHandoffGateSummaryArgs([
      '--change',
      'add-oauth-login',
      '--stage',
      'review',
      '--json'
    ]), {
      ok: true,
      changeId: 'add-oauth-login',
      stage: 'review',
      json: true,
      help: false,
      errors: []
    });

    const invalidStage = parseHandoffGateSummaryArgs(['--stage', 'qa']);
    assert.equal(invalidStage.ok, false);
    assert.match(invalidStage.errors[0], /Invalid --stage/);

    const passRoot = await createTempRoot();
    await createPassingReviewEvidence(passRoot);
    const pass = await captureStdout(() => runHandoffGateSummaryCommand([
      '--change',
      'add-oauth-login',
      '--stage',
      'review',
      '--json'
    ], {
      rootDir: passRoot,
      collectGeneratedRules: async () => generatedRulesPass()
    }));

    assert.equal(pass.result, 0);
    assert.equal(JSON.parse(pass.stdout).blocking, false);

    const failRoot = await createTempRoot();
    await createPassingReviewEvidence(failRoot);
    await writeGate(failRoot, 'add-oauth-login', 'rules.md', 'rules', 'fail');
    const fail = await captureStdout(() => runHandoffGateSummaryCommand([
      '--change',
      'add-oauth-login',
      '--json'
    ], {
      rootDir: failRoot,
      collectGeneratedRules: async () => generatedRulesPass()
    }));

    assert.equal(fail.result, 1);
    assert.equal(JSON.parse(fail.stdout).suggested_next, '/aif-fix add-oauth-login');

    const invalid = await captureStdout(() => runHandoffGateSummaryCommand([
      '--stage',
      'qa',
      '--json'
    ], {}));

    assert.equal(invalid.result, 2);
    assert.equal(JSON.parse(invalid.stdout).ok, false);
  });
});
