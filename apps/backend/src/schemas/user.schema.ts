// Simple TypeScript interfaces for users - no external dependencies

export type UserRole =
  | "ADMIN"
  | "PROPERTY_OWNER"
  | "TENANT"
  | "ACCOUNTANT"
  | "MANAGER";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: UserRole;
  tenantId?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserBody {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: UserRole;
  tenantId?: string;
}

export interface UpdateUserBody {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserParams {
  id: string;
}
