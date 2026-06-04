import { useState } from "react";
import { getReciprocity } from "../api/client.js";
import { relationLabels } from "../utils/labels.js";
import { formatMoney } from "../utils/money.js";

export default function PersonCard({ person }) {
  const [reciprocity, setReciprocity] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const next = !open;
    setOpen(next);
    // Lazy-load the balance the first time the card is expanded.
    if (next && !reciprocity) {
      setLoading(true);
      try {
        setReciprocity(await getReciprocity(person.id));
      } finally {
        setLoading(false);
      }
    }
  }

  const balance = reciprocity ? Number(reciprocity.balance) : 0;

  return (
    <li className="rounded-2xl border border-black/5 bg-card px-5 py-4 shadow-sm dark:border-white/10">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-ink">{person.full_name}</p>
          {person.notes && <p className="text-sm text-muted">{person.notes}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600 dark:bg-white/10 dark:text-stone-300">
            {relationLabels[person.relation] ?? person.relation}
          </span>
          <button
            type="button"
            onClick={toggle}
            className="whitespace-nowrap text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-400"
          >
            {open ? "הסתר מאזן" : "הצג מאזן"}
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-3 border-t border-black/5 pt-3 text-sm dark:border-white/10">
          {loading && <span className="text-muted">טוען…</span>}
          {!loading && reciprocity && (
            <p className="text-muted">
              נתת{" "}
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {formatMoney(reciprocity.total_given)}
              </span>{" "}
              · קיבלת{" "}
              <span className="font-medium text-amber-600 dark:text-amber-400">
                {formatMoney(reciprocity.total_received)}
              </span>{" "}
              · מאזן{" "}
              <span
                className={`font-semibold ${
                  balance >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {formatMoney(reciprocity.balance)}
              </span>
            </p>
          )}
        </div>
      )}
    </li>
  );
}
