import { eventTypeLabels } from "../utils/labels.js";
import { formatMoney } from "../utils/money.js";
import { formatDate } from "../utils/dates.js";
import DeleteButton from "./DeleteButton.jsx";

// One event in the home list. `stats` is { net, count } aggregated from this
// event's transactions. The card body opens the event; the trash deletes it.
export default function EventCard({ event, stats, index = 0, onOpen, onDelete }) {
  const net = stats?.net ?? 0;
  const count = stats?.count ?? 0;

  return (
    <li
      className="animate-row"
      style={{ "--row-delay": `${Math.min(index, 8) * 40}ms` }}
    >
      <div className="flex items-stretch rounded-2xl border border-black/5 bg-card shadow-soft transition duration-200 hover:border-emerald-300 hover:shadow-md dark:border-white/10 dark:hover:border-emerald-500/40">
        <button
          type="button"
          onClick={() => onOpen(event.id)}
          className="focus-ring flex flex-1 items-center justify-between gap-3 rounded-2xl px-5 py-4 text-right active:scale-[0.99]"
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
              {formatDate(event.event_date)} · {count} מתנות
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

        <DeleteButton
          label="מחיקת האירוע"
          onClick={() => onDelete(event)}
          className="mx-1 self-center"
        />
      </div>
    </li>
  );
}
