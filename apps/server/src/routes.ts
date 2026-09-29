import { Router } from "express";
import { authGuard } from "./auth.js";
import { publicAuth, meRoute } from "./routes/auth-routes.js";
import { systemRoutes } from "./routes/system-routes.js";
import { inboundRoutes } from "./routes/inbounds-routes.js";
import { userRoutes } from "./routes/users-routes.js";
import { activityRoutes } from "./routes/activity-routes.js";
import { settingsRoutes } from "./routes/settings-routes.js";
import { adminRoutes } from "./routes/admins-routes.js";
import { backupRoutes } from "./routes/backup-routes.js";
import { routingRoutes } from "./routes/routing-routes.js";
import { botRoutes } from "./routes/bot-routes.js";

export const api = Router();

// Public endpoints (no session required)
api.use(publicAuth);

// Everything below needs a valid admin session
api.use(authGuard);

api.use(meRoute);
api.use(systemRoutes);
api.use(inboundRoutes);
api.use("/users", userRoutes);
api.use(activityRoutes);
api.use(settingsRoutes);
api.use(adminRoutes);
api.use(backupRoutes);
api.use(routingRoutes);
api.use(botRoutes);
