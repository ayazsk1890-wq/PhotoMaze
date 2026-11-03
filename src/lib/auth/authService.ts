/**
 * Unified Authentication Service (Phase 10)
 *
 * Supports:
 * - Live Supabase Auth (Email/Password, Google OAuth, Password Recovery)
 * - Persistent Offline/Demo Mode with multi-user support when Supabase keys are not set
 * - Strict account isolation
 */

import { getSupabaseBrowserClient, isSupabaseConfigured } from "../supabase/client";
import { UserProfile, AuthSession } from "@/types/auth";

const LOCAL_USERS_KEY = "ppm_auth_users";
const LOCAL_SESSION_KEY = "ppm_auth_session";

interface StoredLocalUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string | null;
  avatarUrl: string | null;
  planTier: "free";
  createdAt: string;
  updatedAt: string;
}

// ─── Local Storage Helper Functions (Demo/Offline Multi-Account Store) ──────

function getLocalUsers(): StoredLocalUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalUsers(users: StoredLocalUser[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function getStoredLocalSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(LOCAL_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function saveStoredLocalSession(session: AuthSession | null): void {
  if (typeof window === "undefined") return;
  if (!session) {
    localStorage.removeItem(LOCAL_SESSION_KEY);
  } else {
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
  }
}

// ─── Unified Authentication Public API ──────────────────────────────────────

export interface AuthResponse {
  user: UserProfile | null;
  session: AuthSession | null;
  error?: string | null;
  message?: string;
}

/**
 * Registers a new user account.
 */
export async function registerUser(
  email: string,
  password: string,
  fullName: string = ""
): Promise<AuthResponse> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Live Supabase Auth
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseBrowserClient()!;
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: fullName.trim() || undefined,
        },
      },
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    if (data.user) {
      const userProfile: UserProfile = {
        id: data.user.id,
        email: data.user.email || cleanEmail,
        fullName: fullName.trim() || null,
        avatarUrl: null,
        planTier: "free",
        createdAt: data.user.created_at || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const session: AuthSession | null = data.session
        ? {
            accessToken: data.session.access_token,
            user: userProfile,
            expiresAt: data.session.expires_at ? data.session.expires_at * 1000 : Date.now() + 86400000,
          }
        : null;

      return {
        user: userProfile,
        session,
        message: data.session ? "Registration successful!" : "Confirmation email sent! Please check your inbox.",
      };
    }
  }

  // 2. Demo / Local Account Store Mode
  const users = getLocalUsers();
  if (users.some((u) => u.email === cleanEmail)) {
    return { user: null, session: null, error: "An account with this email already exists." };
  }

  const userId = "usr_" + Math.random().toString(36).substring(2, 11);
  const now = new Date().toISOString();
  const newUser: StoredLocalUser = {
    id: userId,
    email: cleanEmail,
    passwordHash: btoa(password), // Simulated credential store
    fullName: fullName.trim() || null,
    avatarUrl: null,
    planTier: "free",
    createdAt: now,
    updatedAt: now,
  };

  users.push(newUser);
  saveLocalUsers(users);

  const profile: UserProfile = {
    id: newUser.id,
    email: newUser.email,
    fullName: newUser.fullName,
    avatarUrl: newUser.avatarUrl,
    planTier: newUser.planTier,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt,
  };

  const session: AuthSession = {
    accessToken: "demo_tok_" + Math.random().toString(36).substring(2),
    user: profile,
    expiresAt: Date.now() + 7 * 86400000, // 7 days
  };

  saveStoredLocalSession(session);
  return { user: profile, session, message: "Account created successfully!" };
}

/**
 * Signs in an existing user with email and password.
 */
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Live Supabase Auth
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseBrowserClient()!;
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    if (data.user && data.session) {
      // Fetch user profile from profiles table
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      const userProfile: UserProfile = {
        id: data.user.id,
        email: data.user.email || cleanEmail,
        fullName: profileData?.full_name || data.user.user_metadata?.full_name || null,
        avatarUrl: profileData?.avatar_url || data.user.user_metadata?.avatar_url || null,
        planTier: "free",
        createdAt: data.user.created_at,
        updatedAt: profileData?.updated_at || data.user.created_at,
      };

      const session: AuthSession = {
        accessToken: data.session.access_token,
        user: userProfile,
        expiresAt: data.session.expires_at ? data.session.expires_at * 1000 : Date.now() + 86400000,
      };

      return { user: userProfile, session, message: "Signed in successfully!" };
    }
  }

  // 2. Demo / Local Account Store Mode
  const users = getLocalUsers();
  const found = users.find((u) => u.email === cleanEmail);

  if (!found || found.passwordHash !== btoa(password)) {
    return { user: null, session: null, error: "Invalid email or password." };
  }

  const profile: UserProfile = {
    id: found.id,
    email: found.email,
    fullName: found.fullName,
    avatarUrl: found.avatarUrl,
    planTier: found.planTier,
    createdAt: found.createdAt,
    updatedAt: found.updatedAt,
  };

  const session: AuthSession = {
    accessToken: "demo_tok_" + Math.random().toString(36).substring(2),
    user: profile,
    expiresAt: Date.now() + 7 * 86400000,
  };

  saveStoredLocalSession(session);
  return { user: profile, session, message: "Signed in successfully!" };
}

