// write-gate-evidence.test.mjs - tests for durable gate evidence persistence
import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';

import {
  parseWriteGateEvidenceArgs,
  runWriteGateEvidenceCommand,
  writeGateEvidence
} from './write-gate-evidence.mjs';
import {
  createGateResult,
  renderGateResultBlock
} from './aif-gate-result.mjs';

const tempRoots = [];

async function createTempRoot() {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'aifhub-gate-evidence-'));
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

function evidencePath(rootDir, changeId, gate) {
  return path.join(rootDir, '.ai-factory', 'qa', changeId, `${gate}.md`);
}

function gateMarkdown(gate, status = 'pass') {
  return [
    `# ${gate} gate`,
    '',
    renderGateResultBlock(createGateResult({
      gate,
      status,
      blockers: status === 'fail'
        ? [{
            id: `${gate}-failure`,
            severity: 'error',
            summary: `${gate} failed.`,
            ...(gate === 'rules'
              ? {
                  source: {
                    path: 'openspec/changes/add-oauth-login/specs/auth/spec.md',
                    requirement: 'Rules gate evidence'
                  }
                }
              : {})
          }]
        : [],
      affectedFiles: [],
      suggestedNext: status === 'fail'
        ? { command: gate === 'rules' ? '/aif-rules-check' : '/aif-fix', reason: `${gate} failed.` }
        : null
    })),
    ''
  ].join('\n');
}

async function captureCommand(argv, options = {}) {
  const stdout = [];
  const stderr = [];
  const originalStdoutWrite = process.stdout.write;
  const originalStderrWrite = process.stderr.write;

  process.stdout.write = (chunk, ...args) => {
    stdout.push(String(chunk));
    const callback = args.find((arg) => typeof arg === 'function');
    callback?.();
    return true;
  };
  process.stderr.write = (chunk, ...args) => {
    stderr.push(String(chunk));
    const callback = args.find((arg) => typeof arg === 'function');
    callback?.();
    return true;
  };

  try {
    const exitCode = await runWriteGateEvidenceCommand(argv, options);
    return {
      exitCode,
      stdout: stdout.join(''),
      stderr: stderr.join('')
    };
  } finally {
    process.stdout.write = originalStdoutWrite;
    process.stderr.write = originalStderrWrite;
  }
}

afterEach(async () => {
  while (tempRoots.length > 0) {
    await rm(tempRoots.pop(), { recursive: true, force: true });
  }
});

