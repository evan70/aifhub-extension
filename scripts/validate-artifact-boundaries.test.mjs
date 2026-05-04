// validate-artifact-boundaries.test.mjs - tests for root artifact boundary validator
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { findArtifactBoundaryViolations } from './validate-artifact-boundaries.mjs';

describe('findArtifactBoundaryViolations', () => {
  it('fails root OpenSpec and AI Factory runtime artifacts', () => {
    const violations = findArtifactBoundaryViolations([
      'openspec/specs/foo/spec.md',
      '.ai-factory/rules/generated/openspec-base.md',
      '.ai-factory/state/foo/trace.md',
      '.ai-factory/qa/foo/verify.md',
      '.ai-factory/plans/foo/task.md'
    ]);

    assert.deepEqual(violations, [
      'openspec/specs/foo/spec.md',
      '.ai-factory/rules/generated/openspec-base.md',
      '.ai-factory/state/foo/trace.md',
      '.ai-factory/qa/foo/verify.md',
      '.ai-factory/plans/foo/task.md'
    ]);
  });

  it('allows OpenSpec-like artifacts under fixtures', () => {
    const violations = findArtifactBoundaryViolations([
      'test/fixtures/openspec-native/openspec/specs/foo/spec.md',
      'test/fixtures/generated-rules/openspec-base.md',
      'scripts/fixtures/openspec/specs/foo/spec.md'
    ]);

    assert.deepEqual(violations, []);
  });

  it('allows extension source, docs, and runtime definitions', () => {
    const violations = findArtifactBoundaryViolations([
      'skills/aif-mode/SKILL.md',
      'injections/core/aif-plan-plan-folder.md',
      'agent-files/codex/aifhub-verifier.toml',
      'docs/usage.md'
    ]);

    assert.deepEqual(violations, []);
  });

  it('normalizes Windows path separators before checking', () => {
    const violations = findArtifactBoundaryViolations([
      'openspec\\specs\\foo\\spec.md',
      'test\\fixtures\\openspec-native\\openspec\\specs\\foo\\spec.md'
    ]);

    assert.deepEqual(violations, [
      'openspec/specs/foo/spec.md'
    ]);
  });
});
