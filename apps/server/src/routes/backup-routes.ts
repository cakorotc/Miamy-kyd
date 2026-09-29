import { Router } from "express";
import { exportData, importData } from "../backup.js";
import { restartXray } from "../xray.js";
import { logActivity } from "../activity.js";
import { requirePermission, type AuthedRequest } from "../auth.js";

export const backupRoutes = Router();

backupRoutes.get("/backup/export", requirePermission("dashboard"), (req: AuthedRequest, res) => {
  logActivity(req.admin!.username, "backup_export", "");
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="meridian-backup-${Date.now()}.json"`);
  res.send(JSON.stringify(exportData(), null, 2));
});

backupRoutes.post("/backup/import", requirePermission("dashboard"), async (req: AuthedRequest, res) => {
  try {
    const result = importData(req.body);
    logActivity(
      req.admin!.username,
      "backup_import",
      `${result.users} users, ${result.inbounds} inbounds`,
    );
    restartXray();
    res.json({ ok: true, ...result });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});
