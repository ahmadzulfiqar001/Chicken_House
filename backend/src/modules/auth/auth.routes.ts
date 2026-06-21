import crypto from "crypto";
import express from "express";
import { db } from "../../core/db";
import {
  clearAuthCookie,
  completePasswordReset,
  createCustomerProfile,
  createPasswordResetToken,
  createSessionForUser,
  deactivateSession,
  findAccountByEmail,
  getAuthenticatedUser,
  hashPassword,
  normalizeAccountPayload,
  normalizeEmailInput,
  setAuthCookie,
  verifyPassword,
} from "./auth.service";
import { UserAccountModel } from "../../core/models";
import { isMongoConfigured } from "../../core/mongo";
import { deliverNotification } from "../notifications/notify.service";

const router = express.Router();
const socialProviders = {
  google: "Google",
  facebook: "Facebook",
} as const;

type SocialProvider = keyof typeof socialProviders;

type SocialConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
};

type SocialProfile = {
  email: string;
  name: string;
  avatarUrl: string;
  emailVerified: boolean;
};

const OAUTH_STATE_COOKIE_NAME = "chicken_house_oauth_state";
const OAUTH_STATE_MAX_AGE_MS = 10 * 60 * 1000;

const getRequestOrigin = (req: express.Request) => {
  const configuredOrigin = process.env.APP_ORIGIN?.split(",")[0]?.trim();
  if (configuredOrigin) return configuredOrigin.replace(/\/$/, "");
  return `${req.protocol}://${req.get("host")}`;
};

const firstConfiguredValue = (...keys: string[]) =>
  keys.map((key) => process.env[key]?.trim()).find((value): value is string => Boolean(value));

const parseSocialProvider = (value: string) => {
  const provider = value.toLowerCase() as SocialProvider;
  return socialProviders[provider] ? provider : null;
};

const getSocialConfig = (provider: SocialProvider): SocialConfig | null => {
  const config =
    provider === "google"
      ? {
          clientId: firstConfiguredValue("GOOGLE_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_ID"),
          clientSecret: firstConfiguredValue("GOOGLE_CLIENT_SECRET", "GOOGLE_OAUTH_CLIENT_SECRET"),
          redirectUri: firstConfiguredValue("GOOGLE_REDIRECT_URI", "GOOGLE_OAUTH_REDIRECT_URI"),
        }
      : {
          clientId: firstConfiguredValue("FACEBOOK_CLIENT_ID", "FACEBOOK_APP_ID", "FACEBOOK_OAUTH_CLIENT_ID"),
          clientSecret: firstConfiguredValue(
            "FACEBOOK_CLIENT_SECRET",
            "FACEBOOK_APP_SECRET",
            "FACEBOOK_OAUTH_CLIENT_SECRET",
          ),
          redirectUri: firstConfiguredValue("FACEBOOK_REDIRECT_URI", "FACEBOOK_OAUTH_REDIRECT_URI"),
        };

  if (!config.clientId || !config.clientSecret) {
    return null;
  }

  return config as SocialConfig;
};

const getSocialCallbackUrl = (req: express.Request, provider: SocialProvider, config: SocialConfig) =>
  config.redirectUri ?? `${getRequestOrigin(req)}/api/auth/social/${provider}/callback`;

const getGraphVersion = () => {
  const version = firstConfiguredValue("FACEBOOK_GRAPH_VERSION", "FACEBOOK_OAUTH_VERSION") ?? "v20.0";
  return version.startsWith("v") ? version : `v${version}`;
};

const readCookie = (req: express.Request, name: string) => {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return "";

  for (const cookie of cookieHeader.split(";")) {
    const [rawKey, ...rawValue] = cookie.trim().split("=");
    if (rawKey === name) {
      try {
        return decodeURIComponent(rawValue.join("="));
      } catch {
        return rawValue.join("=");
      }
    }
  }

  return "";
};

const setSocialStateCookie = (res: express.Response, value: string) => {
  res.cookie(OAUTH_STATE_COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: OAUTH_STATE_MAX_AGE_MS,
    path: "/",
  });
};