/**
 * Initiates Google OAuth Sign-In.
 */
export async function loginWithGoogle(): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseBrowserClient()!;
    const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/editor` : undefined;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  }

  return {
    success: false,
    error: "Google OAuth requires configured NEXT_PUBLIC_SUPABASE_URL and Google Provider credentials in Supabase Dashboard.",
  };
}

/**
 * Sends a password recovery / reset email.
 */
export async function sendPasswordRecoveryEmail(email: string): Promise<{ success: boolean; error?: string; message?: string }> {
  const cleanEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseBrowserClient()!;
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/reset-password` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, message: "Password reset link sent to your email!" };
  }

  // Demo store mode
  const users = getLocalUsers();
  const exists = users.some((u) => u.email === cleanEmail);
  if (!exists) {
    return { success: false, error: "No account found with this email." };
  }

  return {
    success: true,
    message: "Demo Mode: Password reset request simulated successfully for " + cleanEmail,
  };
}

/**
 * Updates the user's password.
 */
export async function updateUserPassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseBrowserClient()!;
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  // Demo mode
  const currentSession = getStoredLocalSession();
  if (!currentSession) return { success: false, error: "Not authenticated" };

  const users = getLocalUsers();
  const user = users.find((u) => u.id === currentSession.user.id);
  if (user) {
    user.passwordHash = btoa(newPassword);
    user.updatedAt = new Date().toISOString();
    saveLocalUsers(users);
  }

  return { success: true };
}

/**
 * Updates user profile details (full name or avatar URL).
 */
export async function updateUserProfile(
  fullName?: string,
  avatarUrl?: string
): Promise<{ profile: UserProfile | null; error?: string }> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseBrowserClient()!;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { profile: null, error: "Not authenticated" };

    const updates: Partial<UserProfile> = {
      updatedAt: new Date().toISOString(),
    };
    if (fullName !== undefined) updates.fullName = fullName;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

    const { error: dbError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: updates.updatedAt,
      })
      .eq("id", user.id);

    if (dbError) return { profile: null, error: dbError.message };

    const updatedProfile: UserProfile = {
      id: user.id,
      email: user.email || "",
      fullName: fullName || null,
      avatarUrl: avatarUrl || null,
      planTier: "free",
      createdAt: user.created_at,
      updatedAt: updates.updatedAt!,
    };

    return { profile: updatedProfile };
  }

  // Demo mode
  const session = getStoredLocalSession();
  if (!session) return { profile: null, error: "Not authenticated" };

  const users = getLocalUsers();
  const u = users.find((x) => x.id === session.user.id);
  if (u) {
    if (fullName !== undefined) u.fullName = fullName;
    if (avatarUrl !== undefined) u.avatarUrl = avatarUrl;
    u.updatedAt = new Date().toISOString();
    saveLocalUsers(users);

    session.user.fullName = u.fullName;
    session.user.avatarUrl = u.avatarUrl;
    session.user.updatedAt = u.updatedAt;
    saveStoredLocalSession(session);
    return { profile: session.user };
  }

  return { profile: null, error: "User not found" };
}

/**
 * Signs out the current user.
 */
export async function logoutUser(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
  }
  saveStoredLocalSession(null);
}

/**
 * Returns the currently active session and user profile.
 */
export async function getActiveSession(): Promise<AuthSession | null> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseBrowserClient()!;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) return null;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    const profile: UserProfile = {
      id: session.user.id,
      email: session.user.email || "",
      fullName: profileData?.full_name || session.user.user_metadata?.full_name || null,
      avatarUrl: profileData?.avatar_url || session.user.user_metadata?.avatar_url || null,
      planTier: "free",
      createdAt: session.user.created_at,
      updatedAt: profileData?.updated_at || session.user.created_at,
    };

    return {
      accessToken: session.access_token,
      user: profile,
      expiresAt: session.expires_at ? session.expires_at * 1000 : Date.now() + 86400000,
    };
  }

  return getStoredLocalSession();
}

