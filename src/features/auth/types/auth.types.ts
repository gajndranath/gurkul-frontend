// Centralized types for user, session, and auth flows

export type UserRole = "ADMIN" | "STUDENT" | "SUPER_ADMIN";

export interface AuthSession {
  token: string;
  userId: string;
  role: UserRole;
  expiresAt: number;
}

export interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  fatherName?: string;
  emailVerified: boolean;
  status: string;
  libraryId: string;
}

export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  lastLogin?: string;
}

export interface AuthResponse {
  accessToken: string;
  student?: Student;
  admin?: Admin;
}

export interface ApiResponse<T> {
  status: number;
  data: T;
  message: string;
}