const clearSocialStateCookie = (res: express.Response) => {
  res.clearCookie(OAUTH_STATE_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
};

const socialRedirectPath = (page: "/login" | "/signup", provider: SocialProvider, status: string) =>
  `${page}?social=${encodeURIComponent(provider)}&status=${encodeURIComponent(status)}`;

const readJsonResponse = async (response: Response) => {
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    const nestedError = data.error && typeof data.error === "object" ? (data.error as Record<string, unknown>) : null;
    const message =
      String(data.error_description ?? "") ||
      String(nestedError?.message ?? "") ||
      String(data.error ?? "") ||
      "Social provider request failed.";
    throw new Error(message);
  }

  return data;
};

const getAvatarInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CH";

const getProfileName = (name: string, email: string) => {
  const trimmedName = name.trim();
  if (trimmedName) return trimmedName;
  return email.split("@")[0]?.replace(/[._-]+/g, " ").trim() || "Chicken House Customer";
};

const fetchGoogleProfile = async (
  req: express.Request,
  code: string,
  config: SocialConfig,
): Promise<SocialProfile> => {
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: getSocialCallbackUrl(req, "google", config),
      grant_type: "authorization_code",
    }),
  });
  const tokenData = await readJsonResponse(tokenResponse);
  const accessToken = String(tokenData.access_token ?? "");

  if (!accessToken) {
    throw new Error("Google did not return an access token.");
  }

  const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const profile = await readJsonResponse(profileResponse);
  const email = normalizeEmailInput(String(profile.email ?? ""));

  return {
    email,
    name: getProfileName(String(profile.name ?? ""), email),
    avatarUrl: String(profile.picture ?? ""),
    emailVerified: profile.email_verified === true || String(profile.email_verified) === "true",
  };
};

const fetchFacebookProfile = async (
  req: express.Request,
  code: string,
  config: SocialConfig,
): Promise<SocialProfile> => {
  const graphVersion = getGraphVersion();
  const tokenUrl = new URL(`https://graph.facebook.com/${graphVersion}/oauth/access_token`);
  tokenUrl.searchParams.set("client_id", config.clientId);
  tokenUrl.searchParams.set("client_secret", config.clientSecret);
  tokenUrl.searchParams.set("redirect_uri", getSocialCallbackUrl(req, "facebook", config));
  tokenUrl.searchParams.set("code", code);

  const tokenData = await readJsonResponse(await fetch(tokenUrl));
  const accessToken = String(tokenData.access_token ?? "");

  if (!accessToken) {
    throw new Error("Facebook did not return an access token.");
  }

  const profileUrl = new URL(`https://graph.facebook.com/${graphVersion}/me`);
  profileUrl.searchParams.set("fields", "id,name,email,picture.type(large)");
  profileUrl.searchParams.set("access_token", accessToken);

  const profile = await readJsonResponse(await fetch(profileUrl));
  const picture = profile.picture as { data?: { url?: unknown } } | undefined;
  const email = normalizeEmailInput(String(profile.email ?? ""));

  return {
    email,
    name: getProfileName(String(profile.name ?? ""), email),
    avatarUrl: String(picture?.data?.url ?? ""),
    emailVerified: Boolean(email),
  };
};

const getSocialProfile = (req: express.Request, provider: SocialProvider, code: string, config: SocialConfig) =>
  provider === "google" ? fetchGoogleProfile(req, code, config) : fetchFacebookProfile(req, code, config);

const buildSocialAuthUrl = (
  req: express.Request,
  provider: SocialProvider,
  config: SocialConfig,
  state: string,
) => {
  if (provider === "google") {
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", config.clientId);
    url.searchParams.set("redirect_uri", getSocialCallbackUrl(req, provider, config));
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", state);
    url.searchParams.set("prompt", "select_account");
    return url;
  }

  const url = new URL(`https://www.facebook.com/${getGraphVersion()}/dialog/oauth`);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", getSocialCallbackUrl(req, provider, config));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "email,public_profile");
  url.searchParams.set("state", state);
  return url;
};

