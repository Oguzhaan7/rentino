import { FastifyInstance } from "fastify";
import { roleService } from "../services/role.service";
import { roleSchemas } from "../schemas/role.schema";

export default async function roleRoutes(
  fastify: FastifyInstance
): Promise<void> {
  const adminAuth = {
    preHandler: [fastify.authenticate, fastify.isAdmin],
  };

  // Get all roles with statistics
  fastify.get(
    "/",
    {
      schema: roleSchemas.listRolesSchema,
      ...adminAuth,
    },
    roleService.listRoles
  );

  // Get role permissions
  fastify.get(
    "/:role/permissions",
    {
      schema: roleSchemas.getRolePermissionsSchema,
      ...adminAuth,
    },
    roleService.getRolePermissions
  );

  // Get role statistics
  fastify.get(
    "/:role/stats",
    {
      schema: roleSchemas.getRoleStatsSchema,
      ...adminAuth,
    },
    roleService.getRoleStats
  );

  // Update role permissions (future feature)
  fastify.put(
    "/:role/permissions",
    {
      schema: roleSchemas.updateRolePermissionsSchema,
      ...adminAuth,
    },
    roleService.updateRolePermissions
  );
}
