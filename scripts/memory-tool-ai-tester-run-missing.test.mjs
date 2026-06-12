// memory-tool-ai-tester-run-missing.test.mjs - resumable missing-run planner contracts
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  buildRuntimeEnv,
  buildMissingRunPlan,
  scenarioPathForCase
} from './memory-tool-ai-tester-run-missing.mjs';

let tmpDir;

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(os.tmpdir(), 'memory-tool-ai-tester-run-missing-'));
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

describe('ai-tester missing-run planner', () => {
  it('skips traced rows, filters by skill/profile, and respects max run limit', () => {
    const matrixSummary = {
      cases: [
        makeCase('matrix-profile-01', 'aif-analyze', 'rg'),
        makeCase('matrix-profile-01', 'aif-analyze', 'codegraph'),
        makeCase('matrix-profile-02', 'aif-analyze', 'rg'),
        makeCase('matrix-profile-02', 'aif-analyze', 'codegraph'),
        makeCase('matrix-profile-01', 'aif-explore', 'rg')
      ]
    };
    const traceIndex = {
      latest_by_scenario: {
        [matrixSummary.cases[0].id]: { status: 'PASS' }
      }
    };
    const plan = buildMissingRunPlan({
      matrixSummary,
      traceIndex,
      scenarioDir: path.join('matrix', 'scenarios'),
      skills: ['aif-analyze'],
      profiles: ['matrix-profile-01', 'matrix-profile-02'],
      limit: 2
    });

    assert.equal(plan.total_missing_after_filters, 3);
    assert.equal(plan.items.length, 2);
    assert.deepEqual(plan.items.map((item) => item.case.id), [
      matrixSummary.cases[1].id,
      matrixSummary.cases[2].id
    ]);
  });

  it('maps rg baselines and tool runs to generated scenario filenames', () => {
    assert.equal(
      scenarioPathForCase({
        scenarioDir: path.join('matrix', 'scenarios'),
        matrixCase: makeCase('matrix-profile-01', 'aif-analyze', 'rg')
      }),
      path.join('matrix', 'scenarios', 'matrix-profile-01__aif-analyze__codegraph__architecture_or_impact_discovery__baseline_rg.yaml')
    );
    assert.equal(
      scenarioPathForCase({
        scenarioDir: path.join('matrix', 'scenarios'),
        matrixCase: makeCase('matrix-profile-01', 'aif-analyze', 'codegraph')
      }),
      path.join('matrix', 'scenarios', 'matrix-profile-01__aif-analyze__codegraph__architecture_or_impact_discovery.yaml')
    );
  });

  it('adds a Windows which shim for ai-tester Codex preflight', async () => {
    const env = await buildRuntimeEnv({ matrixDir: tmpDir });
    if (process.platform !== 'win32') {
      assert.equal(env.PATH, process.env.PATH);
      return;
    }

    const shimDir = path.join(tmpDir, '.runner-bin');
    assert.equal(env.PATH.startsWith(`${shimDir}${path.delimiter}`), true);
    assert.match(await readFile(path.join(shimDir, 'which.cmd'), 'utf8'), /where\.exe %\*/);
  });
});

function makeCase(profileId, skill, toolId) {
  const optionalToolId = 'codegraph';
  const suffix = toolId === 'rg' ? '__baseline_rg' : '__tool_run';
  return {
    id: `${profileId}__${skill}__${optionalToolId}__architecture_or_impact_discovery${suffix}`,
    skill,
    tool_id: toolId,
    optional_tool_id: optionalToolId,
    profile_id: profileId,
    task_scenario: 'architecture_or_impact_discovery'
  };
}
