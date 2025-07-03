export const signupSchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 6 },
      firstName: { type: "string" },
      lastName: { type: "string" },
      role: {
        type: "string",
        enum: ["ADMIN", "PROPERTY_OWNER", "TENANT", "ACCOUNTANT", "MANAGER"],
      },
      tenantId: { type: "string" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        user: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            role: { type: "string" },
          },
        },
        token: { type: "string" },
      },
    },
  },
};

export const signinSchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        user: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            role: { type: "string" },
            tenantId: { type: "string" },
          },
        },
        token: { type: "string" },
      },
    },
  },
};

export const meSchema = {
  response: {
    200: {
      type: "object",
      properties: {
        id: { type: "string" },
        email: { type: "string" },
        firstName: { type: "string" },
        lastName: { type: "string" },
        role: { type: "string" },
        phone: { type: "string" },
        lastLogin: { type: "string", format: "date-time" },
        tenantId: { type: "string" },
      },
    },
  },
};

export const changePasswordSchema = {
  body: {
    type: "object",
    required: ["currentPassword", "newPassword"],
    properties: {
      currentPassword: { type: "string" },
      newPassword: { type: "string", minLength: 6 },
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
};

export const forgotPasswordSchema = {
  body: {
    type: "object",
    required: ["email"],
    properties: {
      email: { type: "string", format: "email" },
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
};

export const resetPasswordSchema = {
  body: {
    type: "object",
    required: ["token", "password"],
    properties: {
      token: { type: "string" },
      password: { type: "string", minLength: 6 },
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
};
