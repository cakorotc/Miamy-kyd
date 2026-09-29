import { Router } from "express";
import { z } from "zod";
import { getSetting, setSetting } from "../db.js";
import { changeCredentials, signToken } from "../auth.js";
import { logActivity } from "../activity.js";
import { requirePermission, type AuthedRequest } from "../auth.js";
import { setAuthCookie } from "./shared.js";

export const settingsRoutes = Router();

settingsRoutes.use(requirePermission("settings"));

settingsRoutes.get("/settings", (_req, res) => {
  res.json({
    xrayVersion: getSetting("xray_version") || "",
    subTitle: getSetting("sub_title") || "Meridian",
  });
});

settingsRoutes.put("/settings", (req: AuthedRequest, res) => {
  const body = z.object({ subTitle: z.string().optional() }).safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "invalid" });
    return;
  }
  if (body.data.subTitle !== undefined) setSetting("sub_title", body.data.subTitle);
  logActivity(req.admin!.username, "settings_update", "");
  res.json({ ok: true });
});

settingsRoutes.post("/settings/credentials", (req: AuthedRequest, res) => {
  const body = z
    .object({
      currentPassword: z.string().min(1),
      newUsername: z.string().min(3).optional(),
      newPassword: z.string().min(6).optional(),
    })
    .safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "invalid input" });
    return;
  }
  const result = changeCredentials(
    req.admin!.id,
    body.data.currentPassword,
    body.data.newUsername,
    body.data.newPassword,
  );
  if (!result.ok) {
    res.status(400).json({ error: result.error });
    return;
  }
  // The change bumped this admin's token_version, invalidating every session
  // (including other people logged in as the same user). Re-issue a fresh
  // cookie for the admin who made the change so they stay signed in.
  setAuthCookie(res, signToken({ id: req.admin!.id }));
  logActivity(req.admin!.username, "credentials_change", "");
  res.json({ ok: true });
});
