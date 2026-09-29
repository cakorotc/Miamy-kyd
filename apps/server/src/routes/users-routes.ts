import { Router } from "express";
import { z } from "zod";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  setUserEnabled,
  resetUserTraffic,
  rotateSubToken,
  getUser,
  summarize,
} from "../users.js";
import { getClientIps, restartXray } from "../xray.js";
import { logActivity } from "../activity.js";
import { requirePermission, type AuthedRequest } from "../auth.js";

export const userRoutes = Router();

const trafficReset = z.enum(["never", "daily", "weekly", "monthly"]);

export const userSchema = z.object({
  email: z.string().min(1),
  uuid: z.string().optional(),
  password: z.string().optional(),
  fingerprint: z.string().optional(),
  alpn: z.string().optional(),
  dataLimit: z.number().min(0).optional(),
  ipLimit: z.number().min(0).optional(),
  expireDays: z.number().min(0).optional(),
  subExpireDays: z.number().min(0).optional(),
  trafficReset: trafficReset.optional(),
  telegramId: z.string().optional(),
  comment: z.string().optional(),
  inboundIds: z.array(z.number()).optional(),
});

export const updateUserSchema = userSchema.partial().extend({ enabled: z.boolean().optional() });

function scopeFor(req: AuthedRequest): number | undefined {
  return req.admin!.role === "owner" ? undefined : req.admin!.id;
}

function canAccessUser(req: AuthedRequest, userId: number): boolean {
  if (req.admin!.role === "owner") return true;
  const user = getUser(userId);
  return !!user && user.created_by === req.admin!.id;
}

function quotaExceeded(req: AuthedRequest): boolean {
  if (req.admin!.role === "owner" || req.admin!.dataLimit <= 0) return false;
  const users = listUsers(req.admin!.id);
  const used = users.reduce((sum, u) => sum + u.total, 0);
  return used >= req.admin!.dataLimit;
}

userRoutes.use(requirePermission("users"));

userRoutes.get("/", (req: AuthedRequest, res) => {
  const users = listUsers(scopeFor(req));
  res.json({ users, summary: summarize(users) });
});

userRoutes.get("/summary", (req: AuthedRequest, res) => {
  res.json(summarize(listUsers(scopeFor(req))));
});

userRoutes.get("/:id/ips", (req: AuthedRequest, res) => {
  if (!canAccessUser(req, Number(req.params.id))) {
    res.status(403).json({ error: "forbidden" });
    return;
  }
  res.json(getClientIps(Number(req.params.id)));
});

userRoutes.get("/:id", (req: AuthedRequest, res) => {
  if (!canAccessUser(req, Number(req.params.id))) {
    res.status(403).json({ error: "forbidden" });
    return;
  }
  const user = getUser(Number(req.params.id));
  if (!user) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.json(user);
});

userRoutes.post("/", async (req: AuthedRequest, res) => {
  const body = userSchema.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "invalid input", detail: body.error.flatten() });
    return;
  }
  if (quotaExceeded(req)) {
    res.status(403).json({ error: "data quota exceeded" });
    return;
  }
  try {
    const user = createUser({ ...body.data, createdBy: req.admin!.id });
    logActivity(req.admin!.username, "user_create", user.email);
    restartXray();
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

userRoutes.put("/:id", async (req: AuthedRequest, res) => {
  if (!canAccessUser(req, Number(req.params.id))) {
    res.status(403).json({ error: "forbidden" });
    return;
  }
  const body = updateUserSchema.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "invalid input" });
    return;
  }
  const user = updateUser(Number(req.params.id), body.data);
  if (!user) {
    res.status(404).json({ error: "not found" });
    return;
  }
  logActivity(req.admin!.username, "user_update", user.email);
  restartXray();
  res.json(user);
});

userRoutes.delete("/:id", async (req: AuthedRequest, res) => {
  if (!canAccessUser(req, Number(req.params.id))) {
    res.status(403).json({ error: "forbidden" });
    return;
  }
  const user = getUser(Number(req.params.id));
  deleteUser(Number(req.params.id));
  logActivity(req.admin!.username, "user_delete", user?.email || String(req.params.id));
  restartXray();
  res.json({ ok: true });
});

userRoutes.post("/:id/toggle", async (req: AuthedRequest, res) => {
  if (!canAccessUser(req, Number(req.params.id))) {
    res.status(403).json({ error: "forbidden" });
    return;
  }
  const body = z.object({ enabled: z.boolean() }).safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "invalid" });
    return;
  }
  setUserEnabled(Number(req.params.id), body.data.enabled);
  logActivity(req.admin!.username, "user_toggle", `#${req.params.id} -> ${body.data.enabled}`);
  restartXray();
  res.json({ ok: true });
});

userRoutes.post("/:id/reset-traffic", (req: AuthedRequest, res) => {
  if (!canAccessUser(req, Number(req.params.id))) {
    res.status(403).json({ error: "forbidden" });
    return;
  }
  resetUserTraffic(Number(req.params.id));
  logActivity(req.admin!.username, "user_reset_traffic", `#${req.params.id}`);
  res.json({ ok: true });
});

userRoutes.post("/:id/rotate-token", (req: AuthedRequest, res) => {
  if (!canAccessUser(req, Number(req.params.id))) {
    res.status(403).json({ error: "forbidden" });
    return;
  }
  rotateSubToken(Number(req.params.id));
  logActivity(req.admin!.username, "user_rotate_token", `#${req.params.id}`);
  res.json(getUser(Number(req.params.id)));
});
