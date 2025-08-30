import { FastifyInstance } from "fastify";
import { settingsService } from "../services/settings.service.js";

export default async function settingsRoutes(
  fastify: FastifyInstance
): Promise<void> {
  const auth = {
    preHandler: fastify.authenticate,
  };

  // Get user settings
  fastify.get("/", auth, settingsService.getSettings);

  // Update user settings
  fastify.put("/", auth, settingsService.updateSettings);

  // Upload avatar
  fastify.post("/avatar", auth, settingsService.uploadAvatar);
}
