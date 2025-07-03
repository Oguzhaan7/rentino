import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "database";
import * as bcrypt from "bcryptjs";
import {
  SignupBody,
  SigninBody,
  ChangePasswordBody,
} from "../types/auth.types";

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export const authService = {
  async signup(
    request: FastifyRequest<{ Body: SignupBody }>,
    reply: FastifyReply
  ) {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        role = "TENANT",
        tenantId,
      } = request.body;

      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          ...(tenantId ? { tenantId } : {}),
        },
      });

      if (existingUser) {
        return reply.status(400).send({
          error: "Kullanıcı zaten mevcut",
          message: "Bu e-posta adresi ile bir hesap bulunmaktadır",
        });
      }

      const passwordHash = await hashPassword(password);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          role: role as any,
          tenantId,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          tenantId: true,
        },
      });

      const token = request.server.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      });
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "USER_REGISTER",
          entityType: "USER",
          entityId: user.id,
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"] as string,
          tenantId: user.tenantId || undefined,
        },
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      request.log.error(`Signup error: ${error}`);
      return reply.status(500).send({ error: "Kayıt işlemi başarısız" });
    }
  },

  async signin(
    request: FastifyRequest<{ Body: SigninBody }>,
    reply: FastifyReply
  ) {
    try {
      const { email, password } = request.body;
      const tenantId = request.headers["x-tenant-id"] as string;

      const user = await prisma.user.findFirst({
        where: {
          email,
          ...(tenantId ? { tenantId } : {}),
          isActive: true,
        },
      });

      if (!user) {
        return reply.status(401).send({ error: "Geçersiz kimlik bilgileri" });
      }

      const passwordMatch = await verifyPassword(password, user.passwordHash);

      if (!passwordMatch) {
        return reply.status(401).send({ error: "Geçersiz kimlik bilgileri" });
      }

      const token = request.server.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "USER_LOGIN",
          entityType: "AUTH",
          entityId: "signin",
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"] as string,
          tenantId: user.tenantId || undefined,
        },
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId,
        },
        token,
      };
    } catch (error) {
      request.log.error(`Signin error: ${error}`);
      return reply.status(500).send({ error: "Giriş işlemi başarısız" });
    }
  },

  async me(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          lastLogin: true,
          tenantId: true,
        },
      });

      if (!user) {
        return reply.status(404).send({ error: "Kullanıcı bulunamadı" });
      }

      return user;
    } catch (error) {
      request.log.error(`Me endpoint error: ${error}`);
      return reply.status(500).send({ error: "Kullanıcı bilgileri alınamadı" });
    }
  },

  async changePassword(
    request: FastifyRequest<{ Body: ChangePasswordBody }>,
    reply: FastifyReply
  ) {
    try {
      const { currentPassword, newPassword } = request.body as any;
      const userId = request.user!.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return reply.status(404).send({ error: "Kullanıcı bulunamadı" });
      }

      const isPasswordValid = await verifyPassword(
        currentPassword,
        user.passwordHash
      );

      if (!isPasswordValid) {
        return reply.status(400).send({ error: "Mevcut şifre yanlış" });
      }

      const newPasswordHash = await hashPassword(newPassword);

      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });
      await prisma.auditLog.create({
        data: {
          userId,
          action: "PASSWORD_CHANGE",
          entityType: "USER",
          entityId: userId,
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"] as string,
          tenantId: user.tenantId || undefined,
        },
      });

      return { success: true, message: "Şifre başarıyla değiştirildi" };
    } catch (error) {
      request.log.error(`Change password error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Şifre değiştirme işlemi başarısız" });
    }
  },

  async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.id;
      await prisma.auditLog.create({
        data: {
          userId,
          action: "USER_LOGOUT",
          entityType: "AUTH",
          entityId: "logout",
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"] as string,
          tenantId: request.user!.tenantId || undefined,
        },
      });

      return { success: true, message: "Çıkış işlemi başarılı" };
    } catch (error) {
      request.log.error(`Logout error: ${error}`);
      return reply.status(500).send({ error: "Çıkış işlemi başarısız" });
    }
  },

  async forgotPassword(
    request: FastifyRequest<{ Body: { email: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { email } = request.body;
      const tenantId = request.headers["x-tenant-id"] as string;

      const user = await prisma.user.findFirst({
        where: {
          email,
          ...(tenantId ? { tenantId } : {}),
          isActive: true,
        },
      });

      if (!user) {
        return reply.status(200).send({
          success: true,
          message: "Şifre sıfırlama talimatları e-posta adresinize gönderildi.",
        });
      }

      const resetToken =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      const tokenExpiry = new Date(Date.now() + 3600000);

      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          token: resetToken,
          expiresAt: tokenExpiry,
        },
      });

      request.log.info(
        `Password reset requested for user: ${user.id}, email: ${user.email}`
      );

      return {
        success: true,
        message: "Şifre sıfırlama talimatları e-posta adresinize gönderildi.",
      };
    } catch (error) {
      request.log.error(`Forgot password error: ${error}`);
      return reply
        .status(500)
        .send({ error: "İşlem sırasında bir hata oluştu" });
    }
  },

  async resetPassword(
    request: FastifyRequest<{
      Body: { token: string; password: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { token, password } = request.body;

      const resetRequest = await prisma.passwordReset.findUnique({
        where: { token },
        include: { user: true },
      });

      if (
        !resetRequest ||
        resetRequest.expiresAt < new Date() ||
        resetRequest.used
      ) {
        return reply
          .status(400)
          .send({ error: "Geçersiz veya süresi dolmuş token" });
      }

      const passwordHash = await hashPassword(password);

      await prisma.user.update({
        where: { id: resetRequest.userId },
        data: { passwordHash },
      });

      await prisma.passwordReset.update({
        where: { id: resetRequest.id },
        data: { used: true },
      });
      await prisma.auditLog.create({
        data: {
          userId: resetRequest.userId,
          action: "PASSWORD_RESET",
          entityType: "USER",
          entityId: resetRequest.userId,
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"] as string,
          tenantId: resetRequest.user.tenantId || undefined,
        },
      });

      return { success: true, message: "Şifreniz başarıyla değiştirildi" };
    } catch (error) {
      request.log.error(`Reset password error: ${error}`);
      return reply
        .status(500)
        .send({ error: "Şifre sıfırlama işlemi başarısız" });
    }
  },
};
