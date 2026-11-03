/**
 * Authentication and User Profile Types (Phase 10)
 */

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  planTier: "free";
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  accessToken: string;
  user: UserProfile;
  expiresAt: number;
}

export type AuthView = "login" | "register" | "forgot-password" | "profile";

export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isSupabaseConfigured: boolean;
}

