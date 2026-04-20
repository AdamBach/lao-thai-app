import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(":");
  if (!salt || !key) return false;
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  const keyBuffer = Buffer.from(key, "hex");
  if (derivedKey.length !== keyBuffer.length) return false;
  return timingSafeEqual(derivedKey, keyBuffer);
}

export function registerOAuthRoutes(app: Express) {
  // POST /api/auth/register
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    const { email, password, name } = req.body ?? {};

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    if (typeof password !== "string" || password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }

    const emailLower = String(email).toLowerCase().trim();

    try {
      const existing = await db.getUserByEmail(emailLower);
      if (existing) {
        res.status(409).json({ error: "An account with this email already exists" });
        return;
      }

      const passwordHash = await hashPassword(password);
      const openId = `user_${randomBytes(16).toString("hex")}`;

      await db.upsertUser({
        openId,
        email: emailLower,
        name: name ? String(name).trim() : emailLower.split("@")[0],
        loginMethod: "email",
        passwordHash,
        lastSignedIn: new Date(),
      });

      const user = await db.getUserByOpenId(openId);
      if (!user) {
        res.status(500).json({ error: "Failed to create account" });
        return;
      }

      const sessionToken = await sdk.createSessionToken(openId, {
        name: user.name ?? "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("[Auth] Register failed:", msg, error);
      res.status(500).json({ error: "Registration failed", detail: msg });
    }
  });

  // POST /api/auth/login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const emailLower = String(email).toLowerCase().trim();

    try {
      const user = await db.getUserByEmail(emailLower);

      if (!user || !user.passwordHash) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      const valid = await verifyPassword(String(password), user.passwordHash);
      if (!valid) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name ?? "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("[Auth] Login failed:", msg, error);
      res.status(500).json({ error: "Login failed", detail: msg });
    }
  });

  // GET /api/auth/google — redirect to Google consent screen
  app.get("/api/auth/google", (req: Request, res: Response) => {
    const clientId = ENV.googleClientId;
    if (!clientId) {
      res.status(500).send("Google OAuth is not configured");
      return;
    }
    const proto = req.headers["x-forwarded-proto"] ?? req.protocol;
    const host = req.headers["x-forwarded-host"] ?? req.get("host");
    const redirectUri = `${proto}://${host}/api/auth/google/callback`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "online",
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  });

  // GET /api/auth/google/callback — exchange code for tokens, create session
  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const { code, error: oauthError } = req.query as Record<string, string>;

    if (oauthError || !code) {
      res.redirect("/login?error=google_denied");
      return;
    }

    const clientId = ENV.googleClientId;
    const clientSecret = ENV.googleClientSecret;
    if (!clientId || !clientSecret) {
      res.redirect("/login?error=google_not_configured");
      return;
    }

    try {
      const proto = req.headers["x-forwarded-proto"] ?? req.protocol;
      const host = req.headers["x-forwarded-host"] ?? req.get("host");
      const redirectUri = `${proto}://${host}/api/auth/google/callback`;

      // Exchange code → tokens
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });
      const tokenData = await tokenRes.json() as { access_token?: string; error?: string };
      if (!tokenData.access_token) {
        console.error("[Google OAuth] Token exchange failed:", tokenData);
        res.redirect("/login?error=google_token_failed");
        return;
      }

      // Fetch user info
      const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profile = await profileRes.json() as {
        sub?: string; email?: string; name?: string; picture?: string;
      };

      if (!profile.sub || !profile.email) {
        res.redirect("/login?error=google_no_email");
        return;
      }

      const openId = `google_${profile.sub}`;
      const emailLower = profile.email.toLowerCase();

      // Upsert user (creates on first login, updates name/email on subsequent logins)
      await db.upsertUser({
        openId,
        email: emailLower,
        name: profile.name ?? emailLower.split("@")[0],
        loginMethod: "google",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(openId, {
        name: profile.name ?? "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect("/lessons");
    } catch (err) {
      console.error("[Google OAuth] Callback error:", err);
      res.redirect("/login?error=google_failed");
    }
  });
}
