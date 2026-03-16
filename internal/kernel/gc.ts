import { join } from "node:path";

import {
  exists,
  isoTimestamp,
  isSourceCandidate,
  repoRelative,
  runCommand,
  writeJson,
} from "./helpers.ts";

export async function runDocGardening(
  root: string,
  options: { maxAgeDays?: number; mode?: "warn" | "fail"; artifactPath?: string } = {},
): Promise<Record<string, unknown>> {
  const maxAgeDays = options.maxAgeDays ?? 180;
  const mode = options.mode ?? "warn";
  const artifactPath = options.artifactPath ??
    join(root, ".tmp", "improvement", "gc-doc-gardening.json");
  const tracked = await trackedDocs(root);
  const staleDocs: Array<Record<string, unknown>> = [];
  const missingMetadata: string[] = [];

  for (const path of tracked) {
    const text = await Deno.readTextFile(path);
    const match = text.match(/^Last verified:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})$/m);
    if (!match) {
      missingMetadata.push(repoRelative(root, path));
      continue;
    }
    const verified = new Date(`${match[1]}T00:00:00Z`);
    const ageDays = Math.floor((Date.now() - verified.getTime()) / 86_400_000);
    if (ageDays > maxAgeDays) {
      staleDocs.push({
        age_days: ageDays,
        last_verified: match[1],
        path: repoRelative(root, path),
      });
    }
  }

  const payload: Record<string, unknown> = {
    artifact_path: repoRelative(root, artifactPath),
    generated_at: isoTimestamp(),
    max_age_days: maxAgeDays,
    missing_metadata: missingMetadata,
    mode,
    stale_count: staleDocs.length,
    stale_docs: staleDocs,
  };
  await writeJson(artifactPath, payload);
  if (mode === "fail" && (staleDocs.length > 0 || missingMetadata.length > 0)) {
    throw new Error("Stale docs or missing metadata detected.");
  }
  return payload;
}

async function trackedDocs(root: string): Promise<string[]> {
  const docs: string[] = [];
  for (
    const path of [
      join(root, "AGENTS.md"),
      join(root, "WORKFLOW.md"),
      join(root, "README.md"),
      join(root, "ARCHITECTURE.md"),
    ]
  ) {
    if (await exists(path)) {
      docs.push(path);
    }
  }
  const stack = [join(root, "docs")];
  while (stack.length > 0) {
    const current = stack.pop()!;
    for await (const entry of Deno.readDir(current)) {
      const path = join(current, entry.name);
      if (entry.isDirectory) {
        stack.push(path);
      } else if (entry.isFile && path.endsWith(".md")) {
        docs.push(path);
      }
    }
  }
  return docs.sort();
}

export async function runFileSizeScan(
  root: string,
  options: { maxLines?: number; artifactPath?: string } = {},
): Promise<Record<string, unknown>> {
  const maxLines = options.maxLines ?? 300;
  const artifactPath = options.artifactPath ??
    join(root, ".tmp", "improvement", "gc-file-size-scan.json");
  const result = await runCommand(["git", "ls-files"], { cwd: root, timeoutMs: 15_000 });
  if (result.exit_code !== 0) {
    throw new Error(result.stderr.trim() || "git ls-files failed.");
  }
  const oversizedFiles: Array<Record<string, unknown>> = [];
  for (const relativePath of result.stdout.split("\n").filter((line) => line.trim() !== "")) {
    const path = join(root, relativePath);
    if (!await exists(path)) {
      continue;
    }
    if (!isSourceCandidate(path)) {
      continue;
    }
    const text = await Deno.readTextFile(path);
    const lines = text === "" ? 0 : text.split("\n").length;
    if (lines > maxLines) {
      oversizedFiles.push({
        lines,
        path: repoRelative(root, path),
      });
    }
  }
  const payload: Record<string, unknown> = {
    artifact_path: repoRelative(root, artifactPath),
    generated_at: isoTimestamp(),
    max_lines: maxLines,
    oversized_count: oversizedFiles.length,
    oversized_files: oversizedFiles,
  };
  await writeJson(artifactPath, payload);
  return payload;
}
