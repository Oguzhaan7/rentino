export const tenantSchemas = {
  // Tenant oluşturma şeması
  createTenantSchema: {
    body: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string" },
        domain: { type: "string" },
        isActive: { type: "boolean" },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          domain: { type: "string", nullable: true },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    },
  },

  // Tenant listeleme şeması
  listTenantsSchema: {
    querystring: {
      type: "object",
      properties: {
        page: { type: "integer", minimum: 1, default: 1 },
        limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
        orderBy: { type: "string", default: "name:asc" },
        isActive: { type: "boolean" },
        search: { type: "string" },
      },
    },
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
                domain: { type: "string", nullable: true },
                isActive: { type: "boolean" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
                _count: {
                  type: "object",
                  properties: {
                    users: { type: "integer" },
                    properties: { type: "integer" },
                  },
                },
              },
            },
          },
          pagination: {
            type: "object",
            properties: {
              total: { type: "integer" },
              page: { type: "integer" },
              limit: { type: "integer" },
              totalPages: { type: "integer" },
            },
          },
        },
      },
    },
  },

  // Tenant detayı şeması
  getTenantSchema: {
    params: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          domain: { type: "string", nullable: true },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    },
  },

  // Tenant güncelleme şeması
  updateTenantSchema: {
    params: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
      },
    },
    body: {
      type: "object",
      properties: {
        name: { type: "string" },
        domain: { type: "string" },
        isActive: { type: "boolean" },
      },
      minProperties: 1,
    },
    response: {
      200: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          domain: { type: "string", nullable: true },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    },
  },

  // Tenant silme şeması
  deleteTenantSchema: {
    params: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
      },
    },
    querystring: {
      type: "object",
      properties: {
        permanent: { type: "boolean", default: false },
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

  // Tenant istatistikleri şeması
  tenantStatsSchema: {
    params: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          tenantId: { type: "string" },
          tenantName: { type: "string" },
          stats: {
            type: "object",
            properties: {
              userCount: { type: "integer" },
              propertyCount: { type: "integer" },
              buildingCount: { type: "integer" },
              contractCount: { type: "integer" },
              activeContractCount: { type: "integer" },
              transactionCount: { type: "integer" },
            },
          },
        },
      },
    },
  },
};
