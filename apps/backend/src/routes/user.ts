import { FastifyInstance } from "fastify";
import { userService } from "../services/user.service.js";

export default async function userRoutes(
  fastify: FastifyInstance
): Promise<void> {
  const adminOnly = {
    preHandler: [fastify.authenticate, fastify.requireRoles(["ADMIN"])],
  };

  // List all users - Admin only
  fastify.get("/", adminOnly, userService.listUsers);

  // Get user statistics - Admin only
  fastify.get("/stats", adminOnly, userService.getUserStats);

  // Create new user - Admin only
  fastify.post("/", adminOnly, userService.createUser);

  // Get user by ID - Admin only
  fastify.get("/:id", adminOnly, userService.getUserById);
  // Update user - Admin only
  fastify.put("/:id", adminOnly, userService.updateUser);

  // Toggle user status - Admin only
  fastify.patch("/:id/status", adminOnly, userService.toggleUserStatus);

  // Delete user - Admin only
  fastify.delete("/:id", adminOnly, userService.deleteUser);

  // Get available roles - Admin only
  fastify.get("/roles", adminOnly, userService.getRoles);
}
