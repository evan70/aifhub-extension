// docs-workflow-contract.test.mjs - docs coverage for the complete OpenSpec workflow tail
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

async function readRepoFile(relativePath) {
  return readFile(join(REPO_ROOT, relativePath), 'utf8');
}

function assertIncludes(source, expected, label) {
  assert.ok(source.includes(expected), `${label} should include ${JSON.stringify(expected)}`);
}

function assertNotIncludes(source, unexpected, label) {
  assert.ok(!source.includes(unexpected), `${label} should not include ${JSON.stringify(unexpected)}`);
}

function assertOrder(source, orderedFragments, label) {
  let cursor = -1;

  for (const fragment of orderedFragments) {
    const index = source.indexOf(fragment, cursor + 1);
    assert.notEqual(index, -1, `${label} should include ${JSON.stringify(fragment)} after index ${cursor}`);
    assert.ok(index > cursor, `${label} should order ${JSON.stringify(fragment)} after previous fragment`);
    cursor = index;
  }
}

function extractSection(markdown, heading) {
  const lines = markdown.split(/\r?\n/);
  const startIndex = lines.findIndex((line) => line.trim() === heading);
  assert.notEqual(startIndex, -1, `Expected heading ${heading}`);
  const level = heading.match(/^#+/)?.[0].length ?? 1;
  let endIndex = lines.length;

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const match = lines[index].match(/^(#{1,6})\s+/);
    if (match && match[1].length <= level) {
      endIndex = index;
      break;
    }
  }

  return lines.slice(startIndex, endIndex).join('\n');
}

describe('complete OpenSpec workflow documentation contract', () => {
  it('documents the complete quick-start tail in README.md in workflow order', async () => {
    const readme = await readRepoFile('README.md');
    const quickStart = extractSection(readme, '## Quick Start');

    for (const expected of [
      '/aif-mode sync --change add-oauth-login',
      '/aif-rules-check',
      '/aif-review',
      '/aif-security-checklist',
      '/aif-verify add-oauth-login',
      '/aif-done add-oauth-login',
      '/aif-mode sync',
      '/aif-commit',
      '/aif-evolve'
    ]) {
      assertIncludes(quickStart, expected, 'README.md Quick Start');
    }

    assertOrder(quickStart, [
      '/aif-plan full "add OAuth login"',
      '/aif-improve add-oauth-login',
      '/aif-mode sync --change add-oauth-login',
      '/aif-implement add-oauth-login',
      '/aif-rules-check',
      '/aif-verify add-oauth-login',
      '/aif-done add-oauth-login',
      '/aif-mode sync',
      '/aif-commit',
      '/aif-evolve'
    ], 'README.md Quick Start');

    assertIncludes(quickStart, '/aif-done` finalizes the OpenSpec lifecycle', 'README.md Quick Start');
    assertIncludes(quickStart, 'It does not replace `/aif-commit`', 'README.md Quick Start');
    assertIncludes(quickStart, 'Validation gates:', 'README.md Quick Start');
    assertIncludes(quickStart, 'Optional before verify in relaxed/manual workflow.', 'README.md Quick Start');
    assertIncludes(quickStart, 'Required before `/aif-done` when done policy requires durable gate evidence.', 'README.md Quick Start');
    assertIncludes(quickStart, 'Core AI Factory workflow:', 'README.md Quick Start');
    assertIncludes(quickStart, 'OpenSpec validation overlay:', 'README.md Quick Start');
    assertNotIncludes(quickStart, 'Optional gates:', 'README.md Quick Start');
  });

  it('documents the complete manual workflow in docs/usage.md in workflow order', async () => {
    const usage = await readRepoFile('docs/usage.md');

    for (const expected of [
      '/aif-mode sync --change <change-id>',
      '/aif-rules-check',
      '/aif-review',
      '/aif-security-checklist',
      '/aif-verify <change-id>',
      '/aif-done <change-id>',
      '/aif-mode sync',
      '/aif-commit',
      '/aif-evolve',
      'required',
      'recommended',
      'optional'
    ]) {
      assertIncludes(usage, expected, 'docs/usage.md');
    }

    assertOrder(usage, [
      '/aif-plan full "<request>"',
      '/aif-implement <change-id>',
      '/aif-verify <change-id>',
      '/aif-done <change-id>',
      '/aif-mode sync',
      '/aif-commit',
      '/aif-evolve'
    ], 'docs/usage.md workflow');
  });

  it('documents durable rules gate evidence persistence for strict done readiness', async () => {
    const usage = await readRepoFile('docs/usage.md');
    const validation = await readRepoFile('docs/openspec-validation.md');

    for (const [label, source] of [
      ['docs/usage.md', usage],
      ['docs/openspec-validation.md', validation]
    ]) {
      assertIncludes(source, 'requireRulesPassForDone', label);
      assertIncludes(source, '.ai-factory/qa/<change-id>/rules.md', label);
      assertIncludes(source, 'node scripts/write-gate-evidence.mjs --change add-oauth-login --gate rules', label);
      assertIncludes(source, '--from /tmp/aif-rules-check-output.md', label);
      assertIncludes(source, 'final `aif-gate-result` block', label);
    }
  });

  it('documents planned bug fixes separately from post-verify fixes', async () => {
    const readme = await readRepoFile('README.md');
    const usage = await readRepoFile('docs/usage.md');
    const contextPolicy = await readRepoFile('docs/context-loading-policy.md');
    const readmeBugFixes = extractSection(readme, '## Bug Fix Workflows');
    const usageBugFixes = extractSection(usage, '## Bug Fix Workflows');
    const contextBugFixes = extractSection(contextPolicy, '## Bug Fix Context');

    for (const [label, section] of [
      ['README.md Bug Fix Workflows', readmeBugFixes],
      ['docs/usage.md Bug Fix Workflows', usageBugFixes]
    ]) {
      for (const expected of [
        '/aif-plan full "fix <bug description>"',
        '/aif-improve <change-id>',
        '/aif-mode sync --change <change-id>',
        '/aif-implement <change-id>',
        '/aif-rules-check',
        '/aif-verify <change-id>',
        '/aif-done <change-id>',
        '/aif-mode sync',
        '/aif-commit',
        '/aif-verify <change-id> -> fail',
        '/aif-fix <change-id>',
        'A bug fix is still an OpenSpec change when it changes product or workflow behavior.',
        'Create delta specs when behavior changes.',
        'Docs/tooling-only bug fixes may omit delta specs only when the proposal explains why no product or workflow behavior changes.',
        'Missing OpenSpec CLI means degraded validation, not planning failure.',
        '`/aif-fix` requires existing QA evidence or selected findings.',
        '`/aif-fix` does not create a new OpenSpec change.',
        '`.ai-factory/state/<change-id>/fixes/`',
        '`/aif-fix` does not write QA verdicts.',
        '`/aif-fix` does not archive.',
        '`/aif-fix` routes back to `/aif-verify <change-id>`.',
        'No OpenSpec-native bug-fix path creates `.ai-factory/plans/<id>/`.'
      ]) {
        assertIncludes(section, expected, label);
      }
    }

    for (const expected of [
      'New bug reports are planning input.',
      'Post-verify fixes are execution input.',
      'Fresh bug reports must start with `/aif-plan full "fix <bug description>"`.',
      '`/aif-fix` must not create a canonical OpenSpec change',
      '`/aif-fix` must not create `.ai-factory/plans/<id>/`'
    ]) {
      assertIncludes(contextBugFixes, expected, 'docs/context-loading-policy.md Bug Fix Context');
    }

    assertNotIncludes(readmeBugFixes, '.ai-factory/plans/<id>/task.md', 'README.md Bug Fix Workflows');
    assertNotIncludes(usageBugFixes, '.ai-factory/plans/<id>/task.md', 'docs/usage.md Bug Fix Workflows');
  });
});
