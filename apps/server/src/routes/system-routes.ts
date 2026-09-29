import { Router } from "express";
import { getSystemStats } from "../system.js";
import { getServerTraffic, getInboundTraffic, restartXray } from "../xray.js";
import { logActivity } from "../activity.js";
import { requirePermission, type AuthedRequest } from "../auth.js";

export const systemRoutes = Router();

systemRoutes.get("/system", requirePermission("dashboard"), (_req, res) => {
  res.json(getSystemStats());
});

systemRoutes.post("/system/restart-xray", requirePermission("dashboard"), (req: AuthedRequest, res) => {
  restartXray();
  logActivity(req.admin!.username, "xray_restart", "");
  res.json({ ok: true });
});

systemRoutes.get("/stats/traffic", requirePermission("dashboard"), (_req, res) => {
  res.json({ server: getServerTraffic(), inbounds: getInboundTraffic() });
});
