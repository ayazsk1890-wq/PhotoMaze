"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserProfile, AuthSession, AuthView } from "@/types/auth";
import {
  registerUser,
  loginUser,
  loginWithGoogle,
  logoutUser,
  sendPasswordRecoveryEmail,
  updateUserPassword,
  updateUserProfile,
  getActiveSession,
  AuthResponse,
} from "@/lib/auth/authService";
import { isSupabaseConfigured } from "@/lib/supabase/client";

interface AuthContextType {
  user: UserProfile | null;
  session: AuthSession | null;
  isLoading: boolean;
  isSupabaseConfigured: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalView: AuthView;
  setAuthModalView: (view: AuthView) => void;
  openAuthModal: (view?: AuthView) => void;
  signUp: (email: string, password: string, fullName?: string) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (fullName?: string, avatarUrl?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalView, setAuthModalView] = useState<AuthView>("login");

  const supabaseConfigured = isSupabaseConfigured();

  // Load session on startup
  useEffect(() => {
    let isMounted = true;
    async function initSession() {
      try {
        const active = await getActiveSession();
        if (isMounted && active) {
          setSession(active);
          setUser(active.user);
        }
      } catch (err) {
        console.error("Session initialization error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    initSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const openAuthModal = useCallback((view: AuthView = "login") => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string = "") => {
    setIsLoading(true);
    try {
      const res = await registerUser(email, password, fullName);
      if (res.user && res.session) {
        setUser(res.user);
        setSession(res.session);
        setIsAuthModalOpen(false);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await loginUser(email, password);
      if (res.user && res.session) {
        setUser(res.user);
        setSession(res.session);
        setIsAuthModalOpen(false);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithGoogleOAuth = useCallback(async () => {
    return loginWithGoogle();
  }, []);

  const signOut = useCallback(async () => {
    await logoutUser();
    setUser(null);
    setSession(null);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    return sendPasswordRecoveryEmail(email);
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    return updateUserPassword(newPassword);
  }, []);

  const updateProfile = useCallback(async (fullName?: string, avatarUrl?: string) => {
    const res = await updateUserProfile(fullName, avatarUrl);
    if (res.profile) {
      setUser(res.profile);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isSupabaseConfigured: supabaseConfigured,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalView,
        setAuthModalView,
        openAuthModal,
        signUp,
        signIn,
        signInWithGoogle: signInWithGoogleOAuth,
        signOut,
        requestPasswordReset,
        updatePassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

