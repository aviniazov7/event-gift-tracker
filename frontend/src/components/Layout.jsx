const NAV = [
  { key: "transactions", label: "תנועות" },
  { key: "persons", label: "אנשים" },
  { key: "events", label: "אירועים" },
];

export default function Layout({ page, onNavigate, children }) {
  return (
    <div className="min-h-full">
      <header className="border-b border-black/5 bg-cream/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-4 gap-y-3 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-lg">
              🎁
            </span>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-ink">
                GiftLedger
              </h1>
              <p className="text-xs text-muted">מתנות שנתתי וקיבלתי</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 sm:mr-auto">
            {NAV.map((item) => {
              const active = item.key === page;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onNavigate(item.key)}
                  className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
                    active
                      ? "bg-emerald-600 text-white"
                      : "text-muted hover:bg-black/5 hover:text-ink"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">{children}</main>
    </div>
  );
}
