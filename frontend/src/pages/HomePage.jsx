import { useEffect, useMemo, useState } from "react";
import {
  deleteEvent,
  getEvents,
  getPersons,
  getSummary,
  getTransactions,
  quickAdd,
} from "../api/client.js";
import { CalendarPlus } from "lucide-react";
import SummaryCards from "../components/SummaryCards.jsx";
import QuickAddForm from "../components/QuickAddForm.jsx";
import EventCard from "../components/EventCard.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Skeleton from "../components/Skeleton.jsx";

// Branded loading placeholder mirroring the balance cards + event list.
function HomeSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="rounded-2xl border border-black/5 bg-card px-5 py-5 shadow-soft dark:border-white/10">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-2 h-9 w-44" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-black/5 bg-card px-5 py-4 shadow-soft dark:border-white/10"
            >
              <Skeleton className="h-3 w-14" />
              <Skeleton className="mt-2 h-7 w-24" />
            </div>
          ))}
        </div>
      </div>
      <ul className="space-y-3">
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            className="flex items-center justify-between rounded-2xl border border-black/5 bg-card px-5 py-4 shadow-soft dark:border-white/10"
          >
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-20" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function HomePage({ nav }) {
  const [events, setEvents] = useState([]);
  const [persons, setPersons] = useState([]);
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [pendingEvent, setPendingEvent] = useState(null); // event awaiting delete confirm
  const [deleting, setDeleting] = useState(false);

  async function load() {
    // The first load right after sign-in can still race the backend's cold
    // start, so these initial fetches retry through a wakeup too.
    const [evts, ppl, sum, txns] = await Promise.all([
      getEvents({ retry: true }),
      getPersons({ retry: true }),
      getSummary({ retry: true }),
      getTransactions({}, { retry: true }),
    ]);
    setEvents(evts);
    setPersons(ppl);
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

  // One submit logs the gift (find-or-create event + person) and refreshes the
  // summary, events and per-event totals so the new data shows immediately.
  async function handleQuickAdd(payload) {
    await quickAdd(payload);
    await load();
  }

  // Delete the event (cascades to its gifts server-side), then refresh.
  async function confirmDeleteEvent() {
    setDeleting(true);
    try {
      await deleteEvent(pendingEvent.id);
      await load();
      setPendingEvent(null);
    } finally {
      setDeleting(false);
    }
  }

  if (status === "loading") {
    return <HomeSkeleton />;
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
        לא הצלחנו להתחבר לשרת. ודאו שהשרת רץ.
      </div>
    );
  }

  return (
    <div className="animate-page space-y-8">
      <SummaryCards summary={summary} />

      <QuickAddForm
        events={events}
        persons={persons}
        onSubmit={handleQuickAdd}
      />

      <section className="space-y-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold tracking-tight">אירועים</h2>
          <span className="text-sm text-muted">{events.length} אירועים</span>
        </div>

        {events.length === 0 ? (
          <EmptyState
            icon={CalendarPlus}
            title="עדיין אין אירועים"
            description="הוסיפו את המתנה הראשונה שלכם דרך הטופס למעלה."
            action={
              <button
                type="button"
                onClick={() => {
                  const reduce = window.matchMedia(
                    "(prefers-reduced-motion: reduce)",
                  ).matches;
                  document.getElementById("root")?.scrollTo({
                    top: 0,
                    behavior: reduce ? "auto" : "smooth",
                  });
                }}
                className="focus-ring inline-flex cursor-pointer items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-emerald-700 active:scale-[0.98] dark:bg-emerald-500 dark:hover:bg-emerald-400"
              >
                הוספת מתנה ראשונה
              </button>
            }
          />
        ) : (
          <ul className="space-y-3">
            {events.map((ev, i) => (
              <EventCard
                key={ev.id}
                event={ev}
                stats={statsByEvent.get(ev.id)}
                index={i}
                onOpen={nav.openEvent}
                onDelete={setPendingEvent}
              />
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(pendingEvent)}
        title={pendingEvent ? `למחוק את "${pendingEvent.title}"?` : ""}
        message="כל המתנות באירוע יימחקו. הפעולה אינה הפיכה."
        confirmLabel="מחק אירוע"
        busy={deleting}
        onConfirm={confirmDeleteEvent}
        onCancel={() => setPendingEvent(null)}
      />
    </div>
  );
}
