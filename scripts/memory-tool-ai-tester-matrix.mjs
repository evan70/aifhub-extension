#!/usr/bin/env node
// memory-tool-ai-tester-matrix.mjs - paired rg baseline + optional-tool ai-tester matrix generator
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import {
  assertWithinDirectory,
  discoverProjectRoots,
  getToolPlan,
  hasSensitivePathLeak,
  prepareSanitizedCopy
} from './memory-tool-field-run.mjs';
import {
  classifyProjectProfile,
  loadRecommendationMetadata
} from './memory-tool-recommender.mjs';

export const AI_TESTER_MATRIX_SCHEMA = 'aifhub.memory_tools.ai_tester_matrix.v1';
export const DEFAULT_MATRIX_SIZE = 'screening';

const DEFAULT_SKILLS = [
  'aif-analyze',
  'aif-explore',
  'aif-plan',
  'aif-review',
  'aif-rules-check',
  'aif-implement',
  'aif-fix',
  'aif-verify',
  'aif-done',
  'aif-commit'
];
const ALL_AIF_SKILLS = [
  'aif',
  'aif-analyze',
  'aif-architecture',
  'aif-best-practices',
  'aif-build-automation',
  'aif-ci',
  'aif-commit',
  'aif-dockerize',
  'aif-docs',
  'aif-done',
  'aif-evolve',
  'aif-explore',
  'aif-fix',
  'aif-grounded',
  'aif-implement',
  'aif-improve',
  'aif-init',
  'aif-loop',
  'aif-mode',
  'aif-plan',
  'aif-qa',
  'aif-reference',
  'aif-review',
  'aif-roadmap',
  'aif-rules',
  'aif-rules-check',
  'aif-security-checklist',
  'aif-skill-generator',
  'aif-verify'
];
const DEFAULT_SKILL_GROUPS = [
  {
    id: 'bootstrap_analysis',
    representatives: ['aif-analyze'],
    members: ['aif', 'aif-init', 'aif-analyze', 'aif-mode'],
    rationale: 'project classification, metadata, and setup-oriented repository reading'
  },
  {
    id: 'research_architecture',
    representatives: ['aif-explore'],
    members: ['aif-explore', 'aif-architecture', 'aif-grounded'],
    rationale: 'broad discovery and architecture/impact investigation'
  },
  {
    id: 'planning_refinement',
    representatives: ['aif-plan'],
    members: ['aif-plan', 'aif-improve', 'aif-roadmap', 'aif-loop'],
    rationale: 'planning and iterative refinement over gathered context'
  },
  {
    id: 'implementation_fix',
    representatives: ['aif-implement', 'aif-fix'],
    members: ['aif-implement', 'aif-fix'],
    rationale: 'source edits, bug fixes, and direct implementation workflows'
  },
  {
    id: 'review_quality_gates',
    representatives: ['aif-review', 'aif-rules-check', 'aif-verify'],
    members: ['aif-review', 'aif-qa', 'aif-rules-check', 'aif-security-checklist', 'aif-verify', 'aif-done'],
    rationale: 'review, rules, security, QA, and completion gates'
  },
  {
    id: 'generation_output',
    representatives: ['aif-docs'],
    members: ['aif-build-automation', 'aif-ci', 'aif-dockerize', 'aif-docs', 'aif-reference', 'aif-rules', 'aif-skill-generator'],
    rationale: 'generated files or documentation based on repository context'
  },
  {
    id: 'commit_finalization',
    representatives: ['aif-commit'],
    members: ['aif-commit'],
    rationale: 'diff summarization and commit message workflow'
  },
  {
    id: 'guidance_only',
    representatives: [],
    members: ['aif-best-practices', 'aif-evolve'],
    rationale: 'guidance/meta skills are excluded from screening; sample explicitly if needed'
  }
];
const MATRIX_SIZE_PRESETS = {
  screening: {
    skillSet: 'grouped',
    profileMode: 'stratified',
    maxProfiles: 15,
    taskSet: 'primary',
    purpose: 'Fast signal discovery across representative skill groups and project dimensions.'
  },
  'profile-sweep': {
    skillSet: 'high-signal',
    profileMode: 'all',
    maxProfiles: null,
    taskSet: 'primary',
    purpose: 'Check project/profile conditions after screening finds likely useful skill groups.'
  },
  'skill-sweep': {
    skillSet: 'all',
    profileMode: 'stratified',
    maxProfiles: 8,
    taskSet: 'primary',
    purpose: 'Check all AI Factory skills on a small stratified profile sample.'
  },
  full: {
    skillSet: 'metadata',
    profileMode: 'all',
    maxProfiles: null,
    taskSet: 'primary',
    purpose: 'Full current metadata skill matrix; use --skill-set all for exhaustive all-skill coverage.'
  }
};
const HIGH_SIGNAL_SKILLS = ['aif-explore', 'aif-plan', 'aif-review', 'aif-rules-check'];
const PRIMARY_TASK_SCENARIOS = ['architecture_or_impact_discovery'];
const DEFAULT_TASK_SCENARIOS = [
  'architecture_or_impact_discovery',
  'exact_file_or_symbol_lookup',
  'multirepo_surface_mapping',
  'resume_previous_work',
  'large_command_output_compression',
  'version_sensitive_library_docs',
  'manual_durable_notes'
];
const OPTIONAL_TOOLS = getToolPlan('safe')
  .map((tool) => tool.id)
  .filter((toolId) => toolId !== 'rg' && toolId !== 'git-gh');
