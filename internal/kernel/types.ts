export interface CommandResult {
  command: string[];
  cwd: string;
  exit_code: number;
  stdout: string;
  stderr: string;
  duration_ms: number;
}

export interface Guardrail {
  metric: string;
  op: "eq" | "neq" | "lt" | "lte" | "gt" | "gte";
  value: boolean | number | string;
}

export type RiskTier = "safe" | "moderate" | "risky" | "critical";

export type ChangeStatus = "not_created" | "draft" | "published";

export interface ScorecardScoringConfig {
  kind: "docs_hygiene" | "runtime_boot" | "artifact_json";
  artifact_path?: string;
}

export interface ScorecardProposalConfig {
  project_key?: string;
  title?: string;
  summary?: string;
  hypothesis?: string;
  labels?: string[];
  risk_tier?: RiskTier;
  acceptance_criteria?: string[];
  validation?: string[];
}

export interface Scorecard {
  id: string;
  summary: string;
  target: {
    metric: string;
    direction: "min" | "max";
  };
  promotion_rule: "non_regressing" | "strict_improving";
  guardrails: Guardrail[];
  budget_seconds: number;
  editable_globs: string[];
  scoring?: ScorecardScoringConfig;
  proposal?: ScorecardProposalConfig;
  evaluator: {
    kind: "command";
    command: string[];
  };
}

export interface PromotionResult {
  passed: boolean;
  summary: string;
}

export interface ExperimentOptions {
  vector: string;
  baselineRef?: string;
  candidateRef: string;
}

export interface LedgerEntry {
  id: string;
  vector: string;
  baseline_ref: string;
  candidate_ref: string;
  baseline: Record<string, unknown>;
  candidate: Record<string, unknown>;
  guardrails: {
    passed: boolean;
    details: string[];
  };
  verdict: "promote" | "revert";
  summary: string;
  changed_files: string[];
  artifacts: string[];
  created_at: string;
}

export interface SmokeArtifactInput {
  artifactPath: string;
  baseUrl: string;
  runId: string;
  runDir: string;
  logPath: string;
  healthPath: string;
  rootPath: string;
  metricsPath: string;
  port: number;
  healthStatus: number;
  rootStatus: number;
  metricsStatus: number;
}

export interface ProjectRegistryProject {
  display_name?: string;
  repo_url?: string;
  source_path?: string;
  workflow?: {
    path?: string;
  };
  validation?: string[];
  scorecards?: string[];
  risk_tier?: RiskTier;
  merge_policy?: Record<string, string>;
  tracker?: {
    kind?: string;
    project_slug?: string;
    routing_key?: string;
    backlog_state_name?: string;
  };
}

export interface ProjectRegistry {
  default_project?: string;
  projects: Record<string, ProjectRegistryProject>;
}

export interface ResolvedProject {
  display_name: string;
  repo_url?: string;
  source_path: string;
  workflow: {
    path?: string;
  };
  validation: string[];
  scorecards: string[];
  risk_tier: RiskTier;
  merge_policy: Record<string, string>;
  tracker: {
    kind?: string;
    project_slug?: string;
    routing_key?: string;
    backlog_state_name?: string;
  };
}

export interface ChangePackagePaths {
  root: string;
  proposal: string;
  design: string;
  tasks: string;
  specs_dir: string;
  delta_spec: string;
}

export interface ChangePackage {
  schema_version: 1;
  change_id: string;
  title: string;
  project_key: string;
  vector: string;
  status: Exclude<ChangeStatus, "not_created">;
  proposal_artifact: string;
  summary: string;
  hypothesis: string;
  acceptance_criteria: string[];
  validation: string[];
  evidence: {
    score_artifact: string;
    baseline_artifact?: string;
  };
  governance: {
    review_required: true;
    risk_tier: RiskTier;
    merge_policy: string;
  };
  paths: ChangePackagePaths;
  updated_at: string;
}

export interface ImprovementProposal {
  artifact_path: string;
  generated_at: string;
  vector: string;
  scorecard_summary: string;
  recommendation: "create_change_package" | "keep_monitoring";
  signal: {
    pass: boolean;
    target_metric: string;
    target_direction: "min" | "max";
    current_value: unknown;
    baseline_value: unknown;
    regressed: boolean | null;
    guardrails: {
      passed: boolean;
      details: string[];
    };
  };
  project: {
    key: string;
    display_name: string;
    repo_url?: string;
    source_path?: string;
    workflow: {
      path?: string;
    };
    validation: string[];
    scorecards: string[];
    risk_tier: RiskTier;
    merge_policy: Record<string, string>;
    tracker: {
      kind?: string;
      project_slug?: string;
      routing_key?: string;
      backlog_state_name?: string;
    };
  };
  change: {
    id: string;
    path: string;
    status: ChangeStatus;
  };
  story: {
    title: string;
    labels: string[];
    summary: string;
    hypothesis: string;
    acceptance_criteria: string[];
    validation: string[];
    handoff_markdown: string;
  };
  evidence: {
    score_artifact: string;
    baseline_artifact?: string;
  };
  governance: {
    review_required: true;
    risk_tier: RiskTier;
    merge_policy: Record<string, string>;
    execution_boundary: string;
  };
}
