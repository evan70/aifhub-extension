// openspec-policy.test.mjs - tests for shared OpenSpec validation policy resolver
import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import {
  defaultOpenSpecPolicy,
  evaluateDoneWarningPolicy,
  readOpenSpecPolicy,
  readOpenSpecRulesGateEvidence,
  resolveOpenSpecPolicy,
  summarizeOpenSpecPolicy
} from './openspec-policy.mjs';
import {
  createGateResult,
  renderGateResultBlock
} from './aif-gate-result.mjs';

const execFileAsync = promisify(execFile);
const tempRoots = [];

async function createTempRoot() {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'aifhub-policy-'));
  tempRoots.push(rootDir);
  return rootDir;
}

async function writeFixture(rootDir, relativePath, content) {
  const target = path.join(rootDir, ...relativePath.split('/'));
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content, 'utf8');
}

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((rootDir) => rm(rootDir, {
    recursive: true,
    force: true
  })));
});

describe('OpenSpec policy resolver', () => {
  it('uses degraded verify defaults and strict done defaults', () => {
    const policy = defaultOpenSpecPolicy();

    assert.equal(policy.schema_version, 1);
    assert.equal(policy.actions.validateOnVerify, true);
    assert.equal(policy.requirements.cli.plan, false);
    assert.equal(policy.requirements.cli.improve, false);
    assert.equal(policy.requirements.cli.verify, false);
    assert.equal(policy.requirements.cli.done, true);
    assert.equal(policy.requirements.generatedRules.verify, false);
    assert.equal(policy.requirements.generatedRules.done, true);
    assert.equal(policy.requirements.rulesPass.verify, false);
    assert.equal(policy.requirements.rulesPass.done, true);
    assert.equal(policy.requirements.specCoverage.verify, false);
    assert.equal(policy.requirements.specCoverage.done, true);
    assert.equal(policy.allowWarnOnDone.rules, false);
    assert.equal(policy.allowWarnOnDone.coverage, false);
    assert.equal(policy.allowWarnOnDone.openspecStatus, true);
    assert.equal(policy.requireCliForDone, true, 'legacy flat alias should remain available');
  });

  it('reads nested config and preserves existing compatibility flags', () => {
    const policy = resolveOpenSpecPolicy([
      'aifhub:',
      '  artifactProtocol: openspec',
      '  openspec:',
      '    root: openspec',
      '    validateOnPlan: false',
      '    validateOnImprove: true',
      '    validateOnVerify: false',
      '    statusOnVerify: false',
      '    requireCliForPlan: true',
      '    requireCliForImprove: true',
      '    requireCliForVerify: true',
      '    requireCliForDone: false',
      '    requireGeneratedRulesForVerify: true',
      '    requireRulesPassForVerify: true',
      '    requireSpecCoverageForVerify: true',
      '    allowWarnOnDone:',
      '      rules: true',
      '      coverage: true',
      '      openspecStatus: false',
      ''
    ].join('\n'));

    assert.equal(policy.actions.validateOnPlan, false);
    assert.equal(policy.actions.statusOnVerify, false);
    assert.equal(policy.requirements.cli.plan, true);
    assert.equal(policy.requirements.cli.improve, true);
    assert.equal(policy.requirements.cli.verify, true);
    assert.equal(policy.requirements.cli.done, false);
    assert.equal(policy.requirements.generatedRules.verify, true);
    assert.equal(policy.requirements.rulesPass.verify, true);
    assert.equal(policy.requirements.specCoverage.verify, true);
    assert.equal(policy.allowWarnOnDone.rules, true);
    assert.equal(policy.allowWarnOnDone.coverage, true);
    assert.equal(policy.allowWarnOnDone.openspecStatus, false);
  });

  it('falls back on invalid scalar values with deterministic diagnostics', () => {
    const policy = resolveOpenSpecPolicy([
      'aifhub:',
      '  openspec:',
      '    validateOnVerify: maybe',
      '    requireCliForDone: 1',
      '    allowWarnOnDone:',
      '      coverage: sometimes',
      '      extra: true',
      '    unknownPolicy: true',
      ''
    ].join('\n'));

    assert.equal(policy.actions.validateOnVerify, true);
    assert.equal(policy.requirements.cli.done, true);
    assert.equal(policy.allowWarnOnDone.coverage, false);
    assert.deepEqual(
      policy.diagnostics.map((diagnostic) => diagnostic.code),
      [
        'openspec-policy-invalid-value',
        'openspec-policy-invalid-value',
        'openspec-policy-invalid-value',
        'openspec-policy-unknown-key',
        'openspec-policy-unknown-key'
      ]
    );
    assert.ok(policy.diagnostics.every((diagnostic) => diagnostic.severity === 'warning'));
  });

  it('reads config from disk and provides stable CLI output', async () => {
    const rootDir = await createTempRoot();
    await writeFixture(rootDir, '.ai-factory/config.yaml', [
      'aifhub:',
      '  artifactProtocol: openspec',
      '  openspec:',
      '    requireCliForPlan: true',
      '    allowWarnOnDone:',
      '      openspecStatus: false',
      ''
    ].join('\n'));

    const policy = await readOpenSpecPolicy({ rootDir });
    assert.equal(policy.requirements.cli.plan, true);
    assert.equal(policy.allowWarnOnDone.openspecStatus, false);

    const { stdout: jsonStdout } = await execFileAsync(process.execPath, [
      'scripts/openspec-policy.mjs',
      '--root',
      rootDir,
      '--json'
    ], {
      cwd: process.cwd()
    });
    const cliPolicy = JSON.parse(jsonStdout);
    assert.equal(cliPolicy.requirements.cli.plan, true);
    assert.equal(cliPolicy.allowWarnOnDone.openspecStatus, false);

    const { stdout: summaryStdout } = await execFileAsync(process.execPath, [
      'scripts/openspec-policy.mjs',
      '--root',
      rootDir,
      '--summary'
    ], {
      cwd: process.cwd()
    });
    assert.match(summaryStdout, /plan cli required/);
    assert.match(summaryStdout, /openspecStatus=blocked/);
    assert.equal(summarizeOpenSpecPolicy(policy).trim(), summaryStdout.trim());
  });

  it('evaluates done warning policy by category', () => {
    const policy = resolveOpenSpecPolicy([
      'aifhub:',
      '  openspec:',
      '    allowWarnOnDone:',
      '      rules: true',
      '      coverage: false',
      '      openspecStatus: true',
      ''
    ].join('\n'));

    assert.equal(evaluateDoneWarningPolicy('rules', 'warn', policy).allowed, true);
    assert.equal(evaluateDoneWarningPolicy('coverage', 'warn', policy).allowed, false);
    assert.equal(evaluateDoneWarningPolicy('openspecStatus', 'warn', policy).allowed, true);
    assert.equal(evaluateDoneWarningPolicy('rules', 'fail', policy).allowed, false);
  });

  it('reads durable rules gate evidence from QA markdown', async () => {
    const rootDir = await createTempRoot();
    await writeFixture(rootDir, '.ai-factory/qa/add-oauth/rules.md', [
      '# Rules',
      '',
      renderGateResultBlock(createGateResult({
        gate: 'rules',
        status: 'warn',
        blockers: [],
        affectedFiles: [],
        suggestedNext: null
      })),
      ''
    ].join('\n'));

    const evidence = await readOpenSpecRulesGateEvidence('add-oauth', { rootDir });

    assert.equal(evidence.exists, true);
    assert.equal(evidence.status, 'warn');
    assert.equal(evidence.path, '.ai-factory/qa/add-oauth/rules.md');
    assert.equal(evidence.gateResult.result.gate, 'rules');
  });

  it('reports missing rules gate evidence with the expected target path', async () => {
    const rootDir = await createTempRoot();
    const evidence = await readOpenSpecRulesGateEvidence('add-oauth', { rootDir });

    assert.equal(evidence.exists, false);
    assert.equal(evidence.status, 'missing');
    assert.equal(evidence.errors[0].code, 'rules-gate-evidence-missing');
    assert.equal(evidence.errors[0].path, '.ai-factory/qa/add-oauth/rules.md');
  });
});