const REPO_GRAPH_TOOLS = new Set(['codegraph', 'graphify']);
const PREINITIALIZABLE_TOOLS = new Set(['codegraph']);
const SELECTOR_COMMANDS = {
  installed: 'ai-factory aifhub-memory-tools select --from-project --command <skill> --json',
  'source-fallback': 'node scripts/memory-tool-recommender.mjs select --from-project --command <skill> --json'
};
const DEFAULT_CODEX_MODEL = 'gpt-5.4-mini';
const MATRIX_SYSTEM_PROMPT = [
  '# AIFHub Memory Tool Matrix',
  '',
  'You are evaluating optional memory and context tools for AIFHub skills.',
  '',
  'Rules:',
  '',
  '- Run `rg` first for the same project fixture and task scenario.',
  '- Follow each scenario prompt for selector behavior; direct tool_run scenarios measure forced tool usefulness separately from selector tests.',
  '- Treat optional provider output as supporting benchmark evidence only.',
  '- Do not auto-install tools, run setup, mutate provider config, register MCP servers, install hooks, or start daemons.',
  '- Do not read outside the copied project fixture.',
  '- Do not include raw source snippets, private paths, temp paths, secrets, or transcripts in final output.',
  '- If the selector forbids or omits a tool, do not call it.',
  '- If a tool creates an index, DB, or sidecar, perform the documented purge before completion.'
].join('\n');

export async function runMemoryToolAiTesterMatrix(args = [], options = {}) {
  const parsed = parseArgs(args);
  if (parsed.help) {
    return emitText(getCliUsage(), 0, options);
  }

  const cwd = path.resolve(options.cwd ?? process.cwd());
  const outDir = path.resolve(cwd, parsed.out ?? await mkdtemp(path.join(os.tmpdir(), 'aifhub-ai-tester-matrix-')));
  await mkdir(outDir, { recursive: true });

  const metadata = await loadRecommendationMetadata({
    metadataPath: parsed.metadata,
    cwd
  });
  const matrixStrategy = resolveMatrixStrategy({ parsed, metadata });
  const rootInputs = parsed.roots.length > 0 ? parsed.roots : [cwd];
  const profiles = await discoverMatrixProfiles(rootInputs, {
    maxProfiles: matrixStrategy.max_profiles,
    stratified: matrixStrategy.stratified,
    excludeRoots: parsed.excludeRoots
  });
  const copies = [];

  if (!parsed.dryRun) {
    for (const profile of profiles) {
      copies.push(await prepareSanitizedCopy({ profile, outDir }));
    }
  }

  const manifest = buildAiTesterMatrixManifest({
    metadata,
    profiles,
    skills: matrixStrategy.skills,
    tools: parsed.tools.length > 0 ? parsed.tools : OPTIONAL_TOOLS,
    taskScenarios: matrixStrategy.task_scenarios,
    preinitializeTools: parsed.preinitializeTools,
    selectorMode: parsed.selectorMode,
    model: parsed.model ?? DEFAULT_CODEX_MODEL,
    matrixStrategy,
    scenarioPrefix: parsed.scenarioPrefix
  });

  if (!parsed.dryRun) {
    await writeScenarioFiles({
      outDir,
      manifest,
      copies,
      selectorMode: parsed.selectorMode
    });
  }

  const summary = buildPublicMatrixSummary({
    manifest,
    rootInputs,
    excludedRootCount: parsed.excludeRoots.length,
    outDir,
    dryRun: parsed.dryRun
  });

  if (hasSensitivePathLeak(summary, rootInputs)) {
    throw new Error('Public ai-tester matrix summary contains a sensitive local path.');
  }

  if (parsed.writeJson) {
    const summaryPath = path.join(outDir, 'matrix-summary.json');
    assertWithinDirectory(outDir, summaryPath, 'matrix summary');
    await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  }

  return emit(summary, 0, options);
}

export async function discoverMatrixProfiles(rootInputs, options = {}) {
  const discovered = await discoverProjectRoots(rootInputs, {
    maxProfiles: options.stratified ? null : options.maxProfiles,
    excludeRoots: options.excludeRoots
  });
  const profiles = [];
  for (let index = 0; index < discovered.length; index += 1) {
    const source = discovered[index];
    const classified = await classifyProjectProfile(source.sourceRoot).catch(() => ({
      project_shape: source.shape,
      languages: [],
      volume: source.shape === 'small_microservice' ? 'mini' : 'standard',
      complexity: source.shape === 'small_microservice' ? 'mini' : 'framework',
      repo_shape: source.shape === 'multirepo' ? 'multirepo' : 'single_repo',
      artifact_mode: 'none'
    }));
    profiles.push({
      ...classified,
      id: `matrix-profile-${String(index + 1).padStart(2, '0')}`,
      project_label: buildProjectLabel(classified),
      tags: buildProjectTags(classified),
      sourceRoot: source.sourceRoot,
      source_kind: source.source_kind
    });
  }
  return options.stratified
    ? selectStratifiedProfiles(profiles, options.maxProfiles)
    : profiles;
}

export function selectStratifiedProfiles(profiles = [], maxProfiles = null) {
  const limit = Number.isFinite(maxProfiles) && maxProfiles >= 0 ? maxProfiles : profiles.length;
  if (limit === 0) return [];
  const selected = [];
  const selectedIds = new Set();
  const strata = [
    (profile) => profile.project_shape,
    (profile) => profile.repo_shape,
    (profile) => profile.complexity,
    (profile) => profile.volume,
    (profile) => asArray(profile.languages)[0]
  ];

  for (const stratum of strata) {
    const seen = new Set();
    for (const profile of profiles) {
      const value = stratum(profile);
      if (!value || seen.has(value) || selectedIds.has(profile.id)) continue;
      seen.add(value);
      selected.push(profile);
      selectedIds.add(profile.id);
      if (selected.length >= limit) return selected;
    }
  }

  for (const profile of profiles) {
    if (selectedIds.has(profile.id)) continue;
    selected.push(profile);
    if (selected.length >= limit) return selected;
  }

  return selected;
}

