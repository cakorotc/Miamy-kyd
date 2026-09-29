import { Router } from "express";
import { z } from "zod";
import {
  listRoutingRules,
  addRoutingRule,
  updateRoutingRule,
  deleteRoutingRule,
} from "../routing.js";
import { DOMAIN_PRESETS, COUNTRY_IP_PRESETS } from "../routing-presets.js";
import { restartXray } from "../xray.js";
import { logActivity } from "../activity.js";
import { requirePermission, type AuthedRequest } from "../auth.js";

export const routingRoutes = Router();

routingRoutes.use(requirePermission("routing"));

routingRoutes.get("/routing", (_req, res) => {
  res.json(listRoutingRules());
});

routingRoutes.get("/routing/presets", (_req, res) => {
  res.json({ domains: DOMAIN_PRESETS, ips: COUNTRY_IP_PRESETS });
});

routingRoutes.post("/routing", async (req: AuthedRequest, res) => {
  const body = z
    .object({
      domain: z.string().min(1),
      inboundIds: z.array(z.number()).default([]),
      kind: z.enum(["domain", "ip"]).default("domain"),
      label: z.string().optional(),
    })
    .safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "invalid input" });
    return;
  }
  const rule = addRoutingRule(
    body.data.domain,
    body.data.inboundIds,
    body.data.kind,
    body.data.label || "",
  );
  logActivity(req.admin!.username, "routing_add", body.data.label || body.data.domain);
  restartXray();
  res.json(rule);
});

routingRoutes.put("/routing/:id", async (req: AuthedRequest, res) => {
  const body = z.object({ inboundIds: z.array(z.number()) }).safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "invalid input" });
    return;
  }
  updateRoutingRule(Number(req.params.id), body.data.inboundIds);
  logActivity(req.admin!.username, "routing_update", `#${req.params.id}`);
  restartXray();
  res.json({ ok: true });
});

routingRoutes.delete("/routing/:id", async (req: AuthedRequest, res) => {
  deleteRoutingRule(Number(req.params.id));
  logActivity(req.admin!.username, "routing_delete", `#${req.params.id}`);
  restartXray();
  res.json({ ok: true });
});
