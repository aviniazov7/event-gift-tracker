import { useEffect, useMemo, useState } from "react";
import {
  getEvents,
  getPersons,
  getReciprocity,
  getTransactions,
} from "../api/client.js";
import BackButton from "../components/BackButton.jsx";
import DirectionBadge from "../components/DirectionBadge.jsx";
import { formatMoney } from "../utils/money.js";

function ReciprocitySummary({ reciprocity }) {
  const balance = Number(reciprocity.balance);
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-2xl border border-black/5 bg-card px-4 py-3 text-center shadow-sm dark:border-white/10">
        <p className="text-xs text-muted">נתת</p>
        <p className="mt-1 text-base font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
          {formatMoney(reciprocity.total_given)}
        </p>
      </div>
      <div className="rounded-2xl border border-black/5 bg-card px-4 py-3 text-center shadow-sm dark:border-white/10">
        <p className="text-xs text-muted">קיבלת</p>
        <p className="mt-1 text-base font-semibold tabular-nums text-amber-600 dark:text-amber-400">
          {formatMoney(reciprocity.total_received)}
        </p>
      </div>
      <div className="rounded-2xl border border-black/5 bg-card px-4 py-3 text-center shadow-sm dark:border-white/10">
        <p className="text-xs text-muted">מאזן</p>
        <p
          className={`mt-1 text-base font-semibold tabular-nums ${
            balance >= 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {formatMoney(reciprocity.balance)}
        </p>
      </div>
    </div>
  );
}

export default function PersonDetail({ personId, nav }) {
  const [person, setPerson] = useState(null);
  const [reciprocity, setReciprocity] = useState(null);
  const [gifts, setGifts] = useState([]);
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    Promise.all([
      getPersons(),
      getReciprocity(personId),
      getTransactions({ person_id: personId }),
      getEvents(),
    ])
      .then(([ppl, recip, txns, evts]) => {
        setPerson(ppl.find((p) => p.id === personId) ?? null);
        setReciprocity(recip);
        setGifts(txns);
        setEvents(evts);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [personId]);

  const eventName = useMemo(() => {
    const map = new Map(events.map((e) => [e.id, e.title]));
    return (id) => map.get(id) ?? `אירוע #${id}`;
  }, [events]);

  if (status === "loading") {
    return <p className="text-sm text-muted">טוען…</p>;
  }

  if (status === "error" || !person) {
    return (
      <div>
        <BackButton onClick={nav.back} />
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          לא הצלחנו לטעון את פרטי האדם.
        </div>
      </div>
    );
  }

  return (
    <div>
      <BackButton onClick={nav.back} />

      <div className="space-y-8">
        <header>
          <h2 className="text-2xl font-semibold tracking-tight">
            {person.full_name}
          </h2>
        </header>

        <ReciprocitySummary reciprocity={reciprocity} />

        <section className="space-y-5">
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg font-semibold tracking-tight">מתנות</h3>
            <span className="text-sm text-muted">{gifts.length} מתנות</span>
          </div>

          {gifts.length === 0 ? (
            <div className="rounded-2xl border border-black/5 bg-card px-5 py-8 text-center text-sm text-muted dark:border-white/10">
              אין מתנות לאדם זה עדיין.
            </div>
          ) : (
            <ul className="space-y-3">
              {gifts.map((gift) => (
                <li
                  key={gift.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-black/5 bg-card px-5 py-4 shadow-sm dark:border-white/10"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <DirectionBadge direction={gift.direction} />
                    <button
                      type="button"
                      onClick={() => nav.openEvent(gift.event_id)}
                      className="focus-ring cursor-pointer truncate rounded-md text-sm font-medium text-ink hover:underline"
                    >
                      {eventName(gift.event_id)}
                    </button>
                  </div>
                  <span className="shrink-0 text-base font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatMoney(gift.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
