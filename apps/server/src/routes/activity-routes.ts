import { Router } from "express";
import { listActivity, logActivity, clearActivity } from "../activity.js";
import { requirePermission, type AuthedRequest } from "../auth.js";

export const activityRoutes = Router();

activityRoutes.use(requirePermission("activity"));

activityRoutes.get("/activity", (_req, res) => {
  res.json(listActivity(300));
});

activityRoutes.delete("/activity", (req: AuthedRequest, res) => {
  clearActivity();
  logActivity(req.admin!.username, "activity_clear", "");
  res.json({ ok: true });
});