export function buildAiTesterMatrixManifest(options = {}) {
  const metadata = options.metadata ?? {};
  const profiles = asArray(options.profiles).map(sanitizeProfile);
  const skills = asArray(options.skills).length > 0 ? asArray(options.skills) : DEFAULT_SKILLS;
  const tools = asArray(options.tools).length > 0 ? asArray(options.tools) : OPTIONAL_TOOLS;
  const preinitializeTools = asArray(options.preinitializeTools).filter((tool) => PREINITIALIZABLE_TOOLS.has(tool));
  const taskScenarios = asArray(options.taskScenarios).length > 0
    ? asArray(options.taskScenarios)
    : DEFAULT_TASK_SCENARIOS;
  const selectorMode = normalizeSelectorMode(options.selectorMode);
  const scenarioPrefix = safeScenarioPrefix(options.scenarioPrefix);
  const cases = [];

  for (const profile of profiles) {
    for (const skill of skills) {
      for (const taskScenario of taskScenarios) {
        for (const toolId of tools.filter((tool) => tool !== 'rg')) {
          const pairIdBase = `${profile.id}__${skill}__${toolId}__${taskScenario}`;
          const pairId = scenarioPrefix ? `${scenarioPrefix}__${pairIdBase}` : pairIdBase;
          cases.push({
            id: `${pairId}__baseline_rg`,
            pair_id: pairId,
            suite: 'baseline',
            expectation: 'baseline_rg',
            skill,
            tool_id: 'rg',
            optional_tool_id: toolId,
            preinitialized_tool_ids: preinitializeTools.includes(toolId) ? [toolId] : [],
            profile_id: profile.id,
            task_scenario: taskScenario,
            selector_mode: selectorMode
          });
          const expectation = expectedToolBehavior({ metadata, profile, skill, toolId, taskScenario });
          cases.push({
            id: `${pairId}__tool_run`,
            pair_id: pairId,
            suite: suiteForExpectation(expectation, toolId),
            expectation,
            skill,
            tool_id: toolId,
            optional_tool_id: toolId,
            preinitialized_tool_ids: preinitializeTools.includes(toolId) ? [toolId] : [],
            profile_id: profile.id,
            task_scenario: taskScenario,
            selector_mode: selectorMode
          });
        }
      }
    }
  }

  return {
    schema: AI_TESTER_MATRIX_SCHEMA,
    generated_at: new Date().toISOString(),
    selector: {
      installed_wrapper: SELECTOR_COMMANDS.installed,
      source_repo_fallback: SELECTOR_COMMANDS['source-fallback'],
      selected_mode: selectorMode
    },
    runner: {
      runtime: 'codex',
      model: options.model ?? DEFAULT_CODEX_MODEL,
      permission_mode: 'bypassPermissions'
    },
    matrix_strategy: options.matrixStrategy ?? null,
    scenario_prefix: scenarioPrefix,
    skill_groups: sanitizeSkillGroups(defaultSkillGroups(metadata)),
    preinitialized_tools: preinitializeTools,
    suites: buildSuiteDefinitions(),
    profiles,
    cases
  };
}

