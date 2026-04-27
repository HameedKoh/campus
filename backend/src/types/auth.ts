export type AppRole = "STUDENT" | "DOCTOR" | "ADMIN";

export interface JwtUser {
  sub: string;
  email: string;
  role: AppRole;
  name: string;
}

export interface SafeHealthProfile {
  matricNumber: string | null;
  ageRange: string | null;
  sex: string | null;
  allergies: string | null;
  chronicConditions: string | null;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  status: string;
  createdAt: string;
  healthProfile?: SafeHealthProfile | null;
}

export interface AuthResponse {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}
