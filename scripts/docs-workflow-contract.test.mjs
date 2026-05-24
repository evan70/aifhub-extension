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
  let inFence = false;

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    if (lines[index].trim().startsWith('```')) {
      inFence = !inFence;
      continue;
    }

    if (inFence) {
      continue;
    }

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

  it('documents milestone-aware roadmap phase audits', async () => {
    const usage = await readRepoFile('docs/usage.md');
    const contextPolicy = await readRepoFile('docs/context-loading-policy.md');
    const usageRoadmap = extractSection(usage, '### `/aif-roadmap`');
    const contextRoadmap = extractSection(contextPolicy, '## GitHub-Aware Roadmap Context');

    for (const [label, section] of [
      ['docs/usage.md /aif-roadmap', usageRoadmap],
      ['docs/context-loading-policy.md GitHub-Aware Roadmap Context', contextRoadmap]
    ]) {
      for (const expected of [
        'milestones as roadmap phases',
        'Closed milestones produce phase audit sections',
        'local evidence status',
        'open_issues = 0',
        'phase-completion drift',
        'unphased backlog/drift',
        'supporting evidence only'
      ]) {
        assertIncludes(section, expected, label);
      }
    }
  });

  it('documents commit roadmap freshness as read-only handoff context', async () => {
    const usage = await readRepoFile('docs/usage.md');
    const contextPolicy = await readRepoFile('docs/context-loading-policy.md');
    const usageCommit = extractSection(usage, '### `/aif-commit`');
    const commandOwnership = extractSection(contextPolicy, '## Command Ownership');
    const qualityTail = extractSection(contextPolicy, '## Quality Gates and Finalization Tail');

    for (const expected of [
      'configured roadmap artifact',
      'optional GitHub issue, PR, milestone',
      'read-only roadmap/GitHub freshness gate',
      '/aif-roadmap',
      'still writes only the git commit after user confirmation',
      '.ai-factory/ROADMAP.md',
      'GitHub issues, milestones, PRs, labels, or linked branches',
      'Generic `## Commit Plan` grouping is parent-owned in AI Factory 2.13+.',
      'AIFHub must not duplicate this grouping logic',
      '`/aif-commit` remains the only commit owner',
      'openspec/changes/<change-id>/tasks.md',
      'Follow Commit Plan',
      'Commit everything together',
      'Adjust grouping',
      'If no active change/plan resolves, keep upstream staged-diff behavior.'
    ]) {
      assertIncludes(usageCommit, expected, 'docs/usage.md /aif-commit');
    }

    assertIncludes(commandOwnership, '| `/aif-commit` | no | git commit only |', 'docs/context-loading-policy.md Command Ownership');

    for (const expected of [
      'the configured roadmap artifact',
      'optional GitHub issue/PR/milestone freshness context',
      'must not mutate OpenSpec lifecycle artifacts, `.ai-factory/ROADMAP.md`, runtime state, QA evidence, generated rules, or GitHub objects manually',
      '/aif-roadmap',
      'still writes only the git commit after user confirmation',
      'Generic `## Commit Plan` grouping is parent-owned in AI Factory 2.13+.',
      'AIFHub adds only roadmap/GitHub freshness findings before the commit proposal.'
    ]) {
      assertIncludes(qualityTail, expected, 'docs/context-loading-policy.md Quality Gates and Finalization Tail');
    }
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
      assertIncludes(source, 'ai-factory aifhub-write-gate-evidence --change add-oauth-login --gate rules', label);
      assertIncludes(source, '--from /tmp/aif-rules-check-output.md', label);
      assertIncludes(source, 'final `aif-gate-result` block', label);
    }
  });

  it('documents installed-project helper execution through AIFHub wrappers', async () => {
    const validation = await readRepoFile('docs/openspec-validation.md');
    const handoffProfile = await readRepoFile('docs/handoff-validation-profile.md');

    for (const expected of [
      'ai-factory aifhub-validate-artifacts --change <change-id> --json',
      'ai-factory aifhub-validate-artifacts --change <change-id> --require-verification-evidence --json'
    ]) {
      assertIncludes(validation, expected, 'docs/openspec-validation.md');
    }

    assertIncludes(
      handoffProfile,
      'ai-factory aifhub-handoff-gate-summary --change <change-id> --stage review --json',
      'docs/handoff-validation-profile.md'
    );

    for (const [label, source] of [
      ['docs/openspec-validation.md', validation],
      ['docs/handoff-validation-profile.md', handoffProfile]
    ]) {
      assert.doesNotMatch(
        source,
        /\bnode\s+scripts\/[A-Za-z0-9_.-]+\.mjs\b/,
        `${label} should not expose root scripts as installed-project helper commands`
      );
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

  it('documents the AI Factory 2.13.2 baseline, distillation utility, and Codex runtime split', async () => {
    const metadata = JSON.parse(await readRepoFile('aifhub-extension.json'));
    const readme = await readRepoFile('README.md');
    const usage = await readRepoFile('docs/usage.md');
    const compatibility = await readRepoFile('docs/openspec-compatibility.md');
    const docsIndex = await readRepoFile('docs/README.md');
    const contextPolicy = await readRepoFile('docs/context-loading-policy.md');
    const codexAgents = await readRepoFile('docs/codex-agents.md');
    const combinedDocs = [readme, usage, compatibility, docsIndex, contextPolicy].join('\n');

    assert.equal(metadata.compat['ai-factory'], '>=2.11.0 <3.0.0');
    assert.equal(metadata.sources['ai-factory'].version, '2.13.2');
    assert.equal(metadata.sources['ai-factory'].baselineVersion, '2.13.2');
    assert.equal(metadata.sources['ai-factory'].lastSync, '2026-05-24');
    assertIncludes(metadata.sources['ai-factory'].notes, 'AI Factory 2.13.x', 'aifhub-extension.json');
    assertIncludes(metadata.sources['ai-factory'].notes, 'Commit Plan grouping', 'aifhub-extension.json');
    assertIncludes(metadata.sources['ai-factory'].notes, '/aif-distillation', 'aifhub-extension.json');
    assertIncludes(metadata.sources['ai-factory'].notes, 'Agent Skills', 'aifhub-extension.json');

    assertIncludes(
      compatibility,
      'AI Factory 2.12+ provides an optional read-only artifact audit command',
      'docs/openspec-compatibility.md'
    );
    for (const expected of [
      'AI Factory 2.13+',
      '/aif-distillation',
      'upstream utility skill',
      'books, docs, folders, or URLs',
      'reusable Agent Skills',
      'not an AIFHub lifecycle stage',
      'does not create OpenSpec changes',
      'openspec/changes/**',
      'openspec/specs/**',
      '.ai-factory/qa/**',
      '.ai-factory/rules/generated/**',
      'current agent skills directory',
      '/aif-distillation docs/memory-tools-research --name aifhub-memory-tool-selection',
      '/aif-distillation docs/context-providers.md --name aifhub-context-providers'
    ]) {
      assertIncludes(combinedDocs, expected, '2.13.2 docs sync');
    }
    for (const forbiddenClaim of [
      '`/aif-done` creates commits',
      '`/aif-done` creates git commits',
      '`/aif-done` writes commits',
      '`/aif-done` writes git commits',
      '/aif-done creates commits',
      '/aif-done writes commits'
    ]) {
      assertNotIncludes(combinedDocs, forbiddenClaim, 'docs must not claim /aif-done creates commits');
    }

    assertIncludes(readme, 'Codex CLI and Claude agent files', 'README.md');
    assertIncludes(readme, 'Namespaced Codex CLI agent files', 'README.md');

    for (const expected of [
      'Codex CLI (`codex`)',
      '.codex/skills',
      '.codex/agents',
      'runtime: "codex"',
      'Codex app (`codex-app`)',
      '.agents/skills',
      'no extension `agentFiles` target yet',
      '.codex/config.toml',
      '$aif-*',
      'The extension `agentFiles` cannot target `codex-app` yet',
      'extension helpers',
      'not replacements for upstream bundled Codex CLI agents',
      'plan-coordinator',
      'implement-coordinator',
      'review-sidecar'
    ]) {
      assertIncludes(codexAgents, expected, 'docs/codex-agents.md');
    }
  });

  it('documents Codex app flows with skill invocations and keeps slash commands runtime-specific', async () => {
    const usage = await readRepoFile('docs/usage.md');
    const planMode = await readRepoFile('docs/codex-plan-mode.md');
    const usageCodexFlow = extractSection(usage, '## Recommended Codex App Flow');
    const planModeCodexFlow = extractSection(planMode, '## Recommended Codex App Flow');

    for (const expected of [
      '$aif-explore "task description"',
      '$aif-plan full "task description"',
      '$aif-improve <change-id>',
      '$aif-mode sync --change <change-id>',
      '$aif-implement <change-id>',
      '$aif-rules-check',
      '$aif-verify <change-id>',
      '$aif-done <change-id>',
      '$aif-mode sync',
      '$aif-commit'
    ]) {
      assertIncludes(usageCodexFlow, expected, 'docs/usage.md Recommended Codex App Flow');
    }

    for (const stale of [
      '/aif-explore "task description"',
      '/aif-plan full "task description"',
      '/aif-improve <change-id>',
      '/aif-mode sync --change <change-id>',
      '/aif-implement <change-id>',
      '/aif-verify <change-id>'
    ]) {
      assertNotIncludes(usageCodexFlow, stale, 'docs/usage.md Recommended Codex App Flow');
    }

    for (const expected of [
      '/plan-mode',
      '$aif-explore "task description"',
      '$aif-plan full "task description"',
      '$aif-improve',
      '$aif-implement',
      '$aif-verify',
      'client-owned mode command',
      'AI Factory skills use `$aif-*`',
      'slash-command runtimes keep `/aif-*`'
    ]) {
      assertIncludes(planModeCodexFlow, expected, 'docs/codex-plan-mode.md Recommended Codex App Flow');
    }

    for (const stale of [
      '/aif-explore "task description"',
      '/aif-plan full "task description"',
      '/aif-implement',
      '/aif-verify'
    ]) {
      assertNotIncludes(planModeCodexFlow, stale, 'docs/codex-plan-mode.md Recommended Codex App Flow');
    }
  });

  it('documents OpenSpec plan IDs and optional audit-artifacts bridge', async () => {
    const compatibility = await readRepoFile('docs/openspec-compatibility.md');
    const aifMode = await readRepoFile('skills/aif-mode/SKILL.md');

    for (const expected of [
      'OpenSpec-native mode uses OpenSpec `change-id` values and ignores AI Factory `workflow.plan_id_format`',
      'Legacy AI Factory-only mode follows upstream `workflow.plan_id_format`',
      'ai-factory audit-artifacts openspec .ai-factory/qa .ai-factory/state --json',
      'optional read-only artifact audit command',
      'diagnostic-only',
      'not mandatory, not archive-blocking'
    ]) {
      assertIncludes(compatibility, expected, 'docs/openspec-compatibility.md');
    }

    for (const expected of [
      'selected `codex-app` runtime uses `$aif-mode`',
      'slash-command runtimes use `/aif-mode`',
      'Read-only diagnostics',
      'ai-factory audit-artifacts openspec .ai-factory/qa .ai-factory/state --json',
      'optional',
      'not mandatory',
      'not archive-blocking',
      'hard dependency'
    ]) {
      assertIncludes(aifMode, expected, 'skills/aif-mode/SKILL.md');
    }
  });
});