describe('write-gate-evidence helper', () => {
  it('exports the required public functions and parses supported arguments', () => {
    assert.equal(typeof parseWriteGateEvidenceArgs, 'function');
    assert.equal(typeof writeGateEvidence, 'function');
    assert.equal(typeof runWriteGateEvidenceCommand, 'function');

    assert.deepEqual(parseWriteGateEvidenceArgs([
      '--change', 'add-oauth-login',
      '--gate', 'rules',
      '--from', 'gate.md',
      '--json',
      '--force'
    ]), {
      ok: true,
      changeId: 'add-oauth-login',
      gate: 'rules',
      from: 'gate.md',
      json: true,
      force: true,
      help: false,
      errors: []
    });
  });

  it('writes valid rules gate markdown to the durable QA path', async () => {
    const rootDir = await createTempRoot();
    const markdown = gateMarkdown('rules');

    const result = await writeGateEvidence({
      rootDir,
      changeId: 'add-oauth-login',
      gate: 'rules',
      markdown
    });

    assert.equal(result.ok, true);
    assert.equal(result.path, '.ai-factory/qa/add-oauth-login/rules.md');
    assert.equal(result.status, 'pass');
    assert.equal(await readFile(evidencePath(rootDir, 'add-oauth-login', 'rules'), 'utf8'), markdown);
  });

  it('rejects missing, invalid, and wrong-gate evidence before creating files', async () => {
    const rootDir = await createTempRoot();

    for (const [label, markdown] of [
      ['missing', '# Rules\n\nNo machine-readable gate.\n'],
      ['invalid', ['```aif-gate-result', '{"schema_version":1,"gate":"rules"', '```'].join('\n')],
      ['wrong gate', gateMarkdown('review')]
    ]) {
      const result = await writeGateEvidence({
        rootDir,
        changeId: `reject-${label.replace(/\s+/g, '-')}`,
        gate: 'rules',
        markdown
      });

      assert.equal(result.ok, false, `${label} evidence should be rejected`);
      assert.equal(await pathExists(evidencePath(rootDir, `reject-${label.replace(/\s+/g, '-')}`, 'rules')), false);
    }
  });

  it('refuses unsafe change ids before filesystem writes', async () => {
    const rootDir = await createTempRoot();

    for (const changeId of ['../escape', 'nested/change', 'nested\\change', '/absolute', 'safe..unsafe']) {
      const result = await writeGateEvidence({
        rootDir,
        changeId,
        gate: 'rules',
        markdown: gateMarkdown('rules')
      });

      assert.equal(result.ok, false, `${changeId} should be rejected`);
    }

    assert.equal(await pathExists(path.join(rootDir, '.ai-factory')), false);
  });

  it('supports review, security, rules, and verify evidence files', async () => {
    const rootDir = await createTempRoot();

    for (const gate of ['review', 'security', 'rules', 'verify']) {
      const result = await writeGateEvidence({
        rootDir,
        changeId: 'add-oauth-login',
        gate,
        markdown: gateMarkdown(gate)
      });

      assert.equal(result.ok, true, `${gate} should be written`);
      assert.equal(result.path, `.ai-factory/qa/add-oauth-login/${gate}.md`);
      assert.equal(await pathExists(evidencePath(rootDir, 'add-oauth-login', gate)), true);
    }
  });

  it('reads markdown from --from files and stdin CLI input', async () => {
    const fromRoot = await createTempRoot();
    await writeFixture(fromRoot, 'tmp/rules-output.md', gateMarkdown('rules'));

    const fromResult = await writeGateEvidence({
      rootDir: fromRoot,
      changeId: 'from-file',
      gate: 'rules',
      from: 'tmp/rules-output.md'
    });
    assert.equal(fromResult.ok, true);
    assert.equal(await pathExists(evidencePath(fromRoot, 'from-file', 'rules')), true);

    const stdinRoot = await createTempRoot();
    const captured = await captureCommand([
      '--change', 'from-stdin',
      '--gate', 'rules',
      '--json'
    ], {
      rootDir: stdinRoot,
      stdin: Readable.from([gateMarkdown('rules')])
    });

    assert.equal(captured.exitCode, 0);
    assert.equal(captured.stderr, '');
    assert.equal(JSON.parse(captured.stdout).path, '.ai-factory/qa/from-stdin/rules.md');
    assert.equal(await pathExists(evidencePath(stdinRoot, 'from-stdin', 'rules')), true);
  });

  it('does not fall back when the latest matching gate block is invalid', async () => {
    const rootDir = await createTempRoot();
    const markdown = [
      gateMarkdown('rules'),
      '```aif-gate-result',
      '{"schema_version":1,"gate":"rules"',
      '```'
    ].join('\n');

    const result = await writeGateEvidence({
      rootDir,
      changeId: 'invalid-latest',
      gate: 'rules',
      markdown
    });

    assert.equal(result.ok, false);
    assert.equal(result.errors[0].code, 'invalid-gate-evidence');
    assert.equal(await pathExists(evidencePath(rootDir, 'invalid-latest', 'rules')), false);
  });

  it('protects existing evidence unless --force is provided and validates forced replacements first', async () => {
    const rootDir = await createTempRoot();
    const original = gateMarkdown('rules', 'pass');
    const replacement = gateMarkdown('rules', 'warn');

    assert.equal((await writeGateEvidence({
      rootDir,
      changeId: 'overwrite',
      gate: 'rules',
      markdown: original
    })).ok, true);

    const refused = await writeGateEvidence({
      rootDir,
      changeId: 'overwrite',
      gate: 'rules',
      markdown: replacement
    });
    assert.equal(refused.ok, false);
    assert.equal(refused.errors[0].code, 'evidence-exists');
    assert.equal(await readFile(evidencePath(rootDir, 'overwrite', 'rules'), 'utf8'), original);

    const invalidForced = await writeGateEvidence({
      rootDir,
      changeId: 'overwrite',
      gate: 'rules',
      force: true,
      markdown: '# invalid replacement\n'
    });
    assert.equal(invalidForced.ok, false);
    assert.equal(await readFile(evidencePath(rootDir, 'overwrite', 'rules'), 'utf8'), original);

    const forced = await writeGateEvidence({
      rootDir,
      changeId: 'overwrite',
      gate: 'rules',
      force: true,
      markdown: replacement
    });
    assert.equal(forced.ok, true);
    assert.equal(forced.status, 'warn');
    assert.equal(await readFile(evidencePath(rootDir, 'overwrite', 'rules'), 'utf8'), replacement);
  });

  it('returns deterministic CLI exit codes for success, invalid args, invalid evidence, and overwrite refusal', async () => {
    const rootDir = await createTempRoot();
    const success = await captureCommand([
      '--change', 'cli-success',
      '--gate', 'rules'
    ], {
      rootDir,
      stdin: Readable.from([gateMarkdown('rules')])
    });
    assert.equal(success.exitCode, 0);
    assert.match(success.stdout, /Wrote rules gate evidence to \.ai-factory\/qa\/cli-success\/rules\.md/);

    const invalidArgs = await captureCommand(['--change', 'cli-bad', '--gate', 'unknown'], {
      rootDir,
      stdin: Readable.from([gateMarkdown('rules')])
    });
    assert.equal(invalidArgs.exitCode, 2);
    assert.match(invalidArgs.stderr, /Invalid --gate/);

    const invalidEvidence = await captureCommand(['--change', 'cli-invalid', '--gate', 'rules'], {
      rootDir,
      stdin: Readable.from(['# no gate\n'])
    });
    assert.equal(invalidEvidence.exitCode, 2);
    assert.match(invalidEvidence.stderr, /No valid aif-gate-result block/);

    const overwriteRefused = await captureCommand(['--change', 'cli-success', '--gate', 'rules'], {
      rootDir,
      stdin: Readable.from([gateMarkdown('rules')])
    });
    assert.equal(overwriteRefused.exitCode, 2);
    assert.match(overwriteRefused.stderr, /already exists/);
  });
});
