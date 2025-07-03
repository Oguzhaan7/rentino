export const buildingSchemas = {
  // Bina oluşturma şeması
  createBuildingSchema: {
    body: {
      type: "object",
      required: [
        "name",
        "address",
        "city",
        "district",
        "totalUnits",
        "managerId",
      ],
      properties: {
        name: { type: "string" },
        address: { type: "string" },
        city: { type: "string" },
        district: { type: "string" },
        totalUnits: { type: "integer", minimum: 1 },
        constructionYear: { type: "integer" },
        isActive: { type: "boolean", default: true },
        managerId: { type: "string" },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          address: { type: "string" },
          city: { type: "string" },
          district: { type: "string" },
          totalUnits: { type: "integer" },
          constructionYear: { type: "integer", nullable: true },
          isActive: { type: "boolean" },
          managerId: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    },
  },

  // Bina listeleme şeması
  listBuildingsSchema: {
    querystring: {
      type: "object",
      properties: {
        page: { type: "integer", minimum: 1, default: 1 },
        limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
        orderBy: { type: "string", default: "name:asc" },
        search: { type: "string" },
        city: { type: "string" },
        district: { type: "string" },
        isActive: { type: "boolean" },
        managerId: { type: "string" },
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
                address: { type: "string" },
                city: { type: "string" },
                district: { type: "string" },
                totalUnits: { type: "integer" },
                isActive: { type: "boolean" },
                manager: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    firstName: { type: "string", nullable: true },
                    lastName: { type: "string", nullable: true },
                    email: { type: "string" },
                  },
                },
                _count: {
                  type: "object",
                  properties: {
                    properties: { type: "integer" },
                    dues: { type: "integer" },
                    expenses: { type: "integer" },
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

  // Bina detay şeması
  getBuildingSchema: {
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
          address: { type: "string" },
          city: { type: "string" },
          district: { type: "string" },
          totalUnits: { type: "integer" },
          constructionYear: { type: "integer", nullable: true },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          manager: {
            type: "object",
            properties: {
              id: { type: "string" },
              firstName: { type: "string", nullable: true },
              lastName: { type: "string", nullable: true },
              email: { type: "string" },
              phone: { type: "string", nullable: true },
            },
          },
          properties: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                type: { type: "string" },
                status: { type: "string" },
                floor: { type: "integer", nullable: true },
                numberOfRooms: { type: "integer", nullable: true },
              },
            },
          },
          expenses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                amount: { type: "number" },
                expenseDate: { type: "string", format: "date-time" },
                expenseType: { type: "string" },
                isPaid: { type: "boolean" },
              },
            },
          },
          dues: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                period: { type: "string", format: "date-time" },
                amount: { type: "number" },
                dueDate: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
    },
  },

  // Bina güncelleme şeması
  updateBuildingSchema: {
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
        address: { type: "string" },
        city: { type: "string" },
        district: { type: "string" },
        totalUnits: { type: "integer", minimum: 1 },
        constructionYear: { type: "integer" },
        isActive: { type: "boolean" },
        managerId: { type: "string" },
      },
      minProperties: 1,
    },
    response: {
      200: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          address: { type: "string" },
          city: { type: "string" },
          district: { type: "string" },
          totalUnits: { type: "integer" },
          constructionYear: { type: "integer", nullable: true },
          isActive: { type: "boolean" },
          managerId: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    },
  },

  // Bina silme şeması
  deleteBuildingSchema: {
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

  // Bina gideri ekleme şeması
  addBuildingExpenseSchema: {
    params: {
      type: "object",
      required: ["buildingId"],
      properties: {
        buildingId: { type: "string" },
      },
    },
    body: {
      type: "object",
      required: ["title", "amount", "expenseDate", "expenseType"],
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        amount: { type: "number", minimum: 0 },
        expenseDate: { type: "string", format: "date-time" },
        expenseType: { type: "string" },
        invoiceNumber: { type: "string" },
        paidAt: { type: "string", format: "date-time" },
        isPaid: { type: "boolean", default: false },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          amount: { type: "number" },
          expenseDate: { type: "string", format: "date-time" },
          expenseType: { type: "string" },
          invoiceNumber: { type: "string", nullable: true },
          paidAt: { type: "string", format: "date-time", nullable: true },
          isPaid: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          buildingId: { type: "string" },
        },
      },
    },
  },

  // Aidat tanımlama şeması
  createDuesSchema: {
    params: {
      type: "object",
      required: ["buildingId"],
      properties: {
        buildingId: { type: "string" },
      },
    },
    body: {
      type: "object",
      required: ["period", "amount", "dueDate"],
      properties: {
        period: { type: "string", format: "date-time" },
        amount: { type: "number", minimum: 0 },
        dueDate: { type: "string", format: "date-time" },
        description: { type: "string" },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          id: { type: "string" },
          period: { type: "string", format: "date-time" },
          amount: { type: "number" },
          dueDate: { type: "string", format: "date-time" },
          description: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          buildingId: { type: "string" },
        },
      },
    },
  },

  // Bina istatistikleri şeması
  buildingStatsSchema: {
    response: {
      200: {
        type: "object",
        properties: {
          counts: {
            type: "object",
            properties: {
              totalBuildings: { type: "integer" },
              totalUnits: { type: "integer" },
              occupiedUnits: { type: "integer" },
              vacantUnits: { type: "integer" },
            },
          },
          financials: {
            type: "object",
            properties: {
              totalExpenses: { type: "number" },
              totalDues: { type: "number" },
              paidDues: { type: "number" },
              unpaidDues: { type: "number" },
            },
          },
          distributions: {
            type: "object",
            properties: {
              expensesByType: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    expenseType: { type: "string" },
                    totalAmount: { type: "number" },
                  },
                },
              },
              expensesByMonth: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    month: { type: "string" },
                    totalAmount: { type: "number" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
