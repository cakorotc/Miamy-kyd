import { Router } from "express";
import { z } from "zod";
import {
  isSetupDone,
  completeSetup,
  verifyCredentials,
  signToken,
  type AuthedRequest,
} from "../auth.js";
import { logActivity } from "../activity.js";
import { loginRateLimit } from "../ratelimit.js";
import { setAuthCookie } from "./shared.js";

export const publicAuth = Router();

publicAuth.get("/status", (_req, res) => {
  res.json({ setup: isSetupDone(), name: "Meridian" });
});

publicAuth.post("/setup", (req, res) => {
  if (isSetupDone()) {
    res.status(400).json({ error: "already set up" });
    return;
  }
  const body = z
    .object({ username: z.string().min(3), password: z.string().min(6) })
    .safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "invalid input" });
    return;
  }
  completeSetup(body.data.username, body.data.password);
  logActivity(body.data.username, "setup", "panel initialized");
  const admin = verifyCredentials(body.data.username, body.data.password)!;
  const token = signToken(admin);
  setAuthCookie(res, token);
  res.json({ ok: true, token });
});

publicAuth.post("/login", loginRateLimit, (req, res) => {
  const body = z.object({ username: z.string(), password: z.string() }).safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "invalid input" });
    return;
  }
  const admin = verifyCredentials(body.data.username, body.data.password);
  if (!admin) {
    logActivity(body.data.username, "login_failed", "");
    res.status(401).json({ error: "invalid credentials" });
    return;
  }
  const token = signToken(admin);
  setAuthCookie(res, token);
  logActivity(admin.username, "login", "");
  res.json({ ok: true, token });
});

publicAuth.post("/logout", (_req, res) => {
  res.clearCookie("mrd_token");
  res.json({ ok: true });
});

export const meRoute = Router();

meRoute.get("/me", (req: AuthedRequest, res) => {
  res.json({ admin: req.admin });
});
