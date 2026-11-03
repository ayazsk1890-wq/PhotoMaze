"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  LogOut,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Cloud,
  Database,
} from "lucide-react";

export function AuthModal() {
  const {
    user,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalView,
    setAuthModalView,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    requestPasswordReset,
    isSupabaseConfigured,
  } = useAuth();

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleClose = () => {
    resetForm();
    setIsAuthModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (authModalView === "register") {
        if (!email || !password) {
          setErrorMessage("Please enter both email and password.");
          return;
        }
        if (password.length < 6) {
          setErrorMessage("Password must be at least 6 characters long.");
          return;
        }
        const res = await signUp(email, password, fullName);
        if (res.error) {
          setErrorMessage(res.error);
        } else {
          setSuccessMessage(res.message || "Account registered successfully!");
        }
      } else if (authModalView === "login") {
        if (!email || !password) {
          setErrorMessage("Please enter your email and password.");
          return;
        }
        const res = await signIn(email, password);
        if (res.error) {
          setErrorMessage(res.error);
        } else {
          setSuccessMessage("Logged in successfully!");
          setTimeout(handleClose, 800);
        }
      } else if (authModalView === "forgot-password") {
        if (!email) {
          setErrorMessage("Please enter your account email.");
          return;
        }
        const res = await requestPasswordReset(email);
        if (res.error) {
          setErrorMessage(res.error);
        } else {
          setSuccessMessage(res.message || "Password reset instructions sent!");
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Authentication error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    const res = await signInWithGoogle();
    if (!res.success && res.error) {
      setErrorMessage(res.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center text-white shadow-md">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base leading-tight">
                {authModalView === "login" && "Sign In"}
                {authModalView === "register" && "Create Account"}
                {authModalView === "forgot-password" && "Reset Password"}
                {authModalView === "profile" && "Account Profile"}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isSupabaseConfigured ? (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Cloud className="w-3 h-3" /> Supabase Cloud Synced
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400">
                    <Database className="w-3 h-3" /> Demo / Local Account Mode
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Notifications */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* VIEW: Profile & Logout */}
          {authModalView === "profile" && user ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center font-bold text-lg text-white shadow-md">
                    {user.fullName ? user.fullName[0].toUpperCase() : user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      {user.fullName || "PhotoMaze User"}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                      100% Free Account
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  setAuthModalView("login");
                }}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-rose-400 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/60 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Account</span>
              </button>
            </div>
          ) : (
            /* VIEW: Login, Register, Forgot Password Form */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Google OAuth Button */}
              {authModalView !== "forgot-password" && (
                <>
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2.5"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <div className="flex items-center gap-3 my-2">
                    <div className="h-px flex-1 bg-slate-800" />
                    <span className="text-[10px] uppercase font-bold text-slate-500">or</span>
                    <div className="h-px flex-1 bg-slate-800" />
                  </div>
                </>
              )}

              {/* Full Name (Registration only) */}
              {authModalView === "register" && (
                <div>
                  <label className="text-xs font-medium text-slate-300 mb-1 block">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="text-xs font-medium text-slate-300 mb-1 block">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Password */}
              {authModalView !== "forgot-password" && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-300">Password</label>
                    {authModalView === "login" && (
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMessage(null);
                          setSuccessMessage(null);
                          setAuthModalView("forgot-password");
                        }}
                        className="text-[11px] text-blue-400 hover:text-blue-300"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {authModalView === "login" && "Sign In"}
                      {authModalView === "register" && "Create Account"}
                      {authModalView === "forgot-password" && "Send Reset Link"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {/* View Switchers */}
              <div className="text-center pt-2 text-xs text-slate-400">
                {authModalView === "login" && (
                  <p>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setSuccessMessage(null);
                        setAuthModalView("register");
                      }}
                      className="text-blue-400 font-semibold hover:underline"
                    >
                      Sign up free
                    </button>
                  </p>
                )}

                {authModalView === "register" && (
                  <p>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setSuccessMessage(null);
                        setAuthModalView("login");
                      }}
                      className="text-blue-400 font-semibold hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                )}

                {authModalView === "forgot-password" && (
                  <p>
                    Remember your password?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setSuccessMessage(null);
                        setAuthModalView("login");
                      }}
                      className="text-blue-400 font-semibold hover:underline"
                    >
                      Back to sign in
                    </button>
                  </p>
                )}

                {/* Continue as Guest option */}
                <div className="pt-3 border-t border-slate-800/80 mt-3 flex flex-col items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full py-2 px-3 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Continue as Guest (No Sign-In Required)</span>
                  </button>
                  <span className="text-[10px] text-slate-500">
                    PhotoMaze is 100% free. Creating an account is completely optional.
                  </span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

