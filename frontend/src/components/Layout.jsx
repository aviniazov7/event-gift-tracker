import { BarChart3, Gift, LogOut } from "lucide-react";
import ThemeToggle from "./ThemeToggle.jsx";
import ShareButton from "./ShareButton.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Layout({ onHome, onStats, children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-full">
      <header className="border-b border-black/5 bg-cream/80 backdrop-blur dark:border-white/10">
        <div className="mx-auto box-border flex w-full max-w-[40rem] items-center justify-between gap-3 px-4 py-4 md:max-w-3xl">
          <button
            type="button"
            onClick={onHome}
            className="focus-ring flex cursor-pointer items-center gap-3 rounded-xl text-right"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600">
              <Gift className="h-5 w-5 text-white" strokeWidth={2} aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-ink">
                GiftLedger
              </h1>
              <p className="text-xs text-muted">מתנות שנתתי וקיבלתי</p>
            </div>
          </button>

          <div className="flex items-center gap-1">
            {onStats && (
              <button
                type="button"
                onClick={onStats}
                aria-label="סטטיסטיקות"
                title="סטטיסטיקות"
                className="focus-ring cursor-pointer rounded-xl p-2.5 text-muted transition-colors duration-200 hover:bg-black/5 hover:text-ink dark:hover:bg-white/10"
              >
                <BarChart3 className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
            <ThemeToggle />
            <ShareButton />
            {user && (
              <>
                {/* Show who's signed in; hidden on the narrowest screens. */}
                <span
                  className="hidden max-w-[9rem] truncate px-1 text-sm text-muted sm:block"
                  title={user.email}
                >
                  {user.name || user.email}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  aria-label="התנתקות"
                  title="התנתקות"
                  className="focus-ring cursor-pointer rounded-xl p-2.5 text-muted transition-colors duration-200 hover:bg-black/5 hover:text-ink dark:hover:bg-white/10"
                >
                  <LogOut className="h-5 w-5" aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto box-border w-full max-w-[40rem] px-4 py-8 md:max-w-3xl">
        {children}
      </main>
    </div>
  );
}