const upsertSocialCustomerAccount = async (provider: SocialProvider, profile: SocialProfile) => {
  const existing = (await findAccountByEmail(profile.email)) as Record<string, unknown> | null;
  const now = new Date().toISOString();

  if (existing) {
    if (String(existing.role ?? "user") !== "user") {
      return { ok: false as const };
    }

    const patch: Record<string, unknown> = {
      provider,
      emailVerified: Boolean(existing.emailVerified) || profile.emailVerified,
      avatarUrl: profile.avatarUrl || String(existing.avatarUrl ?? ""),
      lastLoginAt: now,
    };

    if (!String(existing.customerProfileId ?? "")) {
      const customerProfileId = `customer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      await createCustomerProfile({
        id: customerProfileId,
        name: String(existing.name ?? profile.name),
        email: profile.email,
        phone: String(existing.phone ?? ""),
      });
      patch.customerProfileId = customerProfileId;
    }

    if (isMongoConfigured()) {
      await UserAccountModel.updateOne({ id: existing.id }, patch);
      const updated = await UserAccountModel.findOne({ id: existing.id }).lean();
      return { ok: true as const, account: (updated ?? { ...existing, ...patch }) as Record<string, unknown> };
    }

    Object.assign(existing, patch);
    return { ok: true as const, account: existing };
  }

  const customerProfileId = `customer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const accountRecord = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: profile.name,
    email: profile.email,
    passwordHash: hashPassword(crypto.randomBytes(32).toString("hex")),
    adminVisiblePassword: "",
    role: "user" as const,
    provider,
    status: "Active" as const,
    phone: "",
    memberSince: new Date().getFullYear().toString(),
    emailVerified: profile.emailVerified,
    lastLoginAt: now,
    avatarUrl: profile.avatarUrl,
    avatarInitials: getAvatarInitials(profile.name),
    customerProfileId,
    preferences: {
      notifications: true,
      promotions: true,
      orderUpdates: true,
      language: "en",
      theme: "restaurant-dark",
    },
  };

  if (isMongoConfigured()) {
    await UserAccountModel.create(accountRecord);
  } else {
    db.userAccounts.push(accountRecord);
  }

  await createCustomerProfile({
    id: customerProfileId,
    name: profile.name,
    email: profile.email,
  });

  return { ok: true as const, account: accountRecord };
};

router.get("/me", async (req, res) => {
  const user = await getAuthenticatedUser(req);

  if (!user) {
    return res.status(401).json({ message: "No active session." });
  }

  return res.json({ user });
});

router.post("/login", async (req, res) => {
  const email = normalizeEmailInput(String(req.body?.email ?? ""));
  const password = String(req.body?.password ?? "");

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const account = await findAccountByEmail(email);

  if (!account || !verifyPassword(password, String(account.passwordHash ?? ""))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const user = normalizeAccountPayload(account as Record<string, unknown>);
  const token = await createSessionForUser(req, user);
  setAuthCookie(res, token);

  return res.json({ user });
});

router.post("/forgot-password", async (req, res) => {
  const email = normalizeEmailInput(String(req.body?.email ?? ""));

  if (!email.includes("@")) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  const account = await findAccountByEmail(email);

  if (account && String(account.status ?? "Active") === "Active") {
    const { token, expiresAt } = await createPasswordResetToken(account as Record<string, unknown>);
    const resetUrl = `${getRequestOrigin(req)}/reset-password?token=${encodeURIComponent(token)}`;
    const name = String(account.name ?? "Chicken House customer");

    try {
      const delivery = await deliverNotification({
        channel: "email",
        title: "Reset your Chicken House password",
        message:
          `Hi ${name},\n\nWe received a request to reset your Chicken House account password. ` +
          `Use this secure link within 60 minutes:\n\n${resetUrl}\n\n` +
          `This link expires at ${new Date(expiresAt).toLocaleString("en-PK", {
            dateStyle: "medium",
            timeStyle: "short",
          })}. If you did not request this, you can safely ignore this email.`,
        recipients: [{ email, name }],
      });

      if (delivery.skipped) {
        console.warn("Password reset email was not sent because Resend is not configured.");
      }
      if (delivery.errors.length) {
        console.error("Password reset email delivery failed:", delivery.errors.join("; "));
      }
    } catch (error) {
      console.error("Password reset email delivery failed:", (error as Error).message);
    }
  }

  return res.json({
    message: "If an account exists for that email, a password reset link has been sent.",
  });
});

router.post("/reset-password", async (req, res) => {
  const token = String(req.body?.token ?? "").trim();
  const password = String(req.body?.password ?? "");

  if (token.length < 20) {
    return res.status(400).json({ message: "Reset link is invalid." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  const result = await completePasswordReset(token, password);

  if (!result.ok) {
    return res.status(400).json({ message: result.message });
  }

  return res.json({ message: "Password reset successfully. Please sign in with your new password." });
});

router.post("/signup", async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  const email = normalizeEmailInput(String(req.body?.email ?? ""));
  const password = String(req.body?.password ?? "");
  const phone = String(req.body?.phone ?? "").trim();

  if (name.length < 2) {
    return res.status(400).json({ message: "Please enter your full name." });
  }

  if (!email.includes("@")) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  const existing = await findAccountByEmail(email);

  if (existing) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  const customerProfileId = `customer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const accountRecord = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    email,
    passwordHash: hashPassword(password),
    adminVisiblePassword: "",
    role: "user" as const,
    provider: "email" as const,
    status: "Active" as const,
    phone,
    memberSince: new Date().getFullYear().toString(),
    emailVerified: false,
    lastLoginAt: "",
    avatarUrl: "",
    avatarInitials: name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    customerProfileId,
    preferences: {
      notifications: true,
      promotions: true,
      orderUpdates: true,
      language: "en",
      theme: "restaurant-dark",
    },
  };

  if (isMongoConfigured()) {
    await UserAccountModel.create(accountRecord);
  } else {
    db.userAccounts.push(accountRecord);
  }

  await createCustomerProfile({
    id: customerProfileId,
    name,
    email,
    phone,
  });

  return res.status(201).json({
    message: "Account created successfully. Please sign in to continue.",
    email,
  });
});

router.get("/social/:provider", (req, res) => {
  const provider = parseSocialProvider(String(req.params.provider ?? ""));

  if (!provider) {
    return res.redirect("/signup");
  }

  const config = getSocialConfig(provider);

  if (!config) {
    return res.redirect(socialRedirectPath("/signup", provider, "unavailable"));
  }

  const state = `${provider}:${crypto.randomBytes(24).toString("hex")}`;
  setSocialStateCookie(res, state);
  return res.redirect(buildSocialAuthUrl(req, provider, config, state).toString());
});

router.get("/social/:provider/callback", async (req, res) => {
  const provider = parseSocialProvider(String(req.params.provider ?? ""));

  if (!provider) {
    return res.redirect("/signup");
  }

  const error = String(req.query.error ?? "");

  if (error) {
    clearSocialStateCookie(res);
    return res.redirect(socialRedirectPath("/signup", provider, "cancelled"));
  }

  const state = String(req.query.state ?? "");
  const storedState = readCookie(req, OAUTH_STATE_COOKIE_NAME);

  if (!state || !storedState || state !== storedState || !state.startsWith(`${provider}:`)) {
    clearSocialStateCookie(res);
    return res.redirect(socialRedirectPath("/signup", provider, "invalid-state"));
  }

  const code = String(req.query.code ?? "");
  const config = getSocialConfig(provider);

  if (!code || !config) {
    clearSocialStateCookie(res);
    return res.redirect(socialRedirectPath("/signup", provider, "unavailable"));
  }

  try {
    const profile = await getSocialProfile(req, provider, code, config);

    if (!profile.email.includes("@")) {
      clearSocialStateCookie(res);
      return res.redirect(socialRedirectPath("/signup", provider, "email-missing"));
    }

    const result = await upsertSocialCustomerAccount(provider, profile);

    if (!result.ok) {
      clearSocialStateCookie(res);
      return res.redirect(socialRedirectPath("/login", provider, "managed-account"));
    }

    const user = normalizeAccountPayload(result.account);
    const token = await createSessionForUser(req, user, provider);
    clearSocialStateCookie(res);
    setAuthCookie(res, token);
    return res.redirect("/profile");
  } catch (error) {
    console.error(`${socialProviders[provider]} sign-in failed`, error);
    clearSocialStateCookie(res);
    return res.redirect(socialRedirectPath("/signup", provider, "failed"));
  }
});

router.post("/social-signup", async (req, res) => {
  const provider = parseSocialProvider(String(req.body?.provider ?? ""));

  if (!provider) {
    return res.status(400).json({ message: "Unsupported sign-up provider." });
  }

  return res.json({
    message: `${socialProviders[provider]} sign-up will continue in your browser.`,
    redirectUrl: `/api/auth/social/${provider}`,
    email: "",
  });
});

router.post("/logout", async (req, res) => {
  await deactivateSession(req);
  clearAuthCookie(res);
  return res.json({ message: "Logged out successfully." });
});

export default router;
