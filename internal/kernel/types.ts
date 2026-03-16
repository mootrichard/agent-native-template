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

export interface ScorecardScoringConfig {
  kind: "docs_hygiene" | "runtime_boot";
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
  scoring: ScorecardScoringConfig;
  evaluator: {
    kind: "command";
    command: string[];
  };
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