export function renderAiTesterScenario(input = {}) {
  const selectorMode = normalizeSelectorMode(input.selector_mode);
  const fixturePath = input.fixture_path ?? '<sanitized-fixture>';
  const promptFile = input.system_prompt_file ?? '../system-prompt.md';
  const preinitializedToolIds = asArray(input.preinitialized_tool_ids);
  const isCodeGraphPreinitialized = preinitializedToolIds.includes('codegraph');
  const lines = [
    `scenario: ${input.id}`,
    `description: "suite=${input.suite ?? suiteForExpectation(input.expectation, input.tool_id)} expectation=${input.expectation}"`,
    `system_prompt_file: ${quoteYaml(promptFile)}`,
    'user_prompt: |',
    `  Run rg first for ${input.task_scenario ?? 'architecture_or_impact_discovery'} on the copied project fixture.`
  ];

  if (input.expectation === 'baseline_rg') {
    lines.push(
      '  This is the rg baseline scenario. Do not run selector or optional memory/context tools.',
      '  Include the phrase "rg baseline" in the final benchmark summary.'
    );
    if (isCodeGraphPreinitialized) {
      lines.push('  CodeGraph is preinitialized by setup_commands for parity, but this baseline must not call CodeGraph.');
    }
  } else {
    if (input.expectation === 'positive') {
      if (isCodeGraphPreinitialized && input.tool_id === 'codegraph') {
        lines.push(
          '  CodeGraph has already been initialized and indexed by setup_commands before this model turn.',
          '  Then use the existing CodeGraph index directly as the controlled optional tool_run for this benchmark pair.',
          '  Do not run codegraph init or codegraph index during the model turn.',
          '  Before completion, purge the setup index with codegraph uninit --force . or equivalent.',
          '  Include the phrase "tool_run" in the final benchmark summary.'
        );
      } else {
        lines.push(
          `  Then run ${input.tool_id} directly as the controlled optional tool_run for this benchmark pair.`,
          '  Include the phrase "tool_run" in the final benchmark summary.'
        );
      }
    } else if (input.expectation === 'overhead') {
      if (isCodeGraphPreinitialized && input.tool_id === 'codegraph') {
        lines.push(
          '  CodeGraph has already been initialized and indexed by setup_commands before this model turn.',
          `  This is a forced usefulness measurement: use the existing ${input.tool_id} index directly after rg even if rg is expected to be better.`,
          '  Do not run codegraph init or codegraph index during the model turn.',
          '  Before completion, purge the setup index with codegraph uninit --force . or equivalent.',
          '  Include the phrases "tool_run" and "overhead" in the final benchmark summary.'
        );
      } else {
        lines.push(
          `  This is a forced usefulness measurement: run ${input.tool_id} directly after rg even if rg is expected to be better.`,
          '  Include the phrases "tool_run" and "overhead" in the final benchmark summary.'
        );
      }
    } else if (input.expectation === 'negative') {
      lines.push(
        `  Do not run ${input.tool_id}; this scenario expects the selector to forbid it.`,
        '  Include the phrase "forbidden" in the final benchmark summary.'
      );
    } else {
      lines.push(
        `  Do not run ${input.tool_id}; treat rg as sufficient for this scenario.`,
        '  Include the phrase "rg baseline" in the final benchmark summary.'
      );
    }
  }

  if (selectorMode === 'source-fallback') {
    lines.push('  This matrix was generated in development mode; selector behavior is validated separately from this direct tool benchmark.');
  }

  lines.push(
    'runner:',
    '  runtime: codex',
    `  model: ${quoteYaml(input.model ?? DEFAULT_CODEX_MODEL)}`,
    '  permission_mode: bypassPermissions',
    'fixtures:',
    '  copy_trees:',
    `    - from: ${quoteYaml(fixturePath)}`,
    '      to: project'
  );

  if (input.expectation !== 'baseline_rg') {
    lines.push(
      '  files_committed:',
      '    - path: project/.ai-factory/config.yaml',
      '      content: |',
      '        config_version: 1',
      '        utilities:',
      '          context_tools:',
      '            enabled:',
      `              - ${input.tool_id}`
    );
  }

  for (const command of setupCommandsForTools(preinitializedToolIds)) {
    if (!lines.includes('  setup_commands:')) {
      lines.push('  setup_commands:');
    }
    lines.push(`    - ${quoteYaml(command)}`);
  }

  lines.push(
    'assertions:',
    '  - id: stay-in-sandbox',
    '    type: no_path_escape',
    '  - id: efficient',
    '    type: turn_count_at_most',
    '    max: 8'
  );

  if (input.expectation === 'baseline_rg') {
    lines.push(
      '  - id: baseline-rg-called',
      '    type: tool_called',
      '    tool: Bash',
      '    args_match:',
      `      command: ${quoteYamlSingle(commandInvocationRegexForYaml('rg'))}`
    );
    for (const toolId of OPTIONAL_TOOLS) {
      lines.push(
        `  - id: no-${safeAssertionId(toolId)}`,
        '    type: no_tool_called',
        '    tool: Bash',
        '    args_match:',
        `      command: ${quoteYamlSingle(commandInvocationRegexForYaml(toolId))}`
      );
    }
    lines.push(
      '  - id: mentions-rg-baseline',
      '    type: output_contains',
      '    pattern: "rg baseline"'
    );
    return `${lines.join('\n')}\n`;
  }

  if (input.expectation === 'positive' || input.expectation === 'overhead') {
    lines.push(
      '  - id: rg-tool-sequence',
      '    type: tool_call_sequence',
      '    sequence:',
      '      - tool: Bash',
      '        args_match:',
      `          command: ${quoteYamlSingle(commandInvocationRegexForYaml('rg'))}`,
      '      - tool: Bash',
      '        args_match:',
      `          command: ${quoteYamlSingle(commandInvocationRegexForYaml(input.tool_id))}`,
      `  - id: ${safeAssertionId(input.tool_id)}-called`,
      '    type: tool_called',
      '    tool: Bash',
      '    args_match:',
      `      command: ${quoteYamlSingle(commandInvocationRegexForYaml(input.tool_id))}`,
      '  - id: mentions-tool-run',
      '    type: output_contains',
      '    pattern: "tool_run"'
    );
    if (input.tool_id === 'codegraph') {
      lines.push(
        '  - id: codegraph-data-called',
        '    type: tool_called',
        '    tool: Bash',
        '    args_match:',
        `      command: ${quoteYamlSingle(codegraphDataCommandInvocationRegexForYaml())}`
      );
    }
    if (isCodeGraphPreinitialized && input.tool_id === 'codegraph') {
      lines.push(
        '  - id: codegraph-purge-called',
        '    type: tool_called',
        '    tool: Bash',
        '    args_match:',
        `      command: ${quoteYamlSingle(codegraphSubcommandInvocationRegexForYaml('uninit'))}`,
        '  - id: no-codegraph-init-during-turn',
        '    type: no_tool_called',
        '    tool: Bash',
        '    args_match:',
        `      command: ${quoteYamlSingle(codegraphSubcommandInvocationRegexForYaml('init'))}`,
        '  - id: no-codegraph-index-during-turn',
        '    type: no_tool_called',
        '    tool: Bash',
        '    args_match:',
        `      command: ${quoteYamlSingle(codegraphSubcommandInvocationRegexForYaml('index'))}`
      );
    }
    if (input.expectation === 'overhead') {
      lines.push(
        '  - id: mentions-overhead',
        '    type: output_contains',
        '    pattern: "overhead"'
      );
    }
    return `${lines.join('\n')}\n`;
  }

  lines.push(
    `  - id: no-${safeAssertionId(input.tool_id)}`,
    '    type: no_tool_called',
    '    tool: Bash',
    '    args_match:',
    `      command: ${quoteYamlSingle(commandInvocationRegexForYaml(input.tool_id))}`,
    `  - id: mentions-${input.expectation === 'negative' ? 'forbidden' : 'rg-baseline'}`,
    '    type: output_contains',
    `    pattern: "${input.expectation === 'negative' ? 'forbidden' : 'rg baseline'}"`
  );
  return `${lines.join('\n')}\n`;
}

export function compareBenchmarkPair({ baseline, tool } = {}) {
  if (!baseline || !tool) {
    throw new Error('Both baseline and tool run summaries are required.');
  }
  if (baseline.pair_id && tool.pair_id && baseline.pair_id !== tool.pair_id) {
    throw new Error('Cannot compare runs from different pair_id values.');
  }

  const wallClockDelta = numeric(tool.wall_clock_ms) - numeric(baseline.wall_clock_ms);
  const tokenDelta = numeric(tool.token_estimate) - numeric(baseline.token_estimate);
  const aiTesterTokenDelta = numeric(tool.ai_tester_tokens) - numeric(baseline.ai_tester_tokens);
  const outputNoiseDelta = numeric(tool.output_noise_score) - numeric(baseline.output_noise_score);
  const accuracyDelta = numeric(tool.accuracy_score) - numeric(baseline.accuracy_score);
  const usefulness = scoreDelta(wallClockDelta, numeric(baseline.wall_clock_ms), -1)
    + scoreDelta(tokenDelta, numeric(baseline.token_estimate), -1)
    + scoreDelta(outputNoiseDelta, numeric(baseline.output_noise_score), -1)
    + scoreDelta(accuracyDelta, numeric(baseline.accuracy_score), 1);
  const safetyStatus = tool.safety_status ?? 'unknown';
  const purgeStatus = tool.purge_status ?? 'unknown';
  const decision = decisionForComparison({ usefulness, safetyStatus, purgeStatus });

  return {
    pair_id: tool.pair_id ?? baseline.pair_id ?? null,
    baseline_tool_id: baseline.tool_id ?? 'rg',
    tool_id: tool.tool_id ?? null,
    wall_clock_ms_delta: wallClockDelta,
    token_estimate_delta: tokenDelta,
    ai_tester_token_delta: aiTesterTokenDelta,
    output_noise_delta: outputNoiseDelta,
    accuracy_delta: accuracyDelta,
    usefulness_vs_rg: usefulness,
    safety_status: safetyStatus,
    purge_status: purgeStatus,
    decision
  };
}

