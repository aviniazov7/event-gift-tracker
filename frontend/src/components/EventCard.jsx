import { eventTypeLabels } from "../utils/labels.js";
import { formatMoney } from "../utils/money.js";

// One event in the home list. `stats` is { net, count } aggregated from this
// event's transactions. Tapping opens the event detail screen.
export default function EventCard({ event, stats, onOpen }) {
  const net = stats?.net ?? 0;
  const count = stats?.count ?? 0;

  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(event.id)}
        className="focus-ring flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-black/5 bg-card px-5 py-4 text-right shadow-sm transition duration-200 hover:border-emerald-300 hover:shadow-md active:scale-[0.99] dark:border-white/10 dark:hover:border-emerald-500/40"
      >
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-ink">
              {event.title}
            </span>
            <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600 dark:bg-white/10 dark:text-stone-300">
              {eventTypeLabels[event.type] ?? event.type}
            </span>
          </div>
          <p className="text-sm text-muted">
            {event.event_date} · {count} מתנות
          </p>
        </div>

        <div className="shrink-0 text-left">
          <p className="text-xs text-muted">מאזן</p>
          <p
            className={`text-lg font-semibold tabular-nums ${
              net >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {formatMoney(net)}
          </p>
        </div>
      </button>
    </li>
  );
}
