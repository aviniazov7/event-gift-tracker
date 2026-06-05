import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Gift } from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useTheme } from "../hooks/useTheme.js";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function LoginScreen() {
  const { login } = useAuth();
  const { theme } = useTheme();
  const [status, setStatus] = useState("idle"); // idle | loading | error

  async function handleSuccess(credentialResponse) {
    const credential = credentialResponse?.credential;
    if (!credential) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      // On success the app re-renders into the main UI; nothing more to do.
      await login(credential);
    } catch {
      setStatus("error");
    }
  }

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

          <div className="mt-8 flex min-h-[2.5rem] items-center justify-center">
            {status === "loading" ? (
              <p className="text-sm text-muted">מתחבר…</p>
            ) : (
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => setStatus("error")}
                theme={theme === "dark" ? "filled_black" : "outline"}
                shape="pill"
                locale="he"
                text="signin_with"
              />
            )}
          </div>

          {status === "error" && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">
              ההתחברות נכשלה. נסו שוב.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
