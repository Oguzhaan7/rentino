// types/user.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "PROPERTY_OWNER" | "TENANT" | "ACCOUNTANT" | "MANAGER";
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData extends Record<string, unknown> {
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "PROPERTY_OWNER" | "TENANT" | "ACCOUNTANT" | "MANAGER";
  phone?: string;
  password: string;
}

export interface UpdateUserData extends Partial<CreateUserData> {
  isActive?: boolean;
}
