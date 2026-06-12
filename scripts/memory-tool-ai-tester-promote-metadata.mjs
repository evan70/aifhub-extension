#!/usr/bin/env node
// memory-tool-ai-tester-promote-metadata.mjs - propose proven-label metadata from ai-tester pairs
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import {
  loadAiTesterScenarioCatalog
} from './lib/memory-tool-ai-tester-scenario-catalog.mjs';
import {
  loadRecommendationMetadata
} from './memory-tool-recommender.mjs';

export const AI_TESTER_METADATA_PROMOTION_SCHEMA = 'aifhub.memory_tools.ai_tester_metadata_promotion.v1';

const DEFAULT_CATALOG_PATH = path.join('docs', 'memory-tools-research', 'ai-tester-scenarios.yaml');
const DEFAULT_OUT_DIR = path.join('.ai-factory', 'state', 'ai-tester-proven-label-scenarios');
const DEFAULT_REPORT_FILE = 'ai-tester-token-matrices.json';
const DEFAULT_METADATA_FILE = path.join('docs', 'memory-tools-research', 'recommendation-metadata.yaml');
const PROMOTABLE_DECISIONS = new Set(['recommend', 'conditional', 'avoid', 'forbid']);

export async function runMemoryToolAiTesterPromoteMetadata(args = [], options = {}) {
  const parsed = parseArgs(args);
  if (parsed.help) return emitText(getCliUsage(), 0, options);
  if (parsed.dryRun && parsed.apply) {
    throw new Error('--dry-run and --apply cannot be used together.');
  }

  const cwd = path.resolve(options.cwd ?? process.cwd());
  const reportPath = resolveReportPath(parsed, cwd);
  if (!reportPath) {
    throw new Error('Missing --report <file> or --matrix-dir <dir>.');
  }

  const report = JSON.parse(await readFile(reportPath, 'utf8'));
  const metadataPath = path.resolve(cwd, parsed.metadata ?? DEFAULT_METADATA_FILE);
  const metadata = await loadRecommendationMetadata({
    metadataPath,
    cwd
  }).catch(() => ({}));
  const scenarioCatalog = await loadScenarioCatalog({
    cwd,
    parsed,
    metadata
  });
  const proposal = buildMetadataPromotionProposal({
    report,
    scenarioCatalog,
    reportPath: publicPath(cwd, reportPath),
    runId: parsed.runId,
    generatedAt: parsed.generatedAt ?? new Date().toISOString()
  });

  if (hasPromotionLeak(proposal)) {
    throw new Error('Promotion proposal contains an absolute path, secret-like value, or raw private artifact reference.');
  }

  const outDir = path.resolve(cwd, parsed.out ?? DEFAULT_OUT_DIR);
  const proposalJsonPath = path.resolve(cwd, parsed.proposalFile ?? path.join(outDir, 'metadata-promotion-proposal.json'));
  const proposalMarkdownPath = path.resolve(cwd, parsed.markdownFile ?? path.join(outDir, 'metadata-promotion-proposal.md'));
  if (!parsed.dryRun) {
    await mkdir(outDir, { recursive: true });
    await mkdir(path.dirname(proposalJsonPath), { recursive: true });
    await mkdir(path.dirname(proposalMarkdownPath), { recursive: true });
    await writeFile(proposalJsonPath, `${JSON.stringify(proposal, null, 2)}\n`, 'utf8');
    await writeFile(proposalMarkdownPath, renderMetadataPromotionMarkdown(proposal), 'utf8');
  }

  let applied = null;
  if (parsed.apply) {
    const metadataRaw = await readFile(metadataPath, 'utf8');
    const nextMetadata = applyProvenLabelEvidenceBlock(metadataRaw, proposal.entries);
    await writeFile(metadataPath, nextMetadata, 'utf8');
    applied = publicPath(cwd, metadataPath);
  }

  const body = {
    ...proposal,
    output: {
      proposal_json: parsed.dryRun ? null : publicPath(cwd, proposalJsonPath),
      proposal_markdown: parsed.dryRun ? null : publicPath(cwd, proposalMarkdownPath),
      applied_metadata: applied
    }
  };

  if (parsed.json) return emit(body, 0, options);
  return emitText(
    [
      parsed.dryRun ? 'Dry run: metadata and proposal files not modified.' : `Promotion proposal written: ${body.output.proposal_json}`,
      `Promoted entries: ${proposal.summary.promoted_entries}`,
      `Skipped pairs/groups: ${proposal.summary.skipped_items}`,
      applied ? `Applied metadata: ${applied}` : 'Metadata not modified; pass --apply to append proven_label_evidence.'
    ].join('\n'),
    0,
    options
  );
}

