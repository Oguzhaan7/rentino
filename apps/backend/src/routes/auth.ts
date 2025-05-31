import { FastifyInstance } from "fastify";
import { authService } from "../services/auth.service";
import {
  signupSchema,
  signinSchema,
  meSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../schemas/auth.schema";

export default async function authRoutes(
  fastify: FastifyInstance
): Promise<void> {
  fastify.post("/signup", { schema: signupSchema }, authService.signup);

  fastify.post("/signin", { schema: signinSchema }, authService.signin);

  fastify.get(
    "/me",
    {
      schema: meSchema,
      preHandler: [fastify.authenticate],
    },
    authService.me
  );

  fastify.post(
    "/change-password",
    {
      schema: changePasswordSchema,
      preHandler: [fastify.authenticate],
    },
    authService.changePassword as any
  );

  fastify.post(
    "/forgot-password",
    { schema: forgotPasswordSchema },
    authService.forgotPassword
  );

  fastify.post(
    "/reset-password",
    { schema: resetPasswordSchema },
    authService.resetPassword
  );

  fastify.post(
    "/logout",
    { preHandler: [fastify.authenticate] },
    authService.logout
  );
}
