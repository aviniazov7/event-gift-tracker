import { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Gift } from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useTheme } from "../hooks/useTheme.js";
import { prewarm } from "../api/client.js";
import ThemeToggle from "../components/ThemeToggle.jsx";
import Spinner from "../components/Spinner.jsx";

export default function LoginScreen() {
  const { login } = useAuth();
  const { theme } = useTheme();
  const [status, setStatus] = useState("idle"); // idle | loading | slow | error
  // Keep the last Google credential so "נסה שוב" can retry without re-prompting.
  const lastCredential = useRef(null);

  // Wake the (possibly sleeping) free-tier backend the moment the screen loads,
  // overlapping the cold start with the user reading the page.
  useEffect(() => {
    prewarm();
  }, []);

  async function attemptLogin(credential) {
    if (!credential) {
      setStatus("error");
      return;
    }
    lastCredential.current = credential;
    setStatus("loading");
    // After a short wait, reassure the user that a cold start is in progress.
    const slowTimer = setTimeout(() => {
      setStatus((s) => (s === "loading" ? "slow" : s));
    }, 2000);
    try {
      // The auth call retries through a cold start (up to ~60s) and never hangs.
      await login(credential);
    } catch {
      setStatus("error");
    } finally {
      clearTimeout(slowTimer);
    }
  }

  function handleRetry() {
    if (lastCredential.current) attemptLogin(lastCredential.current);
    else setStatus("idle"); // no credential to reuse — show the button again
  }

  const busy = status === "loading" || status === "slow";

  return (
    <div className="flex min-h-full flex-col">
      {/* Let users set the theme before signing in. */}
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-20">
        <div className="w-full max-w-sm text-center">
          <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600">
            <Gift className="h-8 w-8 text-white" strokeWidth={2} aria-hidden="true" />
          </span>

          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            GiftLedger
          </h1>
          <p className="mt-2 text-sm text-muted">
            יומן המתנות שנתתם וקיבלתם — התחברו כדי להתחיל
          </p>

          <div className="mt-8 flex min-h-[2.5rem] flex-col items-center justify-center gap-3">
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
                <button
                  type="button"
                  onClick={handleRetry}
                  className="focus-ring inline-flex cursor-pointer items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-emerald-700 active:scale-[0.98] dark:bg-emerald-500 dark:hover:bg-emerald-400"
                >
                  נסה שוב
                </button>
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
        </div>
      </div>
    </div>
  );
}
