import { useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../auth/AuthContext.jsx";
import { useTheme } from "../hooks/useTheme.js";
import Spinner from "./Spinner.jsx";
import { Button } from "@/components/ui/button";

// The Google sign-in widget plus its cold-start feedback (loading → "server is
// waking" after 2s → error + retry). Self-contained so it can sit in the hero
// and the CTA section. On success the app re-renders into the signed-in UI.
export default function GoogleSignIn({ className = "" }) {
  const { login } = useAuth();
  const { theme } = useTheme();
  const [status, setStatus] = useState("idle"); // idle | loading | slow | error
  const lastCredential = useRef(null);

  async function attemptLogin(credential) {
    if (!credential) {
      setStatus("error");
      return;
    }
    lastCredential.current = credential;
    setStatus("loading");
    // Reassure the user once a free-tier cold start is clearly underway.
    const slowTimer = setTimeout(() => {
      setStatus((s) => (s === "loading" ? "slow" : s));
    }, 2000);
    try {
      await login(credential); // resilient: retries through a cold start
    } catch {
      setStatus("error");
    } finally {
      clearTimeout(slowTimer);
    }
  }

  function handleRetry() {
    if (lastCredential.current) attemptLogin(lastCredential.current);
    else setStatus("idle");
  }

  const busy = status === "loading" || status === "slow";

  return (
    <div className={`flex min-h-[2.5rem] flex-col items-center gap-3 ${className}`}>
      {busy ? (
        <p className="flex items-center justify-center gap-2 text-sm text-muted">
          <Spinner />
          <span>
            {status === "slow"
              ? "השרת מתעורר, זה יכול לקחת עד דקה בטעינה הראשונה…"
              : "מתחבר…"}
          </span>
        </p>
      ) : status === "error" ? (
        <>
          <p className="text-sm text-rose-600 dark:text-rose-400">
            לא הצלחנו להתחבר. בדקו את החיבור ונסו שוב.
          </p>
          <Button type="button" onClick={handleRetry}>
            נסה שוב
          </Button>
        </>
      ) : (
        <GoogleLogin
          onSuccess={(r) => attemptLogin(r?.credential)}
          onError={() => setStatus("error")}
          theme={theme === "dark" ? "filled_black" : "outline"}
          shape="pill"
          locale="he"
          text="signin_with"
        />
      )}
    </div>
  );
}
