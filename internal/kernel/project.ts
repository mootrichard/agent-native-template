import { join } from "node:path";

import { exists, readJson } from "./helpers.ts";
import type { ProjectRegistry, ResolvedProject, RiskTier, Scorecard } from "./types.ts";

export const DEFAULT_PROJECT_KEY = "default";
export const DEFAULT_MERGE_POLICY = {
  safe: "auto_if_green",
  moderate: "one_human",
  risky: "two_humans",
  critical: "manual_only",
} satisfies Record<RiskTier, string>;

export async function loadOptionalProjectRegistry(
  root: string,
): Promise<ProjectRegistry | undefined> {
  const path = join(root, "projects", "registry.json");
  if (!await exists(path)) {
    return undefined;
  }
  return await readJson<ProjectRegistry>(path);
}

export function resolveProject(
  registry: ProjectRegistry | undefined,
  scorecard: Scorecard,
  projectKey: string,
): ResolvedProject {
  const project = registry?.projects?.[projectKey];
  return {
    display_name: project?.display_name ?? projectKey,
    repo_url: project?.repo_url,
    source_path: project?.source_path ?? ".",
    workflow: {
      path: project?.workflow?.path,
    },
    validation: uniqueList(project?.validation ?? []),
    scorecards: uniqueList(project?.scorecards ?? [scorecard.id]),
    risk_tier: project?.risk_tier ?? scorecard.proposal?.risk_tier ?? "moderate",
    merge_policy: {
      ...DEFAULT_MERGE_POLICY,
      ...(project?.merge_policy ?? {}),
    },
    tracker: {
      kind: project?.tracker?.kind,
      project_slug: project?.tracker?.project_slug,
      routing_key: project?.tracker?.routing_key,
      backlog_state_name: project?.tracker?.backlog_state_name,
    },
  };
}

function uniqueList(values: Array<string | undefined>): string[] {
  return [
    ...new Set(
      values.filter((value): value is string => typeof value === "string" && value.trim() !== ""),
    ),
  ];
}
