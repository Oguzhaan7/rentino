import { UserRole } from "@prisma/client";

export interface AuthUserPayload {
  id: string;
  email: string;
  role: string;
  tenantId?: string | null;
}

export interface SignupBody {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  tenantId?: string;
}

export interface SigninBody {
  email: string;
  password: string;
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}
