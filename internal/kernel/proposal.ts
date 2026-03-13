import { join } from "node:path";

import {
  changeIdForTitle,
  defaultChangePackagePath,
  loadChangePackage,
  materializeChangePackage,
} from "./change_package.ts";
import { DEFAULT_PROJECT_KEY, loadOptionalProjectRegistry, resolveProject } from "./project.ts";
import { defaultBaselineArtifactPath, defaultScoreArtifactPath, scoreVector } from "./score.ts";
import {
  evaluatePromotionRule,
  exists,
  isoTimestamp,
  loadScorecard,
  readJson,
  readString,
  repoRelative,
  writeJson,
} from "./helpers.ts";
import type { ImprovementProposal, ResolvedProject, Scorecard } from "./types.ts";

export function defaultProposalArtifactPath(root: string, vector: string): string {
  return join(root, "docs", "generated", "improvement", `${vector}-proposal.json`);
}

export async function proposalForVector(
  root: string,
  vector: string,
  options: {
    artifactPath?: string;
    scoreArtifactPath?: string;
    baselineArtifactPath?: string;
    projectKey?: string;
  } = {},
): Promise<ImprovementProposal> {
  const scorecard = await loadScorecard(root, vector);
  const proposalArtifactPath = options.artifactPath ?? defaultProposalArtifactPath(root, vector);
  const scoreArtifactPath = options.scoreArtifactPath ?? defaultScoreArtifactPath(root, vector);
  const baselineArtifactPath = options.baselineArtifactPath ??
    defaultBaselineArtifactPath(root, vector);

  const score = await readJson<Record<string, unknown>>(scoreArtifactPath).catch(async () =>
    await scoreVector(root, vector, scoreArtifactPath)
  );
  const baseline = await loadOptionalArtifact(baselineArtifactPath);
  const registry = await loadOptionalProjectRegistry(root);
  const projectKey = options.projectKey ?? scorecard.proposal?.project_key ??
    registry?.default_project ?? DEFAULT_PROJECT_KEY;
  const project = resolveProject(registry, scorecard, projectKey);
  const targetMetric = readString(score.target_metric || scorecard.target.metric);
  const currentValue = score[targetMetric];
  const baselineValue = baseline?.target_value;
  const promotion = baseline
    ? evaluatePromotionRule(
      scorecard.promotion_rule,
      scorecard.target.direction,
      baselineValue,
      currentValue,
      guardrailsPassed(score),
    )
    : undefined;
  const regressed = baseline ? promotion?.passed === false : null;
  const recommendation = score.pass === true && regressed !== true
    ? "keep_monitoring"
    : "create_change_package";

  const validation = uniqueList([
    ...(scorecard.proposal?.validation ?? []),
    ...project.validation,
    `deno task score --vector ${vector}`,
  ]);
  const acceptanceCriteria = uniqueList([
    ...(scorecard.proposal?.acceptance_criteria ?? []),
    `Preserve guardrail status for ${vector}.`,
    baseline
      ? `Do not regress ${targetMetric} from the recorded baseline.`
      : `Produce a passing ${vector} score artifact with the target metric ${targetMetric}.`,
  ]);
  const title = scorecard.proposal?.title ?? `Improve ${vector}`;
  const summary = scorecard.proposal?.summary ?? scorecard.summary;
  const hypothesis = scorecard.proposal?.hypothesis ??
    `Improve ${vector} while keeping review and promotion guardrails conservative.`;
  const evidence = {
    score_artifact: repoRelative(root, scoreArtifactPath),
    baseline_artifact: baseline ? repoRelative(root, baselineArtifactPath) : undefined,
  };
  const changeId = changeIdForTitle(title);
  const changePath = repoRelative(root, defaultChangePackagePath(root, changeId));
  const existingChangePackage = await loadChangePackage(root, changeId);
  const initialChangeStatus = existingChangePackage?.status ??
    (recommendation === "create_change_package" ? "draft" : "not_created");

  const proposal: ImprovementProposal = {
    artifact_path: repoRelative(root, proposalArtifactPath),
    generated_at: isoTimestamp(),
    vector,
    scorecard_summary: scorecard.summary,
    recommendation,
    signal: {
      pass: score.pass === true,
      target_metric: targetMetric,
      target_direction: scorecard.target.direction,
      current_value: currentValue,
      baseline_value: baselineValue,
      regressed,
      guardrails: {
        passed: guardrailsPassed(score),
        details: guardrailDetails(score),
      },
    },
    project: {
      key: projectKey,
      display_name: project.display_name,
      repo_url: project.repo_url,
      source_path: project.source_path,
      workflow: {
        path: project.workflow.path,
      },
      validation: project.validation,
      scorecards: project.scorecards,
      risk_tier: project.risk_tier,
      merge_policy: project.merge_policy,
      tracker: {
        kind: project.tracker.kind,
        project_slug: project.tracker.project_slug,
        routing_key: project.tracker.routing_key,
        backlog_state_name: project.tracker.backlog_state_name,
      },
    },
    change: {
      id: changeId,
      path: changePath,
      status: initialChangeStatus,
    },
    story: {
      title,
      labels: uniqueList([vector, "improvement", ...(scorecard.proposal?.labels ?? [])]),
      summary,
      hypothesis,
      acceptance_criteria: acceptanceCriteria,
      validation,
      handoff_markdown: renderHandoffMarkdown({
        change: {
          id: changeId,
          path: changePath,
          status: initialChangeStatus,
        },
        projectKey,
        project,
        scorecard,
        targetMetric,
        currentValue,
        baselineValue,
        recommendation,
        summary,
        hypothesis,
        acceptanceCriteria,
        validation,
        evidence,
        score,
      }),
    },
    evidence,
    governance: {
      review_required: true,
      risk_tier: project.risk_tier,
      merge_policy: project.merge_policy,
      execution_boundary: "planner_proposes_executor_acts_humans_govern",
    },
  };

  if (recommendation === "create_change_package" || existingChangePackage) {
    const changePackage = await materializeChangePackage(root, proposal);
    proposal.change.status = changePackage.status;
  }

  await writeJson(proposalArtifactPath, proposal);
  return proposal;
}

