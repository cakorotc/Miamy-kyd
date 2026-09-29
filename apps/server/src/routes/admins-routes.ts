import { Router } from "express";
import { z } from "zod";
import {
  createAdmin,
  updateAdmin,
  deleteAdmin,
  listAdminsWithStats,
  ALL_PERMISSIONS,
  requireOwner,
  type Permission,
  type AuthedRequest,
} from "../auth.js";
import { logActivity } from "../activity.js";

export const adminRoutes = Router();

const permissionEnum = z.enum([
  "dashboard",
  "users",
  "inbounds",
  "routing",
  "activity",
  "bot",
  "settings",
]);

adminRoutes.use(requireOwner);

adminRoutes.get("/admins", (_req, res) => {
  res.json({ admins: listAdminsWithStats(), permissions: ALL_PERMISSIONS });
});

adminRoutes.post("/admins", (req: AuthedRequest, res) => {
  const body = z
    .object({
      username: z.string().min(3),
      password: z.string().min(6),
      permissions: z.array(permissionEnum),
      dataLimit: z.number().min(0).default(0),
    })
    .safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "invalid input" });
    return;
  }
  const result = createAdmin(
    body.data.username,
    body.data.password,
    body.data.permissions as Permission[],
    body.data.dataLimit,
  );
  if (!result.ok) {
    res.status(400).json({ error: result.error });
    return;
  }
  logActivity(req.admin!.username, "admin_create", body.data.username);
  res.json({ ok: true });
});

adminRoutes.put("/admins/:id", (req: AuthedRequest, res) => {
  const body = z
    .object({
      permissions: z.array(permissionEnum).optional(),
      dataLimit: z.number().min(0).optional(),
      password: z.string().min(6).optional(),
    })
    .safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "invalid input" });
    return;
  }
  const result = updateAdmin(Number(req.params.id), {
    permissions: body.data.permissions as Permission[] | undefined,
    dataLimit: body.data.dataLimit,
    password: body.data.password,
  });
  if (!result.ok) {
    res.status(400).json({ error: result.error });
    return;
  }
  logActivity(req.admin!.username, "admin_update", `#${req.params.id}`);
  res.json({ ok: true });
});

adminRoutes.delete("/admins/:id", (req: AuthedRequest, res) => {
  const result = deleteAdmin(Number(req.params.id));
  if (!result.ok) {
    res.status(400).json({ error: result.error });
    return;
  }
  logActivity(req.admin!.username, "admin_delete", `#${req.params.id}`);
  res.json({ ok: true });
});
