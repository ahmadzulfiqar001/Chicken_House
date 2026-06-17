export const COOKIE_CONSENT_KEY = "chicken_house_cookie_consent";
export const COOKIE_CONSENT_CHANGED_EVENT = "chicken-house:cookie-consent-changed";

export const hasAcceptedCookieConsent = () => {
  if (typeof window === "undefined") return false;

  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
};

export const acceptCookieConsent = () => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
  } catch {
    // If storage is unavailable, the protected app will keep asking.
  }

  window.dispatchEvent(new Event(COOKIE_CONSENT_CHANGED_EVENT));
};

export const rejectCookieConsent = () => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
  } catch {
    // If storage is unavailable, the banner will ask again next visit.
  }

  window.dispatchEvent(new Event(COOKIE_CONSENT_CHANGED_EVENT));
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

export const clearCookieConsent = () => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
  } catch {
    // Ignore unavailable storage.
  }

  window.dispatchEvent(new Event(COOKIE_CONSENT_CHANGED_EVENT));
};