export function buildMetadataPromotionProposal({
  report,
  scenarioCatalog = null,
  reportPath = null,
  runId = null,
  generatedAt = new Date().toISOString()
} = {}) {
  const scenarioById = new Map(asArray(scenarioCatalog?.scenarios).map((scenario) => [scenario.id, scenario]));
  const decisions = asArray(report?.paired_comparison?.pair_decisions);
  const groups = new Map();
  const skipped = [];

  for (const decision of decisions) {
    const normalized = normalizePairDecision(decision);
    const scenario = normalized.scenario_id ? scenarioById.get(normalized.scenario_id) : null;
    const policy = normalizePromotionPolicy(scenario?.promotion_policy ?? normalized.promotion_policy ?? {});
    const acceptedRunClass = policy.accepted_run_class ?? 'accepted_evidence';

    if (!normalized.scenario_id || !scenario) {
      skipped.push(skipRecord(normalized, 'missing_catalog_scenario'));
      continue;
    }
    if (policy.eligible_for_metadata !== true) {
      skipped.push(skipRecord(normalized, 'not_eligible_for_metadata'));
      continue;
    }
    if (normalized.run_class !== acceptedRunClass) {
      skipped.push(skipRecord(normalized, 'run_class_not_accepted'));
      continue;
    }
    if (!normalized.pass_pair && normalized.decision !== 'forbid') {
      skipped.push(skipRecord(normalized, 'pair_not_pass_pass'));
      continue;
    }

    const key = [
      normalized.tool_id,
      normalized.scenario_id,
      normalized.task_scenario,
      normalized.run_class,
      normalized.labels.join('|')
    ].join('::');
    if (!groups.has(key)) {
      groups.set(key, {
        tool_id: normalized.tool_id,
        scenario_id: normalized.scenario_id,
        task_scenario: normalized.task_scenario,
        run_class: normalized.run_class,
        required_labels: normalized.labels,
        skills: new Set(),
        projects: new Set(),
        policy,
        pairs: {
          total: 0,
          pass_pass: 0,
          useful: 0,
          recommend: 0,
          conditional: 0,
          avoid: 0,
          forbid: 0
        },
        deltas: []
      });
    }

    const group = groups.get(key);
    group.skills.add(normalized.skill);
    group.projects.add(normalized.project);
    group.pairs.total += 1;
    group.pairs.pass_pass += normalized.pass_pair ? 1 : 0;
    group.pairs.useful += normalized.useful ? 1 : 0;
    if (Object.hasOwn(group.pairs, normalized.decision)) {
      group.pairs[normalized.decision] += 1;
    }
    group.deltas.push(normalized.deltas);
  }

  const entries = [];
  for (const group of groups.values()) {
    const decision = choosePromotionDecision(group);
    const allowedDecisions = new Set(asArray(group.policy.allowed_decisions).length > 0
      ? asArray(group.policy.allowed_decisions)
      : [...PROMOTABLE_DECISIONS]);

    const eligiblePairCount = decision === 'forbid' ? group.pairs.total : group.pairs.pass_pass;
    if (eligiblePairCount < group.policy.min_pass_pairs) {
      skipped.push(skipGroup(group, 'not_enough_pass_pairs'));
      continue;
    }
    if (!allowedDecisions.has(decision)) {
      skipped.push(skipGroup(group, 'decision_not_allowed'));
      continue;
    }

    entries.push({
      id: promotionId(group, runId ?? report?.matrix_generated_at ?? generatedAt),
      source_evidence: runId ?? sourceEvidenceId(reportPath, generatedAt),
      scenario_id: group.scenario_id,
      run_class: group.run_class,
      tool_id: group.tool_id,
      task_scenario: group.task_scenario,
      skills: [...group.skills].sort(),
      required_labels: group.required_labels,
      pairs: {
        ...group.pairs,
        projects: group.projects.size
      },
      decision,
      average_deltas: averageDeltas(group.deltas),
      provenance: {
        report: reportPath,
        generated_at: generatedAt
      }
    });
  }

  return {
    schema: AI_TESTER_METADATA_PROMOTION_SCHEMA,
    generated_at: generatedAt,
    source_report: reportPath,
    run_id: runId ?? null,
    summary: {
      considered_pair_decisions: decisions.length,
      promoted_entries: entries.length,
      skipped_items: skipped.length
    },
    entries,
    skipped
  };
}

