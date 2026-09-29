import { Router } from "express";
import { z } from "zod";
import { getBotConfig, saveBotConfig, testBot } from "../bot.js";
import { logActivity } from "../activity.js";
import { requirePermission, type AuthedRequest } from "../auth.js";

export const botRoutes = Router();

botRoutes.use(requirePermission("bot"));

botRoutes.get("/bot", (_req, res) => {
  const cfg = getBotConfig();
  res.json({ enabled: cfg.enabled, token: cfg.token, chatIds: cfg.chatIds, dailyBackup: cfg.dailyBackup });
});

botRoutes.put("/bot", (req: AuthedRequest, res) => {
  const body = z
    .object({
      enabled: z.boolean().optional(),
      token: z.string().optional(),
      chatIds: z.array(z.string()).optional(),
      dailyBackup: z.boolean().optional(),
    })
    .safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "invalid input" });
    return;
  }
  saveBotConfig(body.data);
  logActivity(req.admin!.username, "bot_update", "");
  res.json({ ok: true });
});

botRoutes.post("/bot/test", async (req: AuthedRequest, res) => {
  const body = z
    .object({ token: z.string().min(1), chatIds: z.array(z.string()).min(1) })
    .safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "token and at least one chat id are required" });
    return;
  }
  const result = await testBot(body.data.token, body.data.chatIds);
  if (!result.ok) {
    res.status(400).json({ error: result.error });
    return;
  }
  logActivity(req.admin!.username, "bot_test", "");
  res.json({ ok: true });
});