async function loadOptionalArtifact(path: string): Promise<Record<string, unknown> | undefined> {
  if (!await exists(path)) {
    return undefined;
  }
  return await readJson<Record<string, unknown>>(path);
}

export function renderHandoffMarkdown(input: {
  change: {
    id: string;
    path: string;
    status: ImprovementProposal["change"]["status"];
  };
  projectKey: string;
  project: ResolvedProject;
  scorecard: Scorecard;
  targetMetric: string;
  currentValue: unknown;
  baselineValue: unknown;
  recommendation: ImprovementProposal["recommendation"];
  summary: string;
  hypothesis: string;
  acceptanceCriteria: string[];
  validation: string[];
  evidence: {
    score_artifact: string;
    baseline_artifact?: string;
  };
  score: Record<string, unknown>;
}): string {
  const mergePolicy = input.project.merge_policy[input.project.risk_tier] ?? "manual_only";
  const sections = [
    `## Improvement Summary`,
    ``,
    `Project`,
    input.projectKey,
    ``,
    `Vector`,
    input.scorecard.id,
    ``,
    `Recommendation`,
    input.recommendation,
    ``,
    `Observed Signals`,
    `- ${input.targetMetric}: ${JSON.stringify(input.currentValue)}`,
    `- baseline: ${JSON.stringify(input.baselineValue)}`,
    `- pass: ${JSON.stringify(input.score.pass === true)}`,
    ...guardrailLines(input.score),
    ``,
    `Hypothesis`,
    input.hypothesis,
    ``,
    `Success Metric`,
    `- ${input.scorecard.id} ${input.targetMetric} (${input.scorecard.target.direction})`,
    input.baselineValue !== undefined
      ? `- preserve or improve on baseline ${JSON.stringify(input.baselineValue)}`
      : `- establish a reliable baseline`,
    ``,
    `Change Package`,
    `- change id: ${input.change.id}`,
    `- status: ${input.change.status}`,
    `- proposal: ${input.change.path}/proposal.md`,
    `- design: ${input.change.path}/design.md`,
    `- tasks: ${input.change.path}/tasks.md`,
    ``,
    `Acceptance Criteria`,
    ...input.acceptanceCriteria.map((item) => `- ${item}`),
    ``,
    `Validation`,
    ...input.validation.map((item) => `- ${item}`),
    ``,
    `Evidence`,
    `- ${input.evidence.score_artifact}`,
    ...(input.evidence.baseline_artifact ? [`- ${input.evidence.baseline_artifact}`] : []),
    ``,
    `Governance`,
    `- risk tier: ${input.project.risk_tier}`,
    `- merge policy: ${mergePolicy}`,
    `- review required: true`,
    `- workflow contract: ${input.project.workflow.path ?? "not configured"}`,
    ``,
    `Summary`,
    input.summary,
  ];

  return sections.join("\n");
}

function guardrailLines(score: Record<string, unknown>): string[] {
  const details = guardrailDetails(score);
  if (details.length === 0) {
    return ["- guardrails: passed"];
  }
  return ["- guardrails:", ...details.map((detail) => `  - ${detail}`)];
}

function guardrailsPassed(score: Record<string, unknown>): boolean {
  const guardrails = score.guardrails;
  if (!guardrails || typeof guardrails !== "object") {
    return false;
  }
  return (guardrails as Record<string, unknown>).passed === true;
}

function guardrailDetails(score: Record<string, unknown>): string[] {
  const guardrails = score.guardrails;
  if (!guardrails || typeof guardrails !== "object") {
    return [];
  }
  const details = (guardrails as Record<string, unknown>).details;
  return Array.isArray(details)
    ? details.filter((detail): detail is string => typeof detail === "string")
    : [];
}

function uniqueList(values: Array<string | undefined>): string[] {
  return [
    ...new Set(
      values.filter((value): value is string => typeof value === "string" && value.trim() !== ""),
    ),
  ];
}
