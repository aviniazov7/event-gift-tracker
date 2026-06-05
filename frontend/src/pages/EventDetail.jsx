import { useEffect, useMemo, useState } from "react";
import {
  deleteTransaction,
  getEvents,
  getPersons,
  getTransactions,
  quickAdd,
} from "../api/client.js";
import BackButton from "../components/BackButton.jsx";
import QuickAddGift from "../components/QuickAddGift.jsx";
import DirectionBadge from "../components/DirectionBadge.jsx";
import DeleteButton from "../components/DeleteButton.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { eventTypeLabels } from "../utils/labels.js";
import { formatMoney } from "../utils/money.js";

const today = () => new Date().toISOString().slice(0, 10);

function GiftRow({ gift, personName, index, onOpenPerson, onDelete }) {
  const given = gift.direction === "given";
  return (
    <li
      className="animate-row flex items-center justify-between gap-3 rounded-2xl border border-black/5 bg-card px-5 py-4 shadow-soft dark:border-white/10"
      style={{ "--row-delay": `${Math.min(index, 8) * 40}ms` }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <DirectionBadge direction={gift.direction} />
        <button
          type="button"
          onClick={() => onOpenPerson(gift.person_id)}
          className="focus-ring cursor-pointer truncate rounded-md text-sm font-medium text-ink hover:underline"
        >
          {personName}
        </button>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <span
          className={`text-base font-semibold tabular-nums ${
            given
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-amber-600 dark:text-amber-400"
          }`}
        >
          {formatMoney(gift.amount)}
        </span>
        <DeleteButton label="מחיקת המתנה" onClick={() => onDelete(gift)} />
      </div>
    </li>
  );
}

export default function EventDetail({ eventId, nav }) {
  const [event, setEvent] = useState(null);
  const [persons, setPersons] = useState([]);
  const [gifts, setGifts] = useState([]);
  // Direction is held here so it stays sticky while adding several gifts in a
  // row; it's seeded from the event (my event → received) once it loads.
  const [direction, setDirection] = useState("given");
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [pendingGift, setPendingGift] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function loadGifts() {
    setGifts(await getTransactions({ event_id: eventId }));
  }

  useEffect(() => {
    Promise.all([
      getEvents(),
      getPersons(),
      getTransactions({ event_id: eventId }),
    ])
      .then(([evts, ppl, txns]) => {
        const current = evts.find((e) => e.id === eventId) ?? null;
        setEvent(current);
        setPersons(ppl);
        setGifts(txns);
        // For the user's own event, received gifts are the norm — default to it.
        setDirection(current?.is_mine ? "received" : "given");
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [eventId]);

  const personName = useMemo(() => {
    const map = new Map(persons.map((p) => [p.id, p.full_name]));
    return (id) => map.get(id) ?? `אדם #${id}`;
  }, [persons]);

  // Log a gift to this event in one call: /quick-add find-or-creates the person
  // (by id when picked, by name when typed) and records the transaction. A
  // newly created person is merged into the local list for the next entries.
  async function handleAdd({ person, amount }) {
    const res = await quickAdd({
      event: { id: eventId },
      person: person.id != null ? { id: person.id } : { name: person.name },
      direction,
      amount,
      date: today(),
    });
    setPersons((prev) =>
      prev.some((p) => p.id === res.person.id) ? prev : [...prev, res.person],
    );
    await loadGifts();
  }

  async function confirmDeleteGift() {
    setDeleting(true);
    try {
      await deleteTransaction(pendingGift.id);
      await loadGifts();
      setPendingGift(null);
    } finally {
      setDeleting(false);
    }
  }

  if (status === "loading") {
    return <p className="text-sm text-muted">טוען…</p>;
  }

  if (status === "error" || !event) {
    return (
      <div>
        <BackButton onClick={nav.back} />
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          לא הצלחנו לטעון את האירוע.
        </div>
      </div>
    );
  }

  return (
    <div className="animate-page">
      <BackButton onClick={nav.back} />

      <div className="space-y-8">
        <header className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-2xl font-semibold tracking-tight">
              {event.title}
            </h2>
            <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600 dark:bg-white/10 dark:text-stone-300">
              {eventTypeLabels[event.type] ?? event.type}
            </span>
          </div>
          <p className="text-sm text-muted">{event.event_date}</p>
        </header>

        <QuickAddGift
          persons={persons}
          direction={direction}
          onDirectionChange={setDirection}
          onAdd={handleAdd}
        />

        <section className="space-y-5">
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg font-semibold tracking-tight">מתנות</h3>
            <span className="text-sm text-muted">{gifts.length} מתנות</span>
          </div>

          {gifts.length === 0 ? (
            <div className="rounded-2xl border border-black/5 bg-card px-5 py-8 text-center text-sm text-muted dark:border-white/10">
              אין מתנות לאירוע זה עדיין.
            </div>
          ) : (
            <ul className="space-y-3">
              {gifts.map((gift, i) => (
                <GiftRow
                  key={gift.id}
                  gift={gift}
                  personName={personName(gift.person_id)}
                  index={i}
                  onOpenPerson={nav.openPerson}
                  onDelete={setPendingGift}
                />
              ))}
            </ul>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(pendingGift)}
        title="למחוק את המתנה?"
        message="המתנה תוסר לצמיתות."
        confirmLabel="מחק מתנה"
        busy={deleting}
        onConfirm={confirmDeleteGift}
        onCancel={() => setPendingGift(null)}
      />
    </div>
  );
}
