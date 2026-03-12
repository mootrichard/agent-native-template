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
