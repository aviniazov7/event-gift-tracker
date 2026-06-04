import { useEffect, useMemo, useState } from "react";
import {
  createEvent,
  getEvents,
  getSummary,
  getTransactions,
} from "../api/client.js";
import SummaryCards from "../components/SummaryCards.jsx";
import EventQuickCreate from "../components/EventQuickCreate.jsx";
import EventCard from "../components/EventCard.jsx";

export default function HomePage({ nav }) {
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  async function load() {
    const [evts, sum, txns] = await Promise.all([
      getEvents(),
      getSummary(),
      getTransactions(),
    ]);
    setEvents(evts);
    setSummary(sum);
    setTransactions(txns);
  }

  useEffect(() => {
    load()
      .then(() => setStatus("ready"))
      .catch(() => setStatus("error"));
  }, []);

  // Aggregate per-event totals { net, count } from all transactions.
  const statsByEvent = useMemo(() => {
    const map = new Map();
    for (const tx of transactions) {
      const s = map.get(tx.event_id) ?? { given: 0, received: 0, count: 0 };
      if (tx.direction === "given") s.given += Number(tx.amount);
      else s.received += Number(tx.amount);
      s.count += 1;
      map.set(tx.event_id, s);
    }
    const result = new Map();
    for (const [id, s] of map) {
      result.set(id, { net: s.given - s.received, count: s.count });
    }
    return result;
  }, [transactions]);

  async function handleCreate(payload) {
    await createEvent(payload);
    await load();
  }

  if (status === "loading") {
    return <p className="text-sm text-muted">טוען…</p>;
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
        לא הצלחנו להתחבר לשרת. ודאו שהשרת רץ.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SummaryCards summary={summary} />

      <EventQuickCreate onCreate={handleCreate} />

      <section className="space-y-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold tracking-tight">אירועים</h2>
          <span className="text-sm text-muted">{events.length} אירועים</span>
        </div>

        {events.length === 0 ? (
          <div className="rounded-2xl border border-black/5 bg-card px-5 py-8 text-center text-sm text-muted dark:border-white/10">
            אין אירועים עדיין. הוסיפו אירוע ראשון למעלה.
          </div>
        ) : (
          <ul className="space-y-3">
            {events.map((ev) => (
              <EventCard
                key={ev.id}
                event={ev}
                stats={statsByEvent.get(ev.id)}
                onOpen={nav.openEvent}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
