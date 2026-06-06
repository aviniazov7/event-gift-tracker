import { useEffect, useMemo, useState } from "react";
import {
  deletePerson,
  deleteTransaction,
  getEvents,
  getPersons,
  getReciprocity,
  getTransactions,
} from "../api/client.js";
import { Gift } from "lucide-react";
import BackButton from "../components/BackButton.jsx";
import DirectionBadge from "../components/DirectionBadge.jsx";
import DeleteButton from "../components/DeleteButton.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Skeleton from "../components/Skeleton.jsx";
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
  const [pendingGift, setPendingGift] = useState(null);
  const [askDeletePerson, setAskDeletePerson] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function reload() {
    const [recip, txns] = await Promise.all([
      getReciprocity(personId),
      getTransactions({ person_id: personId }),
    ]);
    setReciprocity(recip);
    setGifts(txns);
  }

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

  async function confirmDeleteGift() {
    setDeleting(true);
    try {
      await deleteTransaction(pendingGift.id);
      await reload();
      setPendingGift(null);
    } finally {
      setDeleting(false);
    }
  }

  // Deleting the person cascades to their gifts; return to the previous screen.
  async function confirmDeletePerson() {
    setDeleting(true);
    try {
      await deletePerson(personId);
      setAskDeletePerson(false);
      nav.back();
    } finally {
      setDeleting(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="animate-page space-y-4">
        <Skeleton className="h-7 w-40" />
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    );
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
    <div className="animate-page">
      <BackButton onClick={nav.back} />

      <div className="space-y-8">
        <header className="flex items-center justify-between gap-3">
          <h2 className="min-w-0 truncate text-2xl font-semibold tracking-tight">
            {person.full_name}
          </h2>
          <DeleteButton
            label="מחיקת האדם"
            onClick={() => setAskDeletePerson(true)}
          />
        </header>

        <ReciprocitySummary reciprocity={reciprocity} />

        <section className="space-y-5">
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg font-semibold tracking-tight">מתנות</h3>
            <span className="text-sm text-muted">{gifts.length} מתנות</span>
          </div>

          {gifts.length === 0 ? (
            <EmptyState
              icon={Gift}
              title="אין מתנות לאדם זה עדיין"
              description="מתנות שתתעדו עבורו יופיעו כאן."
            />
          ) : (
            <ul className="space-y-3">
              {gifts.map((gift, i) => {
                const given = gift.direction === "given";
                return (
                  <li
                    key={gift.id}
                    className="animate-row flex items-center justify-between gap-3 rounded-2xl border border-black/5 bg-card px-5 py-4 shadow-soft dark:border-white/10"
                    style={{ "--row-delay": `${Math.min(i, 8) * 40}ms` }}
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
                      <DeleteButton
                        label="מחיקת המתנה"
                        onClick={() => setPendingGift(gift)}
                      />
                    </div>
                  </li>
                );
              })}
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

      <ConfirmDialog
        open={askDeletePerson}
        title={`למחוק את ${person.full_name}?`}
        message="כל המתנות שלו יימחקו. הפעולה אינה הפיכה."
        confirmLabel="מחק אדם"
        busy={deleting}
        onConfirm={confirmDeletePerson}
        onCancel={() => setAskDeletePerson(false)}
      />
    </div>
  );
}
