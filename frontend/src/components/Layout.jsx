import ThemeToggle from "./ThemeToggle.jsx";
import ShareButton from "./ShareButton.jsx";

export default function Layout({ onHome, children }) {
  return (
    <div className="min-h-full">
      <header className="border-b border-black/5 bg-cream/80 backdrop-blur dark:border-white/10">
        <div className="mx-auto box-border flex w-full max-w-[40rem] items-center justify-between gap-3 px-4 py-4 md:max-w-3xl">
          <button
            type="button"
            onClick={onHome}
            className="flex items-center gap-3 text-right"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-lg">
              🎁
            </span>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-ink">
                GiftLedger
              </h1>
              <p className="text-xs text-muted">מתנות שנתתי וקיבלתי</p>
            </div>
          </button>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <ShareButton />
          </div>
        </div>
      </header>

      <main className="mx-auto box-border w-full max-w-[40rem] px-4 py-8 md:max-w-3xl">
        {children}
      </main>
    </div>
  );
}
