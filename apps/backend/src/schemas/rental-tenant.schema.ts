export const rentalTenantSchemas = {
  // List rental tenants schema
  listRentalTenantsSchema: {
    querystring: {
      type: "object",
      properties: {
        page: { type: "integer", minimum: 1, default: 1 },
        limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
        search: { type: "string" },
        status: { type: "string", enum: ["ACTIVE", "INACTIVE", "EXPIRED"] },
        property: { type: "string" },
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
                firstName: { type: "string" },
                lastName: { type: "string" },
                email: { type: "string" },
                phone: { type: "string", nullable: true },
                avatar: { type: "string", nullable: true },
                status: { type: "string" },
                paymentStatus: { type: "string" },
                lastPayment: {
                  type: "string",
                  format: "date-time",
                  nullable: true,
                },
                property: {
                  type: "object",
                  nullable: true,
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    address: { type: "string", nullable: true },
                  },
                },
                contract: {
                  type: "object",
                  nullable: true,
                  properties: {
                    id: { type: "string" },
                    startDate: { type: "string", format: "date-time" },
                    endDate: { type: "string", format: "date-time" },
                    monthlyRent: { type: "number" },
                    deposit: { type: "number" },
                  },
                },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
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

  // Rental tenant stats schema
  rentalTenantStatsSchema: {
    response: {
      200: {
        type: "object",
        properties: {
          total: { type: "integer" },
          active: { type: "integer" },
          inactive: { type: "integer" },
          expired: { type: "integer" },
          latePayments: { type: "integer" },
          expiringContracts: { type: "integer" },
          newThisMonth: { type: "integer" },
          byStatus: {
            type: "object",
            additionalProperties: { type: "integer" },
          },
        },
      },
    },
  },

  // Get rental tenant schema
  getRentalTenantSchema: {
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
          firstName: { type: "string" },
          lastName: { type: "string" },
          email: { type: "string" },
          phone: { type: "string", nullable: true },
          avatar: { type: "string", nullable: true },
          status: { type: "string" },
          paymentStatus: { type: "string" },
          lastPayment: { type: "string", format: "date-time", nullable: true },
          property: {
            type: "object",
            nullable: true,
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              address: { type: "string", nullable: true },
            },
          },
          contract: {
            type: "object",
            nullable: true,
            properties: {
              id: { type: "string" },
              startDate: { type: "string", format: "date-time" },
              endDate: { type: "string", format: "date-time" },
              monthlyRent: { type: "number" },
              deposit: { type: "number" },
            },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    },
  },

  // Create rental tenant schema
  createRentalTenantSchema: {
    body: {
      type: "object",
      required: ["firstName", "lastName", "email"],
      properties: {
        firstName: { type: "string" },
        lastName: { type: "string" },
        email: { type: "string", format: "email" },
        phone: { type: "string" },
        avatar: { type: "string" },
        propertyId: { type: "string" },
        contractData: {
          type: "object",
          properties: {
            startDate: { type: "string", format: "date" },
            endDate: { type: "string", format: "date" },
            monthlyRent: { type: "number", minimum: 0 },
            deposit: { type: "number", minimum: 0 },
          },
        },
      },
    },
    response: {
      201: {
        type: "object",
        properties: {
          id: { type: "string" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          email: { type: "string" },
          phone: { type: "string", nullable: true },
          avatar: { type: "string", nullable: true },
          status: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    },
  },

  // Update rental tenant schema
  updateRentalTenantSchema: {
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
        firstName: { type: "string" },
        lastName: { type: "string" },
        email: { type: "string", format: "email" },
        phone: { type: "string" },
        avatar: { type: "string" },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          id: { type: "string" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          email: { type: "string" },
          phone: { type: "string", nullable: true },
          avatar: { type: "string", nullable: true },
          status: { type: "string" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    },
  },

  // Delete rental tenant schema
  deleteRentalTenantSchema: {
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
          message: { type: "string" },
        },
      },
    },
  },

  // Send notification schema
  sendNotificationSchema: {
    params: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
      },
    },
    body: {
      type: "object",
      required: ["message"],
      properties: {
        message: { type: "string" },
        type: {
          type: "string",
          enum: ["INFO", "WARNING", "REMINDER"],
          default: "INFO",
        },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },
  },

  // Terminate contract schema
  terminateContractSchema: {
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
        reason: { type: "string" },
        terminationDate: { type: "string", format: "date" },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },
  },
};