export function buildPublicMatrixSummary({
  manifest,
  rootInputs = [],
  excludedRootCount = 0,
  outDir = null,
  dryRun = false
} = {}) {
  const profiles = asArray(manifest?.profiles).map(sanitizeProfile);
  const cases = asArray(manifest?.cases);
  return {
    schema: AI_TESTER_MATRIX_SCHEMA,
    generated_at: new Date().toISOString(),
    dry_run: Boolean(dryRun),
    root_input_count: rootInputs.length,
    excluded_root_count: excludedRootCount,
    output_scope: outDir ? 'selected-run-dir' : null,
    selector: manifest?.selector ?? null,
    runner: manifest?.runner ?? null,
    matrix_strategy: manifest?.matrix_strategy ?? null,
    scenario_prefix: manifest?.scenario_prefix ?? null,
    skill_groups: manifest?.skill_groups ?? [],
    preinitialized_tools: manifest?.preinitialized_tools ?? [],
    profiles,
    profile_counts_by_dimension: countProfileDimensions(profiles),
    case_count: cases.length,
    case_counts_by_expectation: countBy(cases, 'expectation'),
    case_counts_by_tool: countBy(cases, 'tool_id'),
    skill_tool_matrices: buildSkillToolMatrices({ cases, profileCount: profiles.length }),
    suites: manifest?.suites ?? [],
    cases: cases.map((item) => ({
      id: item.id,
      pair_id: item.pair_id,
      suite: item.suite,
      expectation: item.expectation,
      skill: item.skill,
      tool_id: item.tool_id,
      optional_tool_id: item.optional_tool_id ?? null,
      preinitialized_tool_ids: item.preinitialized_tool_ids ?? [],
      profile_id: item.profile_id,
      task_scenario: item.task_scenario,
      selector_mode: item.selector_mode
    }))
  };
}

function buildSkillToolMatrices({ cases = [], profileCount = 0 } = {}) {
  const rows = new Map();
  for (const item of asArray(cases)) {
    const skill = item.skill ?? 'unknown_skill';
    const optionalToolId = item.optional_tool_id ?? (item.tool_id === 'rg' ? 'unknown_optional_tool' : item.tool_id);
    const key = `${skill}::${optionalToolId}`;
    if (!rows.has(key)) {
      rows.set(key, {
        skill,
        optional_tool_id: optionalToolId,
        profile_count: profileCount,
        rg_baseline_cases: 0,
        tool_run_cases: 0,
        total_cases: 0
      });
    }
    const row = rows.get(key);
    row.total_cases += 1;
    if (item.expectation === 'baseline_rg' && item.tool_id === 'rg') {
      row.rg_baseline_cases += 1;
    } else if (item.tool_id === optionalToolId) {
      row.tool_run_cases += 1;
    }
  }
  return [...rows.values()].sort((left, right) => {
    const bySkill = String(left.skill).localeCompare(String(right.skill));
    return bySkill || String(left.optional_tool_id).localeCompare(String(right.optional_tool_id));
  });
}

async function writeScenarioFiles({ outDir, manifest, copies = [], selectorMode = 'installed' }) {
  const scenarioDir = path.join(outDir, 'scenarios');
  assertWithinDirectory(outDir, scenarioDir, 'scenario directory');
  await mkdir(scenarioDir, { recursive: true });
  const promptPath = path.join(outDir, 'system-prompt.md');
  assertWithinDirectory(outDir, promptPath, 'matrix system prompt');
  await writeFile(promptPath, `${MATRIX_SYSTEM_PROMPT}\n`, 'utf8');
  const copyByProfile = new Map(copies.map((copy) => [copy.profile_id, copy.copyPath]));

  for (const item of manifest.cases) {
    const optionalToolId = item.optional_tool_id ?? item.tool_id;
    const suffix = item.expectation === 'baseline_rg' ? '__baseline_rg' : '';
    const fileName = `${item.profile_id}__${item.skill}__${optionalToolId}__${item.task_scenario}${suffix}.yaml`;
    const targetPath = path.join(scenarioDir, fileName);
    assertWithinDirectory(outDir, targetPath, 'scenario file');
    const scenario = renderAiTesterScenario({
      ...item,
      id: item.id,
      fixture_path: toPosix(path.relative(scenarioDir, copyByProfile.get(item.profile_id) ?? '<sanitized-fixture>')),
      system_prompt_file: '../system-prompt.md',
      model: manifest.runner?.model ?? DEFAULT_CODEX_MODEL,
      preinitialized_tool_ids: item.preinitialized_tool_ids ?? [],
      selector_mode: selectorMode
    });
    await writeFile(targetPath, scenario, 'utf8');
  }
}

