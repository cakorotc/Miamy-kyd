import { Router } from "express";
import { z } from "zod";
import { listInbounds, setInboundEnabled, getInbound } from "../inbounds.js";
import { restartXray } from "../xray.js";
import { logActivity } from "../activity.js";
import { requirePermission, type AuthedRequest } from "../auth.js";

export const inboundRoutes = Router();

inboundRoutes.get("/inbounds", (_req, res) => {
  res.json(listInbounds());
});

inboundRoutes.patch("/inbounds/:id", requirePermission("inbounds"), async (req: AuthedRequest, res) => {
  const id = Number(req.params.id);
  const body = z.object({ enabled: z.boolean() }).safeParse(req.body);
  if (!body.success || !getInbound(id)) {
    res.status(400).json({ error: "invalid" });
    return;
  }
  setInboundEnabled(id, body.data.enabled);
  logActivity(req.admin!.username, "inbound_toggle", `#${id} -> ${body.data.enabled}`);
  restartXray();
  res.json({ ok: true });
});
