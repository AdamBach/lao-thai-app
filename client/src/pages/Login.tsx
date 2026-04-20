"use client";
import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
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
  const search = useSearch();
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    // Fetch runtime config to know if Google OAuth is available
    fetch("/api/auth/config")
      .then(r => r.json())
      .then((cfg: { googleEnabled?: boolean }) => setGoogleEnabled(!!cfg.googleEnabled))
      .catch(() => {});

    // Show error from Google OAuth redirect (e.g. ?error=google_denied)
    const params = new URLSearchParams(search);
    const err = params.get("error");
    if (err) {
      const messages: Record<string, string> = {
        google_denied: "Google sign-in was cancelled",
        google_token_failed: "Google sign-in failed — please try again",
        google_failed: "Google sign-in failed — please try again",
        google_not_configured: "Google sign-in is not set up yet",
        google_no_email: "Could not get email from Google",
      };
      setError(messages[err] ?? "Sign-in failed");
    }
  }, [search]);

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

      {/* Google button — only shown when server has GOOGLE_CLIENT_ID set */}
      {googleEnabled && (
        <>
          <div className="w-full max-w-sm mb-3">
            <a
              href="/api/auth/google"
              className="flex items-center justify-center gap-3 w-full py-3.5 rounded-2xl bg-white text-gray-800 font-semibold text-sm hover:bg-gray-100 transition-all shadow-sm"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </a>
          </div>
          <div className="w-full max-w-sm flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/25 text-xs">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
        </>
      )}

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
