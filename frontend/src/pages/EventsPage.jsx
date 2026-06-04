import { useEffect, useState } from "react";
import { createEvent, getEvents } from "../api/client.js";
import EventForm from "../components/EventForm.jsx";
import { eventTypeLabels } from "../utils/labels.js";

function EventCard({ event }) {
  return (
    <li className="flex items-center justify-between rounded-2xl border border-black/5 bg-card px-5 py-4 shadow-sm dark:border-white/10">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-ink">{event.title}</p>
          {event.is_mine && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              שלי
            </span>
          )}
        </div>
        <p className="text-sm text-muted">{event.event_date}</p>
      </div>
      <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600 dark:bg-white/10 dark:text-stone-300">
        {eventTypeLabels[event.type] ?? event.type}
      </span>
    </li>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    getEvents()
      .then((data) => {
        setEvents(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  async function handleCreate(payload) {
    await createEvent(payload);
    setEvents(await getEvents());
  }

  if (status === "loading") {
    return <p className="text-sm text-muted">טוען אירועים…</p>;
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
        לא הצלחנו לטעון את האירועים. ודאו שהשרת רץ.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <EventForm onCreate={handleCreate} />

      <section className="space-y-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold tracking-tight">אירועים</h2>
          <span className="text-sm text-muted">{events.length} אירועים</span>
        </div>

        {events.length === 0 ? (
          <div className="rounded-2xl border border-black/5 bg-card px-5 py-8 text-center text-sm text-muted dark:border-white/10">
            אין אירועים עדיין.
          </div>
        ) : (
          <ul className="space-y-3">
            {events.map((ev) => (
              <EventCard key={ev.id} event={ev} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
