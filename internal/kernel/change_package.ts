import { join } from "node:path";

import {
  ensureDir,
  exists,
  isoTimestamp,
  readJson,
  repoRelative,
  sanitizeSlug,
  writeJson,
} from "./helpers.ts";
import type { ChangePackage, ImprovementProposal } from "./types.ts";

export function changeIdForTitle(title: string): string {
  return sanitizeSlug(title);
}

export function defaultChangePackagePath(root: string, changeId: string): string {
  return join(root, "changes", changeId);
}

export async function loadChangePackage(
  root: string,
  changeId: string,
): Promise<ChangePackage | undefined> {
  const path = join(defaultChangePackagePath(root, changeId), "change.json");
  if (!await exists(path)) {
    return undefined;
  }
  return await readJson<ChangePackage>(path);
}

export async function materializeChangePackage(
  root: string,
  proposal: ImprovementProposal,
): Promise<ChangePackage> {
  const changeRoot = defaultChangePackagePath(root, proposal.change.id);
  const paths = {
    root: repoRelative(root, changeRoot),
    proposal: repoRelative(root, join(changeRoot, "proposal.md")),
    design: repoRelative(root, join(changeRoot, "design.md")),
    tasks: repoRelative(root, join(changeRoot, "tasks.md")),
    specs_dir: repoRelative(root, join(changeRoot, "specs")),
    delta_spec: repoRelative(root, join(changeRoot, "specs", `${proposal.vector}.md`)),
  };
  const existing = await loadChangePackage(root, proposal.change.id);
  const mergePolicy = proposal.project.merge_policy[proposal.project.risk_tier] ?? "manual_only";
  const changePackage: ChangePackage = {
    schema_version: 1,
    change_id: proposal.change.id,
    title: proposal.story.title,
    project_key: proposal.project.key,
    vector: proposal.vector,
    status: existing?.status ?? "draft",
    proposal_artifact: proposal.artifact_path,
    summary: proposal.story.summary,
    hypothesis: proposal.story.hypothesis,
    acceptance_criteria: proposal.story.acceptance_criteria,
    validation: proposal.story.validation,
    evidence: proposal.evidence,
    governance: {
      review_required: true,
      risk_tier: proposal.project.risk_tier,
      merge_policy: mergePolicy,
    },
    paths,
    updated_at: isoTimestamp(),
  };

  await ensureDir(join(changeRoot, "specs"));
  await writeJson(join(changeRoot, "change.json"), changePackage);
  await Deno.writeTextFile(
    join(changeRoot, "proposal.md"),
    renderProposalMarkdown(proposal, changePackage),
  );
  await Deno.writeTextFile(
    join(changeRoot, "design.md"),
    renderDesignMarkdown(proposal, changePackage),
  );
  await Deno.writeTextFile(
    join(changeRoot, "tasks.md"),
    renderTasksMarkdown(proposal, changePackage),
  );
  await Deno.writeTextFile(
    join(changeRoot, "specs", `${proposal.vector}.md`),
    renderDeltaSpecMarkdown(proposal, changePackage),
  );

  return changePackage;
}

function renderProposalMarkdown(
  proposal: ImprovementProposal,
  changePackage: ChangePackage,
): string {
  return [
    `# ${proposal.story.title}`,
    ``,
    `## Summary`,
    proposal.story.summary,
    ``,
    `## Context`,
    `- change id: ${changePackage.change_id}`,
    `- project: ${proposal.project.key}`,
    `- vector: ${proposal.vector}`,
    `- change status: ${proposal.change.status}`,
    `- workflow contract: ${proposal.project.workflow.path ?? "not configured"}`,
    ``,
    `## Hypothesis`,
    proposal.story.hypothesis,
    ``,
    `## Observed Signals`,
    `- ${proposal.signal.target_metric}: ${JSON.stringify(proposal.signal.current_value)}`,
    `- baseline: ${JSON.stringify(proposal.signal.baseline_value)}`,
    `- pass: ${JSON.stringify(proposal.signal.pass)}`,
    ...renderGuardrailLines(proposal.signal.guardrails.details),
    ``,
    `## Acceptance Criteria`,
    ...proposal.story.acceptance_criteria.map((item) => `- ${item}`),
    ``,
    `## Validation`,
    ...proposal.story.validation.map((item) => `- ${item}`),
    ``,
    `## Evidence`,
    `- ${proposal.evidence.score_artifact}`,
    ...(proposal.evidence.baseline_artifact ? [`- ${proposal.evidence.baseline_artifact}`] : []),
    `- ${proposal.artifact_path}`,
    ``,
    `## Governance`,
    `- risk tier: ${proposal.project.risk_tier}`,
    `- merge policy: ${changePackage.governance.merge_policy}`,
    `- review required: true`,
    ``,
  ].join("\n");
}

function renderDesignMarkdown(proposal: ImprovementProposal, changePackage: ChangePackage): string {
  return [
    `# Design`,
    ``,
    `## Objective`,
    `Implement ${proposal.vector} work for project \`${proposal.project.key}\` while preserving the template's bounded planning-to-execution handoff.`,
    ``,
    `## Boundaries`,
    `- keep proposal generation and change-package scaffolding deterministic`,
    `- keep implementation and merge decisions outside the kernel`,
    `- keep human review required for governed changes`,
    ``,
    `## Planned Touchpoints`,
    `- proposal artifact: ${proposal.artifact_path}`,
    `- change package root: ${changePackage.paths.root}`,
    `- workflow contract: ${proposal.project.workflow.path ?? "not configured"}`,
    ``,
    `## Review Notes`,
    `- risk tier: ${proposal.project.risk_tier}`,
    `- merge policy: ${changePackage.governance.merge_policy}`,
    `- validation commands: ${proposal.story.validation.length}`,
    ``,
  ].join("\n");
}

function renderTasksMarkdown(proposal: ImprovementProposal, changePackage: ChangePackage): string {
  return [
    `# Tasks`,
    ``,
    `- [ ] Review ${changePackage.paths.proposal}`,
    `- [ ] Refine ${changePackage.paths.design} if implementation scope shifts`,
    `- [ ] Implement the ${proposal.vector} change in bounded scope`,
    `- [ ] Run validation commands recorded below`,
    `- [ ] Prepare review handoff with baseline, candidate, guardrails, and evidence`,
    ``,
    `## Validation Commands`,
    ...proposal.story.validation.map((item) => `- [ ] ${item}`),
    ``,
  ].join("\n");
}

function renderDeltaSpecMarkdown(
  proposal: ImprovementProposal,
  changePackage: ChangePackage,
): string {
  return [
    `# Delta Spec`,
    ``,
    `## Change`,
    `This change package captures the delta for ${proposal.story.title}.`,
    ``,
    `## Required Behavior`,
    ...proposal.story.acceptance_criteria.map((item) => `- ${item}`),
    ``,
    `## Source Artifacts`,
    `- ${changePackage.paths.proposal}`,
    `- ${proposal.artifact_path}`,
    `- ${proposal.evidence.score_artifact}`,
    ...(proposal.evidence.baseline_artifact ? [`- ${proposal.evidence.baseline_artifact}`] : []),
    ``,
  ].join("\n");
}

function renderGuardrailLines(details: string[]): string[] {
  if (details.length === 0) {
    return ["- guardrails: passed"];
  }
  return ["- guardrails:", ...details.map((detail) => `  - ${detail}`)];
}