function expectedToolBehavior({ metadata, profile, skill, toolId, taskScenario }) {
  const tool = metadata.tools?.[toolId] ?? {};
  const permission = metadata.tool_permissions?.[toolId]?.[skill] ?? metadata.tool_permissions?.[toolId]?.default ?? null;
  if (permission === 'forbidden' || asArray(tool.forbidden_in).includes(skill)) return 'negative';
  const allowedIn = asArray(tool.allowed_in).filter((scope) => String(scope).startsWith('aif-'));
  if (allowedIn.length > 0 && !allowedIn.includes(skill)) return 'negative';
  if (isMiniProject(profile) && REPO_GRAPH_TOOLS.has(toolId)) return 'overhead';
  if (dimensionAvoidsTool(metadata, profile, toolId)) return 'overhead';
  if (taskAvoidsTool(metadata, taskScenario, toolId)) return 'overhead';
  if (toolMatchesTask(tool, taskScenario) || taskRecommendsTool(metadata, taskScenario, toolId)) return 'positive';
  return 'not_applicable';
}

function dimensionAvoidsTool(metadata, profile, toolId) {
  for (const signal of Object.values(metadata.dimension_signals ?? {})) {
    if (!dimensionSignalMatches(signal.match ?? {}, profile)) continue;
    if (asArray(signal.avoid_tools).includes(toolId)) return true;
  }
  return false;
}

function dimensionSignalMatches(match, profile) {
  for (const [key, expected] of Object.entries(match ?? {})) {
    const actual = key === 'languages' || key === 'language' ? profile.languages : profile[key];
    const expectedValues = asArray(expected).flatMap(splitCsv).map(String);
    if (Array.isArray(actual)) {
      if (!actual.some((value) => expectedValues.includes(String(value)))) return false;
    } else if (!expectedValues.includes(String(actual))) {
      return false;
    }
  }
  return true;
}

function taskAvoidsTool(metadata, taskScenario, toolId) {
  const task = metadata.task_signals?.[taskScenario] ?? {};
  return [...asArray(task.avoid), ...asArray(task.avoid_by_default)].includes(toolId);
}

function taskRecommendsTool(metadata, taskScenario, toolId) {
  const task = metadata.task_signals?.[taskScenario] ?? {};
  return [...asArray(task.recommend), ...asArray(task.conditional)].includes(toolId);
}

function toolMatchesTask(tool, taskScenario) {
  const tasks = [
    ...asArray(tool.recommended_for?.tasks),
    ...asArray(tool.conditional_for?.tasks)
  ];
  return tasks.includes(taskScenario);
}

function suiteForExpectation(expectation, toolId) {
  if (expectation === 'baseline_rg') return 'baseline';
  if (expectation === 'positive' && toolId === 'context7') return 'docs-version';
  if (expectation === 'positive' && toolId === 'codex-agent-mem') return 'continuity';
  if (expectation === 'positive') return 'positive';
  if (expectation === 'negative') return 'negative';
  if (expectation === 'overhead') return 'overhead';
  return 'not-applicable';
}

function buildSuiteDefinitions() {
  return [
    { id: 'baseline', assertions: ['tool_called', 'no_tool_called', 'no_path_escape'] },
    { id: 'positive', assertions: ['tool_called', 'tool_call_sequence', 'output_contains', 'no_path_escape'] },
    { id: 'negative', assertions: ['no_tool_called', 'output_contains', 'no_path_escape'] },
    { id: 'overhead', assertions: ['tool_called', 'tool_call_sequence', 'output_contains', 'turn_count_at_most', 'no_path_escape'] },
    { id: 'docs-version', assertions: ['tool_called', 'output_contains', 'no_path_escape'] },
    { id: 'continuity', assertions: ['tool_called', 'output_contains', 'no_path_escape'] }
  ];
}

function decisionForComparison({ usefulness, safetyStatus, purgeStatus }) {
  if (safetyStatus === 'fail' || purgeStatus === 'fail') return 'forbid';
  if (usefulness >= 2) return 'recommend';
  if (usefulness > 0) return 'conditional';
  return 'avoid';
}

function scoreDelta(delta, baselineValue, beneficialDirection) {
  if (!Number.isFinite(delta)) return 0;
  const threshold = Math.max(Math.abs(baselineValue) * 0.1, 1);
  if (beneficialDirection < 0) {
    if (delta <= -threshold) return 1;
    if (delta >= threshold) return -1;
    return 0;
  }
  if (delta >= threshold) return 1;
  if (delta <= -threshold) return -1;
  return 0;
}

function countProfileDimensions(profiles) {
  return {
    project_shape: countBy(profiles, 'project_shape'),
    languages: countLanguages(profiles),
    volume: countBy(profiles, 'volume'),
    complexity: countBy(profiles, 'complexity'),
    repo_shape: countBy(profiles, 'repo_shape'),
    artifact_mode: countBy(profiles, 'artifact_mode')
  };
}

function countLanguages(profiles) {
  const counts = {};
  for (const profile of profiles) {
    for (const language of asArray(profile.languages)) {
      counts[language] = (counts[language] ?? 0) + 1;
    }
  }
  return counts;
}

