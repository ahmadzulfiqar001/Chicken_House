import { ReactNode, useEffect, useState } from "react";
import { Cookie } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "../../context/AuthContext";
import {
  acceptCookieConsent,
  COOKIE_CONSENT_CHANGED_EVENT,
  hasAcceptedCookieConsent,
} from "../../lib/cookieConsent";

const BACKOFFICE_ROLES: UserRole[] = ["admin", "manager", "hr", "rider", "staff"];

const ProtectedRoute = ({
  children,
  allow,
}: {
  children: ReactNode;
  allow?: UserRole[];
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const [cookiesAccepted, setCookiesAccepted] = useState(hasAcceptedCookieConsent());

  useEffect(() => {
    const syncCookieState = () => setCookiesAccepted(hasAcceptedCookieConsent());
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, syncCookieState);
    window.addEventListener("storage", syncCookieState);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, syncCookieState);
      window.removeEventListener("storage", syncCookieState);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper pt-40 text-center text-muted">
        Loading your session...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!cookiesAccepted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
        <div className="max-w-md rounded-lg border border-gray-100 bg-white p-8 text-center shadow-xl shadow-dark/10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Cookie size={26} />
          </div>
          <h1 className="mt-6 text-2xl font-display font-bold text-dark">Cookies required</h1>
          <p className="mt-3 text-sm leading-7 text-muted">
            Account login, cart memory, and customer/staff panels need cookies. Accept cookies to continue.
          </p>
          <button
            type="button"
            onClick={() => {
              acceptCookieConsent();
              setCookiesAccepted(true);
            }}
            className="mt-6 w-full rounded-lg bg-primary px-5 py-4 font-bold text-white transition hover:bg-primary-strong"
          >
            Accept Cookies
          </button>
        </div>
      </div>
    );
  }

  if (allow && !allow.includes(user.role)) {
    if (BACKOFFICE_ROLES.includes(user.role)) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
