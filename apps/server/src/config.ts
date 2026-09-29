import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import crypto from "node:crypto";

const dataDir = process.env.MERIDIAN_DATA_DIR || path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const xrayDir = process.env.XRAY_DIR || path.join(dataDir, "xray");
if (!fs.existsSync(xrayDir)) fs.mkdirSync(xrayDir, { recursive: true });

/**
 * The panel was renamed from an earlier codebase. Deployments that already
 * have a database under the legacy file name keep it: the file is moved to
 * the new name on first boot so no data is lost.
 */
function resolveDbPath(): string {
  const dbPath = path.join(dataDir, "meridian.db");
  const legacyPath = path.join(dataDir, "siderail.db");
  if (!fs.existsSync(dbPath) && fs.existsSync(legacyPath)) {
    try {
      fs.renameSync(legacyPath, dbPath);
      for (const suffix of ["-wal", "-shm"]) {
        const legacySidecar = `${legacyPath}${suffix}`;
        if (fs.existsSync(legacySidecar)) {
          fs.renameSync(legacySidecar, `${dbPath}${suffix}`);
        }
      }
    } catch {
      /* fall back to creating a fresh database */
    }
  }
  return dbPath;
}

function resolveSecret(): string {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  const secretFile = path.join(dataDir, ".jwt-secret");
  try {
    if (fs.existsSync(secretFile)) return fs.readFileSync(secretFile, "utf8").trim();
    const generated = crypto.randomBytes(48).toString("hex");
    fs.writeFileSync(secretFile, generated, { mode: 0o600 });
    return generated;
  } catch {
    return crypto.randomBytes(48).toString("hex");
  }
}

export const config = {
  dataDir,
  xrayDir,
  dbPath: resolveDbPath(),
  xrayAccessLog: path.join(xrayDir, "access.log"),
  port: Number(process.env.PORT || 8080),
  host: "0.0.0.0",
  jwtSecret: resolveSecret(),
  xrayVersion: process.env.XRAY_VERSION || "v26.9.9",
  xrayApiPort: Number(process.env.XRAY_API_PORT || 10085),
  inboundBasePort: Number(process.env.XRAY_INBOUND_BASE_PORT || 20000),
  publicDomain: process.env.PUBLIC_DOMAIN || process.env.RAILWAY_PUBLIC_DOMAIN || "",
  isProd: process.env.NODE_ENV === "production",
  platform: os.platform(),
  arch: os.arch(),
};

export function publicHost(reqHost?: string): string {
  if (config.publicDomain) return config.publicDomain;
  if (reqHost) return reqHost.split(":")[0];
  return "localhost";
}