function countBy(items, key) {
  const counts = {};
  for (const item of asArray(items)) {
    const value = item?.[key];
    if (value === undefined || value === null || value === '') continue;
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
}

function sanitizeProfile(profile) {
  const normalized = {
    id: profile.id,
    project_shape: profile.project_shape ?? profile.shape ?? 'large_framework_app',
    languages: asArray(profile.languages),
    volume: profile.volume ?? 'standard',
    complexity: profile.complexity ?? 'framework',
    repo_shape: profile.repo_shape ?? 'single_repo',
    artifact_mode: profile.artifact_mode ?? 'none',
    source_kind: profile.source_kind ?? 'local-project-root'
  };
  return {
    ...normalized,
    project_label: profile.project_label ?? buildProjectLabel(normalized),
    tags: asArray(profile.tags).length > 0 ? asArray(profile.tags) : buildProjectTags(normalized)
  };
}

function buildProjectLabel(profile = {}) {
  const languages = asArray(profile.languages);
  const languageLabel = languages.length > 0 ? languages.join('+') : 'no-primary-language';
  return [
    languageLabel,
    profile.volume ?? 'standard',
    profile.complexity ?? 'framework',
    profile.repo_shape ?? 'single_repo',
    profile.artifact_mode ?? 'none',
    profile.project_shape ?? profile.shape ?? 'large_framework_app'
  ].join(' | ');
}

function buildProjectTags(profile = {}) {
  const languages = asArray(profile.languages);
  return [
    ...(languages.length > 0 ? languages : ['no-primary-language']),
    profile.volume ?? 'standard',
    profile.complexity ?? 'framework',
    profile.repo_shape ?? 'single_repo',
    profile.artifact_mode ?? 'none',
    profile.project_shape ?? profile.shape ?? 'large_framework_app'
  ];
}

function isMiniProject(profile) {
  return profile.volume === 'mini' || profile.project_shape === 'small_microservice';
}

function numeric(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function quoteYaml(value) {
  return `"${String(value ?? '').replaceAll('"', '\\"')}"`;
}

function quoteYamlSingle(value) {
  return `'${String(value ?? '').replaceAll("'", "''")}'`;
}

function safeAssertionId(value) {
  return String(value ?? 'tool').replace(/[^A-Za-z0-9_-]+/g, '-');
}

function safeScenarioPrefix(value) {
  const normalized = String(value ?? '').trim();
  if (!normalized) return '';
  return normalized.replace(/[^A-Za-z0-9_.-]+/g, '-').replace(/^-+|-+$/g, '');
}

function escapeRegexForYaml(value) {
  return String(value ?? '').replace(/[\\^$.*+?()[\]{}|]/g, '\\$&').replaceAll('"', '\\"');
}

export function commandInvocationRegexForYaml(commandName) {
  const escaped = escapeRegexForYaml(commandName);
  return `(?:^\\s*["']?|[;&|]\\s*["']?|(?:cmd(?:\\.exe)?|powershell(?:\\.exe)?)\\s+(?:/d\\s+)?(?:/s\\s+)?/c\\s+["']?)(?:npx\\s+)?${escaped}(?:\\.cmd|\\.ps1|\\.exe)?(?=\\s|$|["'])`;
}

function codegraphSubcommandInvocationRegexForYaml(subcommand) {
  const command = commandInvocationRegexForYaml('codegraph').replace('(?=\\s|$|["\'])', '\\s+');
  return `${command}[^;&|\\r\\n]*\\b${escapeRegexForYaml(subcommand)}\\b`;
}

function codegraphDataCommandInvocationRegexForYaml() {
  const command = commandInvocationRegexForYaml('codegraph').replace('(?=\\s|$|["\'])', '\\s+');
  return `${command}(?!(?:[^;&|\\r\\n]*\\b--help\\b))(?:files|query|context)\\b(?![^;&|\\r\\n]*\\b--help\\b)`;
}

function setupCommandsForTools(toolIds = []) {
  const commands = [];
  if (toolIds.includes('codegraph')) {
    commands.push('cd project && codegraph init .');
    commands.push('cd project && codegraph index --quiet .');
  }
  return commands;
}

function selectorInvocationRegexForYaml() {
  return [
    `(?:^|\\s)["']?(?:ai-factory\\s+)?aifhub-memory-tools\\s+select`,
    `(?:^|\\s)["']?node\\s+scripts[\\\\/]memory-tool-recommender\\.mjs\\s+select`
  ].join('|');
}

export function resolveMatrixStrategy({ parsed = {}, metadata = {} } = {}) {
  const matrixSize = normalizeMatrixSize(parsed.matrixSize);
  const preset = MATRIX_SIZE_PRESETS[matrixSize];
  const skillSet = parsed.skillSet ?? preset.skillSet;
  const taskSet = parsed.taskSet ?? preset.taskSet;
  const stratified = parsed.stratified || preset.profileMode === 'stratified';
  const maxProfiles = parsed.maxProfiles ?? preset.maxProfiles;
  const skills = parsed.skills?.length > 0
    ? unique(parsed.skills)
    : resolveSkillSet({ metadata, skillSet });
  const taskScenarios = parsed.tasks?.length > 0
    ? unique(parsed.tasks)
    : resolveTaskSet({ metadata, taskSet });
  const estimatedPairCountPerTool = Number.isFinite(maxProfiles)
    ? skills.length * maxProfiles * taskScenarios.length
    : null;

  return {
    matrix_size: matrixSize,
    purpose: preset.purpose,
    skill_set: parsed.skills?.length > 0 ? 'explicit' : skillSet,
    task_set: parsed.tasks?.length > 0 ? 'explicit' : taskSet,
    profile_mode: stratified ? 'stratified' : 'all',
    max_profiles: maxProfiles,
    stratified,
    skills,
    task_scenarios: taskScenarios,
    estimated_pair_count_per_tool: estimatedPairCountPerTool,
    estimated_scenario_count_per_tool: Number.isFinite(estimatedPairCountPerTool)
      ? estimatedPairCountPerTool * 2
      : null
  };
}

export function resolveSkillSet({ metadata = {}, skillSet = 'metadata' } = {}) {
  if (skillSet === 'all') return ALL_AIF_SKILLS;
  if (skillSet === 'grouped') {
    return unique(defaultSkillGroups(metadata).flatMap((group) => asArray(group.representatives)));
  }
  if (skillSet === 'high-signal') return HIGH_SIGNAL_SKILLS;
  if (skillSet === 'default') return DEFAULT_SKILLS;
  return defaultSkills(metadata);
}

export function resolveTaskSet({ metadata = {}, taskSet = 'primary' } = {}) {
  if (taskSet === 'all') return defaultTaskScenarios(metadata);
  if (taskSet === 'primary') return PRIMARY_TASK_SCENARIOS;
  return defaultTaskScenarios(metadata);
}

function normalizeMatrixSize(value) {
  return Object.hasOwn(MATRIX_SIZE_PRESETS, value) ? value : DEFAULT_MATRIX_SIZE;
}

function defaultSkillGroups(metadata = {}) {
  const groups = asArray(metadata.benchmark_matrix?.ai_tester?.skill_test_groups);
  return groups.length > 0 ? groups : DEFAULT_SKILL_GROUPS;
}

function sanitizeSkillGroups(groups = []) {
  return asArray(groups).map((group) => ({
    id: group.id,
    representatives: asArray(group.representatives),
    members: asArray(group.members),
    rationale: group.rationale ?? ''
  }));
}

function toPosix(value) {
  return String(value).replaceAll(path.sep, '/');
}

function defaultSkills(metadata) {
  const keys = Object.keys(metadata.skill_usage_matrix ?? {});
  return keys.length > 0 ? keys : DEFAULT_SKILLS;
}

function defaultTaskScenarios(metadata) {
  const keys = Object.keys(metadata.task_signals ?? {});
  return keys.length > 0 ? keys : DEFAULT_TASK_SCENARIOS;
}

function normalizeSelectorMode(value) {
  return value === 'source-fallback' ? 'source-fallback' : 'installed';
}

function parseArgs(args) {
  const parsed = {
    help: false,
    roots: [],
    excludeRoots: [],
    out: null,
    metadata: null,
    skills: [],
    tools: [],
    tasks: [],
    preinitializeTools: [],
    selectorMode: 'installed',
    model: null,
    json: false,
    writeJson: true,
    dryRun: false,
    maxProfiles: null,
    stratified: false,
    matrixSize: DEFAULT_MATRIX_SIZE,
    skillSet: null,
    taskSet: null,
    scenarioPrefix: ''
  };

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (token === '--help' || token === '-h') {
      parsed.help = true;
    } else if (token === '--roots') {
      parsed.roots.push(args[++index]);
    } else if (token === '--exclude-root') {
      parsed.excludeRoots.push(args[++index]);
    } else if (token === '--out') {
      parsed.out = args[++index];
    } else if (token === '--metadata') {
      parsed.metadata = args[++index];
    } else if (token === '--skill') {
      parsed.skills.push(args[++index]);
    } else if (token === '--tool') {
      parsed.tools.push(args[++index]);
    } else if (token === '--task') {
      parsed.tasks.push(args[++index]);
    } else if (token === '--preinitialize-tool') {
      parsed.preinitializeTools.push(args[++index]);
    } else if (token === '--selector-mode') {
      parsed.selectorMode = normalizeSelectorMode(args[++index]);
    } else if (token === '--model') {
      parsed.model = args[++index];
    } else if (token === '--json') {
      parsed.json = true;
    } else if (token === '--no-write-json') {
      parsed.writeJson = false;
    } else if (token === '--dry-run') {
      parsed.dryRun = true;
    } else if (token === '--max-profiles') {
      parsed.maxProfiles = Number(args[++index]);
    } else if (token === '--stratified') {
      parsed.stratified = true;
    } else if (token === '--matrix-size') {
      parsed.matrixSize = normalizeMatrixSize(args[++index]);
    } else if (token === '--skill-set') {
      parsed.skillSet = args[++index];
    } else if (token === '--task-set') {
      parsed.taskSet = args[++index];
    } else if (token === '--scenario-prefix') {
      parsed.scenarioPrefix = args[++index];
    }
  }
  return parsed;
}

function getCliUsage() {
  return [
    'Usage: node scripts/memory-tool-ai-tester-matrix.mjs --roots <dir> --out <run-dir> --json',
    '',
    'Options:',
    '  --roots <dir>              Root directory to discover anonymous project profiles. Repeatable.',
    '  --exclude-root <dir>       Exclude a root and all nested project profiles. Repeatable.',
    '  --out <dir>                Run directory for sanitized fixtures, scenarios, and public JSON.',
    '  --metadata <file>          Recommendation metadata YAML.',
    '  --skill <aif-skill>        Limit generated matrix to a skill. Repeatable.',
    '  --tool <tool-id>           Limit generated matrix to an optional tool. Repeatable.',
    '  --task <task-signal>       Limit generated matrix to a task scenario. Repeatable.',
    '  --preinitialize-tool <id>   Run ai-tester setup_commands to initialize a tool index before model turn. Repeatable.',
    '  --selector-mode installed|source-fallback',
    '  --model <id>                Codex model to write into generated ai-tester scenarios.',
    '  --dry-run                  Do not copy fixtures or write scenario YAML files.',
    '  --matrix-size screening|profile-sweep|skill-sweep|full',
    '                              Preset for reducing test count. Default: screening.',
    '  --skill-set grouped|high-signal|metadata|default|all',
    '                              Skill selection mode; explicit --skill overrides it.',
    '  --task-set primary|all      Task scenario selection mode; explicit --task overrides it.',
    '  --scenario-prefix <id>      Prefix scenario ids to avoid collisions with previous ai-tester traces.',
    '  --max-profiles <n>         Limit discovered profiles.',
    '  --stratified               Pick a spread of project dimensions before truncating.',
    '  --no-write-json            Do not write matrix-summary.json under --out.',
    '  --json                     Emit public JSON summary.'
  ].join('\n');
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === '') return [];
  return [value];
}

function unique(values = []) {
  return [...new Set(asArray(values).filter(Boolean))];
}

function splitCsv(value) {
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function emit(body, exitCode, options = {}) {
  const output = `${JSON.stringify(body, null, 2)}\n`;
  if (Array.isArray(options.stdout)) {
    options.stdout.push(output);
  } else if (options.stdout && typeof options.stdout.write === 'function') {
    options.stdout.write(output);
  } else {
    process.stdout.write(output);
  }
  if (options.exit !== false) process.exitCode = exitCode;
  return { exitCode, body };
}

function emitText(text, exitCode, options = {}) {
  const output = `${text}\n`;
  if (Array.isArray(options.stdout)) {
    options.stdout.push(output);
  } else if (options.stdout && typeof options.stdout.write === 'function') {
    options.stdout.write(output);
  } else {
    process.stdout.write(output);
  }
  if (options.exit !== false) process.exitCode = exitCode;
  return { exitCode, body: text };
}

function isDirectRun() {
  return process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (isDirectRun()) {
  const result = await runMemoryToolAiTesterMatrix(process.argv.slice(2));
  process.exit(result.exitCode);
}
