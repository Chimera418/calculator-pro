#!/usr/bin/env node
/**
 * Sync .env.vercel -> Vercel environment variables.
 *
 * .env.vercel is gitignored (it holds secrets), so this can only run locally.
 * Vercel has no bulk "push", so each var is removed then re-added via the CLI.
 * A hash of the file is cached so unchanged files are skipped (the pre-push
 * hook calls this on every push to main; we don't want to churn secrets when
 * nothing changed).
 *
 * Usage:
 *   node scripts/sync-vercel-env.mjs            # sync if the file changed
 *   node scripts/sync-vercel-env.mjs --force    # sync regardless of the cache
 *   node scripts/sync-vercel-env.mjs --dry-run  # show what would change, no writes
 *   node scripts/sync-vercel-env.mjs --env preview   # target a different env
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

const ENV_FILE = ".env.vercel";
const HASH_FILE = ".vercel/.env-sync-hash";

const argv = process.argv.slice(2);
const force = argv.includes("--force");
const dryRun = argv.includes("--dry-run");
const envIdx = argv.indexOf("--env");
const TARGET = envIdx !== -1 ? argv[envIdx + 1] : "production";

if (!existsSync(ENV_FILE)) {
  console.log(`[env-sync] ${ENV_FILE} not found — nothing to sync.`);
  process.exit(0);
}

const raw = readFileSync(ENV_FILE, "utf8");
const hash = createHash("sha256").update(`${TARGET}\n${raw}`).digest("hex");

if (
  !force &&
  !dryRun &&
  existsSync(HASH_FILE) &&
  readFileSync(HASH_FILE, "utf8").trim() === hash
) {
  console.log("[env-sync] .env.vercel unchanged since last sync — skipping.");
  process.exit(0);
}

// Parse KEY=VALUE lines (skip blanks/comments, strip matching quotes).
const vars = [];
for (const line of raw.split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i === -1) continue;
  const key = t.slice(0, i).trim();
  let val = t.slice(i + 1).trim();
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    val = val.slice(1, -1);
  }
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
    console.warn(`[env-sync] skipping invalid key: ${key}`);
    continue;
  }
  vars.push([key, val]);
}

console.log(
  `[env-sync] ${dryRun ? "DRY RUN — " : ""}syncing ${vars.length} vars to Vercel "${TARGET}"…`,
);

const vercel = (args, input) =>
  spawnSync("vercel", args, { input, encoding: "utf8", shell: true });

let ok = 0;
let failed = 0;
for (const [key, val] of vars) {
  if (dryRun) {
    console.log(`  would set ${key} (value length ${val.length})`);
    ok++;
    continue;
  }
  // Remove any existing value (ignored if absent), then add the current one.
  vercel(["env", "rm", key, TARGET, "-y"]);
  const res = vercel(["env", "add", key, TARGET], val);
  if (res.status === 0) {
    console.log(`  ✓ ${key}`);
    ok++;
  } else {
    const msg = (res.stderr || res.stdout || "").trim().split("\n").pop();
    console.error(`  ✗ ${key}: ${msg}`);
    failed++;
  }
}

if (!dryRun && failed === 0) {
  mkdirSync(".vercel", { recursive: true });
  writeFileSync(HASH_FILE, hash);
}

console.log(`[env-sync] done — ${ok} ok, ${failed} failed.`);
if (!dryRun && failed === 0) {
  console.log(`[env-sync] Note: env changes apply on the next deploy.`);
}
process.exit(failed ? 1 : 0);