export function renderMetadataPromotionMarkdown(proposal = {}) {
  const lines = [
    '# AI Tester Metadata Promotion Proposal',
    '',
    `Source report: ${proposal.source_report ?? ''}`,
    `Promoted entries: ${proposal.summary?.promoted_entries ?? 0}`,
    `Skipped pairs/groups: ${proposal.summary?.skipped_items ?? 0}`,
    ''
  ];

  if (asArray(proposal.entries).length > 0) {
    lines.push('| id | tool | scenario | task | decision | skills | labels | pass/pass | useful |');
    lines.push('|---|---|---|---|---|---|---|---:|---:|');
    for (const entry of proposal.entries) {
      lines.push([
        md(entry.id),
        md(entry.tool_id),
        md(entry.scenario_id),
        md(entry.task_scenario),
        md(entry.decision),
        md(asArray(entry.skills).join(', ')),
        md(asArray(entry.required_labels).join(', ')),
        mdNum(entry.pairs?.pass_pass),
        mdNum(entry.pairs?.useful)
      ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

export function applyProvenLabelEvidenceBlock(metadataRaw, entries = []) {
  const nextEntries = asArray(entries).filter((entry) => !metadataRaw.includes(`id: ${entry.id}`));
  if (nextEntries.length === 0) return metadataRaw;

  const block = renderProvenLabelEntriesYaml(nextEntries);
  const heading = metadataRaw.match(/^proven_label_evidence:\s*$/m);
  if (!heading) {
    const insert = `proven_label_evidence:\n${block}\n`;
    const evidenceRuns = metadataRaw.match(/^evidence_runs:\s*$/m);
    if (!evidenceRuns) {
      return `${metadataRaw.replace(/\s*$/, '\n\n')}${insert}`;
    }
    return `${metadataRaw.slice(0, evidenceRuns.index)}${insert}\n${metadataRaw.slice(evidenceRuns.index)}`;
  }

  const blockStart = heading.index + heading[0].length;
  const afterHeading = metadataRaw.slice(blockStart);
  const nextTopLevel = afterHeading.match(/\n[A-Za-z0-9_-]+:\s*$/m);
  if (!nextTopLevel) {
    return `${metadataRaw.replace(/\s*$/, '\n')}${block}`;
  }
  const insertAt = blockStart + nextTopLevel.index + 1;
  return `${metadataRaw.slice(0, insertAt)}${block}\n${metadataRaw.slice(insertAt)}`;
}

export function renderProvenLabelEntriesYaml(entries = []) {
  return asArray(entries).map((entry) => {
    const lines = [
      `  - id: ${yamlScalar(entry.id)}`,
      `    source_evidence: ${yamlScalar(entry.source_evidence)}`,
      `    scenario_id: ${yamlScalar(entry.scenario_id)}`,
      `    run_class: ${yamlScalar(entry.run_class)}`,
      `    tool_id: ${yamlScalar(entry.tool_id)}`,
      `    task_scenario: ${yamlScalar(entry.task_scenario)}`,
      `    skills: ${yamlInlineList(entry.skills)}`,
      `    required_labels: ${yamlInlineList(entry.required_labels)}`,
      '    pairs:',
      `      total: ${Number(entry.pairs?.total ?? 0)}`,
      `      pass_pass: ${Number(entry.pairs?.pass_pass ?? 0)}`,
      `      useful: ${Number(entry.pairs?.useful ?? 0)}`,
      `      projects: ${Number(entry.pairs?.projects ?? 0)}`,
      `    decision: ${yamlScalar(entry.decision)}`
    ];
    if (entry.average_deltas && Object.keys(entry.average_deltas).length > 0) {
      lines.push('    average_deltas:');
      for (const key of ['total_tokens_percent', 'input_output_tokens_percent', 'duration_percent', 'tool_calls_percent']) {
        const value = entry.average_deltas[key];
        lines.push(`      ${key}: ${Number.isFinite(Number(value)) ? Number(value) : 'null'}`);
      }
    }
    lines.push(
      '    provenance:',
      `      report: ${yamlScalar(entry.provenance?.report ?? '')}`,
      `      generated_at: ${yamlScalar(entry.provenance?.generated_at ?? '')}`
    );
    return lines.join('\n');
  }).join('\n');
}

function resolveReportPath(parsed, cwd) {
  if (parsed.report) return path.resolve(cwd, parsed.report);
  if (parsed.matrixDir) return path.resolve(cwd, parsed.matrixDir, DEFAULT_REPORT_FILE);
  return null;
}

async function loadScenarioCatalog({ cwd, parsed, metadata }) {
  const catalogPath = parsed.scenarioCatalog ?? DEFAULT_CATALOG_PATH;
  try {
    return await loadAiTesterScenarioCatalog({
      catalogPath,
      metadata,
      cwd
    });
  } catch (error) {
    if (parsed.scenarioCatalog) throw error;
    return null;
  }
}

function normalizePairDecision(decision = {}) {
  return {
    pair_id: decision.pair_id ?? null,
    tool_id: String(decision.tool_id ?? ''),
    skill: String(decision.skill ?? ''),
    project: String(decision.project ?? ''),
    task_scenario: String(decision.task_scenario ?? ''),
    scenario_id: decision.scenario_id ? String(decision.scenario_id) : null,
    labels: asArray(decision.labels).map(String).sort(),
    run_class: decision.run_class ? String(decision.run_class) : null,
    promotion_policy: decision.promotion_policy ?? null,
    pass_pair: decision.pass_pair === true,
    useful: decision.useful === true,
    decision: PROMOTABLE_DECISIONS.has(String(decision.decision)) ? String(decision.decision) : 'avoid',
    deltas: decision.deltas ?? {}
  };
}

function normalizePromotionPolicy(policy = {}) {
  return {
    eligible_for_metadata: policy.eligible_for_metadata === true,
    min_pass_pairs: Math.max(1, Number(policy.min_pass_pairs ?? 2)),
    require_exact_labels: policy.require_exact_labels !== false,
    accepted_run_class: policy.accepted_run_class ?? 'accepted_evidence',
    allowed_decisions: asArray(policy.allowed_decisions).map(String)
  };
}

function choosePromotionDecision(group) {
  if (group.pairs.forbid > 0) return 'forbid';
  if (group.pairs.recommend >= group.policy.min_pass_pairs) return 'recommend';
  if (group.pairs.useful > 0 || group.pairs.conditional > 0) return 'conditional';
  return 'avoid';
}

function averageDeltas(deltas) {
  const keys = ['total_tokens_percent', 'input_output_tokens_percent', 'duration_percent', 'tool_calls_percent'];
  const result = {};
  for (const key of keys) {
    const values = asArray(deltas).map((item) => Number(item?.[key])).filter(Number.isFinite);
    result[key] = values.length > 0
      ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10
      : null;
  }
  return result;
}

function skipRecord(decision, reason) {
  return {
    reason,
    tool_id: decision.tool_id,
    scenario_id: decision.scenario_id,
    task_scenario: decision.task_scenario,
    skill: decision.skill,
    run_class: decision.run_class
  };
}

function skipGroup(group, reason) {
  return {
    reason,
    tool_id: group.tool_id,
    scenario_id: group.scenario_id,
    task_scenario: group.task_scenario,
    run_class: group.run_class,
    pass_pass: group.pairs.pass_pass,
    min_pass_pairs: group.policy.min_pass_pairs
  };
}

function promotionId(group, seed) {
  const labelsHash = createHash('sha1').update(group.required_labels.join('|')).digest('hex').slice(0, 8);
  return [
    group.tool_id,
    group.scenario_id,
    group.task_scenario,
    labelsHash,
    promotionSeedId(seed)
  ].map(safeId).filter(Boolean).join('-');
}

function promotionSeedId(seed) {
  const normalized = safeId(String(seed ?? 'run')) || 'run';
  if (normalized.length <= 24) return normalized;
  const seedHash = createHash('sha1').update(normalized).digest('hex').slice(0, 8);
  return `${normalized.slice(0, 16)}-${seedHash}`;
}

function sourceEvidenceId(reportPath, generatedAt) {
  const base = reportPath ? path.basename(reportPath, path.extname(reportPath)) : 'ai-tester';
  return `${safeId(base)}-${safeId(String(generatedAt).slice(0, 10))}`;
}

export function hasPromotionLeak(value) {
  const text = JSON.stringify(value);
  return /[A-Za-z]:[\\/]/.test(text)
    || /\\\\/.test(text)
    || /"(?:\/Users|\/home|\/tmp|\/var\/tmp|\/private\/tmp|\/mnt|\/Volumes)\//.test(text)
    || /\b(?:sk|ghp|github_pat)_[A-Za-z0-9_=-]{12,}/i.test(text)
    || /BEGIN (?:RSA|OPENSSH|EC|DSA)? ?PRIVATE KEY/i.test(text)
    || /\braw_transcript\b/i.test(text);
}

function publicPath(cwd, targetPath) {
  const resolved = path.resolve(cwd, targetPath);
  const relative = path.relative(cwd, resolved);
  if (!relative.startsWith('..') && !path.isAbsolute(relative)) return toPosix(relative);
  return path.basename(resolved);
}

function parseArgs(args) {
  const parsed = {
    help: false,
    report: null,
    matrixDir: null,
    scenarioCatalog: null,
    metadata: null,
    runId: null,
    generatedAt: null,
    out: null,
    proposalFile: null,
    markdownFile: null,
    dryRun: false,
    proposal: false,
    apply: false,
    json: false
  };

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (token === '--help' || token === '-h') parsed.help = true;
    else if (token === '--report') parsed.report = args[++index];
    else if (token === '--matrix-dir') parsed.matrixDir = args[++index];
    else if (token === '--scenario-catalog') parsed.scenarioCatalog = args[++index];
    else if (token === '--metadata') parsed.metadata = args[++index];
    else if (token === '--run-id') parsed.runId = args[++index];
    else if (token === '--generated-at') parsed.generatedAt = args[++index];
    else if (token === '--out') parsed.out = args[++index];
    else if (token === '--proposal-file') parsed.proposalFile = args[++index];
    else if (token === '--markdown-file') parsed.markdownFile = args[++index];
    else if (token === '--dry-run') parsed.dryRun = true;
    else if (token === '--proposal') parsed.proposal = true;
    else if (token === '--apply') parsed.apply = true;
    else if (token === '--json') parsed.json = true;
  }
  return parsed;
}

function getCliUsage() {
  return [
    'Usage: node scripts/memory-tool-ai-tester-promote-metadata.mjs --report <ai-tester-token-matrices.json> --json',
    '',
    'Options:',
    '  --report <file>            ai-tester token matrix JSON report.',
    '  --matrix-dir <dir>         Read ai-tester-token-matrices.json from a matrix directory.',
    '  --scenario-catalog <file>  Scenario catalog YAML. Default: docs/memory-tools-research/ai-tester-scenarios.yaml.',
    '  --metadata <file>          Recommendation metadata YAML. Default: docs/memory-tools-research/recommendation-metadata.yaml.',
    '  --run-id <id>              Evidence run id to store in promoted entries.',
    '  --out <dir>                Proposal output directory. Default: .ai-factory/state/ai-tester-proven-label-scenarios.',
    '  --proposal-file <file>     Custom proposal JSON path.',
    '  --markdown-file <file>     Custom proposal Markdown path.',
    '  --dry-run                  Emit proposal JSON without writing files or metadata.',
    '  --proposal                 Explicit proposal mode; this is the default when --dry-run is not set.',
    '  --apply                    Append promoted entries to proven_label_evidence in metadata.',
    '  --json                     Emit JSON.'
  ].join('\n');
}

function yamlInlineList(values = []) {
  return `[${asArray(values).map(yamlScalar).join(', ')}]`;
}

function yamlScalar(value) {
  const text = String(value ?? '');
  if (/^[A-Za-z0-9_.:/@-]+$/.test(text)) return text;
  return `"${text.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;
}

function safeId(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9_.-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function md(value) {
  if (value === null || value === undefined || value === '') return '';
  return String(value).replaceAll('|', ';');
}

function mdNum(value) {
  return Number.isFinite(Number(value)) ? String(Number(value)) : '';
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === '') return [];
  return [value];
}

function toPosix(value) {
  return String(value).replaceAll(path.sep, '/');
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

function emitText(body, exitCode, options = {}) {
  const output = `${body}\n`;
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

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runMemoryToolAiTesterPromoteMetadata(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`${error?.stack ?? error}\n`);
    process.exitCode = 1;
  });
}
