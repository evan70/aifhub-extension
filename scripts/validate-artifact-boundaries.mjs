#!/usr/bin/env node
// validate-artifact-boundaries.mjs - prevents extension repo runtime artifacts from being tracked
// Exit 0 = pass, 1 = fail

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';

const execFileAsync = promisify(execFile);

export const forbiddenPrefixes = [
  'openspec/',
  '.ai-factory/state/',
  '.ai-factory/qa/',
  '.ai-factory/plans/',
  '.ai-factory/rules/generated/'
];

export const allowedPrefixes = [
  'test/fixtures/',
  'scripts/fixtures/'
];

function normalizeGitPath(file) {
  return file.replace(/\\/g, '/').replace(/^\.\//, '');
}

export function findArtifactBoundaryViolations(files) {
  return files
    .map(normalizeGitPath)
    .filter((file) =>
      forbiddenPrefixes.some((prefix) => file.startsWith(prefix)) &&
      !allowedPrefixes.some((prefix) => file.startsWith(prefix))
    );
}

export async function validateArtifactBoundaries({ cwd = process.cwd() } = {}) {
  const { stdout } = await execFileAsync('git', ['ls-files'], { cwd });
  const files = stdout.split(/\r?\n/).filter(Boolean);
  const violations = findArtifactBoundaryViolations(files);

  if (violations.length > 0) {
    console.error('Forbidden root project/runtime artifacts are tracked:');
    for (const file of violations) {
      console.error(`- ${file}`);
    }
    return 1;
  }

  console.log('Artifact boundary check passed.');
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(await validateArtifactBoundaries());
}
