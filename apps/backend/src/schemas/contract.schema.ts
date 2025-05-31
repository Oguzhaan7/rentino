export const contractSchemas = {
  // Sözleşme oluşturma şeması
  createContractSchema: {
    body: {
      type: "object",
      required: [
        "title",
        "propertyId",
        "tenantId",
        "startDate",
        "endDate",
        "monthlyRent",
        "paymentDay",
      ],
      properties: {
        title: { type: "string" },
        propertyId: { type: "string" },
        tenantId: { type: "string" },
        startDate: { type: "string", format: "date-time" },
        endDate: { type: "string", format: "date-time" },
        monthlyRent: { type: "number", minimum: 0 },
        depositAmount: { type: "number", minimum: 0 },
        paymentDay: { type: "integer", minimum: 1, maximum: 31 },
        paymentMethod: { type: "string" },
        renewalType: {
          type: "string",
          enum: ["AUTOMATIC", "MANUAL", "NEGOTIABLE"],
        },
        noticePeriod: { type: "integer", minimum: 0 },
        notes: { type: "string" },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          status: { type: "string" },
          startDate: { type: "string", format: "date-time" },
          endDate: { type: "string", format: "date-time" },
          monthlyRent: { type: "number" },
          depositAmount: { type: "number" },
          createdAt: { type: "string", format: "date-time" },
          propertyId: { type: "string" },
          tenantId: { type: "string" },
        },
      },
    },
  },

  // Sözleşme listeleme şeması
  listContractsSchema: {
    querystring: {
      type: "object",
      properties: {
        page: { type: "integer", minimum: 1, default: 1 },
        limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
        orderBy: { type: "string", default: "startDate:desc" },
        search: { type: "string" },
        status: { type: "string" },
        propertyId: { type: "string" },
        tenantId: { type: "string" },
        startDate: { type: "string", format: "date-time" },
        endDate: { type: "string", format: "date-time" },
        isActive: { type: "boolean" },
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
                status: { type: "string" },
                startDate: { type: "string", format: "date-time" },
                endDate: { type: "string", format: "date-time" },
                monthlyRent: { type: "number" },
                property: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    address: { type: "string" },
                    type: { type: "string" },
                  },
                },
                tenant: {
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
                    payments: { type: "integer" },
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

  // Sözleşme detay şeması
  getContractSchema: {
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
          status: { type: "string" },
          startDate: { type: "string", format: "date-time" },
          endDate: { type: "string", format: "date-time" },
          monthlyRent: { type: "number" },
          depositAmount: { type: "number" },
          paymentDay: { type: "integer" },
          paymentMethod: { type: "string", nullable: true },
          renewalType: { type: "string", nullable: true },
          noticePeriod: { type: "integer", nullable: true },
          notes: { type: "string", nullable: true },
          terminationDate: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          terminationReason: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          property: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              type: { type: "string" },
              address: { type: "string" },
              city: { type: "string" },
              district: { type: "string" },
              numberOfRooms: { type: "integer" },
              building: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                },
                nullable: true,
              },
            },
          },
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
          payments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                amount: { type: "number" },
                paymentDate: { type: "string", format: "date-time" },
                periodStartDate: { type: "string", format: "date-time" },
                periodEndDate: { type: "string", format: "date-time" },
                isPaid: { type: "boolean" },
                paymentMethod: { type: "string", nullable: true },
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
                fileUrl: { type: "string" },
                mimeType: { type: "string" },
                size: { type: "number" },
                createdAt: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
    },
  },

  // Sözleşme güncelleme şeması
  updateContractSchema: {
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
        startDate: { type: "string", format: "date-time" },
        endDate: { type: "string", format: "date-time" },
        monthlyRent: { type: "number", minimum: 0 },
        depositAmount: { type: "number", minimum: 0 },
        paymentDay: { type: "integer", minimum: 1, maximum: 31 },
        paymentMethod: { type: "string" },
        renewalType: {
          type: "string",
          enum: ["AUTOMATIC", "MANUAL", "NEGOTIABLE"],
        },
        noticePeriod: { type: "integer", minimum: 0 },
        notes: { type: "string" },
        status: { type: "string", enum: ["ACTIVE", "EXPIRED"] },
      },
      minProperties: 1,
    },
    response: {
      200: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          status: { type: "string" },
          startDate: { type: "string", format: "date-time" },
          endDate: { type: "string", format: "date-time" },
          monthlyRent: { type: "number" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    },
  },

  // Sözleşme sonlandırma şeması
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
      required: ["terminationDate", "terminationReason"],
      properties: {
        terminationDate: { type: "string", format: "date-time" },
        terminationReason: { type: "string" },
        penaltyAmount: { type: "number", minimum: 0 },
        returnDepositAmount: { type: "number", minimum: 0 },
        notes: { type: "string" },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          id: { type: "string" },
          status: { type: "string" },
          terminationDate: { type: "string", format: "date-time" },
          terminationReason: { type: "string" },
          penaltyAmount: { type: "number" },
          returnDepositAmount: { type: "number" },
        },
      },
    },
  },

  // Sözleşme yenileme şeması
  renewContractSchema: {
    params: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
      },
    },
    body: {
      type: "object",
      required: ["startDate", "endDate"],
      properties: {
        startDate: { type: "string", format: "date-time" },
        endDate: { type: "string", format: "date-time" },
        monthlyRent: { type: "number", minimum: 0 },
        depositAmount: { type: "number", minimum: 0 },
        paymentDay: { type: "integer", minimum: 1, maximum: 31 },
        paymentMethod: { type: "string" },
        renewalType: {
          type: "string",
          enum: ["AUTOMATIC", "MANUAL", "NEGOTIABLE"],
        },
        noticePeriod: { type: "integer", minimum: 0 },
        notes: { type: "string" },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          oldContract: {
            type: "object",
            properties: {
              id: { type: "string" },
              status: { type: "string" },
            },
          },
          newContract: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              status: { type: "string" },
              startDate: { type: "string", format: "date-time" },
              endDate: { type: "string", format: "date-time" },
              monthlyRent: { type: "number" },
            },
          },
        },
      },
    },
  },

  // Sözleşme silme şeması
  deleteContractSchema: {
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

  // Kira ödemesi ekleme şeması
  addRentPaymentSchema: {
    params: {
      type: "object",
      required: ["contractId"],
      properties: {
        contractId: { type: "string" },
      },
    },
    body: {
      type: "object",
      required: ["amount", "paymentDate", "periodStartDate", "periodEndDate"],
      properties: {
        amount: { type: "number", minimum: 0 },
        paymentDate: { type: "string", format: "date-time" },
        paymentMethod: { type: "string" },
        periodStartDate: { type: "string", format: "date-time" },
        periodEndDate: { type: "string", format: "date-time" },
        receiptNumber: { type: "string" },
        isPaid: { type: "boolean", default: true },
        notes: { type: "string" },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          id: { type: "string" },
          amount: { type: "number" },
          paymentDate: { type: "string", format: "date-time" },
          periodStartDate: { type: "string", format: "date-time" },
          periodEndDate: { type: "string", format: "date-time" },
          paymentMethod: { type: "string", nullable: true },
          receiptNumber: { type: "string", nullable: true },
          isPaid: { type: "boolean" },
          contractId: { type: "string" },
        },
      },
    },
  },

  // Kira ödemesi güncelleme şeması
  updateRentPaymentSchema: {
    params: {
      type: "object",
      required: ["contractId", "paymentId"],
      properties: {
        contractId: { type: "string" },
        paymentId: { type: "string" },
      },
    },
    body: {
      type: "object",
      properties: {
        amount: { type: "number", minimum: 0 },
        paymentDate: { type: "string", format: "date-time" },
        paymentMethod: { type: "string" },
        periodStartDate: { type: "string", format: "date-time" },
        periodEndDate: { type: "string", format: "date-time" },
        receiptNumber: { type: "string" },
        isPaid: { type: "boolean" },
        notes: { type: "string" },
      },
      minProperties: 1,
    },
    response: {
      200: {
        type: "object",
        properties: {
          id: { type: "string" },
          amount: { type: "number" },
          paymentDate: { type: "string", format: "date-time" },
          periodStartDate: { type: "string", format: "date-time" },
          periodEndDate: { type: "string", format: "date-time" },
          paymentMethod: { type: "string", nullable: true },
          receiptNumber: { type: "string", nullable: true },
          isPaid: { type: "boolean" },
          contractId: { type: "string" },
        },
      },
    },
  },

  // Kira ödemesi silme şeması
  deleteRentPaymentSchema: {
    params: {
      type: "object",
      required: ["contractId", "paymentId"],
      properties: {
        contractId: { type: "string" },
        paymentId: { type: "string" },
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
