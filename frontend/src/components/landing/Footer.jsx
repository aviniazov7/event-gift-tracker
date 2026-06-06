import { Gift } from "lucide-react";

// Adapted from 21st.dev "footer-section": a clean brand + links + copyright bar.
// Kept intentionally lightweight (no newsletter form / Radix tooltip-switch
// tree) to respect the "keep it lightweight" goal.
export default function Footer() {
  return (
    <footer className="border-t border-black/5 dark:border-white/10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-10 text-center sm:flex-row sm:justify-between sm:text-start">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
            <Gift className="h-4 w-4 text-white" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">GiftLedger</p>
            <p className="text-xs text-muted">יומן מתנות לאירועים</p>
          </div>
        </div>

        <nav className="flex items-center gap-5 text-sm text-muted">
          <a
            href="https://github.com/aviniazov7/event-gift-tracker"
            target="_blank"
            rel="noreferrer"
            className="focus-ring rounded transition-colors hover:text-ink"
          >
            קוד המקור
          </a>
        </nav>

        <p className="text-xs text-muted">© 2026 GiftLedger</p>
      </div>
    </footer>
  );
}
