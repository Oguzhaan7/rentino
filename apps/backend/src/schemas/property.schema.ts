export const propertySchemas = {
  // Mülk oluşturma şeması
  createPropertySchema: {
    body: {
      type: "object",
      required: ["title", "type", "address", "city", "district", "totalArea"],
      properties: {
        title: { type: "string" },
        type: {
          type: "string",
          enum: ["APARTMENT", "HOUSE", "OFFICE", "SHOP", "LAND", "WAREHOUSE"],
        },
        status: {
          type: "string",
          enum: ["AVAILABLE", "RENTED", "UNDER_MAINTENANCE", "ON_SALE", "SOLD"],
          default: "AVAILABLE",
        },
        address: { type: "string" },
        city: { type: "string" },
        district: { type: "string" },
        postalCode: { type: "string" },
        totalArea: { type: "number", minimum: 0 },
        yearBuilt: { type: "integer" },
        numberOfRooms: { type: "integer", minimum: 0 },
        numberOfBaths: { type: "integer", minimum: 0 },
        floor: { type: "integer" },
        description: { type: "string" },
        buildingId: { type: "string" },
        ownerId: { type: "string" },
        isActive: { type: "boolean", default: true },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          type: { type: "string" },
          status: { type: "string" },
          address: { type: "string" },
          city: { type: "string" },
          district: { type: "string" },
          postalCode: { type: "string", nullable: true },
          totalArea: { type: "number" },
          yearBuilt: { type: "integer", nullable: true },
          numberOfRooms: { type: "integer", nullable: true },
          numberOfBaths: { type: "integer", nullable: true },
          floor: { type: "integer", nullable: true },
          description: { type: "string", nullable: true },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          ownerId: { type: "string" },
          buildingId: { type: "string", nullable: true },
          tenantId: { type: "string", nullable: true },
        },
      },
    },
  },

  // Mülk listeleme şeması
  listPropertiesSchema: {
    querystring: {
      type: "object",
      properties: {
        page: { type: "integer", minimum: 1, default: 1 },
        limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
        orderBy: { type: "string", default: "createdAt:desc" },
        search: { type: "string" },
        status: {
          type: "string",
          enum: ["AVAILABLE", "RENTED", "UNDER_MAINTENANCE", "ON_SALE", "SOLD"],
        },
        type: {
          type: "string",
          enum: ["APARTMENT", "HOUSE", "OFFICE", "SHOP", "LAND", "WAREHOUSE"],
        },
        city: { type: "string" },
        district: { type: "string" },
        minArea: { type: "number", minimum: 0 },
        maxArea: { type: "number", minimum: 0 },
        minRooms: { type: "integer", minimum: 0 },
        maxRooms: { type: "integer", minimum: 0 },
        buildingId: { type: "string" },
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
                title: { type: "string" },
                type: { type: "string" },
                status: { type: "string" },
                address: { type: "string" },
                city: { type: "string" },
                district: { type: "string" },
                totalArea: { type: "number" },
                isActive: { type: "boolean" },
                createdAt: { type: "string", format: "date-time" },
                owner: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    firstName: { type: "string", nullable: true },
                    lastName: { type: "string", nullable: true },
                    email: { type: "string" },
                  },
                },
                building: {
                  type: "object",
                  nullable: true,
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    address: { type: "string" },
                  },
                },
                _count: {
                  type: "object",
                  properties: {
                    rentalContracts: { type: "integer" },
                    documents: { type: "integer" },
                    maintenances: { type: "integer" },
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

  // Mülk detay şeması
  getPropertySchema: {
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
          title: { type: "string" },
          type: { type: "string" },
          status: { type: "string" },
          address: { type: "string" },
          city: { type: "string" },
          district: { type: "string" },
          postalCode: { type: "string", nullable: true },
          totalArea: { type: "number" },
          yearBuilt: { type: "integer", nullable: true },
          numberOfRooms: { type: "integer", nullable: true },
          numberOfBaths: { type: "integer", nullable: true },
          floor: { type: "integer", nullable: true },
          description: { type: "string", nullable: true },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          owner: {
            type: "object",
            properties: {
              id: { type: "string" },
              firstName: { type: "string", nullable: true },
              lastName: { type: "string", nullable: true },
              email: { type: "string" },
              phone: { type: "string", nullable: true },
            },
          },
          building: {
            type: "object",
            nullable: true,
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              address: { type: "string" },
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
            },
          },
          documents: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                type: { type: "string" },
                fileUrl: { type: "string" },
                fileName: { type: "string" },
                uploadDate: { type: "string", format: "date-time" },
              },
            },
          },
          maintenances: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                cost: { type: "number", nullable: true },
                date: { type: "string", format: "date-time" },
                maintenanceType: { type: "string" },
              },
            },
          },
          rentalContracts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                startDate: { type: "string", format: "date-time" },
                endDate: { type: "string", format: "date-time" },
                monthlyRent: { type: "number" },
                status: { type: "string" },
                tenant: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    firstName: { type: "string", nullable: true },
                    lastName: { type: "string", nullable: true },
                    email: { type: "string" },
                    phone: { type: "string", nullable: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  // Mülk güncelleme şeması
  updatePropertySchema: {
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
        title: { type: "string" },
        type: {
          type: "string",
          enum: ["APARTMENT", "HOUSE", "OFFICE", "SHOP", "LAND", "WAREHOUSE"],
        },
        status: {
          type: "string",
          enum: ["AVAILABLE", "RENTED", "UNDER_MAINTENANCE", "ON_SALE", "SOLD"],
        },
        address: { type: "string" },
        city: { type: "string" },
        district: { type: "string" },
        postalCode: { type: "string" },
        totalArea: { type: "number", minimum: 0 },
        yearBuilt: { type: "integer" },
        numberOfRooms: { type: "integer", minimum: 0 },
        numberOfBaths: { type: "integer", minimum: 0 },
        floor: { type: "integer" },
        description: { type: "string" },
        buildingId: { type: "string" },
        isActive: { type: "boolean" },
      },
      minProperties: 1,
    },
    response: {
      200: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          type: { type: "string" },
          status: { type: "string" },
          address: { type: "string" },
          city: { type: "string" },
          district: { type: "string" },
          postalCode: { type: "string", nullable: true },
          totalArea: { type: "number" },
          yearBuilt: { type: "integer", nullable: true },
          numberOfRooms: { type: "integer", nullable: true },
          numberOfBaths: { type: "integer", nullable: true },
          floor: { type: "integer", nullable: true },
          description: { type: "string", nullable: true },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          ownerId: { type: "string" },
          buildingId: { type: "string", nullable: true },
          tenantId: { type: "string", nullable: true },
        },
      },
    },
  },

  // Mülk silme şeması
  deletePropertySchema: {
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

  // Mülk belge ekleme şeması
  addPropertyDocumentSchema: {
    params: {
      type: "object",
      required: ["propertyId"],
      properties: {
        propertyId: { type: "string" },
      },
    },
    body: {
      type: "object",
      required: ["title", "type", "fileUrl", "fileName", "fileType"],
      properties: {
        title: { type: "string" },
        type: { type: "string" },
        fileUrl: { type: "string" },
        fileName: { type: "string" },
        fileType: { type: "string" },
        fileSize: { type: "integer" },
        description: { type: "string" },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          type: { type: "string" },
          fileUrl: { type: "string" },
          fileName: { type: "string" },
          fileType: { type: "string" },
          fileSize: { type: "integer", nullable: true },
          description: { type: "string", nullable: true },
          uploadDate: { type: "string", format: "date-time" },
          createdAt: { type: "string", format: "date-time" },
          propertyId: { type: "string" },
          tenantId: { type: "string", nullable: true },
        },
      },
    },
  },

  // Mülk bakım kaydı ekleme şeması
  addPropertyMaintenanceSchema: {
    params: {
      type: "object",
      required: ["propertyId"],
      properties: {
        propertyId: { type: "string" },
      },
    },
    body: {
      type: "object",
      required: ["title", "date", "maintenanceType"],
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        cost: { type: "number", minimum: 0 },
        date: { type: "string", format: "date-time" },
        maintenanceType: { type: "string" },
        contractor: { type: "string" },
        invoiceNumber: { type: "string" },
        warranty: { type: "string", format: "date-time" },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          cost: { type: "number", nullable: true },
          date: { type: "string", format: "date-time" },
          completedAt: { type: "string", format: "date-time", nullable: true },
          maintenanceType: { type: "string" },
          contractor: { type: "string", nullable: true },
          invoiceNumber: { type: "string", nullable: true },
          warranty: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          propertyId: { type: "string" },
          tenantId: { type: "string", nullable: true },
        },
      },
    },
  },

  // Mülk istatistikleri şeması
  propertyStatsSchema: {
    response: {
      200: {
        type: "object",
        properties: {
          counts: {
            type: "object",
            properties: {
              total: { type: "integer" },
              available: { type: "integer" },
              rented: { type: "integer" },
              underMaintenance: { type: "integer" },
              maintenanceRecords: { type: "integer" },
              documents: { type: "integer" },
            },
          },
          financials: {
            type: "object",
            properties: {
              averageRent: { type: "number" },
            },
          },
          distributions: {
            type: "object",
            properties: {
              propertyTypes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    count: { type: "integer" },
                  },
                },
              },
              cities: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    city: { type: "string" },
                    count: { type: "integer" },
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
