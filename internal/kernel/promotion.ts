import { join } from "node:path";

import {
  isoTimestamp,
  latestLedgerEntryPath,
  readJson,
  repoRelative,
  runCommand,
  writeJson,
} from "./helpers.ts";
import type { LedgerEntry } from "./types.ts";

export async function promoteLatest(
  root: string,
  options: { ledgerPath?: string; vector?: string },
): Promise<string> {
  const ledgerPath = options.ledgerPath ??
    await latestLedgerEntryPath(join(root, "improvement", "ledger", "experiments"), options.vector);
  if (!ledgerPath) {
    throw new Error("No ledger entry available for promotion.");
  }
  const entry = await readJson<LedgerEntry>(ledgerPath);
  if (entry.verdict !== "promote") {
    throw new Error(`Refusing promotion because ledger verdict is '${entry.verdict}'.`);
  }
  const result = await runCommand(["git", "merge", "--ff-only", entry.candidate_ref], {
    cwd: root,
    timeoutMs: 60_000,
  });
  if (result.exit_code !== 0) {
    throw new Error([result.stderr, result.stdout].filter(Boolean).join("\n").trim());
  }
  return `Promoted ${entry.candidate_ref} using ${
    repoRelative(root, ledgerPath)
  } (summary: ${entry.summary})`;
}

export async function revertLatest(
  root: string,
  options: { ledgerPath?: string; vector?: string; deleteBranch?: boolean },
): Promise<Record<string, unknown>> {
  const ledgerPath = options.ledgerPath ??
    await latestLedgerEntryPath(join(root, "improvement", "ledger", "experiments"), options.vector);
  if (!ledgerPath) {
    throw new Error("No ledger entry available for revert handling.");
  }
  const entry = await readJson<LedgerEntry>(ledgerPath);

  let deletedBranch = false;
  if (options.deleteBranch && await branchExists(root, entry.candidate_ref)) {
    if (await currentBranch(root) === entry.candidate_ref) {
      throw new Error("Refusing to delete the currently checked out branch.");
    }
    const result = await runCommand(["git", "branch", "-D", entry.candidate_ref], {
      cwd: root,
      timeoutMs: 30_000,
    });
    if (result.exit_code !== 0) {
      throw new Error([result.stderr, result.stdout].filter(Boolean).join("\n").trim());
    }
    deletedBranch = true;
  }

  const artifactPath = join(root, "docs", "generated", "improvement", `${entry.id}-revert.json`);
  const artifact: Record<string, unknown> = {
    artifact_path: repoRelative(root, artifactPath),
    candidate_ref: entry.candidate_ref,
    deleted_branch: deletedBranch,
    ledger_entry: repoRelative(root, ledgerPath),
    summary: entry.summary,
    timestamp: isoTimestamp(),
    verdict: entry.verdict,
  };
  await writeJson(artifactPath, artifact);
  return artifact;
}

async function branchExists(root: string, branch: string): Promise<boolean> {
  const result = await runCommand(["git", "rev-parse", "--verify", `refs/heads/${branch}`], {
    cwd: root,
    timeoutMs: 10_000,
  });
  return result.exit_code === 0;
}

async function currentBranch(root: string): Promise<string> {
  const result = await runCommand(["git", "branch", "--show-current"], {
    cwd: root,
    timeoutMs: 10_000,
  });
  return result.stdout.trim();
}
