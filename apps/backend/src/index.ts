import fastify from "fastify";
import jwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import cors from "@fastify/cors";

import plugins from "./plugins/index.js";
import registerRoutes from "./routes/index.js";

const JWT_SECRET = process.env.JWT_SECRET || "rentino-gizli-anahtar";
const PORT =
  process.env.PORT || process.env.SERVER_PORT
    ? parseInt(process.env.SERVER_PORT || process.env.PORT || "5000")
    : 5000;
const HOST = process.env.HOST || process.env.SERVER_HOST || "0.0.0.0";
const NODE_ENV = process.env.NODE_ENV || "development";

async function buildApp() {
  const app = fastify({
    logger: {
      level: NODE_ENV === "production" ? "info" : "debug",
    },
  });

  await app.register(cors, {
    origin: [
      `http://localhost:3000`,
      "https://rentino-web.vercel.app",
      /https:\/\/.*\.vercel\.app$/,
      process.env.FRONTEND_URL || "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  });

  // Swagger konfigürasyonu
  await app.register(swagger, {
    swagger: {
      info: {
        title: "Rentino API Dokümantasyonu",
        description:
          "Rentino emlak ve kira yönetimi platformu API dokümantasyon",
        version: "1.0.0",
      },
      externalDocs: {
        url: "https://rentino-web.vercel.app",
        description: "Rentino web sitesi",
      },
      host: `${HOST}:${PORT}`,
      schemes: ["http", "https"],
      consumes: ["application/json"],
      produces: ["application/json"],
      securityDefinitions: {
        bearerAuth: {
          type: "apiKey",
          name: "Authorization",
          in: "header",
          description: "JWT token formatı: Bearer [token]",
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });

  // Swagger UI konfigürasyonu
  await app.register(swaggerUi, {
    routePrefix: "/swagger",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
      displayOperationId: false,
      persistAuthorization: true,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    initOAuth: {
      useBasicAuthenticationWithAccessCodeGrant: false,
    },
  });

  await app.register(jwt, {
    secret: JWT_SECRET,
    sign: {
      expiresIn: "24h",
    },
  });

  await app.register(plugins);

  await app.register(registerRoutes);

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    if (error.validation) {
      return reply.status(400).send({
        error: "Validasyon hatası",
        details: error.validation,
      });
    }

    return reply.status(500).send({
      error: "Sunucu hatası",
      message:
        NODE_ENV === "production"
          ? "Beklenmedik bir hata oluştu"
          : error.message,
    });
  });

  return app;
}

async function start() {
  try {
    const app = await buildApp();
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Server running at http://${HOST}:${PORT}`);
    app.log.info(
      `Swagger documentation available at http://${HOST}:${PORT}/swagger`
    );
  } catch (err) {
    console.error("Server start failed:", err);
    process.exit(1);
  }
}

start();

export { buildApp };
