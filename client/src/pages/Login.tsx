"use client";
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, Eye, EyeOff } from "lucide-react";

type Mode = "login" | "register";

export default function Login() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const utils = trpc.useUtils();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body: Record<string, string> = { email, password };
      if (mode === "register" && name) body.name = name;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        const detail = data.detail ? ` (${data.detail})` : "";
        setError((data.error ?? "Something went wrong") + detail);
        return;
      }

      await utils.auth.me.invalidate();
      navigate("/lessons");
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
      {/* Logo */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">🇱🇦🇹🇭</div>
        <h1 className="text-2xl font-bold text-white">
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p className="text-white/40 text-sm mt-1">
          {mode === "login" ? "Sign in to continue learning" : "Start your language journey"}
        </p>
      </div>

      {/* Form card */}
      <div className="w-full max-w-sm bg-card border border-white/8 rounded-3xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="text-white/50 text-xs font-medium uppercase tracking-wider block mb-1.5">
                Name <span className="text-white/25">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all text-sm"
              />
            </div>
          )}

          <div>
            <label className="text-white/50 text-xs font-medium uppercase tracking-wider block mb-1.5">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all text-sm"
            />
          </div>

          <div>
            <label className="text-white/50 text-xs font-medium uppercase tracking-wider block mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder={mode === "register" ? "At least 6 characters" : "Your password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white placeholder-white/25 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-blue-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-400 transition-all blue-glow disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Please wait...</>
            ) : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-white/30">
          {mode === "login" ? (
            <>
              No account?{" "}
              <button
                type="button"
                onClick={() => { setMode("register"); setError(""); }}
                className="text-blue-400 font-semibold hover:text-blue-300 transition-colors"
              >
                Sign up free
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => { setMode("login"); setError(""); }}
                className="text-blue-400 font-semibold hover:text-blue-300 transition-colors"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>

      <p className="text-white/20 text-xs mt-6 text-center">
        Free to use · No credit card needed
      </p>
    </div>
  );
}
