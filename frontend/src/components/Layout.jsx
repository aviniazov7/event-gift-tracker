export default function Layout({ children }) {
  return (
    <div className="min-h-full">
      <header className="border-b border-black/5 bg-cream/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-lg">
            🎁
          </span>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-ink">
              GiftLedger
            </h1>
            <p className="text-xs text-muted">Gifts given &amp; received</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">{children}</main>
    </div>
  );
}
