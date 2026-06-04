// Shared styling + label wrapper used by every form on the site.

export const fieldClasses =
  "w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-ink " +
  "outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 " +
  "dark:border-white/15 dark:bg-night dark:text-ink " +
  "dark:focus:border-emerald-500 dark:focus:ring-emerald-500/25";

export function Field({ label, children }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
