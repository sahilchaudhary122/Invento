
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { ApiResponseError } from "@/lib/api/client";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiResponseError) {
        setError(err.detail);
      } else {
        setError("Could not connect to the authentication server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen bg-background text-text">
      {/* LEFT: Brand Panel */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-primary text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">Invento</span>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-5xl font-extrabold leading-tight mb-6 tracking-tight">
            Intelligent Inventory Control.
          </h1>
          <p className="text-white/80 text-xl font-medium leading-relaxed">
            Know what stock exists, where it is, and what needs attention in real-time.
          </p>
        </div>

        <div className="relative z-10 text-white/50 text-xs font-semibold uppercase tracking-widest">
          Odoo Hackathon 2026
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-primary via-primary/90 to-purple-800 opacity-50" />
      </div>

      {/* RIGHT: Login Form */}
      <div className="flex items-center justify-center p-8 bg-background text-text">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-text tracking-tight">Welcome back</h2>
            <p className="text-muted mt-2 font-medium">Sign in to your dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-sm font-medium dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-300">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-text mb-1.5 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  className="input pl-11 h-12"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <label className="block text-sm font-semibold text-text">Password</label>
                <button
                  type="button"
                  className="text-xs font-bold text-primary hover:text-primary-hover transition-colors"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  className="input pl-11 h-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 ml-1">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary transition-colors cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm font-medium text-muted cursor-pointer">
                Remember this device
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-12 justify-center shadow-lg shadow-primary/20 mt-4 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 ml-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-border text-center text-sm">
            <span className="text-muted font-medium">New to Invento?</span>{" "}
            <button className="text-primary font-bold hover:underline ml-1">
              Contact Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}