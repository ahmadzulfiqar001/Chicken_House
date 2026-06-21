export const COOKIE_CONSENT_VERSION = "2026-06-db-consent";
export const COOKIE_CONSENT_KEY = `chicken_house_cookie_consent_${COOKIE_CONSENT_VERSION}`;
export const COOKIE_CONSENT_CHANGED_EVENT = "chicken-house:cookie-consent-changed";
const COOKIE_CONSENT_LEGACY_KEY = "chicken_house_cookie_consent";
const COOKIE_CONSENT_VISITOR_KEY = "chicken_house_cookie_visitor_id";
const COOKIE_CONSENT_PENDING_KEY = "chicken_house_cookie_consent_pending";

type CookieConsentChoice = "accepted" | "rejected";

type CookieConsentPayload = {
  visitorId: string;
  choice: CookieConsentChoice;
  consentVersion: string;
  source: string;
  page: string;
  timezone: string;
  decidedAt: string;
};

const dispatchConsentChanged = () => {
  window.dispatchEvent(new Event(COOKIE_CONSENT_CHANGED_EVENT));
};

const createVisitorId = () => {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const getOrCreateVisitorId = () => {
  if (typeof window === "undefined") return "";

  try {
    const existing = localStorage.getItem(COOKIE_CONSENT_VISITOR_KEY);
    if (existing) return existing;

    const visitorId = createVisitorId();
    localStorage.setItem(COOKIE_CONSENT_VISITOR_KEY, visitorId);
    return visitorId;
  } catch {
    return createVisitorId();
  }
};

const buildConsentPayload = (choice: CookieConsentChoice): CookieConsentPayload => ({
  visitorId: getOrCreateVisitorId(),
  choice,
  consentVersion: COOKIE_CONSENT_VERSION,
  source: "cookie-banner",
  page: `${window.location.pathname}${window.location.search}`,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
  decidedAt: new Date().toISOString(),
});

const saveLocalChoice = (choice: CookieConsentChoice) => {
  localStorage.setItem(COOKIE_CONSENT_KEY, choice);
  localStorage.removeItem(COOKIE_CONSENT_LEGACY_KEY);
};

const postCookieConsent = async (payload: CookieConsentPayload) => {
  const response = await fetch("/api/cookie-consent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  });

  if (!response.ok) {
    throw new Error("Cookie consent was not saved.");
  }
};

export const hasAcceptedCookieConsent = () => {
  if (typeof window === "undefined") return false;

  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
};

export const acceptCookieConsent = async () => {
  if (typeof window === "undefined") return;

  const payload = buildConsentPayload("accepted");

  try {
    saveLocalChoice("accepted");
    localStorage.setItem(COOKIE_CONSENT_PENDING_KEY, JSON.stringify(payload));
  } catch {
    // If storage is unavailable, the protected app will keep asking.
  }

  dispatchConsentChanged();

  try {
    await postCookieConsent(payload);
    localStorage.removeItem(COOKIE_CONSENT_PENDING_KEY);
  } catch {
    // Keep the pending payload so the app can retry on the next load.
  }
};

export const rejectCookieConsent = () => {
  if (typeof window === "undefined") return;

  try {
    saveLocalChoice("rejected");
    localStorage.removeItem(COOKIE_CONSENT_PENDING_KEY);
  } catch {
    // If storage is unavailable, the banner will ask again next visit.
  }

  dispatchConsentChanged();
};

/** True once the visitor has made any choice (accepted OR rejected). */
export const hasDecidedCookieConsent = () => {
  if (typeof window === "undefined") return false;

  try {
    const value = localStorage.getItem(COOKIE_CONSENT_KEY);
    return value === "accepted" || value === "rejected";
  } catch {
    return false;
  }
};

export const syncPendingCookieConsent = async () => {
  if (typeof window === "undefined") return;

  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_PENDING_KEY);
    if (!raw) return;

    const payload = JSON.parse(raw) as CookieConsentPayload;
    if (payload.choice !== "accepted") {
      localStorage.removeItem(COOKIE_CONSENT_PENDING_KEY);
      return;
    }

    await postCookieConsent(payload);
    localStorage.removeItem(COOKIE_CONSENT_PENDING_KEY);
  } catch {
    // Retry later without interrupting the visitor.
  }
};

export const clearCookieConsent = () => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    localStorage.removeItem(COOKIE_CONSENT_LEGACY_KEY);
    localStorage.removeItem(COOKIE_CONSENT_PENDING_KEY);
  } catch {
    // Ignore unavailable storage.
  }

  dispatchConsentChanged();
};
