export const roleSchemas = {
  listRolesSchema: {
    response: {
      200: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                description: { type: "string" },
                userCount: { type: "number" },
                isActive: { type: "boolean" },
                permissions: {
                  type: "array",
                  items: { type: "string" },
                },
                color: { type: "string" },
                icon: { type: "string" },
              },
            },
          },
        },
      },
    },
  },

  getRolePermissionsSchema: {
    params: {
      type: "object",
      required: ["role"],
      properties: {
        role: { type: "string" },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          role: { type: "string" },
          permissions: {
            type: "array",
            items: { type: "string" },
          },
          groups: {
            type: "object",
            additionalProperties: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
      },
    },
  },

  getRoleStatsSchema: {
    params: {
      type: "object",
      required: ["role"],
      properties: {
        role: { type: "string" },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          role: { type: "string" },
          userCount: { type: "number" },
          activeUsers: { type: "number" },
          lastLogin: { type: "string", format: "date-time" },
          createdThisMonth: { type: "number" },
        },
      },
    },
  },

  updateRolePermissionsSchema: {
    params: {
      type: "object",
      required: ["role"],
      properties: {
        role: { type: "string" },
      },
    },
    body: {
      type: "object",
      required: ["permissions"],
      properties: {
        permissions: {
          type: "array",
          items: { type: "string" },
        },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
        },
      },
    },
  },
};
